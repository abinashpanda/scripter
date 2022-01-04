import { Body, Controller, Get, Post } from '@nestjs/common'
import { ExecuteFunctionDto } from './functions.dto'
import { FunctionsService } from './functions.service'

@Controller('functions')
export class FunctionsController {
  constructor(private readonly functionsService: FunctionsService) {}

  @Get('routes')
  getRoutes() {
    return this.functionsService.getRoutes()
  }

  @Post('execute')
  executeFunction(@Body() executeFunctionDto: ExecuteFunctionDto) {
    return this.functionsService.executeFunction(executeFunctionDto)
  }
}
