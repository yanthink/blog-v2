import React from 'react';
import { Form, Input } from 'antd';
import ModalForm, { ModalFormProps } from '@/components/ModalForm';

export interface UpdateModalProps extends ModalFormProps {}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 },
};

const UpdateModal: React.FC<UpdateModalProps> = (props) => {
  return (
    <ModalForm {...props}>
      <Form.Item
        {...formItemLayout}
        label="权限标识"
        name="name"
        rules={[{ required: true, message: '请填写权限标识' }]}
        hasFeedback
      >
        <Input placeholder="请输入权限标识" />
      </Form.Item>
      <Form.Item
        {...formItemLayout}
        label="权限名称"
        name="display_name"
        rules={[{ required: true, message: '请填写权限名称' }]}
        hasFeedback
      >
        <Input placeholder="请输入权限名称" />
      </Form.Item>
    </ModalForm>
  );
};

export default UpdateModal;
