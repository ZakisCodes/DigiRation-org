'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, selectedMember } = useAuthStore();

  useEffect(() => {
    // Skip auth check for auth pages
    if (pathname.startsWith('/auth/')) {
      return;
    }

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // If authenticated but no member selected, redirect to member selection
    if (isAuthenticated && user && !selectedMember && !pathname.startsWith('/auth/')) {
      // This shouldn't happen in normal flow, but handle edge case
      console.warn('User authenticated but no member selected');
    }

    // If authenticated and on auth pages, redirect to dashboard
    if (isAuthenticated && pathname.startsWith('/auth/')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, selectedMember, pathname, router, requireAuth, redirectTo]);

  // Show loading while checking auth state
  if (requireAuth && !isAuthenticated && !pathname.startsWith('/auth/')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;