import {ChangeDetectorRef, Component, OnInit, Renderer2} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {MaterialCache, MaterialGroup} from '../models/GroupedMaterialsModels';
import {InvoiceProductVariant, Invoice} from '../types/unity';
import {ScriptService} from '../services/script.service';
import {Subject} from 'rxjs';
import {ThemeService} from '../services/themes.service';
import {UnityService} from './unity.service';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-unity-loader',
  templateUrl: './unity-loader.component.html',
  styleUrls: ['./unity-loader.component.scss'],
})
export class UnityLoaderComponent implements OnInit {
  public productInvoice!: Invoice;
  public isInitialized = false;
  public activeModelsSet = new Set<string>();
  public activeVariantSetId = '';
  public groupedMaterials: MaterialGroup[] = [];
  public isDarkTheme = false;
  public lightUnityBg = '#fafafa';
  public darkUnityBg = '#303030';
  public variantSetChangeEvent = new Subject<string[]>();

  constructor(
    public unityService: UnityService,
    private changeDetectorRef: ChangeDetectorRef,
    private renderer: Renderer2,
    private scriptService: ScriptService,
    private sanitizer: DomSanitizer,
    private themeService: ThemeService,
  ) {
  }

  public ngOnInit() {
    this.themeService.isDarkTheme.subscribe((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme;
      if (this.isInitialized) {
        this.unityService.changeBackgroundColor(this.isDarkTheme ? this.darkUnityBg : this.lightUnityBg);
      }
    });
    const scriptElement = this.scriptService.loadJsScript(
      this.renderer,
      environment.unityAssetsURL + `/assets/Build/WebGLBuild.loader.js`,
    );
    scriptElement.onload = () => {
      console.log('Load the Unity Script');
      this.unityService.initializeUnity().subscribe(() => {
        this.changeDetectorRef.detectChanges();
        this.unityService.changeBackgroundColor(this.isDarkTheme ? this.darkUnityBg : this.lightUnityBg);
      });

      this.unityService.productActiveStateChanged.subscribe(() => {
        this.productInvoice = this.unityService.getCurrentProductInvoice();
        this.isInitialized = true;
        this.setActiveModels(this.productInvoice);

        this.groupMaterials();
        this.changeDetectorRef.detectChanges();
      });
    };
    scriptElement.onerror = () => {
      console.warn('Could not load the Unity Script!');
    };
  }

  public toggleModelVariant(productId: string, variantId: string): void {
    if (this.activeVariantSetId !== '') {
      this.activeVariantSetId = '';
    }

    if (this.activeModelsSet.has(variantId)) {
      this.unityService.deactivateModelVariant(productId, variantId);
      this.activeModelsSet.delete(variantId);
    } else {
      this.unityService.activateModelVariant(productId, variantId);
      this.activeModelsSet.add(variantId);
    }
    this.productInvoice = this.unityService.getCurrentProductInvoice();
    this.setActiveModels(this.productInvoice);
  }

  public activateMaterial(productId: string, variantId: string): void {
    if (this.activeVariantSetId !== '') {
      this.activeVariantSetId = '';
    }
    this.unityService.activateMaterialVariant(productId, variantId);
    this.productInvoice = this.unityService.getCurrentProductInvoice();
    this.setActiveModels(this.productInvoice);
  }

  public base64ToImage(image: string): string | SafeResourceUrl {
    if (!image) return '../../assets/images/image-not-found-icon.svg';
    return this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${image}`);
  }

  public activateVariantSet(productId: string, variantSetId: string): void {
    this.unityService.activateVariantSet(productId, variantSetId);
    this.productInvoice = this.unityService.getCurrentProductInvoice();
    const variants: string[] = [];
    this.productInvoice.product.variants.forEach((variant: InvoiceProductVariant) => {
      variants.push(variant.id);
    });
    this.variantSetChangeEvent.next(variants);
    this.setActiveModels(this.productInvoice);
    this.activeVariantSetId = variantSetId;
  }

  public toggleTheme() {
    this.themeService.setDarkTheme(!this.isDarkTheme);
  }

  public productChanged(productId: string): void {
    this.activeVariantSetId = '';
    this.unityService.loadProduct(productId);
  }

  private groupMaterials() {
    this.groupedMaterials = [];
    const materials = this.unityService.productMaterials;
    const cache: MaterialCache = {}; // stores the index of the group in the array
    for (let i = 0; i < materials.length; i++) {
      // if group already exists, add the material to the group else create a new group
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

  private setActiveModels(productInvoice: Invoice): void {
    this.activeModelsSet.clear();
    productInvoice.product.variants.forEach((variant: InvoiceProductVariant) => {
      this.activeModelsSet.add(variant.id);
    });
  }
}
