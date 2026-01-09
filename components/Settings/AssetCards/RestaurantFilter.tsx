import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Restaurant {
  id: string;
  name: string;
}

interface RestaurantFilterProps {
  restaurants: Restaurant[];
  selectedRestaurantId: string;
  onRestaurantChange: (restaurantId: string) => void;
}

const RestaurantFilter = (props: RestaurantFilterProps) => {
  const { restaurants, selectedRestaurantId, onRestaurantChange } = props;

  return (
    <div>
      <Label className="block text-sm font-medium text-slate-700 mb-2">
        Filter by Restaurant
      </Label>
      <Select value={selectedRestaurantId} onValueChange={onRestaurantChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Restaurants" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Restaurants</SelectItem>
          {restaurants.map((restaurant) => (
            <SelectItem key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RestaurantFilter;
