import { Component, effect } from '@angular/core';
import { ContactMessage } from '../../../models/contact/contactMessage.interface';
import { ContactService } from '../../../core/services/api/contact/contact.service';
import { SnackbarService } from '../../../shared/services/snackbar/snackbar.service';
import { SharedModule } from '../../../shared/shared.module';
import { AlertDialogComponent } from '../../../shared/components/dialogs/alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { EmptyStateComponent } from '../../../shared/components/ui/empty-state/empty-state.component';
import { GlobalSearchService } from '../../../shared/services/global-search/global-search.service';
import { CONTACT_FILTER_TEXT_CLASS, CONTACT_STATUS_CLASS } from '../../../shared/utils/contact-status.util';

@Component({
  selector: 'app-admin-contact',
  imports: [SharedModule, EmptyStateComponent],
  templateUrl: './admin-contact.component.html',
  styleUrl: './admin-contact.component.scss'
})
export class AdminContactComponent {
  messages: ContactMessage[] = [];
  isLoading = false;
  selectedMessage: ContactMessage | null = null;
  searchTerm = '';
  filteredMessages: ContactMessage[] = [];
  // pagination
  currentPage = 1;
  pageSize = 5;
  // filter
  selectedStatusFilter: 'all' | 'active' | 'pending' | 'closed' = 'all';

  constructor(
    private contactService: ContactService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private globalSearchService: GlobalSearchService
  ) {
    effect(() => this.loadMessages());

    this.globalSearchService.searchTerm$
      .subscribe(term => {
        this.searchTerm = term.toLowerCase().trim();
        this.applySearchAndFilter();
        this.currentPage = 1; // reset pagination
      });
  }

  ngOnInit() {
    this.loadMessages();
  }

  setStatusFilter(status: 'all' | 'active' | 'pending' | 'closed') {
    this.selectedStatusFilter = status;
    this.currentPage = 1;
    this.selectedMessage = null;
    this.applySearchAndFilter();
  }

  getStatusClass(status: 'active' | 'pending' | 'closed'): string {
    return CONTACT_STATUS_CLASS[status];
  }

  getFilterClass(): string {
    return CONTACT_FILTER_TEXT_CLASS[this.selectedStatusFilter];
  }

  getStatus(status: 'active' | 'pending' | 'closed') {
    return CONTACT_STATUS_CLASS[status];
  }

  get hasMessages(): boolean {
    return this.messages.length > 0;
  }

  get hasFilteredMessages(): boolean {
    return this.filteredMessages.length > 0;
  }

  get isSearchActive(): boolean {
    return !!this.searchTerm;
  }

  get isFilterActive(): boolean {
    return this.selectedStatusFilter !== 'all';
  }

  get paginatedMessages(): ContactMessage[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMessages.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredMessages.length / this.pageSize);
  }

  trackById(index: number, msg: ContactMessage) {
    return msg._id;
  }

  goToFirst() {
    if (this.currentPage === 1) return;
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.resetSelectionIfNeeded();
    }
  }

  goToLast() {
    if (this.currentPage === this.totalPages) return;
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.resetSelectionIfNeeded();
    }
  }

  nextPage() {
    if (this.currentPage === this.totalPages) return;
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.resetSelectionIfNeeded();
    }
  }

  prevPage() {
    if (this.currentPage === 1) return;
    if (this.currentPage > 1) {
      this.currentPage--;
      this.resetSelectionIfNeeded();
    }
  }

  resetSelectionIfNeeded() {
    if (
      this.selectedMessage &&
      !this.paginatedMessages.some(m => m._id === this.selectedMessage?._id)
    ) {
      this.selectedMessage = null;
    }
  }

  applySearchAndFilter() {
    let data = [...this.messages];
    this.selectedMessage = null;

    //  SEARCH FILTER
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(msg =>
        msg.name?.toLowerCase().includes(term) ||
        msg.email?.toLowerCase().includes(term) ||
        msg.subject?.toLowerCase().includes(term)
      );
    }

    //  STATUS FILTER
    if (this.selectedStatusFilter !== 'all') {
      data = data.filter(
        msg => msg.status === this.selectedStatusFilter
      );
    }

    this.filteredMessages = data;
  }


  setStatus(status: 'active' | 'pending' | 'closed') {
    if (!this.selectedMessage) return;
    this.selectedMessage.status = status;
    this.contactService.changeMessageStatus(this.selectedMessage._id, status).subscribe(() => {
      this.snackbarService.showSuccess(`Status changed to ${status}`);
    });
  }

  replyByMail() {
    if (!this.selectedMessage?.email) {
      this.snackbarService.showError('Email address not available');
      return;
    }

    const to = encodeURIComponent(this.selectedMessage.email);
    const subject = encodeURIComponent(
      `Re: ${this.selectedMessage.subject || 'Inquiry'}`
    );

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}`,
      '_blank',
      'noopener'
    );
  }


  loadMessages() {
    this.isLoading = true;
    this.contactService.getMessages().subscribe({
      next: (data) => {
        this.messages = data ?? [];
        this.applySearchAndFilter();
        this.currentPage = 1;
        this.selectedMessage = null;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  toggleReadStatus(message: ContactMessage) {
    const newStatus = !message.isRead;
    this.contactService.markAsRead(message._id, newStatus).subscribe(() => {
      message.isRead = newStatus;
      this.snackbarService.showSuccess(`Marked as ${newStatus ? 'read' : 'unread'}`);
    });
  }

  async deleteMessage(message: ContactMessage) {
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Delete Inquiry Message',
        content: `Are you sure you want to delete the inquiry message "${message.subject}"? This action cannot be undone.`,
        actionText: 'Delete',
        actionIcon: 'delete',
        confirmOnly: true
      }
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) return;

    this.contactService.deleteMessage(message._id).subscribe(() => {

      this.messages = this.messages.filter(m => m._id !== message._id);

      if (this.selectedMessage?._id === message._id) {
        this.selectedMessage = null;
      }

      this.snackbarService.showSuccess('Message deleted');
    });

  }

  selectMessage(message: ContactMessage) {
    this.selectedMessage = message;
    if (!message.isRead) {
      this.toggleReadStatus(message);
    }
  }

}