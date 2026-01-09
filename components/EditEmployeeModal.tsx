'use client';

import { useState } from 'react';
import { Employee } from '@/lib/types';
import { X } from 'lucide-react';
import { EMPLOYEE_ROLES, EMPLOYMENT_CONTRACT_FILTER } from '@/lib/constants';

interface EditEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onUpdate: (employee: Employee) => void;
}

export default function EditEmployeeModal({
  employee,
  onClose,
  onUpdate,
}: EditEmployeeModalProps) {
  const [formData, setFormData] = useState({
    firstName: employee.first_name || '',
    lastName: employee.last_name || '',
    dateOfBirth: employee.date_of_birth || '',
    role: employee.role || '',
    employmentType: employee.employment_type || '',
    maxWeeklyHours: employee.max_weekly_hours ?? '',
    overtimeAllowed: employee.overtime_allowed ?? false,
    priority: employee.priority ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedEmployee: Employee = {
      ...employee,
      first_name: formData.firstName,
      last_name: formData.lastName,
      date_of_birth: formData.dateOfBirth,
      role: formData.role || null,
      employment_type: formData.employmentType || null,
      max_weekly_hours:
        formData.maxWeeklyHours === '' ? null : Number(formData.maxWeeklyHours),
      overtime_allowed: formData.overtimeAllowed,
      priority: formData.priority === '' ? null : Number(formData.priority),
    };

    onUpdate(updatedEmployee);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Edit Employee</h2>
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
                    value={formData.role || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as EMPLOYEE_ROLES,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a role</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Service">Service</option>
                    <option value="Security">Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Employment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.employmentType || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employmentType: e.target
                          .value as EMPLOYMENT_CONTRACT_FILTER,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select employment type</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Mini-Job">Mini-Job</option>
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
                    value={
                      formData.maxWeeklyHours === ''
                        ? ''
                        : formData.maxWeeklyHours
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxWeeklyHours:
                          e.target.value === ''
                            ? ''
                            : parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority (Productivity Rate)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.priority === '' ? '' : formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority:
                          e.target.value === ''
                            ? ''
                            : parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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
                </div>
              </div>
            </div>

            {/* Current Status (Read-only info) */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Current Status
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Max Weekly Hours:</span>
                  <span className="ml-2 font-semibold">
                    {employee.max_weekly_hours ?? 'N/A'}h
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Availability:</span>
                  <span className="ml-2 font-semibold">
                    {employee.availability_submitted
                      ? '✓ Submitted'
                      : '⚠️ Pending'}
                  </span>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
