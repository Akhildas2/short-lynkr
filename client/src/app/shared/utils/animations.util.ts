import { animate, state, keyframes, style, transition, trigger } from '@angular/animations';

// Zoom in on enter (once)
export const zoomInAnimation = trigger('zoomIn', [
    transition(':enter', [
        style({ transform: 'scale(0.4)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
    ])
]);

// Fade in on enter
export const fadeInAnimation = trigger('fadeIn', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 }))
    ])
]);

// Fade in and slide from left
export const fadeInLeftAnimation = trigger('fadeInLeft', [
    transition(':enter', [
        style({ transform: 'translateX(-20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
    ])
]);

// Slide in from bottom
export const slideInUpAnimation = trigger('slideInUp', [
    transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
    ])
]);