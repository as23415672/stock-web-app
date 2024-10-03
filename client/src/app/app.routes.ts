import { Routes } from '@angular/router';
import { SearchPageComponent } from './search-page/search-page.component';
import { WatchlistPageComponent } from './watchlist-page/watchlist-page.component';
import { PortfolioPageComponent } from './portfolio-page/portfolio-page.component';

export const routes: Routes = [
  { path: '', redirectTo: '/search/home', pathMatch: 'full' },
  { path: '/search/home', component: SearchPageComponent },
  { path: 'search/:ticker', component: SearchPageComponent },
  { path: 'watchlist', component: WatchlistPageComponent },
  { path: 'portfolio', component: PortfolioPageComponent },
];
