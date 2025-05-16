import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddressesRepository } from './repositories/addresses.repository';
import { AddressSerializer } from './serializers/address.serializer';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import {
  IPaginatedResult,
  IPaginationOptions,
} from '../../common/interfaces/pagination.interface';
import { UsersRepository } from '../users/repositories/users.repository';
import {
  createBadRequestResponse,
  createNotFoundResponse,
} from 'src/common/helpers/responses/error.helper';
import { Logger } from '@nestjs/common';
@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);
  constructor(
    private readonly addressesRepository: AddressesRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findAll(): Promise<AddressSerializer[]> {
    return this.addressesRepository.findAll();
  }

  async findPaginated(
    options: IPaginationOptions,
    userId?: string,
  ): Promise<IPaginatedResult<AddressSerializer>> {
    try {
      if (userId) {
        await this.findByUserId(userId);
        return this.addressesRepository.paginateBy(
          { user: { id: userId } },
          options,
          ['user'],
        );
      } else {
        return this.addressesRepository.paginate(options, ['user']);
      }
    } catch (error) {
      this.logger.error(
        `Error al obtener las direcciones: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<AddressSerializer> {
    const address = await this.addressesRepository.findById(id);
    if (!address) {
      throw new NotFoundException(createNotFoundResponse('Dirección'));
    }
    return address;
  }

  async findByUserId(userId: string): Promise<AddressSerializer[]> {
    if (!userId) {
      throw new BadRequestException(
        createBadRequestResponse('User ID is required'),
      );
    }

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(createNotFoundResponse('User'));
    }

    return this.addressesRepository.findByUserId(userId);
  }

  async create(addressData: CreateAddressDto): Promise<AddressSerializer> {
    return this.addressesRepository.create({
      ...addressData,
      userId: addressData.userId,
    });
  }

  async update(
    id: string,
    addressData: UpdateAddressDto,
  ): Promise<AddressSerializer | null> {
    const updated = await this.addressesRepository.update(id, addressData);
    if (!updated) {
      return null;
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const success = await this.addressesRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
  }

  async setAsDefault(id: string, userId: string): Promise<AddressSerializer> {
    const address = await this.addressesRepository.findById(id);

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    if (address.userId !== userId) {
      throw new NotFoundException(
        `Address with ID ${id} does not belong to user ${userId}`,
      );
    }

    const updated = await this.update(id, { isDefault: true });
    if (!updated) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return updated;
  }
}
