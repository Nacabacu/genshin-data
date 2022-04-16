export type Rarity = 1 | 2 | 3 | 4 | 5;
export type WeaponType = 'sword' | 'bow' | 'claymore' | 'catalyst' | 'polearm';
export type Element = 'anemo' | 'cryo' | 'pyro' | 'hydro' | 'electro' | 'geo' | 'dendro';
export type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type Region = 'mondstant' | 'liyue' | 'inazuma';
export type DomainType = 'artifacts' | 'weapon_ascension_materials' | 'talent_levelup_material';

export interface Dictionary<T> {
  [key: string]: T;
}

export interface ItemDataBase {
  id: string;
  rarity?: Rarity;
  url?: string;
}

export interface MaterialDataGroup {
  id: string;
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

export type MaterialConfig = MaterialGroupConfig & MaterialDataConfig;

export interface MaterialGroupConfig {
  gem: Dictionary<string[]>;
  book: Dictionary<string[]>;
  weapon: Dictionary<string[]>;
  common: Dictionary<string[]>;
  elite: Dictionary<string[]>;
}

export interface MaterialDataConfig {
  boss: string[];
  local: string[];
  weeklyBoss: string[];
}
