import React from 'react';
import { Form, Input, InputNumber, Modal } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { ITag } from '@/models/data';

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
  handleUpdate: (id: number, values: Partial<ITag>) => Promise<void>;
  handleModalVisible: () => void;
  loading: boolean;
  tag: ITag;
}

const UpdateForm: React.FC<UpdateFormProps> = props => {
  const {
    modalVisible,
    form,
    handleUpdate,
    handleModalVisible,
    loading,
    tag,
  } = props;
  const { getFieldDecorator } = form;

  const okHandle = () => {
    form.validateFields(async (err, values) => {
      if (err) return;
      await handleUpdate(tag.id as number, values);
      form.resetFields();
    });
  };

  return (
    <Modal
      destroyOnClose
      title="编辑标签"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
      confirmLoading={loading}
    >
      <FormItem {...formItemLayout} label="标签名称" hasFeedback>
        {getFieldDecorator('name', {
          initialValue: tag.name,
          rules: [{ required: true, message: '请填写标签名称' }],
        })(<Input placeholder="请输入标签名称" disabled={loading} />)}
      </FormItem>
      <FormItem {...formItemLayout} label="slug" hasFeedback>
        {getFieldDecorator('slug', {
          initialValue: tag.slug,
        })(<Input disabled={loading} />)}
      </FormItem>
      <FormItem {...formItemLayout} label="排序" hasFeedback>
        {getFieldDecorator('order', {
          initialValue: tag.order,
        })(<InputNumber placeholder="排序" disabled={loading} style={{ width: '100%' }} />)}
      </FormItem>
    </Modal>
  );
};

export default Form.create<UpdateFormProps>()(UpdateForm);
