'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Users,
  Layers,
  Settings,
  BarChart3,
  Shield,
  ChevronRight,
  Home,
} from 'lucide-react';

const adminTabs = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3, href: '/admin' },
  { id: 'users', name: 'User Management', icon: Users, href: '/admin/users' },
  { id: 'groups', name: 'Groups & Skills', icon: Layers, href: '/admin/groups' },
  { id: 'settings', name: 'Platform Settings', icon: Settings, href: '/admin/settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin panel.
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-16'
          } bg-card border-r transition-all duration-300 hidden md:block`}
        >
          <div className="p-4">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-6 w-6 text-primary" />
              {sidebarOpen && (
                <span className="font-bold text-lg">Admin Panel</span>
              )}
            </div>

            <nav className="space-y-1">
              {adminTabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {sidebarOpen && <span>{tab.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar toggle */}
          <div className="absolute bottom-4 left-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ChevronRight
                className={`h-5 w-5 transition-transform ${
                  sidebarOpen ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-40">
          <nav className="flex justify-around p-2">
            {adminTabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-xs">{tab.name.split(' ')[0]}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
