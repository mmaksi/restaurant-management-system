interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  restaurant_id: string | null;
  banned: boolean;
  created_at: string;
  updated_at: string;
}

export type { UserProfile };
