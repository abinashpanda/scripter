import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ExecuteFunctionDto } from './functions.dto'
import { FunctionsService } from './functions.service'

@Controller('functions')
export class FunctionsController {
  constructor(private readonly functionsService: FunctionsService) {}

  @Get('routes')
  getRoutes() {
    return this.functionsService.getRoutes()
  }

  @Get('routes/:route')
  getRoute(@Param('route') route: string) {
    return this.functionsService.getRoute(route)
  }

  @Post('execute')
  executeFunction(@Body() executeFunctionDto: ExecuteFunctionDto) {
    return this.functionsService.executeFunction(executeFunctionDto)
  }
}
