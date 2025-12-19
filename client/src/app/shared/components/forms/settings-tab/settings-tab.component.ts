import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';
import { DateAdapter } from '@angular/material/core';
import { combineDateAndTime, getFormattedTime, getTimeString, isToday, parseTime } from '../../../utils/date.helpers';
import { zoomInAnimation } from '../../../utils/animations.util';
import { FormControl, FormGroup } from '@angular/forms';
import { colorContrastValidator } from '../../../utils/colorValidator';

@Component({
  selector: 'app-settings-tab',
  imports: [SharedModule],
  templateUrl: './settings-tab.component.html',
  styleUrl: './settings-tab.component.scss',
  animations: [zoomInAnimation]
})
export class SettingsTabComponent implements OnChanges {
  private snackbarService = inject(SnackbarService);

  // Date constraints
  minDate = new Date(); // today
  maxDate = new Date(new Date().setDate(new Date().getDate() + 30)); // today + 30 days

  // Properties for min-time validation
  minStartTime: string | null = null;
  minEndTime: string | null = null;

  @Input() title!: string;
  @Input() description!: string;
  @Input() settings: any;
  @Input() fields: any[] = [];
  @Input() sectionKey?: string;
  @Input() showResetAll = false;

  @Output() save = new EventEmitter<any>();
  @Output() reset = new EventEmitter<string>();
  @Output() resetAll = new EventEmitter<void>();

  constructor(private adapter: DateAdapter<any>) {
    this.adapter.setLocale('en-GB'); // dd/MM/yyyy
  }

  ngOnChanges(): void {
    if (this.settings?.maintenanceStart) {
      this.settings.maintenanceStartTime = getTimeString(this.settings.maintenanceStart);
    }
    if (this.settings?.maintenanceEnd) {
      this.settings.maintenanceEndTime = getTimeString(this.settings.maintenanceEnd);
    }

    this.updateMinTimes();
  }

  /** Updates min-time properties based on selected dates */
  updateMinTimes() {
    const nowTime = getFormattedTime(new Date());

    this.minStartTime = isToday(this.settings.maintenanceStart) ? nowTime : null;
    this.minEndTime = isToday(this.settings.maintenanceEnd) ? nowTime : null;
  }

  /** Called by the (dateChange) event */
  onDateChange() {
    this.updateMinTimes();

    if (!this.settings.maintenanceStart) {
      this.settings.maintenanceStartTime = '';
    }
    if (!this.settings.maintenanceEnd) {
      this.settings.maintenanceEndTime = '';
    }
  }


  /** Validates daily vs monthly URL limits */
  validateDailyVsMonthly(): boolean {
    const daily = Number(this.settings?.dailyUrlLimit ?? 0);
    const monthly = Number(this.settings?.monthlyUrlLimit ?? 0);

    if (daily > monthly) {
      this.snackbarService.showError('Daily URL limit cannot be greater than monthly URL limit.');
      return false;
    }

    return true;
  }

  /** Validate maintenance dates */
  validateMaintenanceDates(): boolean {
    const startDate = this.settings.maintenanceStart;
    const endDate = this.settings.maintenanceEnd;
    const startTime = this.settings.maintenanceStartTime;
    const endTime = this.settings.maintenanceEndTime;

    if (!startDate) { this.snackbarService.showError('Maintenance start date is required.'); return false; }
    if (!startTime) { this.snackbarService.showError('Maintenance start time is required.'); return false; }
    if (!endDate) { this.snackbarService.showError('Maintenance end date is required.'); return false; }
    if (!endTime) { this.snackbarService.showError('Maintenance end time is required.'); return false; }

    const startTimeObj = parseTime(startTime);
    const endTimeObj = parseTime(endTime);

    if (!startTimeObj || !endTimeObj) {
      this.snackbarService.showError('Invalid time format. Please select a valid time.');
      return false;
    }

    const start = combineDateAndTime(startDate, startTimeObj);
    const end = combineDateAndTime(endDate, endTimeObj);

    if (start.getTime() > end.getTime()) {
      this.snackbarService.showError('Maintenance end time cannot be before the start time.');
      return false;
    }

    if (start.getTime() === end.getTime()) {
      this.snackbarService.showError('Start and end time cannot be the same.');
      return false;
    }

    const now = new Date();
    if (start.getTime() < now.getTime()) {
      this.snackbarService.showError('Maintenance start time cannot be in the past.');
      return false;
    }

    // Merge date+time for backend
    this.settings.maintenanceStart = start;
    this.settings.maintenanceEnd = end;

    return true;
  }


  getFormError(errorKey: string): boolean {
    // Check if we have a FormGroup reference
    if (!this.settings) return false;

    // For color validation, we need to check both fields together
    if (errorKey === 'sameColor' || errorKey === 'lowContrast') {
      const fg = this.settings['foregroundColor'];
      const bg = this.settings['backgroundColor'];

      if (!fg || !bg) return false;

      // Create a temporary FormGroup to validate
      const tempGroup = new FormGroup({
        foregroundColor: new FormControl(fg),
        backgroundColor: new FormControl(bg)
      }, { validators: colorContrastValidator });

      return tempGroup.hasError(errorKey);
    }

    return false;
  }

  onSave() {
    if (!this.validateDailyVsMonthly()) return;
    // Check color contrast for QR settings
    if (this.sectionKey === 'qrSettings') {
      if (this.getFormError('sameColor')) {
        this.snackbarService.showError('Foreground and Background colors cannot be the same.');
        return;
      }

      if (this.getFormError('lowContrast')) {
        this.snackbarService.showError('These colors are too similar — the QR code may not be scannable.');
        return;
      }
      // Note: lowContrast is a warning, not blocking
    }
    if (this.settings['maintenanceMode']) {
      if (!this.validateMaintenanceDates()) return;
    }

    this.save.emit(this.sectionKey);
  }

  onReset() {
    this.reset.emit(this.sectionKey ?? '');
  }

  onResetAll() {
    this.resetAll.emit();
  }

}