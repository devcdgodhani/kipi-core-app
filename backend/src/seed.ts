import dotenv from 'dotenv';
import { connectMongoDb } from './db/mongodb';
import { runSeeders } from './db/mongodb/seeders';
import mongoose from 'mongoose';

dotenv.config();

const seed = async () => {
  try {
    const config = {
      connectionUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017/kipi',
      dbName: process.env.DB_NAME || 'kipi',
    };

    console.log('Connecting to MongoDB for seeding...');
    await connectMongoDb(config);
    
    await runSeeders();
    
    console.log('Seeding process finished.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
