import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { SharedService } from '../shared.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  NgbModalModule,
  NgbModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom, Subscription } from 'rxjs';
import { Profile, Quote, round, division } from '../shared';
import { BuyStockModalComponent } from '../buy-stock-modal/buy-stock-modal.component';
import { SellStockModalComponent } from '../sell-stock-modal/sell-stock-modal.component';

@Component({
  selector: 'app-portfolio-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    NgbModalModule,
  ],
  templateUrl: './portfolio-page.component.html',
  styleUrl: './portfolio-page.component.scss',
})
export class PortfolioPageComponent {
  isLoading = true;
  showAlert = false;
  showTransactionAlert = false;

  currentMoney = 25000;

  portfolio: Map<
    string,
    {
      quantity: number;
      totalCost: number;
    }
  > = new Map();
  profiles: Map<string, Profile> = new Map();
  quotes: Map<string, Quote> = new Map();

  keys: string[] = [];

  modalRef?: NgbModalRef;
  alertPlaceholder?: HTMLElement;

  alertSubscription?: Subscription;
  updateSubscription?: Subscription;

  round: Function = round;
  division: Function = division;

  alertTimeout: any;

  constructor(
    private sharedService: SharedService,
    private http: HttpClient,
    private modalService: NgbModal,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.alertPlaceholder = document.getElementById(
      'alertPlaceholder'
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

    this.updateSubscription = this.sharedService.updatePortfolio$.subscribe(
      () => {
        this.updatePortfolio();
      }
    );

    this.isLoading = true;
    this.sharedService.changeFocusButton('Portfolio');

    this.loadMoney();
    await this.loadPortfolio();
    await this.loadQuote();
    await this.loadProfile();
    this.keys = Array.from(this.portfolio.keys());
    this.showAlert = this.portfolio.size === 0;
    this.isLoading = false;
  }

  async loadMoney() {
    let response = (await firstValueFrom(this.http.get('/api/money'))) as any;
    this.currentMoney = response[0].money;
  }

  async loadPortfolio() {
    this.portfolio.clear();
    let response = (await firstValueFrom(
      this.http.get('/api/portfolio')
    )) as Array<any>;
    for (let portfolio of response) {
      if (this.portfolio.has(portfolio.ticker)) {
        this.portfolio.set(portfolio.ticker, {
          quantity:
            this.portfolio.get(portfolio.ticker)!.quantity + portfolio.quantity,
          totalCost:
            this.portfolio.get(portfolio.ticker)!.totalCost +
            portfolio.price * portfolio.quantity,
        });
      } else {
        this.portfolio.set(portfolio.ticker, {
          quantity: portfolio.quantity,
          totalCost: portfolio.price * portfolio.quantity,
        });
      }
    }
  }

  async loadQuote() {
    for (let ticker of this.portfolio.keys()) {
      let response = (await firstValueFrom(
        this.http.get('/api/quote/' + ticker)
      )) as any;
      this.quotes.set(ticker, response);
    }
  }

  async loadProfile() {
    for (let ticker of this.portfolio.keys()) {
      let response = (await firstValueFrom(
        this.http.get('/api/profile/' + ticker)
      )) as any;
      this.profiles.set(ticker, response);
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

  triggerAlert(
    message: string,
    alertType: string,
    isDismissible: boolean = true,
    timeout: number | null = null
  ) {
    console.log('trigger alert');
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }
    if (this.alertPlaceholder) {
      var innerHtml = `
        <div class="alert alert-${alertType} ${
        isDismissible ? 'alert-dismissible' : ''
      } mt-5" role="alert">
          <div class="text-center fs-5">${message}</div>
          ${
            isDismissible
              ? '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
              : ''
          }
        </div>
        `;
      this.alertPlaceholder.innerHTML = innerHtml;
      this.showTransactionAlert = true;
      if (timeout) {
        this.alertTimeout = setTimeout(() => {
          this.showTransactionAlert = false;
        }, timeout);
      }
    }
  }

  async updatePortfolio() {
    await this.loadPortfolio();
    await this.loadMoney();
    this.keys = Array.from(this.portfolio.keys());
    this.showAlert = this.portfolio.size === 0;
  }
}
