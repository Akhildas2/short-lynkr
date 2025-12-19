import { AfterViewInit, Component, computed, effect, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { AdminStore } from '../../../state/admin/admin.store';
import { AdminEffects } from '../../../state/admin/admin.effects';
import { GlobalSearchService } from '../../../shared/services/global-search/global-search.service';
import { User } from '../../../models/user/user.model';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AdminUserDialogComponent } from '../../../shared/components/dialogs/admin-user-dialog/admin-user-dialog.component';
import { AlertDialogComponent } from '../../../shared/components/dialogs/alert-dialog/alert-dialog.component';
import { SharedModule } from '../../../shared/shared.module';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ErrorMessageComponent } from '../../../shared/components/ui/error-message/error-message.component';
import { ScrollButtonsComponent } from '../../../shared/components/ui/scroll-buttons/scroll-buttons.component';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/components/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-users-management',
  imports: [SharedModule, SpinnerComponent, ScrollButtonsComponent, ErrorMessageComponent, EmptyStateComponent],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.scss'
})
export class UsersManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  private adminStore = inject(AdminStore);
  private adminEffects = inject(AdminEffects);
  private dialog = inject(MatDialog);
  public globalSearchService = inject(GlobalSearchService);

  displayedColumns: string[] = ['username', 'email', 'role', 'isBlocked', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  statusFilter = '';
  statusFilterLabel = 'All';
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = signal(true);
  error = computed(() => this.adminStore.error());

  constructor() {
    effect(() => {
      const users = this.adminStore.users();
      if (users) {
        this.dataSource.data = users;

        // Use setTimeout to ensure view is ready
        setTimeout(() => {
          // Force sort to refresh after data update
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }

          // Force paginator to refresh
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }

          // Reapply current filter
          this.applyFilter(
            this.globalSearchService.currentSearchTerm.trim().toLowerCase(),
            this.statusFilter
          );
        });

      }
    });

  }

  async ngOnInit(): Promise<void> {
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


    // global search subscription
    this.globalSearchService.searchTerm$
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
        this.applyFilter(term.trim().toLowerCase(), this.statusFilter);
      });

    this.isLoading.set(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.adminEffects.fetchAllUsers();
    this.isLoading.set(false);

  }

  changeStatusFilter(value: string) {
    this.statusFilter = value;

    this.statusFilterLabel =
      value === '' ? 'All' :
        value === 'false' ? 'Active' :
          'Blocked';

    this.applyStatusFilter(value);
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

  clearSearch() {
    this.globalSearchService.setSearchTerm('');
    this.applyFilter('', this.statusFilter);
  }

  clearStatusFilter() {
    this.statusFilter = '';
    this.statusFilterLabel = 'All';
    const search = this.globalSearchService.currentSearchTerm.trim().toLowerCase();
    this.applyFilter(search, '');
  }

  clearSearchAndFilter() {
    this.statusFilter = '';
    this.statusFilterLabel = 'All';
    this.globalSearchService.setSearchTerm('');
    this.applyFilter('', '');
  }

  getRoleIcon(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin': return 'security';
      case 'moderator': return 'gavel';
      case 'user': return 'person';
      default: return 'help_outline';
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

  reloadUsers() {
    this.isLoading.set(true);
    this.adminEffects.fetchAllUsers();
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);
  }

}