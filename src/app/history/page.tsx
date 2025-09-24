'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { NAVIGATION_ITEMS, STATUS_COLORS } from '@/lib/constants';
import { HistoryIcon, FilterIcon, ItemsIcon } from '@/lib/icons';

// Mock transaction data - in real app, this would come from API
const mockTransactions = [
  {
    id: 'txn-001',
    memberName: 'Rajesh Sharma',
    shopName: 'Gandhi Street Ration Shop',
    items: [
      { name: 'Rice', quantity: 5, unit: 'kg', price: 10.00 },
      { name: 'Wheat', quantity: 3, unit: 'kg', price: 7.50 },
    ],
    totalAmount: 17.50,
    paymentMethod: 'upi',
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'txn-002',
    memberName: 'Priya Sharma',
    shopName: 'Gandhi Street Ration Shop',
    items: [
      { name: 'Sugar', quantity: 1, unit: 'kg', price: 20.00 },
    ],
    totalAmount: 20.00,
    paymentMethod: 'cash',
    status: 'completed',
    createdAt: '2024-01-10T14:15:00Z',
  },
  {
    id: 'txn-003',
    memberName: 'Arjun Sharma',
    shopName: 'Gandhi Street Ration Shop',
    items: [
      { name: 'Cooking Oil', quantity: 1, unit: 'liter', price: 80.00 },
    ],
    totalAmount: 80.00,
    paymentMethod: 'qr',
    status: 'cancelled',
    createdAt: '2024-01-08T16:45:00Z',
  },
];

export default function HistoryPage() {
  const { selectedMember } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filters = [
    { id: 'all', label: 'All Transactions' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredTransactions = mockTransactions.filter(transaction => {
    if (selectedFilter === 'all') return true;
    return transaction.status === selectedFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      upi: 'UPI',
      qr: 'QR Code',
      card: 'Card',
      cash: 'Cash',
    };
    return methods[method] || method;
  };

  return (
    <MainLayout
      title="Transaction History"
      navigationItems={NAVIGATION_ITEMS}
    >
      <div className="p-4 space-y-4">
        {/* Member Info */}
        {selectedMember && (
          <Card className="bg-primary-50 border-primary-200">
            <div className="text-center">
              <h3 className="font-medium text-primary-900">
                Showing transactions for {selectedMember.name}
              </h3>
              <p className="text-sm text-primary-700 mt-1">
                Switch family member in Profile to view their transactions
              </p>
            </div>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors min-h-touch ${
                selectedFilter === filter.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FilterIcon className="w-4 h-4" />
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} interactive>
                <div className="space-y-3">
                  {/* Transaction Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          Transaction #{transaction.id.slice(-3)}
                        </h3>
                        <Badge
                          variant={
                            transaction.status === 'completed' ? 'success' :
                            transaction.status === 'pending' ? 'warning' : 'error'
                          }
                          size="sm"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {transaction.shopName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.createdAt)} at {formatTime(transaction.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{transaction.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getPaymentMethodLabel(transaction.paymentMethod)}
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="border-t border-gray-100 pt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Items Purchased:
                    </h4>
                    <div className="space-y-1">
                      {transaction.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <ItemsIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-gray-600">
                            {item.quantity} {item.unit} × ₹{item.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Member Info */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-500">
                      Purchased by: <span className="font-medium">{transaction.memberName}</span>
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<HistoryIcon className="w-16 h-16" />}
            title="No Transactions Found"
            description={
              selectedFilter === 'all'
                ? "You haven't made any transactions yet. Start by browsing available items."
                : `No ${selectedFilter} transactions found. Try selecting a different filter.`
            }
            action={{
              label: selectedFilter === 'all' ? "Browse Items" : "Show All Transactions",
              onClick: () => {
                if (selectedFilter === 'all') {
                  // Navigate to items page
                } else {
                  setSelectedFilter('all');
                }
              },
            }}
          />
        )}

        {/* Summary Card */}
        {filteredTransactions.length > 0 && (
          <Card className="bg-green-50 border-green-200">
            <div className="text-center">
              <h4 className="font-medium text-green-900 mb-1">
                {filteredTransactions.length} Transaction{filteredTransactions.length !== 1 ? 's' : ''}
              </h4>
              <p className="text-sm text-green-700">
                Total spent: ₹{filteredTransactions
                  .filter(t => t.status === 'completed')
                  .reduce((sum, t) => sum + t.totalAmount, 0)
                  .toFixed(2)}
              </p>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}