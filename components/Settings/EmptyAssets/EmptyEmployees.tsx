import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

const EmptyEmployees = ({
  handleOpenModal,
}: {
  handleOpenModal: () => void;
}) => {
  return (
    <div className="text-center py-12 text-slate-600">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-blue-500 bg-opacity-10 mb-4">
        <Users className="h-10 w-10 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        No employees yet
      </h3>
      <p className="mb-4">
        Create your first employee to get started managing your restaurant
        staff.
      </p>
      <Button
        onClick={() => handleOpenModal()}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create First Employee
      </Button>
    </div>
  );
};

export default EmptyEmployees;
