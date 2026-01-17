export type RestaurantType =
  | 'fine-dining'
  | 'casual'
  | 'cafe'
  | 'fast-food'
  | (string & {});

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  type?: RestaurantType | null;
  created_at: string | null;
  updated_at: string | null;
}

