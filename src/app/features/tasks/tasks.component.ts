import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icons/icon.component';
import { TasksViewModel } from './tasks.viewmodel';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [DatePipe, FormsModule, IconComponent],
  templateUrl: './tasks.component.html',
  providers: [TasksViewModel],
})
export class TasksComponent implements OnInit {
  protected readonly vm = inject(TasksViewModel);

  ngOnInit(): void {
    this.vm.load();
  }
}
