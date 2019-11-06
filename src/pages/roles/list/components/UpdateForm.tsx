import React from 'react';
import { Form, Input, Modal } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { IRole } from '@/models/data';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 15,
  },
};

interface UpdateFormProps extends FormComponentProps {
  modalVisible: boolean;
  handleUpdate: (id: number, values: Partial<IRole>) => Promise<void>;
  handleModalVisible: () => void;
  loading: boolean;
  role: IRole;
}

const UpdateForm: React.FC<UpdateFormProps> = props => {
  const {
    modalVisible,
    form,
    handleUpdate,
    handleModalVisible,
    loading,
    role,
  } = props;
  const { getFieldDecorator } = form;

  const okHandle = () => {
    form.validateFields(async (err, values) => {
      if (err) return;
      await handleUpdate(role.id as number, values);
      form.resetFields();
    });
  };

  return (
    <Modal
      destroyOnClose
      title="编辑角色"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
      confirmLoading={loading}
    >
      <FormItem {...formItemLayout} label="角色标识" hasFeedback>
        {getFieldDecorator('name', {
          initialValue: role.name,
          rules: [{ required: true, message: '请填写角色标识' }],
        })(<Input placeholder="请输入角色标识" disabled={loading} />)}
      </FormItem>
      <FormItem {...formItemLayout} label="角色名称" hasFeedback>
        {getFieldDecorator('display_name', {
          initialValue: role.display_name,
          rules: [{ required: true, message: '请填写角色名称' }],
        })(<Input placeholder="请输入角色名称" disabled={loading} />)}
      </FormItem>
    </Modal>
  );
};

export default Form.create<UpdateFormProps>()(UpdateForm);
