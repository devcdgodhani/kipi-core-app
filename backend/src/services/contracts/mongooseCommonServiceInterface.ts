import {
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  PopulateOptions,
  MongooseUpdateQueryOptions,
  UpdateWriteOpResult,
  ClientSession,
  CreateOptions,
  PipelineStage,
  DeleteResult,
  ObjectId,
} from 'mongoose';
import { IPaginationData } from '../../interfaces';

export interface IReadService<T> {
  generateFilter(options: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters?: Record<string, any>;
    searchFields?: (keyof T)[];
  }): FilterQuery<T>;

  findAll(
    filter: FilterQuery<T>,
    options?: QueryOptions,
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<T[]>;

  findOne(
    filter: FilterQuery<T>,
    options?: QueryOptions,
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<T | null>;

  findById(
    id: string,
    options?: QueryOptions,
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<T | null>;

  findAllWithPagination(
    filter: FilterQuery<T>,
    options: QueryOptions,
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<IPaginationData<T>>;

  count(filter: FilterQuery<T>): Promise<number>;

  aggregate(pipeline: PipelineStage[]): Promise<Record<string, unknown>[]>;
}

export interface IWriteService<T, TDoc> {
  update(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<TDoc>,
    options?: MongooseUpdateQueryOptions<T> & { userId?: ObjectId; session?: ClientSession }
  ): Promise<UpdateWriteOpResult | null>;

  updateOne(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<TDoc>,
    options?: MongooseUpdateQueryOptions<T> & { userId?: ObjectId; session?: ClientSession }
  ): Promise<UpdateWriteOpResult | null>;

  upsert(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<TDoc>,
    options?: QueryOptions & { userId?: ObjectId; session?: ClientSession }
  ): Promise<T | null>;

  create(
    createData: Partial<T>,
    options?: CreateOptions & { userId?: ObjectId; session?: ClientSession }
  ): Promise<T>;
}

export interface IDeleteService<T> {
  softDelete(
    filter: FilterQuery<T>,
    options?: MongooseUpdateQueryOptions<T> & { userId?: ObjectId; session?: ClientSession }
  ): Promise<UpdateWriteOpResult | null>;

  delete(filter: FilterQuery<T>): Promise<DeleteResult | null>;
}

export interface IHookService<T> {
  beforeCreate(
    createData: Partial<T>,
    options?: CreateOptions & { userId?: ObjectId; session?: ClientSession }
  ): Promise<T>;

  afterCreate(
    createData: Partial<T>,
    options?: CreateOptions & { userId?: ObjectId; session?: ClientSession }
  ): Promise<T>;

  beforeBulkCreate(
    createData: Partial<T>[],
    options?: CreateOptions & { userId?: ObjectId; session?: ClientSession }
  ): Promise<T[]>;

  afterBulkCreate(
    createData: Partial<T>[],
    options?: CreateOptions & { userId?: ObjectId; session?: ClientSession }
  ): Promise<T[]>;

  beforeUpdate(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    options?: MongooseUpdateQueryOptions<T> & { userId?: ObjectId; session?: ClientSession }
  ): Promise<UpdateWriteOpResult | null>;

  afterUpdate(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    options?: MongooseUpdateQueryOptions<T> & { userId?: ObjectId; session?: ClientSession }
  ): Promise<UpdateWriteOpResult | null>;

  beforeDelete(
    filter: FilterQuery<T>,
    options?: { userId?: ObjectId; session?: ClientSession }
  ): Promise<T | null>;

  afterDelete(
    filter: FilterQuery<T>,
    options?: { userId?: ObjectId; session?: ClientSession }
  ): Promise<T | null>;

  beforeSoftDelete(
    filter: FilterQuery<T>,
    options?: { userId?: ObjectId; session?: ClientSession }
  ): Promise<T | null>;

  afterSoftDelete(
    filter: FilterQuery<T>,
    options?: { userId?: ObjectId; session?: ClientSession }
  ): Promise<T | null>;
}

export interface IMongooseCommonService<T, TDoc>
  extends IReadService<T>,
    IWriteService<T, TDoc>,
    IDeleteService<T> {}
