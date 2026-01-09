'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import {
  httpDeleteAdminRestaurant,
  httpFetchRestaurants,
} from '@/infra/db/helpers';
import { createGradientColors } from '@/lib/helpers';
import { toast } from 'sonner';
import { RESTAURANTS_QUERY_KEY } from '@/lib/constants';
import EmptyRestaurants from '@/components/Settings/EmptyAssets/EmptyRestaurants';
import RestaurantHeader from '@/components/Settings/AssetCards/RestaurantHeader';
import RestaurantModal from '@/components/Settings/AssetModals/RestaurantModal';
import RestaurantsCards from '@/components/Settings/AssetCards/RestaurantsCards';
import LoadingAssetSkeleton from '@/components/Settings/LoadingAsset';
import { useUserId } from '@/hooks/useUserId';
import { Restaurant } from '@/infra/db/types/db';

export default function RestaurantManagement() {
  const queryClient = useQueryClient();
  const { userId, isLoading: isLoadingUserId } = useUserId();

  const {
    data: restaurants = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: RESTAURANTS_QUERY_KEY,
    queryFn: async () => {
      if (!userId) throw new Error('User ID is not available');
      return await httpFetchRestaurants(userId);
    },
    enabled: !!userId && !isLoadingUserId,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
  });

  const handleOpenModal = (restaurant?: Restaurant) => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        address: restaurant.address,
        city: restaurant.city,
        phone: restaurant.phone,
      });
      setEditingRestaurant(restaurant);
    } else {
      // Explicitly reset to null for new restaurant
      setEditingRestaurant(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        phone: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRestaurant(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      phone: '',
    });
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: httpDeleteAdminRestaurant,
    onMutate: async (restaurantId) => {
      await queryClient.cancelQueries({ queryKey: RESTAURANTS_QUERY_KEY });

      const previousRestaurants = queryClient.getQueryData<Restaurant[]>(
        RESTAURANTS_QUERY_KEY
      );

      // Optimistically remove
      queryClient.setQueryData<Restaurant[]>(RESTAURANTS_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.filter((r) => r.id !== restaurantId);
      });

      return { previousRestaurants };
    },
    onError: (err, variables, context) => {
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

  const handleDelete = async (restaurantId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this restaurant? This action cannot be undone.'
      )
    )
      return;

    toast.promise(deleteMutation.mutateAsync(restaurantId), {
      loading: 'Deleting restaurant...',
      success: 'Restaurant deleted successfully!',
      error: (error) =>
        `Failed to delete restaurant: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
    });
  };

  return (
    <>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">
            {error instanceof Error
              ? error.message
              : 'Failed to load restaurants'}
          </div>
        )}
        {isLoading || isLoadingUserId ? (
          <LoadingAssetSkeleton />
        ) : restaurants.length === 0 ? (
          <EmptyRestaurants handleOpenModal={handleOpenModal} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant, index) => {
              // Generate gradient colors based on index for visual variety
              const gradient = createGradientColors(index);

              return (
                <div
                  key={restaurant.id}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <RestaurantHeader
                    gradient={gradient}
                    handleOpenModal={() => handleOpenModal(restaurant)}
                    handleDelete={handleDelete}
                    restaurant={restaurant}
                  />
                  <RestaurantsCards
                    restaurant={restaurant}
                    handleOpenModal={handleOpenModal}
                    handleDelete={handleDelete}
                  />
                </div>
              );
            })}
            <div
              onClick={() => handleOpenModal()}
              className="group hover:bg-blue-100 relative overflow-hidden rounded-2xl bg-blue-50 border-2 border-dashed border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex items-center justify-center min-h-[300px]"
            >
              <div className="text-center">
                <Plus className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-blue-700">
                  Add Restaurant
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {showModal && (
        <RestaurantModal
          editingRestaurant={editingRestaurant}
          handleCloseModal={handleCloseModal}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </>
  );
}
