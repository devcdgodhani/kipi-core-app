export enum NOTIFICATION_TYPE {
  ORDER_UPDATE = 'ORDER_UPDATE',
  PRICE_DROP = 'PRICE_DROP',
  BACK_IN_STOCK = 'BACK_IN_STOCK',
  OFFER = 'OFFER',
  GENERAL = 'GENERAL',
  WISHLIST = 'WISHLIST',
  CART_REMINDER = 'CART_REMINDER',
}

export enum NOTIFICATION_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export const NOTIFICATION_SUCCESS_MESSAGES = {
  GET_SUCCESS: 'Notification retrieved successfully',
  CREATE_SUCCESS: 'Notification created successfully',
  UPDATE_SUCCESS: 'Notification updated successfully',
  DELETE_SUCCESS: 'Notification deleted successfully',
  MARK_READ_SUCCESS: 'Notification marked as read',
  MARK_ALL_READ_SUCCESS: 'All notifications marked as read',
};

export const NOTIFICATION_ERROR_MESSAGES = {
  NOT_FOUND: 'Notification not found',
  ALREADY_READ: 'Notification already read',
};
