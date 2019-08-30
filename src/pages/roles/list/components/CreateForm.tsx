import { Form, Input, Modal } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import React from 'react';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 15,
  },
};

interface CreateFormProps extends FormComponentProps {
  modalVisible: boolean;
  handleAdd: (values: object, callback?: () => void) => void;
  handleModalVisible: () => void;
  loading: boolean;
}

const CreateForm: React.FC<CreateFormProps> = props => {
  const { modalVisible, form, handleAdd, handleModalVisible, loading } = props;
  const { getFieldDecorator } = form;

  const okHandle = () => {
    form.validateFields((err, values) => {
      if (err) return;
      handleAdd(values, () => {
        form.resetFields();
      });
    });
  };

  return (
    <Modal
      destroyOnClose
      title="新建角色"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
      confirmLoading={loading}
    >
      <FormItem {...formItemLayout} label="角色标识" hasFeedback>
        {getFieldDecorator('name', {
          rules: [{ required: true, message: '请填写角色标识' }],
        })(<Input placeholder="请输入角色标识" disabled={loading} />)}
      </FormItem>
      <FormItem {...formItemLayout} label="角色名称" hasFeedback>
        {getFieldDecorator('display_name', {
          rules: [{ required: true, message: '请填写角色名称' }],
        })(<Input placeholder="请输入角色名称" disabled={loading} />)}
      </FormItem>
    </Modal>
  );
};

export default Form.create<CreateFormProps>()(CreateForm);
