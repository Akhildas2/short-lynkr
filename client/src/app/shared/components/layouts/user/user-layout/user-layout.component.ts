import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserHeaderComponent } from '../user-header/user-header.component';
import { UserFooterComponent } from '../user-footer/user-footer.component';

@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet, UserHeaderComponent, UserFooterComponent],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent {

}