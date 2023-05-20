import {Variant} from "./unity";

export interface VariantGroup {
  group: string;
  name: string;
  selectedOption: string;
  variants: Variant[];
}

export interface VariantCache {
  [key: string]: number;
}
