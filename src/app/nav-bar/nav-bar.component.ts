import {Component} from '@angular/core';
import {UnityService} from "../services/unity.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  constructor(
    public unityService: UnityService,
    private route: ActivatedRoute,
  ) {
  }

  public closeUnity(): void {
    if (window.location.href.includes('product')) {
      this.unityService.quitUnity();
    }
  }
}
