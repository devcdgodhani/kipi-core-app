export const successResponse = (data: any, message: string = 'Success') => {
  return {
    status: 'SUCCESS',
    code: 200,
    message,
    data,
  };
};
