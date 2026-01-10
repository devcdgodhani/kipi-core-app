import { createServer } from 'http';
import app from './server';
import { ENV_VARIABLE } from './configs';
import { connectMongoDb } from './db/mongodb';
import { initWorkers } from './jobs';
import { WhatsAppAccountService } from './services/concrete/whatsAppAccountService';
import { cronJobService } from './services/concrete/cronJobService';
import { PaymentGatewayService } from './services/concrete/paymentGatewayService';
// import { initWhatsAppCronJobs } from './jobs/cron/whatsAppCronJobs';

// ... other imports

const initApp = async () => {
    // ...
    // initWhatsAppCronJobs(); // Initialize WhatsApp cron jobs -> REMOVED
    // ...
}
import { logger } from './configs/logger';
import { Request, Response } from 'express';

const server = createServer(app);

const startServer = (): void => {
  server.listen(ENV_VARIABLE.PORT, async () => {
    await assertDatabaseConnection();
    // Initialize Background Workers
    initWorkers();
    logger.info(`Server running on port ${ENV_VARIABLE.PORT}...`);
  });
};

export const assertDatabaseConnection = async (): Promise<void> => {
  try {
    /***** MongoDB Database Authentication *****/
    await connectMongoDb({
      connectionUrl: ENV_VARIABLE.MONGO_DB_CONNECTION_URL as string,
      dbName: ENV_VARIABLE.MONGO_DB_NAME as string,
    });
    logger.info('MongoDB database connection has been established successfully.');
    
    const whatsAppAccountService = new WhatsAppAccountService();

    // Initialize WhatsApp Accounts
    whatsAppAccountService.initializeAllAccounts();

    /***** Cron Job Initializations *****/
    await cronJobService.init();

    /***** Payment Gateway Seeding *****/
    const paymentGatewayService = new PaymentGatewayService();
    await paymentGatewayService.seedGateways();

    /***** Redis  Authentication *****/
    // logger.info('Redis connection has been established successfully.');
  } catch (err) {
    logger.info(err);
  }
};

(() => {
  startServer();
})();
