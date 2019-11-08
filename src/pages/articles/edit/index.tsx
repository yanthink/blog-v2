import { Button, Card, Form, Icon, Input, Radio, Select, Upload, message } from 'antd';
import SimpleMDEEditor, { SimpleMDEEditorProps } from 'yt-simplemde-editor';
import emojiDependencies from 'yt-simplemde-editor/dist/emoji';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import marked from 'marked';
import React, { Component } from 'react';
import { get } from 'lodash';
import { connect } from 'dva';
import { Link, router } from 'umi';
import { FormComponentProps } from 'antd/es/form';
import { UploadChangeParam } from 'antd/lib/upload';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getToken } from '@/utils/authority';
import { ConnectState, ConnectProps } from '@/models/connect';
import { IArticle, ITag } from '@/models/data';
import * as services from './services';
import 'yt-simplemde-editor/dist/style.css';
import styles from './style.less';

const FormItem = Form.Item;
const { Option } = Select;

const uploadUrl = '/api/attachments/upload';

type GetBase64Callback = (base64: any) => void;

function getBase64 (img: File | Blob, cb: GetBase64Callback): void {
  const reader = new FileReader();
  reader.addEventListener('load', () => cb(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload (file: File): boolean {
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isLt2M;
}

interface ArticleEditProps extends ConnectProps, FormComponentProps {
  submitting: boolean;
  match: ConnectProps['match'] & {
    params: { [K in 'id']: string };
  };
}

interface ArticleEditState {
  article?: IArticle | any;
  allTags: ITag[];
  uploading: boolean;
  previewBase64: string;
}

@connect(({ loading }: ConnectState) => ({
  submitting: loading.effects['articleEdit/submitForm'],
}))
class ArticleEdit extends Component<ArticleEditProps, ArticleEditState> {
  state: ArticleEditState = {
    article: {},
    allTags: [],
    uploading: false,
    previewBase64: '',
  };

  async UNSAFE_componentWillMount () {
    const onePromise = services.queryArticle(this.props.match.params.id, { include: 'tags' });
    const tagsPromise = services.queryAllTags();
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
    form.validateFieldsAndScroll(async (err, values: IArticle) => {
      if (!err) {
        await dispatch({
          type: 'articleEdit/submitForm',
          id: params.id,
          payload: values,
        });

        message.success('修改成功！');
        router.push('/articles/list');
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
            setFieldsValue({ preview: file.response.data.url });
          },
        ),
      );
    }
  };

  renderMarkdown = (text: string) => {
    let html = marked(text);
    return emojiToolkit.toImage(html);
  };

  render () {
    const { submitting, form: { getFieldDecorator }, match: { params } } = this.props;
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
      // 配置文档 https://github.com/sparksuite/simplemde-markdown-editor#configuration
      options: {
        autoDownloadFontAwesome: false,
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
        jsonName: 'data.url',
        beforeUpload,
        headers: {
          Accept: `application/json`,
          Authorization: getToken(),
        },
        onError (err: any, response: { message?: string }) {
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
      // @ts-ignore
      <PageHeaderWrapper>
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="标题">
              {getFieldDecorator('title', {
                initialValue: article.title,
                rules: [{ required: true, message: '请输入标题' }],
              })(<Input placeholder="给文章起个名字" disabled={String(article.id) !== params.id} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="状态">
              {getFieldDecorator('state', {
                initialValue: article.state,
              })(
                <Radio.Group>
                  <Radio value={1}>显示</Radio>
                  <Radio value={0}>隐藏</Radio>
                </Radio.Group>,
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="标签">
              {getFieldDecorator('tags', {
                initialValue: (get(article, 'tags', []) as ITag[]).map(tag => tag.id),
                rules: [{ required: true, message: '请选择标签' }],
              })(
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  tokenSeparators={[',']}
                  placeholder="给文章选择标签"
                  disabled={String(article.id) !== params.id}
                >
                  {allTags.map(tag => (
                    <Option key={tag.id} value={tag.id}>
                      {tag.name}
                    </Option>
                  ))}
                </Select>,
              )}
              <Link to="/system/tags/list">添加标签</Link>
            </FormItem>
            <FormItem {...formItemLayout} label="预览图">
              {getFieldDecorator('preview', {
                initialValue: get(article, 'preview'),
              })(
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
                  disabled={String(article.id) !== params.id}
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
              {getFieldDecorator('content.markdown', {
                initialValue: get(article, 'content.markdown'),
                rules: [{ required: true, message: '请输入文章内容' }],
              })(<SimpleMDEEditor {...editorProps} />)}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={String(article.id) !== params.id}
              >
                提交
              </Button>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Form.create<ArticleEditProps>()(ArticleEdit);
