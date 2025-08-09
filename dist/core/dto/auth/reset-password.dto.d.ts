export declare class UserResetPasswordSubmitDto {
    email: string;
}
export declare class UserResetVerifyDto extends UserResetPasswordSubmitDto {
    otp: string;
}
export declare class ProfileResetPasswordDto {
    currentPassword: string;
    password: string;
    confirmPassword: string;
}
export declare class UpdateUserPasswordDto {
    password: string;
    confirmPassword: string;
}
export declare class UserResetPasswordDto extends UserResetVerifyDto {
    password: string;
    confirmPassword: string;
}
