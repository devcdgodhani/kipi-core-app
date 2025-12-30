import { Schema, Types } from 'mongoose';

/**
 * Common base schema fields (timestamps + audit info)
 */
export const defaultAttributes = {
  createdAt: { type: Date, default: null },
  updatedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null },
  createdBy: { type: Types.ObjectId, ref: 'users', required: false },
  updatedBy: { type: Types.ObjectId, ref: 'users', required: false },
  deletedBy: { type: Types.ObjectId, ref: 'users', required: false },
};

/**
 * Mongoose plugin to add common fields to all schemas
 */
export const baseSchemaPlugin = (schema: Schema) => {
  schema.add(defaultAttributes);
};
