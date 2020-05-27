import React from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { useRequest } from 'umi';
import { Button, Card, Form, Input, message } from 'antd';
import { ResponseResultType } from '@/models/I';
import * as services from './services';

interface SensitiveWordsProps {}

const { TextArea } = Input;

const SensitiveWords: React.FC<SensitiveWordsProps> = () => {
  const [form] = Form.useForm();
  const { loading } = useRequest<ResponseResultType<{ content: string }>>(
    services.fetchSensitiveWords,
    {
      onSuccess({ content }) {
        form.setFieldsValue({ content });
      },
    },
  );

  const { loading: submitting, run: updateSensitiveWords } = useRequest(
    services.updateSensitiveWords,
    {
      manual: true,
      onSuccess() {
        message.success('修改成功！');
      },
    },
  );

  async function handleSubmit(values: object) {
    await updateSensitiveWords(values);
  }

  return (
    <GridContent>
      <Card bordered={false}>
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item name="content" rules={[{ required: true, message: '请输入内容' }]}>
            <TextArea rows={20} disabled={loading} />
          </Form.Item>
          <Form.Item style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit" loading={submitting} disabled={loading}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </GridContent>
  );
};

export default SensitiveWords;
