import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {ProductInfo} from "../services/unity.service";
import {Product} from "../models/unity";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent
  implements OnInit {

  public products: Product[] = [];

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.getProducts();
  }

  private getProducts(): void {
    const externalProductInfoUrl = `${environment.unityAssetsURL}/assets/Build/Configs/ProductsExternalConfig.json`;
    this.http
      .get<{ products: ProductInfo[] }>(externalProductInfoUrl)
      .subscribe((obj: { products: ProductInfo[] }) => {
        this.products = obj.products
          .map((product: ProductInfo) => (
            {
              externalId: product.productExternalId,
              id: product.productInternalId,
              title: product.productName,
              isActive: product.isAvailable,
              preview: product.productPreviewBase64
            }
          ));
      });
  }
}
