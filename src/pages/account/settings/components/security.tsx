import React, { Component } from 'react';
import { Button, Form, Input, message } from 'antd';
import { debounce } from 'lodash';
import { FormComponentProps } from 'antd/es/form';
import { router } from 'umi';
import { ConnectProps, Loading, AuthStateType } from '@/models/connect';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    md: { span: 24 },
    xl: { span: 8 },
  },
};

interface SecurityViewState {
  confirmDirty: boolean;
}

interface SecurityViewProps extends ConnectProps, FormComponentProps {
  auth: AuthStateType;
  loading: Loading;
}

class SecurityView extends Component<SecurityViewProps, SecurityViewState> {
  state: SecurityViewState = {
    confirmDirty: false,
  };

  handleSubmit = debounce((event: React.MouseEvent) => {
    event.preventDefault();
    const { form } = this.props;
    form.validateFields(async (err, values) => {
      if (!err) {
        await this.props.dispatch({
          type: 'accountSettings/updatePassword',
          payload: values,
        });

        message.success('密码修改成功，请重新登录！');
        router.replace('/auth/login');
      }
    });
  }, 600);

  handleConfirmBlur = (e: any) => {
    const { value } = e.target;
    /* eslint react/no-access-state-in-setstate: 0 */
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  compareToFirstPassword = (rule: any, value: any, callback: any) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('您输入的两个密码不一致!');
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule: any, value: any, callback: any) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(['password_confirmation'], { force: true });
    }
    callback();
  };

  render () {
    const { form: { getFieldDecorator }, auth, loading } = this.props;
    return (
      <Form layout="vertical" hideRequiredMark>
        <FormItem {...formItemLayout} label="用户名" extra="设置密码后将可以使用此用户名登录">
          <Input value={auth.user.username} disabled />
        </FormItem>
        {auth.user.has_password && (
          <FormItem {...formItemLayout} label="旧密码">
            {getFieldDecorator('old_password', {
              rules: [{ required: true, message: '请输入您的旧密码!' }],
            })(<Input.Password />)}
          </FormItem>
        )}
        <FormItem {...formItemLayout} label="密码">
          {getFieldDecorator('password', {
            rules: [
              { required: true, message: '请输入您的密码!' },
              { min: 6, message: '密码长度不能小于6位!' },
              { validator: this.validateToNextPassword },
            ],
          })(<Input.Password />)}
        </FormItem>
        <FormItem {...formItemLayout} label="确认密码">
          {getFieldDecorator('password_confirmation', {
            rules: [
              { required: true, message: '请输入您的确认密码!' },
              { validator: this.compareToFirstPassword },
            ],
          })(<Input.Password onBlur={this.handleConfirmBlur} />)}
        </FormItem>
        <Button
          type="primary"
          onClick={this.handleSubmit}
          loading={loading.effects['accountSettings/updatePassword']}
        >
          应用修改
        </Button>
      </Form>
    );
  }
}

export default Form.create<SecurityViewProps>()(SecurityView);
