import * as path from 'path';
import * as fse from 'fs-extra';
import * as fs from 'fs';

import { Response } from 'express';
import { promisify } from 'util';
import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';

type FileList = string[];

const readDir = promisify(fs.readdir);
const UPLOAD_FOLDER = path.resolve(__dirname, './upload_folder');

@Controller('uploader')
export class UploaderController {
  constructor() {
    fse.ensureDirSync(UPLOAD_FOLDER);
  }

  async handlerFiles(files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await fse.rename(
        path.resolve(file.destination, file.filename),
        path.resolve(file.destination, file.originalname),
      );
    }
  }


  @Get()
  async findAll(): Promise<FileList> {
    const files = await readDir(UPLOAD_FOLDER);
    return files;
  }

  // single file upload
  @Post()
  @UseInterceptors(FileInterceptor('file',  {dest: UPLOAD_FOLDER}))
  // Express.Multer.File
  async uploadFile(@Res() res: Response, @UploadedFile() file) {
    console.log(file);
    await this.handlerFiles([file]  );
    res.json({});
  }

  // multi file upload
  // @Post()
  // @UseInterceptors(FilesInterceptor('files', Infinity, { dest: UPLOAD_FOLDER }))
  // async uploadFiles(@Res() res: Response, @UploadedFiles() files) {
  //   await this.handlerFiles(files);
  //   res.json({});
  // }

  // // multi part
  // @Post('upload')
  // @UseInterceptors(
  //   FileFieldsInterceptor([
  //     { name: 'avatar', maxCount: 1 },
  //     { name: 'background', maxCount: 1 },
  //   ]),
  // )
  // uploadPairFiles(@UploadedFiles() pair) {
  //   console.log(pair);
  // }

  // // any file
  // @Post('upload')
  // @UseInterceptors(AnyFilesInterceptor())
  // uploadAnyFile(@UploadedFiles() files) {
  //   console.log(files);
  // }
}
