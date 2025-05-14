import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageConfigService {
  constructor(private configService: ConfigService) {}

  get provider(): string {
    return this.configService.get<string>('storage.provider')!;
  }

  get baseUrl(): string {
    return this.configService.get<string>('storage.baseUrl')!;
  }

  get local(): any {
    return this.configService.get<any>('storage.local')!;
  }

  get s3(): any {
    return this.configService.get<any>('storage.s3')!;
  }

  get gcs(): any {
    return this.configService.get<any>('storage.gcs')!;
  }

  get maxFileSize(): number {
    return this.configService.get<number>('storage.maxFileSize')!;
  }

  get allowedMimeTypes(): string[] {
    return this.configService.get<string[]>('storage.allowedMimeTypes')!;
  }

  get allowedExtensions(): string[] {
    return this.configService.get<string[]>('storage.allowedExtensions')!;
  }

  getStorageConfig() {
    switch (this.provider) {
      case 's3':
        return {
          provider: 's3',
          bucket: this.s3.bucket,
          region: this.s3.region,
          credentials: {
            accessKeyId: this.s3.accessKey,
            secretAccessKey: this.s3.secretKey,
          },
          ...(this.s3.endpoint && { endpoint: this.s3.endpoint }),
          ...(this.s3.forcePathStyle && { forcePathStyle: true }),
        };
      case 'gcs':
        return {
          provider: 'gcs',
          bucket: this.gcs.bucket,
          projectId: this.gcs.projectId,
          keyFilename: this.gcs.keyFilename,
        };
      case 'local':
      default:
        return {
          provider: 'local',
          path: this.local.path,
          serveStatic: this.local.serveStatic,
        };
    }
  }

  isFileAllowed(mimetype: string, extension: string): boolean {
    return (
      this.allowedMimeTypes.includes(mimetype) &&
      this.allowedExtensions.includes(extension.toLowerCase())
    );
  }
}
