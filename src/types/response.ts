/*************** success response ***************/
export type SuccessResponse<T = unknown> = {
    status: boolean;
    message: 'data retrieved' | string;
    data: T;
};

/*************** error response ***************/
export type ErrorResponse = {
    status: boolean;
    code: number;
    message: string;
    data: any;
};

/*************** validation error response ***************/
export type ValidationErrorResponse = {
    message: string;
    field?: string
}[];

/*************** pagination response ***************/
export type PaginationResponse<T = unknown> = {
    status: boolean;
    message: 'data retrieved' | string;
    pagination: {
        currentPage: number;
        totalPages: number;
        resultCount: number;
    };
    data: T;
};