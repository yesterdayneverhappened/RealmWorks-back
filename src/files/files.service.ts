import { BadRequestException, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class FilesService {
  private readonly r2: S3Client;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.r2 = new S3Client({
      region: 'auto',

      endpoint: this.configService.getOrThrow<string>(
        'R2_ENDPOINT',
      ),

      credentials: {
        accessKeyId: this.configService.getOrThrow<string>(
          'R2_ACCESS_KEY_ID',
        ),

        secretAccessKey: this.configService.getOrThrow<string>(
          'R2_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async uploadImage(file: Express.Multer.File) {
    const key = `builds/photos/${crypto.randomUUID()}`;

    await this.r2.send(
      new PutObjectCommand({
        Bucket: this.configService.getOrThrow<string>(
          'R2_BUCKET_NAME',
        ),

        Key: key,

        Body: file.buffer,

        ContentType: file.mimetype,
      }),
    );

    return {
      key,
    };
  }

  async getFileUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.configService.getOrThrow<string>(
        'R2_BUCKET_NAME',
      ),
      Key: key,
    });

    const url = await getSignedUrl(
      this.r2,
      command,
      {
        expiresIn: 60 * 15,
      },
    );

    return {
      url,
    };
  }

  async uploadSchematic(file: Express.Multer.File) {
    const extension = file.originalname
      .split('.')
      .pop()
      ?.toLocaleLowerCase();

    if (
      extension !== 'schematic' &&
      extension !== 'schem'
    ) {
      throw new BadRequestException(
        'Only .schematic and .schem files are allowed',
      );
    }

    const key = `builds/schematics/${crypto.randomUUID()}.${extension}`;

    await this.r2.send(
      new PutObjectCommand({
        Bucket: this.configService.getOrThrow<string>(
          'R2_BUSCKET_NAME',
        ),

        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      }),
    );

    return { key };
  }

  async deleteFile(key: string) {
    await this.r2.send(
      new DeleteObjectCommand({
        Bucket: this.configService.getOrThrow<string>(
          'R2_BUCKET_NAME',
        ),
        Key: key,
      }),
    );
  }
}