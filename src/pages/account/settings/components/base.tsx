import React, { Component } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Popover,
  Icon,
  AutoComplete,
  Row,
  Col,
  message,
} from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { get } from 'lodash';
import { ConnectProps } from '@/models/connect';
import { IUser } from '@/models/data';
import GeographicView from './GeographicView';
import AvatarView from './AvatarView';
import { sendEmailCode } from '../service';
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

interface BaseViewState {
  emails: string[];
  emailCodeSending: boolean;
  emailCodeCountDown: number;
  identifyingCode: string;
}

class BaseView extends Component<BaseViewProps, BaseViewState> {
  state: BaseViewState = {
    emails: [],
    emailCodeSending: false,
    emailCodeCountDown: 0,
    identifyingCode: '',
  };

  interval: number | undefined = undefined;

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handlerSubmit = (event: React.MouseEvent) => {
    event.preventDefault();
    const { form } = this.props;
    const { identifyingCode } = this.state;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'accountSettings/updateBaseInfo',
          payload: { ...values, identifyingCode },
          callback: () => {
            message.success('更新基本信息成功!');
          },
        });
      }
    });
  };

  handleEmailChange = (value: any) => {
    this.setState({
      emails:
        !value || value.indexOf('@') >= 0
          ? []
          : [`${value}@qq.com`, `${value}@163.com`, `${value}@gmail.com`],
    });
  };

  onSendEmailCode = async () => {
    const { form: { getFieldValue } } = this.props;
    const email = getFieldValue('email');

    try {
      this.setState({ identifyingCode: '', emailCodeSending: true });
      const { data: { identifyingCode } } = await sendEmailCode(email);
      this.setState({ identifyingCode, emailCodeSending: false });
      this.runSendEmailCodeCountDown();
    } catch (e) {
      this.setState({ emailCodeSending: false });
    }
  };

  runSendEmailCodeCountDown = () => {
    let countDown = 119;
    this.setState({ emailCodeCountDown: countDown });
    this.interval = window.setInterval(() => {
      countDown -= 1;
      this.setState({ emailCodeCountDown: countDown });
      if (countDown === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  };

  render() {
    const {
      currentUser,
      form: { getFieldDecorator, isFieldTouched, getFieldError, getFieldValue },
    } = this.props;
    const { emails, emailCodeSending, emailCodeCountDown, identifyingCode } = this.state;

    return (
      <div className={styles.baseView}>
        <div className={styles.left}>
          <Form layout="vertical" hideRequiredMark>
            <FormItem
              label={
                <span>
                  用户名&nbsp;
                  <Popover
                    placement="top"
                    trigger="hover"
                    content={
                      <div style={{ maxWidth: 260 }}>
                        1-10位字符，可包含中文，英文，数字和下划线，不能以下划线开头和结尾。
                      </div>
                    }
                  >
                    <Icon type="question-circle-o" />
                  </Popover>
                </span>
              }
              extra="用户名只能修改一次，请谨慎操作！"
            >
              {getFieldDecorator('name', {
                initialValue: currentUser.name,
                rules: [
                  { required: true, message: '请输入您的用户名!' },
                  { pattern: /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{1,10}$/, message: '用户名格式不正确!' },
                ],
              })(
                <Input disabled={currentUser.name !== get(currentUser, 'user_info.nickName')} />
              )}
            </FormItem>
            <FormItem label="邮箱">
              {getFieldDecorator('email', {
                initialValue: currentUser.email,
                rules: [
                  { type: 'email', message: '邮箱格式不正确!' },
                ],
              })(
                <AutoComplete
                  dataSource={emails}
                  onChange={this.handleEmailChange}
                  placeholder="Email"
                />
              )}
            </FormItem>
            {
              isFieldTouched('email') &&
              !getFieldError('email') &&
              getFieldValue('email') &&
              getFieldValue('email') !== currentUser.email &&
              <FormItem label="验证码">
                <Row gutter={8}>
                  <Col span={14}>
                    {getFieldDecorator('email_code', {
                      rules: [
                        { required: true, message: '请填写验证码!' },
                        { pattern: /^\d{4}$/, message: '验证码格式不正确!' },
                      ],
                    })(
                      <InputNumber style={{ width: '100%' }} placeholder={`识别码：${identifyingCode}`} />
                    )}
                  </Col>
                  <Col span={10}>
                    <Button
                      disabled={!!emailCodeCountDown}
                      loading={emailCodeSending}
                      onClick={this.onSendEmailCode}
                      style={{ minWidth: '100%', padding: 'auto 12px' }}
                    >
                      {emailCodeCountDown ? `${emailCodeCountDown} second` : '获取验证码'}
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            }
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
