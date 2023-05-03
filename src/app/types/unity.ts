export interface Unity {
  Module: {
    configurationSystem: ConfigurationSystem;
  };
}

declare global {
  function createUnityInstance(canvas: HTMLElement, config: UnityConfig): Promise<Unity>;
}

export interface UnityConfig {
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
  streamingAssetsUrl: string;
  companyName: string;
  productName: string;
  productVersion: string;
}

export interface ConfigurationSystem {
  /**
   * Returns app initialised state. If true - it means that all resources are loaded and all products are initialised with variants.
   * @returns {boolean}
   */
  isInitialised(): boolean;

  /**
   * Returns list of all products currently present on scene.
   */
  getAllProducts(): Product[];

  /**
   * Returns current active product config by id.
   * @returns {Product}
   */
  getCurrentActiveProduct(): Product;

  /**
   * Loads invoice for current selected product.
   * @returns {Invoice}
   */
  getCurrentProductInvoice(): Invoice;

  /**
   * Returns product config by id (works only if product is loaded).
   * @param {string} productId
   * @returns {Product}
   */
  getProduct(productId: string): Product;

  /**
   * Loads the list of all product variants (both materials and models).
   * @param {string} productId
   * @returns {Variant[]} variants
   */
  getProductVariants(productId: string): Variant[];

  /**
   * Loads model variants for product.
   * @param {string} productId
   * @returns {Variant[]}
   */
  getProductModels(productId: string): Variant[];

  /**
   * Loads material variants for product.
   * @param {string} productId
   * @returns {Variant[]}
   */
  getProductMaterials(productId: string): Variant[];

  /**
   * Loads all variant sets for product.
   * @param {string} productId
   * @returns {VariantSet[]}
   */
  getProductVariantSets(productId: string): VariantSet[];

  /**
   * Attempts to generate prerenders of the current product appearance.
   */
  generatePrerenders(): void;

  /**
   * Attempts to load product by external ID.
   * @param {string} externalProductId
   */
  loadProduct(externalProductId: string): void;

  /**
   * Attempts to activate selected product on scene (only for multiple product).
   * NOTE: product activation is performed by double-clicking on it in Unity container.
   * @param {string} productId
   */
  activateProduct(productId: string): void;

  /**
   * Attempts to activate variant for product by variant id (both material and model).
   * @param {string} productId
   * @param {string} variantId
   */
  activateVariant(productId: string, variantId: string): void;

  /**
   * Attempts to activate model variant for product by model variant id.
   * @param {string} productId
   * @param {string} variantId
   */
  activateModelVariant(productId: string, variantId: string): void;

  /**
   * Attempts to deactivate model variant for product by model variant id.
   * @param {string} productId
   * @param {string} variantId
   */
  deactivateModelVariant(productId: string, variantId: string): void;

  /**
   * Attempts to activate model variant for product by model variant id.
   */
  activateMaterialVariant(productId: string, variantId: string): void;

  /**
   * Attempts to activate variant set for product by variant set id.
   * @param {string} productId
   * @param {string} variantSetId
   */
  activateVariantSet(productId: string, variantSetId: string): void;

  /**
   * Attempts to update the background active state.
   * @param {boolean} backgroundActiveState
   */
  updateBackgroundActiveState(backgroundActiveState: boolean): void;

  /**
   * Attempts to change the background color.
   * @param {string} hexColor
   */
  changeBackgroundColor(hexColor: string): void;

  /**
   * Sets build Configuration's base url.
   * @param {string} buildConfigsBaseUrl
   */
  setBuildConfigurations(buildConfigsBaseUrl: string): void;

  /**
   * Adds event listener to the events triggered in configurationSystem. Event name is one of the event names defined in the configurator.
   * @param {string} eventName
   * @callback callback
   */
  addEventListener(eventName: string, callback: any): void;

  /**
   * Removes event listener.
   * @param {string} eventName
   * @callback callback
   */
  removeEventListener(eventName: string, callback: any): void;

  // ----- Events -----
  /**
   * All resources are loaded and all products are initialised with variants.
   */
  initialised: 'initialised';

  /**
   * Product is selected/unselected.
   * Callback receives ProductState object.
   */
  productActiveStateChanged: 'productActiveStateChanged';

  /**
   * Variant is activated/deactivated (both model and material).
   * Callback receives VariantState object.
   */
  variantActiveStateChanged: 'variantActiveStateChanged';

  /**
   * Material variant is activated/deactivated.
   * Callback receives VariantState object.
   */
  modelVariantActiveStateChanged: 'modelVariantActiveStateChanged';

  /**
   * Model variant is activated/deactivated.
   * Callback receives VariantState object.
   */
  materialVariantActiveStateChanged: 'materialVariantActiveStateChanged';

  /**
   * Variant is activated/deactivated (both model and material).
   * Callback receives VariantState object
   */
  variantSetActiveStateChanged: 'variantSetActiveStateChanged';

  /**
   * Prerenders generated.
   * Callback receives Prerenders array.
   */
  prerendersCreated: 'prerendersCreated';
}

// ----- Types -----
export enum VariantType {
  Material = 1,
  Model = 2,
}

export interface Product {
  id: string;
  title: string;
  isActive: boolean;
  externalId: string;
}

export interface VariantGroup {
  id: string;
  name: string;
}

export interface Variant {
  id: string;
  title: string;
  thumbnail: string; // base64
  isActive: boolean;
  productId: string;
  variantGroup: VariantGroup;
  variantType: VariantType;
}

export interface VariantSet {
  id: string;
  title: string;
  productId: string;
  thumbnail: string;
  variantIds: string[];
}

export interface Prerenders {
  viewDescription: string;
  prerenderBase64: string;
}

export interface Invoice {
  price: number;
  product: InvoiceProduct;
}

export interface InvoiceProduct {
  id: string;
  title: string;
  price: number;
  variants: InvoiceProductVariant[];
}

export interface InvoiceProductVariant {
  id: string;
  price: number;
  title: string;
}

export interface ProductState {
  productId: string;
  isActive: boolean;
}

export interface VariantState {
  productId: string;
  variantId: string;
  isActive: boolean;
}

export interface VariantSetState {
  productId: string;
  variantSetId: string;
  isActive: boolean;
}
