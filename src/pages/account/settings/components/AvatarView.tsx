import React, { Fragment } from 'react';
import { Upload, message, Button } from 'antd';
import { UploadChangeParam } from 'antd/es/upload';
import { getToken } from '@/utils/authority';
import styles from './AvatarView.less';

interface AvatarViewState {
  value: string;
}

interface AvatarViewProps {
  value?: string;
  onChange?: (value: string) => void;
}

// 头像组件 方便以后独立，增加裁剪之类的功能
class AvatarView extends React.Component<AvatarViewProps, AvatarViewState> {
  static getDerivedStateFromProps(nextProps: AvatarViewProps) {
    return {
      value: nextProps.value,
    };
  }

  state: AvatarViewState = {
    value: '',
  };

  render() {
    const uploadProps = {
      name: 'file',
      action: '/api/attachments/upload',
      accept: 'image/*',
      showUploadList: false,
      headers: {
        authorization: getToken(),
      },
      onChange: (info: UploadChangeParam) => {
        if (info.file.status === 'done') {
          this.setState({ value: info.file.response.data.fileUrl });
          message.success(`${info.file.name} file uploaded successfully`);
          const { onChange } = this.props;
          if (onChange) {
            onChange(info.file.response.data.url);
          }
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    };

    const { value } = this.state;

    return (
      <Fragment>
        <div className={styles.avatar_title}>
          头像
        </div>
        <div className={styles.avatar}>
          <img src={value} alt="avatar" />
        </div>
        <Upload {...uploadProps}>
          <div className={styles.button_view}>
            <Button icon="upload">
              更换头像
            </Button>
          </div>
        </Upload>
      </Fragment>
    )
  }
}

export default AvatarView;
