import { Form, Tabs, Input, Button, Checkbox, Icon, message } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import { router } from 'umi';
import { randomString } from '@/utils/utils';
import { setAuthority, setToken } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';
import { getPageQuery } from './utils/utils';
import styles from './style.less';

const FormItem = Form.Item;
const { TabPane } = Tabs;

interface LoginProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  submitting: boolean;
}

interface LoginState {
  uuid: string;
  codeExpired: boolean;
}

export interface FromDataType {
  username: string;
  password: string;
  remember: boolean;
}

@connect(({ loading }: { loading: { effects: { [key: string]: string } } }) => ({
  submitting: loading.effects['authLogin/login'],
}))
class Login extends Component<LoginProps, LoginState> {
  static socketTimeout = 120000;

  state: LoginState = {
    uuid: '',
    codeExpired: true,
  };

  ws: any;

  timer: any;

  componentDidMount() {
    this.createWebSocket();
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    if (this.ws && this.ws.readyState === 1) {
      this.ws.close();
    }
  }

  createWebSocket = () => {
    clearTimeout(this.timer);

    if (this.ws && this.ws.readyState === 1) {
      this.ws.close();
    }

    const uuid = randomString(16);

    const socketUrl = `wss://${window.location.host}/wss?uuid=${uuid}`;
    this.ws = new WebSocket(socketUrl);

    this.ws.addEventListener('open', () => {
      /* eslint no-console:0 */
      console.info(`websocket open: ${uuid}`)
    });

    this.ws.addEventListener('message', (e: any) => {
      const { data: msg } = e;

      const { event, data } = JSON.parse(msg);
      /* eslint no-case-declarations:0 */
      switch (event) {
        case 'App\\Events\\WechatScanLogin':
          const { permissions, token } = data;
          setToken(token);
          setAuthority(permissions);
          reloadAuthorized();

          message.success('登录成功！');

          clearTimeout(this.timer);
          if (this.ws && this.ws.readyState === 1) {
            this.ws.close();
          }

          const urlParams = new URL(window.location.href);

          const params = getPageQuery();
          let { redirect } = params as { redirect: string };
          if (redirect) {
            const redirectUrlParams = new URL(redirect);
            if (redirectUrlParams.origin === urlParams.origin) {
              redirect = redirect.substr(urlParams.origin.length);
              if (redirect.match(/^\/.*#/)) {
                redirect = redirect.substr(redirect.indexOf('#') + 1);
              }
            } else {
              window.location.href = redirect;
              return;
            }
          }

          router.replace(redirect || '/');
          break;
        default:
          break;
      }
    });

    this.setState({ uuid, codeExpired: false });

    this.timer = setTimeout(this.handleWebSocketTimeout, Login.socketTimeout);
  };

  handleWebSocketTimeout = () => {
    if (this.ws && this.ws.readyState === 1) {
      this.ws.close();
    }

    this.setState({ codeExpired: true });
  };

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
    const { uuid, codeExpired } = this.state;
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div className={styles.main}>
        <Form onSubmit={this.handleSubmit}>
          <Tabs size="large">
            <TabPane tab="微信扫码登录" key="1">
              <div className={styles.qrcodeBox}>
                {
                  codeExpired
                    ?
                    (
                      <>
                        <Icon type="close-circle" /><span className={styles.noticeTitle}>小程序码已失效</span>
                        <Button
                          className={styles.noticeBtn}
                          type="primary"
                          size="large"
                          block
                          onClick={this.createWebSocket}
                        >
                          刷新小程序码
                        </Button>
                      </>
                    )
                    :
                    (
                      <>
                        <p>微信扫码后点击“登录”，</p>
                        <p>即可完成账号绑定及登录。</p>
                        {
                          uuid &&
                          <img src={`/api/wechat/login_code?uuid=${uuid}`} alt="小程序码" width="260" height="260" />
                        }
                      </>
                    )
                }
              </div>
            </TabPane>
            <TabPane tab="账户密码登录" key="2">
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
            </TabPane>
          </Tabs>
        </Form>
      </div>
    );
  }
}

export default Form.create<LoginProps>()(Login);
