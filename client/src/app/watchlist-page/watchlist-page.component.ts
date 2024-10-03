import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SharedService } from '../shared.service';
import { round } from '../shared';

@Component({
  selector: 'app-watchlist-page',
  standalone: true,
  imports: [MatProgressSpinnerModule, HttpClientModule, CommonModule],
  templateUrl: './watchlist-page.component.html',
  styleUrl: './watchlist-page.component.scss',
})
export class WatchlistPageComponent {
  isLoading = true;

  showAlert = false;

  favorites: any = [];

  round: Function = round;

  constructor(
    private http: HttpClient,
    private sharedService: SharedService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sharedService.changeFocusButton('Watchlist');
    this.isLoading = true;
    this.loadWatchlist();
  }

  async loadWatchlist() {
    this.favorites = await firstValueFrom(this.http.get('/api/watchlist'));
    if (this.favorites.length === 0) {
      this.showAlert = true;
    }
    this.isLoading = false;
  }

  onClick(symbol: string) {
    this.router.navigate(['/search', symbol]);
  }

  async removeFromWatchlist(symbol: string) {
    this.isLoading = true;
    await firstValueFrom(this.http.delete(`/api/watchlist/${symbol}`));
    this.loadWatchlist();
  }
}
