import {ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {environment} from "../../environments/environment";
import {VariantCache, VariantGroup} from "../models/GroupedVariantsModels";
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

  public isInitialized: boolean = false;
  public showHint: boolean = true;
  public groupedModels: VariantGroup[] = [];
  public groupedMaterials: VariantGroup[] = [];

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
        this.groupVariants();
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

  private groupVariants() {
    const materials = this.unityService.productMaterials;
    const models = this.unityService.productModels;

    const materialsCache: VariantCache = {};
    const modelsCache: VariantCache = {};

    this.groupedMaterials = [];
    this.groupedModels = [];

    for (let i = 0; i < materials.length; i++) {
      if (materialsCache[materials[i].variantGroup.id] || materialsCache[materials[i].variantGroup.id] === 0) {
        const index = materialsCache[materials[i].variantGroup.id];
        materials[i].isActive && (this.groupedMaterials[index].selectedOption = materials[i].id);
        this.groupedMaterials[index].variants.push(materials[i]);
      } else {
        const newGroup: VariantGroup = {
          group: materials[i].variantGroup.id,
          name: materials[i].variantGroup.name,
          selectedOption: materials[i].isActive ? materials[i].id : '',
          variants: [materials[i]],
        };

        const len = this.groupedMaterials.push(newGroup);
        materialsCache[materials[i].variantGroup.id] = len - 1;
      }
    }

    for (let i = 0; i < models.length; i++) {
      if (modelsCache[models[i].variantGroup.id] || modelsCache[models[i].variantGroup.id] === 0) {
        const index = modelsCache[models[i].variantGroup.id];
        models[i].isActive && (this.groupedModels[index].selectedOption = models[i].id);
        this.groupedModels[index].variants.push(models[i]);
      } else {
        const newGroup: VariantGroup = {
          group: models[i].variantGroup.id,
          name: models[i].variantGroup.name,
          selectedOption: models[i].isActive ? models[i].id : '',
          variants: [models[i]],
        };

        const len = this.groupedModels.push(newGroup);
        modelsCache[models[i].variantGroup.id] = len - 1;
      }
    }
  }
}
