import {Component, Input} from '@angular/core';
import {Invoice} from "../models/unity";
import {ModalService} from "../services/modal.service";
import {UnityService} from "../services/unity.service";

@Component({
  selector: 'app-purchase-info',
  templateUrl: './purchase-info.component.html',
  styleUrls: ['./purchase-info.component.scss']
})
export class PurchaseInfoComponent {
  @Input() public productInvoice: Invoice | null = null;

  constructor(
    protected modalService: ModalService,
    public unityService: UnityService
  ) {
  }

  public getVariantGroupTitle(invoiceVariantId: string): string | undefined {
    let variant = this.unityService.getVariantById(invoiceVariantId);
    return variant !== null ? variant?.variantGroup.name : '';
  }
}
