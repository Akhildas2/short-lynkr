import { Component, effect, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { AdminStore } from '../../../state/admin/admin.store';
import { AdminEffects } from '../../../state/admin/admin.effects';
import { MatTableDataSource } from '@angular/material/table';
import { User } from '../../../models/user/user.model';
import { MatDialog } from '@angular/material/dialog';
import { AdminUserDialogComponent } from '../../../shared/components/dialogs/admin-user-dialog/admin-user-dialog.component';

@Component({
    selector: 'app-users-management',
    imports: [SharedModule],
    templateUrl: './users-management.component.html',
    styleUrl: './users-management.component.scss'
})
export class UsersManagementComponent implements OnInit {
    private adminStore = inject(AdminStore);
    private adminEffects = inject(AdminEffects);

    displayedColumns: string[] = ['username', 'email', 'role', 'isBlocked', 'actions'];
    dataSource = new MatTableDataSource<User>();
    constructor(private dialog: MatDialog) { }

    usersEffect = effect(() => {
        const users = this.adminStore.users();
        this.dataSource.data = users;
    })

    ngOnInit(): void {
        this.adminEffects.fetchAllUsers();
    }

    openAddUserDialog() {
        const dialogRef = this.dialog.open(AdminUserDialogComponent, {
            width: '500px',
            data: { mode: 'add' },
            autoFocus: false,
            restoreFocus: false
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) this.adminEffects.fetchAllUsers();
        });
    }

    openEditUserDialog(user: User) {
        const dialogRef = this.dialog.open(AdminUserDialogComponent, {
            width: '500px',
            data: { mode: 'edit', user }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) this.adminEffects.fetchAllUsers();
        });
    }

}