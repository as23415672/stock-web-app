import { Injectable } from '@angular/core';
import { Profile, Quote, News, Insider } from './shared';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private searchTerm: string = '';
  private searchStockResponse: Array<any> = [];
  private searchDataResponse: Array<any> = [];

  setSearchResult(data: any) {
    this.searchTerm = data.searchTerm;
    this.searchStockResponse = data.searchStockResponse;
    this.searchDataResponse = data.searchDataResponse;
  }

  getSearchResult() {
    return {
      searchTerm: this.searchTerm,
      searchStockResponse: this.searchStockResponse,
      searchDataResponse: this.searchDataResponse,
    };
  }

  updateSearchStockResponse(data: any) {
    this.searchStockResponse = data;
  }

  getSearchTerm() {
    return this.searchTerm;
  }

  clear() {
    this.searchTerm = '';
    this.searchStockResponse = [];
    this.searchDataResponse = [];
  }
}
