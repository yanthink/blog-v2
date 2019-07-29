import { Button, Card, Form, Icon, Input, Radio, Select, Upload, message } from 'antd';
import SimpleMDEEditor, { SimpleMDEEditorProps } from 'yt-simplemde-editor';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import marked from 'marked';
import Prism from 'prismjs';
import cookie from 'cookie';
import React, { Component } from 'react';
import { get } from 'lodash';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import router from 'umi/router';
import { FormComponentProps } from 'antd/es/form';
import { UploadChangeParam } from 'antd/lib/upload';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getToken } from '@/utils/authority';
import { ArticleType, TagType } from '../list/data';
import { queryArticle } from '../show/service';
import { queryAllTags } from '../list/service';
import 'yt-simplemde-editor/dist/style.css';
import styles from './style.less';

const FormItem = Form.Item;
const { Option } = Select;

const uploadUrl = '/api/attachments/upload';

emojiToolkit.sprites = true;
emojiToolkit.spriteSize = 32;

type GetBase64Callback = (base64: any) => void;

function getBase64(img: File | Blob, cb: GetBase64Callback): void {
  const reader = new FileReader();
  reader.addEventListener('load', () => cb(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file: File): boolean {
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isLt2M;
}

interface ArticleEditProps extends FormComponentProps {
  submitting: boolean;
  dispatch: Dispatch<any>;
  match: {
    params: { [K in 'id']: string };
  };
}

interface ArticleEditState {
  article?: ArticleType | any;
  allTags: TagType[];
  uploading: boolean;
  previewBase64: string;
}

class ArticleEdit extends Component<ArticleEditProps, ArticleEditState> {
  state: ArticleEditState = {
    article: {},
    allTags: [],
    uploading: false,
    previewBase64: '',
  };

  async componentWillMount() {
    const onePromise = queryArticle(this.props.match.params.id, { include: 'tags' });
    const tagsPromise = queryAllTags();
    const { data: article } = await onePromise;
    const { data: allTags } = await tagsPromise;
    this.setState({ article, allTags, previewBase64: article.preview });
  }

  handleSubmit = (e?: React.FormEvent) => {
    e && e.preventDefault();
    const {
      dispatch,
      form,
      match: { params },
    } = this.props;
    form.validateFieldsAndScroll((err, values: ArticleType) => {
      if (!err) {
        dispatch({
          type: 'articlesEdit/submitForm',
          id: params.id,
          payload: values,
          callback() {
            router.push('/articles/list');
          },
        });
      }
    });
  };

  handlePreviewChange = ({ file }: UploadChangeParam) => {
    if (file.status === 'uploading') {
      return this.setState({ uploading: true });
    }
    if (file.status === 'done') {
      const { setFieldsValue } = this.props.form;

      file.originFileObj &&
        getBase64(file.originFileObj, previewBase64 =>
          this.setState(
            {
              previewBase64,
              uploading: false,
            },
            () => {
              setFieldsValue({ preview: file.response.data.fileUrl });
            },
          ),
        );
    }
  };

  renderMarkdown = (text: string) => {
    let html = marked(text, { breaks: true });
    if (/language-/.test(html)) {
      const container = document.createElement('div');
      container.innerHTML = html;
      Prism.highlightAllUnder(container);
      html = container.innerHTML;
    }
    return emojiToolkit.toImage(html);
  };

  render() {
    const { submitting } = this.props;
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { article, allTags, uploading, previewBase64 } = this.state;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 4 },
      },
    };

    const editorProps: SimpleMDEEditorProps = {
      options: {
        // see https://github.com/sparksuite/simplemde-markdown-editor#configuration
        spellChecker: false,
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
        autoComplete: false,
        insertConvertTo: 'unicode',
      },
    };

    return (
      // @ts-ignore
      <PageHeaderWrapper>
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="标题">
              {getFieldDecorator('title', {
                initialValue: get(article, 'title'),
                rules: [{ required: true, message: '请输入标题' }],
              })(<Input placeholder="给文章起个名字" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="状态">
              {getFieldDecorator('status', {
                initialValue: get(article, 'status'),
              })(
                <Radio.Group>
                  <Radio value={1}>显示</Radio>
                  <Radio value={0}>隐藏</Radio>
                </Radio.Group>,
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="标签">
              {getFieldDecorator('tags', {
                initialValue: (get(article, 'tags', []) as TagType[]).map(tag => tag.id),
                rules: [{ required: true, message: '请选择标签' }],
              })(
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  tokenSeparators={[',']}
                  placeholder="给文章选择标签"
                >
                  {allTags.map(tag => (
                    <Option key={tag.id} value={tag.id}>
                      {tag.name}
                    </Option>
                  ))}
                </Select>,
              )}
              <a>添加标签</a>
            </FormItem>
            <FormItem {...formItemLayout} label="预览图">
              {getFieldDecorator('preview')(
                <Upload
                  accept="image/*"
                  name="file"
                  listType="picture-card"
                  className={styles.previewUploader}
                  showUploadList={false}
                  action={uploadUrl}
                  headers={{ Authorization: getToken() }}
                  beforeUpload={beforeUpload}
                  onChange={this.handlePreviewChange}
                >
                  {previewBase64 ? (
                    <img style={{ maxWidth: '100%' }} src={previewBase64} alt="preview" />
                  ) : (
                    <div>
                      <Icon type={uploading ? 'loading' : 'plus'} />
                      <div className="ant-upload-text">Upload</div>
                    </div>
                  )}
                </Upload>,
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="内容">
              {getFieldDecorator('content', {
                initialValue: get(article, 'content'),
                rules: [{ required: true, message: '请输入文章内容' }],
              })(<SimpleMDEEditor {...editorProps} />)}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" htmlType="submit" loading={submitting} disabled={!article}>
                提交
              </Button>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Form.create<ArticleEditProps>()(
  connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({
    submitting: loading.effects['articlesEdit/submitForm'],
  }))(ArticleEdit),
);
