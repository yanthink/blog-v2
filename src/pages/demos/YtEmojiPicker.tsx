import React from 'react';
import EmojiPicker from 'yt-emoji-picker';
import 'yt-emoji-picker/dist/style.css';
import styles from './YtEmojiPicker.less';

const YtEmojiPicker: React.FC<{}> = () => {
  const emojiPickerProps = {
    emojiToolkit: {
      sprites: true,
      spriteSize: 32,
    },
    onSelect(emoji: any) {
      /* eslint no-console: 0 */
      console.info(emoji);
    },
    search: true,
    recentCount: 36,
    rowHeight: 40,
  };

  return (
    <div className={styles.emojiPickerBox}>
      <EmojiPicker {...emojiPickerProps} />
    </div>
  );
};

export default YtEmojiPicker;
