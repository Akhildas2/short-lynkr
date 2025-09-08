import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { AdminEffects } from '../../../state/admin/admin.effects';
import { AdminStore } from '../../../state/admin/admin.store';
import { SharedModule } from '../../../shared/shared.module';
import { filter, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../../shared/components/dialogs/alert-dialog/alert-dialog.component';
import { UrlEntry } from '../../../models/url/url.model';
import { PageEvent } from '@angular/material/paginator';
import { GlobalSearchService } from '../../../shared/services/global-search/global-search.service';
import { ClipboardService } from '../../../shared/services/clipboard/clipboard.service';
import { ScrollButtonsComponent } from '../../../shared/components/ui/scroll-buttons/scroll-buttons.component';

@Component({
    selector: 'app-urls-management',
    imports: [SharedModule,ScrollButtonsComponent],
    templateUrl: './urls-management.component.html',
    styleUrl: './urls-management.component.scss'
})
export class UrlsManagementComponent implements OnInit {
    private adminStore = inject(AdminStore);
    private adminEffect = inject(AdminEffects);
    private globalSearchService = inject(GlobalSearchService);
    private clipboardService = inject(ClipboardService);

    // Pagination state
    pageIndex = signal(0);
    pageSize = signal(10);
    totalItems = signal(0);

    // Filter property
    filterStatus = signal<'all' | 'active' | 'blocked'>('all');
    searchTerm = signal('');
    private destroy$ = new Subject<void>();

    constructor(private dialog: MatDialog) {
        effect(() => {
            this.totalItems.set(this.filteredUrls().length);
        });
    }

    urls = computed(() => this.adminStore.urls());

    // Reactive signal for filtered urls
    filteredUrls = computed(() => {
        const allUrls = this.urls();
        const currentFilter = this.filterStatus();
        const search = this.searchTerm().toLowerCase();

        return allUrls.filter(url => {
            const matchesStatus =
                currentFilter === 'all' ||
                (currentFilter === 'active' && !url.isBlocked) ||
                (currentFilter === 'blocked' && url.isBlocked);

            const matchesSearch =
                url.originalUrl.toLowerCase().includes(search) ||
                url.shortUrl.toLowerCase().includes(search) ||
                url.userId.username.toLowerCase().includes(search) ||
                url.userId.email.toLowerCase().includes(search);
            (url.topCountry?.toLowerCase() ?? '').includes(search);

            return matchesStatus && matchesSearch;
        });
    });

    // Computed for pagination
    filteredAndPaginatedUrls = computed(() => {
        const urls = this.filteredUrls();
        const startIndex = this.pageIndex() * this.pageSize();
        const endIndex = startIndex + this.pageSize();
        return urls.slice(startIndex, endIndex);
    });

    onFilterChange(status: 'all' | 'active' | 'blocked') {
        this.filterStatus.set(status);
        this.pageIndex.set(0);
    }

    async ngOnInit(): Promise<void> {
        await this.adminEffect.fetchAllUrls();
        this.totalItems.set(this.urls().length);

        this.globalSearchService.searchTerm$
            .pipe(takeUntil(this.destroy$))
            .subscribe(term => {
                this.searchTerm.set(term.trim().toLowerCase());
                this.pageIndex.set(0);
            });
    }

    handlePageEvent(event: PageEvent) {
        this.pageIndex.set(event.pageIndex);
        this.pageSize.set(event.pageSize);
    }

    clearFilters() {
        this.filterStatus.set('all');
        this.searchTerm.set('');
        this.globalSearchService.setSearchTerm('');
        this.pageIndex.set(0);
    }

    copyUrl(url: string): void {
        this.clipboardService.copyToClipboard(url);
    }

    async toggleBlockUrl(url: UrlEntry) {
        const newStatus = !url.isBlocked;
        const action = newStatus ? 'Block' : 'Unblock';
        const icon = newStatus ? 'block' : 'check_circle';

        const confirmed = await firstValueFrom(
            this.dialog.open(AlertDialogComponent, {
                data: {
                    title: `${action} URL`,
                    content: `Are you sure you want to ${action.toLowerCase()} the URL "${url.shortUrl}"?`,
                    actionText: action,
                    actionIcon: icon,
                    confirmOnly: true
                }
            }).afterClosed()
        );

        if (confirmed) {
            await this.adminEffect.toggleBlockUrl(url._id, newStatus);
            await this.adminEffect.fetchAllUrls();
        }

    }

    async deleteUrl(url: UrlEntry) {
        const confirmed = await firstValueFrom(this.dialog.open(AlertDialogComponent, {
            data: {
                title: 'Delete User',
                content: `Are you sure you want to delete the URL "${url.shortUrl}"? This action cannot be undone.`,
                actionText: 'Delete',
                actionIcon: 'delete',
                confirmOnly: true
            }
        }).afterClosed()
        );

        if (confirmed) {
            await this.adminEffect.deleteUrl(url._id);
        }
    }

}
