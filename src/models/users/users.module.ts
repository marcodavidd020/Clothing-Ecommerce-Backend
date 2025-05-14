import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './repositories/users.repository';
import { User } from './entities/user.entity';
import { UniqueUserEmailConstraint } from '../../common/decorators/validations/UniqueUserEmail';
import { UserExistsConstraint } from '../../common/decorators/validations/UserExists';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UniqueUserEmailConstraint,
    UserExistsConstraint,
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
