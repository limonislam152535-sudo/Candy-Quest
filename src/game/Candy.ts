export type CandyColor = 'red' | 'yellow' | 'orange' | 'green' | 'blue' | 'purple' | 'pink';

export type SpecialType = 'none' | 'striped_h' | 'striped_v' | 'wrapped' | 'color_bomb';

export interface CandyData {
  id: string;
  row: number;
  col: number;
  color: CandyColor;
  special: SpecialType;
  key?: string;
}

export const CANDY_COLORS: CandyColor[] = [
  'red',
  'yellow',
  'orange',
  'green',
  'blue',
  'purple'
];

export const CANDY_COLOR_HEX: Record<CandyColor, number> = {
  red: 0xff3366,
  yellow: 0xffcc00,
  orange: 0xff8800,
  green: 0x33cc66,
  blue: 0x00aaff,
  purple: 0x9933ff,
  pink: 0xff66cc
};

export const CANDY_COLOR_NAMES: Record<CandyColor, string> = {
  red: 'Strawberry Berry',
  yellow: 'Lemon Drop',
  orange: 'Orange Swirl',
  green: 'Mint Lozenges',
  blue: 'Blueberry Chew',
  purple: 'Grape Jelly',
  pink: 'Bubblegum Heart'
};
