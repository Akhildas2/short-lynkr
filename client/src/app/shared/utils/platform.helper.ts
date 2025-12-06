// Platforms list
export const PLATFORMS = [
  'Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube',
  'GitHub', 'WhatsApp', 'Telegram', 'TikTok', 'Snapchat',
  'Pinterest', 'Reddit', 'Discord', 'Other'
];

// Platforms colors
export const PLATFORM_COlORS: Record<string, string> = {
  Facebook: 'text-blue-600',
  Instagram: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-transparent bg-clip-text',
  Twitter: 'text-sky-500',
  LinkedIn: 'text-blue-700',
  YouTube: 'text-red-600',
  GitHub: 'text-gray-800 dark:text-gray-200',
  WhatsApp: 'text-green-500',
  Telegram: 'text-sky-400',
  TikTok: 'text-teal-500',
  Snapchat: 'text-yellow-400',
  Pinterest: 'text-red-500',
  Reddit: 'text-orange-500',
  Discord: 'text-indigo-500',
  Other: 'text-gray-700 dark:text-gray-300'
};

// Icons
export const PLATFORM_ICONS: Record<string, string> = {
  Facebook: 'fab fa-facebook-f',
  Instagram: 'fab fa-instagram',
  Twitter: 'fab fa-twitter',
  LinkedIn: 'fab fa-linkedin-in',
  YouTube: 'fab fa-youtube',
  GitHub: 'fab fa-github',
  WhatsApp: 'fab fa-whatsapp',
  Telegram: 'fab fa-telegram-plane',
  TikTok: 'fab fa-tiktok',
  Snapchat: 'fab fa-snapchat-ghost',
  Pinterest: 'fab fa-pinterest-p',
  Reddit: 'fab fa-reddit-alien',
  Discord: 'fab fa-discord',
  Other: 'fas fa-globe'
};

// Base URLs
export const PLATFORM_BASE_URL: Record<string, string> = {
  Facebook: 'https://facebook.com/',
  Instagram: 'https://instagram.com/',
  LinkedIn: 'https://linkedin.com/in/',
  YouTube: 'https://youtube.com/@',
  Twitter: 'https://twitter.com/',
  GitHub: 'https://github.com/',
  WhatsApp: 'https://wa.me/',
  Telegram: 'https://t.me/',
  TikTok: 'https://www.tiktok.com/@',
  Snapchat: 'https://www.snapchat.com/add/',
  Pinterest: 'https://www.pinterest.com/',
  Reddit: 'https://www.reddit.com/user/',
  Discord: 'https://discord.com/users/',
  Other: ''
};

export const QR_FORMAT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  PNG: {
    bg: 'bg-blue-500/20 dark:bg-blue-400/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500/40 dark:border-blue-400/40',
    dot: 'bg-blue-700 dark:bg-blue-300 animate-pulse'
  },

  SVG: {
    bg: 'bg-purple-500/20 dark:bg-purple-400/20',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-500/40 dark:border-purple-400/40',
    dot: 'bg-purple-700 dark:bg-purple-300 animate-pulse'
  },

  JPG: {
    bg: 'bg-amber-500/20 dark:bg-amber-400/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/40 dark:border-amber-400/40',
    dot: 'bg-amber-700 dark:bg-amber-300 animate-pulse'
  },

  JPEG: {
    bg: 'bg-amber-500/20 dark:bg-amber-400/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/40 dark:border-amber-400/40',
    dot: 'bg-amber-700 dark:bg-amber-300 animate-pulse'
  }
};

export const QR_SIZE_COLORS: Record<number, { bg: string; text: string }> = {
  300: { bg: 'bg-blue-200 dark:bg-blue-700', text: 'text-blue-700 dark:text-white' },
  500: { bg: 'bg-emerald-200 dark:bg-emerald-700', text: 'text-emerald-700 dark:text-white' },
  750: { bg: 'bg-amber-200 dark:bg-amber-700', text: 'text-amber-700 dark:text-white' },
  1024: { bg: 'bg-purple-200 dark:bg-purple-700', text: 'text-purple-700 dark:text-white' }
};