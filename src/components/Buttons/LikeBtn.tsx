import React from 'react';
import { Tooltip } from 'antd';
import { LikeOutlined, LikeTwoTone } from '@ant-design/icons';
import RelationBtn from './RelationBtn';

export interface LikeBtnProps {
  relation: string;
  item: any;
  hideText?: boolean;
  onAfterToggle?: () => void;
}

export interface LikeBtnState {
  likesCount: number;
}

class LikeBtn extends React.Component<LikeBtnProps, LikeBtnState> {
  constructor(props: LikeBtnProps) {
    super(props);

    const { item } = props;

    this.state = {
      likesCount: item.cache?.likes_count || 0,
    };
  }

  componentWillReceiveProps(nextProps: Readonly<LikeBtnProps>) {
    this.setState({ likesCount: nextProps.item.cache.likes_count || 0 });
  }

  onAfterToggle = (status: boolean) => {
    let { likesCount } = this.state;
    status ? likesCount++ : likesCount--;
    this.setState({ likesCount });

    if (this.props.onAfterToggle) {
      this.props.onAfterToggle();
    }
  };

  getChildren = (slot: 'on' | 'off') => (
    <Tooltip title="点赞">
      <div className="btn like-btn">
        {slot === 'on' ? <LikeTwoTone twoToneColor="#13C2C2" /> : <LikeOutlined />}
        {!this.props.hideText && <span>{this.state.likesCount}</span>}
      </div>
    </Tooltip>
  );

  render() {
    const { relation, item } = this.props;

    return (
      <RelationBtn
        relation={relation}
        action="like"
        item={item}
        on={this.getChildren('on')}
        off={this.getChildren('off')}
        onAfterToggle={this.onAfterToggle}
      />
    );
  }
}

export default LikeBtn;
