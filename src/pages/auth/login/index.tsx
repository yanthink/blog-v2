import { Form, Tabs, Input, Button, Checkbox, Spin, Icon, message } from 'antd';
import React, { Component } from 'react';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import { Link } from 'umi';
import Echo from 'laravel-echo';
// @ts-ignore
import io from 'socket.io-client';
import { ConnectState, ConnectProps } from '@/models/connect';
import { setSocketId } from '@/utils/authority';
import * as services from './services';
import styles from './style.less';

const FormItem = Form.Item;
const { TabPane } = Tabs;

interface LoginProps extends ConnectProps, FormComponentProps {
  submitting: boolean;
}

interface LoginState {
  uuid: string;
  base64Img: string;
  codeExpired: boolean;
  codeLoading: boolean;
}

@connect(({ loading }: ConnectState) => ({
  submitting: loading.effects['auth/attemptLogin'],
}))
class Login extends Component<LoginProps, LoginState> {
  static socketTimeout = 120000;

  state: LoginState = {
    uuid: '',
    base64Img: '',
    codeExpired: false,
    codeLoading: false,
  };

  echo: Echo;

  timer: any;

  constructor (props: LoginProps) {
    super(props);

    this.echo = new Echo({
      client: io,
      broadcaster: 'socket.io',
      host: SOCKET_HOST,
      withoutInterceptors: true,
    });

    setSocketId(this.echo.socketId());
  }

  componentDidMount () {
    this.createWebSocket();
  }

  componentWillUnmount () {
    clearTimeout(this.timer);
    setSocketId('');
    this.echo.disconnect();
  }

  createWebSocket = async () => {
    clearTimeout(this.timer);

    this.setState({ codeExpired: false, codeLoading: true });

    try {
      const { data: { base64_img: base64Img, uuid } } = await services.getLoginCode();

      this.echo.channel(`ScanLogin.${uuid}`)
        .listen('WechatLogined', (data: { access_token: string, permissions: string[] }) => {
          this.props.dispatch({
            type: 'auth/loginSuccess',
            token: data.access_token,
            permissions: data.permissions,
            callback: () => {
              message.success('登录成功！');
            },
          });
        });

      this.setState({ uuid, base64Img, codeExpired: false, codeLoading: false });

      this.timer = setTimeout(this.handleWebSocketTimeout, Login.socketTimeout);
    } catch (e) {
      message.error('小程序码获取失败');
    }
  };

  handleWebSocketTimeout = () => {
    this.echo.leaveChannel(`ScanLogin.${this.state.uuid}`);
    this.setState({ codeExpired: true });
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { form } = this.props;

    form.validateFields({ force: true }, (err: any, values: object) => {
      if (!err) {
        this.props.dispatch({
          type: 'auth/attemptLogin',
          payload: values,
        });
      }
    });
  };

  renderCode = () => {
    const { base64Img, codeExpired, codeLoading } = this.state;
    if (codeExpired) {
      return (
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
      );
    }

    return (
      <>
        <p>微信扫码后点击“登录”，</p>
        <p>即可完成账号绑定及登录。</p>
        {
          codeLoading
            ? <Spin indicator={<Icon type="loading" spin />} tip="正在加载..." />
            : <img src={`data:image/png;base64,${base64Img}`} alt="小程序码" width="260" height="260" />
        }
      </>
    );
  };

  render () {
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div className={styles.main}>
        <Form onSubmit={this.handleSubmit}>
          <Tabs size="large">
            <TabPane tab="微信扫码登录" key="1">
              <div className={styles.qrcodeBox}>
                {this.renderCode()}
              </div>
            </TabPane>
            <TabPane tab="账户密码登录" key="2">
              <div>
                <FormItem hasFeedback>
                  {getFieldDecorator('account', {
                    rules: [{ required: true, message: '请输入账户名称！' }],
                  })(<Input size="large" placeholder="账户名称" />)}
                </FormItem>
                <FormItem hasFeedback>
                  {getFieldDecorator('password', {
                    rules: [{ required: true, message: '请输入账户密码！' }],
                  })(<Input.Password size="large" placeholder="账户密码" />)}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('remember', { valuePropName: 'checked' })(
                    <Checkbox disabled>自动登录</Checkbox>,
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
