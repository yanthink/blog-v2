import { Form, Tabs, Input, Button, Checkbox, Icon, message } from 'antd';
import React, { Component } from 'react';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import { Link } from 'umi';
import { ConnectState, ConnectProps } from '@/models/connect';
import { randomString } from '@/utils/utils';
import styles from './style.less';

const FormItem = Form.Item;
const { TabPane } = Tabs;

interface LoginProps extends ConnectProps, FormComponentProps {
  submitting: boolean;
}

interface LoginState {
  uuid: string;
  codeExpired: boolean;
}

@connect(({ loading }: ConnectState) => ({
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

    this.ws.addEventListener('message', (e: any) => {
      const { data: msg } = e;

      const { event, data } = JSON.parse(msg);
      /* eslint no-case-declarations:0 */
      switch (event) {
        case 'App\\Events\\WechatScanLogin':
          const { token, permissions } = data;

          this.props.dispatch({
            type: 'authLogin/loginSuccess',
            payload: { token, permissions },
            callback: () => {
              message.success('登录成功！');
              clearTimeout(this.timer);
              if (this.ws && this.ws.readyState === 1) {
                this.ws.close();
              }
            },
          });
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

    form.validateFields({ force: true }, (err: any, values: object) => {
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
                        message: '请输入账户名称！',
                      },
                    ],
                  })(
                    <Input
                      size="large"
                      placeholder="账户名称"
                    />,
                  )}
                </FormItem>
                <FormItem hasFeedback>
                  {getFieldDecorator('password', {
                    rules: [
                      {
                        required: true,
                        message: '请输入账户密码！',
                      },
                    ],
                  })(
                    <Input
                      size="large"
                      type="password"
                      placeholder="账户密码"
                    />,
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('remember')(
                    <Checkbox>
                      自动登录
                    </Checkbox>,
                  )}
                  <Link style={{ float: 'right' }} to="#">
                    忘记密码
                  </Link>
                  <Button size="large" type="primary" block loading={submitting} htmlType="submit">
                    登录
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
