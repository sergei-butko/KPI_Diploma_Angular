import {HttpClient} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import {from, Observable, tap} from 'rxjs';
import {environment} from '../environments/environment';
import {Unity, ConfigurationSystem, VariantSet, Variant, Product, Invoice, ProductState} from '../types/unity';

export interface ProductInfo {
  productExternalId: string;
  productInternalId: string;
  productName: string;
  isDefault: boolean;
  isAvailable: boolean;
  assetAddress: string;
}

@Injectable({providedIn: 'root'})
export class UnityService {

  public currentActiveProduct!: Product;
  public productMaterials: Variant[] = [];
  public productVariantSets: VariantSet[] = [];
  public productModels: Variant[] = [];
  public products: Product[] = [];

  public productActiveStateChanged: EventEmitter<void> = new EventEmitter<void>();
  private configurationSystem!: ConfigurationSystem;

  constructor(private http: HttpClient) {
  }

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

        this.getProducts();

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
      }),
    );
  }

  public getProducts(): void {
    const externalProductInfoUrl = `${environment.unityAssetsURL}/assets/Build/Configs/ProductsExternalConfig.json`;

    this.http
      .get<{ products: ProductInfo[] }>(externalProductInfoUrl)
      .subscribe((obj: { products: ProductInfo[] }) => {
        this.products = obj.products
          .map((p: ProductInfo) => (
            {
              id: p.productInternalId,
              title: p.productName,
              isActive: p.isAvailable,
              externalId: p.productExternalId,
            }
          ));
      });
  }

  public loadProduct(productId: string): void {
    return this.configurationSystem.loadProduct(productId);
  }

  // public setCurrentActiveProduct(productId: string) {
  //   const product = this.configurationSystem.getProduct(productId);
  //   this.productModels = this.getModels(productId);
  //   this.productMaterials = this.getMaterials(productId);
  //   this.currentActiveProduct = product;
  //   this.configurationSystem.activateProduct(productId);
  // }

  public getCurrentProductInvoice(): Invoice {
    return this.configurationSystem.getCurrentProductInvoice();
  }

  public activateModelVariant(productId: string, variantId: string): void {
    this.configurationSystem.activateModelVariant(productId, variantId);
  }

  public deactivateModelVariant(productId: string, variantId: string) {
    this.configurationSystem.deactivateModelVariant(productId, variantId);
  }

  public activateMaterialVariant(productId: string, variantId: string): void {
    this.configurationSystem.activateMaterialVariant(productId, variantId);
  }

  public activateVariantSet(productId: string, variantSetId: string): void {
    this.configurationSystem.activateVariantSet(productId, variantSetId);
  }

  // public getModels(productId: string): Variant[] {
  //   return this.configurationSystem.getProductModels(productId);
  // }
  //
  // public getMaterials(productId: string): Variant[] {
  //   return this.configurationSystem.getProductMaterials(productId);
  // }

  public changeBackgroundColor(color: string) {
    this.configurationSystem.changeBackgroundColor(color);
    this.configurationSystem.updateBackgroundActiveState(true);
  }
}
