import React, { useEffect, useState } from 'react';
import { connect, useRequest } from 'umi';
import {
  AutoComplete,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Popover,
  Row,
  Select,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ConnectProps, AuthModelState, ConnectState } from '@/models/connect';
import { IUser, ResponseResultType } from '@/models/I';
import GeographicView from './GeographicView';
import AvatarView from './AvatarView';
import * as services from '../services';
import styles from './BaseView.less';

interface BaseViewProps extends Partial<ConnectProps> {
  auth?: AuthModelState;
}

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

let timer: number;

const BaseView: React.FC<BaseViewProps> = (props) => {
  const [form] = Form.useForm();
  const [emails, setEmails] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    return () => {
      clearInterval(timer);
    };
  }, []);

  const {
    loading: emailCodeSending,
    data: { identifyingCode } = { identifyingCode: '' },
    run: sendEmailCode,
  } = useRequest<ResponseResultType<{ identifyingCode: string }>>(
    () => services.sendEmailCode(form.getFieldValue('email')),
    {
      manual: true,
      onSuccess() {
        clearInterval(timer);
        let t = 119;
        setCountdown(t);
        timer = window.setInterval(() => {
          t -= 1;
          setCountdown(t);
          if (t === 0) {
            clearInterval(timer);
          }
        }, 1000);
      },
    },
  );

  const { loading: submitting, run: updateBaseInfo } = useRequest<ResponseResultType<IUser>>(
    services.updateBaseInfo,
    {
      manual: true,
      onSuccess(data) {
        props.dispatch!({
          type: 'auth/setUser',
          user: data,
        });
        message.success('更新基本信息成功!');
      },
    },
  );

  async function handleSubmit(values: object) {
    await updateBaseInfo(values);
  }

  function handleEmailChange(value?: string) {
    const completeEmails =
      !value || value.indexOf('@') >= 0
        ? []
        : [`${value}@qq.com`, `${value}@163.com`, `${value}@gmail.com`];
    setEmails(completeEmails);
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        username: props.auth!.user.username,
        email: props.auth!.user.email,
        bio: props.auth!.user.bio,
        extends: {
          country: props.auth!.user.extends?.country,
          geographic: props.auth!.user.extends?.geographic || {
            city: { key: '', label: '' },
            province: { key: '', label: '' },
            address: props.auth!.user.extends?.address,
          },
        },
        avatar: props.auth!.user.avatar,
      }}
      onFinish={handleSubmit}
      hideRequiredMark
    >
      <div className={styles.baseView}>
        <div className={styles.left}>
          <Form.Item
            label={
              <div>
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
                  <QuestionCircleOutlined />
                </Popover>
              </div>
            }
            name="username"
            rules={[
              { required: true, message: '请输入您的用户名!' },
              {
                pattern: /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{1,10}$/,
                message: '用户名格式不正确!',
              },
            ]}
            extra="用户名只能修改一次，请谨慎操作！"
          >
            <Input disabled={props.auth!.user.cache?.username_modify_count! > 0} />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[{ type: 'email', message: '邮箱格式不正确!' }]}
          >
            <AutoComplete dataSource={emails} onChange={handleEmailChange} placeholder="Email" />
          </Form.Item>
          {form.isFieldTouched('email') &&
            !form.getFieldError('email').length &&
            form.getFieldValue('email') &&
            form.getFieldValue('email') !== props.auth!.user.email && (
              <Form.Item label="验证码">
                <Row gutter={8}>
                  <Col span={14}>
                    <Form.Item
                      name="email_code"
                      rules={[
                        { required: true, message: '请填写验证码!' },
                        { pattern: /^\d{4}$/, message: '验证码格式不正确!' },
                      ]}
                      noStyle
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder={`识别码：${identifyingCode}`}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Button
                      disabled={countdown > 0}
                      loading={emailCodeSending}
                      onClick={sendEmailCode}
                      style={{ minWidth: '100%', padding: 'auto 12px' }}
                    >
                      {countdown ? `${countdown} 秒` : '获取验证码'}
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
            )}
          <Form.Item label="个人简介" name="bio">
            <Input.TextArea placeholder="个人简介" rows={4} maxLength={20} />
          </Form.Item>
          <Form.Item
            label="国家/地区"
            name={['extends', 'country']}
            rules={[{ required: true, message: '请输入您的国家或地区!' }]}
          >
            <Select style={{ display: 'block' }}>
              <Select.Option value="China">中国</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="所在省市"
            name={['extends', 'geographic']}
            rules={[
              { required: true, message: '请输入您的所在省市!' },
              { validator: validatorGeographic },
            ]}
          >
            <GeographicView />
          </Form.Item>
          <Form.Item label="街道地址" name={['extends', 'address']}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            更新基本信息
          </Button>
        </div>
        <div className={styles.right}>
          <Form.Item name="avatar" noStyle>
            <AvatarView />
          </Form.Item>
        </div>
      </div>
    </Form>
  );
};

export default connect(({ auth }: ConnectState) => ({ auth }))(BaseView);
