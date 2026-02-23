import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PaginationDto } from '@common/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(private readonly usersService: UsersService) {}

  async findAllUsers(paginationDto: PaginationDto = { page: 1, limit: 10 }) {
    return this.usersService.findAll(paginationDto);
  }
}
