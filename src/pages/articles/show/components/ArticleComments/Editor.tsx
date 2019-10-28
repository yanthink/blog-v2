import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import { router } from 'umi';
import { Avatar, Button, Icon, Mentions, message, Upload } from 'antd';
import { RcFile, UploadChangeParam } from 'antd/es/upload/interface';
import { stringify } from 'qs';
import { debounce } from 'lodash';
import EmojiPicker from 'yt-emoji-picker';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import MarkdownBody from '@/components/MarkdownBody';
import { ConnectProps, ConnectState, AuthStateType } from '@/models/connect';
import { getPageQuery, getPositions, insertText, isParentElement } from '@/utils/utils';
import { getToken } from '@/utils/authority';
import calculateNodeHeight from './calculateNodeHeight';
import * as services from '@/services';
import { IUser } from '@/models/data';
import styles from './Editor.less';

interface ArticleCommentEditorState {
  value: string;
  textareaStyles: object;
  resizing: boolean;
  search: string;
  mentionUsers: IUser[];
  loadingMentions: boolean;
}

interface ArticleCommentEditorProps extends ConnectProps {
  onSubmit: (values: { content: { markdown: string } }, callback?: () => void) => void;
  submitting: boolean;
  className?: string;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
  auth?: AuthStateType;
  preview?: boolean;
}

/* eslint max-len: 0 */
class ArticleCommentEditor extends React.Component<ArticleCommentEditorProps, ArticleCommentEditorState> {
  static emojiPickerPopup?: HTMLDivElement;

  static instance: ArticleCommentEditor;

  static stackCount: number = 0;

  state: ArticleCommentEditorState = {
    value: '',
    textareaStyles: {},
    resizing: false,
    search: '',
    mentionUsers: [],
    loadingMentions: false,
  };

  emojiPickerBtn: any;

  textarea: HTMLTextAreaElement | any;

  componentDidMount () {
    this.resizeTextarea();

    ArticleCommentEditor.stackCount++;

    if (!ArticleCommentEditor.emojiPickerPopup) {
      ArticleCommentEditor.emojiPickerPopup = document.createElement('div');
      ArticleCommentEditor.emojiPickerPopup.id = 'emoji-picker-popup';
      ArticleCommentEditor.emojiPickerPopup.className = styles.emojiPickerPopup;
      ArticleCommentEditor.emojiPickerPopup.style.display = 'none';
      ArticleCommentEditor.emojiPickerPopup.style.position = 'absolute';
      ArticleCommentEditor.emojiPickerPopup.style.zIndex = '99999';

      document.body.addEventListener(
        'click',
        this.hiddenEmojiPickerPopup,
        false,
      );

      document.body.appendChild(ArticleCommentEditor.emojiPickerPopup);

      const emojiPickerProps = {
        onSelect: this.handleEmojiSelect,
        search: true,
        recentCount: 36,
        rowHeight: 40,
      };

      ReactDOM.render(<EmojiPicker {...emojiPickerProps} />, ArticleCommentEditor.emojiPickerPopup);
    }


    this.textarea.addEventListener('keydown', this.handleKeydownEvent);
  }

  componentWillUnmount () {
    ArticleCommentEditor.stackCount--;

    if (ArticleCommentEditor.emojiPickerPopup && ArticleCommentEditor.stackCount === 0) {
      document.body.removeEventListener(
        'click',
        this.hiddenEmojiPickerPopup,
        false,
      );

      document.body.removeChild(ArticleCommentEditor.emojiPickerPopup);

      delete ArticleCommentEditor.emojiPickerPopup;
      delete ArticleCommentEditor.instance;
    }

    this.textarea.removeEventListener('keydown', this.handleKeydownEvent);
  }

  handleKeydownEvent = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const indent = '\t';
      const value = insertText(this.textarea, indent);
      this.setState({ value });
    }
  };

  handleSubmit = (e?: React.FormEvent) => {
    e && e.preventDefault();

    const { onSubmit, submitting } = this.props;
    const { value } = this.state;

    if (value && !submitting) {
      onSubmit({ content: { markdown: value } }, () => {
        this.setState({ value: '' });
      });
    }
  };

  handleEmojiSelect = (emoji: any) => {
    const text = emojiToolkit.shortnameToUnicode(emoji.shortname);
    const value = insertText(ArticleCommentEditor.instance.textarea, text);
    ArticleCommentEditor.instance.setState({ value });
  };

  handleChange = (value: string) => {
    this.setState({ value }, () => this.resizeTextarea());
  };

  handleBeforeUpload = (file: RcFile) => {
    message.loading('正在上传...');
  };

  handleUploadChange = ({ file }: UploadChangeParam) => {
    let newValue = '';
    switch (file.status) {
      case 'done':
        message.destroy();
        message.success('上传成功！');
        // @ts-ignore
        newValue = insertText(this.textarea, `![file](${file.response.data.url})`);
        this.setState({ value: newValue });
        break;
      case 'error':
        message.destroy();
        message.error(file.response.message);
        break;
    }
  };

  toggleEmojiPickerPopup = (emojiPickerBtn: any) => {
    if (ArticleCommentEditor.emojiPickerPopup) {
      ArticleCommentEditor.instance = this;

      if (ArticleCommentEditor.emojiPickerPopup.style.display === 'none') {
        ArticleCommentEditor.emojiPickerPopup.style.visibility = 'hidden';
        ArticleCommentEditor.emojiPickerPopup.style.display = 'block';

        const positions = getPositions(emojiPickerBtn);
        const top = positions.top + 30;
        let left = positions.left - ArticleCommentEditor.emojiPickerPopup.scrollWidth + 30;

        if (left + ArticleCommentEditor.emojiPickerPopup.scrollWidth > document.body.scrollWidth) {
          left = document.body.scrollWidth - ArticleCommentEditor.emojiPickerPopup.scrollWidth - 20;
        }
        ArticleCommentEditor.emojiPickerPopup.style.top = `${top}px`;
        ArticleCommentEditor.emojiPickerPopup.style.left = `${left}px`;
        ArticleCommentEditor.emojiPickerPopup.style.visibility = 'visible';
      } else {
        ArticleCommentEditor.emojiPickerPopup.style.display = 'none';
      }
    }
  };

  hiddenEmojiPickerPopup = (e: any) => {
    if (ArticleCommentEditor.emojiPickerPopup && ArticleCommentEditor.emojiPickerPopup.style.display !== 'none') {
      if (
        !isParentElement(e.target, [
          ArticleCommentEditor.emojiPickerPopup,
          ArticleCommentEditor.instance.emojiPickerBtn,
        ])
      ) {
        ArticleCommentEditor.emojiPickerPopup.style.display = 'none';
      }
    }
  };

  fetchUsers = debounce(async (search: string) => {
    this.setState({ search, loadingMentions: !!search, mentionUsers: [] });

    const { data } = await services.searchUsers(search);

    if (this.state.search !== search) {
      return;
    }

    this.setState({ mentionUsers: data, loadingMentions: false });
  }, 600);

  setTextarea = (ref: HTMLDivElement) => {
    if (!ref) {
      return;
    }
    this.textarea = ref.getElementsByTagName('textarea')[0];
  };

  setEmojiPickerBtnRef = (ref: any) => {
    this.emojiPickerBtn = ref;
  };

  resizeTextarea = () => {
    const { minRows = 6, maxRows = 100 } = this.props;
    const textareaStyles = calculateNodeHeight(this.textarea, false, minRows, maxRows);
    this.setState({ textareaStyles, resizing: true }, () => {
      this.setState({ resizing: false });
    });
  };

  jumpToLogin = () => {
    const { redirect } = getPageQuery();
    // redirect
    if (window.location.pathname !== '/auth/login' && !redirect) {
      router.push({
        pathname: '/auth/login',
        search: stringify({
          redirect: window.location.href,
        }),
      });
    }
  };

  render () {
    const {
      submitting,
      className,
      placeholder = '',
      auth: { user = {}, logged = false } = {},
      maxRows = 100,
      maxLength = 2048,
      preview,
    } = this.props;

    const { value, textareaStyles, mentionUsers, loadingMentions } = this.state;

    return (
      <div>
        <div className={`${styles.editor} ${className}`}>
          <div className={styles.textarea} style={textareaStyles} ref={this.setTextarea}>
            <Mentions
              placeholder={placeholder}
              loading={loadingMentions}
              rows={maxRows}
              maxLength={maxLength}
              onChange={this.handleChange}
              onSearch={this.fetchUsers}
              value={value}
            >
              {mentionUsers.map(({ avatar, username }) => (
                <Mentions.Option key={username} value={username} className="antd-demo-dynamic-option">
                  <img src={avatar} alt={username} className={styles.mentionsAvatar} />
                  <span>{username}</span>
                </Mentions.Option>
              ))}
            </Mentions>
          </div>
          <div className={styles.toolbar}>
            <div className={styles.info}>
              {
                logged ?
                  (
                    <div>
                      <Avatar
                        className={styles.avatar}
                        src={user.avatar}
                        alt={user.username}
                        icon="user"
                      />
                      {user.username}
                    </div>
                  ) :
                  (
                    <div>您需要 <a onClick={this.jumpToLogin}>登录</a> 才能发表评论</div>
                  )
              }
            </div>
            <div className={styles.actions}>
              <div className={styles.action}>
                <Upload
                  accept="image/*"
                  name="file"
                  className={styles.upload}
                  showUploadList={false}
                  action={UPLOAD_URL}
                  headers={{ Authorization: getToken() }}
                  beforeUpload={this.handleBeforeUpload}
                  onChange={this.handleUploadChange}
                >
                  <Icon type="picture" />
                </Upload>
              </div>
              <div
                ref={this.setEmojiPickerBtnRef}
                className={styles.action}
                onClick={() => this.toggleEmojiPickerPopup(this.emojiPickerBtn)}
              >
                <span className={styles.emojiPickerBtn}><Icon type="smile" theme="outlined" /></span>
              </div>
              <div className={styles.action}>
                <Button
                  className={styles.submitBtn}
                  htmlType="submit"
                  loading={submitting}
                  onClick={this.handleSubmit}
                  disabled={!logged}
                  type="primary"
                  icon="message"
                >
                  评论
                </Button>
              </div>
            </div>
          </div>
        </div>
        {
          preview && value &&
          <div className={styles.preview}>
            <MarkdownBody markdown={value} />
          </div>
        }
      </div>
    );
  }
}

export default connect(({ auth }: ConnectState) => ({
  auth,
}))(ArticleCommentEditor);
