'use client';

import React from 'react';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import { NavItem, Language } from '@/types';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showLanguage?: boolean;
  currentLanguage?: Language;
  onLanguageChange?: (language: Language) => void;
  headerActions?: React.ReactNode;
  showNavigation?: boolean;
  navigationItems?: NavItem[];
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  showBack = false,
  onBack,
  showLanguage = false,
  currentLanguage = 'en',
  onLanguageChange,
  headerActions,
  showNavigation = true,
  navigationItems = [],
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        title={title}
        showBack={showBack}
        onBack={onBack}
        showLanguage={showLanguage}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
        actions={headerActions}
      />

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto ${showNavigation ? 'pb-20' : 'pb-4'}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNavigation && navigationItems.length > 0 && (
        <BottomNavigation items={navigationItems} />
      )}
    </div>
  );
};

export default MainLayout;