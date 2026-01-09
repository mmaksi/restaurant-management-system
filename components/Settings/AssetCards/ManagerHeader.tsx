import { Button } from '@/components/ui/button';
import { Shield, Edit, Trash2 } from 'lucide-react';

type Manager = {
  restaurant_id: string | null;
  restaurant_name: string | null;
  banned: boolean | null;
  created_at: string | null;
  email: string | null;
  first_name: string | null;
  id: string;
  last_name: string | null;
  signup_token: string | null;
  updated_at: string | null;
  user_id: string | null;
};

interface ManagerHeaderProps {
  gradient: string;
  handleOpenModal: (manager: Manager) => void;
  handleDelete: (managerId: string) => void;
  manager: Manager;
}

const ManagerHeader = (props: ManagerHeaderProps) => {
  const { gradient, handleOpenModal, handleDelete, manager } = props;

  return (
    <div className={`h-24 bg-gradient-to-br ${gradient} relative`}>
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-4 left-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
          <Shield className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="absolute top-4 right-4">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(manager)}
            className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
          >
            <Edit color="white" className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(manager.id)}
            className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
          >
            <Trash2 color="white" className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManagerHeader;
