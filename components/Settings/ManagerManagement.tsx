'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import {
  httpDeleteAdminManager,
  httpGetAllAdminManagers,
  httpGetAllAdminRestaurants,
} from '@/infra/db/helpers';
import { createGradientColors } from '@/lib/helpers';
import { toast } from 'sonner';
import { MANAGERS_QUERY_KEY } from '@/lib/constants';
import { Manager } from '@/lib/types';
import EmptyManagers from '@/components/Settings/EmptyAssets/EmptyManagers';
import ManagerHeader from '@/components/Settings/AssetCards/ManagerHeader';
import ManagerModal from '@/components/Settings/AssetModals/ManagerModal';
import ManagerCard from '@/components/Settings/AssetCards/ManagerCard';
import LoadingAssetSkeleton from '@/components/Settings/LoadingAsset';
import RestaurantFilter from '@/components/Settings/AssetCards/RestaurantFilter';
import { useUserId } from '@/hooks/useUserId';

export default function ManagerManagement() {
  const queryClient = useQueryClient();
  const { userId, isLoading: isLoadingUserId } = useUserId();

  const {
    data: managers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: MANAGERS_QUERY_KEY,
    queryFn: async () => {
      if (!userId) throw new Error('User ID is not available');
      return await httpGetAllAdminManagers(userId);
    },
    enabled: !!userId && !isLoadingUserId,
  });

  // Fetch restaurants for filter
  const { data: restaurantsData } = useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is not available');
      const data = await httpGetAllAdminRestaurants(userId);
      return (
        data
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
          ) || []
      );
    },
    enabled: !!userId && !isLoadingUserId,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] =
    useState<string>('all');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    restaurant_id: '',
  });

  const handleOpenModal = (manager?: Manager) => {
    if (manager) {
      setEditingManager(manager);
      setFormData({
        first_name: manager.first_name || '',
        last_name: manager.last_name || '',
        email: manager.email || '',
        restaurant_id: manager.restaurant_id || '',
      });
    } else {
      // Explicitly reset to null for new manager
      setEditingManager(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        restaurant_id: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingManager(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      restaurant_id: '',
    });
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (managerId: string) => httpDeleteAdminManager(managerId),
    onMutate: async (managerId) => {
      await queryClient.cancelQueries({ queryKey: MANAGERS_QUERY_KEY });

      const previousManagers =
        queryClient.getQueryData<Manager[]>(MANAGERS_QUERY_KEY);

      // Optimistically remove
      queryClient.setQueryData<Manager[]>(MANAGERS_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.filter((m) => m.id !== managerId);
      });

      return { previousManagers };
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

  const handleDelete = async (managerId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this manager? This action cannot be undone.'
      )
    )
      return;

    toast.promise(deleteMutation.mutateAsync(managerId), {
      loading: 'Deleting manager...',
      success: 'Manager deleted successfully!',
      error: (error) =>
        `Failed to delete manager: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
    });
  };

  // Filter managers by restaurant
  const filteredManagers = useMemo(() => {
    if (selectedRestaurantId === 'all') {
      return managers;
    }
    return managers.filter(
      (manager) => manager.restaurant_id === selectedRestaurantId
    );
  }, [managers, selectedRestaurantId]);

  return (
    <>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">
            {error instanceof Error ? error.message : 'Failed to load managers'}
          </div>
        )}
        {isLoading || isLoadingUserId ? (
          <LoadingAssetSkeleton />
        ) : managers.length === 0 ? (
          <EmptyManagers handleOpenModal={handleOpenModal} />
        ) : (
          <>
            {/* Filter */}
            {restaurantsData && restaurantsData.length > 0 && (
              <div className="mb-6">
                <RestaurantFilter
                  restaurants={restaurantsData}
                  selectedRestaurantId={selectedRestaurantId}
                  onRestaurantChange={setSelectedRestaurantId}
                />
              </div>
            )}

            {/* Managers Grid */}
            {filteredManagers.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                <p className="text-lg font-medium text-slate-900 mb-2">
                  No managers found
                </p>
                <p className="text-sm text-slate-500">
                  {selectedRestaurantId === 'all'
                    ? 'No managers available'
                    : 'No managers assigned to the selected restaurant'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredManagers.map((manager, index) => {
                  // Generate gradient colors based on index for visual variety
                  const gradient = createGradientColors(index);

                  return (
                    <div
                      key={manager.id}
                      className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <ManagerHeader
                        gradient={gradient}
                        handleOpenModal={() => handleOpenModal(manager)}
                        handleDelete={handleDelete}
                        manager={manager}
                      />
                      <ManagerCard
                        manager={manager}
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
                      Add Manager
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {showModal && (
        <ManagerModal
          editingManager={editingManager}
          handleCloseModal={handleCloseModal}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </>
  );
}
