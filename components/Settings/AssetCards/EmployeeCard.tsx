import { Button } from '@/components/ui/button';
import { Employee } from '@/lib/types';
import { Edit, Trash2, Mail, Building2, Coins } from 'lucide-react';

interface EmployeeCardProps {
  employee: Employee;
  handleOpenModal: (employee: Employee) => void;
  handleDelete: (employeeId: string) => void;
}

const EmployeeCard = (props: EmployeeCardProps) => {
  const { employee, handleOpenModal, handleDelete } = props;

  return (
    <div className="p-6">
      <h3 className="font-bold text-xl mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">
        {employee.first_name} {employee.last_name}
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
            <Mail className="h-4 w-4" />
          </div>
          <a
            href={`mailto:${employee.email}`}
            className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            {employee.email}
          </a>
        </div>

        {employee.restaurant_name && (
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {employee.restaurant_name}
              </p>
            </div>
          </div>
        )}

        {employee.hourly_rate > 0 && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Coins className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-600">
              €{employee.hourly_rate.toFixed(2)}/hour
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons - Visible on mobile, hidden on desktop (shown in header on hover) */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenModal(employee)}
          className="flex-1 border-slate-300 hover:bg-slate-50"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDelete(employee.id)}
          className="flex-1 border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default EmployeeCard;
