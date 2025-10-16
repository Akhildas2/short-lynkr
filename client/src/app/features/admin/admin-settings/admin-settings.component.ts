import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { AuthStore } from '../../../state/auth/auth.store';
import { AuthEffects } from '../../../state/auth/auth.effects';
import { MatDialog } from '@angular/material/dialog';
import { AccountSettingsDialogComponent } from '../../../shared/components/dialogs/account-settings-dialog/account-settings-dialog.component';
import { AdminSettings } from '../../../models/settings/adminSettings.interface';
import { SettingsTabComponent } from '../../../shared/components/forms/settings-tab/settings-tab.component';
import { analyticsFields, notificationFields, qrFields, securityFields, systemFields, urlFields, userFields } from '../../../shared/utils/settings-fields.util';
import { AdminSettingsEffects } from '../../../state/settings/settings.effects';
import { defaultAdminSettings } from '../../../models/settings/adminSettings-defaults';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-settings',
  imports: [SharedModule, SettingsTabComponent],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.scss'
})
export class AdminSettingsComponent implements OnInit {
  tabs = [
    { id: 'profile', label: 'Profile & Security', icon: 'person' },
    { id: 'url-settings', label: 'URL Settings', icon: 'link' },
    { id: 'qr-settings', label: 'QR Code Settings', icon: 'qr_code' },
    { id: 'analytics-settings', label: 'Analytics Settings', icon: 'analytics' },
    { id: 'users-settings', label: 'User Management', icon: 'groups' },
    { id: 'notifications-settings', label: 'Notifications', icon: 'notifications' },
    { id: 'security-settings', label: 'Security & Privacy', icon: 'security' },
    { id: 'system-settings', label: 'System Settings', icon: 'settings' },
  ];

  activeTab = this.tabs[0].id; // default

  public adminSettings: AdminSettings | null = null;
  private authStore = inject(AuthStore);
  private authEffect = inject(AuthEffects);
  private dialog = inject(MatDialog);
  private settingsEffect = inject(AdminSettingsEffects);

  readonly admin = this.authStore.user;
  readonly role = this.authStore.userRole;
  readonly isAdmin = computed(() => this.role() === 'admin');

  urlSettings = defaultAdminSettings.urlSettings;
  qrSettings = defaultAdminSettings.qrSettings;
  analyticsSettings = defaultAdminSettings.analyticsSettings;
  userSettings = defaultAdminSettings.userSettings;
  notificationSettings = defaultAdminSettings.notificationSettings;
  securitySettings = defaultAdminSettings.securitySettings;
  systemSettings = defaultAdminSettings.systemSettings;

  urlFields = urlFields;
  qrFields = qrFields;
  analyticsFields = analyticsFields;
  userFields = userFields;
  notificationFields = notificationFields;
  securityFields = securityFields;
  systemFields = systemFields;
  qrFieldsWithSettings = qrFields(this.qrSettings);

  constructor(private route: ActivatedRoute, private router: Router) {
    effect(() => {
      const settings = this.settingsEffect['store'].settings();
      if (!settings) return;

      this.urlSettings = { ...defaultAdminSettings.urlSettings, ...settings.urlSettings };
      this.qrSettings = { ...defaultAdminSettings.qrSettings, ...settings.qrSettings };
      this.analyticsSettings = { ...defaultAdminSettings.analyticsSettings, ...settings.analyticsSettings };
      this.userSettings = { ...defaultAdminSettings.userSettings, ...settings.userSettings };
      this.notificationSettings = { ...defaultAdminSettings.notificationSettings, ...settings.notificationSettings };
      this.securitySettings = { ...defaultAdminSettings.securitySettings, ...settings.securitySettings };
      this.systemSettings = { ...defaultAdminSettings.systemSettings, ...settings.systemSettings };
    });
  }

  ngOnInit(): void {
    this.authEffect.checkAuthStatus();
    this.settingsEffect.loadSettings();

    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab && this.tabs.some(t => t.id === tab)) {
        this.activeTab = tab;
        localStorage.setItem('activeAdminTab', tab);

        // Clear the tab query param from URL
        this.router.navigate([], { queryParams: { tab: null }, queryParamsHandling: 'merge' });
      } else {
        // fallback to localStorage
        const savedTab = localStorage.getItem('activeAdminTab');
        this.activeTab = this.tabs.find(t => t.id === savedTab)?.id || this.tabs[0].id;
      }
    });
  }


  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    localStorage.setItem('activeAdminTab', tabId);
  }

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


  // Save URL settings
  saveSettings(section?: string): void {

    const allSettings: Partial<AdminSettings> = {
      urlSettings: this.urlSettings,
      qrSettings: this.qrSettings,
      analyticsSettings: this.analyticsSettings,
      userSettings: this.userSettings,
      notificationSettings: this.notificationSettings,
      securitySettings: this.securitySettings,
      systemSettings: this.systemSettings,
    };

    this.settingsEffect.saveSettings(allSettings, section)
      .then(() => {
        this.settingsEffect.loadSettings(); // reload after save
      })
      .catch((err: any) => console.error(err));

  }


  // Reset URL settings
  resetSettings(section?: string): void {
    this.settingsEffect.resetSettings(section)
      .then((res: AdminSettings) => {
        if (!res) return;

        this.adminSettings = res;
        this.urlSettings = { ...defaultAdminSettings.urlSettings, ...res.urlSettings };
        this.qrSettings = { ...defaultAdminSettings.qrSettings, ...res.qrSettings };
        this.analyticsSettings = { ...defaultAdminSettings.analyticsSettings, ...res.analyticsSettings };
        this.userSettings = { ...defaultAdminSettings.userSettings, ...res.userSettings };
        this.notificationSettings = { ...defaultAdminSettings.notificationSettings, ...res.notificationSettings };
        this.securitySettings = { ...defaultAdminSettings.securitySettings, ...res.securitySettings };
        this.systemSettings = { ...defaultAdminSettings.systemSettings, ...res.systemSettings };
      })
      .catch((err: any) => console.error(err));
  }

  resetAllSettings() {
    this.resetSettings();
  }

}