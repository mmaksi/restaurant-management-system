'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import {
  httpDeleteEmployee,
  httpGetAllManagerEmployees,
  httpGetAllManagerRestaurants,
} from '@/infra/db/helpers';
import { createGradientColors } from '@/lib/helpers';
import { toast } from 'sonner';
import { EMPLOYEES_QUERY_KEY } from '@/lib/constants';
import { Employee } from '@/lib/helpers/react-queries';
import EmptyEmployees from '@/components/Settings/EmptyAssets/EmptyEmployees';
import EmployeeHeader from '@/components/Settings/AssetCards/EmployeeHeader';
import EmployeeModal from '@/components/Settings/AssetModals/EmployeeModal';
import EmployeeCard from '@/components/Settings/AssetCards/EmployeeCard';
import LoadingAssetSkeleton from '@/components/Settings/LoadingAsset';
import RestaurantFilter from '@/components/Settings/AssetCards/RestaurantFilter';
import { useUserId } from '@/hooks/useUserId';

export default function EmployeeManagement() {
  const queryClient = useQueryClient();
  const { userId, isLoading: isLoadingUserId } = useUserId();

  const {
    data: employees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: async () => {
      if (!userId) throw new Error('User ID is not available');
      return await httpGetAllManagerEmployees(userId);
    },
    enabled: !!userId && !isLoadingUserId,
  });

  // Fetch restaurants for filter
  const { data: restaurantsData } = useQuery({
    queryKey: ['manager-restaurants'],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is not available');
      const data = await httpGetAllManagerRestaurants(userId);
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
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] =
    useState<string>('all');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    restaurant_id: '',
    hourly_rate: '',
  });

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        restaurant_id: employee.restaurant_id || '',
        hourly_rate: employee.hourly_rate.toString() || '0',
      });
    } else {
      // Explicitly reset to null for new employee
      setEditingEmployee(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        restaurant_id: '',
        hourly_rate: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      restaurant_id: '',
      hourly_rate: '',
    });
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (employeeId: string) => {
      if (!userId) throw new Error('User ID is not available');
      return httpDeleteEmployee(userId, employeeId);
    },
    onMutate: async (employeeId) => {
      await queryClient.cancelQueries({ queryKey: EMPLOYEES_QUERY_KEY });

      const previousEmployees =
        queryClient.getQueryData<Employee[]>(EMPLOYEES_QUERY_KEY);

      // Optimistically remove
      queryClient.setQueryData<Employee[]>(EMPLOYEES_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.filter((e) => e.id !== employeeId);
      });

      return { previousEmployees };
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

  const handleDelete = async (employeeId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this employee? This action cannot be undone.'
      )
    )
      return;

    toast.promise(deleteMutation.mutateAsync(employeeId), {
      loading: 'Deleting employee...',
      success: 'Employee deleted successfully!',
      error: (error) =>
        `Failed to delete employee: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
    });
  };

  // Filter employees by restaurant
  const filteredEmployees = useMemo(() => {
    if (selectedRestaurantId === 'all') {
      return employees;
    }
    return employees.filter(
      (employee) =>
        (employee as Employee & { restaurant_id?: string | null })
          ?.restaurant_id === selectedRestaurantId
    );
  }, [employees, selectedRestaurantId]);

  return (
    <>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">
            {error instanceof Error
              ? error.message
              : 'Failed to load employees'}
          </div>
        )}
        {isLoading || isLoadingUserId ? (
          <LoadingAssetSkeleton />
        ) : employees.length === 0 ? (
          <EmptyEmployees handleOpenModal={handleOpenModal} />
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

            {/* Employees Grid */}
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                <p className="text-lg font-medium text-slate-900 mb-2">
                  No employees found
                </p>
                <p className="text-sm text-slate-500">
                  {selectedRestaurantId === 'all'
                    ? 'No employees available'
                    : 'No employees assigned to the selected restaurant'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map((employee, index) => {
                  // Generate gradient colors based on index for visual variety
                  const gradient = createGradientColors(index);

                  return (
                    <div
                      key={employee.id}
                      className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <EmployeeHeader
                        gradient={gradient}
                        handleOpenModal={() => handleOpenModal(employee)}
                        handleDelete={handleDelete}
                        employee={employee}
                      />
                      <EmployeeCard
                        employee={employee}
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
                      Add Employee
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {showModal && (
        <EmployeeModal
          editingEmployee={editingEmployee}
          handleCloseModal={handleCloseModal}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </>
  );
}
