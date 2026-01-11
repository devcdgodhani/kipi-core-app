
export enum SEARCH_QUERY_STATUS {
    ACTIVE = 'ACTIVE',
    DELETED = 'DELETED'
}

export interface SearchQuery {
    _id: string;
    userId?: string;
    query: string;
    resultCount: number;
    status: SEARCH_QUERY_STATUS;
    createdAt: string;
    updatedAt: string;
}

export interface SearchQueryResponse {
    status: string;
    code: number;
    message: string;
    data: SearchQuery;
}

export interface SearchQueryListResponse {
    status: string;
    code: number;
    message: string;
    data: {
        recordList: SearchQuery[];
        totalRecords: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}
