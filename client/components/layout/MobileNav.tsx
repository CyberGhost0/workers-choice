'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Home, ShoppingBag, MessageCircle, Newspaper, User } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/chat', label: 'Messages', icon: MessageCircle },
  { href: '/wall', label: 'Feed', icon: Newspaper },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));

          if (!user && tab.href === '/profile') {
            return (
              <Link
                key={tab.href}
                href="/auth/login"
                className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-muted-foreground transition-colors"
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </Link>
            );
          }

          if (!user && tab.href === '/chat') {
            return (
              <Link
                key={tab.href}
                href="/auth/login"
                className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-muted-foreground transition-colors"
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
