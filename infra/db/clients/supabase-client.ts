import { createClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { DatabaseClient, Filter, OrderBy } from '../types';

export class SupabaseDatabaseClient implements DatabaseClient {
  private client!: SupabaseClient;

  connect(): void {
    this.client = createClient();
  }

  constructor() {
    this.connect();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyFilters<T extends PostgrestFilterBuilder<any, any, any, any>>(
    query: T,
    filters: Filter[]
  ): T {
    let filteredQuery = query;

    for (const filter of filters) {
      switch (filter.op) {
        case 'eq':
          filteredQuery = filteredQuery.eq(filter.field, filter.value) as T;
          break;
        case 'neq':
          filteredQuery = filteredQuery.neq(filter.field, filter.value) as T;
          break;
        case 'gt':
          filteredQuery = filteredQuery.gt(filter.field, filter.value) as T;
          break;
        case 'gte':
          filteredQuery = filteredQuery.gte(filter.field, filter.value) as T;
          break;
        case 'lt':
          filteredQuery = filteredQuery.lt(filter.field, filter.value) as T;
          break;
        case 'lte':
          filteredQuery = filteredQuery.lte(filter.field, filter.value) as T;
          break;
        case 'like':
          filteredQuery = filteredQuery.like(filter.field, filter.value) as T;
          break;
        case 'ilike':
          filteredQuery = filteredQuery.ilike(filter.field, filter.value) as T;
          break;
        case 'in':
          filteredQuery = filteredQuery.in(filter.field, filter.value) as T;
          break;
        case 'is':
          filteredQuery = filteredQuery.is(filter.field, filter.value) as T;
          break;
        case 'contains':
          filteredQuery = filteredQuery.contains(
            filter.field,
            filter.value
          ) as T;
          break;
        case 'containedBy':
          filteredQuery = filteredQuery.containedBy(
            filter.field,
            filter.value
          ) as T;
          break;
      }
    }

    return filteredQuery;
  }

  async query<T>(table: string, query: string = '*'): Promise<T[]> {
    const { data, error } = await this.client.from(table).select(query);
    if (error) throw new Error(error.message);
    return data as T[];
  }

  async findOne<T>(
    table: string,
    options?: {
      select?: string[];
      filters?: Filter[];
      orderBy?: OrderBy[];
    }
  ): Promise<T> {
    let query = this.client
      .from(table)
      .select(options?.select?.join(',') ?? '*');

    if (options?.filters && options.filters.length > 0) {
      query = this.applyFilters(query, options.filters);
    }

    for (const order of options?.orderBy ?? []) {
      query = query.order(order.field, {
        ascending: order.ascending,
      });
    }

    const { data, error } = await query.single();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Resource not found');
    return data as T;
  }

  async findMany<T>(
    table: string,
    options?: {
      select?: string[];
      filters?: Filter[];
      orderBy?: OrderBy[];
    }
  ): Promise<T[]> {
    let query = this.client
      .from(table)
      .select(options?.select?.join(',') ?? '*');

    if (options?.filters && options.filters.length > 0) {
      query = this.applyFilters(query, options.filters);
    }

    for (const order of options?.orderBy ?? []) {
      query = query.order(order.field, {
        ascending: order.ascending,
      });
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as T[];
  }

  async insertOne<T>(
    table: string,
    options?: {
      filters?: Filter[];
      orderBy?: OrderBy[];
      data: Partial<T>;
      select?: string[];
    }
  ): Promise<T> {
    let query = this.client.from(table).insert(options?.data);

    if (options?.filters && options.filters.length > 0) {
      query = this.applyFilters(query, options.filters);
    }

    for (const order of options?.orderBy ?? []) {
      query = query.order(order.field, {
        ascending: order.ascending,
      });
    }

    const { data: dbData, error } = await query
      .select(options?.select?.join(',') ?? '*')
      .single();
    if (error) {
      throw new Error(error.message);
    }
    if (!dbData) {
      throw new Error('No data returned from insert');
    }
    return dbData as T;
  }

  async insertMany<T>(
    table: string,
    options?: {
      data: Partial<T>[];
      select?: string[];
    }
  ): Promise<T[]> {
    if (!options?.data || options.data.length === 0) {
      throw new Error('Data array is required');
    }

    const { data: dbData, error } = await this.client
      .from(table)
      .insert(options.data)
      .select(options?.select?.join(',') ?? '*');

    if (error) throw new Error(error.message);
    if (!dbData) throw new Error('No data returned from insertMany');
    return dbData as T[];
  }

  async update<T>(
    table: string,
    options?: {
      filters?: Filter[];
      orderBy?: OrderBy[];
      data: Partial<T>;
    }
  ): Promise<T> {
    if (!options?.data) {
      throw new Error('Data is required for update operation');
    }

    let query = this.client.from(table).update(options.data);

    if (options?.filters && options.filters.length > 0) {
      query = this.applyFilters(query, options.filters);
    }

    for (const order of options?.orderBy ?? []) {
      query = query.order(order.field, {
        ascending: order.ascending,
      });
    }

    const { data: dbData, error } = await query.select().single();

    if (error) {
      throw new Error(error.message);
    }

    if (!dbData) {
      throw new Error('No data returned from update');
    }

    return dbData as T;
  }

  async delete(
    table: string,
    options?: {
      select?: string[];
      filters?: Filter[];
      orderBy?: OrderBy[];
    }
  ): Promise<void> {
    let query = this.client.from(table).delete();
    if (options?.filters && options.filters.length > 0) {
      query = this.applyFilters(query, options.filters);
    }
    for (const order of options?.orderBy ?? []) {
      query = query.order(order.field, {
        ascending: order.ascending,
      });
    }
    const { error } = await query;

    if (error) {
      throw new Error(error.message);
    }
  }
}
