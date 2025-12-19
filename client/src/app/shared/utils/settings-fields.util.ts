//Url
export const urlFields = [
    {
        title: 'URL Generation',
        items: [
            {
                type: 'select',
                label: 'Default URL Length',
                key: 'defaultLength',
                icon: 'link',
                options: [6, 7, 8, 9, 10].map(n => ({ label: n + ' chars', value: n })),
                validators: { required: true }
            },
            {
                type: 'checkbox',
                label: 'Allow URL Customization',
                key: 'urlCustomization',
                icon: 'link',
            },
            {
                type: 'checkbox',
                label: 'Allow custom slugs',
                key: 'allowCustomSlugs',
                icon: 'edit',
            },
        ],
    },
    {
        title: 'URL Policies',
        items: [
            { type: 'input', label: 'URL Expiration (days)', key: 'expirationDaysLimit', inputType: 'number', icon: 'event', validators: { required: true, min: 0, max: 365 } },
            { type: 'input', label: 'Max URLs per user', key: 'maxUrlsPerUser', inputType: 'number', icon: 'person', validators: { required: true, min: 1, max: 1000 } },
            { type: 'input', label: 'Max click per url', key: 'maxClickPerUrl', inputType: 'number', icon: 'mouse', validators: { required: true, min: 1, max: 10000 } },
            { type: 'checkbox', label: 'Enable URL expiration', key: 'enableExpiration', icon: 'timer' },
        ],
    },
];

//Qr
export const qrFields = (settings: any) => [
    {
        title: 'QR Code Appearance',
        items: [
            {
                type: 'select',
                label: 'Default Size',
                key: 'defaultSize',
                icon: 'qr_code_2',
                options: settings.allowedSizes.map((n: number) => ({ label: `${n} x ${n}`, value: n })),
            },
            {
                type: 'select',
                label: 'Default Format',
                key: 'defaultFormat',
                icon: 'image',
                options: settings.allowedFormat.map((f: 'PNG' | 'SVG' | 'JPEG') => ({ label: f, value: f })),
            },
            {
                type: 'color',
                label: 'Foreground Color',
                key: 'foregroundColor',
                icon: 'palette',
                validators: {
                    required: true,
                    pattern: '^#([A-Fa-f0-9]{6})$'
                }
            },
            {
                type: 'color',
                label: 'Background Color',
                key: 'backgroundColor',
                icon: 'format_color_fill',
                validators: {
                    required: true,
                    pattern: '^#([A-Fa-f0-9]{6})$'
                }
            },

        ],
    },

];

// Analytics
export const analyticsFields = [
    {
        title: 'Data Collection',
        items: [
            { type: 'checkbox', label: 'Track click analytics', key: 'trackClicks', icon: 'mouse' },
            { type: 'checkbox', label: 'Track user location (country/city)', key: 'trackLocation', icon: 'location_on' },
            { type: 'checkbox', label: 'Track device information', key: 'trackDevice', icon: 'devices' },
            { type: 'checkbox', label: 'Track referrer information', key: 'trackReferrer', icon: 'link' },
        ],
    },
    {
        title: 'Data Retention',
        items: [
            {
                type: 'select',
                label: 'Analytics Data Retention (days)',
                key: 'dataRetention',
                icon: 'storage',
                options: [
                    { label: '30 days', value: 30 },
                    { label: '90 days', value: 90 },
                    { label: '1 year', value: 365 },
                    { label: 'Forever', value: 0 },
                ],
            },
            { type: 'checkbox', label: 'Anonymize IP addresses', key: 'anonymizeIPs', icon: 'visibility_off' },
        ],
    },
];

// User
export const userFields = [
    {
        title: 'Registration Settings',
        items: [
            { type: 'checkbox', label: 'Allow new user registration', key: 'allowRegistration', icon: 'person_add' },
            { type: 'checkbox', label: 'Require email verification', key: 'requireEmailVerification', icon: 'mail' },
            { type: 'checkbox', label: 'Moderate new users', key: 'moderateNewUsers', icon: 'supervised_user_circle' },
        ],
    },
    {
        title: 'User Limits',
        items: [
            { type: 'input', label: 'Daily URL Creation Limit', key: 'dailyUrlLimit', inputType: 'number', icon: 'today', validators: { required: true, min: 1, max: 100 } },
            { type: 'input', label: 'Monthly URL Creation Limit', key: 'monthlyUrlLimit', inputType: 'number', icon: 'date_range', validators: { required: true, min: 1, max: 1000 } },
        ],
    },
];

// Notifications
export const notificationFields = [
    {
        title: 'Email Notifications',
        items: [
            { type: 'checkbox', label: 'Enable email alerts', key: 'emailAlerts', icon: 'notifications' },
            { type: 'checkbox', label: 'Security alerts', key: 'securityAlerts', icon: 'security' },
        ],
    },
];

// Security
export const securityFields = [
    {
        title: 'Security Settings',
        items: [
            { type: 'checkbox', label: 'Block malicious URLs', key: 'blockMaliciousUrls', icon: 'block' },
        ],
    }
];

// System
export const systemFields = [
    {
        title: 'General Settings',
        items: [
            { type: 'input', label: 'Application Name', key: 'appName', inputType: 'text', icon: 'apps', validators: { required: true, minLength: 3, maxLength: 20 } },
            { type: 'input', label: 'Support Email', key: 'supportEmail', inputType: 'email', icon: 'email', validators: { required: true, email: true } },
            { type: 'checkbox', label: 'Enable maintenance mode', key: 'maintenanceMode', icon: 'build' },
            { type: 'checkbox', label: 'Enable API access', key: 'enableApiAccess', icon: 'api' },
            { type: 'checkbox', label: 'Enable Auto Cleanup', key: 'enableAutoCleanup', icon: 'auto_delete' },
            { type: 'toggle', label: 'Multi-day maintenance', key: 'maintenanceIsMultiDay', icon: 'date_range' },
            { type: 'datetime', label: 'Maintenance Start', key: 'maintenanceStart', icon: 'calendar_today', validators: { required: true } },
            { type: 'datetime', label: 'Maintenance End', key: 'maintenanceEnd', icon: 'calendar_month', validators: { required: true } },
        ],
    },
    {
        title: 'Theme Settings',
        items: [
            {
                type: 'select',
                label: 'Theme Mode',
                key: 'themeMode',
                options: [
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                ],
            }
        ],
    }
]