export const MEDIA_FILE_TYPE = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  YOUTUBE: 'YOUTUBE',
} as const;
export type MEDIA_FILE_TYPE = (typeof MEDIA_FILE_TYPE)[keyof typeof MEDIA_FILE_TYPE];

export const MEDIA_TYPE = {
  FRONT: 'FRONT',
  BACK: 'BACK',
  SIDE: 'SIDE',
  TOP: 'TOP',
  BOTTOM: 'BOTTOM',
  LIFESTYLE: 'LIFESTYLE',
  MODEL: 'MODEL',
  FULL: 'FULL',
} as const;
export type MEDIA_TYPE = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];

export const MEDIA_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type MEDIA_STATUS = (typeof MEDIA_STATUS)[keyof typeof MEDIA_STATUS];

export interface IMedia {
  fileType: MEDIA_FILE_TYPE;
  type: MEDIA_TYPE | string;
  fileStorageId?: string;
  url: string;
  status: MEDIA_STATUS;
  sortOrder?: number;
}
