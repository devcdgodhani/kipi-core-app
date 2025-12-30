import express, { type Request, type Response } from 'express';
import compression from 'compression';
import indexRoutes from './routes';
import path from 'path';
import cors from 'cors';
import { ENV_VARIABLE } from './configs';
import { apiLogger, apiRateLimit, errorConverter, errorHandler } from './middlewares';

const app = express();
// Enable trust proxy
app.set('trust proxy', true);

app.use(cors());
//* Middlewares

app.use(express.json({ limit: '50mb' })); // parse json in request body (allow raw)
app.use(express.urlencoded({ limit: '50mb', extended: true })); // allow x-www-form-urlencoded
app.use(compression());

//  limit repeated requests to public APIs
app.use(apiRateLimit);

app.use(apiLogger);

// Serve static files from the 'public' directory
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'viewPages')); // Folder where templates are stored

// Test rest api
app.get('/', (_req: Request, res: Response) => {
  return res.status(200).send({
    message: `Welcome to Initial API! \n Endpoints available at http://localhost:${ENV_VARIABLE.PORT}/api/v1`,
  });
});

//All V1 Routes
app.use('/api/v1', indexRoutes);

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);
//
export default app;
