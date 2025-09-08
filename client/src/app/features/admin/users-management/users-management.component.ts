import { AfterViewInit, Component, effect, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { AdminStore } from '../../../state/admin/admin.store';
import { AdminEffects } from '../../../state/admin/admin.effects';
import { MatTableDataSource } from '@angular/material/table';
import { User } from '../../../models/user/user.model';
import { MatDialog } from '@angular/material/dialog';
import { AdminUserDialogComponent } from '../../../shared/components/dialogs/admin-user-dialog/admin-user-dialog.component';
import { AlertDialogComponent } from '../../../shared/components/dialogs/alert-dialog/alert-dialog.component';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { GlobalSearchService } from '../../../shared/services/global-search/global-search.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ScrollButtonsComponent } from '../../../shared/components/ui/scroll-buttons/scroll-buttons.component';

@Component({
    selector: 'app-users-management',
    imports: [SharedModule, ScrollButtonsComponent],
    templateUrl: './users-management.component.html',
    styleUrl: './users-management.component.scss'
})
export class UsersManagementComponent implements OnInit, AfterViewInit, OnDestroy {
    private adminStore = inject(AdminStore);
    private adminEffects = inject(AdminEffects);
    private globalSearchService = inject(GlobalSearchService);

    statusFilter = '';
    displayedColumns: string[] = ['username', 'email', 'role', 'isBlocked', 'actions'];

    dataSource = new MatTableDataSource<User>();
    private destroy$ = new Subject<void>();

    private _paginator!: MatPaginator;
    private _sort!: MatSort;

    @ViewChild(MatPaginator)
    set paginator(paginator: MatPaginator) {
        this._paginator = paginator;
        if (this.dataSource) {
            this.dataSource.paginator = this._paginator;
        }
    }

    @ViewChild(MatSort)
    set sort(sort: MatSort) {
        this._sort = sort;
        if (this.dataSource) {
            this.dataSource.sort = this._sort;
        }
    }

    constructor(private dialog: MatDialog) {
        effect(() => {
            this.dataSource.data = this.adminStore.users();
            if (this._sort) {
                this.dataSource.sort = this._sort;
            }
            if (this._paginator) {
                this.dataSource.paginator = this._paginator;
            }

        });

        // Custom filter predicate for global search
        this.dataSource.filterPredicate = (data: User, filter: string): boolean => {
            const { search, status } = JSON.parse(filter);

            const matchesSearch =
                data.username.toLowerCase().includes(search) ||
                data.email.toLowerCase().includes(search) ||
                data.role.toLowerCase().includes(search);

            const matchesStatus =
                status === '' || String(data.isBlocked) === status;

            return matchesSearch && matchesStatus;
        };

    }

    ngOnInit(): void {
        this.adminEffects.fetchAllUsers();

        // global search subscription
        this.globalSearchService.searchTerm$
            .pipe(takeUntil(this.destroy$))
            .subscribe(term => {
                this.applyFilter(term.trim().toLowerCase(), this.statusFilter);
            });
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    applyStatusFilter(status: string) {
        this.statusFilter = status;
        const search = this.globalSearchService.currentSearchTerm.trim().toLowerCase();
        this.applyFilter(search, status);
    }

    applyFilter(search: string, status: string) {
        this.dataSource.filter = JSON.stringify({ search, status });
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    clearFilters() {
        this.statusFilter = '';
        this.globalSearchService.setSearchTerm('');
        this.applyFilter('', '');
    }

    getRoleIcon(role: string): string {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'security';
            case 'moderator':
                return 'gavel';
            case 'user':
                return 'person';
            default:
                return 'help_outline';
        }
    }

    async openAddUserDialog() {
        const dialogRef = this.dialog.open(AdminUserDialogComponent, {
            width: '500px',
            data: { mode: 'add' },
            autoFocus: false,
            restoreFocus: false
        });

        const result = await firstValueFrom(dialogRef.afterClosed());
        if (result) {
            this.adminEffects.fetchAllUsers();
        }
    }

    async openEditUserDialog(user: User) {
        const dialogRef = this.dialog.open(AdminUserDialogComponent, {
            width: '500px',
            data: { mode: 'edit', user },
            autoFocus: false,
            restoreFocus: false
        });

        const result = await firstValueFrom(dialogRef.afterClosed());
        if (result) {
            this.adminEffects.fetchAllUsers();
        }
    }

    async deleteUser(user: User) {
        const dialogRef = this.dialog.open(AlertDialogComponent, {
            data: {
                title: 'Delete User',
                content: `Are you sure you want to delete the user "${user.username}"? This action cannot be undone.`,
                actionText: 'Delete',
                actionIcon: 'delete',
                confirmOnly: true
            }
        });

        const confirmed = await firstValueFrom(dialogRef.afterClosed());
        if (confirmed) {
            this.adminEffects.deleteUser(user._id);
        }
    }

    async toggleBlockUser(user: User) {
        const newStatus = !user.isBlocked;
        const action = newStatus ? 'Block' : 'Unblock';
        const icon = newStatus ? 'lock_person' : 'how_to_reg';

        const confirmed = await firstValueFrom(
            this.dialog.open(AlertDialogComponent, {
                data: {
                    title: `${action} User`,
                    content: `Are you sure you want to ${action.toLowerCase()} the user "${user.username}"?`,
                    actionText: action,
                    actionIcon: icon,
                    confirmOnly: true
                }
            }).afterClosed()
        );

        if (confirmed) {
            await this.adminEffects.toggleBlockUser(user._id, newStatus);
        }
    }

}