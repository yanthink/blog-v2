import { Form, Modal, Checkbox, Tooltip } from 'antd';
import React from 'react';
import { IRole } from '@/models/I';

export interface FormValueType {
  roles: number[];
}

export interface AssignRoleModalProps {
  visible: boolean;
  onSubmit: (values: FormValueType) => void;
  onCancel: () => void;
  submitting: boolean;
  title?: string;
  allRoles?: IRole[];
  currentRoles?: IRole[];
}

const Index: React.FC<AssignRoleModalProps> = (props) => {
  const [form] = Form.useForm();

  function handleOK() {
    const values = form.getFieldsValue();
    props.onSubmit(values as FormValueType);
  }

  return (
    <Modal
      destroyOnClose
      title={props.title || '分配角色'}
      visible={props.visible}
      onOk={handleOK}
      onCancel={props.onCancel}
      confirmLoading={props.submitting}
      width={600}
    >
      <Form form={form} initialValues={{ roles: props.currentRoles?.map((item) => item.id) }}>
        <Form.Item name="roles">
          <Checkbox.Group style={{ display: 'block' }}>
            {props.allRoles?.map((role) => (
              <Tooltip title={role.name} key={role.id}>
                <Checkbox value={role.id}>{role.display_name}</Checkbox>
              </Tooltip>
            ))}
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Index;
