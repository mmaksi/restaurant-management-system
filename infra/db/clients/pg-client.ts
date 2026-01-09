// import { Client } from 'pg';
// import { DatabaseClient } from '.';

// export class PostgresDatabaseClient implements DatabaseClient {
//   private client: Client;

//   constructor(connectionString: string) {
//     this.client = new Client({ connectionString });
//   }

//   async connect(): Promise<void> {
//     await this.client.connect();
//   }

//   async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
//     const result = await this.client.query(sql, params);
//     return result.rows as T[];
//   }

//   async close(): Promise<void> {
//     await this.client.end();
//   }
// }
