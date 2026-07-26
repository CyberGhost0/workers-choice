'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Save, RotateCw, Bell, Shield, CreditCard, Globe, Loader2 } from 'lucide-react';

interface PlatformSettings {
  general: {
    platformName: string;
    supportEmail: string;
    maintenanceMode: boolean;
  };
  payments: {
    platformFeePercent: number;
    minimumPayout: number;
    escrowReleaseDays: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  security: {
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    twoFactorAuth: boolean;
  };
}

const DEFAULTS: PlatformSettings = {
  general: {
    platformName: 'Workers-Choice',
    supportEmail: 'support@workerschoice.com',
    maintenanceMode: false,
  },
  payments: {
    platformFeePercent: 10,
    minimumPayout: 50,
    escrowReleaseDays: 7,
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  },
  security: {
    requireEmailVerification: true,
    requirePhoneVerification: false,
    twoFactorAuth: false,
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load any persisted backend settings (backend currently stores fee/maintenance/secure)
    setLoading(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put('/admin/settings', {
        platformFee: settings.payments.platformFeePercent,
        maintenanceMode: settings.general.maintenanceMode,
        secureMode: settings.security.requireEmailVerification,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default settings?')) {
      setSettings(DEFAULTS);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
          <p className="text-muted-foreground">Configure your platform settings and preferences</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset}>
            <RotateCw className="mr-2 h-4 w-4" />
            Reset Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <span className="mr-2">✓</span>
                Saved!
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* General Settings */}
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
              <p className="text-sm text-muted-foreground">Basic platform configuration</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Platform Name</label>
            <input
              type="text"
              value={settings.general.platformName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, platformName: e.target.value },
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Support Email</label>
            <input
              type="email"
              value={settings.general.supportEmail}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, supportEmail: e.target.value },
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">
                Temporarily disable public access to the platform
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  general: {
                    ...settings.general,
                    maintenanceMode: !settings.general.maintenanceMode,
                  },
                })
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.general.maintenanceMode ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-card rounded-full transition-transform ${
                  settings.general.maintenanceMode ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Payment Settings</h2>
              <p className="text-sm text-muted-foreground">Configure payment and escrow settings</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Platform Fee (%)</label>
              <input
                type="number"
                value={settings.payments.platformFeePercent}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payments: {
                      ...settings.payments,
                      platformFeePercent: Number(e.target.value),
                    },
                  })
                }
                min="0"
                max="50"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">Fee charged per transaction</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Minimum Payout (₦)</label>
              <input
                type="number"
                value={settings.payments.minimumPayout}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payments: {
                      ...settings.payments,
                      minimumPayout: Number(e.target.value),
                    },
                  })
                }
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum amount for payout</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Escrow Release (days)</label>
              <input
                type="number"
                value={settings.payments.escrowReleaseDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payments: {
                      ...settings.payments,
                      escrowReleaseDays: Number(e.target.value),
                    },
                  })
                }
                min="1"
                max="30"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">Days before auto-release</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Notification Settings</h2>
              <p className="text-sm text-muted-foreground">Configure how users receive notifications</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      [key]: !value,
                    },
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  value ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-card rounded-full transition-transform ${
                    value ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Security Settings</h2>
              <p className="text-sm text-muted-foreground">Configure security and verification requirements</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries(settings.security).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .trim()
                    .replace(/^./, (str) => str.toUpperCase())}
                </p>
                <p className="text-sm text-muted-foreground">
                  {key === 'requireEmailVerification' && 'Users must verify their email to access the platform'}
                  {key === 'requirePhoneVerification' && 'Users must verify their phone number'}
                  {key === 'twoFactorAuth' && 'Require two-factor authentication for all users'}
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      [key]: !value,
                    },
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  value ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-card rounded-full transition-transform ${
                    value ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
