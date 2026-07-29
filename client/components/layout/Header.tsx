'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/hooks/useTheme';
import { Menu, X, User, LogOut, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { getInitials, mediaUrl } from '@/lib/utils';
import { MobileNav } from '@/components/layout/MobileNav';

export function Header() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main Header */}
      <div className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">Workers</span>
            <span className="text-xl font-bold text-secondary">Choice</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/marketplace"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Services
            </Link>
            <Link
              href="/wall"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Feed
            </Link>
            <Link
              href="/channels"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Channels
            </Link>
            <Link
              href="/reviews"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Reviews
            </Link>
            <Link
              href="/house-rent"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              House Rent
            </Link>
            <Link
              href="/house-for-sale"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              House for Sale
            </Link>
            {user && (
              <Link
                href="/chat"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Messages
              </Link>
            )}
            {user && (user.role === 'ARTISAN' || user.role === 'SELLER') && (
              <Link
                href="/dashboard/services"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                My Services
              </Link>
            )}
            {user && user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {user.profile?.avatarUrl ? (
                      <img
                        src={mediaUrl(user.profile.avatarUrl)}
                        alt={user.profile.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-primary">
                        {getInitials(user.profile?.fullName || 'U')}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:inline">{user.profile?.fullName}</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>{mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-4">
              <Link
                href="/marketplace"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Services
              </Link>
              <Link
                href="/wall"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Feed
              </Link>
              <Link
                href="/channels"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Channels
              </Link>
              <Link
                href="/reviews"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link
                href="/house-rent"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                House Rent
              </Link>
              <Link
                href="/house-for-sale"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                House for Sale
              </Link>
              {user && (
                <Link
                  href="/chat"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
              )}
              {user && user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {user && <MobileNav />}
    </header>
  );
}
