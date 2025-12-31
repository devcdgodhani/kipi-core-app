import { ICategoryAttributes, ICategoryDocument } from '../../interfaces/category';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { ITreeNode } from '../../types/category';

export interface ICategoryService extends IMongooseCommonService<ICategoryAttributes, ICategoryDocument> {
  getTree(filter: any): Promise<ITreeNode[]>;
}
