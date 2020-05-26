import React, { useState } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { Card, Form } from 'antd';
import Editor from '@/pages/articles/show/components/ArticleComments/Editor';
import styles from './style.less';

interface EmojiPickerProps {}

const formLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const EmojiPicker: React.FC<EmojiPickerProps> = () => {
  const [submitting, setSubmitting] = useState(false);

  const editorProps = {
    className: styles.commentEditorBox,
    submitting,
    onSubmit: async (values: any) => {
      setSubmitting(true);
      // eslint-disable-next-line no-console
      console.info(values);
      setTimeout(() => setSubmitting(false), 3000);
    },
    minRows: 8,
    preview: true,
  };

  return (
    <GridContent>
      <Card className={styles.emojiPickerCard} bordered={false} title="Emoji Picker Demo">
        <Form layout="horizontal" {...formLayout}>
          <Form.Item label="评论内容" name="content">
            <Editor {...editorProps} />
          </Form.Item>
        </Form>
      </Card>
    </GridContent>
  );
};

export default EmojiPicker;
