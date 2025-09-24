import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger';

class DatabaseConnection {
  private db: sqlite3.Database | null = null;
  private static instance: DatabaseConnection;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<sqlite3.Database> {
    if (this.db) {
      return this.db;
    }

    try {
      const dbPath = process.env.DB_PATH || './data/digiration.db';
      
      // Ensure data directory exists
      const fs = require('fs');
      const path = require('path');
      const dataDir = path.dirname(dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Create database connection
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          logger.error('Failed to connect to database:', err);
          throw err;
        }
      });
      
      // Enable foreign keys
      await this.run('PRAGMA foreign_keys = ON');
      
      // Set journal mode for better performance
      await this.run('PRAGMA journal_mode = WAL');
      
      // Initialize schema
      await this.initializeSchema();
      
      logger.info(`Database connected successfully: ${dbPath}`);
      return this.db;
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  private async initializeSchema(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const schemaPath = join(__dirname, 'schema.sql');
      const schema = readFileSync(schemaPath, 'utf-8');
      
      // Split schema into individual statements
      const statements = schema.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await this.run(statement);
        }
      }
      
      logger.info('Database schema initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database schema:', error);
      throw error;
    }
  }

  public getDatabase(): sqlite3.Database {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  public close(): void {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err);
        } else {
          logger.info('Database connection closed');
        }
      });
      this.db = null;
    }
  }

  // Utility methods for common operations
  public async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    const db = this.getDatabase();
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  public async get(sql: string, params: any[] = []): Promise<any> {
    const db = this.getDatabase();
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  public async all(sql: string, params: any[] = []): Promise<any[]> {
    const db = this.getDatabase();
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Health check
  public async isHealthy(): Promise<boolean> {
    try {
      const result = await this.get('SELECT 1 as health');
      return result && result.health === 1;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const dbConnection = DatabaseConnection.getInstance();
export default dbConnection;