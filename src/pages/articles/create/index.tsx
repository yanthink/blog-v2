import { Button, Card, Form, Icon, Input, Radio, Select, Upload, message } from 'antd';
import SimpleMDEEditor, { SimpleMDEEditorProps } from 'yt-simplemde-editor';
import emojiDependencies from 'yt-simplemde-editor/dist/emoji';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import marked from 'marked';
import React, { Component } from 'react';
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

interface ArticleCreateProps extends ConnectProps, FormComponentProps {
  submitting: boolean;
}

interface ArticleCreateState {
  allTags: ITag[];
  uploading: boolean;
  previewBase64: string;
}

@connect(({ loading }: ConnectState) => ({
  submitting: loading.effects['articleCreate/submitForm'],
}))
class ArticleCreate extends Component<ArticleCreateProps, ArticleCreateState> {
  state: ArticleCreateState = {
    allTags: [],
    uploading: false,
    previewBase64: '',
  };

  async UNSAFE_componentWillMount () {
    const { data: allTags } = await services.queryAllTags();
    this.setState({ allTags });
  }

  handleSubmit = (e?: React.FormEvent) => {
    e && e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll(async (err, values: IArticle) => {
      if (!err) {
        await dispatch({
          type: 'articleCreate/submitForm',
          payload: values,
        });

        message.success('发布成功！');
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
    const { submitting, form: { getFieldDecorator } } = this.props;
    const { allTags, uploading, previewBase64 } = this.state;

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
      <PageHeaderWrapper>
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="标题">
              {getFieldDecorator('title', {
                rules: [{ required: true, message: '请输入标题' }],
              })(<Input placeholder="给文章起个名字" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="状态">
              {getFieldDecorator('state', {
                initialValue: 1,
              })(
                <Radio.Group>
                  <Radio value={1}>显示</Radio>
                  <Radio value={0}>隐藏</Radio>
                </Radio.Group>,
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="标签">
              {getFieldDecorator('tags', {
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
              <Link to="/system/tags/list">添加标签</Link>
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
              {getFieldDecorator('content.markdown', {
                rules: [{ required: true, message: '请输入文章内容' }],
              })(<SimpleMDEEditor {...editorProps} />)}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                提交
              </Button>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Form.create<ArticleCreateProps>()(ArticleCreate);
