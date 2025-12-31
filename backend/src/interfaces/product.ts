import { ObjectId, Document } from 'mongoose';
import { IDefaultAttributes } from './common';
import { PRODUCT_STATUS } from '../constants/product';

export interface IProductAttributeValue {
    attributeId: ObjectId;
    value: any; 
    label?: string;
}

export interface IProductAttributes extends IDefaultAttributes {
    _id: ObjectId;
    name: string;
    slug: string;
    description?: string;
    
    basePrice: number;
    salePrice?: number;
    discount?: number;
    currency: string;
    
    images: string[];
    mainImage?: string;
    
    categoryIds: ObjectId[];
    attributes: IProductAttributeValue[];
    
    status: PRODUCT_STATUS;
    stock: number;
}

export interface IProductDocument extends Omit<IProductAttributes, '_id'>, Document {}
