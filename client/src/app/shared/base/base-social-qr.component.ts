import { computed, effect, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SocialQrStore } from '../../state/qr/social-qr.store';
import { SocialQrEffects } from '../../state/qr/social-qr.effects';
import { SocialQrEntry } from '../../models/qr/socialQr.interface';
import { PLATFORM_COlORS, PLATFORM_ICONS, QR_FORMAT_COLORS, QR_SIZE_COLORS } from '../../shared/utils/platform.helper';
import { AlertDialogComponent } from '../../shared/components/dialogs/alert-dialog/alert-dialog.component';
import { SocialQrDialogComponent } from '../../shared/components/dialogs/social-qr-dialog/social-qr-dialog.component';

export type SocialQrFilterStatus = '' | 'jpeg' | 'png' | 'svg' | '300' | '500' | '750' | '1024';

export abstract class BaseSocialQrComponent {

    protected store = inject(SocialQrStore);
    protected effects = inject(SocialQrEffects);
    protected dialog = inject(MatDialog);

    isLoading = false;

    socialQrs = computed(() => this.store.socialQrs());

    platformIcons = PLATFORM_ICONS;
    platformColors = PLATFORM_COlORS;
    formatColors = QR_FORMAT_COLORS;
    QR_SIZE_COLORS = QR_SIZE_COLORS;

    //  Search & Filter
    searchTerm = signal('');
    filterStatus = signal<SocialQrFilterStatus>('');
    filterStatusLabel = signal('All');

    filterOptions: { label: string; value: SocialQrFilterStatus }[] = [
        { label: 'All', value: '' },
        { label: 'Jpeg', value: 'jpeg' },
        { label: 'Png', value: 'png' },
        { label: 'Svg', value: 'svg' },
        { label: '300', value: '300' },
        { label: '500', value: '500' },
        { label: '750', value: '750' },
        { label: '1024', value: '1024' },
    ];

    changeFilter(status: SocialQrFilterStatus) {
        this.filterStatus.set(status);
        const label = this.filterOptions.find(o => o.value === status)?.label ?? 'All';
        this.filterStatusLabel.set(label);
        this.pageIndex.set(0);
    }

    onFilterChange(value: string) {
        this.changeFilter(value as SocialQrFilterStatus);
    }

    filteredQrs = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();

        return this.socialQrs().filter(qr => {
            const matchesSearch =
                !term ||
                qr.accountUrl.toLowerCase().includes(term) ||
                qr.platform?.toLowerCase().includes(term) ||
                qr.format?.toLowerCase().includes(term);

            const matchesFilter =
                !this.filterStatus() ||
                qr.format?.toLowerCase() === this.filterStatus() ||
                qr.size?.toString() === this.filterStatus();

            return matchesSearch && matchesFilter;
        });
    });

    //  Pagination
    pageSize = signal(6);
    pageIndex = signal(0);

    paginatedQrs = computed(() => {
        const start = this.pageIndex() * this.pageSize();
        return this.filteredQrs().slice(start, start + this.pageSize());
    });

    constructor() {
        effect(() => {
            if (
                this.pageIndex() * this.pageSize() >= this.filteredQrs().length &&
                this.filteredQrs().length
            ) {
                this.pageIndex.set(0);
            }
        });
    }

    onPageChange(event: { pageIndex: number; pageSize: number }) {
        this.pageIndex.set(event.pageIndex);
        this.pageSize.set(event.pageSize);
    }

    //  Helpers
    getPlatformIcon(platform: string) {
        return this.platformIcons[platform] || 'fas fa-globe';
    }

    getPlatformColor(platform: string) {
        return this.platformColors[platform] || 'text-gray-500';
    }

    getFormatClasses(format: string) {
        const f = this.formatColors[format] ?? {
            bg: 'bg-gray-500',
            text: 'text-gray-700',
            border: 'border-gray-500'
        };
        return `${f.bg} ${f.text} ${f.border}`;
    }

    getFormatDotClasses(format: string) {
        return this.formatColors[format]?.dot || 'bg-gray-700';
    }

    //  Actions
    async viewOrEditQr(qr: SocialQrEntry, mode: 'view' | 'edit') {
        const ref = this.dialog.open(SocialQrDialogComponent, {
            width: '500px',
            data: { qrEntry: qr, mode }
        });

        ref.afterClosed().subscribe(async updated => {
            if (updated && mode === 'edit') {
                await this.effects.fetchSocialQrs();
            }
        });
    }

    deleteQr(qr: SocialQrEntry) {
        const ref = this.dialog.open(AlertDialogComponent, {
            data: {
                title: 'Delete QR Code?',
                content: `Are you sure you want to delete "${qr.accountUrl}"?`,
                actionText: 'Delete',
                actionIcon: 'delete',
                confirmOnly: true
            }
        });

        ref.afterClosed().subscribe(ok => {
            if (ok) this.effects.deleteSocialQr(qr._id);
        });
    }

    clearFilter() {
        this.filterStatus.set('');
        this.filterStatusLabel.set('All');
    }

    clearSearchAndFilter() {
        this.searchTerm.set('');
        this.clearFilter();
        this.pageIndex.set(0);
    }

}