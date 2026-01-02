import nodemailer from 'nodemailer';
import { ApiError } from './ApiError';
import { EmailOptions } from '../types/emailOption.interface';
import SettingsModel from '../models/settings.model';

// Create a transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_API_KEY,
    },
});

/**
 * Sends an email using Brevo SMTP
 */

export const sendEmail = async (options: EmailOptions) => {
    try {
        const settings = await SettingsModel.findOne({});
        if (!settings) throw new ApiError('Settings not found', 500);

        const { systemSettings } = settings;
        const appName = systemSettings.appName || 'Short-Lynkr';

        const info = await transporter.sendMail({
            from: `"${appName}" <${process.env.EMAIL_USER}>`, // sender address
            to: options.to, // list of receivers
            subject: options.subject, // Subject line
            text: options.text, // plain text body
            html: options.html, // html body
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error: any) {
         throw new ApiError(
            error?.message || 'Error sending email',
            500
        );
    }
};