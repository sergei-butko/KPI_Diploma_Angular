import {EventEmitter, Injectable} from '@angular/core';
import {from, Observable, tap} from 'rxjs';
import {environment} from '../../environments/environment';
import {
  Unity,
  ConfigurationSystem,
  Product,
  ProductState,
  Invoice,
  Variant,
  VariantState,
  VariantSet,
} from '../models/unity';

export interface ProductInfo {
  productExternalId: string;
  productInternalId: string;
  productName: string;
  isAvailable: boolean;
  productPreviewBase64: string;
  assetAddress: string;
}

@Injectable({providedIn: 'root'})
export class UnityService {
  public currentActiveProduct!: Product;
  public productMaterials: Variant[] = [];
  public productVariantSets: VariantSet[] = [];
  public productModels: Variant[] = [];

  public initialized: EventEmitter<void> = new EventEmitter<void>();
  public productActiveStateChanged: EventEmitter<void> = new EventEmitter<void>();
  public unityClosed: EventEmitter<void> = new EventEmitter<void>();

  private configurationSystem!: ConfigurationSystem;

  public initializeUnity(): Observable<Unity> {
    return from(
      createUnityInstance(document.querySelector('#unity-canvas') as HTMLElement, {
        dataUrl: `${environment.unityAssetsURL}/assets/Build/WebGLBuild.data`,
        frameworkUrl: `${environment.unityAssetsURL}/assets/Build/WebGLBuild.framework.js`,
        codeUrl: `${environment.unityAssetsURL}/assets/Build/WebGLBuild.wasm`,
        streamingAssetsUrl: `${environment.unityAssetsURL}/assets/StreamingAssets`,
        companyName: 'Kyiv Polytechnic Institute',
        productName: 'Configuration and Visualization System',
        productVersion: '1.0.0',
      })
        .catch((error) => {
          console.error('Error while initializing Unity', error);
          return error;
        }),
    ).pipe(
      tap((value: Unity) => {
        this.configurationSystem = value.Module.configurationSystem;
        this.configurationSystem.setBuildConfigurations(environment.unityAssetsURL + `/assets`);

        this.configurationSystem.addEventListener(
          this.configurationSystem.initialised,
          () => {
            this.initialized.emit();
          }
        );

        this.configurationSystem.addEventListener(
          this.configurationSystem.productActiveStateChanged,
          ({productId}: ProductState) => {
            this.currentActiveProduct = this.configurationSystem.getProduct(productId);
            this.productModels = this.configurationSystem.getProductModels(this.currentActiveProduct.id);
            this.productMaterials = this.configurationSystem.getProductMaterials(this.currentActiveProduct.id);
            this.productVariantSets = this.configurationSystem.getProductVariantSets(this.currentActiveProduct.id);
            this.productActiveStateChanged.emit();
          },
        );

        this.configurationSystem.addEventListener(
          this.configurationSystem.variantActiveStateChanged,
          ({variantId, isActive}: VariantState) => {
            this.productModels = this.productModels.map(variant => {
              if (variant.id === variantId) {
                return {
                  ...variant,
                  isActive: isActive,
                };
              }
              return variant;
            });
          }
        );
      }),
    );
  }

  public loadProduct(productId: string): void {
    return this.configurationSystem.loadProduct(productId);
  }

  public getCurrentProductInvoice(): Invoice {
    return this.configurationSystem.getCurrentProductInvoice();
  }

  public activateModelVariant(productId: string, variantId: string): void {
    this.configurationSystem.activateModelVariant(productId, variantId);
  }

  public activateMaterialVariant(productId: string, variantId: string): void {
    this.configurationSystem.activateMaterialVariant(productId, variantId);
  }

  public activateVariantSet(productId: string, variantSetId: string): void {
    this.configurationSystem.activateVariantSet(productId, variantSetId);
  }

  public updateBackgroundActiveState(activeState: boolean): void {
    this.configurationSystem.updateBackgroundActiveState(activeState);
  }

  public changeBackgroundColor(color: string) {
    this.configurationSystem.updateBackgroundActiveState(true);
    this.configurationSystem.changeBackgroundColor(color);
  }

  public quitUnity(): void {
    this.unityClosed.emit();
    this.configurationSystem.quitUnity();
  }
}
