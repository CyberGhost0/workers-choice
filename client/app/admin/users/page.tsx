'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { api } from '@/lib/api';
import {
  Search,
  MoreVertical,
  CheckCircle,
  Ban,
  Mail,
  Phone,
  Loader2,
  RefreshCw,
  X,
  AlertTriangle,
  ShieldOff,
  UserX,
  Trash2,
  Undo2,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'ARTISAN' | 'SELLER' | 'ADMIN';
  status: 'active' | 'pending';
  accountStatus: string;
  joinDate: string;
  verified: boolean;
  businessName?: string;
  suspensionReason?: string;
  banReason?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterAccountStatus, setFilterAccountStatus] = useState('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null);
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [modReason, setModReason] = useState('');
  const [suspendDays, setSuspendDays] = useState('7');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users', { params: { limit: 200 } });
      const mapped: User[] = res.data.users.map((u: any) => ({
        id: u.id,
        name: u.profile?.fullName || u.businessProfile?.businessName || u.email.split('@')[0],
        email: u.email,
        phone: u.profile?.phone,
        role: u.role,
        status: u.emailVerified ? 'active' : 'pending',
        accountStatus: u.accountStatus || 'ACTIVE',
        joinDate: u.createdAt,
        verified: u.emailVerified,
        businessName: u.businessProfile?.businessName,
        suspensionReason: u.suspensionReason,
        banReason: u.banReason,
      }));
      setUsers(mapped);
    } catch (e: any) {
      setError('Could not load users. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const updateStatus = async (id: string, emailVerified: boolean) => {
    setBusyId(id);
    try {
      await api.put(`/admin/users/${id}/status`, { emailVerified });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, verified: emailVerified, status: emailVerified ? 'active' : 'pending' } : u))
      );
    } catch {
      setError('Action failed. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const updateRole = async (id: string, role: User['role']) => {
    setBusyId(id);
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch {
      setError('Role change failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    setBusyId(suspendTarget.id);
    try {
      await api.put(`/admin/users/${suspendTarget.id}/suspend`, {
        reason: modReason,
        durationDays: parseInt(suspendDays) || 7,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === suspendTarget.id
            ? { ...u, accountStatus: 'SUSPENDED', suspensionReason: modReason }
            : u
        )
      );
      setShowSuspendModal(false);
      setSuspendTarget(null);
      setModReason('');
      setSelectedUser(null);
    } catch {
      setError('Suspend action failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleUnsuspend = async (user: User) => {
    setBusyId(user.id);
    try {
      await api.put(`/admin/users/${user.id}/unsuspend`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, accountStatus: 'ACTIVE', suspensionReason: undefined }
            : u
        )
      );
      setSelectedUser(null);
    } catch {
      setError('Unsuspend action failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleBan = async () => {
    if (!banTarget) return;
    setBusyId(banTarget.id);
    try {
      await api.put(`/admin/users/${banTarget.id}/ban`, { reason: modReason });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === banTarget.id
            ? { ...u, accountStatus: 'BANNED', banReason: modReason }
            : u
        )
      );
      setShowBanModal(false);
      setBanTarget(null);
      setModReason('');
      setSelectedUser(null);
    } catch {
      setError('Ban action failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeactivate = async (user: User) => {
    setBusyId(user.id);
    try {
      await api.put(`/admin/users/${user.id}/deactivate`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, accountStatus: 'DEACTIVATED' } : u
        )
      );
      setSelectedUser(null);
    } catch {
      setError('Deactivate action failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${user.name}? This cannot be undone.`)) return;
    setBusyId(user.id);
    try {
      await api.delete(`/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setSelectedUser(null);
    } catch {
      setError('Delete action failed.');
    } finally {
      setBusyId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterAccountStatus === 'all' || user.accountStatus === filterAccountStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-500/15 text-purple-300';
      case 'ARTISAN': return 'bg-blue-500/15 text-blue-300';
      case 'SELLER': return 'bg-green-500/15 text-green-300';
      case 'CUSTOMER': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/15 text-green-300';
      case 'pending': return 'bg-yellow-500/15 text-yellow-300';
      default: return 'bg-gray-500/15 text-gray-300';
    }
  };

  const getAccountStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/15 text-green-300';
      case 'SUSPENDED': return 'bg-orange-500/15 text-orange-300';
      case 'BANNED': return 'bg-red-500/15 text-red-300';
      case 'DEACTIVATED': return 'bg-gray-500/15 text-gray-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Live users, artisans, and sellers on the platform
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-muted-foreground">Artisans</p>
          <p className="text-2xl font-bold">{users.filter((u) => u.role === 'ARTISAN').length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-muted-foreground">Pending Verification</p>
          <p className="text-2xl font-bold text-yellow-400">
            {users.filter((u) => u.status === 'pending').length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-muted-foreground">Suspended</p>
          <p className="text-2xl font-bold text-orange-400">
            {users.filter((u) => u.accountStatus === 'SUSPENDED').length}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Roles</option>
          <option value="CUSTOMER">Customers</option>
          <option value="ARTISAN">Artisans</option>
          <option value="SELLER">Sellers</option>
          <option value="ADMIN">Admins</option>
        </select>
        <select
          value={filterAccountStatus}
          onChange={(e) => setFilterAccountStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BANNED">Banned</option>
          <option value="DEACTIVATED">Deactivated</option>
        </select>
      </div>

      <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Account</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-medium text-primary">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        disabled={busyId === user.id}
                        onChange={(e) => updateRole(user.id, e.target.value as User['role'])}
                        className={`px-2 py-1 rounded-full text-xs font-medium bg-transparent ${getRoleBadgeColor(user.role)} border border-current/20`}
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="ARTISAN">ARTISAN</option>
                        <option value="SELLER">SELLER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountStatusBadgeColor(user.accountStatus)}`}>
                        {user.accountStatus}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === 'pending' ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === user.id}
                                onClick={() => updateStatus(user.id, true)}
                                className="bg-green-500/10 border-green-500/30 text-green-400"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Verify user</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === user.id}
                                onClick={() => updateStatus(user.id, false)}
                                className="bg-red-500/10 border-red-500/30 text-red-400"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Revoke verification</TooltipContent>
                          </Tooltip>
                        )}
                        {user.accountStatus === 'SUSPENDED' ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === user.id}
                                onClick={() => handleUnsuspend(user)}
                                className="bg-green-500/10 border-green-500/30 text-green-400"
                              >
                                <Undo2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Unsuspend user</TooltipContent>
                          </Tooltip>
                        ) : (
                          user.accountStatus === 'ACTIVE' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={busyId === user.id}
                                  onClick={() => { setSuspendTarget(user); setShowSuspendModal(true); }}
                                  className="bg-orange-500/10 border-orange-500/30 text-orange-400"
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Suspend user</TooltipContent>
                            </Tooltip>
                          )
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedUser(user)}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View user details</TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">User Details</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close</TooltipContent>
              </Tooltip>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  {selectedUser.businessName && (
                    <p className="text-sm text-secondary">{selectedUser.businessName}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="font-medium">{selectedUser.role}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedUser.status}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Account</p>
                  <p className={`font-medium ${selectedUser.accountStatus !== 'ACTIVE' ? 'text-orange-400' : 'text-green-400'}`}>
                    {selectedUser.accountStatus}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-medium">{new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedUser.suspensionReason && (
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Suspension Reason</p>
                  <p className="font-medium text-orange-300">{selectedUser.suspensionReason}</p>
                </div>
              )}
              {selectedUser.banReason && (
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Ban Reason</p>
                  <p className="font-medium text-red-300">{selectedUser.banReason}</p>
                </div>
              )}
              {selectedUser.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {selectedUser.phone}
                </div>
              )}
            </div>
            <div className="p-6 border-t flex flex-wrap gap-3 justify-end">
              {selectedUser.accountStatus === 'ACTIVE' && (
                <>
                  <Button
                    variant="outline"
                    className="border-orange-500/30 text-orange-400"
                    onClick={() => { setSuspendTarget(selectedUser); setShowSuspendModal(true); }}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Suspend
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-400"
                    onClick={() => { setBanTarget(selectedUser); setShowBanModal(true); }}
                  >
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Ban
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeactivate(selectedUser)}
                    disabled={busyId === selectedUser.id}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate
                  </Button>
                </>
              )}
              {selectedUser.accountStatus === 'SUSPENDED' && (
                <Button
                  variant="outline"
                  className="border-green-500/30 text-green-400"
                  onClick={() => handleUnsuspend(selectedUser)}
                  disabled={busyId === selectedUser.id}
                >
                  <Undo2 className="mr-2 h-4 w-4" />
                  Unsuspend
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedUser)}
                disabled={busyId === selectedUser.id}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
              <a href={`mailto:${selectedUser.email}`}>
                <Button>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && suspendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Suspend User</h2>
              <Button variant="ghost" size="icon" onClick={() => { setShowSuspendModal(false); setSuspendTarget(null); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <p>Suspending <strong>{suspendTarget.name}</strong></p>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  value={modReason}
                  onChange={(e) => setModReason(e.target.value)}
                  placeholder="Enter reason for suspension..."
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (days)</label>
                <input
                  type="number"
                  value={suspendDays}
                  onChange={(e) => setSuspendDays(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setShowSuspendModal(false); setSuspendTarget(null); }}>
                Cancel
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleSuspend}
                disabled={busyId === suspendTarget.id}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Suspend
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && banTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-red-400">Ban User</h2>
              <Button variant="ghost" size="icon" onClick={() => { setShowBanModal(false); setBanTarget(null); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-destructive">
                You are about to permanently ban <strong>{banTarget.name}</strong>. This action cannot be undone.
              </p>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  value={modReason}
                  onChange={(e) => setModReason(e.target.value)}
                  placeholder="Enter reason for ban..."
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setShowBanModal(false); setBanTarget(null); }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBan}
                disabled={busyId === banTarget.id}
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                Permanently Ban
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
