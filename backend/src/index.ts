import { createServer } from 'http';
import app from './server';
import { ENV_VARIABLE } from './configs';
import { connectMongoDb } from './db/mongodb';
import { initWorkers } from './jobs';

const server = createServer(app);

const startServer = (): void => {
  server.listen(ENV_VARIABLE.PORT, async () => {
    await assertDatabaseConnection();
    // Initialize Background Workers
    initWorkers();
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
    
    /***** WhatsApp Initializations *****/
    const { WhatsAppService } = await import('./services/concrete/whatsAppService');
    const whatsAppService = new WhatsAppService();
    await whatsAppService.initializeAllSessions();

    /***** Cron Job Initializations *****/
    const { cronJobService } = await import('./services/concrete/cronJobService');
    await cronJobService.init();

    /***** Payment Gateway Seeding *****/
    const { PaymentGatewayService } = await import('./services/concrete/PaymentGatewayService');
    const paymentGatewayService = new PaymentGatewayService();
    await paymentGatewayService.seedGateways();

    /***** Redis  Authentication *****/
    // console.log('Redis connection has been established successfully.');
  } catch (err) {
    console.log(err);
  }
};

(() => {
  startServer();
})();
