import {ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {environment} from "../../environments/environment";
import {MaterialCache, MaterialGroup} from "../models/GroupedMaterialsModels";
import {ScriptService} from "../services/script.service";
import {UnityService} from "../services/unity.service";
import {ModalService} from "../services/modal.service";

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss'],
})
export class ProductPageComponent
  implements OnInit, OnDestroy {

  public modalWindowUniqueId: string = '';

  public isInitialized = false;
  public groupedMaterials: MaterialGroup[] = [];

  private unityInitializedSubscription!: Subscription;

  constructor(
    public unityService: UnityService,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private renderer: Renderer2,
    private scriptService: ScriptService,
    protected modalService: ModalService,
  ) {
  }

  ngOnInit() {
    this.modalWindowUniqueId = crypto.randomUUID();

    const scriptElement = this.scriptService.loadJsScript(
      this.renderer, `${environment.unityAssetsURL}/assets/Build/WebGLBuild.loader.js`);

    scriptElement.onload = () => {
      console.log('Load the Unity Script');

      this.unityService.initializeUnity().subscribe(() => {
        this.changeDetectorRef.detectChanges();
      });

      this.unityInitializedSubscription = this.unityService.initialized.subscribe(() => {
        const productId = this.route.snapshot.paramMap.get('id');
        if (productId !== null) {
          this.unityService.loadProduct(productId);
        }
      })

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

  ngOnDestroy(): void {
    this.isInitialized = false;
    this.unityInitializedSubscription.unsubscribe()
  }

  public activateModel(productId: string, variantId: string): void {
    this.unityService.activateModelVariant(productId, variantId);
  }

  public activateMaterial(productId: string, variantId: string): void {
    this.unityService.activateMaterialVariant(productId, variantId);
  }

  public activateVariantSet(productId: string, variantSetId: string): void {
    this.unityService.activateVariantSet(productId, variantSetId);
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
