import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RESTAURANTS_QUERY_KEY } from '@/lib/constants';
import { getChangedFields } from '@/lib/helpers';
import {
  httpCreateAdminRestaurant,
  httpUpdateAdminRestaurant,
} from '@/infra/db/helpers';
import { Restaurant } from '@/infra/db/types/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useUserId } from '@/hooks/useUserId';

interface RestaurantModalProps {
  editingRestaurant: Restaurant | null;
  handleCloseModal: () => void;
  formData: {
    name: string;
    address: string;
    city: string;
    phone: string;
  };
  setFormData: (data: {
    name: string;
    address: string;
    city: string;
    phone: string;
  }) => void;
}

const RestaurantModal = (props: RestaurantModalProps) => {
  const queryClient = useQueryClient();
  const { userId } = useUserId();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      address: string;
      city: string;
      phone: string;
    }) => {
      if (!userId) throw new Error('User ID is not available');
      const createdRestaurant = await httpCreateAdminRestaurant(userId, data);
      return createdRestaurant;
    },
    onMutate: async (newRestaurant) => {
      await queryClient.cancelQueries({ queryKey: RESTAURANTS_QUERY_KEY });

      const previousRestaurants = queryClient.getQueryData<Restaurant[]>(
        RESTAURANTS_QUERY_KEY
      );

      // Optimistically add with temp ID
      const tempId = `temp-${Date.now()}`;
      const now = new Date().toISOString();
      const optimisticRestaurant: Restaurant = {
        id: tempId,
        ...newRestaurant,
        created_at: now,
        updated_at: now,
      };

      queryClient.setQueryData<Restaurant[]>(RESTAURANTS_QUERY_KEY, (old) => {
        if (!old) return [optimisticRestaurant];
        return [optimisticRestaurant, ...old];
      });

      return { previousRestaurants, tempId };
    },
    onError: (err, variables, context) => {
      if (context?.previousRestaurants) {
        queryClient.setQueryData(
          RESTAURANTS_QUERY_KEY,
          context.previousRestaurants
        );
      }
    },
    onSuccess: (data, variables, context) => {
      // Replace temp restaurant with real one
      const restaurant: Restaurant = {
        id: data.id || '',
        name: data.name || '',
        address: data.address || '',
        city: data.city || '',
        phone: data.phone || '',
        created_at: data.created_at || null,
        updated_at: data.updated_at || null,
      };
      queryClient.setQueryData<Restaurant[]>(RESTAURANTS_QUERY_KEY, (old) => {
        if (!old) return [restaurant];
        return old.map((r) => (r.id === context?.tempId ? restaurant : r));
      });
      queryClient.invalidateQueries({ queryKey: RESTAURANTS_QUERY_KEY });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>>;
    }) => {
      const updatedRestaurant = await httpUpdateAdminRestaurant(id, data);
      return updatedRestaurant;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: RESTAURANTS_QUERY_KEY });

      // Snapshot previous value
      const previousRestaurants = queryClient.getQueryData<Restaurant[]>(
        RESTAURANTS_QUERY_KEY
      );

      // Optimistically update
      queryClient.setQueryData<Restaurant[]>(RESTAURANTS_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((r) =>
          r.id === id
            ? { ...r, ...data, updated_at: new Date().toISOString() }
            : r
        );
      });

      return { previousRestaurants };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousRestaurants) {
        queryClient.setQueryData(
          RESTAURANTS_QUERY_KEY,
          context.previousRestaurants
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESTAURANTS_QUERY_KEY });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRestaurant) {
      const changedFields = getChangedFields<Restaurant>(
        editingRestaurant,
        formData
      );
      // Only update if there are changes
      if (Object.keys(changedFields).length === 0) {
        toast.success('No changes detected');
        return;
      }

      handleCloseModal();

      toast.promise(
        updateMutation.mutateAsync({
          id: editingRestaurant.id,
          data: changedFields,
        }),
        {
          loading: 'Updating restaurant...',
          success: 'Restaurant updated successfully!',
          error: (error) =>
            `Failed to update restaurant: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
        }
      );
    } else {
      handleCloseModal();

      toast.promise(
        createMutation.mutateAsync({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
        }),
        {
          loading: 'Creating restaurant...',
          success: 'Restaurant created successfully!',
          error: (error) =>
            `Failed to create restaurant: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
        }
      );
    }
  };

  const { editingRestaurant, handleCloseModal, formData, setFormData } = props;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {editingRestaurant ? 'Edit Restaurant' : 'Add Restaurant'}
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
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Restaurant Name"
                className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="123 Main Street"
                className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="New York"
                className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 (555) 123-4567"
                className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              />
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

export default RestaurantModal;
