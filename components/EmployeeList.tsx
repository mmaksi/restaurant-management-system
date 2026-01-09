'use client';

import { Employee } from '@/lib/types';
import { EMPLOYEE_ROLES } from '@/lib/constants';
import { useState } from 'react';
import EmployeeCard from '@/components/EmployeeList/EmployeeCard';
import StatusFilter from '@/components/EmployeeList/StatusFilter';
import { SUBMISSION_STATUSES_FILTER } from '@/lib/constants';
import RoleFilter from '@/components/EmployeeList/RoleFilter';

interface EmployeeListProps {
  employees: Employee[];
  selectedEmployees: string[];
  onToggleEmployee: (employeeId: string) => void;
}

export default function EmployeeList({
  employees,
  selectedEmployees,
  onToggleEmployee,
}: EmployeeListProps) {
  const [roleFilter, setRoleFilter] = useState<EMPLOYEE_ROLES>(
    EMPLOYEE_ROLES.ALL
  );
  const [submissionFilter, setSubmissionFilter] =
    useState<SUBMISSION_STATUSES_FILTER>(SUBMISSION_STATUSES_FILTER.ALL);

  // Filter by role and submission status, then sort by priority and availability status
  const filteredAndSortedEmployees = [...employees]
    .filter(
      (emp) => roleFilter === EMPLOYEE_ROLES.ALL || emp.role === roleFilter
    )
    .filter((emp) => {
      if (submissionFilter === SUBMISSION_STATUSES_FILTER.SUBMITTED)
        return emp.availability_submitted;
      if (submissionFilter === SUBMISSION_STATUSES_FILTER.PENDING)
        return !emp.availability_submitted;
      return true;
    })
    .sort((a, b) => {
      if (a.availability_submitted !== b.availability_submitted) {
        return a.availability_submitted ? -1 : 1;
      }
      if (a.role !== b.role) {
        const roleA = a.role || '';
        const roleB = b.role || '';
        return roleA.localeCompare(roleB);
      }
      const priorityA = a.priority ?? 0;
      const priorityB = b.priority ?? 0;
      return priorityB - priorityA;
    });

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Employees</h2>
        <p className="text-sm text-slate-600 mb-3">
          Select to view on calendar
        </p>
        <div className="mb-6 flex flex-col gap-2">
          <RoleFilter roleFilter={roleFilter} setRoleFilter={setRoleFilter} />
          <StatusFilter
            submissionFilter={submissionFilter}
            setSubmissionFilter={setSubmissionFilter}
          />
        </div>
      </div>

      <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto">
        {filteredAndSortedEmployees.map((employee) => {
          return (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onToggleEmployee={onToggleEmployee}
              selectedEmployees={selectedEmployees}
            />
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>
            {selectedEmployees.length} employee
            {selectedEmployees.length !== 1 ? 's' : ''} selected
          </span>
          <span>
            {filteredAndSortedEmployees.length} of {employees.length} shown
          </span>
        </div>
      </div>
    </div>
  );
}
