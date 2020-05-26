import React from 'react';
import { Tooltip } from 'antd';
import { HeartOutlined, HeartTwoTone } from '@ant-design/icons';
import RelationBtn from './RelationBtn';

export interface FavoriteBtnProps {
  relation: string;
  item: any;
  hideText?: boolean;
  onAfterToggle?: () => void;
}

export interface FavoriteBtnState {
  favoritesCount: number;
}

class FavoriteBtn extends React.Component<FavoriteBtnProps, FavoriteBtnState> {
  constructor(props: FavoriteBtnProps) {
    super(props);

    const { item } = props;

    this.state = {
      favoritesCount: item.cache?.favorites_count || 0,
    };
  }

  componentWillReceiveProps(nextProps: Readonly<FavoriteBtnProps>) {
    this.setState({ favoritesCount: nextProps.item.cache?.favorites_count || 0 });
  }

  onAfterToggle = (status: boolean) => {
    let { favoritesCount } = this.state;
    status ? favoritesCount++ : favoritesCount--;
    this.setState({ favoritesCount });

    if (this.props.onAfterToggle) {
      this.props.onAfterToggle();
    }
  };

  getChildren = (slot: 'on' | 'off') => (
    <Tooltip title="收藏">
      <div className="btn favorite-btn">
        {slot === 'on' ? <HeartTwoTone twoToneColor="#eb2f96" /> : <HeartOutlined />}
        {!this.props.hideText && <span>{this.state.favoritesCount}</span>}
      </div>
    </Tooltip>
  );

  render() {
    const { relation, item } = this.props;

    return (
      <RelationBtn
        relation={relation}
        action="favorite"
        item={item}
        on={this.getChildren('on')}
        off={this.getChildren('off')}
        onAfterToggle={this.onAfterToggle}
      />
    );
  }
}

export default FavoriteBtn;
