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

@Component({
    selector: 'app-users-management',
    imports: [SharedModule],
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
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    private destroy$ = new Subject<void>();

    usersEffect: any;

    constructor(private dialog: MatDialog) {
        // Effect to update the dataSource when users in the store change
        this.usersEffect = effect(() => {
            const users = this.adminStore.users();
            this.dataSource.data = users;
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

        // Subscribe to global search term changes
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

    applyStatusFilter(value: string) {
        this.statusFilter = value;
        this.applyFilter(this.globalSearchService.currentSearchTerm.trim().toLowerCase(), value);
    }

    applyFilter(search: string, status: string) {
        this.dataSource.filter = JSON.stringify({ search, status });
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
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
        const icon = newStatus ? 'lock' : 'lock_open';

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