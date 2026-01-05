import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import { ApiError } from './ApiError';
import { EmailOptions } from '../types/emailOption.interface';
import SettingsModel from '../models/settings.model';

/**
 * Send transactional email using Brevo HTTP API
 */
export const sendEmail = async (options: EmailOptions) => {
    try {
        // Fetch global system settings from DB
        const settings = await SettingsModel.findOne({});
        if (!settings) throw new ApiError('Settings not found', 500);

        // Extract application name for sender branding
        const { systemSettings } = settings;
        const appName = systemSettings.appName || 'Short-Lynkr';

        // Initialize Brevo transactional email API
        const emailApi = new TransactionalEmailsApi();
        // Attach Brevo API key for authentication
        emailApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

        // Create email payload
        const sendSmtpEmail = new SendSmtpEmail();
        sendSmtpEmail.subject = options.subject;// Email subject
        sendSmtpEmail.to = [{ email: options.to }]; // Recipient list
        sendSmtpEmail.htmlContent = options.html;// HTML version of email body
        sendSmtpEmail.textContent = options.text; // Plain-text fallback content
        sendSmtpEmail.sender = {
            name: process.env.BREVO_SENDER_NAME || appName,
            email: process.env.BREVO_SENDER_EMAIL!
        };// Sender details

        // Send the email using Brevo API
        const result = await emailApi.sendTransacEmail(sendSmtpEmail);
        console.log('Message sent!');
    } catch (error: any) {
        //  This will BREAK login if email fails
        throw new ApiError(error?.message || 'Error sending email', 500);
    }
};