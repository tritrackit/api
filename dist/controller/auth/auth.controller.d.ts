import { AuthService } from "../../services/auth.service";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { EmployeeUserLogInDto } from "src/core/dto/auth/login.dto";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: EmployeeUserLogInDto): Promise<ApiResponseModel<EmployeeUsers>>;
    verify(dto?: {
        email: string;
        hashCode: string;
    }): Promise<ApiResponseModel<EmployeeUsers>>;
    logout(userId: string): Promise<ApiResponseModel<any>>;
    refreshToken(params: {
        employeeUserId: string;
        refresh_token: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
