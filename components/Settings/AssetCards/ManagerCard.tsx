import { Button } from '@/components/ui/button';
import type { Manager } from '@/lib/types';
import { Edit, Trash2, Mail, Building2 } from 'lucide-react';

interface ManagerCardProps {
  manager: Manager;
  handleOpenModal: (manager: Manager) => void;
  handleDelete: (managerId: string) => void;
}

const ManagerCard = (props: ManagerCardProps) => {
  const { manager, handleOpenModal, handleDelete } = props;

  return (
    <div className="p-6">
      <h3 className="font-bold text-xl mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">
        {manager.first_name} {manager.last_name}
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
            <Mail className="h-4 w-4" />
          </div>
          <a
            href={`mailto:${manager.email}`}
            className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            {manager.email}
          </a>
        </div>

        {manager.restaurant_name && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {manager.restaurant_name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Visible on mobile, hidden on desktop (shown in header on hover) */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenModal(manager)}
          className="flex-1 border-slate-300 hover:bg-slate-50"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDelete(manager.id)}
          className="flex-1 border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default ManagerCard;
