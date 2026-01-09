'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MANAGERS_QUERY_KEY } from '@/lib/constants';
import { getChangedFields } from '@/lib/helpers';
import {
  httpCreateManager,
  httpUpdateAdminManager,
  httpGetAllAdminRestaurants,
} from '@/infra/db/helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Manager } from '@/lib/types';
import { useUserId } from '@/hooks/useUserId';

interface ManagerModalProps {
  editingManager: Manager | null;
  handleCloseModal: () => void;
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    restaurant_id: string;
  };
  setFormData: (data: {
    first_name: string;
    last_name: string;
    email: string;
    restaurant_id: string;
  }) => void;
}

const ManagerModal = (props: ManagerModalProps) => {
  const queryClient = useQueryClient();
  const { userId, isLoading: isLoadingUserId } = useUserId();
  const [restaurants, setRestaurants] = useState<
    Array<{
      id: string;
      name: string;
      address: string;
      city: string;
      phone: string;
    }>
  >([]);

  useEffect(() => {
    if (!userId || isLoadingUserId) return;

    const loadRestaurants = async () => {
      try {
        const restaurantsData = await httpGetAllAdminRestaurants(userId);
        const restaurantList =
          restaurantsData
            ?.map(
              (ar: {
                restaurant_id: string | null;
                restaurants?: {
                  id: string;
                  name: string;
                  address: string;
                  city: string;
                  phone: string;
                } | null;
              }) => {
                const restaurant = ar.restaurants as
                  | {
                      id: string;
                      name: string;
                      address: string;
                      city: string;
                      phone: string;
                    }
                  | null
                  | undefined;
                return restaurant;
              }
            )
            .filter(
              (
                r
              ): r is {
                id: string;
                name: string;
                address: string;
                city: string;
                phone: string;
              } => r !== null && r !== undefined
            ) || [];
        setRestaurants(restaurantList);
      } catch (error) {
        console.error('Error loading restaurants:', error);
      }
    };
    loadRestaurants();
  }, [userId, isLoadingUserId]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      restaurant_id: string;
      first_name: string;
      last_name: string;
      email: string;
    }) => {
      const createdManager = await httpCreateManager(data.restaurant_id, {
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        email: data.email || null,
      });
      return createdManager;
    },
    onMutate: async (newManager) => {
      await queryClient.cancelQueries({ queryKey: MANAGERS_QUERY_KEY });

      const previousManagers =
        queryClient.getQueryData<Manager[]>(MANAGERS_QUERY_KEY);

      // Optimistically add with temp ID
      const tempId = `temp-${Date.now()}`;
      const restaurant = restaurants.find(
        (r) => r.id === newManager.restaurant_id
      );
      const optimisticManager: Manager = {
        id: tempId,
        first_name: newManager.first_name,
        last_name: newManager.last_name,
        email: newManager.email,
        restaurant_id: newManager.restaurant_id,
        restaurant_name: restaurant?.name || null,
      };

      queryClient.setQueryData<Manager[]>(MANAGERS_QUERY_KEY, (old) => {
        if (!old) return [optimisticManager];
        return [optimisticManager, ...old];
      });

      return { previousManagers, tempId };
    },
    onError: (err, variables, context) => {
      if (context?.previousManagers) {
        queryClient.setQueryData(MANAGERS_QUERY_KEY, context.previousManagers);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANAGERS_QUERY_KEY });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        first_name: string;
        last_name: string;
        email: string;
        restaurant_id: string | null;
        old_restaurant_id: string | null;
      };
    }) => {
      await httpUpdateAdminManager(id, {
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        email: data.email || null,
        restaurant_id: data.restaurant_id || '',
        old_restaurant_id: data.old_restaurant_id || '',
      });
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: MANAGERS_QUERY_KEY });

      // Snapshot previous value
      const previousManagers =
        queryClient.getQueryData<Manager[]>(MANAGERS_QUERY_KEY);

      // Optimistically update
      const restaurant = restaurants.find((r) => r.id === data.restaurant_id);
      queryClient.setQueryData<Manager[]>(MANAGERS_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((m) =>
          m.id === id
            ? {
                ...m,
                first_name: data.first_name || null,
                last_name: data.last_name || null,
                email: data.email || null,
                restaurant_id: data.restaurant_id || null,
                restaurant_name: restaurant?.name || null,
              }
            : m
        );
      });

      return { previousManagers };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousManagers) {
        queryClient.setQueryData(MANAGERS_QUERY_KEY, context.previousManagers);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANAGERS_QUERY_KEY });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Only treat as update if editingManager exists and has an id
    const isUpdate = editingManager && editingManager.id;

    if (isUpdate) {
      const changedFields = getChangedFields<Manager>(editingManager, formData);
      // Only update if there are changes
      if (Object.keys(changedFields).length === 0) {
        toast.success('No changes detected');
        return;
      }

      handleCloseModal();

      toast.promise(
        updateMutation.mutateAsync({
          id: editingManager.id,
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            restaurant_id: formData.restaurant_id || null,
            old_restaurant_id: editingManager.restaurant_id || null,
          },
        }),
        {
          loading: 'Updating manager...',
          success: 'Manager updated successfully!',
          error: (error) =>
            `Failed to update manager: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
        }
      );
    } else {
      if (!formData.restaurant_id) {
        toast.error('Please select a restaurant for this manager');
        return;
      }

      handleCloseModal();

      toast.promise(
        createMutation.mutateAsync({
          restaurant_id: formData.restaurant_id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
        }),
        {
          loading: 'Creating manager...',
          success: 'Manager created successfully!',
          error: (error) =>
            `Failed to create manager: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
        }
      );
    }
  };

  const { editingManager, handleCloseModal, formData, setFormData } = props;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {editingManager ? 'Edit Manager' : 'Add Manager'}
          </h2>
          <button
            onClick={handleCloseModal}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  required
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  required
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="restaurant_id">Restaurant</Label>
                <select
                  id="restaurant_id"
                  value={formData.restaurant_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      restaurant_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a restaurant</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              className="border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerModal;
