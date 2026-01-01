import { ObjectId, Document } from 'mongoose';
import { IDefaultAttributes } from './common';
import { PRODUCT_STATUS } from '../constants/product';
import { IMedia } from './media';


export interface IProductAttributeValue {
    attributeId: ObjectId;
    value: any; 
    label?: string;
}

export interface IProductAttributes extends IDefaultAttributes {
    _id: ObjectId;
    name: string;
    productCode: string;
    slug: string;
    description?: string;
    
    basePrice: number;
    salePrice?: number;
    offerPrice?: number;
    discount?: number;
    currency: string;
    
    media: IMedia[];
    mainImage?: ObjectId;
    
    categoryIds: ObjectId[];
    attributes: IProductAttributeValue[];
    
    status: PRODUCT_STATUS;
    stock: number;
}

export interface IProductDocument extends Omit<IProductAttributes, '_id'>, Document {}
