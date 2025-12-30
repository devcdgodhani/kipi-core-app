import { createServer } from 'http';
import app from './server';
import { ENV_VARIABLE } from './configs';
import { connectMongoDb } from './db/mongodb';

const server = createServer(app);

const startServer = (): void => {
  server.listen(ENV_VARIABLE.PORT, async () => {
    await assertDatabaseConnection();
    console.log(`Server running on port ${ENV_VARIABLE.PORT}...`);
  });
};

export const assertDatabaseConnection = async (): Promise<void> => {
  try {
    /***** MongoDB Database Authentication *****/
    console.log();
    await connectMongoDb({
      connectionUrl: ENV_VARIABLE.MONGO_DB_CONNECTION_URL as string,
      dbName: ENV_VARIABLE.MONGO_DB_NAME as string,
    });
    console.log('MongoDB database connection has been established successfully.');

    /***** Redis  Authentication *****/
    //await connectRedis();
    // console.log('Redis connection has been established successfully.');
  } catch (err) {
    console.log(err);
  }
};

(() => {
  startServer();
})();
