'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { FamilyMember } from '@/types';

export default function SelectMemberPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectMember, user, sessionId } = useAuth();
  
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentSessionId = searchParams.get('sessionId') || sessionId;

  // Get family members from URL params or state
  useEffect(() => {
    const membersParam = searchParams.get('members');
    if (membersParam) {
      try {
        const members = JSON.parse(decodeURIComponent(membersParam));
        setFamilyMembers(members);
      } catch (error) {
        console.error('Failed to parse family members:', error);
      }
    }
  }, [searchParams]);

  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(memberId);
  };

  const handleSubmit = async () => {
    if (!selectedMemberId || !currentSessionId) return;

    setIsLoading(true);

    const result = await selectMember({
      sessionId: currentSessionId,
      memberId: selectedMemberId,
    });

    if (result.success) {
      router.push(`/auth/verify-aadhaar?sessionId=${currentSessionId}&memberId=${selectedMemberId}`);
    }

    setIsLoading(false);
  };

  const handleBack = () => {
    router.push(`/auth/verify-otp?sessionId=${currentSessionId}`);
  };

  if (!currentSessionId) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Member</h1>
          <p className="text-gray-600">
            Choose your profile from the family members
          </p>
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              {user.familyName} • {user.rationCardId}
            </p>
          )}
        </div>

        {/* Family Members */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 text-center mb-6">
              Family Members
            </h3>

            {familyMembers.length > 0 ? (
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleMemberSelect(member.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 min-h-touch ${
                      selectedMemberId === member.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar
                        src={member.avatarUrl}
                        alt={member.name}
                        size="lg"
                        fallback={member.name.charAt(0)}
                      />
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">
                            {member.name}
                          </h4>
                          {member.isHead && (
                            <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                              Head
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Age: {member.age} • {member.gender === 'M' ? 'Male' : member.gender === 'F' ? 'Female' : 'Other'}
                        </p>
                      </div>
                      {selectedMemberId === member.id && (
                        <div className="text-primary-600">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading family members...</p>
              </div>
            )}

            {/* Continue Button */}
            <Button
              onClick={handleSubmit}
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={!selectedMemberId || isLoading}
              className="mt-6"
            >
              Continue
            </Button>
          </div>
        </Card>

        {/* Back Button */}
        <div className="mt-6">
          <Button
            onClick={handleBack}
            variant="ghost"
            fullWidth
          >
            Back to OTP
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Select your name from the list to continue with verification
          </p>
        </div>
      </div>
    </div>
  );
}