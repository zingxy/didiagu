import { useAppState } from '@/store';
import type React from 'react';
import { Typography, Card } from 'antd';
import type {
  InspectorField,
  InspectorSection,
} from '@didiagu/core/src/primitives/inspector';

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
  const schema = firstSelected.getInspectorFields();

  return (
    <Card title="Inspector">
      {schema.map((section) => (
        <InspectorSection key={section.title} section={section} />
      ))}
    </Card>
  );
};

interface InspectorFieldProps {
  field: InspectorField;
}

const InspectorField: React.FC<InspectorFieldProps> = ({ field }) => {
  return <div>{field.label}</div>;
};

const InspectorSection: React.FC<{
  section: InspectorSection;
}> = ({ section }) => {
  return (
    <div>
      <Typography.Title level={5}>{section.title}</Typography.Title>
      {section.fields.map((field) => (
        <InspectorField key={field.key} field={field} />
      ))}
    </div>
  );
};

export default Inspector;
