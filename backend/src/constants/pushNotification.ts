export enum PUSH_NOTIFICATION_STATUS {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum PUSH_TARGET_TYPE {
  ALL = 'ALL',
  SEGMENT = 'SEGMENT',
  USER_LIST = 'USER_LIST',
  TOPIC = 'TOPIC'
}

export const PUSH_NOTIFICATION_SUCCESS_MESSAGES = {
  GET_SUCCESS: 'PushNotification retrieved successfully',
  CREATE_SUCCESS: 'PushNotification created successfully',
  UPDATE_SUCCESS: 'PushNotification updated successfully',
  DELETE_SUCCESS: 'PushNotification deleted successfully',
  SEND_SUCCESS: 'PushNotification queued for sending'
};
