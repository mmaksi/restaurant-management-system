'use client';

import { ROLE_COLOURS, EMPLOYEE_ROLES } from '@/lib/constants';

export default function CalendarLegends() {
  // Define explicit color mapping to ensure Tailwind includes these classes
  const roleColorMap: Record<EMPLOYEE_ROLES, string> = {
    [EMPLOYEE_ROLES.KITCHEN]: 'bg-orange-500',
    [EMPLOYEE_ROLES.SERVICE]: 'bg-blue-500',
    [EMPLOYEE_ROLES.SECURITY]: 'bg-purple-500',
    [EMPLOYEE_ROLES.ALL]: 'bg-slate-500',
  };

  return (
    <>
      {/* Role Legend */}
      <div className="flex items-center space-x-6 text-sm mb-4">
        <span className="font-medium text-slate-700">Roles:</span>
        {Object.entries(ROLE_COLOURS).map(([role]) => (
          <div key={role} className="flex items-center space-x-2">
            <div
              className={`w-6 h-6 rounded ${
                roleColorMap[role as EMPLOYEE_ROLES]
              }`}
            ></div>
            <span className="text-slate-700 capitalize">
              {role.toLowerCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Status Legend */}
      <div className="flex items-center space-x-6 text-sm">
        <span className="font-medium text-slate-700">Status:</span>
        <div className="flex items-center space-x-2">
          <div className="w-12 h-6 border-2 border-dashed border-blue-400 bg-blue-50 rounded"></div>
          <span className="text-slate-700">Available (claimed)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-12 h-6 bg-blue-500 rounded"></div>
          <span className="text-slate-700">Confirmed shift</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-12 h-6 bg-green-100 hover:bg-green-200 border border-green-300 rounded"></div>
          <span className="text-slate-700">In claimed hours (hover)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-12 h-6 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded"></div>
          <span className="text-slate-700">Outside claimed hours (hover)</span>
        </div>
      </div>
    </>
  );
}
