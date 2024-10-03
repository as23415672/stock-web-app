import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, tap, map, Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchResultComponent } from '../search-result/search-result.component';
import { SharedService } from '../shared.service';
import { Option } from '../shared';
import { Subscription } from 'rxjs';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    SearchResultComponent,
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {
  searchTerm = new FormControl('');

  isLoading = false;

  autoCompleteOptions: Option[] = [];

  private cancelPendingAutocompleteRequest = new Subject<void>();
  private cancelPendingDataRequest = new Subject<void>();

  submitTriggerSubscription?: Subscription;

  constructor(
    private sharedService: SharedService,
    private storageService: StorageService,
    private httpClient: HttpClient,
    private location: Location
  ) {}

  ngOnInit() {
    this.searchTerm.valueChanges
      .pipe(
        tap(() => {
          this.isLoading = true;
          this.autoCompleteOptions = [];
          this.cancelPendingAutocompleteRequest.next();
        })
      )
      .subscribe((value) => {
        if (value && value.length > 0) {
          this.autoCompletes(value);
        } else {
          this.autoCompleteOptions = [];
          this.isLoading = false;
        }
      });

    this.submitTriggerSubscription =
      this.sharedService.submitTrigger$.subscribe((data) => {
        this.onSubmit(data.symbol);
        this.searchTerm.setValue(data.symbol);
      });
  }

  autoCompletes(value: string) {
    this.httpClient
      .get(`/api/auto-complete/${value}`)
      .pipe(takeUntil(this.cancelPendingAutocompleteRequest))
      .subscribe((data: any) => {
        this.autoCompleteOptions = data.filter(
          (option: Option) =>
            option.type === 'Common Stock' && !option.symbol.includes('.')
        );
        this.isLoading = false;
      });
  }

  onSubmit(value: string) {
    this.location.replaceState(`/search/${value}`);
    this.cancelPendingAutocompleteRequest.next();
    this.isLoading = false;

    value = value.toUpperCase();

    if (value === '') {
      this.sharedService.triggerAlert(
        'Please enter a valid ticker',
        'danger',
        false
      );
    } else {
      this.sharedService.renderResult(value);
    }
  }

  clear() {
    this.location.replaceState('/search/home');
    this.storageService.clear();
    this.sharedService.clearPage();
    this.searchTerm.setValue('');
  }
}
