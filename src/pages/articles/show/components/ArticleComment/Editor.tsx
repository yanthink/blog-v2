import React from 'react';
import ReactDOM from 'react-dom';
import { Avatar, Button, Comment, Form, Icon, Input } from 'antd';
import { get } from 'lodash';
import EmojiPicker from 'yt-emoji-picker';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import { UserType } from '@/models/user';
import { getPositions, insertText, isParentElement } from './utils';
import styles from './Editor.less';

const FormItem = Form.Item;
const { TextArea } = Input;

interface ArticleCommentEditorState {
  value: string;
}

interface ArticleCommentEditorProps {
  className?: string;
  placeholder?: string;
  currentUser?: UserType;
  submitting: boolean;
  onSubmit: (values: { content: string }, callback?: () => void) => void;
  rows: number;
  maxLength: number;
}

/* eslint max-len: 0 */
class ArticleCommentEditor extends React.Component<ArticleCommentEditorProps, ArticleCommentEditorState> {
  static emojiPickerPopup?: HTMLDivElement;

  static instance: ArticleCommentEditor;

  static stackCount: number = 0;

  state: ArticleCommentEditorState = {
    value: '',
  };

  emojiPickerBtn: any;

  textarea: any;

  componentDidMount() {
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
        emojiToolkit: {
          sprites: true,
          spriteSize: 32,
        },
        onSelect: this.handleEmojiSelect,
        search: true,
        recentCount: 36,
        rowHeight: 40,
      };

      ReactDOM.render(<EmojiPicker {...emojiPickerProps} />, ArticleCommentEditor.emojiPickerPopup);
    }
  }

  componentWillUnmount() {
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
  }

  handleSubmit = (e?: React.FormEvent) => {
    e && e.preventDefault();

    const { onSubmit, submitting } = this.props;
    const { value } = this.state;

    if (value && !submitting) {
      onSubmit({ content: value }, () => {
        this.setState({ value: '' });
      });
    }
  };

  handleEmojiSelect = (emoji: any) => {
    const text = emojiToolkit.shortnameToUnicode(emoji.shortname);
    const value = insertText(ArticleCommentEditor.instance.textarea.textAreaRef, text);
    ArticleCommentEditor.instance.setState({ value });
  };

  handleChange = (e: any) => {
    this.setState({
      value: e.target.value,
    });
  };

  toggleEmojiPickerPopup = (emojiPickerBtn: any) => {
    if (ArticleCommentEditor.emojiPickerPopup) {
      ArticleCommentEditor.instance = this;

      emojiToolkit.sprites = true;
      emojiToolkit.spriteSize = 32;

      if (ArticleCommentEditor.emojiPickerPopup.style.display === 'none') {
        ArticleCommentEditor.emojiPickerPopup.style.visibility = 'hidden';
        ArticleCommentEditor.emojiPickerPopup.style.display = 'block';

        const positions = getPositions(emojiPickerBtn);
        const top = positions.top + 30;
        let left = positions.left - 1;
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
        ]) // todo
      ) {
        ArticleCommentEditor.emojiPickerPopup.style.display = 'none';
      }
    }
  };

  setTextareaRef = (ref: any) => {
    this.textarea = ref;
  };

  setEmojiPickerBtnRef = (ref: any) => {
    this.emojiPickerBtn = ref;
  };

  render() {
    const {
      className,
      placeholder = '',
      currentUser,
      submitting,
      rows = 5,
      maxLength = 1024,
    } = this.props;

    const { value } = this.state;

    return (
      <Comment
        className={`${styles.comment} ${className}`}
        avatar={
          <Avatar
            className={styles.avatar}
            src={get(currentUser, 'user_info.avatarUrl')}
            alt={get(currentUser, 'name')}
            icon="user"
          />
        }
        content={
          <div className={styles.content}>
            <FormItem>
              <TextArea
                placeholder={placeholder}
                ref={this.setTextareaRef}
                autosize={{
                  minRows: rows,
                }}
                maxLength={maxLength}
                onChange={this.handleChange}
                value={value}
              />
            </FormItem>
            <FormItem>
              <div className={styles.actions}>
                <div>
                  <a
                    ref={this.setEmojiPickerBtnRef}
                    className={styles.emojiPickerBtn}
                    onClick={() => this.toggleEmojiPickerPopup(this.emojiPickerBtn)}
                  >
                    <Icon type="smile" theme="outlined" />
                  </a>
                </div>
                <div>
                  <Button
                    className={styles.submitBtn}
                    htmlType="submit"
                    disabled={submitting}
                    onClick={this.handleSubmit}
                    type="primary"
                    icon="message"
                  >
                    评论
                  </Button>
                </div>
              </div>
            </FormItem>
          </div>
        }
      />
    );
  }
}

export default ArticleCommentEditor;
