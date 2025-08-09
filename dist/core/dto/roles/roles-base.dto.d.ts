export declare class AccessPagesDto {
    page: string;
    view: boolean;
    modify: boolean;
    rights: string[];
}
export declare class DefaultRoleDto {
    name: string;
    accessPages: AccessPagesDto[];
}
