export interface InspectorField {
  key: string;
  label: string;
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface InspectorSection {
  title: string;
  fields: InspectorField[];
}

export const BASE_INSPECTOR_FIELDS: InspectorSection[] = [
  {
    title: 'Transform',
    fields: [
      { key: 'x', label: 'X', type: 'number' },
      { key: 'y', label: 'Y', type: 'number' },
      { key: 'scaleX', label: 'ScaleX', type: 'number', min: 0.1, step: 0.1 },
      { key: 'scaleY', label: 'ScaleY', type: 'number', min: 0.1, step: 0.1 },
      { key: 'skewX', label: 'SkewX', type: 'number', step: 1 },
      { key: 'skewY', label: 'SkewY', type: 'number', step: 1 },
      { key: 'rotation', label: 'Rotation', type: 'number', step: 1 },
    ],
  },
  {
    title: 'Dimensions',
    fields: [
      { key: 'w', label: 'W', type: 'number', min: 0 },
      { key: 'h', label: 'H', type: 'number', min: 0 },
    ],
  },
];
