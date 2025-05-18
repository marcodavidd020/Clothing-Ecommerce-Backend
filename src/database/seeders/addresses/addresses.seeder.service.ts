import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Address } from '../../../models/addresses/entities/address.entity';
import { User } from '../../../models/users/entities/user.entity';
import { AddressFactory } from '../../factories/addresses/factory';
import { Seeder } from '../seeder.interface';

@Injectable()
export class AddressesSeederService implements Seeder {
  constructor(
    @InjectRepository(Address)
    private readonly addressesRepository: Repository<Address>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async run(dataSource: DataSource): Promise<void> {
    // Obtener todos los usuarios
    const users = await this.usersRepository.find();

    // Para cada usuario, verificar si tiene direcciones
    for (const user of users) {
      const addressCount = await this.addressesRepository.count({
        where: { user: { id: user.id } },
      });

      // Si no tiene direcciones, crear algunas
      if (addressCount === 0) {
        const addresses = AddressFactory.generateMany(2, { user }); // Pasar 2 como count y user como baseOverrides

        for (const addressData of addresses) {
          const address = this.addressesRepository.create(addressData);
          await this.addressesRepository.save(address);
        }

        console.log(`Created 2 addresses for user ${user.email}`);
      }
    }
  }
}
