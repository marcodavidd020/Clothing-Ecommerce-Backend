import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from '../../../models/addresses/entities/address.entity';
import { User } from '../../../models/users/entities/user.entity';
import { AddressesSeederService } from './addresses.seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Address, User])],
  providers: [AddressesSeederService],
  exports: [AddressesSeederService],
})
export class AddressesSeederModule {}
