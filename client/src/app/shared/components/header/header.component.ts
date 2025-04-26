import { Component } from '@angular/core';
import { MaterialModule } from '../../../../Material.Module';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isDarkMode = false;

  toggleDarkMode(){
    this.isDarkMode = !this.isDarkMode;
    const htmlElement = document.querySelector('html');

    if(this.isDarkMode){
      htmlElement?.classList.add('dark');
    }else{
      htmlElement?.classList.remove('dark')
    }
  }

}
