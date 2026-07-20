import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icons/icon.component';
import { DashboardViewModel } from './dashboard.viewmodel';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink, IconComponent],
  templateUrl: './dashboard.component.html',
  providers: [DashboardViewModel],
})
export class DashboardComponent implements OnInit {
  protected readonly vm = inject(DashboardViewModel);

  ngOnInit(): void {
    this.vm.load();
  }
}
