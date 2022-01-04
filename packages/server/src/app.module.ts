import { Module } from '@nestjs/common'
import { FunctionsModule } from './functions/functions.module'

@Module({
  imports: [FunctionsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
