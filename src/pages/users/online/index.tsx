import React, { Component } from 'react';
import { Card, Col, Form, Button, Input, Row, Table, Icon, Avatar } from 'antd';
import { Link, router } from 'umi';
import { parse, stringify } from 'qs';
import { FormComponentProps } from 'antd/es/form';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { ConnectState, ConnectProps, UserOnlineModelState, Loading } from '@/models/connect'
import styles from './style.less';

const FormItem = Form.Item;

const defaultQueryParams = { include: 'user' };

interface UserOnlineProps extends ConnectProps, FormComponentProps {
  loading: Loading;
  userOnline: UserOnlineModelState;
}

interface UserOnlineState {
}

@connect(({ userOnline, loading }: ConnectState) => ({
  userOnline,
  loading,
}))
class UserOnline extends Component<UserOnlineProps, UserOnlineState> {
  columns = [
    {
      title: '头像',
      dataIndex: 'user.user_info.avatarUrl',
      render(avatarUrl: string) {
        return <Avatar src={avatarUrl} icon="user" />
      },
    },
    {
      title: '用户编号',
      dataIndex: 'user_id',
    },
    {
      title: '用户名称',
      dataIndex: 'user.name',
    },
    {
      title: '连接个数',
      dataIndex: 'stack_level',
    },
    {
      title: '登录IP',
      dataIndex: 'ip',
    },
    {
      title: '登录时间',
      dataIndex: 'updated_at',
    },
  ];

  componentWillMount() {
    this.queryList(this.props.location.search);
  }

  componentWillReceiveProps(nextProps: Readonly<UserOnlineProps>): void {
    if (nextProps.location.search !== this.props.location.search) {
      this.queryList(nextProps.location.search);
    }
  }

  queryList = (params: object | string) => {
    const query = params instanceof Object ? params : parse(params.replace(/^\?/, ''));

    const queryParams = {
      ...defaultQueryParams,
      ...query,
    };

    this.props.dispatch({
      type: 'userOnline/fetch',
      payload: queryParams,
    });
  };

  handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const { location: { pathname }, form: { getFieldsValue } } = this.props;

    router.push({
      pathname,
      search: stringify({
        ...getFieldsValue(),
      }),
    });
  };

  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.queryList({});
  };

  renderSearchForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 12, lg: 24 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={16} sm={24}>
            <div className={styles.action}>
              <div className={styles.submitButtons}>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  重置
                </Button>
              </div>
              <div className={styles.operator}>
                <Link to="/users/list">
                  <Button type="primary">
                    用户列表
                  </Button>
                </Link>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      userOnline: { list, pagination },
      loading,
      location: { pathname, search },
    } = this.props;

    const query = parse(search.replace(/^\?/, ''));

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.searchForm}>{this.renderSearchForm()}</div>
            <Table
              dataSource={list}
              pagination={{
                ...pagination,
                simple: window.innerWidth < 768,
                itemRender(page, type, originalElement) {
                  let children: any = page;

                  if (type === 'prev') {
                    children = <Icon type="left" />;
                  } else if (type === 'next') {
                    children = <Icon type="right" />;
                  } else if (type === 'jump-prev') {
                    children = (
                      <div className="ant-pagination-item-container">
                        <Icon className="ant-pagination-item-link-icon" type="double-left" />
                        <span className="ant-pagination-item-ellipsis">•••</span>
                      </div>
                    );
                  } else if (type === 'jump-next') {
                    children = (
                      <div className="ant-pagination-item-container">
                        <Icon className="ant-pagination-item-link-icon" type="double-right" />
                        <span className="ant-pagination-item-ellipsis">•••</span>
                      </div>
                    );
                  }

                  return (
                    // @ts-ignore
                    <Link
                      {...originalElement.props}
                      to={`${pathname}?${stringify({ ...query, page })}`}
                    >
                      {children}
                    </Link>
                  );
                },
              }}
              columns={this.columns}
              loading={loading.effects['userOnline/fetch']}
              rowKey="id"
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Form.create<UserOnlineProps>()(UserOnline);
