import swaggerJsdoc from 'swagger-jsdoc';
import swaggerDef from '../docs/swaggerDef';

const options = {
  swaggerDefinition: swaggerDef,
  apis: ['src/routes/api/v1/*.ts', 'src/db/mongodb/models/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
