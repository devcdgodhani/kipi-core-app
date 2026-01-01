import { Document } from 'mongoose';
import { IDefaultAttributes } from './common';

export interface IFileDirectoryAttributes extends IDefaultAttributes {
  name: string;
  path: string; // The full path, e.g., "parent/child"
  parentPath: string | null; // The parent path, e.g., "parent", or null for root
  isSystem?: boolean; // Optional: protect system folders
}

export interface IFileDirectoryDocument extends IFileDirectoryAttributes, Document {}
