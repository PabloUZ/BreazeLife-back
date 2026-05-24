export type NotificationDto = {
  notification_id: string;
  message: string;
  read: boolean;
};

export type NotificationsResponseDto = {
  message: string;
  status_code: number;
  status: string;
  data: {
    items: NotificationDto[];
    pagination?: {
      page: number;
      limit: number;
      total_items: number;
      total_pages: number;
    };
  };
};

export type MarkReadResponseDto = {
  message: string;
  status_code?: number;
  status?: string;
  data?: {
    notification_id: string;
    read: boolean;
  };
};
