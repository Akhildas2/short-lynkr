import { Component, inject } from '@angular/core';
import { AuthEffects } from '../../../state/auth/auth.effects';
import { AuthStore } from '../../../state/auth/auth.store';
import { SharedModule } from '../../../shared/shared.module';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../../shared/components/dialogs/alert-dialog/alert-dialog.component';
import { AccountSettingsDialogComponent } from '../../../shared/components/dialogs/account-settings-dialog/account-settings-dialog.component';
import { AuthUser } from '../../../models/auth/auth.model';

@Component({
    selector: 'app-profile',
    imports: [SharedModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent {
    private authStore = inject(AuthStore);

    constructor(private authEffect: AuthEffects, private dialog: MatDialog) {
        this.authEffect.checkAuthStatus();
    }

    readonly user = this.authStore.user;
    readonly isAuthenticated = this.authStore.isAuthenticated;
    readonly stats = this.authStore.profileStats;

    logout(): void {
        this.authEffect.logout();
    }

    openEditDialog() {
        this.dialog.open(AccountSettingsDialogComponent, {
            data: { mode: 'edit' },
            width: '500px'
        });
    }

    openPasswordDialog() {
        this.dialog.open(AccountSettingsDialogComponent, {
            data: { mode: 'password' },
            width: '500px',
            autoFocus: false,
            restoreFocus: false
        });
    }


    deleteUser(user: AuthUser) {
        const dialog = this.dialog.open(AlertDialogComponent, {
            data: {
                tilte: 'Delete User?',
                content: `Are you sure you want to delete the user "${user.username}"? This action cannot be undone.`,
                actionText: 'Delete',
                actionIcon: 'delete',
                confirmOnly: true
            }
        });

        dialog.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
                this.authEffect.deleteAccount();
            }
        });

    }
}
