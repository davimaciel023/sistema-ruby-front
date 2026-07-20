import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icons/icon.component';
import { ContentViewModel } from './content.viewmodel';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [DatePipe, FormsModule, IconComponent],
  templateUrl: './content.component.html',
  providers: [ContentViewModel],
})
export class ContentComponent implements OnInit {
  protected readonly vm = inject(ContentViewModel);

  ngOnInit(): void {
    this.vm.load();
  }
}
