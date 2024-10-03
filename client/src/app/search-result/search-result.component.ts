import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import {
  NgbModalModule,
  NgbModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { BuyStockModalComponent } from '../buy-stock-modal/buy-stock-modal.component';
import { SellStockModalComponent } from '../sell-stock-modal/sell-stock-modal.component';
import { SharedService } from '../shared.service';
import { StorageService } from '../storage.service';
import { News, Profile, Quote, Insider, round } from '../shared';
import { NewsModalComponent } from '../news-modal/news-modal.component';
import { Subscription, map, forkJoin, firstValueFrom, first } from 'rxjs';
import { format } from 'date-fns';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts/highstock';
import indic from 'highcharts/indicators/indicators';
import vbp from 'highcharts/indicators/volume-by-price';

const day = 86400000;
const minute = 60000;
const month = 2592000000;
const year = 31536000000;
const week = 604800000;

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    HighchartsChartModule,
    NgbModalModule,
    NewsModalComponent,
  ],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.scss',
})
export class SearchResultComponent {
  alertPlaceholder?: HTMLElement;
  starAlertPlaceholder?: HTMLElement;

  alertSubscription?: Subscription;
  renderResultSubscription?: Subscription;
  clearPageSubscription?: Subscription;
  updateSellableSubscription?: Subscription;

  showAlert = false;
  showStarAlert = false;
  isLoading = false;
  showResult = false;
  sellable = false;

  profile: Profile = new Profile();
  quote: Quote = new Quote();
  peer: Array<any> = [];
  news: Array<News> = [];
  insider: Insider = new Insider();
  currentTime = Date.now();
  favorites: any = [];
  starred = false;
  modalRef?: NgbModalRef;

  alertTimeout: any;
  starAlertTimeout: any;

  autoUpdateInterval: any;

  round: Function = round;

  Highcharts: typeof Highcharts = Highcharts;

  recentChartOptions: Highcharts.Options = {
    chart: {
      backgroundColor: '#f7f7f7',
    },

    title: {
      text: 'AAPL Stock Price',
    },

    legend: {
      enabled: false,
    },

    xAxis: {
      type: 'datetime',
    },

    yAxis: {
      title: { text: null },
      opposite: true,
    },

    plotOptions: {
      series: {
        marker: {
          enabled: false,
        },
      },
    },

    series: [
      {
        name: 'AAPL Stock Price',
        data: [],
        type: 'line',
        tooltip: {
          valueDecimals: 2,
        },
        color: '#ff0000',
      },
    ],
  };

  historicalChartOptions: Highcharts.Options = {
    chart: {
      backgroundColor: '#f7f7f7',
    },

    title: {
      text: 'AAPL Historical',
    },

    subtitle: {
      text: 'With SMA and Volume by Price technical indicators',
    },

    plotOptions: {
      series: {
        dataGrouping: {
          units: [
            ['week', [1]],
            ['month', [1, 2, 3, 4, 6]],
          ],
        },
      },
    },

    yAxis: [
      {
        startOnTick: false,
        endOnTick: false,
        labels: {
          align: 'right',
          x: -3,
        },
        title: {
          text: 'OHLC',
        },
        height: '60%',
        lineWidth: 2,
        resize: {
          enabled: true,
        },
      },
      {
        labels: {
          align: 'right',
          x: -3,
        },
        title: {
          text: 'Volume',
        },
        top: '65%',
        height: '35%',
        offset: 0,
        lineWidth: 2,
      },
    ],

    tooltip: {
      split: true,
    },

    series: [
      {
        type: 'candlestick',
        name: 'AAPL',
        id: 'price',
        zIndex: 2,
        data: [],
      },
      {
        type: 'column',
        name: 'Volume',
        id: 'volume',
        data: [],
        yAxis: 1,
      },
      {
        type: 'vbp',
        linkedTo: 'price',
        params: {
          volumeSeriesID: 'volume',
        },
        dataLabels: {
          enabled: false,
        },
        zoneLines: {
          enabled: false,
        },
      },
      {
        type: 'sma',
        linkedTo: 'price',
        zIndex: 1,
        marker: {
          enabled: false,
        },
      },
    ],
  };

  recommendationChartOptions: Highcharts.Options = {
    chart: {
      backgroundColor: '#f7f7f7',
    },
    title: {
      text: 'Recommendation Trends',
    },
    xAxis: {
      categories: ['Arsenal', 'Chelsea', 'Liverpool', 'Manchester United'],
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Count trophies',
      },
      stackLabels: {
        enabled: true,
      },
    },
    tooltip: {
      headerFormat: '<b>{point.x}</b><br/>',
      pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}',
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
        },
      },
    },
    series: [
      {
        type: 'column',
        name: 'Strong Buy',
        color: '#40bf00',
        data: [3, 5, 1, 13],
      },
      {
        type: 'column',
        name: 'Buy',
        color: '#00ff00',
        data: [3, 5, 1, 13],
      },
      {
        type: 'column',
        name: 'Hold',
        color: '#808000',
        data: [3, 5, 1, 13],
      },
      {
        type: 'column',
        name: 'Sell',
        color: '#ff0000',
        data: [3, 5, 1, 13],
      },
      {
        type: 'column',
        name: 'Strong Sell',
        color: '#bf4000',
        data: [3, 5, 1, 13],
      },
    ],
  };

  epsChartOptions: Highcharts.Options = {
    chart: {
      backgroundColor: '#f7f7f7',
    },
    title: {
      text: 'Historical EPS Surprises',
    },
    xAxis: [
      {
        categories: [],
        maxPadding: 0.05,
        showLastLabel: true,
      },
      {},
    ],
    yAxis: {
      title: {
        text: 'Quarterly EPS',
      },
    },
    series: [
      {
        name: 'Actual',
        type: 'spline',
        data: [],
      },
      {
        name: 'Estimate',
        type: 'spline',
        data: [],
      },
    ],
  };

  constructor(
    private sharedService: SharedService,
    private storageService: StorageService,
    private httpClient: HttpClient,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.alertPlaceholder = document.getElementById(
      'alertPlaceholder'
    ) as HTMLElement;

    this.starAlertPlaceholder = document.getElementById(
      'starAlertPlaceholder'
    ) as HTMLElement;

    this.alertSubscription = this.sharedService.alertTrigger$.subscribe(
      (data) => {
        this.triggerAlert(
          data.message,
          data.alertType,
          data.isDismissible,
          data.timeout
        );
      }
    );
    this.renderResultSubscription = this.sharedService.renderResult$.subscribe(
      (data) => {
        this.renderResult(data.value);
      }
    );
    this.clearPageSubscription = this.sharedService.clearPage$.subscribe(() => {
      this.showResult = false;
      this.showAlert = false;
      this.showStarAlert = false;
    });
    this.updateSellableSubscription =
      this.sharedService.updateSellable$.subscribe(() => {
        this.updateSellable();
      });
    this.sharedService.changeFocusButton('Search');

    indic(Highcharts);
    vbp(Highcharts);
  }

  ngOnDestroy() {
    this.alertSubscription?.unsubscribe();
  }

  triggerAlert(
    message: string,
    alertType: string,
    isDismissible: boolean = true,
    timeout: number | null = null
  ) {
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }
    if (this.alertPlaceholder) {
      var innerHtml = `
        <div class="alert alert-${alertType} ${
        isDismissible ? 'alert-dismissible' : ''
      }" role="alert">
          <div class="text-center fs-5">${message}</div>
          ${
            isDismissible
              ? '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
              : ''
          }
        </div>
        `;
      this.alertPlaceholder.innerHTML = innerHtml;
      this.showAlert = true;
      if (timeout) {
        this.alertTimeout = setTimeout(() => {
          this.showAlert = false;
        }, timeout);
      }
    }
  }

  triggerStarAlert(
    message: string,
    alertType: string,
    isDismissible: boolean = true,
    timeout: number | null = null
  ) {
    if (this.starAlertTimeout) {
      clearTimeout(this.starAlertTimeout);
    }
    if (this.starAlertPlaceholder) {
      var innerHtml = `
        <div class="alert alert-${alertType} ${
        isDismissible ? 'alert-dismissible' : ''
      }" role="alert">
          <div class="text-center fs-5">${message}</div>
          ${
            isDismissible
              ? '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
              : ''
          }
        </div>
        `;
      this.starAlertPlaceholder.innerHTML = innerHtml;
      this.showStarAlert = true;
      if (timeout) {
        this.starAlertTimeout = setTimeout(() => {
          this.showStarAlert = false;
        }, timeout);
      }
    }
  }

  openModal(news: News) {
    this.modalRef = this.modalService.open(NewsModalComponent, {});
    this.modalRef.componentInstance.news = news;
  }

  changeLoadingState(state: boolean) {
    this.isLoading = state;
  }

  async renderResult(value: string) {
    if (this.autoUpdateInterval) {
      clearInterval(this.autoUpdateInterval);
    }
    this.sharedService.clearPage();
    this.changeLoadingState(true);
    this.currentTime = Date.now();
    var responseStock: any;
    var responseData: any;

    let storedResponse = this.storageService.getSearchResult();

    if (storedResponse.searchTerm === value) {
      this.renderStock(
        storedResponse.searchStockResponse[0],
        storedResponse.searchStockResponse[1],
        storedResponse.searchStockResponse[2]
      );
      responseData = storedResponse.searchDataResponse;
    } else {
      responseStock = (await this.searchStock(value)) as any;
      if (responseStock[2].length == 0) {
        this.triggerAlert('Invalid ticker. Please try again.', 'danger');
        this.changeLoadingState(false);
        return;
      }

      this.renderStock(responseStock[0], responseStock[1], responseStock[2]);

      responseData = (await this.searchData()) as any;

      this.storageService.setSearchResult({
        searchTerm: value,
        searchStockResponse: responseStock,
        searchDataResponse: responseData,
      });
    }

    this.renderRecentChart(responseData[0]);
    this.renderNews(responseData[1]);
    this.renderHistoricalChart(responseData[2]);
    this.renderInsights([responseData[3], responseData[4], responseData[5]]);
    this.updateFavorite();
    this.updateSellable();

    if (this.quote.t * 1000 >= this.currentTime - 3 * minute) {
      this.autoUpdateInterval = setInterval(async () => {
        let response = await firstValueFrom(
          this.httpClient.get(`/api/quote/${this.profile.ticker}`)
        );
        console.log(response);
        this.quote = this.filterData<Quote>(new Quote(), response);
        this.currentTime = Date.now();
      }, 15000);
    }
    this.showResult = true;
    this.changeLoadingState(false);
  }

  async searchStock(ticker: string) {
    let requestProfile = this.httpClient.get(`/api/profile/${ticker}`);
    let requestQuote = this.httpClient.get(`/api/quote/${ticker}`);
    let requestPeer = this.httpClient.get(`/api/peer/${ticker}`);

    let response = await firstValueFrom(
      forkJoin([requestProfile, requestQuote, requestPeer])
    );
    return response;
  }

  async searchData() {
    let requestRecent = this.httpClient.get(
      `/api/history/${this.profile.ticker}/1/hour/${
        this.currentTime - 3 * minute <= this.quote.t * 1000
          ? this.currentTime - day
          : this.quote.t * 1000 - day
      }/${
        this.currentTime - 3 * minute <= this.quote.t * 1000
          ? this.currentTime
          : this.quote.t * 1000
      }`
    );

    let responseNews = this.httpClient.get(
      `/api/news/${this.profile.ticker}/${format(
        this.currentTime - week,
        'yyyy-MM-dd'
      )}/${format(this.currentTime, 'yyyy-MM-dd')}`
    );

    let responseHistorical = this.httpClient.get(
      `/api/history/${this.profile.ticker}/1/day/${
        this.currentTime - 2 * year
      }/${this.currentTime}`
    );

    let requestInsider = this.httpClient.get(
      `/api/insider/${this.profile.ticker}`
    );

    let requestRecommendation = this.httpClient.get(
      `/api/recommendation/${this.profile.ticker}`
    );

    let requestEarnings = this.httpClient.get(
      `/api/earnings/${this.profile.ticker}`
    );

    let response = await firstValueFrom(
      forkJoin([
        requestRecent,
        responseNews,
        responseHistorical,
        requestInsider,
        requestRecommendation,
        requestEarnings,
      ])
    );
    return response;
  }

  renderStock(profile: any, quote: any, peer: Array<any>) {
    this.profile = this.filterData<Profile>(new Profile(), profile);
    this.quote = this.filterData<Quote>(new Quote(), quote);
    this.peer = peer;
  }

  renderRecentChart(response: any) {
    let data = response.results.map((result: any) => [result.t, result.c]);
    this.recentChartOptions = {
      ...this.recentChartOptions,
      title: { text: `${this.profile.ticker} Stock Price` },
      series: [
        {
          ...this.recentChartOptions.series![0],
          data: data,
          name: `${this.profile.ticker} Stock Price`,
          color: this.quote.d < 0 ? '#ff0000' : '#009900',
        },
      ],
    };
  }

  renderNews(response: any) {
    let newsInstance = new News();
    this.news = response
      .filter(
        (news: News) =>
          news.image !== '' &&
          news.url !== '' &&
          news.summary !== '' &&
          news.headline !== '' &&
          news.datetime !== 0 &&
          news.source !== ''
      )
      .slice(0, 10)
      .map((news: any) => {
        return this.filterData<News>(newsInstance, news);
      });
  }

  renderHistoricalChart(response: any) {
    let ohlc = response.results.map((result: any) => [
      result.t,
      result.o,
      result.h,
      result.l,
      result.c,
    ]);
    let volume = response.results.map((result: any) => [result.t, result.v]);

    this.historicalChartOptions = {
      ...this.historicalChartOptions,
      title: { text: `${this.profile.ticker} Historical` },
      series: [
        {
          ...this.historicalChartOptions.series![0],
          data: ohlc,
          name: this.profile.ticker,
        },
        {
          ...this.historicalChartOptions.series![1],
          data: volume,
        },
        {
          ...this.historicalChartOptions.series![2],
        },
        {
          ...this.historicalChartOptions.series![3],
        },
      ],
    };
  }

  renderInsights(response: Array<any>) {
    let insider = response[0].data;

    let positive_mspr = insider.reduce((accumulator: any, current: any) => {
      return accumulator + (current.mspr > 0 ? current.mspr : 0);
    }, 0);
    let negative_mspr = insider.reduce((accumulator: any, current: any) => {
      return accumulator + (current.mspr < 0 ? current.mspr : 0);
    }, 0);
    let posive_change = insider.reduce((accumulator: any, current: any) => {
      return accumulator + (current.change > 0 ? current.change : 0);
    }, 0);
    let negative_change = insider.reduce((accumulator: any, current: any) => {
      return accumulator + (current.change < 0 ? current.change : 0);
    }, 0);

    this.insider = {
      mspr: {
        total: positive_mspr + negative_mspr,
        positive: positive_mspr,
        negative: negative_mspr,
      },
      change: {
        total: posive_change + negative_change,
        positive: posive_change,
        negative: negative_change,
      },
    };

    let recommendation = response[1];
    let strongBuy = recommendation.map((recommend: any) => recommend.strongBuy);
    let buy = recommendation.map((recommend: any) => recommend.buy);
    let hold = recommendation.map((recommend: any) => recommend.hold);
    let sell = recommendation.map((recommend: any) => recommend.sell);
    let strongSell = recommendation.map(
      (recommend: any) => recommend.strongSell
    );

    this.recommendationChartOptions = {
      ...this.recommendationChartOptions,
      xAxis: {
        categories: [
          recommendation[0].period,
          recommendation[1].period,
          recommendation[2].period,
          recommendation[3].period,
        ],
      },
      series: [
        {
          ...this.recommendationChartOptions.series![0],
          data: strongBuy,
        },
        {
          ...this.recommendationChartOptions.series![1],
          data: buy,
        },
        {
          ...this.recommendationChartOptions.series![2],
          data: hold,
        },
        {
          ...this.recommendationChartOptions.series![3],
          data: sell,
        },
        {
          ...this.recommendationChartOptions.series![4],
          data: strongSell,
        },
      ],
    };

    let earnings = response[2];
    let actual = earnings.map((earn: any) => earn.actual);
    let estimate = earnings.map((earn: any) => earn.estimate);
    console.log(earnings);
    this.epsChartOptions = {
      ...this.epsChartOptions,
      xAxis: {
        categories: earnings.map((earn: any) => {
          return `${earn.period}<br/>Surprise: ${earn.surprise}`;
        }),
      },
      series: [
        {
          ...this.epsChartOptions.series![0],
          data: actual,
        },
        {
          ...this.epsChartOptions.series![1],
          data: estimate,
        },
      ],
    };
  }

  async updateFavorite() {
    this.favorites = await firstValueFrom(
      this.httpClient.get('/api/watchlist')
    );
    this.starred = this.favorites.some(
      (favorite: any) => favorite.profile.ticker === this.profile.ticker
    );
  }

  async updateSellable() {
    let response = (await firstValueFrom(
      this.httpClient.get('/api/portfolio')
    )) as Array<any>;
    this.sellable = response.some(
      (portfolio: any) => portfolio.ticker === this.profile.ticker
    );
  }

  async favorite() {
    var response;
    if (this.starred) {
      response = await firstValueFrom(
        this.httpClient.delete(`/api/watchlist/${this.profile.ticker}`)
      );
      this.favorites = this.favorites.filter(
        (favorite: any) => favorite.profile.ticker !== this.profile.ticker
      );
      this.starred = false;
      this.triggerStarAlert(
        `${this.profile.ticker} removed from Watchlist.`,
        'danger',
        true,
        5000
      );
    } else {
      response = await firstValueFrom(
        this.httpClient.post(`/api/watchlist`, {
          profile: this.profile,
          quote: this.quote,
        })
      );
      this.favorites.push({ profile: this.profile, quote: this.quote });
      this.starred = true;
      this.triggerStarAlert(
        `${this.profile.ticker} added to Watchlist.`,
        'success',
        true,
        5000
      );
    }
  }

  buyStock(ticker: string) {
    this.modalRef = this.modalService.open(BuyStockModalComponent, {});
    this.modalRef.componentInstance.ticker = ticker;
  }

  sellStock(ticker: string) {
    this.modalRef = this.modalService.open(SellStockModalComponent, {});
    this.modalRef.componentInstance.ticker = ticker;
  }

  filterData<T extends object>(instance: T, source: any): T {
    let filtered = {} as T;
    for (const key of Object.keys(instance) as Array<keyof T>) {
      if (source.hasOwnProperty(key)) {
        filtered[key] = source[key];
      }
    }
    return filtered;
  }

  triggerSubmit(symbol: string) {
    this.sharedService.triggerSubmit(symbol);
  }
}
