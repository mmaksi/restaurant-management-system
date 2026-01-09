export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      employee_weekly_availability: {
        Row: {
          confirmed: boolean | null;
          date: string;
          employee_id: string;
          end_time: string;
          id: string;
          restaurant_id: string;
          start_time: string;
        };
        Insert: {
          confirmed?: boolean | null;
          date: string;
          employee_id: string;
          end_time: string;
          id?: string;
          restaurant_id: string;
          start_time: string;
        };
        Update: {
          confirmed?: boolean | null;
          date?: string;
          employee_id?: string;
          end_time?: string;
          id?: string;
          restaurant_id?: string;
          start_time?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'employee_weekly_availability_employee_fk';
            columns: ['restaurant_id', 'employee_id'];
            isOneToOne: false;
            referencedRelation: 'employee_with_profile_view';
            referencedColumns: ['restaurant_id', 'employee_id'];
          },
          {
            foreignKeyName: 'employee_weekly_availability_employee_fk';
            columns: ['restaurant_id', 'employee_id'];
            isOneToOne: false;
            referencedRelation: 'restaurant_employees';
            referencedColumns: ['restaurant_id', 'employee_id'];
          }
        ];
      };
      employee_work_hours: {
        Row: {
          date: string;
          employee_id: string;
          end_time: string;
          id: string;
          restaurant_id: string;
          start_time: string;
        };
        Insert: {
          date: string;
          employee_id: string;
          end_time: string;
          id?: string;
          restaurant_id: string;
          start_time: string;
        };
        Update: {
          date?: string;
          employee_id?: string;
          end_time?: string;
          id?: string;
          restaurant_id?: string;
          start_time?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'employee_availability_employee_fk';
            columns: ['restaurant_id', 'employee_id'];
            isOneToOne: false;
            referencedRelation: 'employee_with_profile_view';
            referencedColumns: ['restaurant_id', 'employee_id'];
          },
          {
            foreignKeyName: 'employee_availability_employee_fk';
            columns: ['restaurant_id', 'employee_id'];
            isOneToOne: false;
            referencedRelation: 'restaurant_employees';
            referencedColumns: ['restaurant_id', 'employee_id'];
          }
        ];
      };
      profiles: {
        Row: {
          banned: boolean | null;
          created_at: string | null;
          email: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          signup_token: string | null;
          updated_at: string | null;
        };
        Insert: {
          banned?: boolean | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          signup_token?: string | null;
          updated_at?: string | null;
        };
        Update: {
          banned?: boolean | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          signup_token?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      restaurant_admins: {
        Row: {
          admin_id: string | null;
          id: string;
          restaurant_id: string | null;
        };
        Insert: {
          admin_id?: string | null;
          id?: string;
          restaurant_id?: string | null;
        };
        Update: {
          admin_id?: string | null;
          id?: string;
          restaurant_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'restaurant_admins_admin_id_fkey';
            columns: ['admin_id'];
            isOneToOne: false;
            referencedRelation: 'employee_with_profile_view';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_admins_admin_id_fkey';
            columns: ['admin_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_admins_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          }
        ];
      };
      restaurant_employees: {
        Row: {
          availability_submitted: boolean | null;
          date_of_birth: string | null;
          employee_id: string | null;
          employment_type: string | null;
          hourly_rate: number;
          id: string;
          manager_id: string | null;
          max_weekly_hours: number | null;
          overtime_allowed: boolean | null;
          priority: number | null;
          restaurant_id: string | null;
          role: string | null;
        };
        Insert: {
          availability_submitted?: boolean | null;
          date_of_birth?: string | null;
          employee_id?: string | null;
          employment_type?: string | null;
          hourly_rate: number;
          id?: string;
          manager_id?: string | null;
          max_weekly_hours?: number | null;
          overtime_allowed?: boolean | null;
          priority?: number | null;
          restaurant_id?: string | null;
          role?: string | null;
        };
        Update: {
          availability_submitted?: boolean | null;
          date_of_birth?: string | null;
          employee_id?: string | null;
          employment_type?: string | null;
          hourly_rate?: number;
          id?: string;
          manager_id?: string | null;
          max_weekly_hours?: number | null;
          overtime_allowed?: boolean | null;
          priority?: number | null;
          restaurant_id?: string | null;
          role?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'restaurant_employees_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'employee_with_profile_view';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_employees_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_employees_manager_id_fkey';
            columns: ['manager_id'];
            isOneToOne: false;
            referencedRelation: 'employee_with_profile_view';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_employees_manager_id_fkey';
            columns: ['manager_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_employees_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          }
        ];
      };
      restaurant_managers: {
        Row: {
          id: string;
          manager_id: string | null;
          restaurant_id: string | null;
        };
        Insert: {
          id?: string;
          manager_id?: string | null;
          restaurant_id?: string | null;
        };
        Update: {
          id?: string;
          manager_id?: string | null;
          restaurant_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'restaurant_managers_manager_id_fkey';
            columns: ['manager_id'];
            isOneToOne: false;
            referencedRelation: 'employee_with_profile_view';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_managers_manager_id_fkey';
            columns: ['manager_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_managers_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          }
        ];
      };
      restaurants: {
        Row: {
          address: string;
          city: string;
          created_at: string | null;
          id: string;
          name: string;
          phone: string;
          updated_at: string | null;
        };
        Insert: {
          address: string;
          city: string;
          created_at?: string | null;
          id?: string;
          name: string;
          phone: string;
          updated_at?: string | null;
        };
        Update: {
          address?: string;
          city?: string;
          created_at?: string | null;
          id?: string;
          name?: string;
          phone?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: number;
          name: Database['public']['Enums']['user_roles_type'];
        };
        Insert: {
          id: number;
          name: Database['public']['Enums']['user_roles_type'];
        };
        Update: {
          id?: number;
          name?: Database['public']['Enums']['user_roles_type'];
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          role_id: number;
          user_id: string;
        };
        Insert: {
          role_id: number;
          user_id: string;
        };
        Update: {
          role_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_roles_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_roles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'employee_with_profile_view';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_roles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      employee_with_profile_view: {
        Row: {
          availability_submitted: boolean | null;
          date_of_birth: string | null;
          email: string | null;
          employee_id: string | null;
          employment_type: string | null;
          first_name: string | null;
          hourly_rate: number | null;
          id: string | null;
          last_name: string | null;
          manager_id: string | null;
          max_weekly_hours: number | null;
          overtime_allowed: boolean | null;
          priority: number | null;
          restaurant_id: string | null;
          restaurant_name: string | null;
          role: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'restaurant_employees_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'employee_with_profile_view';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_employees_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_employees_manager_id_fkey';
            columns: ['manager_id'];
            isOneToOne: false;
            referencedRelation: 'employee_with_profile_view';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_employees_manager_id_fkey';
            columns: ['manager_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_employees_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_roles_type: 'admin' | 'manager' | 'employee';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
      DefaultSchema['Views'])
  ? (DefaultSchema['Tables'] &
      DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
  ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
  ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      user_roles_type: ['admin', 'manager', 'employee'],
    },
  },
} as const;
