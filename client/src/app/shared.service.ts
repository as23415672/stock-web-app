import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

class News {
  source: string = '';
  datetime: number = 0;
  headline: string = '';
  url: string = '';
  summary: string = '';
  image: string = '';
}

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private alertTriggerSource = new Subject<any>();
  private renderResultSource = new Subject<any>();
  private clearPageSource = new Subject<any>();
  private hideResultSource = new Subject<any>();
  private submitTriggerSource = new Subject<any>();
  private changeFocusButtonSource = new Subject<any>();
  private updateSellableSource = new Subject<any>();
  private updatePortfolioSource = new Subject<any>();

  alertTrigger$ = this.alertTriggerSource.asObservable();
  renderResult$ = this.renderResultSource.asObservable();
  clearPage$ = this.clearPageSource.asObservable();
  hideResult$ = this.hideResultSource.asObservable();
  submitTrigger$ = this.submitTriggerSource.asObservable();
  changeFocusButton$ = this.changeFocusButtonSource.asObservable();
  updateSellable$ = this.updateSellableSource.asObservable();
  updatePortfolio$ = this.updatePortfolioSource.asObservable();

  triggerAlert(
    message: string,
    alertType: string,
    isDismissible: boolean = true,
    timeout: number | null = null
  ) {
    this.alertTriggerSource.next({
      message,
      alertType,
      isDismissible,
      timeout,
    });
  }

  renderResult(value: string) {
    this.renderResultSource.next({ value });
  }

  hideResult() {
    this.hideResultSource.next({});
  }

  clearPage() {
    this.clearPageSource.next({});
  }

  triggerSubmit(symbol: string) {
    this.submitTriggerSource.next({ symbol });
  }

  changeFocusButton(symbol: string) {
    this.changeFocusButtonSource.next({ symbol });
  }

  updateSellable() {
    this.updateSellableSource.next({});
  }

  updatePortfolio() {
    this.updatePortfolioSource.next({});
  }
}
