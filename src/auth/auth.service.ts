import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async hashData(data: string) {
        const saltOrRounds = 10;
        return bcrypt.hash(data, saltOrRounds);
    }

    async signup(dto: SignUpDto) {
        const userExists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (userExists) {
            throw new ForbiddenException('Email này đã được sử dụng!');
        }

        const hashedPassword = await this.hashData(dto.password);

        const newUser = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash: hashedPassword,
            },
        });

        return {
            message: 'Đăng ký tài khoản thành công',
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name
            }
        };
    }

    async signin(dto: SignInDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new ForbiddenException('Sai email hoặc mật khẩu!');
        }

        const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatches) {
            throw new ForbiddenException('Sai email hoặc mật khẩu!');
        }

        const tokens = await this.getTokens(user.id, user.email);

        await this.updateRtHash(user.id, tokens.refreshToken);

        return tokens;
    }


    async getTokens(userId: string, email: string) {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(
                { sub: userId, email },
                {
                    secret: process.env.JWT_ACCESS_SECRET,
                    expiresIn: '5s',
                },
            ),
            this.jwtService.signAsync(
                { sub: userId, email },
                {
                    secret: process.env.JWT_REFRESH_SECRET,
                    expiresIn: '7d',
                },
            ),
        ]);

        return {
            accessToken: at,
            refreshToken: rt,
        };
    }

    // Hàm lưu Refresh Token vào Database
    async updateRtHash(userId: string, rt: string) {
        const hash = await this.hashData(rt);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                hashedRefreshToken: hash,
            },
        });
    }

    async refreshTokens(userId: string, rt: string) {
        // 1. Tìm user
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        // Nếu không có user, hoặc user đã đăng xuất (hashedRefreshToken bị xóa) -> Đá văng
        if (!user || !user.hashedRefreshToken) {
            throw new ForbiddenException('Truy cập bị từ chối!');
        }

        // 2. So sánh Refresh Token gửi lên với cái Hash đang lưu trong DB
        const rtMatches = await bcrypt.compare(rt, user.hashedRefreshToken);
        if (!rtMatches) {
            throw new ForbiddenException('Truy cập bị từ chối!');
        }

        // 3. Khớp rồi! Phát lại cặp vé mới
        const tokens = await this.getTokens(user.id, user.email);

        // 4. Cập nhật lại Refresh Token mới vào DB
        await this.updateRtHash(user.id, tokens.refreshToken);

        return tokens;
    }

    // Để cho chức năng hoàn hảo, tui tặng thêm hàm Đăng xuất luôn (xóa token khỏi DB)
    async logout(userId: string) {
        await this.prisma.user.updateMany({
            where: {
                id: userId,
                hashedRefreshToken: {
                    not: null, // Chỉ update nếu nó đang khác null
                },
            },
            data: {
                hashedRefreshToken: null,
            },
        });
        return { message: 'Đăng xuất thành công' };
    }
}