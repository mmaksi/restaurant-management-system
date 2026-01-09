import { ROLE_COLOURS, EMPLOYEE_ROLES } from '@/lib/constants';
import { ConfirmedBlock, Employee } from '@/lib/types';
import { Check, X, Download, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ConfirmedBlocksSummaryProps {
  confirmedBlocks: ConfirmedBlock[];
  getEmployeeById: (employeeId: string) => Employee | undefined;
  removeConfirmedBlock: (blockId: string) => void;
  exportToPDF: () => void;
  nextWeekStart: Date;
  onSave?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

const ConfirmedBlocksSummary = (props: ConfirmedBlocksSummaryProps) => {
  const {
    confirmedBlocks,
    getEmployeeById,
    removeConfirmedBlock,
    exportToPDF,
    nextWeekStart,
    onSave,
    isSaving = false,
    hasChanges = false,
  } = props;

  return (
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
        <Check className="w-5 h-5 mr-2" />
        Confirmed Schedule ({confirmedBlocks.length} shifts)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {confirmedBlocks.map((block) => {
          const employee = getEmployeeById(block.employeeId);
          if (!employee) return null;

          const colors =
            (employee.role && ROLE_COLOURS[employee.role as EMPLOYEE_ROLES]) ||
            ROLE_COLOURS[EMPLOYEE_ROLES.SERVICE];
          const hours =
            parseInt(block.endTime.split(':')[0]) -
            parseInt(block.startTime.split(':')[0]);

          return (
            <div
              key={block.id}
              className={`p-3 ${colors.light} border ${colors.border} rounded-lg flex items-center justify-between`}
            >
              <div>
                <div className={`font-semibold ${colors.text}`}>
                  {employee.first_name && employee.last_name
                    ? `${employee.first_name} ${employee.last_name}`
                    : employee.first_name || employee.last_name || 'Unknown'}
                </div>
                <div className="text-sm text-slate-600">
                  {format(new Date(block.date), 'EEE, MMM d')}
                </div>
                <div className="text-xs text-slate-500">
                  {block.startTime} - {block.endTime} ({hours}h)
                </div>
              </div>
              <button
                onClick={() => removeConfirmedBlock(block.id)}
                className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-green-300 flex gap-3">
        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center space-x-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {isSaving ? 'Saving...' : !hasChanges ? 'Saved' : 'Save Schedule'}
            </span>
          </button>
        )}
        <button
          onClick={exportToPDF}
          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export as PDF</span>
        </button>
        <button
          onClick={() => {
            const data = confirmedBlocks.map((block) => {
              const emp = getEmployeeById(block.employeeId);
              const employeeName = emp
                ? emp.first_name && emp.last_name
                  ? `${emp.first_name} ${emp.last_name}`
                  : emp.first_name || emp.last_name || 'Unknown'
                : 'Unknown';
              return {
                Employee: employeeName,
                Role: emp?.role || 'N/A',
                Date: format(new Date(block.date), 'EEEE, MMM d, yyyy'),
                'Start Time': block.startTime,
                'End Time': block.endTime,
                Hours:
                  parseInt(block.endTime.split(':')[0]) -
                  parseInt(block.startTime.split(':')[0]),
              };
            });

            const csv = [
              Object.keys(data[0] || {}).join(','),
              ...data.map((row) => Object.values(row).join(',')),
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `confirmed-schedule-${format(
              nextWeekStart,
              'yyyy-MM-dd'
            )}.csv`;
            a.click();
          }}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export as CSV</span>
        </button>
      </div>
    </div>
  );
};

export default ConfirmedBlocksSummary;
