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
    title: '位置与大小',
    fields: [
      { key: 'x', label: 'X', type: 'number' },
      { key: 'y', label: 'Y', type: 'number' },
      { key: 'w', label: '宽度', type: 'number', min: 0 },
      { key: 'h', label: '高度', type: 'number', min: 0 },
    ],
  },
  {
    title: '变换',
    fields: [
      { key: 'rotation', label: '旋转', type: 'number', step: 1 },
      { key: 'scaleX', label: '水平缩放', type: 'number', min: 0.1, step: 0.1 },
      { key: 'scaleY', label: '垂直缩放', type: 'number', min: 0.1, step: 0.1 },
      { key: 'skewX', label: '水平倾斜', type: 'number', step: 1 },
      { key: 'skewY', label: '垂直倾斜', type: 'number', step: 1 },
    ],
  },
];
