import React, { useState } from 'react';
import { connect, useRequest, history } from 'umi';
import { Button, Form, Input, message } from 'antd';
import { AuthModelState, ConnectProps, ConnectState } from '@/models/connect';
import * as services from '../services';

interface SecurityViewProps extends Partial<ConnectProps> {
  auth?: AuthModelState;
}

const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    md: { span: 24 },
    xl: { span: 8 },
  },
};

const SecurityView: React.FC<SecurityViewProps> = (props) => {
  const [form] = Form.useForm();
  const [confirmDirty, setConfirmDirty] = useState(false);

  const { loading, run: updatePassword } = useRequest(services.updatePassword, {
    manual: true,
    onSuccess() {
      message.success('密码修改成功，请重新登录！');
      history.replace('/auth/login');
    },
  });

  async function handleSubmit(values: object) {
    await updatePassword(values);
  }

  function validateToNextPassword(rule: any, value: string, callback: any) {
    if (value && confirmDirty) {
      form.validateFields(['password_confirmation']);
    }
    callback();
  }

  function handleConfirmBlur(e: any) {
    const { value } = e.target;
    setConfirmDirty(confirmDirty || !!value);
  }

  function compareToFirstPassword(rule: any, value: string, callback: any) {
    if (value && value !== form.getFieldValue('password')) {
      callback('您输入的两个密码不一致!');
    } else {
      callback();
    }
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} hideRequiredMark>
      <Form.Item label="用户名" extra="设置密码后将可以使用此用户名登录" {...formItemLayout}>
        <Input value={props.auth!.user.username} disabled />
      </Form.Item>
      {props.auth!.user.has_password && (
        <Form.Item
          label="旧密码"
          name="old_password"
          rules={[{ required: true, message: '请输入您的旧密码!' }]}
          {...formItemLayout}
        >
          <Input.Password />
        </Form.Item>
      )}
      <Form.Item
        label="密码"
        name="password"
        rules={[
          { required: true, message: '请输入您的密码!' },
          { min: 6, message: '密码长度不能小于6位!' },
          { validator: validateToNextPassword },
        ]}
        {...formItemLayout}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label="确认密码"
        name="password_confirmation"
        rules={[
          { required: true, message: '请输入您的确认密码!' },
          { validator: compareToFirstPassword },
        ]}
        {...formItemLayout}
      >
        <Input.Password onBlur={handleConfirmBlur} />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={loading}>
        应用修改
      </Button>
    </Form>
  );
};

export default connect(({ auth }: ConnectState) => ({ auth }))(SecurityView);
