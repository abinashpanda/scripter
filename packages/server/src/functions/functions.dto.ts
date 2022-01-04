import { IsString, IsObject } from 'class-validator'

export class ExecuteFunctionDto {
  @IsString()
  route: string

  @IsObject()
  data: any
}
