import { createClient } from '@/lib/supabase/client';
import { Restaurant } from '../types/restaurant';
import { Employee } from '@/lib/types';

// Query function to fetch restaurants
export async function fetchRestaurants(): Promise<Restaurant[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: adminRestaurants } = await supabase
    .from('restaurant_admins')
    .select('restaurant_id, restaurants:restaurants(*)')
    .eq('admin_id', user.id);

  const restaurantList =
    adminRestaurants
      ?.map((ar) => {
        const restaurant = ar.restaurants as unknown as Restaurant | null;
        return restaurant ?? null;
      })
      .filter((r): r is Restaurant => r !== null) || [];

  return restaurantList;
}

// Export Employee type
export type { Employee };
