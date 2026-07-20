import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icons/icon.component';
import { FinanceViewModel } from './finance.viewmodel';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, IconComponent],
  templateUrl: './finance.component.html',
  providers: [FinanceViewModel],
})
export class FinanceComponent implements OnInit {
  protected readonly vm = inject(FinanceViewModel);

  ngOnInit(): void {
    this.vm.load();
  }
}
