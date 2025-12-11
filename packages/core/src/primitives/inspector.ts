// 基于 JSON Schema 的属性定义
export interface InspectorSchema {
  type: 'object';
  properties: Record<string, InspectorProperty>;
  groups?: InspectorGroup[];
}

export interface InspectorProperty {
  type: 'number' | 'string' | 'boolean' | 'color' | 'array' | 'object';
  title?: string;
  description?: string;
  default?: any;

  // 数值类型
  minimum?: number;
  maximum?: number;
  multipleOf?: number;

  // 字符串类型
  enum?: any[];
  enumNames?: string[];

  // 数组类型
  items?: InspectorProperty;
  minItems?: number;
  maxItems?: number;

  // 对象类型
  properties?: Record<string, InspectorProperty>;

  // UI 提示
  'ui:widget'?: string;
  'ui:options'?: any;
}

export interface InspectorGroup {
  title: string;
  properties: string[];
  collapsible?: boolean;
}

export const BASE_INSPECTOR_SCHEMA: InspectorSchema = {
  type: 'object',
  properties: {
    x: { type: 'number', title: 'X' },
    y: { type: 'number', title: 'Y' },
    w: { type: 'number', title: 'Width', minimum: 1 },
    h: { type: 'number', title: 'Height', minimum: 1 },
    rotation: { type: 'number', title: 'Rotation', multipleOf: 1 },
    scaleX: {
      type: 'number',
      title: 'Scale X',
      minimum: 0.01,
      multipleOf: 0.1,
    },
    scaleY: {
      type: 'number',
      title: 'Scale Y',
      minimum: 0.01,
      multipleOf: 0.1,
    },
    skewX: { type: 'number', title: 'Skew X', multipleOf: 1 },
    skewY: { type: 'number', title: 'Skew Y', multipleOf: 1 },
    opacity: {
      type: 'number',
      title: 'Opacity',
      minimum: 0,
      maximum: 1,
      multipleOf: 0.01,
      'ui:widget': 'slider',
    },
    fills: {
      type: 'array',
      title: 'Fills',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['SOLID'], default: 'SOLID' },
          color: { type: 'color', title: 'Color', default: '#000000' },
        },
      },
      maxItems: 5,
    },
    strokes: {
      type: 'array',
      title: 'Strokes',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['SOLID'], default: 'SOLID' },
          color: { type: 'color', title: 'Color', default: '#000000' },
          strokeWidth: { type: 'number', title: 'Stroke Width' },
        },
      },
      maxItems: 5,
    },
  },
  groups: [
    { title: 'Transform', properties: ['x', 'y', 'rotation'] },
    { title: 'Scale', properties: ['scaleX', 'scaleY'], collapsible: true },
    { title: 'Skew', properties: ['skewX', 'skewY'], collapsible: true },
    { title: 'Dimensions', properties: ['w', 'h'] },
    {
      title: 'Appearance',
      properties: ['fills', 'strokes', 'strokeWidth', 'opacity'],
    },
  ],
};
