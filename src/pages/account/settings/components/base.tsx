import React, { Component } from 'react';
import { Button, Form, Input, Select, message } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { get } from 'lodash';
import { ConnectProps } from '@/models/connect';
import { IUser } from '@/models/data';
import GeographicView from './GeographicView';
import AvatarView from './AvatarView';
import styles from './BaseView.less';

const FormItem = Form.Item;
const { Option } = Select;

interface SelectItem {
  label: string;
  key: string;
}

const validatorGeographic = (
  _: any,
  value: {
    province: SelectItem;
    city: SelectItem;
  },
  callback: (message?: string) => void,
) => {
  const { province, city } = value;
  if (!province.key) {
    callback('Please input your province!');
  }
  if (!city.key) {
    callback('Please input your city!');
  }
  callback();
};

interface BaseViewProps extends ConnectProps, FormComponentProps {
  currentUser: IUser;
}

class BaseView extends Component<BaseViewProps> {
  handlerSubmit = (event: React.MouseEvent) => {
    event.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'accountSettings/updateBaseInfo',
          payload: values,
          callback: () => {
            message.success('更新基本信息成功!');
          },
        });
      }
    });
  };

  render() {
    const {
      currentUser,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div className={styles.baseView}>
        <div className={styles.left}>
          <Form layout="vertical" hideRequiredMark>
            <FormItem label="用户名" extra="用户名只能修改一次，请谨慎操作！">
              {getFieldDecorator('name', {
                initialValue: currentUser.name,
                rules: [{ required: true, message: '请输入您的用户名!' }],
              })(<Input disabled={currentUser.name !== get(currentUser, 'user_info.nickName')} />)}
            </FormItem>
            <FormItem label="邮箱">
              {getFieldDecorator('email', {
                initialValue: currentUser.email,
              })(<Input />)}
            </FormItem>
            <FormItem label="个人简介">
              {getFieldDecorator('user_info.signature', {
                initialValue: get(currentUser, 'user_info.signature'),
              })(
                <Input.TextArea
                  placeholder="个人简介"
                  rows={4}
                  maxLength={20}
                />,
              )}
            </FormItem>
            <FormItem label="国家/地区">
              {getFieldDecorator('user_info.country', {
                initialValue: get(currentUser, 'user_info.country'),
                rules: [{ required: true, message: '请输入您的国家或地区!' }],
              })(
                <Select style={{ display: 'block' }}>
                  <Option value="China">中国</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem label="所在省市">
              {getFieldDecorator('user_info.geographic', {
                initialValue: get(currentUser, 'user_info.geographic'),
                rules: [
                  { required: true, message: '请输入您的所在省市!' },
                  { validator: validatorGeographic },
                ],
              })(<GeographicView />)}
            </FormItem>
            <FormItem label="街道地址">
              {getFieldDecorator('user_info.address', {
                initialValue: get(currentUser, 'user_info.address'),
              })(<Input />)}
            </FormItem>
            <Button type="primary" onClick={this.handlerSubmit}>
              更新基本信息
            </Button>
          </Form>
        </div>
        <div className={styles.right}>
          {getFieldDecorator('user_info.avatarUrl', {
            initialValue: get(currentUser, 'user_info.avatarUrl'),
          })(
            <AvatarView />,
          )}
        </div>
      </div>
    );
  }
}

export default Form.create<BaseViewProps>()(BaseView);
