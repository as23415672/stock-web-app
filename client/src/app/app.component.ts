import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { FooterComponent } from './footer/footer.component';

window.addEventListener('resize', () => {});

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'client';
  height = 0;

  ngAfterViewChecked() {
    this.height =
      window.innerHeight -
      document.getElementById('navbar')!.offsetHeight -
      document.getElementById('footer')!.offsetHeight -
      1;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.height =
      event.target.innerHeight -
      document.getElementById('navbar')!.offsetHeight -
      document.getElementById('footer')!.offsetHeight -
      1;
  }
}
