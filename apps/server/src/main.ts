import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './utils/http-exception-filter'

export async function bootstrapServer(port: number | string) {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: '*',
  })

  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(port)
}

bootstrapServer(process.env.PORT ?? 3000)
