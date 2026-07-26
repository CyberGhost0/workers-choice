'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Users,
  ShoppingBag,
  MessageCircle,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  Settings,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalArtisans: number;
  totalCustomers: number;
  totalSellers: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  newUsersThisWeek: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.stats);
    } catch (err: any) {
      setError('Could not load dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);

  const statCards = [
    {
      title: 'Total Users',
      value: (stats?.totalUsers || 0).toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: `+${stats?.newUsersThisWeek || 0} this week`,
    },
    {
      title: 'Total Orders',
      value: (stats?.totalOrders || 0).toLocaleString(),
      icon: ShoppingBag,
      color: 'bg-green-500',
      change: `${stats?.completedOrders || 0} completed`,
    },
    {
      title: 'Total Revenue',
      value: formatNaira(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-purple-500',
      change: 'From completed orders',
    },
    {
      title: 'Active Artisans',
      value: (stats?.totalArtisans || 0).toLocaleString(),
      icon: TrendingUp,
      color: 'bg-secondary',
      change: `${stats?.totalSellers || 0} sellers`,
    },
  ];

  const quickActions = [
    { label: 'Manage Users', href: '/admin/users', icon: Users, color: 'text-primary' },
    { label: 'Groups & Skills', href: '/admin/groups', icon: Layers, color: 'text-green-500' },
    { label: 'Platform Settings', href: '/admin/settings', icon: Settings, color: 'text-yellow-500' },
    { label: 'View Marketplace', href: '/marketplace', icon: ShoppingBag, color: 'text-purple-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening on your platform.
        </p>
        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-card rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
              </div>
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-card rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Order Overview (real data) */}
        <div className="bg-card rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Order Overview</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
              <CheckCircle className="h-5 w-5 mt-0.5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">{stats?.completedOrders || 0} completed orders</p>
                <p className="text-xs text-muted-foreground mt-1">Successfully fulfilled</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
              <Clock className="h-5 w-5 mt-0.5 text-orange-400" />
              <div className="flex-1">
                <p className="text-sm font-medium">{stats?.pendingOrders || 0} pending orders</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
              <Users className="h-5 w-5 mt-0.5 text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium">{stats?.newUsersThisWeek || 0} new users this week</p>
                <p className="text-xs text-muted-foreground mt-1">Recent registrations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Pending Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-500/15 rounded-lg border border-yellow-500/40">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              <span className="font-medium text-yellow-300">Pending Orders</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">
              {stats?.pendingOrders || 0}
            </p>
            <p className="text-sm text-yellow-200/70 mt-1">
              Orders awaiting processing
            </p>
          </div>

          <div className="p-4 bg-blue-500/15 rounded-lg border border-blue-500/40">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span className="font-medium text-blue-300">Total Sellers</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {stats?.totalSellers || 0}
            </p>
            <p className="text-sm text-blue-200/70 mt-1">
              Registered product sellers
            </p>
          </div>

          <div className="p-4 bg-green-500/15 rounded-lg border border-green-500/40">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-5 w-5 text-green-400" />
              <span className="font-medium text-green-300">Customers</span>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {stats?.totalCustomers || 0}
            </p>
            <p className="text-sm text-green-200/70 mt-1">
              Active customer accounts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
