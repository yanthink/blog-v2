import { Form, Input, Button, Checkbox, Icon } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import Link from 'umi/link';
import { connect } from 'dva';
import styles from './style.less';

const FormItem = Form.Item;

interface LoginProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  submitting: boolean;
}

interface LoginState {}

export interface FromDataType {
  username: string;
  password: string;
  remember: boolean;
}

@connect(({ loading }: { loading: { effects: { [key: string]: string } } }) => ({
  submitting: loading.effects['authLogin/login'],
}))
class Login extends Component<LoginProps, LoginState> {
  state: LoginState = {};

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { form } = this.props;

    form.validateFields({ force: true }, (err: any, values: FromDataType) => {
      if (!err) {
        const { dispatch } = this.props;
        dispatch({
          type: 'authLogin/login',
          payload: values,
        });
      }
    });
  };

  render() {
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div className={styles.main}>
        <Form onSubmit={this.handleSubmit}>
          <div className={styles.title}>
            <FormattedMessage id="auth-login.login.title" />
          </div>
          <div>
            <FormItem hasFeedback>
              {getFieldDecorator('account', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'auth-login.username.required' }),
                  },
                ],
              })(
                <Input
                  size="large"
                  placeholder={`${formatMessage({ id: 'auth-login.login.username' })}`}
                />,
              )}
            </FormItem>
            <FormItem hasFeedback>
              {getFieldDecorator('password', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'auth-login.password.required' }),
                  },
                ],
              })(
                <Input
                  size="large"
                  type="password"
                  placeholder={`${formatMessage({ id: 'auth-login.login.password' })}`}
                />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('remember')(
                <Checkbox>
                  <FormattedMessage id="auth-login.login.remember-me" />
                </Checkbox>,
              )}
              <a style={{ float: 'right' }} href="">
                <FormattedMessage id="auth-login.login.forgot-password" />
              </a>
              <Button size="large" type="primary" block loading={submitting} htmlType="submit">
                <FormattedMessage id="auth-login.login.login" />
              </Button>
            </FormItem>
          </div>
          <div className={styles.other}>
            <FormattedMessage id="auth-login.login.sign-in-with" />
            <Icon type="wechat" className={styles.icon} theme="outlined" />
            <Link className={styles.register} to="/user/register">
              <FormattedMessage id="auth-login.login.signup" />
            </Link>
          </div>
        </Form>
      </div>
    );
  }
}

export default Form.create<LoginProps>()(Login);
