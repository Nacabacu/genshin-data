export type Rarity = 1 | 2 | 3 | 4 | 5;
export type WeaponType = 'Sword' | 'Bow' | 'Claymore' | 'Catalyst' | 'Polearm';
export type Element = 'Anemo' | 'Cryo' | 'Pyro' | 'Hydro' | 'Electro' | 'Geo' | 'Dendro';
export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type Region = 'Mondstant' | 'Liyue' | 'Inazuma';
export type DomainType = 'Artifacts' | 'Weapon Ascension Materials' | 'Talent Level-Up Material';

export interface Dictionary<T> {
  [key: string]: T;
}

export interface ItemDataBase {
  rarity?: Rarity;
  url?: string;
}

export interface MaterialDataGroup {
  materials: Dictionary<MaterialData>;
}

export interface MaterialData extends ItemDataBase {}

export interface ArtifactData extends ItemDataBase {}

export interface CharacterData extends ItemDataBase {
  element: Element;
  weaponType: WeaponType;
  ascendMaterial: CharacterAscendMaterial;
  talentMaterial: TalentMaterial;
}

export interface CharacterAscendMaterial {
  gem: string;
  boss: string;
  common: string;
  local: string;
}

export interface TalentMaterial {
  common: string;
  book: string;
  weeklyBoss: string;
}

export interface WeaponData extends ItemDataBase {
  type: WeaponType;
  ascendMaterial: WeaponAscendMaterial;
}

export interface WeaponAscendMaterial {
  weapon: string;
  elite: string;
  common: string;
}

export interface DomainData extends ItemDataBase {
  region: Region;
  type: DomainType;
  reward: string[];
  daysofweek?: Day[];
}
