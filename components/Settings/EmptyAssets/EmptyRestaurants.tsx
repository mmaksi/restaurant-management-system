import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';

const EmptyRestaurants = ({
  handleOpenModal,
}: {
  handleOpenModal: () => void;
}) => {
  return (
    <div className="text-center py-12 text-slate-600">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-purple-500 bg-opacity-10 mb-4">
        <Building2 className="h-10 w-10 text-purple-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        No restaurants yet
      </h3>
      <p className="mb-4">
        Create your first restaurant to get started managing your business.
      </p>
      <Button
        onClick={() => handleOpenModal()}
        className="bg-purple-500 hover:bg-purple-600 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create First Restaurant
      </Button>
    </div>
  );
};

export default EmptyRestaurants;
