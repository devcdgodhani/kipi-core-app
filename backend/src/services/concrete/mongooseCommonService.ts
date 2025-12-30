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
import { IMongooseCommonService } from '../../services';
import { IPaginationData } from '../../interfaces';
import { Schema } from 'mongoose';

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

  generateFilter = (options: {
    filters?: Record<string, any>;
    searchFields?: (keyof T)[];
  }): FilterQuery<T> => {
    const { filters = {}, searchFields = [] } = options;

    const filter: Record<string, any> = {};
    const schemaPaths = this.schema.paths;
    const filterOptions: QueryOptions = {};

    // 🔍 Handle search keyword (from filters.search)
    if (filters.search && searchFields.length > 0) {
      const search = filters.search;
      filter['$or'] = searchFields.map((field) => ({
        [field === 'id' ? '_id' : field]: { $regex: search, $options: 'i' },
      }));
      delete filters.search; // remove so it doesn’t double-apply
    }

    // 🎯 Handle other filters
    for (const [field, value] of Object.entries(filters)) {
      const schemaType = schemaPaths[field];
      if (!schemaType || value === undefined || value === null || value === '') continue;

      const fieldType = schemaType.instance;

      switch (fieldType) {
        case 'String':
          if (Array.isArray(value)) {
            filter[field] = { $in: value };
          } else {
            filter[field] = { $regex: value, $options: 'i' };
          }
          break;

        case 'Number': {
          if (typeof value === 'number' || !isNaN(Number(value))) {
            filter[field] = Number(value);
          } else if (Array.isArray(value)) {
            filter[field] = { $in: value.map(Number) };
          } else if (typeof value === 'object') {
            const range: Record<string, number> = {};
            if (value.from !== undefined) range.$gte = Number(value.from);
            if (value.to !== undefined) range.$lte = Number(value.to);
            if (value.lt !== undefined) range.$lt = Number(value.lt);
            if (value.gt !== undefined) range.$gt = Number(value.gt);
            filter[field] = range;
          }
          break;
        }

        case 'Date': {
          if (typeof value === 'string' || value instanceof Date) {
            filter[field] = new Date(value);
          } else if (Array.isArray(value)) {
            filter[field] = { $in: value.map((v) => new Date(v)) };
          } else if (typeof value === 'object') {
            const range: Record<string, Date> = {};
            if (value.from) range.$gte = new Date(value.from);
            if (value.to) range.$lte = new Date(value.to);
            if (value.lt) range.$lt = new Date(value.lt);
            if (value.gt) range.$gt = new Date(value.gt);
            filter[field] = range;
          }
          break;
        }

        case 'Boolean':
          filter[field] = value === 'true' || value === true;
          break;

        case 'Array':
          filter[field] = Array.isArray(value) ? { $in: value } : { $in: [value] };
          break;

        default:
          // Handle ObjectId / Reference
          if (schemaType?.options?.ref || fieldType === 'ObjectId') {
            filter[field] = Array.isArray(value) ? { $in: value } : value;
          } else {
            filter[field] = value;
          }
          break;
      }
    }
    if (filters.isPaginate) {
      filterOptions.limit = filters.limit as number;
      filterOptions.page = filters.page;
      filterOptions.order = filters.order;
    }

    return { filter, options: filterOptions };
  };

  // ==========================
  // READ
  // ==========================

  async findAll(
    filter: FilterQuery<T>,
    options: QueryOptions = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<T[]> {
    const query = this.model.find(filter, null, options);
    if (populate) query.populate(populate);
    const docs = await query.exec();
    return docs.map(doc => doc.toObject({ virtuals: true })) as any;
  }

  async findOne(
    filter: FilterQuery<T>,
    options: QueryOptions = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<T | null> {
    const query = this.model.findOne(filter, null, options);
    if (populate) query.populate(populate);
    const doc = await query.exec();
    return doc ? (doc.toObject({ virtuals: true }) as any) : null;
  }

  async findById(
    id: string,
    options: QueryOptions = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<T | null> {
    const query = this.model.findById(id, null, options);
    if (populate) query.populate(populate);
    const doc = await query.exec();
    return doc ? (doc.toObject({ virtuals: true }) as any) : null;
  }

  async findAllWithPagination(
    filter: FilterQuery<T>,
    options: QueryOptions & {
      page?: number;
      limit?: number;
      order?: Partial<Record<keyof T, 1 | -1>>;
      projection?: ProjectionType<T>;
    } = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<IPaginationData<T>> {
    const { order, projection, page = 1, limit = 10, ...restOptions } = options;

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

    if (populate) query.populate(populate);
    const recordListDocs = await query.exec();
    const recordList = recordListDocs.map(doc => doc.toObject({ virtuals: true })) as any;

    return {
      limit: safeLimit,
      totalRecords,
      totalPages,
      hasPreviousPage: safePage > 1,
      currentPage: page,
      hasNextPage: safePage < totalPages,
      recordList,
    };
  }

  async count(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  // ==========================
  // WRITE
  // ==========================

  async update(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<TDoc>,
    options: MongooseUpdateQueryOptions<T> & { userId?: ObjectId; session?: ClientSession } = {}
  ): Promise<UpdateWriteOpResult | null> {
    return this.model.updateMany(filter, updateData, options).exec();
  }

  async updateOne(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<TDoc>,
    options: MongooseUpdateQueryOptions<T> & { userId?: ObjectId; session?: ClientSession } = {}
  ): Promise<UpdateWriteOpResult | null> {
    return this.model.updateOne(filter, updateData, options).exec();
  }

  async upsert(
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

  async create(
    createData: Partial<T>,
    options: CreateOptions & { userId?: ObjectId; session?: ClientSession } = {}
  ): Promise<T> {
    const payload = { ...createData, createdBy: options.userId } as Partial<T>;
    const [createdDoc] = await this.model.create([payload], options);
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

  async softDelete(
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

  async delete(filter: FilterQuery<T>): Promise<DeleteResult | null> {
    return this.model.deleteMany(filter).exec();
  }

  // ==========================
  // AGGREGATE
  // ==========================

  async aggregate(pipeline: PipelineStage[]): Promise<Record<string, unknown>[]> {
    return this.model.aggregate(pipeline).exec();
  }

  // ==========================
  // CONVENIENCE WRAPPERS FOR CONTROLLERS
  // ==========================

  async getAll(options: {
    page?: number;
    limit?: number;
    filter?: FilterQuery<T>;
    populate?: PopulateOptions | PopulateOptions[];
  } = {}): Promise<IPaginationData<T>> {
    const { page = 1, limit = 10, filter = {}, populate } = options;
    return this.findAllWithPagination(filter, { page, limit }, populate);
  }

  async getById(id: string, populate?: PopulateOptions | PopulateOptions[]): Promise<T | null> {
    return this.findById(id, {}, populate);
  }

  async updateById(id: string, updateData: Partial<T>): Promise<T | null> {
    const result = await this.model.findByIdAndUpdate(id, updateData as any, { new: true }).lean<T>().exec();
    return result;
  }

  async deleteById(id: string): Promise<void> {
    await this.softDelete({ _id: id } as FilterQuery<T>);
  }
}
