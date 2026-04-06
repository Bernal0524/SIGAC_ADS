import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Body, 
  Param,
  Query, 
  UseGuards 
} from '@nestjs/common';
import { GroupsService } from './groups.service';

// CAMBIO AQUÍ: Bajamos a un solo nivel de salida '../'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post('generate')
  @Roles(Role.COORDINADOR)
  generateCode(@Body() data: { sector: string }) {
    return this.groupsService.generateInviteCode(data.sector);
  }

  @Get('list')
  @Roles(Role.COORDINADOR)
  findAll() {
    return this.groupsService.findAllCodes();
  }

  @Delete(':id')
  @Roles(Role.COORDINADOR)
  remove(@Param('id') id: string) {
    return this.groupsService.deleteCode(id);
  }

  @Get('available-participants')
  @Roles(Role.COORDINADOR)
  getAvailable(
    @Query('start') start: string, 
    @Query('end') end: string
  ) {
    return this.groupsService.getAvailableParticipants(start, end);
  }
}