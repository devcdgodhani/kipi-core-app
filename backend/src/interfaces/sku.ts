import { ObjectId, Document } from 'mongoose';
import { IDefaultAttributes } from './common';
import { SKU_STATUS } from '../constants/sku';

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
    price?: number;
    salePrice?: number;
    
    quantity: number;
    images?: string[];
    
    status: SKU_STATUS;
    lotId?: ObjectId;
}

export interface ISkuDocument extends Omit<ISkuAttributes, '_id'>, Document {}
