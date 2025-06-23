import { animate, style, transition, trigger } from '@angular/animations';

export const zoomInAnimation = trigger('zoomIn', [
    transition(':enter', [
        style({ transform: 'scale(0.4)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
    ])
]);

export const fadeInAnimation = trigger('fadeIn', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 }))
    ])
]);

export const fadeInLeftAnimation = trigger('fadeInLeft', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 }))
    ])
]);

export const slideInUpAnimation = trigger('slideInUp', [
    transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
    ])
]);