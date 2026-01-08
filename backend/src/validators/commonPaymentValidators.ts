import { z } from 'zod';
import { validate } from '../helpers/zodValidator';

/**
 * Common Payment Validators
 * Validators for common/public payment endpoints
 */

// Get Enabled Gateways Validator (public endpoint)
const getEnabledGatewaysSchema = z.object({});

export default class CommonPaymentValidators {
  getEnabledGateways = validate(getEnabledGatewaysSchema);
}
