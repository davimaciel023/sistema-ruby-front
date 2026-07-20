import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icons/icon.component';
import { StudyViewModel } from './study.viewmodel';

@Component({
  selector: 'app-study',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './study.component.html',
  providers: [StudyViewModel],
})
export class StudyComponent implements OnInit {
  protected readonly vm = inject(StudyViewModel);

  ngOnInit(): void {
    this.vm.load();
  }
}
