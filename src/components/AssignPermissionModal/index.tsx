import React from 'react';
import { groupBy } from 'lodash';
import { Checkbox, Form, Modal, Tooltip } from 'antd';
import { IPermission } from '@/models/I';

export interface FormValueType {
  permissions: number[];
}

export interface AssignPermissionModalProps {
  visible: boolean;
  onSubmit: (values: FormValueType) => void;
  onCancel: () => void;
  submitting: boolean;
  title?: string;
  allPermissions?: IPermission[];
  currentPermissions?: IPermission[];
}

const formItemLayout = { labelCol: { span: 5 }, wrapperCol: { span: 18 } };

const AssignPermissionModal: React.FC<AssignPermissionModalProps> = (props) => {
  const [form] = Form.useForm();

  function handleOK() {
    const values = form.getFieldsValue();
    props.onSubmit(values as FormValueType);
  }

  const groupPermissions = groupBy(
    props.allPermissions,
    (item) => (item.name as string).split('.')[0],
  );

  return (
    <Modal
      destroyOnClose
      title={props.title || '分配权限'}
      visible={props.visible}
      onOk={handleOK}
      onCancel={props.onCancel}
      confirmLoading={props.submitting}
      width={800}
    >
      <Form
        form={form}
        initialValues={{ permissions: props.currentPermissions?.map((item) => item.id) }}
      >
        <Form.Item name="permissions">
          <Checkbox.Group style={{ display: 'block' }}>
            {Object.entries<IPermission[]>(groupPermissions).map(([key, permissions]) => (
              <Form.Item {...formItemLayout} key={key} label={key}>
                {permissions.map((permission) => (
                  <Tooltip title={permission.name} key={permission.id as number}>
                    <Checkbox value={permission.id}>{permission.display_name}</Checkbox>
                  </Tooltip>
                ))}
              </Form.Item>
            ))}
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignPermissionModal;
