import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Address } from '../entities/address.entity';
import { ModelRepository } from '../../common/repositories/model.repository';
import { AddressSerializer } from '../serializers/address.serializer';
import {
  IAddressCreate,
  IAddressUpdate,
} from '../interfaces/address.interface';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AddressesRepository extends ModelRepository<
  Address,
  AddressSerializer
> {
  private readonly userRepository: Repository<User>;

  constructor(@InjectDataSource() dataSource: DataSource) {
    super(AddressSerializer);
    this.manager = dataSource.manager;
    this.repository = dataSource.getRepository(Address);
    this.userRepository = dataSource.getRepository(User);
    this.metadata = this.repository.metadata;
  }

  /**
   * Obtener todas las direcciones
   */
  async findAll(): Promise<AddressSerializer[]> {
    return this.getAll(['user']);
  }

  async findById(id: string): Promise<AddressSerializer | null> {
    return this.get(id, ['user']);
  }

  /**
   * Buscar direcciones por usuario
   */
  async findByUserId(userId: string): Promise<AddressSerializer[]> {
    return this.getAllBy({ user: { id: userId } }, ['user']);
  }

  /**
   * Crear una nueva dirección
   */
  async create(addressData: IAddressCreate): Promise<AddressSerializer> {
    const { userId, ...data } = addressData;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Si la dirección se establece como predeterminada, actualizar las otras direcciones
    if (data.isDefault) {
      await this.update(
        { user: { id: userId }, isDefault: true },
        { isDefault: false },
      );
    }

    const inputs = {
      ...data,
      user,
    };

    return this.createEntity(inputs, ['user']);
  }

  async update(where: any, addressData: IAddressUpdate): Promise<any> {
    return this.repository.update(where, addressData);
  }

  async updateById(
    id: string,
    addressData: IAddressUpdate,
  ): Promise<AddressSerializer | null> {
    const address = await this.get(id, ['user']);

    // Si la dirección se establece como predeterminada, actualizar las otras direcciones
    if (addressData.isDefault && !address!.isDefault) {
      await this.update(
        { user: { id: address!.user?.id } },
        { isDefault: false },
      );
    }

    return this.updateEntity(id, addressData, ['user']);
  }

  /**
   * Eliminar una dirección
   */
  async delete(id: string): Promise<boolean> {
    return this.deleteEntity(id);
  }

  /**
   * Establecer una dirección como predeterminada
   */
  async setAsDefault(
    id: string,
    userId: string,
  ): Promise<AddressSerializer | null> {
    // Primero quitamos el default de todas las direcciones del usuario
    await this.repository.update(
      { user: { id: userId } as any },
      { isDefault: false },
    );

    // Luego establecemos esta dirección como predeterminada
    await this.repository.update(id, { isDefault: true });

    // Retornamos la dirección actualizada
    return this.get(id, ['user']);
  }
}
