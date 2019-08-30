import Link from 'umi/link';
import { Result, Button } from 'antd';
import React from 'react';

export default () => (
  <Result
    status="403"
    title="403"
    style={{
      background: 'none',
    }}
    subTitle="抱歉，你无权访问该页面。"
    extra={
      <Link to="/">
        <Button type="primary">
          返回首页
        </Button>
      </Link>
    }
  />
);
