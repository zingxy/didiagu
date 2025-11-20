import { useAppState } from '@/store';
import type React from 'react';
import { Typography, Card, Form, InputNumber } from 'antd';
import type {
  InspectorField,
  InspectorSection,
} from '@didiagu/core/src/primitives/inspector';
import type { AbstractPrimitive } from '@didiagu/core';
import { useEffect } from 'react';

const { Text } = Typography;

const Inspector: React.FC = () => {
  const selection = useAppState((state) => state.selection);

  const [form] = Form.useForm();
  useEffect(() => {
    form.resetFields();
  }, [selection, form]);

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
  const schema = firstSelected.getInspectorFields();
  const initialValues = schema.reduce((acc, section) => {
    section.fields.forEach((field) => {
      acc[field.key] = firstSelected.getParameter(field.key as any);
    });
    return acc;
  }, {} as Record<string, any>);

  return (
    <Card size="small" className="shadow-sm h-full">
      <Form
        initialValues={initialValues}
        form={form}
        variant="filled"
        colon={false}
        // layout="inline"
        labelAlign="right"
        // onFieldsChange={(fields) => {
        // console.log('filed', fields);
        // }}
        onBlur={() => {
          console.log('blur');
          const values = form.getFieldsValue();
          Object.entries(values).forEach(([key, value]) => {
            firstSelected.setParameter(key as any, value);
          });
        }}
      >
        {schema.map((section) => (
          <InspectorSectionComp
            key={section.title}
            section={section}
            target={firstSelected}
          />
        ))}
      </Form>
    </Card>
  );
};

interface InspectorFieldProps {
  field: InspectorField;
  target: AbstractPrimitive;
}

const InspectorItem: React.FC<InspectorFieldProps> = ({ field }) => {
  return (
    <Form.Item
      name={field.key}
      label={field.label}
      labelCol={{ style: { width: 60 } }}
      style={{ marginBottom: 6 }}
    >
      <InputNumber
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        size="small"
        style={{ width: 70 }}
      />
    </Form.Item>
  );
};

const InspectorSectionComp: React.FC<{
  section: InspectorSection;
  target: AbstractPrimitive;
}> = ({ section, target }) => {
  return (
    <div>
      <Typography.Title level={5}>{section.title}</Typography.Title>
      <div className="grid grid-cols-2">
        {section.fields.map((field) => (
          <InspectorItem key={field.key} field={field} target={target} />
        ))}
      </div>
    </div>
  );
};

export default Inspector;
