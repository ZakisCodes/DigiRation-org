'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { useApiQuery } from '@/hooks/useApi';
import { rationApi } from '@/lib/api';
import { NAVIGATION_ITEMS, ITEM_CATEGORIES } from '@/lib/constants';
import { SearchIcon, FilterIcon, ItemsIcon } from '@/lib/icons';
import { SkeletonList } from '@/components/ui/Skeleton';

export default function ItemsPage() {
  const router = useRouter();
  const { user, selectedMember } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch ration items
  const { data: itemsData, isLoading: itemsLoading } = useApiQuery(
    () => rationApi.getItems({
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
      language: user?.language || 'en',
    }),
    [searchTerm, selectedCategory, user?.language]
  );

  // Fetch member quota if member is selected
  const { data: quotaData } = useApiQuery(
    () => selectedMember ? rationApi.getMemberQuota(selectedMember.id) : Promise.resolve({ success: false }),
    [selectedMember?.id]
  );

  // Create quota lookup for quick access
  const quotaLookup = useMemo(() => {
    if (!quotaData?.data?.quotas) return {};
    
    return quotaData.data.quotas.reduce((acc: any, quota: any) => {
      acc[quota.itemId] = quota;
      return acc;
    }, {});
  }, [quotaData]);

  const handleItemClick = (item: any) => {
    router.push(`/items/${item.id}`);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? '' : categoryId);
  };

  const filteredItems = itemsData?.data?.items || [];

  return (
    <MainLayout
      title="Ration Items"
      navigationItems={NAVIGATION_ITEMS}
    >
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<SearchIcon className="w-5 h-5" />}
        />

        {/* Category Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors min-h-touch ${
              selectedCategory === ''
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FilterIcon className="w-4 h-4" />
            <span>All Items</span>
          </button>
          
          {ITEM_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryFilter(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors min-h-touch ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Items List */}
        {itemsLoading ? (
          <SkeletonList items={6} />
        ) : filteredItems.length > 0 ? (
          <div className="space-y-3">
            {filteredItems.map((item: any) => {
              const quota = quotaLookup[item.id];
              const hasQuota = quota && quota.monthlyLimit > 0;
              
              return (
                <Card
                  key={item.id}
                  interactive
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-center space-x-4">
                    {/* Item Image/Icon */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ItemsIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ₹{item.pricePerUnit} per {item.unit}
                          </p>
                          
                          {/* Category Badge */}
                          <div className="mt-1">
                            <Badge variant="neutral" size="sm">
                              {ITEM_CATEGORIES.find(cat => cat.id === item.category)?.name || item.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Quota Status */}
                        {hasQuota && (
                          <div className="text-right ml-2">
                            <Badge
                              variant={
                                quota.status === 'exhausted' ? 'error' :
                                quota.status === 'low' ? 'warning' : 'success'
                              }
                              size="sm"
                            >
                              {quota.remainingQuota} {item.unit} left
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {quota.currentUsed}/{quota.monthlyLimit} {item.unit} used
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Quota Progress Bar */}
                      {hasQuota && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Monthly Quota</span>
                            <span>{quota.usagePercent}% used</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                quota.status === 'exhausted' ? 'bg-red-500' :
                                quota.status === 'low' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(quota.usagePercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Arrow Icon */}
                    <svg
                      className="w-5 h-5 text-gray-400 flex-shrink-0"
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
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<ItemsIcon className="w-16 h-16" />}
            title="No Items Found"
            description={
              searchTerm || selectedCategory
                ? "No items match your current filters. Try adjusting your search or category selection."
                : "No ration items are currently available."
            }
            action={{
              label: "Clear Filters",
              onClick: () => {
                setSearchTerm('');
                setSelectedCategory('');
              },
            }}
          />
        )}

        {/* Summary Card */}
        {filteredItems.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="text-center">
              <h4 className="font-medium text-blue-900 mb-1">
                {filteredItems.length} Items Available
              </h4>
              <p className="text-sm text-blue-700">
                {selectedMember ? `Showing quota for ${selectedMember.name}` : 'Select a family member to view quotas'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}