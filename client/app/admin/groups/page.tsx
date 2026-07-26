'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { api } from '@/lib/api';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface SkillGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  pendingRequests: number;
  createdBy: string;
  createdAt: string;
  status: string;
}

interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  groupId: string;
  groupName: string;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  reviewedAt?: string;
}

const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Carpentry',
  'Gardening',
  'Painting',
  'Moving',
  'Other',
];

export default function GroupsPage() {
  const [groups, setGroups] = useState<SkillGroup[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'groups' | 'requests'>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SkillGroup | null>(null);
  const [requestFilter, setRequestFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');

  const [newGroup, setNewGroup] = useState({ name: '', description: '', category: '' });

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [gRes, rRes] = await Promise.all([
        api.get('/groups'),
        api.get('/groups/requests/all'),
      ]);
      setGroups(
        (gRes.data.groups || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          description: g.description || '',
          category: g.category,
          memberCount: g.memberCount || 0,
          pendingRequests: g.pendingRequests || 0,
          createdBy: g.createdBy,
          createdAt: g.createdAt,
          status: g.status || 'active',
        }))
      );
      setJoinRequests(
        (rRes.data.requests || []).map((r: any) => ({
          id: r.id,
          userId: r.userId,
          userName: r.user?.profile?.fullName || r.user?.email || 'Unknown',
          groupId: r.groupId,
          groupName: r.group?.name || '',
          message: r.message || '',
          status: r.status,
          requestedAt: r.createdAt,
          reviewedAt: r.reviewedAt,
        }))
      );
    } catch (e: any) {
      setError('Could not load groups. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || group.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const visibleRequests = joinRequests.filter(
    (r) => requestFilter === 'all' || r.status === requestFilter
  );
  const pendingCount = joinRequests.filter((r) => r.status === 'PENDING').length;

  const handleCreateGroup = async () => {
    setBusy('create');
    try {
      await api.post('/groups', newGroup);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', category: '' });
      await loadAll();
    } catch {
      setError('Failed to create group.');
    } finally {
      setBusy(null);
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup) return;
    setBusy(selectedGroup.id);
    try {
      await api.put(`/group/${selectedGroup.id}`, newGroup);
      setShowEditModal(false);
      setSelectedGroup(null);
      setNewGroup({ name: '', description: '', category: '' });
      await loadAll();
    } catch {
      setError('Failed to update group.');
    } finally {
      setBusy(null);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    setBusy(groupId);
    try {
      await api.delete(`/group/${groupId}`);
      await loadAll();
    } catch {
      setError('Failed to delete group.');
    } finally {
      setBusy(null);
    }
  };

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    setBusy(requestId);
    try {
      await api.put(`/groups/requests/${requestId}`, { action });
      await loadAll();
    } catch {
      setError('Action failed. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Groups & Skills Management</h1>
          <p className="text-muted-foreground">Manage skill groups and join requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Group
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('groups')}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'groups'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Skill Groups ({groups.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 relative ${
            activeTab === 'requests'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Join Requests
          {pendingCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : (
        <>
          {activeTab === 'groups' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-card rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={busy === group.id}
                              onClick={() => {
                                setSelectedGroup(group);
                                setNewGroup({
                                  name: group.name,
                                  description: group.description,
                                  category: group.category,
                                });
                                setShowEditModal(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit group</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={busy === group.id}
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete group</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg mb-1">{group.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {group.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {group.memberCount} members
                      </span>
                      {group.pendingRequests > 0 && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Clock className="h-4 w-4" />
                          {group.pendingRequests} pending
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{group.category}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          group.status === 'active'
                            ? 'bg-green-500/15 text-green-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {group.status}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredGroups.length === 0 && (
                  <p className="text-muted-foreground col-span-full">No groups found.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
                  <Button
                    key={f}
                    variant="outline"
                    size="sm"
                    onClick={() => setRequestFilter(f)}
                    className={
                      requestFilter === f
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : ''
                    }
                  >
                    {f.charAt(0) + f.slice(1).toLowerCase()}
                    {' '}
                    ({joinRequests.filter((r) => f === 'all' || r.status === f).length})
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                {visibleRequests.map((request) => (
                  <div key={request.id} className="bg-card rounded-xl shadow-sm border p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-primary">
                          {request.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{request.userName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Requesting to join: {request.groupName}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'PENDING'
                                ? 'bg-yellow-500/15 text-yellow-300'
                                : request.status === 'APPROVED'
                                ? 'bg-green-500/15 text-green-300'
                                : 'bg-red-500/15 text-red-300'
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                        <p className="text-sm mt-2 p-3 bg-muted/50 rounded-lg">
                          &quot;{request.message}&quot;
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            Requested: {new Date(request.requestedAt).toLocaleDateString()}
                          </span>
                          {request.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy === request.id}
                                onClick={() => handleRequest(request.id, 'approve')}
                                className="bg-green-500/10 border-green-500/30 text-green-400"
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy === request.id}
                                onClick={() => handleRequest(request.id, 'reject')}
                                className="bg-red-500/10 border-red-500/30 text-red-400"
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {request.reviewedAt && (
                            <span className="text-xs text-muted-foreground">
                              Reviewed: {new Date(request.reviewedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {visibleRequests.length === 0 && (
                  <p className="text-muted-foreground">No requests in this filter.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Create New Group</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., Master Plumbers"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                  placeholder="Describe the group's purpose and requirements..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newGroup.category}
                  onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup} disabled={!newGroup.name || !newGroup.category || busy === 'create'}>
                Create Group
              </Button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Edit Group</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newGroup.category}
                  onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedGroup(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditGroup} disabled={busy === selectedGroup.id}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
