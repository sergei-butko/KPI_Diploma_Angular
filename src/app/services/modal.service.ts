import {Injectable} from '@angular/core';
import {ModalComponent} from "../modal/modal.component";

@Injectable({providedIn: 'root'})
export class ModalService {
  private modals: ModalComponent[] = [];

  public add(modal: ModalComponent) {
    if (!modal.id || this.modals.find(x => x.id === modal.id)) {
      throw new Error('modal must have a unique id attribute');
    }

    this.modals.push(modal);
  }

  public remove(modal: ModalComponent) {
    this.modals = this.modals.filter(x => x === modal);
  }

  public open(id: string) {
    const modal = this.modals.find(x => x.id === id);

    if (!modal) {
      throw new Error(`modal '${id}' not found`);
    }

    modal.open();
  }

  public close() {
    const modal = this.modals.find(x => x.isOpen);
    modal?.close();
  }
}
