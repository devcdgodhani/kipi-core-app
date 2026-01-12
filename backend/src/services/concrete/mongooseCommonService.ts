/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  Model as MongooseModel,
  PopulateOptions,
  MongooseUpdateQueryOptions,
  UpdateWriteOpResult,
  ClientSession,
  CreateOptions,
  PipelineStage,
  ProjectionType,
  DeleteResult,
  ObjectId,
  Document,
} from 'mongoose';
import { IMongooseCommonService } from '../contracts/mongooseCommonServiceInterface';
import { IPaginationData } from '../../interfaces';
import { Schema, Types, isValidObjectId } from 'mongoose';

export class MongooseCommonService<T, TDoc extends Document>
  implements IMongooseCommonService<T, TDoc>
{
  protected model: MongooseModel<TDoc>;
  protected schema: Schema;

  constructor(model: MongooseModel<TDoc>) {
    this.model = model;
    this.schema = model.schema;
  }

  //const filter = userFilterService.generateFilter({
  //   searchFields: ['firstName', 'lastName', 'email'],
  //   filters: {
  //     search: 'john',
  //     status: ['active', 'pending'],
  //     age: { from: 25, to: 35 },
  //     createdAt: { gt: '2024-01-01' },
  //     isVerified: true,
  //   },
  // })

  generateFilter(options: {
    filters?: Record<string, any>;
    searchFields?: (keyof T)[];
  }): { filter: FilterQuery<T>; options: QueryOptions } {
    const { filters = {}, searchFields = [] } = options;

    const filter: Record<string, any> = {};
    const schemaPaths = this.schema.paths;
    const filterOptions: QueryOptions = {};

    // 🔍 Handle search keyword (from filters.search)
    if (filters.search && searchFields.length > 0) {
      const search = filters.search;
      filter['$or'] = (searchFields as string[]).map((field) => ({
        [field === 'id' ? '_id' : field]: { $regex: search, $options: 'i' },
      }));
    }

    // 🎯 Handle other filters
    for (const [field, value] of Object.entries(filters)) {
      if (['page', 'limit', 'isPaginate', 'search', 'order', 'sort', 'isTree', 'populate'].includes(field)) continue;
      const actualField = (field === 'id' || field === '_id') ? '_id' : field;
      const schemaType = schemaPaths[actualField];
      if (!schemaType || value === undefined || value === null || value === '') continue;

      const fieldType = schemaType.instance;

      switch (fieldType) {
        case 'String':
          if (Array.isArray(value)) {
            filter[actualField] = { $in: value };
          } else {
            filter[actualField] = { $regex: value, $options: 'i' };
          }
          break;

        case 'Number': {
          if (typeof value === 'number' || !isNaN(Number(value))) {
            filter[actualField] = Number(value);
          } else if (Array.isArray(value)) {
            filter[actualField] = { $in: value.map(Number) };
          } else if (typeof value === 'object') {
            const range: Record<string, number> = {};
            if (value.from !== undefined) range.$gte = Number(value.from);
            if (value.to !== undefined) range.$lte = Number(value.to);
            if (value.lt !== undefined) range.$lt = Number(value.lt);
            if (value.gt !== undefined) range.$gt = Number(value.gt);
            filter[actualField] = range;
          }
          break;
        }

        case 'Date': {
          if (typeof value === 'string' || value instanceof Date) {
            filter[actualField] = new Date(value);
          } else if (Array.isArray(value)) {
            filter[actualField] = { $in: value.map((v) => new Date(v)) };
          } else if (typeof value === 'object') {
            const range: Record<string, Date> = {};
            if (value.from) range.$gte = new Date(value.from);
            if (value.to) range.$lte = new Date(value.to);
            if (value.lt) range.$lt = new Date(value.lt);
            if (value.gt) range.$gt = new Date(value.gt);
            filter[actualField] = range;
          }
          break;
        }

        case 'Boolean':
          if (Array.isArray(value)) {
            filter[actualField] = { $in: value.map((v) => v === 'true' || v === true) };
          } else {
            filter[actualField] = value === 'true' || value === true;
          }
          break;

        case 'Array':
          filter[actualField] = Array.isArray(value) ? { $in: value } : { $in: [value] };
          break;

        default:
          // Handle ObjectId / Reference
          if (schemaType?.options?.ref || fieldType === 'ObjectId' || fieldType === 'ObjectID') {
            const toObjectId = (v: any) => {
              if (isValidObjectId(v) && typeof v === 'string') {
                return new Types.ObjectId(v);
              }
              return v;
            };
            filter[actualField] = Array.isArray(value) ? { $in: value.map(toObjectId) } : toObjectId(value);
          } else {
            filter[actualField] = value;
          }
          break;
      }
    }
    // Check if pagination parameters exist or isPaginate flag is set
    if (filters.isPaginate || filters.page || filters.limit) {
      filterOptions.limit = Number(filters.limit) || 10;
      filterOptions.page = Number(filters.page) || 1;
      filterOptions.order = filters.order;
    }

    if (filters.populate) {
      filterOptions.populate = filters.populate;
    }

    return { filter, options: filterOptions };
  }

  // ==========================
  // READ
  // ==========================

  findAll(
    filter: FilterQuery<T>,
    options: QueryOptions & {
      projection?: ProjectionType<T>;
      populate?: string | string[] | PopulateOptions | PopulateOptions[];
    } = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<T[]> {
    const { projection, populate: optionsPopulate, ...restOptions } = options;
    const query = this.model.find(filter, projection || null, restOptions);
    const finalPopulate = optionsPopulate || populate;
    if (finalPopulate) query.populate(finalPopulate as any);
    return query.lean<T[]>().exec();
  }

  findOne(
    filter: FilterQuery<T>,
    options: QueryOptions & {
      projection?: ProjectionType<T>;
      populate?: string | string[] | PopulateOptions | PopulateOptions[];
    } = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<T | null> {
    const { projection, populate: optionsPopulate, ...restOptions } = options;
    const query = this.model.findOne(filter, projection || null, restOptions);
    const finalPopulate = optionsPopulate || populate;
    if (finalPopulate) query.populate(finalPopulate as any);
    return query.lean<T>().exec();
  }

  findById(
    id: string,
    options: QueryOptions & {
      projection?: ProjectionType<T>;
      populate?: string | string[] | PopulateOptions | PopulateOptions[];
    } = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<T | null> {
    const { projection, populate: optionsPopulate, ...restOptions } = options;
    const query = this.model.findById(id, projection || null, restOptions);
    const finalPopulate = optionsPopulate || populate;
    if (finalPopulate) query.populate(finalPopulate as any);
    return query.lean<T>().exec();
  }

  async findAllWithPagination(
    filter: FilterQuery<T>,
    options: QueryOptions & {
      page?: number;
      limit?: number;
      order?: Partial<Record<keyof T, 1 | -1>>;
      projection?: ProjectionType<T>;
      populate?: string | string[] | PopulateOptions | PopulateOptions[];
    } = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<IPaginationData<T>> {
    const { order, projection, page = 1, limit = 10, populate: optionsPopulate, ...restOptions } = options;

    const sort = order || { updatedAt: -1 };
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const totalRecords = await this.model.countDocuments(filter).exec();
    const totalPages = Math.ceil(totalRecords / safeLimit);

    const query = this.model.find(filter, projection, {
      ...restOptions,
      limit: safeLimit,
      skip,
      sort,
    });

    const finalPopulate = optionsPopulate || populate;
    if (finalPopulate) query.populate(finalPopulate as any);

    const recordList = await query.lean<T[]>().exec();

    return {
      limit: safeLimit,
      totalRecords,
      totalPages,
      hasPreviousPage: safePage > 1,
      currentPage: page,
      // currentPage: Math.min(safePage, totalPages),
      hasNextPage: safePage < totalPages,
      recordList,
    };
  }

  count(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  // ==========================
  // WRITE
  // ==========================

  update(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<TDoc>,
    options: MongooseUpdateQueryOptions<T> & { userId?: ObjectId; session?: ClientSession } = {}
  ): Promise<UpdateWriteOpResult | null> {
    return this.model.updateMany(filter, updateData, options).exec();
  }

  updateOne(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<TDoc>,
    options: MongooseUpdateQueryOptions<T> & { userId?: ObjectId; session?: ClientSession } = {}
  ): Promise<UpdateWriteOpResult | null> {
    return this.model.updateOne(filter, updateData, options).exec();
  }

  upsert(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<TDoc>,
    options: QueryOptions & { userId?: ObjectId; session?: ClientSession } = {}
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filter, updateData, {
        ...options,
        upsert: true,
        new: true,
      })
      .lean<T>()
      .exec();
  }
 
  findOneAndUpdate(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<TDoc>,
    options: QueryOptions & { userId?: ObjectId; session?: ClientSession } = {}
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filter, updateData, {
        ...options,
        new: true,
      })
      .lean<T>()
      .exec();
  }

  async create(
    createData: Partial<T>,
    options: CreateOptions & { userId?: ObjectId; session?: ClientSession } = {}
  ): Promise<T> {
    const payload = { ...createData, createdBy: options.userId } as Partial<T>;
    const [createdDoc] = await this.model.create([payload] as any, options);
    return createdDoc as T;
  }

  async bulkCreate(
    createData: Partial<T>[],
    options: CreateOptions & { userId?: ObjectId; session?: ClientSession } = {}
  ): Promise<T[]> {
    const payload = createData.map((data) => ({
      ...data,
      createdBy: options.userId,
    })) as Partial<T>[];
    const docs = await this.model.create(payload, options);
    return docs.map((d) => d.toObject() as T);
  }

  // ==========================
  // DELETE (Soft Delete)
  // ==========================

  softDelete(
    filter: FilterQuery<T>,
    options: MongooseUpdateQueryOptions<T> & { userId?: ObjectId; session?: ClientSession } = {}
  ): Promise<UpdateWriteOpResult | null> {
    return this.model
      .updateMany(
        filter,
        { deletedBy: options.userId, deletedAt: new Date() } as UpdateQuery<TDoc>,
        options
      )
      .exec();
  }

  delete(filter: FilterQuery<T>): Promise<DeleteResult | null> {
    return this.model.deleteMany(filter).exec();
  }
 
  deleteMany(filter: FilterQuery<T>): Promise<DeleteResult | null> {
    return this.model.deleteMany(filter).exec();
  }

  // ==========================
  // AGGREGATE
  // ==========================

  aggregate(pipeline: PipelineStage[]): Promise<Record<string, unknown>[]> {
    return this.model.aggregate(pipeline).exec();
  }
}
