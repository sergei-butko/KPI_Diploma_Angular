import {Component, Input, EventEmitter, Output} from '@angular/core';
import {Product} from "../../types/unity";

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent {
  @Input() products!: Product[];
  @Input() selectedProduct!: string;
  @Output() productChanged = new EventEmitter<string>();

  public onProductChange(productId: string): void {
    this.selectedProduct = productId;
    this.productChanged.emit(this.selectedProduct);
  }
}
