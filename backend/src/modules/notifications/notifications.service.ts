import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('Notifications');

  async notifyStatusChange(userEmail: string, activityTitle: string, status: string) {
    // Aquí iría la lógica de SendGrid / NodeMailer / Socket.io
    this.logger.log(`📧 Enviando correo a ${userEmail}: La actividad "${activityTitle}" ahora está ${status}`);
    return { sent: true };
  }
}