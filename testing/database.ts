import DatabaseManager from './databaseManager';

const database = DatabaseManager(':memory:');

export { DatabaseManager, database }