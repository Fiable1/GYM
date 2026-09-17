import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/core.entities';
import { Role } from '../common/constants';
import { AuthUser } from './decorators';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase().trim() },
      select: ['id', 'password', 'email', 'firstName', 'lastName', 'role', 'tenantId', 'locationId', 'language', 'isActive'],
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new ForbiddenException('Account is disabled');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    user.lastLoginAt = new Date();
    await this.userRepo.save(user);
    const token = this.sign(user);
    return { access_token: token, user: this.sanitize(user) };
  }

  async register(dto: any) {
    const email = dto.email.toLowerCase().trim();
    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) throw new BadRequestException('Email already registered');

    // Guest/self registration attaches to the default tenant (marker tenant)
    let tenantId = dto.tenantId || null;
    if (!tenantId) {
      let markerTenant = await this.tenantRepo.findOne({
        where: { name: 'PulseForge Cloud' },
      });
      if (!markerTenant) {
        markerTenant = await this.tenantRepo.save(
          this.tenantRepo.create({ name: 'PulseForge Cloud' }),
        );
      }
      tenantId = markerTenant.id;
    }

    const isStaffRole = [Role.OWNER, Role.MANAGER, Role.STAFF, Role.TRAINER, Role.MAINTENANCE_TECH].includes(dto.role);
    if (isStaffRole && !dto.registeringAdmin) {
      throw new BadRequestException('Staff accounts must be created by an administrator');
    }

    const hashed = await bcrypt.hash(dto.password || 'PulseForge@123', 10);
    const record: any = this.userRepo.create({
      ...dto,
      email,
      password: hashed,
      tenantId,
      role: dto.role || Role.MEMBER,
      language: dto.language || 'en',
    });
    const user = await this.userRepo.save(record as User);

    const token = this.sign(user);
    return { access_token: token, user: this.sanitize(user) };
  }

  async me(user: AuthUser) {
    return this.userRepo.findOne({ where: { id: user.id } });
  }

  async verifyMfa(user: AuthUser, code: string) {
    // Simulated TOTP verification for demo purposes
    if (code === '123456') {
      return { verified: true, message: 'MFA verified' };
    }
    throw new BadRequestException('Invalid verification code');
  }

  private sign(user: User) {
    return this.jwtService.sign({
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      locationId: user.locationId,
      language: user.language,
    });
  }

  private sanitize(user: User) {
    const { password, ...rest } = user as any;
    return rest;
  }
}