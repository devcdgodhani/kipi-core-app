import { Schema, model } from 'mongoose';
import { ISearchQueryDocument } from '../../../interfaces/searchQuery';
import { SEARCH_QUERY_STATUS } from '../../../constants';

const searchQuerySchema = new Schema<ISearchQueryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', index: true },
    query: { type: String, required: true, index: true },
    resultCount: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: Object.values(SEARCH_QUERY_STATUS), 
      default: SEARCH_QUERY_STATUS.ACTIVE 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

searchQuerySchema.index({ query: 1, createdAt: -1 });
searchQuerySchema.index({ createdAt: -1 });

export const SearchQueryModel = model<ISearchQueryDocument>('SearchQuery', searchQuerySchema);
