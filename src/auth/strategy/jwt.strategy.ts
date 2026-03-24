import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // Ép kiểu thành string để TypeScript hết khóc nhè nè
            secretOrKey: process.env.JWT_ACCESS_SECRET as string,
        });
    }

    async validate(payload: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });

        if (!user) {
            throw new UnauthorizedException(); // Báo lỗi nếu token đúng nhưng user bị xóa mất rồi
        }

        // Dùng destructuring để tách passwordHash và hashedRefreshToken ra
        // Phần còn lại sẽ được gom vào biến userWithoutSensitiveInfo
        const { passwordHash, hashedRefreshToken, ...userWithoutSensitiveInfo } = user;

        return userWithoutSensitiveInfo;
    }
}