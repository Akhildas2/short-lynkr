import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-settings-tab',
  imports: [SharedModule],
  templateUrl: './settings-tab.component.html',
  styleUrl: './settings-tab.component.scss'
})
export class SettingsTabComponent {
  private snackbarService = inject(SnackbarService);

  @Input() title!: string;
  @Input() description!: string;
  @Input() settings: any;
  @Input() fields: any[] = [];
  @Input() sectionKey?: string;
  @Input() showResetAll = false;

  @Output() save = new EventEmitter<any>();
  @Output() reset = new EventEmitter<string>();
  @Output() resetAll = new EventEmitter<void>();

  validateDailyVsMonthly(): boolean {
    if (!this.settings) return true;

    const daily = Number(this.settings['dailyUrlLimit']);
    const monthly = Number(this.settings['monthlyUrlLimit']);

    if (daily > monthly) {
      return false; // invalid
    }
    return true; // valid
  }

  onSave() {
    if (!this.validateDailyVsMonthly()) {
      return this.snackbarService.showError('Daily URL limit cannot be greater than monthly URL limit.')
    }
    this.save.emit(this.sectionKey);
  }

  onReset() {
    if (this.sectionKey) {
      this.reset.emit(this.sectionKey);
    } else {
      this.reset.emit();
    }
  }

  onResetAll() {
    this.resetAll.emit();
  }

}