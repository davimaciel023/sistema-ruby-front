import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icons/icon.component';
import { AgendaViewModel } from './agenda.viewmodel';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, IconComponent],
  templateUrl: './agenda.component.html',
  providers: [AgendaViewModel],
})
export class AgendaComponent implements OnInit {
  protected readonly vm = inject(AgendaViewModel);

  ngOnInit(): void {
    this.vm.load();
  }
}
