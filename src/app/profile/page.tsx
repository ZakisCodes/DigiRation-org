'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useApiQuery } from '@/hooks/useApi';
import { userApi } from '@/lib/api';
import { NAVIGATION_ITEMS, LANGUAGES } from '@/lib/constants';
import { 
  SettingsIcon, 
  LogoutIcon, 
  ProfileIcon,
  NotificationIcon,
  InfoIcon 
} from '@/lib/icons';
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function ProfilePage() {
  const router = useRouter();
  const { user, selectedMember } = useAuthStore();
  const { logout, switchMember } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Fetch user profile data
  const { data: profileData, isLoading } = useApiQuery(
    () => userApi.getProfile(),
    []
  );

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    router.push('/auth/login');
  };

  const handleSwitchMember = (member: any) => {
    switchMember(member);
    setShowMemberModal(false);
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'personal-info',
          label: 'Personal Information',
          icon: ProfileIcon,
          onClick: () => router.push('/profile/edit'),
        },
        {
          id: 'family-members',
          label: 'Family Members',
          icon: ProfileIcon,
          onClick: () => setShowMemberModal(true),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          label: 'Notifications',
          icon: NotificationIcon,
          onClick: () => router.push('/profile/notifications'),
        },
        {
          id: 'language',
          label: 'Language & Region',
          icon: SettingsIcon,
          onClick: () => router.push('/profile/language'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          label: 'Help & Support',
          icon: InfoIcon,
          onClick: () => router.push('/help'),
        },
        {
          id: 'about',
          label: 'About DigiRation',
          icon: InfoIcon,
          onClick: () => router.push('/about'),
        },
      ],
    },
  ];

  return (
    <MainLayout
      title="Profile"
      navigationItems={NAVIGATION_ITEMS}
    >
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <Card>
            <div className="flex items-center space-x-4 mb-4">
              <Avatar
                src={selectedMember?.avatarUrl}
                alt={selectedMember?.name || 'User'}
                size="xl"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedMember?.name}
                </h2>
                <p className="text-gray-600">
                  {user?.familyName}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="success">Active</Badge>
                  {selectedMember?.isHead && (
                    <Badge variant="info">Family Head</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">Ration Card</p>
                <p className="font-medium text-gray-900">{user?.rationCardId}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{user?.phoneNumber}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Profile Sections */}
        {profileSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 px-1">
              {section.title}
            </h3>
            <Card className="p-0">
              {section.items.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-touch ${
                      index !== section.items.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900 font-medium">
                        {item.label}
                      </span>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                );
              })}
            </Card>
          </div>
        ))}

        {/* Logout Button */}
        <Card>
          <Button
            onClick={() => setShowLogoutModal(true)}
            variant="danger"
            fullWidth
            className="flex items-center justify-center space-x-2"
          >
            <LogoutIcon className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-gray-500 pb-4">
          <p>DigiRation v1.0.0</p>
          <p>Government of India Initiative</p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to logout? You'll need to authenticate again to access your account.
          </p>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowLogoutModal(false)}
              variant="ghost"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              variant="danger"
              fullWidth
            >
              Logout
            </Button>
          </div>
        </div>
      </Modal>

      {/* Family Members Modal */}
      <Modal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        title="Switch Family Member"
      >
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Select a family member to switch to their profile:
          </p>
          
          {profileData?.data?.familyMembers?.map((member: any) => (
            <button
              key={member.id}
              onClick={() => handleSwitchMember(member)}
              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 min-h-touch ${
                selectedMember?.id === member.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar
                  src={member.avatarUrl}
                  alt={member.name}
                  size="md"
                />
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">
                      {member.name}
                    </h4>
                    {member.isHead && (
                      <Badge variant="info" size="sm">Head</Badge>
                    )}
                    {selectedMember?.id === member.id && (
                      <Badge variant="success" size="sm">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Age: {member.age}
                  </p>
                </div>
              </div>
            </button>
          ))}
          
          <Button
            onClick={() => setShowMemberModal(false)}
            variant="ghost"
            fullWidth
            className="mt-4"
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </MainLayout>
  );
}