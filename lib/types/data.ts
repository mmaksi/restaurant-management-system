import { Database } from '@/lib/types/supabase';

type PublicSchema = Database['public'];

export type Column<
  TTable extends keyof PublicSchema['Tables'],
  TColumn extends keyof PublicSchema['Tables'][TTable]['Row']
> = PublicSchema['Tables'][TTable]['Row'][TColumn];

export type UserRole = Column<'roles', 'name'>;
