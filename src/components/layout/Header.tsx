'use client';

import React, { useState } from 'react';
import { Language } from '@/types';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showLanguage?: boolean;
  currentLanguage?: Language;
  onLanguageChange?: (language: Language) => void;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showLanguage = false,
  currentLanguage = 'en',
  onLanguageChange,
  actions,
}) => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const languages = [
    { code: 'en' as Language, name: 'English', native: 'English' },
    { code: 'hi' as Language, name: 'Hindi', native: 'हिंदी' },
    { code: 'ta' as Language, name: 'Tamil', native: 'தமிழ்' },
    { code: 'te' as Language, name: 'Telugu', native: 'తెలుగు' },
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <header className="bg-white border-b border-gray-200 safe-top">
      <div className="flex items-center justify-between px-4 py-3 h-16">
        {/* Left side */}
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={onBack}
              className="mr-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-touch min-w-touch flex items-center justify-center"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          {showLanguage && (
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors min-h-touch"
              >
                <span className="mr-1">{currentLang?.native}</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Language Dropdown */}
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          onLanguageChange?.(language.code);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors min-h-touch ${
                          currentLanguage === language.code
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{language.native}</span>
                          <span className="text-xs text-gray-500">
                            {language.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Actions */}
          {actions}
        </div>
      </div>

      {/* Close language menu when clicking outside */}
      {showLanguageMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLanguageMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;