import {ChangeDetectorRef, Component, OnInit, Renderer2} from '@angular/core';
import {MaterialCache, MaterialGroup} from '../models/GroupedMaterialsModels';
import {ScriptService} from '../services/script.service';
import {Subject} from 'rxjs';
import {UnityService} from './unity.service';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-unity-loader',
  templateUrl: './unity-loader.component.html',
  styleUrls: ['./unity-loader.component.scss'],
})
export class UnityLoaderComponent implements OnInit {
  public isInitialized = false;
  public groupedMaterials: MaterialGroup[] = [];
  public isSolidBackground = false;
  public unityBackground = '#191919';
  public variantSetChangeEvent = new Subject<string[]>();

  constructor(
    public unityService: UnityService,
    private changeDetectorRef: ChangeDetectorRef,
    private renderer: Renderer2,
    private scriptService: ScriptService,
  ) {
  }

  public ngOnInit() {
    const scriptElement = this.scriptService.loadJsScript(
      this.renderer, `${environment.unityAssetsURL}/assets/Build/WebGLBuild.loader.js`);
    scriptElement.onload = () => {
      console.log('Load the Unity Script');
      this.unityService.initializeUnity().subscribe(() => {
        this.changeDetectorRef.detectChanges();
        if (this.isSolidBackground) {
          this.unityService.changeBackgroundColor(this.unityBackground)
        } else {
          this.unityService.updateBackgroundActiveState(false);
        }
      });

      this.unityService.productActiveStateChanged.subscribe(() => {
        this.isInitialized = true;
        this.groupMaterials();
        this.changeDetectorRef.detectChanges();
      });
    };
    scriptElement.onerror = () => {
      console.warn('Could not load the Unity Script!');
    };
  }

  public activateModel(productId: string, variantId: string): void {
    this.unityService.activateModelVariant(productId, variantId);
  }

  public activateMaterial(productId: string, variantId: string): void {
    this.unityService.activateMaterialVariant(productId, variantId);
  }

  public activateVariantSet(productId: string, variantSetId: string): void {
    this.unityService.activateVariantSet(productId, variantSetId);
    const variants: string[] = [];
    this.variantSetChangeEvent.next(variants);
  }

  public toggleBackground() {
    this.isSolidBackground = !this.isSolidBackground;
    if (this.isSolidBackground) {
      this.unityService.changeBackgroundColor(this.unityBackground);
    } else {
      this.unityService.updateBackgroundActiveState(false);
    }
  }

  public productChanged(productId: string): void {
    this.unityService.loadProduct(productId);
  }

  private groupMaterials() {
    const materials = this.unityService.productMaterials;
    const cache: MaterialCache = {};

    this.groupedMaterials = [];

    for (let i = 0; i < materials.length; i++) {
      if (cache[materials[i].variantGroup.id] || cache[materials[i].variantGroup.id] === 0) {
        const index = cache[materials[i].variantGroup.id];
        materials[i].isActive && (this.groupedMaterials[index].selectedOption = materials[i].id);
        this.groupedMaterials[index].materials.push(materials[i]);
      } else {
        const newGroup: MaterialGroup = {
          group: materials[i].variantGroup.id,
          name: materials[i].variantGroup.name,
          selectedOption: materials[i].isActive ? materials[i].id : '',
          materials: [materials[i]],
        };

        const len = this.groupedMaterials.push(newGroup);
        cache[materials[i].variantGroup.id] = len - 1;
      }
    }
  }
}
