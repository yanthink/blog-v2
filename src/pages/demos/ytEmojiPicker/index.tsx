import React from 'react';
import 'yt-emoji-picker/dist/style.css';
import 'emoji-assets/sprites/joypixels-sprite-32.min.css';
import Editor from '@/pages/articles/show/components/ArticleComment/Editor';
import styles from './index.less';

const YTEmojiPicker: React.FC<{}> = () => {
  const editorProps = {
    className: styles.commentEditorBox,
    submitting: false,
    onSubmit: () => {},
    minRows: 5,
    maxLength: 1024,
    preview: true,
  };

  return (
    <div className={styles.emojiPickerBox}>
      <Editor {...editorProps} />
    </div>
  );
};

export default YTEmojiPicker;
