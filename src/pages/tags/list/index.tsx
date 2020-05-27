import React, { useRef, useState } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { useRequest } from 'umi';
import { Button, Input, message } from 'antd';
import ProTable from '@ant-design/pro-table';
import { ActionType, ProColumns } from '@ant-design/pro-table/es/Table';
import { ConnectProps } from '@/models/connect';
import { ITag } from '@/models/I';
import CreateModal from './components/CreateModal';
import UpdateModal from './components/UpdateModal';
import * as services from './services';

interface TagListProps extends ConnectProps {}

const TagList: React.FC<TagListProps> = () => {
  const action = useRef<ActionType>();
  const [name, setName] = useState();

  const [createModalVisible, handleCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<ITag>({});

  function request({ current, pageSize, ...params }: any) {
    return services.queryTags({ ...params, page: current, per_page: pageSize });
  }

  // 创建标签
  const { loading: createModalSubmitting, run: storeTag } = useRequest(services.storeTag, {
    manual: true,
    onSuccess() {
      action.current?.reload();
      message.success('标签创建成功！');
    },
  });
  // 更新权限
  const { loading: updateModalSubmitting, run: updateTag } = useRequest(services.updateTag, {
    manual: true,
    onSuccess() {
      action.current?.reload();
      message.success('标签更新成功！');
    },
  });

  const columns: ProColumns<ITag>[] = [
    {
      title: '标签编号',
      dataIndex: 'id',
    },
    {
      title: '标签名称',
      dataIndex: 'name',
    },
    {
      title: 'slug',
      dataIndex: 'slug',
    },
    {
      title: '排序',
      dataIndex: 'order',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      dataIndex: 'id',
      render: (_, tag) => [
        <a
          onClick={() => {
            setSelectedTag(tag);
            handleUpdateModalVisible(true);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];

  return (
    <GridContent>
      <ProTable<ITag, { name: string }>
        actionRef={action}
        headerTitle="标签列表"
        rowKey="id"
        params={{ name }}
        request={request}
        columns={columns}
        toolBarRender={() => [
          <Input.Search placeholder="标签名称" onSearch={(value) => setName(value)} />,
          <Button type="primary" onClick={() => handleCreateModalVisible(true)}>
            新建
          </Button>,
        ]}
        search={false}
      />
      <CreateModal
        title="创建标签"
        visible={createModalVisible}
        onCancel={() => handleCreateModalVisible(false)}
        onSubmit={async (values) => {
          await storeTag(values);
          handleCreateModalVisible(false);
        }}
        submitting={createModalSubmitting}
      />
      {updateModalVisible && (
        <UpdateModal
          title="更新标签"
          visible={updateModalVisible}
          onCancel={() => handleUpdateModalVisible(false)}
          onSubmit={async (values) => {
            await updateTag(selectedTag.id as number, values);
            setSelectedTag({});
            handleUpdateModalVisible(false);
          }}
          submitting={updateModalSubmitting}
          initialValues={selectedTag}
        />
      )}
    </GridContent>
  );
};

export default TagList;
