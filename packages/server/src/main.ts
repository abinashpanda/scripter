import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

export async function bootstrapServer(port: number | string) {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: '*',
  })

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  await app.listen(port)
}

bootstrapServer(process.env.PORT ?? 3000)
