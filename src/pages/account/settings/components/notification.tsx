import React, { Component } from 'react';
import { Button, Form, List, Switch, message } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { get, debounce } from 'lodash';
import { ConnectProps, Loading, AuthStateType } from '@/models/connect';

const FormItem = Form.Item;

interface NotificationViewState {
}

interface NotificationViewProps extends ConnectProps, FormComponentProps {
  auth: AuthStateType;
  loading: Loading;
}

class NotificationView extends Component<NotificationViewProps, NotificationViewState> {
  getData = () => {
    const { form: { getFieldDecorator }, auth } = this.props;

    return [
      {
        title: '评论通知',
        description: '系统在你离线时将以邮件的形式通知',
        actions: [
          getFieldDecorator('settings.comment_email_notify', {
            initialValue: get(auth.user, 'settings.comment_email_notify', true),
            valuePropName: 'checked',
          })(
            <Switch
              checkedChildren="开"
              unCheckedChildren="关"
            />
          ),
        ],
      },
      {
        title: '点赞通知',
        description: '系统在你离线时将以邮件的形式通知',
        actions: [
          getFieldDecorator('settings.liked_email_notify', {
            initialValue: get(auth.user, 'settings.liked_email_notify', true),
            valuePropName: 'checked',
          })(
            <Switch
              checkedChildren="开"
              unCheckedChildren="关"
            />
          ),
        ],
      },
    ];
  };

  handleSubmit = debounce((event: React.MouseEvent) => {
    event.preventDefault();
    const { form } = this.props;
    form.validateFields(async (err, values) => {
      if (!err) {
        await this.props.dispatch({
          type: 'accountSettings/updateSettings',
          payload: values,
        });

        message.success('修改成功！');
      }
    });
  }, 600);

  render () {
    const data = this.getData();
    const { loading } = this.props;

    return (
      <Form layout="vertical">
        <FormItem>
          <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={item => (
              <List.Item actions={item.actions}>
                <List.Item.Meta title={item.title} description={item.description} />
              </List.Item>
            )}
          />
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            onClick={this.handleSubmit}
            loading={loading.effects['accountSettings/updateSettings']}
          >
            应用修改
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create<NotificationViewProps>()(NotificationView);
