import React from 'react';
import Editor from '@/pages/articles/show/components/ArticleComments/Editor';
import styles from './index.less';

const YTEmojiPicker: React.FC<{}> = () => {
  const editorProps = {
    className: styles.commentEditorBox,
    submitting: false,
    onSubmit: () => {
    },
    preview: true,
  };

  return (
    <div className={styles.emojiPickerBox}>
      <Editor {...editorProps} />
    </div>
  );
};

export default YTEmojiPicker;
