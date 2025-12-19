import { Component, computed, effect, signal } from '@angular/core';
import { AdminSettingsEffects } from '../../../state/settings/settings.effects';
import { UserHeaderComponent } from '../../../shared/components/layouts/user/user-header/user-header.component';
import { UserFooterComponent } from '../../../shared/components/layouts/user/user-footer/user-footer.component';
import { SectionCardsComponent } from '../../../shared/components/sections/section-cards/section-cards.component';
import { SectionFaqComponent } from '../../../shared/components/sections/section-faq/section-faq.component';
import { Card, FAQ } from '../../../models/sections/section.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [UserHeaderComponent, UserFooterComponent, SectionCardsComponent, SectionFaqComponent, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  appName = 'Short Lynkr';

  // Core Capabilities
  coreCapabilities: Card[] = [
    {
      icon: 'fa-solid fa-link',
      title: 'Smart URL Shortening',
      description: 'Create secure short links with custom aliases, expiry dates, click limits, tags, and full control.',
      iconHex: '#2563EB',   // blue-600
      borderColor: '#2563EB'
    },
    {
      icon: 'fa-solid fa-qrcode',
      title: 'Custom QR Code Generator',
      description: 'Generate beautiful QR codes for URLs and social platforms with full customization.',
      iconHex: '#4F46E5',   // indigo-600
      borderColor: '#4F46E5'
    },
    {
      icon: 'fa-solid fa-chart-line',
      title: 'Analytics & Security',
      description: 'Track visitors by country, device, browser, and referrer. Protect users with monitoring.',
      iconHex: '#10B981',   // emerald-500
      borderColor: '#10B981'
    }
  ];


  // User Portal Features
  userFeatures: Card[] = [
    {
      icon: 'fa-solid fa-wand-magic-sparkles',
      title: 'Short Link Creation',
      items: ['Create custom short URLs', 'Expiry, click limits, tags', 'Edit, delete, block/unblock'],
      iconHex: '#0284C7',   // sky-600
      borderColor: '#0284C7'
    },
    {
      icon: 'fa-solid fa-qrcode',
      title: 'QR Generator',
      items: ['URL & social QR codes', 'Color, size, format control', 'Search & pagination for My QR'],
      iconHex: '#7C3AED',   // violet-600
      borderColor: '#7C3AED'
    },
    {
      icon: 'fa-solid fa-chart-line',
      title: 'In-Depth Analytics',
      items: ['Line, pie & geographical charts', 'Top links & device insights', 'Real-time click tracking'],
      iconHex: '#16A34A',   // green-600
      borderColor: '#16A34A'
    },
    {
      icon: 'fa-solid fa-user-gear',
      title: 'Profile & UI',
      items: ['Edit profile & change password', 'Notification filters & bulk actions', 'Light/Dark theme toggling'],
      iconHex: '#D97706',   // amber-600
      borderColor: '#D97706'
    },
    {
      icon: 'fa-solid fa-lock',
      title: 'Secure Auth Flow',
      items: ['Email & Google login/register', 'Forgot / Reset password', 'JWT secured'],
      iconHex: '#0891B2',   // cyan-600
      borderColor: '#0891B2'
    },
    {
      icon: 'fa-solid fa-magnifying-glass',
      title: 'List Management',
      items: ['Robust search & filter', 'Standardized pagination', 'Quick actions'],
      iconHex: '#9333EA',   // purple-600
      borderColor: '#9333EA'
    }
  ];


  // Admin Features
  adminFeatures: Card[] = [
    {
      icon: 'fa-solid fa-gauge-high',
      title: 'Dashboard & Overview',
      items: ['System status & quick actions', 'Charts, KPIs, traffic insights'],
      iconHex: '#DC2626',   // red-600
      borderColor: '#DC2626'
    },
    {
      icon: 'fa-solid fa-users-gear',
      title: 'User & Content Control',
      items: ['Add, edit, block/unblock users', 'URL & QR moderation', 'Global search & filtering'],
      iconHex: '#0D9488',   // teal-600
      borderColor: '#0D9488'
    },
    {
      icon: 'fa-solid fa-sliders',
      title: 'System Settings',
      items: ['System-wide configuration', 'Single edit/reset controls', 'Global notifications'],
      iconHex: '#EA580C',   // orange-600
      borderColor: '#EA580C'
    },
    {
      icon: 'fa-solid fa-sitemap',
      title: 'Security & Access',
      items: ['RBAC protection', 'Maintenance mode', 'Global theme control'],
      iconHex: '#475569',   // slate-600
      borderColor: '#475569'
    }
  ];


  // FAQs
  faqs = computed<FAQ[]>(() => [
    {
      question: `Is ${this.appName} really free?`,
      answer:
        'Yes. All core features, including URL shortening, QR code generation, and analytics, are completely free.'
    },
    {
      question: 'How does link security work?',
      answer:
        'The platform continuously monitors links and automatically blocks suspicious or malicious URLs. Users and administrators also have manual control.'
    },
    {
      question: 'Is this a production-ready project?',
      answer:
        'Absolutely. The system follows production-level architecture and is secured using JWT authentication with role-based access control (RBAC).'
    },
    {
      question: 'What types of QR codes can I generate?',
      answer:
        'You can generate URL QR codes and social media QR codes with full customization options, including colors, size, and format.'
    },
    {
      question: 'Do you track user analytics?',
      answer:
        'Yes. We track anonymous analytics such as total clicks, country, device, browser, and referrer data to help users understand traffic performance.'
    },
    {
      question: 'Is my data secure?',
      answer:
        'Yes. Security is a top priority. We use JWT-based authentication, role-based access control, malicious URL blocking, and continuous system monitoring.'
    },
    {
      question: 'Can I delete my links or QR codes?',
      answer:
        'Yes. You have full control to edit, disable, or permanently delete your URLs and QR codes from your dashboard at any time.'
    },
    {
      question: 'Can I delete my account?',
      answer:
        'Yes. You can permanently delete your account from the profile settings. This action is irreversible and will remove all associated data.'
    }
  ]);

  constructor(private settingsEffects: AdminSettingsEffects) {
    effect(() => {
      this.appName = this.settingsEffects.appName();
    });
  }

}