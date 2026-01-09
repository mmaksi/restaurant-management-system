'use client';

import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { httpUpdateUserProfile } from '@/infra/db/helpers';
import { useMutation } from '@tanstack/react-query';
import { useUserId } from '@/hooks/useUserId';
import { GetUserProfile } from '@/infra/db/types/db';

interface ProfileSettingsProps {
  userProfile: GetUserProfile;
}

export default function ProfileSettings({ userProfile }: ProfileSettingsProps) {
  const { userId } = useUserId();
  const [firstName, setFirstName] = useState(userProfile?.first_name || '');
  const [lastName, setLastName] = useState(userProfile?.last_name || '');
  const [email, setEmail] = useState(userProfile?.email || '');

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: {
      first_name: string;
      last_name: string;
      email: string;
    }) => {
      if (!userId) throw new Error('User ID is not available');
      await httpUpdateUserProfile(userId, profileData);
    },
    onMutate: async () => {
      const previousState = {
        first_name: firstName,
        last_name: lastName,
        email: email,
      };
      return { previousState };
    },
    onError: (error, variables, context) => {
      if (context?.previousState) {
        setFirstName(context.previousState.first_name);
        setLastName(context.previousState.last_name);
        setEmail(context.previousState.email);
      }
    },
  });

  const handleSave = () => {
    toast.promise(
      updateProfileMutation.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        email: email,
      }),
      {
        loading: 'Updating profile...',
        success: 'Profile updated successfully!',
        error: (error) =>
          `Failed to update profile: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
      }
    );
  };

  return (
    <>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={true}
              placeholder="john.doe@example.com"
              className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-6">
          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </>
  );
}
