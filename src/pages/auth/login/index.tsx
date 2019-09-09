import { Form, Tabs, Input, Button, Checkbox, Spin, Icon, message } from 'antd';
import React, { Component } from 'react';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import { Link } from 'umi';
import { ConnectState, ConnectProps } from '@/models/connect';
import { getSocketUrl } from '@/utils/utils';
import { getLoginCode } from './service';
import styles from './style.less';

const FormItem = Form.Item;
const { TabPane } = Tabs;

interface LoginProps extends ConnectProps, FormComponentProps {
  submitting: boolean;
}

interface LoginState {
  base64Img: string;
  codeExpired: boolean;
  codeLoading: boolean;
}

@connect(({ loading }: ConnectState) => ({
  submitting: loading.effects['authLogin/login'],
}))
class Login extends Component<LoginProps, LoginState> {
  static socketTimeout = 120000;

  state: LoginState = {
    base64Img: '',
    codeExpired: false,
    codeLoading: false,
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

  createWebSocket = async () => {
    clearTimeout(this.timer);

    if (this.ws && this.ws.readyState === 1) {
      this.ws.close();
    }

    this.setState({ codeExpired: false, codeLoading: true });

    const { data: { base64_img: base64Img, token } } = await getLoginCode();

    this.ws = new WebSocket(getSocketUrl({ token }));

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

    this.setState({ base64Img, codeExpired: false, codeLoading: false });

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

  render() {
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
                  {getFieldDecorator('remember')(
                    <Checkbox>自动登录</Checkbox>,
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
