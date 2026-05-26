export type NotificationDto = {
  notification_id: string;
  type?: string | null;
  quote_id?: string | null;
  account_id?: string | null;
  accumulated_amount?: number | null;
  new_balance?: number | null;
  message: string;
  read: boolean;
  created_at?: string | null;
};

export type NotificationsResponseDto = {
  message: string;
  status_code: number;
  status: string;
  data: NotificationDto[];
  pagination?: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
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
