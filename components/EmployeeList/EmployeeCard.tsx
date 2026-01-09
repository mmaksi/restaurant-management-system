import { Employee } from '@/lib/types';
import { getRemainingHours, getRoleBadge } from '@/lib/helpers';
import { AlertCircle, CheckCircle, Star } from 'lucide-react';
import { EMPLOYMENT_CONTRACT_FILTER, EMPLOYEE_ROLES } from '@/lib/constants';

interface EmployeeCardProps {
  employee: Employee;
  onToggleEmployee: (employeeId: string) => void;
  selectedEmployees: string[];
}

const EmployeeCard = (props: EmployeeCardProps) => {
  const { onToggleEmployee, employee, selectedEmployees } = props;

  const roleBadge = getRoleBadge(
    (employee.role as EMPLOYEE_ROLES) || EMPLOYEE_ROLES.SERVICE
  );

  const getEmploymentTypeBadge = (type: EMPLOYMENT_CONTRACT_FILTER) => {
    const styles: Record<string, string> = {
      [EMPLOYMENT_CONTRACT_FILTER.FULL_TIME]:
        'bg-blue-100 text-blue-700 border-blue-200',
      [EMPLOYMENT_CONTRACT_FILTER.PART_TIME]:
        'bg-green-100 text-green-700 border-green-200',
      [EMPLOYMENT_CONTRACT_FILTER.MINI_JOB]:
        'bg-purple-100 text-purple-700 border-purple-200',
    };
    return styles[type] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const RoleIcon = roleBadge.icon;
  const isSelected = selectedEmployees.includes(employee.id);
  const remainingHours = getRemainingHours(employee);
  const canWorkMore = remainingHours > 0;

  return (
    <button
      key={employee.id}
      onClick={() => onToggleEmployee(employee.id)}
      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-slate-900 text-sm">
              {employee.first_name && employee.last_name
                ? `${employee.first_name} ${employee.last_name}`
                : employee.first_name || employee.last_name || 'Unknown'}
            </h3>
            {employee.availability_submitted ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-500" />
            )}
          </div>

          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs text-slate-600 font-medium">
              Priority: {employee.priority ?? 'N/A'}/10
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <div
          className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
        >
          <RoleIcon className="w-3 h-3" />
          <span className="capitalize">{employee.role || 'N/A'}</span>
        </div>

        {employee.employment_type && (
          <div
            className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getEmploymentTypeBadge(
              employee.employment_type as EMPLOYMENT_CONTRACT_FILTER
            )}`}
          >
            {employee.employment_type}
          </div>
        )}
      </div>

      {employee.max_weekly_hours && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Max hours/week:</span>
            <span className="font-medium text-slate-900">
              {employee.max_weekly_hours}h
            </span>
          </div>
        </div>
      )}

      {canWorkMore && remainingHours > 0 ? (
        <p className="text-xs text-green-600 font-medium mt-2">
          {remainingHours}h available
        </p>
      ) : employee.max_weekly_hours ? (
        <p className="text-xs text-slate-600 font-medium mt-2">
          Max: {employee.max_weekly_hours}h/week
        </p>
      ) : null}

      {!employee.availability_submitted && (
        <div className="mt-2 pt-2 border-t border-slate-200">
          <p className="text-xs text-orange-600 font-medium">
            ⚠️ Availability not submitted
          </p>
        </div>
      )}
    </button>
  );
};

export default EmployeeCard;
