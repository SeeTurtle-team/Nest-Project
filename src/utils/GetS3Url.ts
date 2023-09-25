import { Injectable } from '@nestjs/common';
const { generateUploadURL } = require('../Common/s3');

@Injectable()
export class GetS3Url {
  async s3url() {
    const url = await generateUploadURL();
    return { data: url };
  }
}
