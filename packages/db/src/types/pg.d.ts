declare module "pg" {
  export class Pool {
    constructor(config?: { connectionString?: string });
  }

  export class Client {
    constructor(config?: { connectionString?: string });
    connect(): Promise<void>;
    end(): Promise<void>;
    query<T = unknown>(sql: string, values?: unknown[]): Promise<{ rows: T[] }>;
  }
}
