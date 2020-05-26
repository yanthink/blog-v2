import React from 'react';
import { Form, Input } from 'antd';
import ModalForm, { ModalFormProps } from '@/components/ModalForm';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 },
};

export interface CreateModalProps extends ModalFormProps {}

const CreateModal: React.FC<CreateModalProps> = (props) => {
  return (
    <ModalForm {...props}>
      <Form.Item
        {...formItemLayout}
        label="角色标识"
        name="name"
        rules={[{ required: true, message: '请填写角色标识' }]}
        hasFeedback
      >
        <Input placeholder="请输入角色标识" />
      </Form.Item>
      <Form.Item
        {...formItemLayout}
        label="角色名称"
        name="display_name"
        rules={[{ required: true, message: '请填写角色名称' }]}
        hasFeedback
      >
        <Input placeholder="请输入角色名称" />
      </Form.Item>
    </ModalForm>
  );
};

export default CreateModal;
