import React from 'react';
import { message, Form } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import cookie from 'cookie';
import SimpleMDEEditor, { SimpleMDEEditorProps } from 'yt-simplemde-editor';
import emojiDependencies from 'yt-simplemde-editor/dist/emoji';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import marked from 'marked';
import Prism from 'prismjs';
import { getToken } from '@/utils/authority';
import 'yt-simplemde-editor/dist/style.css';
import 'emoji-assets/sprites/joypixels-sprite-32.min.css';
import styles from './index.less';

const uploadUrl = '/api/attachments/upload';

export interface YtSimplemdeEditorProps extends FormComponentProps {
}

function beforeUpload(file: File): boolean {
  const isLt200K = file.size / 1024 < 200;
  if (!isLt200K) {
    message.error('Image must smaller than 200Kb!');
  }
  return isLt200K;
}

class Index extends React.Component<YtSimplemdeEditorProps> {
  handleSubmit = (e?: React.FormEvent) => {
    e && e.preventDefault();
    const { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        /* eslint no-console:0 */
        console.info(values);
      }
    });
  };

  renderMarkdown = (text: string) => {
    let html = marked(text);
    if (/language-/.test(html)) {
      const container = document.createElement('div');
      container.innerHTML = html;
      Prism.highlightAllUnder(container);
      html = container.innerHTML;
    }
    return emojiToolkit.toImage(html);
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;

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
        previewRender: this.renderMarkdown,
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
              this.handleSubmit();
            },
            className: 'fa fa-paper-plane',
            title: '提交',
          },
          '|',
          'emoji',
        ],
      },
      uploadOptions: {
        action: uploadUrl,
        jsonName: 'data.fileUrl',
        beforeUpload,
        headers: {
          Accept: `application/x.sheng.${API_VERSION}+json`, // eslint-disable-line
          Authorization: getToken(),
          'X-XSRF-TOKEN': cookie.parse(document.cookie)['XSRF-TOKEN'],
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
      <Form onSubmit={this.handleSubmit} hideRequiredMark>
        <div className={styles.editorBox}>
          {getFieldDecorator('content', {
            rules: [{ required: true, message: '请输入文章内容' }],
          })(<SimpleMDEEditor {...editorProps} />)}
        </div>
      </Form>
    );
  }
}

export default Form.create<YtSimplemdeEditorProps>()(Index);
