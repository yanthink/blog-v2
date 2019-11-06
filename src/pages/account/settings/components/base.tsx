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
import { get, debounce } from 'lodash';
import { ConnectProps, Loading, AuthStateType } from '@/models/connect';
import GeographicView from './GeographicView';
import AvatarView from './AvatarView';
import { sendEmailCode } from '../services';
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
  auth: AuthStateType;
  loading: Loading;
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

  componentWillUnmount () {
    clearInterval(this.interval);
  }

  handleSubmit = debounce((event: React.MouseEvent) => {
    event.preventDefault();
    const { form } = this.props;
    const { identifyingCode } = this.state;
    form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        await this.props.dispatch({
          type: 'accountSettings/updateBaseInfo',
          payload: { ...values, identifyingCode },
        });

        message.success('更新基本信息成功!');
      }
    });
  }, 600);

  handleEmailChange = (value: any) => {
    this.setState({
      emails: !value || value.indexOf('@') >= 0
        ? []
        : [`${value}@qq.com`, `${value}@163.com`, `${value}@gmail.com`],
    });
  };

  onSendEmailCode = debounce(async () => {
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
  }, 1000);

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

  render () {
    const {
      auth,
      loading,
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
              {getFieldDecorator('username', {
                initialValue: auth.user.username,
                rules: [
                  { required: true, message: '请输入您的用户名!' },
                  { pattern: /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{1,10}$/, message: '用户名格式不正确!' },
                ],
              })(
                <Input disabled={get(auth.user, 'cache.username_modify_count', 0) > 0} />,
              )}
            </FormItem>
            <FormItem label="邮箱">
              {getFieldDecorator('email', {
                initialValue: auth.user.email,
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
              getFieldValue('email') !== auth.user.email &&
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
              {getFieldDecorator('bio', {
                initialValue: auth.user.bio,
              })(
                <Input.TextArea
                  placeholder="个人简介"
                  rows={4}
                  maxLength={20}
                />,
              )}
            </FormItem>
            <FormItem label="国家/地区">
              {getFieldDecorator('extends.country', {
                initialValue: get(auth.user, 'extends.country'),
                rules: [{ required: true, message: '请输入您的国家或地区!' }],
              })(
                <Select style={{ display: 'block' }}>
                  <Option value="China">中国</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem label="所在省市">
              {getFieldDecorator('extends.geographic', {
                initialValue: get(auth.user, 'extends.geographic', {
                  city: { key: '', label: '' },
                  province: { key: '', label: '' }
                }),
                rules: [
                  { required: true, message: '请输入您的所在省市!' },
                  { validator: validatorGeographic },
                ],
              })(<GeographicView />)}
            </FormItem>
            <FormItem label="街道地址">
              {getFieldDecorator('extends.address', {
                initialValue: get(auth.user, 'extends.address'),
              })(<Input />)}
            </FormItem>
            <Button
              type="primary"
              onClick={this.handleSubmit}
              loading={loading.effects['accountSettings/updateBaseInfo']}
            >
              更新基本信息
            </Button>
          </Form>
        </div>
        <div className={styles.right}>
          {getFieldDecorator('avatar', {
            initialValue: auth.user.avatar,
          })(
            <AvatarView />,
          )}
        </div>
      </div>
    );
  }
}

export default Form.create<BaseViewProps>()(BaseView);
