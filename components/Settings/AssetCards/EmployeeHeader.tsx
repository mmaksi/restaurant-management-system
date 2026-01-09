import { Button } from '@/components/ui/button';
import { Employee } from '@/lib/types';
import { Users, Edit, Trash2 } from 'lucide-react';

interface EmployeeHeaderProps {
  gradient: string;
  handleOpenModal: (employee: Employee) => void;
  handleDelete: (employeeId: string) => void;
  employee: Employee;
}

const EmployeeHeader = (props: EmployeeHeaderProps) => {
  const { gradient, handleOpenModal, handleDelete, employee } = props;

  return (
    <div className={`h-24 bg-gradient-to-br ${gradient} relative`}>
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-4 left-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
          <Users className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="absolute top-4 right-4">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(employee)}
            className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
          >
            <Edit color="white" className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(employee.id)}
            className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
          >
            <Trash2 color="white" className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHeader;
