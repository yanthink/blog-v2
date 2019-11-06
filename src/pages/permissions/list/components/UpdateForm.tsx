import React from 'react';
import { Form, Input, Modal } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { IPermission } from '@/models/data';

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
  handleUpdate: (id: number, values: Partial<IPermission>) => Promise<void>;
  handleModalVisible: () => void;
  loading: boolean;
  permission: IPermission;
}

const UpdateForm: React.FC<UpdateFormProps> = props => {
  const {
    modalVisible,
    form,
    handleUpdate,
    handleModalVisible,
    loading,
    permission,
  } = props;
  const { getFieldDecorator } = form;

  const okHandle = () => {
    form.validateFields(async (err, values) => {
      if (err) return;
      await handleUpdate(permission.id as number, values);
      form.resetFields();
    });
  };

  return (
    <Modal
      destroyOnClose
      title="编辑权限"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
      confirmLoading={loading}
    >
      <FormItem {...formItemLayout} label="权限标识" hasFeedback>
        {getFieldDecorator('name', {
          initialValue: permission.name,
          rules: [{ required: true, message: '请填写权限标识' }],
        })(<Input placeholder="请输入权限标识" disabled={loading} />)}
      </FormItem>
      <FormItem {...formItemLayout} label="权限名称" hasFeedback>
        {getFieldDecorator('display_name', {
          initialValue: permission.display_name,
          rules: [{ required: true, message: '请填写权限名称' }],
        })(<Input placeholder="请输入权限名称" disabled={loading} />)}
      </FormItem>
    </Modal>
  );
};

export default Form.create<UpdateFormProps>()(UpdateForm);
