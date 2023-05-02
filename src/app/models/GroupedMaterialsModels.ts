import {Variant} from "../types/unity";

export interface MaterialGroup {
  group: string;
  name: string;
  selectedOption: string;
  materials: Variant[];
}

export interface MaterialCache {
  [key: string]: number;
}