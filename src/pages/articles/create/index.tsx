import React, { useState } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { Link, history, useRequest } from 'umi';
import { Button, Card, Form, Input, message, Radio, Select, Upload } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/es/upload';
import SimpleMDEEditor, { SimpleMDEEditorProps } from 'yt-simplemde-editor';
import emojiDependencies from 'yt-simplemde-editor/dist/emoji';
import marked from 'marked';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import DOMPurify from 'dompurify';
import { ConnectProps } from '@/models/connect';
import { getToken } from '@/utils/authority';
import { ITag, ResponseResultType } from '@/models/I';
import { fetchAllTags } from '@/services';
import * as services from './services';
import styles from './style.less';

interface ArticleCreateProps extends ConnectProps {}

const formLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const tailLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 16, offset: 4 },
  },
};

function getBase64(img: File | Blob, cb: (base64: any) => void) {
  const reader = new FileReader();
  reader.addEventListener('load', () => cb(reader.result));
  reader.readAsDataURL(img);
}

function renderMarkdown(text: string) {
  const html = marked(text);
  return DOMPurify.sanitize(emojiToolkit.toImage(html));
}

const ArticleCreate: React.FC<ArticleCreateProps> = () => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState<Boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>();

  // 获取全部标签
  const { data: allTags } = useRequest<ResponseResultType<ITag[]>>(fetchAllTags, {
    cacheKey: 'allTags',
  });
  // 发布文章
  const { loading: submitting, run: storeArticle } = useRequest(services.storeArticle, {
    manual: true,
    onSuccess() {
      message.success('发布成功！');
      history.goBack();
    },
  });

  async function handleSubmit(values: object) {
    await storeArticle(values);
  }

  const handlePreviewChange = ({ file }: UploadChangeParam) => {
    if (file.status === 'uploading') {
      setUploading(true);
    } else if (file.status === 'done') {
      file.originFileObj &&
        getBase64(file.originFileObj, (base64) => {
          setPreviewUrl(base64);
          setUploading(false);
          form.setFieldsValue({ preview: file.response.data.url });
        });
    }
  };

  const editorProps: SimpleMDEEditorProps = {
    // 配置文档 https://github.com/sparksuite/simplemde-markdown-editor#configuration
    options: {
      autoDownloadFontAwesome: false,
      spellChecker: false,
      autosave: {
        enabled: true,
        delay: 3000,
        uniqueId: 'article_content',
      },
      previewRender: renderMarkdown,
      tabSize: 4,
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'code',
        'table',
        'horizontal-rule',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide',
        {
          name: 'submit',
          action: () => {
            form.validateFields().then(handleSubmit);
          },
          className: 'fa fa-paper-plane',
          title: '提交',
        },
        '|',
        'emoji',
      ],
    },
    uploadOptions: {
      action: UPLOAD_URL,
      jsonName: 'data.url',
      headers: {
        Accept: `application/json`,
        Authorization: getToken(),
      },
      onError(err: any, response: { message?: string }) {
        if (response.message) {
          message.error(response.message);
        }
      },
    },
    emoji: {
      enabled: true,
      autoComplete: false,
      insertConvertTo: 'unicode',
    },
    ...emojiDependencies,
  };

  return (
    <GridContent>
      <Card bordered={false}>
        <Form
          form={form}
          hideRequiredMark
          initialValues={{
            state: 1,
          }}
          onFinish={handleSubmit}
          style={{ marginTop: 8 }}
          {...formLayout}
        >
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="给文章起个名字" />
          </Form.Item>
          <Form.Item name="state" label="状态">
            <Radio.Group>
              <Radio value={1}>显示</Radio>
              <Radio value={0}>隐藏</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="标签">
            <Form.Item name="tags" rules={[{ required: true, message: '请选择标签' }]} noStyle>
              <Select
                mode="multiple"
                tokenSeparators={[',']}
                placeholder="给文章选择标签"
                style={{ width: '100%' }}
              >
                {allTags?.map((tag) => (
                  <Select.Option key={tag.id} value={tag.id!}>
                    {tag.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Link to="/system/tags/list">添加标签</Link>
          </Form.Item>
          <Form.Item name="preview" label="预览图">
            <Upload
              accept="image/*"
              name="file"
              listType="picture-card"
              className={styles.previewUploader}
              showUploadList={false}
              action={UPLOAD_URL}
              headers={{ Authorization: getToken() }}
              onChange={handlePreviewChange}
            >
              {previewUrl ? (
                <img style={{ maxWidth: '100%' }} src={previewUrl} alt="preview" />
              ) : (
                <div>
                  {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div className="ant-upload-text">Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            name={['content', 'markdown']}
            label="内容"
            rules={[{ required: true, message: '请输入文章内容' }]}
          >
            <SimpleMDEEditor {...editorProps} />
          </Form.Item>
          <Form.Item {...tailLayout} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </GridContent>
  );
};

export default ArticleCreate;
