import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Quote } from '../shared';
import { SharedService } from '../shared.service';
import { round } from '../shared';

@Component({
  selector: 'app-buy-stock-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './buy-stock-modal.component.html',
  styleUrl: './buy-stock-modal.component.scss',
})
export class BuyStockModalComponent {
  @Input() ticker: string = '';

  quantity: number = 0;

  currentMoney: number = 0;

  currentPrice: number = 0;
  totalCost: number = 0;
  totalQuantity: number = 0;

  quote: Quote = new Quote();
  round: Function = round;

  constructor(
    public activeModal: NgbActiveModal,
    private http: HttpClient,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.loadMoney();
    this.loadPortfolio();
    this.loadCurrentQuote();
  }

  async loadMoney() {
    let response = (await firstValueFrom(this.http.get('/api/money'))) as any;
    this.currentMoney = response[0].money;
  }

  async loadPortfolio() {
    let response = (await firstValueFrom(
      this.http.get(`/api/portfolio/${this.ticker}`)
    )) as any;

    console.log(response);

    for (let portfolio of response) {
      this.totalCost += portfolio.quantity * portfolio.price;
      this.totalQuantity += portfolio.quantity;
    }
  }

  async loadCurrentQuote() {
    let response = (await firstValueFrom(
      this.http.get('/api/quote/' + this.ticker)
    )) as any;
    this.quote = response;
    this.currentPrice = this.quote.c;
  }

  async buyStock() {
    this.currentMoney -= this.currentPrice * this.quantity;
    this.totalCost += this.currentPrice * this.quantity;
    let postPortfolio = this.http.post('/api/portfolio', {
      ticker: this.ticker,
      quantity: this.quantity,
      price: this.currentPrice,
      time: Date.now(),
    });
    let postMoney = this.http.post('/api/money', {
      money: this.currentMoney,
    });
    let response = await firstValueFrom(forkJoin([postPortfolio, postMoney]));
    console.log(response);
    this.quantity = 0;
    this.sharedService.triggerAlert(
      this.ticker + ' bought successfully!',
      'success',
      true,
      5000
    );
    await this.sharedService.updateSellable();
    await this.sharedService.updatePortfolio();
    this.closeModal();
  }

  closeModal() {
    this.activeModal.close();
  }
}
