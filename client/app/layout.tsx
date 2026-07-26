import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/hooks/useTheme';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { TooltipProvider } from '@/components/ui/tooltip';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Workers-Choice | Find Local Artisans & Services in Nigeria',
  description:
    'Connect with trusted local plumbers, electricians, cleaners, and more across Lagos, Abuja, Port Harcourt, and all of Nigeria.',
  manifest: '/manifest.json',
  applicationName: 'Workers-Choice',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Workers-Choice',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force dark mode on first visit
              (function() {
                var saved = localStorage.getItem('theme');
                if (!saved || saved === 'system' || saved === 'light') {
                  localStorage.setItem('theme', 'dark');
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <div className="pb-16 md:pb-0">
                {children}
              </div>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
