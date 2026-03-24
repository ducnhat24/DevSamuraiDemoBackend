import {
    Body,
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorator/get-user.decorator';

type AuthenticatedUser = {
    sub: string;
    refreshToken?: string;
};

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    signup(@Body() dto: SignUpDto) {
        return this.authService.signup(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    signin(@Body() dto: SignInDto) {
        return this.authService.signin(dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@GetUser() user: AuthenticatedUser) {
        return this.authService.logout(user.sub);
    }

    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refreshTokens(@GetUser() user: AuthenticatedUser) {
        if (!user.refreshToken) {
            return this.authService.refreshTokens(user.sub, '');
        }
        return this.authService.refreshTokens(user.sub, user.refreshToken);
    }
}
