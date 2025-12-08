import { useAppState } from '@/store';
import type React from 'react';
import {
  Typography,
  Card,
  Form,
  InputNumber,
  ColorPicker,
  Input,
  Switch,
  Slider,
  Button,
  Space,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type {
  InspectorSchema,
  InspectorProperty,
} from '@didiagu/core/src/primitives/inspector';
import type { AbstractPrimitive } from '@didiagu/core';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

const { Text } = Typography;

const Inspector: React.FC = () => {
  const selection = useAppState((state) => state.selection);

  if (selection.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">✨</div>
          <Text type="secondary" className="text-base">
            选择一个对象以查看其属性
          </Text>
        </div>
      </div>
    );
  }

  const [firstSelected] = selection;
  const schema = firstSelected.getInspectorSchema();

  return (
    <div
      className={clsx(
        'fixed right-4 top-4 bg-white w-70 rounded-xl shadow h-8 min-h-12',
        {
          'h-9/10': true,
        }
      )}
    >
      <Card size="small" className="shadow-sm h-full overflow-auto">
        <SchemaForm
          schema={schema}
          target={firstSelected}
          key={firstSelected.uuid}
        />
      </Card>
    </div>
  );
};

// Schema Form 渲染器
const SchemaForm: React.FC<{
  schema: InspectorSchema;
  target: AbstractPrimitive;
}> = ({ schema, target }) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const data: Record<string, any> = {};
    Object.keys(schema.properties).forEach((key) => {
      data[key] = target.getParameter(key as any);
    });
    return data;
  });

  useEffect(() => {
    const initFormData = () => {
      const data: Record<string, any> = {};
      Object.keys(schema.properties).forEach((key) => {
        data[key] = target.getParameter(key as any);
      });
      setFormData(data);
    };
    target.on('attr.changed', initFormData);
    return () => {
      target.off('attr.changed', initFormData);
    };
  }, [target, schema.properties]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    target.setParameter(key as any, value);
  };

  return (
    <div>
      {schema.groups?.map((group) => (
        <div key={group.title} style={{ marginBottom: 16 }}>
          <Typography.Title level={5}>{group.title}</Typography.Title>
          <div className="grid grid-cols-2 gap-x-2">
            {group.properties.map((propKey) => {
              const prop = schema.properties[propKey];
              if (!prop) return null;
              return (
                <div
                  key={propKey}
                  className={
                    prop.type === 'array' || prop['ui:widget'] === 'slider'
                      ? 'col-span-2'
                      : 'col-span-1'
                  }
                >
                  <PropertyField
                    propKey={propKey}
                    prop={prop}
                    value={formData[propKey]}
                    onChange={(value) => handleChange(propKey, value)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// 属性字段渲染器
const PropertyField: React.FC<{
  propKey: string;
  prop: InspectorProperty;
  value: any;
  onChange: (value: any) => void;
}> = ({ propKey, prop, value, onChange }) => {
  const widget = prop['ui:widget'];

  if (prop.type === 'number') {
    if (widget === 'slider') {
      return (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>{prop.title}</div>
          <Slider
            min={prop.minimum ?? 0}
            max={prop.maximum ?? 100}
            step={prop.multipleOf ?? 1}
            value={value}
            onChange={onChange}
          />
        </div>
      );
    }
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, marginBottom: 4 }}>{prop.title}</div>
        <InputNumber
          value={value}
          onChange={onChange}
          min={prop.minimum}
          max={prop.maximum}
          step={prop.multipleOf ?? 1}
          size="small"
          style={{ width: '100%' }}
        />
      </div>
    );
  }

  if (prop.type === 'string') {
    if (prop.enum) {
      return (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>{prop.title}</div>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            size="small"
          />
        </div>
      );
    }
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, marginBottom: 4 }}>{prop.title}</div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          size="small"
        />
      </div>
    );
  }

  if (prop.type === 'boolean') {
    return (
      <div
        style={{
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ fontSize: 12 }}>{prop.title}</div>
        <Switch checked={value} onChange={onChange} size="small" />
      </div>
    );
  }

  if (prop.type === 'color') {
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, marginBottom: 4 }}>{prop.title}</div>
        <ColorPicker
          value={value}
          onChange={(color) => onChange(color.toHexString())}
          size="small"
          showText
        />
      </div>
    );
  }

  if (prop.type === 'array') {
    return <ArrayField prop={prop} value={value} onChange={onChange} />;
  }

  return null;
};

// 数组字段
const ArrayField: React.FC<{
  prop: InspectorProperty;
  value: any[];
  onChange: (value: any[]) => void;
}> = ({ prop, value = [], onChange }) => {
  const handleAdd = () => {
    const newItem = prop.items?.properties
      ? Object.fromEntries(
          Object.entries(prop.items.properties).map(([k, v]) => [k, v.default])
        )
      : prop.items?.default;
    onChange([...value, newItem]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, itemValue: any) => {
    const newValue = [...value];
    newValue[index] = itemValue;
    onChange(newValue);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
        {prop.title}
      </div>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {value.map((item, index) => (
          <Card key={index} size="small" style={{ background: '#fafafa' }}>
            {prop.items?.type === 'object' && prop.items.properties ? (
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="small"
              >
                {Object.entries(prop.items.properties).map(
                  ([key, itemProp]) => (
                    <div
                      key={key}
                      style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                    >
                      <span style={{ width: 60, fontSize: 12 }}>
                        {itemProp.title || key}:
                      </span>
                      {itemProp.type === 'color' ? (
                        <ColorPicker
                          value={item[key]}
                          onChange={(color) =>
                            handleItemChange(index, {
                              ...item,
                              [key]: color.toHexString(),
                            })
                          }
                          size="small"
                          showText
                        />
                      ) : (
                        <Input
                          value={item[key]}
                          onChange={(e) =>
                            handleItemChange(index, {
                              ...item,
                              [key]: e.target.value,
                            })
                          }
                          size="small"
                          style={{ flex: 1 }}
                        />
                      )}
                    </div>
                  )
                )}
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemove(index)}
                  block
                >
                  删除
                </Button>
              </Space>
            ) : null}
          </Card>
        ))}
        {(!prop.maxItems || value.length < prop.maxItems) && (
          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            block
          >
            添加
          </Button>
        )}
      </Space>
    </div>
  );
};

export default Inspector;
