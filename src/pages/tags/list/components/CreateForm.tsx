import React from 'react';
import { Form, Input, InputNumber, Modal } from 'antd';
import { FormComponentProps } from 'antd/es/form';

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
  handleAdd: (values: object) => Promise<void>;
  handleModalVisible: () => void;
  loading: boolean;
}

const CreateForm: React.FC<CreateFormProps> = props => {
  const { modalVisible, form, handleAdd, handleModalVisible, loading } = props;
  const { getFieldDecorator } = form;

  const okHandle = () => {
    form.validateFields(async (err, values) => {
      if (err) return;
      await handleAdd(values);
      form.resetFields();
    });
  };

  return (
    <Modal
      destroyOnClose
      title="新建标签"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
      confirmLoading={loading}
    >
      <FormItem {...formItemLayout} label="标签名称" hasFeedback>
        {getFieldDecorator('name', {
          rules: [{ required: true, message: '请填写标签名称' }],
        })(<Input placeholder="请输入标签名称" disabled={loading} />)}
      </FormItem>
      <FormItem {...formItemLayout} label="slug" hasFeedback>
        {getFieldDecorator('slug')(<Input disabled={loading} />)}
      </FormItem>
      <FormItem {...formItemLayout} label="排序" hasFeedback>
        {getFieldDecorator('order')(
          <InputNumber placeholder="排序" disabled={loading} style={{ width: '100%' }} />,
        )}
      </FormItem>
    </Modal>
  );
};

export default Form.create<CreateFormProps>()(CreateForm);
