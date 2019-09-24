import React, { Component } from 'react';
import { Button, Form, List, Switch, message } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { get } from 'lodash';
import { ConnectProps, Loading } from '@/models/connect';
import { IUser } from '@/models/data';

const FormItem = Form.Item;

interface NotificationViewState {
}

interface NotificationViewProps extends ConnectProps, FormComponentProps {
  currentUser: IUser;
  loading: Loading;
}

class NotificationView extends Component<NotificationViewProps, NotificationViewState> {
  getData = () => {
    const {
      form: { getFieldDecorator },
      currentUser,
    } = this.props;

    return [
      {
        title: '评论通知',
        description: '系统在你离线时将以邮件的形式通知',
        actions: [
          getFieldDecorator('settings.reply_notify', {
            initialValue: get(currentUser, 'settings.reply_notify', true),
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
          getFieldDecorator('settings.like_notify', {
            initialValue: get(currentUser, 'settings.like_notify', true),
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

  handlerSubmit = (event: React.MouseEvent) => {
    event.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'accountSettings/updateSettings',
          payload: values,
          callback: () => {
            message.success('修改成功！');
          },
        });
      }
    });
  };

  render() {
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
            onClick={this.handlerSubmit}
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
