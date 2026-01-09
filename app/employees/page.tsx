'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, Users as UsersIcon } from 'lucide-react';
import { Employee } from '@/lib/types';
import EmployeeCard from '@/components/EmployeeCard';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import EditEmployeeModal from '@/components/EditEmployeeModal';
import Header from '@/components/ui/header';
import {
  EMPLOYEE_ROLES,
  EMPLOYMENT_CONTRACT_FILTER,
  EMPLOYEES_QUERY_KEY,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import Main from '@/components/ui/main';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  httpGetAllManagerEmployees,
  httpDeleteEmployee,
  httpCreateEmployee,
  httpUpdateEmployee,
} from '@/infra/db/helpers';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserId } from '@/hooks/useUserId';

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const { userId, isLoading: isLoadingUserId } = useUserId();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<EMPLOYEE_ROLES>(
    EMPLOYEE_ROLES.ALL
  );
  const [employmentFilter, setEmploymentFilter] =
    useState<EMPLOYMENT_CONTRACT_FILTER>(EMPLOYMENT_CONTRACT_FILTER.ALL);

  // Fetch employees using React Query
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      if (!userId) throw new Error('User ID is not available');
      await httpDeleteEmployee(userId, employeeId);
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

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
      const matchesSearch =
        emp.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false ||
        emp.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false ||
        fullName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === EMPLOYEE_ROLES.ALL || emp.role === roleFilter;
      const matchesEmployment =
        employmentFilter === EMPLOYMENT_CONTRACT_FILTER.ALL ||
        emp.employment_type === employmentFilter;

      return matchesSearch && matchesRole && matchesEmployment;
    });
  }, [employees, searchQuery, roleFilter, employmentFilter]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      restaurantId: string;
      employee: Omit<Employee, 'id' | 'availability' | 'restaurant_name'>;
    }) => {
      if (!userId) throw new Error('User ID is not available');
      return await httpCreateEmployee(userId, data.restaurantId, {
        first_name: data.employee.first_name,
        last_name: data.employee.last_name,
        email: data.employee.email,
        hourly_rate: data.employee.hourly_rate || 0,
        date_of_birth: data.employee.date_of_birth,
        role: data.employee.role,
        employment_type: data.employee.employment_type,
        max_weekly_hours: data.employee.max_weekly_hours,
        priority: data.employee.priority,
        overtime_allowed: data.employee.overtime_allowed,
      });
    },
    onMutate: async (newEmployeeData) => {
      await queryClient.cancelQueries({ queryKey: EMPLOYEES_QUERY_KEY });

      const previousEmployees =
        queryClient.getQueryData<Employee[]>(EMPLOYEES_QUERY_KEY);

      // Optimistically add with temp ID
      const tempId = `temp-${Date.now()}`;
      const optimisticEmployee: Employee = {
        ...newEmployeeData.employee,
        id: tempId,
        availability_submitted: false,
        availability: [],
      };

      queryClient.setQueryData<Employee[]>(EMPLOYEES_QUERY_KEY, (old) => {
        if (!old) return [optimisticEmployee];
        return [optimisticEmployee, ...old];
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
    onSuccess: (newEmployee, variables, context) => {
      // Replace the optimistic employee with the real one from the server
      queryClient.setQueryData<Employee[]>(EMPLOYEES_QUERY_KEY, (old) => {
        if (!old) return [newEmployee];
        // Remove the optimistic employee (with temp ID) and add the real one
        const filtered = old.filter((e) => e.id !== context?.tempId);
        return [newEmployee, ...filtered];
      });
      // Refetch to ensure we have the latest data from the server
      queryClient.refetchQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });

  // Add new employee
  const handleAddEmployee = (
    newEmployee: Omit<
      Employee,
      'id' | 'hoursWorkedThisWeek' | 'availabilitySubmitted' | 'availability'
    > & { restaurantId: string }
  ) => {
    const { restaurantId, ...employeeData } = newEmployee;
    toast.promise(
      createMutation.mutateAsync({
        restaurantId,
        employee: employeeData,
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
    setShowAddModal(false);
  };

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { employeeId: string; employee: Employee }) => {
      if (!userId) throw new Error('User ID is not available');
      await httpUpdateEmployee(userId, data.employeeId, {
        first_name: data.employee.first_name,
        last_name: data.employee.last_name,
        date_of_birth: data.employee.date_of_birth,
        role: data.employee.role,
        employment_type: data.employee.employment_type,
        max_weekly_hours: data.employee.max_weekly_hours,
        overtime_allowed: data.employee.overtime_allowed,
        priority: data.employee.priority,
      });
    },
    onMutate: async ({ employeeId, employee }) => {
      await queryClient.cancelQueries({ queryKey: EMPLOYEES_QUERY_KEY });

      const previousEmployees =
        queryClient.getQueryData<Employee[]>(EMPLOYEES_QUERY_KEY);

      // Optimistically update
      queryClient.setQueryData<Employee[]>(EMPLOYEES_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((e) => (e.id === employeeId ? employee : e));
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

  // Update employee
  const handleUpdateEmployee = (employee: Employee) => {
    toast.promise(
      updateMutation.mutateAsync({
        employeeId: employee.id,
        employee,
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
    setEditingEmployee(null);
  };

  // Delete employee
  const handleDeleteEmployee = (employeeId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this employee? This action cannot be undone.'
      )
    ) {
      toast.promise(deleteMutation.mutateAsync(employeeId), {
        loading: 'Deleting employee...',
        success: 'Employee deleted successfully!',
        error: (error) =>
          `Failed to delete employee: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
      });
    }
  };

  // Statistics
  const stats = {
    total: employees.length,
    fullTime: employees.filter((e) => e.employment_type === 'Full-Time').length,
    partTime: employees.filter((e) => e.employment_type === 'Part-Time').length,
    miniJob: employees.filter((e) => e.employment_type === 'Mini-Job').length,
  };

  return (
    <>
      {/* Header */}
      <Header>
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Employee Management
            </h1>
            <p className="text-slate-600 text-sm">
              Add, edit, and manage employee information
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Employee</span>
          </Button>
        </div>
      </Header>

      {/* Main Content */}
      <Main>
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
            {error instanceof Error
              ? error.message
              : 'Failed to load employees'}
          </div>
        )}

        {/* Loading State */}
        {(isLoading || isLoadingUserId) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6">
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Statistics Cards */}
        {!isLoading && !isLoadingUserId && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Employees</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UsersIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Full-Time</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.fullTime}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Part-Time</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.partTime}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Mini-Job</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.miniJob}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        {!isLoading && !isLoadingUserId && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search Employees
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full pl-10 pr-4 py-[0.33rem] border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filter by Role
                </label>
                <Select
                  value={roleFilter}
                  onValueChange={(value) =>
                    setRoleFilter(value as EMPLOYEE_ROLES)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPLOYEE_ROLES.ALL}>
                      All Roles
                    </SelectItem>
                    <SelectItem value={EMPLOYEE_ROLES.KITCHEN}>
                      Kitchen
                    </SelectItem>
                    <SelectItem value={EMPLOYEE_ROLES.SERVICE}>
                      Service
                    </SelectItem>
                    <SelectItem value={EMPLOYEE_ROLES.SECURITY}>
                      Security
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Employment Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filter by Employment Type
                </label>
                <Select
                  value={employmentFilter}
                  onValueChange={(value) =>
                    setEmploymentFilter(value as EMPLOYMENT_CONTRACT_FILTER)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPLOYMENT_CONTRACT_FILTER.ALL}>
                      All Types
                    </SelectItem>
                    <SelectItem value={EMPLOYMENT_CONTRACT_FILTER.FULL_TIME}>
                      Full-Time
                    </SelectItem>
                    <SelectItem value={EMPLOYMENT_CONTRACT_FILTER.PART_TIME}>
                      Part-Time
                    </SelectItem>
                    <SelectItem value={EMPLOYMENT_CONTRACT_FILTER.MINI_JOB}>
                      Mini-Job
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-600">
              Showing {filteredEmployees.length} of {employees.length} employees
            </div>
          </div>
        )}

        {/* Employee List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6">
                <Skeleton className="h-64 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                <UsersIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No employees found</p>
                <p className="text-sm">
                  Try adjusting your filters or add a new employee
                </p>
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onEdit={() => setEditingEmployee(employee)}
                  onDelete={() => handleDeleteEmployee(employee.id)}
                />
              ))
            )}
          </div>
        )}
      </Main>

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddEmployee}
        />
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onUpdate={handleUpdateEmployee}
        />
      )}
    </>
  );
}
