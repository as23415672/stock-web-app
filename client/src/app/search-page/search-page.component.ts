import { Component } from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { SearchResultComponent } from '../search-result/search-result.component';
import { SharedService } from '../shared.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [SearchBarComponent, SearchResultComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
})
export class SearchPageComponent {
  ticker: string = '';

  constructor(
    private route: ActivatedRoute,
    private sharedService: SharedService
  ) {}

  ngAfterViewInit() {
    this.route.params.subscribe((params) => {
      this.ticker = params['ticker'];
    });
    if (
      this.ticker != '' &&
      this.ticker != undefined &&
      this.ticker != 'home'
    ) {
      this.sharedService.triggerSubmit(this.ticker);
    }
  }
}
