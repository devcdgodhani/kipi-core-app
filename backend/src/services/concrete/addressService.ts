import { AddressModel } from '../../db/mongodb/models/addressModel';
import { IAddressAttributes, IAddressDocument } from '../../interfaces';
import { IAddressService } from '../contracts/addressServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class AddressService
  extends MongooseCommonService<IAddressAttributes, IAddressDocument>
  implements IAddressService
{
  constructor() {
    super(AddressModel as any);
  }
}

export const addressService = new AddressService();
