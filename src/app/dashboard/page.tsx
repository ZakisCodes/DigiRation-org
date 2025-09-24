'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { useAuthStore } from '@/store/authStore';
import { useApiQuery } from '@/hooks/useApi';
import { userApi, rationApi } from '@/lib/api';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import { 
  ItemsIcon, 
  HistoryIcon, 
  ScanIcon, 
  ComplaintIcon,
  NotificationIcon,
  SettingsIcon 
} from '@/lib/icons';
import { SkeletonCard, SkeletonText } from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const router = useRouter();
  const { user, selectedMember } = useAuthStore();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useApiQuery(
    () => userApi.getDashboard(),
    []
  );

  // Fetch member quota if member is selected
  const { data: quotaData, isLoading: quotaLoading } = useApiQuery(
    () => selectedMember ? rationApi.getMemberQuota(selectedMember.id) : Promise.resolve({ success: false }),
    [selectedMember?.id]
  );

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'scan':
        router.push('/scan');
        break;
      case 'items':
        router.push('/items');
        break;
      case 'history':
        router.push('/history');
        break;
      case 'complaints':
        router.push('/complaints');
        break;
      case 'notifications':
        router.push('/notifications');
        break;
      case 'settings':
        router.push('/profile');
        break;
      default:
        break;
    }
  };

  const quickActions = [
    { id: 'scan', label: 'Scan QR', icon: ScanIcon, color: 'bg-primary-600' },
    { id: 'items', label: 'View Items', icon: ItemsIcon, color: 'bg-green-600' },
    { id: 'history', label: 'History', icon: HistoryIcon, color: 'bg-blue-600' },
    { id: 'complaints', label: 'Complaints', icon: ComplaintIcon, color: 'bg-orange-600' },
    { id: 'notifications', label: 'Alerts', icon: NotificationIcon, color: 'bg-purple-600' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, color: 'bg-gray-600' },
  ];

  // Calculate quota summary
  const quotaSummary = quotaData?.data?.quotas ? {
    totalItems: quotaData.data.quotas.length,
    availableItems: quotaData.data.quotas.filter((q: any) => q.status === 'available').length,
    lowItems: quotaData.data.quotas.filter((q: any) => q.status === 'low').length,
    exhaustedItems: quotaData.data.quotas.filter((q: any) => q.status === 'exhausted').length,
    averageUsage: quotaData.data.quotas.reduce((acc: number, q: any) => acc + q.usagePercent, 0) / quotaData.data.quotas.length,
  } : null;

  return (
    <MainLayout
      title="DigiRation"
      showLanguage
      navigationItems={NAVIGATION_ITEMS}
    >
      <div className="p-4 space-y-6">
        {/* Profile Card */}
        {dashboardLoading ? (
          <SkeletonCard />
        ) : (
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <div className="flex items-center space-x-4">
              <Avatar
                src={selectedMember?.avatarUrl}
                alt={selectedMember?.name || 'User'}
                size="lg"
                className="border-2 border-white/20"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {selectedMember?.name || 'Welcome'}
                </h2>
                <p className="text-primary-100">
                  {user?.familyName} • {user?.rationCardId}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="success" className="bg-white/20 text-white">
                    Active Member
                  </Badge>
                  {selectedMember?.isHead && (
                    <Badge variant="info" className="bg-white/20 text-white">
                      Family Head
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Stats */}
        {quotaLoading ? (
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : quotaSummary ? (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {quotaSummary.availableItems}
                </div>
                <div className="text-sm text-gray-600">Available Items</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(quotaSummary.averageUsage)}%
                </div>
                <div className="text-sm text-gray-600">Quota Used</div>
              </div>
            </Card>
          </div>
        ) : null}

        {/* Quota Overview */}
        {quotaData?.data?.quotas && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Monthly Quota
              </h3>
              <button
                onClick={() => router.push('/quota')}
                className="text-primary-600 text-sm font-medium"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              {quotaData.data.quotas.slice(0, 3).map((quota: any) => (
                <div key={quota.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {quota.itemName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {quota.currentUsed}/{quota.monthlyLimit} {quota.itemUnit}
                      </span>
                    </div>
                    <ProgressBar
                      value={quota.usagePercent}
                      color={
                        quota.status === 'exhausted' ? 'error' :
                        quota.status === 'low' ? 'warning' : 'success'
                      }
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-touch"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mb-2`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
            <button
              onClick={() => router.push('/history')}
              className="text-primary-600 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          {/* Placeholder for recent transactions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <ItemsIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Rice Purchase</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              <Badge variant="success">Completed</Badge>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <ItemsIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Wheat Purchase</p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>
              <Badge variant="success">Completed</Badge>
            </div>
            
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                No more recent activity
              </p>
            </div>
          </div>
        </Card>

        {/* Announcements */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <NotificationIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                New Items Available
              </h4>
              <p className="text-sm text-blue-700">
                Fresh stock of cooking oil and sugar is now available at your nearest ration shop.
              </p>
              <button className="text-sm font-medium text-blue-600 mt-2 hover:text-blue-700">
                View Details →
              </button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}