import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EMPLOYEES_QUERY_KEY } from '@/lib/constants';
import { getChangedFields } from '@/lib/helpers';
import {
  httpCreateEmployee,
  httpUpdateEmployee,
  httpGetAllManagerRestaurants,
} from '@/infra/db/helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useUserId } from '@/hooks/useUserId';
import { Employee } from '@/lib/helpers/react-queries';

interface EmployeeModalProps {
  editingEmployee: Employee | null;
  handleCloseModal: () => void;
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    restaurant_id: string;
    hourly_rate: string;
  };
  setFormData: (data: {
    first_name: string;
    last_name: string;
    email: string;
    restaurant_id: string;
    hourly_rate: string;
  }) => void;
}

const EmployeeModal = (props: EmployeeModalProps) => {
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
        const restaurantsData = await httpGetAllManagerRestaurants(userId);
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
      hourly_rate: number;
    }) => {
      if (!userId) throw new Error('User ID is not available');
      const createdEmployee = await httpCreateEmployee(
        userId,
        data.restaurant_id,
        {
          first_name: data.first_name || null,
          last_name: data.last_name || null,
          email: data.email || null,
          hourly_rate: data.hourly_rate,
        }
      );
      return createdEmployee;
    },
    onMutate: async (newEmployee) => {
      await queryClient.cancelQueries({ queryKey: EMPLOYEES_QUERY_KEY });

      const previousEmployees =
        queryClient.getQueryData<Employee[]>(EMPLOYEES_QUERY_KEY);

      // Optimistically add with temp ID
      const tempId = `temp-${Date.now()}`;
      const restaurant = restaurants.find(
        (r) => r.id === newEmployee.restaurant_id
      );
      // TODO replace with Employee
      const optimisticEmployee: unknown = {
        id: tempId,
        first_name: newEmployee.first_name,
        last_name: newEmployee.last_name,
        email: newEmployee.email,
        restaurant_id: newEmployee.restaurant_id,
        restaurant_name: restaurant?.name || null,
        manager_id: null,
        hourly_rate: newEmployee.hourly_rate,
      };

      queryClient.setQueryData<Employee[]>(EMPLOYEES_QUERY_KEY, (old) => {
        if (!old) return [optimisticEmployee as Employee];
        return [optimisticEmployee as Employee, ...old];
      });

      return { previousEmployees, tempId };
    },
    onError: (err, variables, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          EMPLOYEES_QUERY_KEY,
          context.previousEmployees
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
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
        hourly_rate: number;
      };
    }) => {
      if (!userId) throw new Error('User ID is not available');
      await httpUpdateEmployee(userId, id, {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        restaurant_id: data.restaurant_id,
        old_restaurant_id: data.old_restaurant_id,
        hourly_rate: data.hourly_rate,
      });
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: EMPLOYEES_QUERY_KEY });

      // Snapshot previous value
      const previousEmployees =
        queryClient.getQueryData<Employee[]>(EMPLOYEES_QUERY_KEY);

      // Optimistically update
      const restaurant = restaurants.find((r) => r.id === data.restaurant_id);
      queryClient.setQueryData<Employee[]>(EMPLOYEES_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((e) =>
          e.id === id
            ? {
                ...e,
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                restaurant_id: data.restaurant_id,
                restaurant_name: restaurant?.name || null,
                hourly_rate: data.hourly_rate,
              }
            : e
        );
      });

      return { previousEmployees };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          EMPLOYEES_QUERY_KEY,
          context.previousEmployees
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Only treat as update if editingEmployee exists and has an id
    const isUpdate = editingEmployee && editingEmployee.id;

    if (isUpdate) {
      const changedFields = getChangedFields<Employee>(
        editingEmployee,
        // TODO remove as unknown as Partial<Employee>
        formData as unknown as Partial<Employee>
      );
      // Only update if there are changes
      if (Object.keys(changedFields).length === 0) {
        toast.success('No changes detected');
        return;
      }

      handleCloseModal();

      toast.promise(
        updateMutation.mutateAsync({
          id: editingEmployee.id,
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            restaurant_id: formData.restaurant_id || null,
            old_restaurant_id: editingEmployee.restaurant_id || null,
            hourly_rate: parseFloat(formData.hourly_rate) || 0,
          },
        }),
        {
          loading: 'Updating employee...',
          success: 'Employee updated successfully!',
          error: (error) =>
            `Failed to update employee: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
        }
      );
    } else {
      if (!formData.restaurant_id) {
        toast.error('Please select a restaurant for this employee');
        return;
      }

      if (!formData.hourly_rate || parseFloat(formData.hourly_rate) <= 0) {
        toast.error('Please enter a valid hourly rate');
        return;
      }

      handleCloseModal();

      toast.promise(
        createMutation.mutateAsync({
          restaurant_id: formData.restaurant_id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          hourly_rate: parseFloat(formData.hourly_rate),
        }),
        {
          loading: 'Creating employee...',
          success: 'Employee created successfully!',
          error: (error) =>
            `Failed to create employee: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
        }
      );
    }
  };

  const { editingEmployee, handleCloseModal, formData, setFormData } = props;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {editingEmployee ? 'Edit Employee' : 'Add Employee'}
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
                <Label htmlFor="restaurant_id">Restaurant *</Label>
                <select
                  id="restaurant_id"
                  required
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
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="hourly_rate">Hourly Rate ($) *</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.hourly_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, hourly_rate: e.target.value })
                  }
                  placeholder="0.00"
                  className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                />
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

export default EmployeeModal;
