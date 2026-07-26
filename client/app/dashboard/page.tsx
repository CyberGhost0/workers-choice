'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import {
  Briefcase,
  ShoppingBag,
  MessageCircle,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Search,
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalEarnings: number;
  averageRating: number;
  unreadMessages: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for now - will be replaced with actual API calls
      setStats({
        totalOrders: 24,
        pendingOrders: 3,
        completedOrders: 20,
        totalEarnings: 4250,
        averageRating: 4.8,
        unreadMessages: 5,
      });

      setRecentOrders([
        {
          id: '1',
          service: 'Plumbing Repair',
          provider: 'John\'s Plumbing',
          amount: 150,
          status: 'COMPLETED',
          date: '2024-01-15',
        },
        {
          id: '2',
          service: 'House Cleaning',
          provider: 'Sparkle Cleaners',
          amount: 120,
          status: 'IN_PROGRESS',
          date: '2024-01-18',
        },
        {
          id: '3',
          service: 'Electrical Work',
          provider: 'Power Solutions',
          amount: 200,
          status: 'PENDING',
          date: '2024-01-20',
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.profile?.fullName || 'User'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your account
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{stats?.totalOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1">{stats?.pendingOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1">{stats?.completedOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold mt-1">{stats?.averageRating || 0}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/marketplace" className="block">
            <div className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Find Services</h3>
                  <p className="text-sm text-muted-foreground">Browse local artisans</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/messages" className="block">
            <div className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Messages</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats?.unreadMessages || 0} unread
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/orders" className="block">
            <div className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">My Orders</h3>
                  <p className="text-sm text-muted-foreground">View all orders</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <Link href="/dashboard/orders">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-6">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
                <Link href="/marketplace">
                  <Button className="mt-4">Browse Services</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id}>
                    <div
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{order.service}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.provider}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.amount)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.date)}
                          </p>
                        </div>
                        {order.status === 'COMPLETED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReviewingOrderId(reviewingOrderId === order.id ? null : order.id)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </div>
                    {reviewingOrderId === order.id && (
                      <div className="p-4 border-t">
                        <ReviewForm
                          orderId={order.id}
                          providerName={order.provider}
                          onSuccess={() => setReviewingOrderId(null)}
                          onCancel={() => setReviewingOrderId(null)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
