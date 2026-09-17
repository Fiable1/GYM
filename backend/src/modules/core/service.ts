import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, Location } from '../../entities/core.entities';
import { User } from '../../entities/user.entity';
import { ApiBaseService, AuditService } from '../../common/services';

@Injectable()
export class TenantService extends ApiBaseService<Tenant> {
  constructor(
    @InjectRepository(Tenant) repo: Repository<Tenant>,
    audit: AuditService,
  ) { super(repo, audit); }
}

@Injectable()
export class LocationService extends ApiBaseService<Location> {
  constructor(
    @InjectRepository(Location) repo: Repository<Location>,
    audit: AuditService,
  ) { super(repo, audit); }
}

@Injectable()
export class UserService extends ApiBaseService<User> {
  constructor(
    @InjectRepository(User) repo: Repository<User>,
    audit: AuditService,
  ) { super(repo, audit); }
}