import { Card, Col, Form, Button, Input, Row, Table, Icon } from 'antd';
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Link, router } from 'umi';
import { parse, stringify } from 'qs';
import { FormComponentProps } from 'antd/es/form';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { StateType } from './model';
import styles from './style.less';

const FormItem = Form.Item;

const defaultQueryParams = {};

interface UserListProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  loading: boolean;
  userList: StateType;
  location: {
    pathname: string;
    query: { [key: string]: string };
    search: string;
  };
}

interface UserListState {
}

/* eslint react/no-multi-comp:0 */
@connect(
  ({
     userList,
     loading,
   }: {
    userList: StateType;
    loading: {
      models: {
        [key: string]: boolean;
      };
    };
  }) => ({
    userList,
    loading: loading.models.userList,
  }),
)
class UserList extends Component<UserListProps, UserListState> {
  state: UserListState = {};

  columns = [
    {
      title: '用户编号',
      dataIndex: 'id',
    },
    {
      title: '用户名称',
      dataIndex: 'name',
    },
    {
      title: '邮箱号码',
      dataIndex: 'email',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
    },
  ];

  componentWillMount() {
    this.queryList(this.props.location.search);
  }

  componentWillReceiveProps(nextProps: Readonly<UserListProps>): void {
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
      type: 'userList/fetch',
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
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
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
                <Button icon="user-add" type="primary">
                  新建
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      userList: { list, pagination },
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
              loading={loading}
              rowKey="id"
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Form.create<UserListProps>()(UserList);
