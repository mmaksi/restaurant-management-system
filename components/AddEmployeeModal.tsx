'use client';

import { useState, useEffect } from 'react';
import { EMPLOYEE_ROLES, EMPLOYMENT_CONTRACT_FILTER } from '@/lib/constants';
import { Employee } from '@/lib/types';
import { X } from 'lucide-react';
import { httpGetAllManagerRestaurants } from '@/infra/db/helpers';
import { useUserId } from '@/hooks/useUserId';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
}

interface AddEmployeeModalProps {
  onClose: () => void;
  onAdd: (
    employee: Omit<
      Employee,
      'id' | 'hoursWorkedThisWeek' | 'availabilitySubmitted' | 'availability'
    > & { restaurantId: string }
  ) => void;
}

export default function AddEmployeeModal({
  onClose,
  onAdd,
}: AddEmployeeModalProps) {
  const { userId, isLoading: isLoadingUserId } = useUserId();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [formData, setFormData] = useState({
    restaurantId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    role: EMPLOYEE_ROLES.SERVICE,
    employmentType: EMPLOYMENT_CONTRACT_FILTER.FULL_TIME,
    maxWeeklyHours: 40,
    overtimeAllowed: false,
    priority: 5,
    hoursWorkedThisWeek: 0,
    availabilitySubmitted: false,
    availability: [],
    id: '',
  });

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
                restaurants?: Restaurant | null;
              }) => {
                const restaurant = ar.restaurants as
                  | Restaurant
                  | null
                  | undefined;
                return restaurant;
              }
            )
            .filter((r): r is Restaurant => r !== null && r !== undefined) ||
          [];
        setRestaurants(restaurantList);
        if (restaurantList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            restaurantId: restaurantList[0].id,
          }));
        }
      } catch (error) {
        console.error('Error loading restaurants:', error);
      }
    };
    loadRestaurants();
  }, [userId, isLoadingUserId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.restaurantId) {
      alert('Please select a restaurant');
      return;
    }

    // Transform to snake_case to match Employee type and database schema
    // Note: Fields like employee_id, manager_id, restaurant_id, availability_submitted
    // are set by the backend during creation, so we don't include them here
    const employee = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: null, // Email can be set later or left null
      date_of_birth: formData.dateOfBirth || null,
      role: formData.role,
      employment_type: formData.employmentType,
      max_weekly_hours: formData.maxWeeklyHours,
      overtime_allowed: formData.overtimeAllowed,
      priority: formData.priority ?? null,
      hourly_rate: 0, // Default hourly rate, can be updated later
      // These fields are set by backend but required by type
      employee_id: null,
      manager_id: null,
      restaurant_id: null,
      availability_submitted: false,
      restaurantId: formData.restaurantId,
    } as Omit<
      Employee,
      'id' | 'hoursWorkedThisWeek' | 'availabilitySubmitted' | 'availability'
    > & { restaurantId: string };

    onAdd(employee);
  };

  const handleEmploymentTypeChange = (type: EMPLOYMENT_CONTRACT_FILTER) => {
    let maxHours = 40;
    if (type === EMPLOYMENT_CONTRACT_FILTER.PART_TIME) maxHours = 25;
    if (type === EMPLOYMENT_CONTRACT_FILTER.MINI_JOB) maxHours = 10;

    setFormData({
      ...formData,
      employmentType: type,
      maxWeeklyHours: maxHours,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            Add New Employee
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Restaurant Selection */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Restaurant Assignment
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Restaurant <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.restaurantId}
                    onChange={(e) =>
                      setFormData({ ...formData, restaurantId: e.target.value })
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

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Doe"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Employment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as EMPLOYEE_ROLES,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={EMPLOYEE_ROLES.KITCHEN}>Kitchen</option>
                    <option value={EMPLOYEE_ROLES.SERVICE}>Service</option>
                    <option value={EMPLOYEE_ROLES.SECURITY}>Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Employment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.employmentType}
                    onChange={(e) =>
                      handleEmploymentTypeChange(
                        e.target.value as EMPLOYMENT_CONTRACT_FILTER
                      )
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={EMPLOYMENT_CONTRACT_FILTER.FULL_TIME}>
                      Full-Time
                    </option>
                    <option value={EMPLOYMENT_CONTRACT_FILTER.PART_TIME}>
                      Part-Time
                    </option>
                    <option value={EMPLOYMENT_CONTRACT_FILTER.MINI_JOB}>
                      Mini-Job
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Weekly Hours <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="60"
                    value={formData.maxWeeklyHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxWeeklyHours: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Typical: Full-time (40h), Part-time (25h), Mini-job (10h)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority (Productivity Rate)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    0-10 scale (10 = highest priority)
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.overtimeAllowed}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          overtimeAllowed: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Allow Overtime Work Hours
                    </span>
                  </label>
                  <p className="text-xs text-slate-500 mt-1 ml-8">
                    If checked, employee can work beyond their max weekly hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
