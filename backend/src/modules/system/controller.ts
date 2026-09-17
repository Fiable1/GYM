import { Body, Controller, Get, Put, Query, Req } from '@nestjs/common';
import { LocalizationService, AuditServiceView } from './service';
import { buildPageQuery, reqContext } from '../../common/helpers';
import { Roles } from '../../auth/decorators';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('audit')
export class AuditController {
  constructor(private readonly svc: AuditServiceView) {}

  @Get()
  @Roles('SUPER_ADMIN', 'OWNER', 'MANAGER')
  findAll(@Req() req: any, @Query() q: any) {
    return this.svc.findAll(req.user.tenantId, buildPageQuery(q));
  }
}

@Controller('localization')
export class LocalizationController {
  constructor(private readonly svc: LocalizationService) {}

  @Get('languages')
  languages() { return this.svc.listLanguages(); }

  @Get('translate')
  translate(@Query('key') key: string, @Query('lang') lang: string) {
    return { key, value: this.svc.get(key, lang || 'en') };
  }
}

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly locSvc: LocalizationService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @Get('profile')
  async profile(@Req() req: any) {
    const user = await this.userRepo.findOne({ where: { id: req.user.id } });
    return user;
  }

  @Put('profile')
  async updateProfile(@Req() req: any, @Body() body: any) {
    const user = await this.userRepo.findOne({ where: { id: req.user.id } });
    Object.assign(user, body);
    return this.userRepo.save(user);
  }
}