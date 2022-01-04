import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return process.env.FUNCTIONS_OUTDIR
  }
}
