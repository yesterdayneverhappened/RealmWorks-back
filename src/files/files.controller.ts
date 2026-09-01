import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
  ) { }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),

          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png|image\/webp)$/,
          })
        ]
      })
    ) file: Express.Multer.File,
  ) {
    return this.filesService.uploadImage(file);
  }

  @Post('schematic')
  @UseInterceptors(FileInterceptor('file'))
  uploadSchematic(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 20 * 1024 * 1024,
          })
        ]
      })
    )
    file: Express.Multer.File,
  ) {
    return this.filesService.uploadSchematic;
  }

  @Get('url')
  getFileUrl(
    @Query('key') key: string,
  ) {
    return this.filesService.getFileUrl(key);
  }
}