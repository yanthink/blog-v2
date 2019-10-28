import React from 'react';
import { Icon, Tooltip } from 'antd';
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
  constructor (props: FavoriteBtnProps) {
    super(props);

    const { item } = props;

    this.state = {
      favoritesCount: item.cache.favorites_count,
    };
  }

  componentWillReceiveProps (nextProps: Readonly<FavoriteBtnProps>, nextContext: any): void {
    this.setState({ favoritesCount: nextProps.item.cache.favorites_count });
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
        <Icon
          type="heart"
          theme={slot === 'on' ? 'twoTone' : 'outlined'}
          twoToneColor="#eb2f96"
        />
        {!this.props.hideText && <span>{this.state.favoritesCount}</span>}
      </div>
    </Tooltip>
  );

  render () {
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
