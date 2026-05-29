import pg from 'pg';
import { envConfig } from '../configs/env.config.js';

const { Pool } = pg;

class BD {
  constructor() {
    this.pool = new Pool({
      connectionString: envConfig.databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async query(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Error ejecutando query:', error.message);
      throw error;
    }
  }

  async queryOne(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows[0] || null;
  }

  async execute(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return result.rowCount;
    } catch (error) {
      console.error('Error ejecutando comando:', error.message);
      throw error;
    }
  }

  async transaction(callback) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async testConnection() {
    const sql = 'SELECT NOW() AS fecha_actual';
    return await this.queryOne(sql);
  }
}

export default new BD();
