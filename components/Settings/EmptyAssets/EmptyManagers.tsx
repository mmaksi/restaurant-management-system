import { Button } from '@/components/ui/button';
import { Shield, Plus } from 'lucide-react';

const EmptyManagers = ({
  handleOpenModal,
}: {
  handleOpenModal: () => void;
}) => {
  return (
    <div className="text-center py-12 text-slate-600">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-green-500 bg-opacity-10 mb-4">
        <Shield className="h-10 w-10 text-green-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        No managers yet
      </h3>
      <p className="mb-4">
        Create your first manager to get started managing your restaurants.
      </p>
      <Button
        onClick={() => handleOpenModal()}
        className="bg-green-500 hover:bg-green-600 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create First Manager
      </Button>
    </div>
  );
};

export default EmptyManagers;
