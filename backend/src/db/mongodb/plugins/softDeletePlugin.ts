/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, Query, Aggregate } from 'mongoose';

/**
 * Mongoose plugin for soft-delete functionality
 */
export const softDeletePlugin = (schema: Schema) => {
  // Filter out deleted documents in find queries
  const queryHooks = ['find', 'findOne', 'findOneAndUpdate', 'count', 'countDocuments'];
  
  queryHooks.forEach((hook) => {
    schema.pre(hook as any, function (this: Query<any, any>, next) {
      const query = this.getQuery();
      if (query.deletedAt === undefined) {
        this.where({ deletedAt: null });
      }
      next();
    });
  });

  // Filter out deleted documents in aggregations
  schema.pre('aggregate', function (this: Aggregate<any>, next) {
    const pipeline = this.pipeline();
    const firstStage = (pipeline as any)[0];
    
    if (firstStage && firstStage.$match) {
      if (firstStage.$match.deletedAt === undefined) {
        firstStage.$match.deletedAt = null;
      }
    } else {
      pipeline.unshift({ $match: { deletedAt: null } } as any);
    }
    next();
  });

};
