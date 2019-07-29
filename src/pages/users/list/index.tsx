import { Card, Col, Form, Button, Input, Row, Table } from 'antd';
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { PaginationConfig } from 'antd/es/table';
import { connect } from 'dva';
import { StateType } from './model';
import { QueryParamsType } from './data.d';
import styles from './style.less';

const FormItem = Form.Item;

const defaultQueryParams = {};

interface UserListProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  loading: boolean;
  userList: StateType;
}

interface UserListState {}

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
    this.queryList();
  }

  queryList = (pagination?: PaginationConfig) => {
    const {
      dispatch,
      form: { getFieldsValue },
    } = this.props;
    const values = getFieldsValue();

    const queryParams: QueryParamsType = {
      ...defaultQueryParams,
      ...pagination,
      ...values,
    };

    dispatch({
      type: 'userList/fetch',
      payload: queryParams,
    });
  };

  handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    this.queryList();
  };

  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.queryList();
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
    } = this.props;

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.searchForm}>{this.renderSearchForm()}</div>
            <Table
              dataSource={list}
              pagination={pagination}
              columns={this.columns}
              loading={loading}
              onChange={this.queryList}
              rowKey="id"
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Form.create<UserListProps>()(UserList);
