import React from 'react';
import { LikeOutlined, LikeTwoTone } from '@ant-design/icons';
import RelationBtn from './RelationBtn';

export interface UpvoteBtnProps {
  relation: string;
  item: any;
  hideText?: boolean;
  onAfterToggle?: () => void;
}

export interface UpvoteBtnState {
  upVotersCount: number;
}

class UpvoteBtn extends React.Component<UpvoteBtnProps, UpvoteBtnState> {
  constructor(props: UpvoteBtnProps) {
    super(props);

    const { item } = props;

    this.state = {
      upVotersCount: item.cache?.up_voters_count || 0,
    };
  }

  componentWillReceiveProps(nextProps: Readonly<UpvoteBtnProps>) {
    this.setState({ upVotersCount: nextProps.item.cache?.up_voters_count || 0 });
  }

  onAfterToggle = (status: boolean) => {
    let { upVotersCount } = this.state;
    status ? upVotersCount++ : upVotersCount--;
    this.setState({ upVotersCount });

    if (this.props.onAfterToggle) {
      this.props.onAfterToggle();
    }
  };

  getChildren = (slot: 'on' | 'off') => (
    <div className="upvote upvote-btn">
      {slot === 'on' ? <LikeTwoTone twoToneColor="#13C2C2" /> : <LikeOutlined />}
      {!this.props.hideText && <span>{this.state.upVotersCount}</span>}
    </div>
  );

  render() {
    const { relation, item } = this.props;

    return (
      <RelationBtn
        relation={relation}
        action="upvote"
        item={item}
        on={this.getChildren('on')}
        off={this.getChildren('off')}
        onAfterToggle={this.onAfterToggle}
      />
    );
  }
}

export default UpvoteBtn;
