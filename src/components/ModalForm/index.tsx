import React from 'react';
import { Form, Modal } from 'antd';
import { IRole } from '@/models/I';
import { ModalProps } from 'antd/es/modal';
import { FormInstance } from 'antd/es/form';

export interface ModalFormProps extends ModalProps {
  onSubmit: (values: object) => void;
  submitting: boolean;
  initialValues?: { [key: string]: any };
  form?: FormInstance;
}

const ModalForm: React.FC<ModalFormProps> = (props) => {
  const [form] = Form.useForm(props.form);

  const { title, visible, onSubmit, onCancel, submitting, ...modalProps } = props;

  async function handleOK() {
    const values = await form.validateFields();
    await props.onSubmit(values as IRole);
    form.resetFields();
  }

  return (
    <Modal
      destroyOnClose
      {...modalProps}
      title={props.title}
      visible={props.visible}
      onOk={handleOK}
      onCancel={props.onCancel}
      confirmLoading={props.submitting}
    >
      <Form form={form} initialValues={props.initialValues}>
        {props.children}
      </Form>
    </Modal>
  );
};

export default ModalForm;
