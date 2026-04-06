export declare class NotificationsService {
    private readonly logger;
    notifyStatusChange(userEmail: string, activityTitle: string, status: string): Promise<{
        sent: boolean;
    }>;
}
