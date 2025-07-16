import { Component, computed, inject, OnInit } from '@angular/core';
import { AdminEffects } from '../../../state/admin/admin.effects';
import { AdminStore } from '../../../state/admin/admin.store';
import { effect } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
@Component({
    selector: 'app-urls-management',
    imports: [SharedModule],
    templateUrl: './urls-management.component.html',
    styleUrl: './urls-management.component.scss'
})
export class UrlsManagementComponent implements OnInit{
    private adminStore = inject(AdminStore);
    private adminEffect = inject(AdminEffects);

    urls=computed(()=>this.adminStore.urls());
    async ngOnInit(): Promise<void> {
       await this.adminEffect.fetchAllUrls();
    }



}
