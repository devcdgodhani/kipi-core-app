import { AddressModel } from '../../db/mongodb/models/addressModel';
import { IAddressAttributes, IAddressDocument } from '../../interfaces/address';
import { IAddressService } from '../contracts/addressServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class AddressService
  extends MongooseCommonService<IAddressAttributes, IAddressDocument>
  implements IAddressService
{
  constructor() {
    super(AddressModel);
  }
}
