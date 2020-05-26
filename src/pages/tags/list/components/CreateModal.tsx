import React from 'react';
import { Form, Input, InputNumber } from 'antd';
import ModalForm, { ModalFormProps } from '@/components/ModalForm';

export interface CreateModalProps extends ModalFormProps {}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 },
};

const CreateModal: React.FC<CreateModalProps> = (props) => {
  return (
    <ModalForm {...props}>
      <Form.Item
        {...formItemLayout}
        name="name"
        label="标签名称"
        rules={[{ required: true, message: '请填写标签名称' }]}
        hasFeedback
      >
        <Input placeholder="请输入标签名称" />
      </Form.Item>
      <Form.Item {...formItemLayout} name="slug" label="slug" hasFeedback>
        <Input placeholder="请输入slug" />
      </Form.Item>
      <Form.Item {...formItemLayout} name="order" label="排序" hasFeedback>
        <InputNumber placeholder="排序" style={{ width: '100%' }} />
      </Form.Item>
    </ModalForm>
  );
};

export default CreateModal;
