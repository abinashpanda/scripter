import { Controller, Get } from '@nestjs/common'
import { FunctionsService } from './functions.service'

@Controller('functions')
export class FunctionsController {
  constructor(private readonly functionsService: FunctionsService) {}

  @Get('routes')
  getRoutes() {
    return this.functionsService.getRoutes()
  }
}
