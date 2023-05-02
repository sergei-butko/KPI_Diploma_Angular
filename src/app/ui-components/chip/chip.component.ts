import {Component, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  @Input() model!: string;
  @Input() active!: boolean;
  @Output() modelActivated = new EventEmitter();

  public activateModel() {
    this.modelActivated.emit();
  }
}
