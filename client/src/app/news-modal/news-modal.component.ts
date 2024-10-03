import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { News } from '../shared';

@Component({
  selector: 'app-news-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-modal.component.html',
  styleUrl: './news-modal.component.scss',
})
export class NewsModalComponent {
  @Input() news?: News;

  constructor(public activeModal: NgbActiveModal) {}

  closeModal() {
    this.activeModal.close();
  }
}
