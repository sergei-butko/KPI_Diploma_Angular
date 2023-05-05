import {Component, Input, OnInit, OnDestroy, ElementRef, ViewEncapsulation,} from '@angular/core';
import {ModalService} from "../services/modal.service";

@Component({
  selector: 'app-modal',
  templateUrl: 'modal.component.html',
  styleUrls: ['modal.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ModalComponent
  implements OnInit, OnDestroy {
  @Input() id?: string;

  public isOpen = false;

  private readonly element: any;

  constructor(
    private modalService: ModalService,
    private elementRef: ElementRef
  ) {
    this.element = elementRef.nativeElement;
  }

  ngOnInit() {
    this.modalService.add(this);

    document.body.appendChild(this.element);

    this.element.addEventListener('click', (elementRef: any) => {
      if (elementRef.target.className === 'app-modal') {
        this.close();
      }
    });
  }

  ngOnDestroy() {
    this.modalService.remove(this);
    this.element.remove();
  }

  open() {
    this.element.style.display = 'block';
    document.body.classList.add('app-modal-open');
    this.isOpen = true;
  }

  close() {
    this.element.style.display = 'none';
    document.body.classList.remove('app-modal-open');
    this.isOpen = false;
  }
}
