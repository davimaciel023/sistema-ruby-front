import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icons/icon.component';
import { RepertoireViewModel } from './repertoire.viewmodel';

@Component({
  selector: 'app-repertoire',
  standalone: true,
  imports: [DatePipe, FormsModule, IconComponent],
  templateUrl: './repertoire.component.html',
  providers: [RepertoireViewModel],
})
export class RepertoireComponent implements OnInit {
  protected readonly vm = inject(RepertoireViewModel);

  ngOnInit(): void {
    this.vm.load();
  }
}
