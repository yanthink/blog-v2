import React, { useState, useEffect } from 'react';
import { connect, Link, useRequest } from 'umi';
import { Button, Checkbox, Form, Input, message, Spin, Tabs } from 'antd';
import { CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import Echo from 'laravel-echo';
// @ts-ignore
import io from 'socket.io-client';
import { setSocketId } from '@/utils/authority';
import { ConnectState, ConnectProps } from '@/models/connect';
import { ResponseResultType } from '@/models/I';
import * as services from './services';
import styles from './style.less';

interface LoginProps extends ConnectProps {
  submitting: boolean;
}

const { TabPane } = Tabs;

let echo: Echo;
let timer: NodeJS.Timeout;

const Login: React.FC<LoginProps> = (props) => {
  const [loginCodeExpired, setLoginCodeExpired] = useState<Boolean>(false);

  // 获取小程序码，建立websocket链接
  const {
    loading: loginCodeLoading,
    data: { base64_img: loginCodeBase64 } = { base64_img: '' },
    run: getLoginCode,
  } = useRequest<ResponseResultType<{ base64_img: string; uuid: string }>>(services.getLoginCode, {
    initialData: { base64_img: '', uuid: '' },
    manual: true,
    onSuccess(data) {
      clearTimeout(timer);
      setLoginCodeExpired(false);

      echo
        .channel(`ScanLogin.${data.uuid}`)
        .listen(
          'WechatLogined',
          ({
            access_token: token,
            permissions,
          }: {
            access_token: string;
            permissions: string[];
          }) => {
            props.dispatch!({
              type: 'auth/loginSuccess',
              token,
              permissions,
              callback: () => {
                message.success('登录成功！');
              },
            });
          },
        );

      timer = setTimeout(() => {
        echo.leaveChannel(`ScanLogin.${data.uuid}`);
        setLoginCodeExpired(true);
      }, 120000);
    },
  });

  useEffect(() => {
    echo = new Echo({
      client: io,
      broadcaster: 'socket.io',
      host: SOCKET_HOST,
      withoutInterceptors: true,
    });

    setSocketId(echo.socketId());

    getLoginCode();

    return () => {
      try {
        clearTimeout(timer);
        setSocketId('');
        echo.disconnect();
      } catch (e) {
        //
      }
    };
  }, []);

  const handleSubmit = (values: object) => {
    props.dispatch!({
      type: 'auth/attemptLogin',
      payload: values,
    });
  };

  const renderCode = () => {
    if (loginCodeExpired && !loginCodeLoading) {
      return (
        <>
          <CloseCircleOutlined />
          <span className={styles.noticeTitle}>小程序码已失效</span>
          <Button
            className={styles.noticeBtn}
            type="primary"
            size="large"
            block
            onClick={getLoginCode}
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
        {loginCodeLoading || !loginCodeBase64 ? (
          <Spin indicator={<LoadingOutlined />} tip="正在加载..." />
        ) : (
          <img
            src={`data:image/png;base64,${loginCodeBase64}`}
            alt="小程序码"
            width="260"
            height="260"
          />
        )}
      </>
    );
  };

  return (
    <div className={styles.main}>
      <Form onFinish={handleSubmit}>
        <Tabs size="large">
          <TabPane tab="微信扫码登录" key="1">
            <div className={styles.qrcodeBox}>{renderCode()}</div>
          </TabPane>
          <TabPane tab="账户密码登录" key="2">
            <div>
              <Form.Item
                name="account"
                rules={[{ required: true, message: '请输入账户名称！' }]}
                hasFeedback
              >
                <Input size="large" placeholder="账户名称" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入账户密码！' }]}
                hasFeedback
              >
                <Input.Password size="large" placeholder="账户密码" />
              </Form.Item>
              <Form.Item>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox disabled>自动登录</Checkbox>
                </Form.Item>
                <Link style={{ float: 'right' }} to="#">
                  忘记密码
                </Link>
                <Button
                  size="large"
                  type="primary"
                  block
                  loading={props.submitting}
                  htmlType="submit"
                >
                  登录
                </Button>
              </Form.Item>
            </div>
          </TabPane>
        </Tabs>
      </Form>
    </div>
  );
};

export default connect(({ loading }: ConnectState) => ({
  submitting: loading.effects['auth/attemptLogin'],
}))(Login);
