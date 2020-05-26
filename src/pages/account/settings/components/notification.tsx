import React from 'react';
import { Button, Form, List, message, Switch } from 'antd';
import { connect, useRequest } from 'umi';
import { AuthModelState, ConnectProps, ConnectState } from '@/models/connect';
import { IUser, ResponseResultType } from '@/models/I';
import * as services from '../services';

interface NotificationViewState extends Partial<ConnectProps> {
  auth?: AuthModelState;
}

const NotificationView: React.FC<NotificationViewState> = (props) => {
  const { loading, run: updateSettings } = useRequest<ResponseResultType<IUser>>(
    services.updateSettings,
    {
      manual: true,
      onSuccess(data) {
        props.dispatch!({
          type: 'auth/setUser',
          user: data,
        });
        message.success('修改成功！');
      },
    },
  );

  async function handleSubmit(values: object) {
    await updateSettings(values);
  }

  return (
    <Form
      layout="vertical"
      initialValues={{
        settings: {
          comment_email_notify: props.auth!.user.settings?.comment_email_notify,
          liked_email_notify: props.auth!.user.settings?.liked_email_notify,
        },
      }}
      onFinish={handleSubmit}
    >
      <Form.Item>
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              title: '评论通知',
              description: '系统在你离线时将以邮件的形式通知',
              actions: [
                <Form.Item name={['settings', 'comment_email_notify']} valuePropName="checked">
                  <Switch checkedChildren="开" unCheckedChildren="关" />
                </Form.Item>,
              ],
            },
            {
              title: '点赞通知',
              description: '系统在你离线时将以邮件的形式通知',
              actions: [
                <Form.Item name={['settings', 'liked_email_notify']} valuePropName="checked">
                  <Switch checkedChildren="开" unCheckedChildren="关" />
                </Form.Item>,
              ],
            },
          ]}
          renderItem={(item) => (
            <List.Item actions={item.actions}>
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          应用修改
        </Button>
      </Form.Item>
    </Form>
  );
};

export default connect(({ auth }: ConnectState) => ({ auth }))(NotificationView);
