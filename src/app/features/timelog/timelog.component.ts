import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icons/icon.component';
import { TimelogViewModel } from './timelog.viewmodel';

@Component({
  selector: 'app-timelog',
  standalone: true,
  imports: [DatePipe, FormsModule, IconComponent],
  templateUrl: './timelog.component.html',
  providers: [TimelogViewModel],
})
export class TimelogComponent implements OnInit {
  protected readonly vm = inject(TimelogViewModel);

  ngOnInit(): void {
    this.vm.load();
  }
}
