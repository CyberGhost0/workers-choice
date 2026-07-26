'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatDate, getInitials, formatCurrency, mediaUrl } from '@/lib/utils';
import { api } from '@/lib/api';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewSummary } from '@/components/reviews/ReviewSummary';
import {
  Camera,
  Edit2,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Star,
  ExternalLink,
  Mail,
  Phone,
  Image as ImageIcon,
  X,
  Shield,
  ShieldOff,
  Smartphone,
  Loader2,
} from 'lucide-react';

import { COUNTRIES, hasStates, getStates } from '@/lib/locations';

const PROFILE_COOLDOWN_DAYS = 180;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<'avatar' | 'background' | null>(null);
  const [editData, setEditData] = useState({
    fullName: user?.profile?.fullName || '',
    phone: user?.profile?.phone || '',
    bio: user?.profile?.bio || '',
    address: user?.profile?.address || '',
    city: user?.profile?.city || '',
    state: user?.profile?.state || '',
    country: user?.profile?.country || '',
  });
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorSetupData, setTwoFactorSetupData] = useState<{ secret: string; qrCode: string; label: string } | null>(null);
  const [twoFactorVerifyCode, setTwoFactorVerifyCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorDisablePassword, setTwoFactorDisablePassword] = useState('');
  const [show2FADisable, setShow2FADisable] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/user/${user?.id}`);
        setReviews(res.data.reviews);
      } catch {}
    };
    if (user?.id) {
      fetchReviews();
    }
  }, [user?.id]);

  // Fetch 2FA status on mount
  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const res = await api.get('/auth/2fa/status');
        setTwoFactorEnabled(res.data.enabled);
      } catch {}
    };
    fetch2FAStatus();
  }, []);

  // Handle 2FA setup - generate secret and QR code
  const handle2FASetup = async () => {
    setTwoFactorLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/2fa/setup');
      setTwoFactorSetupData(res.data);
      setShow2FASetup(true);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to setup 2FA.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Handle 2FA verification and enable
  const handle2FAVerify = async () => {
    if (!twoFactorVerifyCode) return;
    setTwoFactorLoading(true);
    setError('');
    try {
      await api.post('/auth/2fa/verify', { token: twoFactorVerifyCode });
      setTwoFactorEnabled(true);
      setShow2FASetup(false);
      setTwoFactorSetupData(null);
      setTwoFactorVerifyCode('');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Invalid code. Please try again.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Handle 2FA disable
  const handle2FADisable = async () => {
    if (!twoFactorDisablePassword) return;
    setTwoFactorLoading(true);
    setError('');
    try {
      await api.post('/auth/2fa/disable', { password: twoFactorDisablePassword });
      setTwoFactorEnabled(false);
      setShow2FADisable(false);
      setTwoFactorDisablePassword('');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to disable 2FA.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Reset edit form when user data loads / changes
  useEffect(() => {
    setEditData({
      fullName: user?.profile?.fullName || '',
      phone: user?.profile?.phone || '',
      bio: user?.profile?.bio || '',
      address: user?.profile?.address || '',
      city: user?.profile?.city || '',
      state: user?.profile?.state || '',
      country: user?.profile?.country || '',
    });
  }, [user?.profile?.fullName]);

  const nextUpdateDate = (() => {
    const last = user?.profile?.lastProfileUpdate;
    if (!last) return null;
    const d = new Date(last);
    d.setDate(d.getDate() + PROFILE_COOLDOWN_DAYS);
    return d;
  })();

  const isLocked = user?.role === 'ADMIN' ? false : (!!nextUpdateDate && new Date() < nextUpdateDate);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Please log in to view your profile.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await api.put('/users', {
        fullName: editData.fullName,
        phone: editData.phone,
        address: editData.address,
        city: editData.city,
        state: editData.state,
        country: editData.country,
        bio: editData.bio,
      });
      updateUser({
        ...user!,
        profile: { ...user!.profile, ...res.data.profile },
      });
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(
        e?.response?.data?.error ||
          'Could not update profile. You may only update once every 180 days.'
      );
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (
    file: File,
    endpoint: '/users/avatar' | '/users/background',
    kind: 'avatar' | 'background'
  ) => {
    setUploading(kind);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.profile?.avatarUrl || res.data?.profile?.backgroundUrl;
      if (url) {
        const updatedProfile = { ...user!.profile } as any;
        if (kind === 'avatar') {
          updatedProfile.avatarUrl = url;
        } else {
          updatedProfile.backgroundUrl = url;
        }
        updateUser({ ...user!, profile: updatedProfile } as any);
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, '/users/avatar', 'avatar');
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, '/users/background', 'background');
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />

      <main className="flex-1">
        {/* Profile Header */}
        <div className="relative">
          {/* Background Image */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-primary to-primary/70 relative">
                {user.profile?.backgroundUrl && (
                  <img
                    src={mediaUrl(user.profile.backgroundUrl)}
                    alt="Profile background"
                    className="w-full h-full object-cover"
                  />
                )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => backgroundInputRef.current?.click()}
                  className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Change background image</TooltipContent>
            </Tooltip>
            <input
              type="file"
              ref={backgroundInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleBackgroundUpload}
            />
          </div>

          {/* Profile Info */}
          <div className="container mx-auto px-4 -mt-16 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-card bg-card flex items-center justify-center overflow-hidden">
                  {user.profile?.avatarUrl ? (
                    <img
                      src={mediaUrl(user.profile.avatarUrl)}
                      alt={user.profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-primary">
                      {getInitials(user.profile?.fullName || 'U')}
                    </span>
                  )}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Change profile photo</TooltipContent>
                </Tooltip>
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left pb-2">
                <h1 className="text-2xl font-bold">{user.profile?.fullName}</h1>
                {user.businessProfile && (
                  <p className="text-muted-foreground">
                    {user.businessProfile.businessName}
                  </p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-muted-foreground">
                  {user.profile?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.profile.city}, {user.profile.state}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {user.createdAt ? formatDate(user.createdAt) : 'Recently'}
                  </span>
                </div>
              </div>

                {/* Actions */}
              <div className="flex items-center gap-2 pb-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  disabled={isLocked}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {isLocked ? 'Locked' : 'Edit Profile'}
                </Button>
              </div>
              {isLocked && nextUpdateDate && (
                <p className="text-xs text-muted-foreground">
                  Profile edits are limited to once every {PROFILE_COOLDOWN_DAYS} days.
                  Next update available: {nextUpdateDate.toLocaleDateString()}.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - About */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">About</h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editData.fullName}
                        onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Address</label>
                      <input
                        type="text"
                        value={editData.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Bio</label>
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border bg-background min-h-[100px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input
                          type="text"
                          value={editData.city}
                          onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">State</label>
                        {editData.country && hasStates(editData.country) ? (
                          <select
                            value={editData.state}
                            onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border bg-background"
                          >
                            <option value="">Select State/Province</option>
                            {getStates(editData.country).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={editData.state}
                            onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border bg-background"
                            placeholder="Enter state/province"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Country</label>
                        <select
                          value={editData.country}
                          onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border bg-background"
                        >
                          <option value="">Select Country</option>
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {saved && <p className="text-sm text-green-400">Profile updated successfully.</p>}
                    <div className="flex items-center gap-2">
                      <Button onClick={handleSaveProfile} disabled={saving || uploading !== null}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="ghost" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.profile?.bio && (
                      <p className="text-muted-foreground">{user.profile.bio}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {user.profile?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {user.profile.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Business Profile */}
              {user.businessProfile && (
                <div className="bg-card rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Business Profile</h2>
                    {user.businessProfile.isVerified && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                      <span>{user.businessProfile.category}</span>
                    </div>
                    {user.businessProfile.description && (
                      <p className="text-muted-foreground">{user.businessProfile.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{user.businessProfile.averageRating?.toFixed(1) || '0.0'}</span>
                        <span className="text-muted-foreground">
                          ({user.businessProfile.totalReviews || 0} reviews)
                        </span>
                      </div>
                      {user.businessProfile.yearsExperience && (
                        <span className="text-muted-foreground">
                          {user.businessProfile.yearsExperience} years experience
                        </span>
                      )}
                      {user.businessProfile.hourlyRate && (
                        <span className="text-muted-foreground">
                          {formatCurrency(user.businessProfile.hourlyRate)}/hr
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Stats</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Followers</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Following</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Posts</span>
                    <span className="font-semibold">0</span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Reviews</h2>
                {user.businessProfile && (
                  <ReviewSummary
                    averageRating={user.businessProfile.averageRating || 0}
                    totalReviews={user.businessProfile.totalReviews || 0}
                  />
                )}
                <div className="mt-4 space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No reviews yet</p>
                  )}
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Security</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {twoFactorEnabled ? (
                      <Shield className="h-5 w-5 text-green-500" />
                    ) : (
                      <ShieldOff className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">
                        {twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                      </p>
                    </div>
                  </div>
                  {!show2FASetup && !show2FADisable && (
                    <Button
                      variant={twoFactorEnabled ? 'outline' : 'default'}
                      size="sm"
                      onClick={twoFactorEnabled ? () => setShow2FADisable(true) : handle2FASetup}
                      disabled={twoFactorLoading}
                    >
                      {twoFactorLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : twoFactorEnabled ? (
                        'Disable'
                      ) : (
                        'Enable'
                      )}
                    </Button>
                  )}
                </div>

                {/* 2FA Setup */}
                {show2FASetup && twoFactorSetupData && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.),
                      then enter the verification code below.
                    </p>
                    <div className="flex justify-center">
                      <img
                        src={twoFactorSetupData.qrCode}
                        alt="2FA QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        Or enter this key manually:
                      </p>
                      <code className="text-xs bg-muted px-2 py-1 rounded select-all">
                        {twoFactorSetupData.secret}
                      </code>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Verification Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={twoFactorVerifyCode}
                          onChange={(e) => setTwoFactorVerifyCode(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border bg-background text-center tracking-widest"
                          placeholder="••••••"
                          maxLength={6}
                        />
                        <Button onClick={handle2FAVerify} disabled={twoFactorLoading || !twoFactorVerifyCode}>
                          {twoFactorLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Verify'
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShow2FASetup(false);
                        setTwoFactorSetupData(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {/* 2FA Disable */}
                {show2FADisable && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                      Enter your password to disable two-factor authentication.
                    </p>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Password
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={twoFactorDisablePassword}
                          onChange={(e) => setTwoFactorDisablePassword(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border bg-background"
                          placeholder="Enter your password"
                        />
                        <Button
                          onClick={handle2FADisable}
                          disabled={twoFactorLoading || !twoFactorDisablePassword}
                          variant="destructive"
                        >
                          {twoFactorLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Disable'
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShow2FADisable(false);
                        setTwoFactorDisablePassword('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
