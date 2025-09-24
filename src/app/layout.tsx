import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { ToastContainer } from '@/components/ui/Toast';
import { useNotificationStore } from '@/store/notificationStore';
import AuthGuard from '@/components/auth/AuthGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DigiRation - Digital Ration Management',
  description: 'Mobile-first Progressive Web App for ration customers in India',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DigiRation',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <>
      {children}
      <ToastContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DigiRation" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <div id="root" className="min-h-screen bg-gray-50">
            <NotificationProvider>
              <AuthGuard>
                {children}
              </AuthGuard>
            </NotificationProvider>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}