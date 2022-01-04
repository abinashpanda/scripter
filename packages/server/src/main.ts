import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

export async function bootstrapServer(port: number | string) {
  const app = await NestFactory.create(AppModule)
  await app.listen(port)
  return app
}

bootstrapServer(process.env.PORT ?? 3000)
