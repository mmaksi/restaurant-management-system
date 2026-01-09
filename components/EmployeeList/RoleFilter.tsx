import { EMPLOYEE_ROLES } from '@/lib/constants/roles';
import { getRoleBadge } from '@/lib/helpers';
import { Dispatch, SetStateAction } from 'react';

interface RoleFilterProps {
  roleFilter: EMPLOYEE_ROLES;
  setRoleFilter: Dispatch<SetStateAction<EMPLOYEE_ROLES>>;
}

const RoleFilter = (props: RoleFilterProps) => {
  const { roleFilter, setRoleFilter } = props;
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold text-slate-600 mb-2">
        Filter by Role:
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.values(EMPLOYEE_ROLES).map((role: EMPLOYEE_ROLES) => {
          const badge = getRoleBadge(role);
          const Icon = badge.icon;
          const isSelected = roleFilter === role;
          const isAllRole = role === EMPLOYEE_ROLES.ALL;

          return (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center space-x-1 ${
                isSelected
                  ? isAllRole
                    ? 'bg-slate-700 text-white'
                    : `${badge.bg} ${badge.text} border-2 ${badge.border}`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="capitalize">{role.toLowerCase()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleFilter;
