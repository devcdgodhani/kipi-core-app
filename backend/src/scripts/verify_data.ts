
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const verifyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_CONNECTION_URL as string);
    console.log('Connected to MongoDB');

    const attributes = await mongoose.connection.db?.collection('attributes').countDocuments();
    const categories = await mongoose.connection.db?.collection('categories').countDocuments();
    const products = await mongoose.connection.db?.collection('products').countDocuments();

    console.log(`Attributes Count: ${attributes}`);
    console.log(`Categories Count: ${categories}`);
    console.log(`Products Count: ${products}`);
    
    // Check if categories have attributes linked
    const categorySamples = await mongoose.connection.db?.collection('categories').find({ attributes: { $exists: true, $not: { $size: 0 } } }).toArray();
    console.log(`Categories with attributes: ${categorySamples?.length}`);
    if(categorySamples && categorySamples.length > 0) {
        console.log('Sample Category Attributes:', categorySamples[0].attributes);
    }

  } catch (error) {
    console.error('Error verifying data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

verifyData();
