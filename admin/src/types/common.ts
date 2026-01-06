export interface IApiResponse<T = any> {
    status: string;
    code: number;
    message: string;
    data: T;
}

export interface IPaginationData<T> {
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasPreviousPage: boolean;
    currentPage: number;
    hasNextPage: boolean;
    recordList: T[];
}

export interface ICommonFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
