export interface ContactMessage {
    _id: string;

    inquiryId: string;

    name: string;
    phoneNumber: number;
    email: string;
    subject: string;
    message: string;

    ipAddress?: string;
    device?: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
    platform?: 'Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS' | 'Unknown';

    isRead: boolean;
    status: 'active' | 'pending' | 'closed';

    createdAt?: Date;
    updatedAt?: Date;
}