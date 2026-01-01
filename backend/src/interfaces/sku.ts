import { ObjectId, Document } from 'mongoose';
import { IDefaultAttributes } from './common';
import { SKU_STATUS } from '../constants/sku';
import { IMedia } from './media';


export interface ISkuAttributeValue {
    attributeId: ObjectId;
    value: any;
}

export interface ISkuAttributes extends IDefaultAttributes {
    _id: ObjectId;
    productId: ObjectId;
    skuCode: string;
    
    variantAttributes: ISkuAttributeValue[];
    
    // Optional overrides
    basePrice?: number;
    salePrice?: number;
    offerPrice?: number;
    discount?: number;
    
    quantity: number;
    media?: IMedia[];
    
    status: SKU_STATUS;
    lotId?: ObjectId;
}

export interface ISkuDocument extends Omit<ISkuAttributes, '_id'>, Document {}
