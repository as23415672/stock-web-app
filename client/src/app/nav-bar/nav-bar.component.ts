import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { StorageService } from '../storage.service';
import { Subscription } from 'rxjs';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, NgbCollapseModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent {
  title = 'nav-bar';
  selectedButton = '';

  isCollapsed = true;

  changeFocusButtonSubscription?: Subscription;

  constructor(
    private router: Router,
    private sharedService: SharedService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.changeFocusButtonSubscription =
      this.sharedService.changeFocusButton$.subscribe((data) => {
        this.selectedButton = data.symbol;
      });
  }

  onSearch() {
    let searchTerm = this.storageService.getSearchTerm();
    if (searchTerm !== '') {
      this.router.navigate(['/search', searchTerm]);
    } else {
      this.router.navigate(['/search/home']);
    }
  }
  onWatchList() {
    this.router.navigate(['/watchlist']);
  }
  onPortfolio() {
    this.router.navigate(['/portfolio']);
  }

  changeCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
}
