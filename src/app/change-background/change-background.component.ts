import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {UnityService} from "../services/unity.service";

@Component({
  selector: 'change-background',
  templateUrl: './change-background.component.html',
  styleUrls: ['change-background.component.scss'],
})
export class ChangeBackgroundComponent implements OnInit {

  public isSolidBackground = true;
  public unityBackground = '#C9BCB4FF';

  public showComponent: boolean = false;

  constructor(
    public unityService: UnityService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.unityService.initialized.subscribe(() => {
      this.updateBackgroundActiveState(true);
      this.showComponent = true;
      this.changeDetectorRef.detectChanges();
    });

    this.unityService.unityClosed.subscribe(() => {
      this.showComponent = false;
      this.changeDetectorRef.detectChanges();
    });
  }

  public updateBackgroundActiveState(targetState: boolean) {
    this.isSolidBackground = targetState;
    if (this.isSolidBackground) {
      this.unityService.changeBackgroundColor(this.unityBackground);
    } else {
      this.unityService.updateBackgroundActiveState(false);
    }
  }
}
