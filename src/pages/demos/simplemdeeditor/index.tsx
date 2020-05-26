import React from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { Card, Form, message } from 'antd';
import SimpleMDEEditor, { SimpleMDEEditorProps } from 'yt-simplemde-editor';
import emojiDependencies from 'yt-simplemde-editor/dist/emoji';
import marked from 'marked';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import { getToken } from '@/utils/authority';
import styles from './style.less';

interface SimplemdeEditorProps {}

function beforeUpload(file: File): boolean {
  const isLt200K = file.size / 1024 < 200;
  if (!isLt200K) {
    message.error('Image must smaller than 200Kb!');
  }
  return isLt200K;
}

const SimplemdeEditor: React.FC<SimplemdeEditorProps> = () => {
  const [form] = Form.useForm();

  function handleSubmit(values: object) {
    // eslint-disable-next-line no-console
    console.info(values);
  }

  function renderMarkdown(text: string) {
    const html = marked(text);
    return emojiToolkit.toImage(html);
  }

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
      beforeUpload,
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
      autoComplete: true,
      insertConvertTo: 'unicode',
    },
    ...emojiDependencies,
  };

  return (
    <GridContent>
      <Card bordered={false} className={styles.editorCard}>
        <Form form={form} onFinish={handleSubmit} hideRequiredMark>
          <Form.Item name="content" rules={[{ required: true, message: '请输入内容' }]}>
            <SimpleMDEEditor {...editorProps} />
          </Form.Item>
        </Form>
      </Card>
    </GridContent>
  );
};

export default SimplemdeEditor;
