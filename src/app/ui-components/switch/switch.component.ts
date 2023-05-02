import {trigger, transition, animate, style, state} from '@angular/animations';

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import {Subject} from 'rxjs';
import {Variant} from "../../types/unity";

@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  animations: [
    trigger('selectedOptionMove', [
      state(
        '*',
        style({
          transform: `translateX({{moveTo}}px)`,
        }),
        {params: {moveTo: 0}},
      ),
      transition('* => *', [animate('400ms ease-out')]),
    ]),
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent implements AfterViewInit, OnInit {
  @Input()
  public options!: Array<Variant>;

  @Input()
  public selectedOption!: string;

  @Input()
  public selectedOptionTitle!: string;

  @Input()
  public disabled!: boolean;

  @Input()
  public variantChange!: Subject<string[]>;

  public productId!: string;

  public isViewInit = false;

  @ViewChildren('option', {read: ElementRef})
  public optionElements!: QueryList<ElementRef>;

  @Output() optionSelected = new EventEmitter<{ materialId: string; productId: string }>();

  public constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    for (const option of this.options) {
      if (option.id === this.selectedOption) {
        this.selectOption(option.id, option.productId, option.title);
      }
    }
  }

  public ngAfterViewInit(): void {
    this.isViewInit = true;
    const optionsMap = new Map<string, { materialId: string; productId: string; materialTitle: string }>();

    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];

      optionsMap.set(option.id, {materialId: option.id, productId: option.productId, materialTitle: option.title});
    }

    this.variantChange.subscribe((selectedVariants) => {
      selectedVariants.forEach((selectedVariant) => {
        if (optionsMap.has(selectedVariant)) {
          const material = optionsMap.get(selectedVariant);
          if (material) {
            this.selectOption(material.materialId, material.productId, material.materialTitle);
          }
        }
      });
    });

    this.changeDetectorRef.detectChanges();
  }

  public getTranslateXForOption(selectedOption: string): number {
    const width = [];

    for (let i = 0; i < this.optionElements.length; i++) {
      const option = this.optionElements.get(i);

      width.push(option?.nativeElement.clientWidth);
    }

    const index = this.options ? this.options.map((option) => option.id).indexOf(selectedOption) : 0;

    let translateX = 0;

    if (index === 0) {
      return translateX;
    }

    for (let i = 0; i < index; i++) {
      translateX += width[i];
    }
    return translateX;
  }

  public selectOption(materialId: string, productId: string, selectedOptionTitle: string): void {
    if (this.disabled || this.selectedOption === materialId) {
      return;
    }
    this.selectedOption = materialId;
    this.selectedOptionTitle = selectedOptionTitle;
    this.productId = productId;
    this.optionSelected.emit({materialId, productId});
  }

  public getIndex(selectedOption: string): number {
    return this.options ? this.options.map((option) => option.id).indexOf(selectedOption) : 0;
  }
}
