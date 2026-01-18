import { AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  fenceHeight: 1.2,
  railSpacing: 0.3,
  overlap: 0.15,
  isClosedLoop: true,
  poleDiameter: 100,
  postDiameter: 150,
  pricePost: 150,
  pricePole18: 80,
  pricePole24: 110,
  pricePole36: 160,
  priceGate: 1200,
  currencySymbol: '$',
};

export const POLE_OPTIONS = [1.8, 2.4, 3.6];
export const GATE_WIDTH = 1.0;