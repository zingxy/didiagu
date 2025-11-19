export interface InspectorField {
  key: string;
  label: string;
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export const BASE_INSPECTOR_FIELDS: InspectorField[] = [
  { key: 'x', label: 'X', type: 'number' },
  { key: 'y', label: 'Y', type: 'number' },
  { key: 'w', label: '宽度', type: 'number', min: 0 },
  { key: 'h', label: '高度', type: 'number', min: 0 },
  { key: 'rotation', label: '旋转', type: 'number', min: 0, max: 360, step: 1 },
  {
    key: 'skewX',
    label: '倾斜X',
    type: 'number',
    min: -180,
    max: 180,
    step: 1,
  },
  {
    key: 'skewY',
    label: '倾斜Y',
    type: 'number',
    min: -180,
    max: 180,
    step: 1,
  },
  { key: 'scaleX', label: '缩放X', type: 'number', min: 0, step: 0.1 },
  { key: 'scaleY', label: '缩放Y', type: 'number', min: 0, step: 0.1 },
];

