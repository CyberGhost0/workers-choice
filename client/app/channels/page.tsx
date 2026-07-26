'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRBAC } from '@/lib/hooks/useRBAC';
import { api } from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';
import {
  Users,
  MessageSquare,
  Plus,
  Search,
  Hash,
  Lock,
  Globe,
  TrendingUp,
  Clock,
  X,
  Shield,
  UserMinus,
  AlertTriangle,
  Flag,
  Loader2,
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  createdBy: string;
  status: string;
  _count: {
    members: number;
    requests: number;
  };
}

interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: string;
  status: string;
  suspendedAt?: string;
  suspensionReason?: string;
  user: {
    id: string;
    profile?: { fullName: string; avatarUrl?: string };
  };
}

const categories = [
  { id: 'all', name: 'All Channels', icon: Hash },
  { id: 'my', name: 'My Channels', icon: Users },
  { id: 'trending', name: 'Trending', icon: TrendingUp },
  { id: 'new', name: 'New', icon: Clock },
];

export default function ChannelsPage() {
  const { user } = useAuth();
  const { isAdmin } = useRBAC();
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<GroupMember | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/groups');
      setGroups(res.data.groups || []);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (groupId: string) => {
    try {
      const res = await api.get(`/groups/${groupId}/members`);
      setMembers(res.data.members || []);
    } catch {
      setMembers([]);
    }
  };

  const handleJoin = async (groupId: string) => {
    try {
      await api.post(`/groups/${groupId}/join`);
      setActionMsg('Join request submitted!');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e: any) {
      setActionMsg(e?.response?.data?.error || 'Failed to join');
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const handleLeave = async (groupId: string) => {
    setActionMsg('');
    try {
      await api.put(`/groups/${groupId}/members/${user?.id}/remove`);
      fetchGroups();
      if (selectedGroup?.id === groupId) setSelectedGroup(null);
    } catch (e: any) {
      setActionMsg(e?.response?.data?.error || 'Failed to leave');
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const handleSuspendMember = async (member: GroupMember) => {
    if (!selectedGroup) return;
    try {
      await api.put(`/groups/${selectedGroup.id}/members/${member.userId}/suspend`, {
        reason: 'Violation of group rules',
      });
      fetchMembers(selectedGroup.id);
    } catch (e: any) {
      setActionMsg(e?.response?.data?.error || 'Failed to suspend');
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const handleUnsuspendMember = async (member: GroupMember) => {
    if (!selectedGroup) return;
    try {
      await api.put(`/groups/${selectedGroup.id}/members/${member.userId}/unsuspend`);
      fetchMembers(selectedGroup.id);
    } catch (e: any) {
      setActionMsg(e?.response?.data?.error || 'Failed to unsuspend');
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const handleRemoveMember = async (member: GroupMember) => {
    if (!selectedGroup || !confirm(`Remove ${member.user.profile?.fullName} from this group?`)) return;
    try {
      await api.put(`/groups/${selectedGroup.id}/members/${member.userId}/remove`);
      fetchMembers(selectedGroup.id);
    } catch (e: any) {
      setActionMsg(e?.response?.data?.error || 'Failed to remove');
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const handleReport = async () => {
    if (!selectedGroup || !reportTarget || !reportReason) return;
    try {
      await api.post(`/groups/${selectedGroup.id}/members/${reportTarget.userId}/report`, {
        reason: reportReason,
        description: reportDescription,
      });
      setShowReportModal(false);
      setReportTarget(null);
      setReportReason('');
      setReportDescription('');
      setActionMsg('Member reported. Group admins will review.');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e: any) {
      setActionMsg(e?.response?.data?.error || 'Failed to report');
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const isGroupAdmin = (groupId: string) => {
    const member = members.find((m) => m.userId === user?.id);
    return member?.role === 'admin' || isAdmin;
  };

  const userMembership = (groupId: string) => {
    return members.find((m) => m.userId === user?.id);
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());

    const isMember = members.some((m) => m.userId === user?.id && m.groupId === group.id);

    if (activeCategory === 'my') return matchesSearch && isMember;
    if (activeCategory === 'trending') return matchesSearch && group._count.members > 10;
    if (activeCategory === 'new') return matchesSearch && !isMember;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-card rounded-xl shadow-sm border p-4 sticky top-24">
              <h2 className="font-semibold mb-4">Channels</h2>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                      activeCategory === category.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <category.icon className="h-4 w-4" />
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Channels & Forums</h1>
              <p className="text-muted-foreground">
                Join channels to connect with like-minded professionals
              </p>
            </div>

            {actionMsg && (
              <div className="mb-4 p-3 bg-primary/10 rounded-lg text-sm">
                {actionMsg}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading channels...
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGroups.map((group) => {
                  const isMember = members.some((m) => m.userId === user?.id && m.groupId === group.id);
                  return (
                    <div
                      key={group.id}
                      className="bg-card rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedGroup(group);
                        fetchMembers(group.id);
                        setShowMembers(false);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Hash className="h-6 w-6 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{group.name}</h3>
                            {isMember && (
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                Joined
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {group.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {group._count.members} members
                            </span>
                            <span className="flex items-center gap-1">
                              <span>{group.category}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {isMember ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLeave(group.id);
                              }}
                            >
                              Leave
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoin(group.id);
                              }}
                            >
                              Join
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredGroups.length === 0 && (
                  <div className="text-center py-12">
                    <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No channels found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Group Detail Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Hash className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedGroup._count.members} members
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setSelectedGroup(null); setShowMembers(false); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              <p className="text-muted-foreground mb-4">{selectedGroup.description}</p>
              <p className="text-xs text-muted-foreground mb-4">Category: {selectedGroup.category}</p>

              <div className="flex gap-3 mb-4">
                {userMembership(selectedGroup.id) ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowMembers(!showMembers)}
                      className="flex-1"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Members ({members.length})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleLeave(selectedGroup.id)}
                    >
                      Leave
                    </Button>
                  </>
                ) : (
                  <Button className="w-full" onClick={() => handleJoin(selectedGroup.id)}>
                    Join Channel
                  </Button>
                )}
              </div>

              {/* Members List */}
              {showMembers && (
                <div className="border rounded-lg">
                  <div className="p-3 border-b bg-muted/50 font-medium text-sm">
                    Group Members
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {members.map((member) => (
                      <div key={member.id} className="p-3 border-b last:border-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {getInitials(member.user.profile?.fullName || 'U')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {member.user.profile?.fullName || 'User'}
                              {member.role === 'admin' && (
                                <span className="ml-2 text-xs text-purple-400">(Admin)</span>
                              )}
                            </p>
                            {member.status === 'suspended' && (
                              <p className="text-xs text-orange-400">Suspended</p>
                            )}
                          </div>
                        </div>
                        {(isGroupAdmin(selectedGroup.id) && member.userId !== user?.id) && (
                          <div className="flex items-center gap-1">
                            {member.status === 'suspended' ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleUnsuspendMember(member)}
                                  >
                                    <Shield className="h-3.5 w-3.5 text-green-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Unsuspend member</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleSuspendMember(member)}
                                  >
                                    <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Suspend member</TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleRemoveMember(member)}
                                >
                                  <UserMinus className="h-3.5 w-3.5 text-red-400" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Remove member</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => { setReportTarget(member); setShowReportModal(true); }}
                                >
                                  <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Report member</TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    ))}
                    {members.length === 0 && (
                      <p className="p-4 text-sm text-muted-foreground text-center">No members found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Report Member</h2>
              <Button variant="ghost" size="icon" onClick={() => { setShowReportModal(false); setReportTarget(null); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <p>Reporting <strong>{reportTarget.user.profile?.fullName || 'User'}</strong></p>
              <div>
                <label className="block text-sm font-medium mb-1">Reason *</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a reason...</option>
                  <option value="harassment">Harassment</option>
                  <option value="scam">Scam / Fraud</option>
                  <option value="cheating">Cheating</option>
                  <option value="spam">Spam</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide details about the issue..."
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setShowReportModal(false); setReportTarget(null); }}>
                Cancel
              </Button>
              <Button onClick={handleReport} disabled={!reportReason}>
                <Flag className="mr-2 h-4 w-4" />
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
