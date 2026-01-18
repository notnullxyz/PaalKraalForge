export type PoleLength = 1.8 | 2.4 | 3.6;

export enum SegmentType {
  STANDARD = 'STANDARD',
  GATE = 'GATE'
}

export interface FenceSegment {
  id: string;
  type: SegmentType;
  rawLength: number; // The length of the pole bought
  effectiveLength: number; // The length added to the perimeter (raw - overlap)
  turnAngle: number; // Degrees of turn relative to previous segment (negative = left, positive = right)
}

export interface AppSettings {
  fenceHeight: number; // Meters
  railSpacing: number; // Meters (vertical gap between poles)
  overlap: number; // Meters (0.15 default)
  poleDiameter: number; // mm (visual only)
  postDiameter: number; // mm (visual only)
  
  // Costing (optional tuning)
  pricePost: number;
  pricePole18: number;
  pricePole24: number;
  pricePole36: number;
  priceGate: number;
  currencySymbol: string;
}