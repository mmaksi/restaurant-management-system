import { Button } from '@/components/ui/button';
import { formatGermanPhoneNumber } from '@/lib/helpers/data-formatting';
import { Restaurant } from '@/lib/types/restaurant';
import { Calendar, Edit, MapPin, Phone, Trash2 } from 'lucide-react';

interface RestaurantsCardsProps {
  restaurant: Restaurant;
  handleOpenModal: (restaurant: Restaurant) => void;
  handleDelete: (restaurantId: string) => void;
}

const RestaurantsCards = (props: RestaurantsCardsProps) => {
  const { restaurant, handleOpenModal, handleDelete } = props;

  return (
    <div className="p-6">
      <h3 className="font-bold text-xl mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">
        {restaurant.name}
      </h3>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 text-slate-600">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">
              {restaurant.address}
            </p>
            <p className="text-sm text-slate-500">{restaurant.city}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
            <Phone className="h-4 w-4" />
          </div>
          <a
            href={`tel:${restaurant.phone.replace(/[^\d+]/g, '')}`}
            className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            {formatGermanPhoneNumber(restaurant.phone)}
          </a>
        </div>

        {restaurant.created_at && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Calendar className="h-4 w-4" />
            </div>
            <p className="text-xs text-slate-500">
              Added{' '}
              {new Date(restaurant.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons - Visible on mobile, hidden on desktop (shown in header on hover) */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenModal(restaurant)}
          className="flex-1 border-slate-300 hover:bg-slate-50"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDelete(restaurant.id)}
          className="flex-1 border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default RestaurantsCards;
