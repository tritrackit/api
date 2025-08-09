export declare class ApiResponseModel<T> {
    data: T;
    message?: string;
    success?: boolean;
}
export declare class PageAccess {
    page?: string;
    view?: boolean;
    modify?: boolean;
    rights: [];
}
