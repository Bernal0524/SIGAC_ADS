import { Module, Global } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Global() // Lo hacemos global para usarlo en Activities sin importarlo siempre
@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}