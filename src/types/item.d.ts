export interface Weapon {
  id: string;
  rarity: Rarity;
  ascensions: Ascension[];
}

export interface Ascension {
  materials: AscensionMaterial[];
}

export interface AscensionMaterial {
  id: string;
  quantity: number;
}

export const enum Rarity {
  OneStar = 1,
  TwoStar = 2,
  ThreeStar = 3,
  FourStar = 4,
  FiveStar = 5,
}
