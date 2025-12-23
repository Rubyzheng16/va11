
export type IngredientType = 'Adelhyde' | 'Bronson Ext' | 'Pwd Delta' | 'Flanergide' | 'Karmotrine';

export interface DrinkRecipe {
  name: string;
  tagline: string;
  description: string;
  flavorProfile: string;
  ingredients: Record<IngredientType, number>;
  iced: boolean;
  aged: boolean;
}

export interface MixState {
  ingredients: Record<IngredientType, number>;
  iced: boolean;
  aged: boolean;
}

export enum GameStage {
  MOOD_INPUT = 'MOOD_INPUT',
  ANALYZING = 'ANALYZING',
  MENU_SELECT = 'MENU_SELECT',
  MIXING = 'MIXING',
  RESULT = 'RESULT'
}
