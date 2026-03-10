import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from './entities/user.entity';
import { Request as ExpressRequest } from 'express';
import { JwtService } from '@nestjs/jwt';

interface RequestWithPayload extends ExpressRequest {
    user: {
        user_id: string;
        email: string;
        role: string;
    };
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService, private jwt: JwtService) { }

    // USER PROFILE
    @Patch('profile')
    @ApiOperation({ summary: 'Update current user profile information' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async updateProfile(
        @Request() req: RequestWithPayload,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        const { sub } = this.jwt.decode<{ sub: string }>(req.headers.authorization?.split(' ')[1] || '');

        // Type-safe mapping
        const { date_of_birth, ...rest } = updateUserDto;
        const updateData: Partial<User> = { ...rest };
        if (date_of_birth) {
            updateData.date_of_birth = new Date(date_of_birth);
        }

        await this.usersService.update(sub, updateData);
        const updatedUser = await this.usersService.findOneById(sub);
        if (!updatedUser) throw new NotFoundException('User not found');
        return updatedUser as unknown as UserResponseDto;
    }

    // ADMIN OPERATIONS
    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Administrator: List all users' })
    @ApiResponse({ status: 200, type: [UserResponseDto] })
    async findAll(): Promise<UserResponseDto[]> {
        const users = await this.usersService.findAll();
        return users as unknown as UserResponseDto[];
    }

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Administrator: Manually create a user' })
    @ApiBody({ type: AdminCreateUserDto })
    @ApiResponse({ status: 201, type: UserResponseDto })
    async create(@Body() adminCreateUserDto: AdminCreateUserDto): Promise<UserResponseDto> {
        const existing = await this.usersService.findOneByEmail(adminCreateUserDto.email);
        if (existing) throw new ConflictException('User with this email already exists');

        const user = await this.usersService.createWithPassword({
            ...adminCreateUserDto,
            email_verified: true,
        } as Partial<User> & { password?: string });

        return user as unknown as UserResponseDto;
    }

    @Get(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Administrator: Get one user detail' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async findOne(@Param('id') id: string): Promise<UserResponseDto> {
        const user = await this.usersService.findOneById(id);
        if (!user) throw new NotFoundException('User not found');
        return user as unknown as UserResponseDto;
    }

    @Patch(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Administrator: Update user information (including status and role)' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async update(
        @Param('id') id: string,
        @Body() adminUpdateUserDto: AdminUpdateUserDto,
    ): Promise<UserResponseDto> {
        const { date_of_birth, ...rest } = adminUpdateUserDto;
        const updateData: Partial<User> = { ...rest } as Partial<User>;
        if (date_of_birth) {
            updateData.date_of_birth = new Date(date_of_birth);
        }

        await this.usersService.update(id, updateData);
        const updatedUser = await this.usersService.findOneById(id);
        if (!updatedUser) throw new NotFoundException('User not found');
        return updatedUser as unknown as UserResponseDto;
    }

    @Delete(':id')
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Administrator: Delete a user' })
    @ApiResponse({ status: 204 })
    async remove(@Param('id') id: string): Promise<void> {
        const user = await this.usersService.findOneById(id);
        if (!user) throw new NotFoundException('User not found');
        await this.usersService.remove(id);
    }
}