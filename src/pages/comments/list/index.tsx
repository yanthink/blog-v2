import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useRequest } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { ActionType, ProColumns } from '@ant-design/pro-table/es/Table';
import { Form, Avatar, Input, Popover, message } from 'antd';
import { get, set } from 'lodash';
import { UserOutlined } from '@ant-design/icons';
import { ConnectProps } from '@/models/connect';
import { IComment } from '@/models/I';
import * as services from './services';
import styles from './style.less';

interface CommentListProps extends ConnectProps {}

interface EditableRowProps {
  index: number;
}

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: IComment;
  handleSave: (record: IComment) => void;
}

const EditableContext = React.createContext<any>(Form.useForm);

const { TextArea } = Input;

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell: React.FC<EditableCellProps> = (props) => {
  const { title, editable, children, dataIndex, record, handleSave, ...restProps } = props;

  const [editing, setEditing] = useState(false);
  // @ts-ignore
  const textAreaRef = useRef<TextArea | null>(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      textAreaRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue(set({}, dataIndex, get(record, dataIndex)));
  };

  const save = async () => {
    const values = await form.validateFields();
    toggleEdit();
    if (get(values, dataIndex) !== get(record, dataIndex)) {
      await handleSave({ ...record, ...values });
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item style={{ margin: 0 }} name={dataIndex}>
        <TextArea ref={textAreaRef} autoSize={{ minRows: 1 }} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const CommnetList: React.FC<CommentListProps> = () => {
  const action = useRef<ActionType>();
  const [id, setId] = useState<string>();
  const [username, setUsername] = useState<string>();

  function request({ current, pageSize, ...params }: any) {
    return services.queryComments({
      ...params,
      page: current,
      per_page: pageSize,
      include: 'user,commentable',
    });
  }

  const { run: updateComment } = useRequest(services.updateComment, {
    manual: true,
    onSuccess() {
      action.current?.reload();
      message.success('修改成功！');
    },
  });

  async function handleSave(row: IComment) {
    await updateComment(row.id!, { content: { markdown: row.content?.combine_markdown } });
  }

  const columns: ProColumns<IComment>[] = [
    {
      title: '头像',
      dataIndex: ['user', 'avatar'],
      render(avatar: any) {
        return <Avatar src={avatar} icon={<UserOutlined />} />;
      },
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: ['user', 'username'],
      render(text) {
        return <div className={styles.username}>{text}</div>;
      },
      width: 100,
    },
    {
      title: '文章',
      dataIndex: ['commentable', 'title'],
      render(title, comment) {
        return (
          <div className={styles.articleTitle}>
            <Link
              to={`/articles/${comment.commentable_id}#comment-${comment.id}`}
              title={title as string}
            >
              {title}
            </Link>
          </div>
        );
      },
      width: 220,
    },
    {
      title: '评论内容',
      dataIndex: ['content', 'combine_markdown'],
      render(content) {
        return (
          <Popover
            content={
              <div style={{ maxWidth: 300, wordWrap: 'break-word', wordBreak: 'normal' }}>
                {content}
              </div>
            }
            placement="topRight"
            trigger="hover"
          >
            <div className={styles.content}>{content}</div>
          </Popover>
        );
      },
      onCell: (record) => ({
        record,
        editable: true,
        dataIndex: ['content', 'combine_markdown'],
        title: '检测点',
        handleSave,
      }),
      width: 300,
    },
    {
      title: '评论数',
      dataIndex: ['cache', 'comments_count'],
    },
    {
      title: '点赞数',
      dataIndex: ['cache', 'up_voters_count'],
    },
    {
      title: '被踩数',
      dataIndex: ['cache', 'down_voters_count'],
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
    },
  ];

  return (
    <GridContent>
      <ProTable<IComment, { id?: string; username?: string }>
        actionRef={action}
        components={{
          body: { row: EditableRow, cell: EditableCell },
        }}
        className={styles.table}
        headerTitle="评论列表"
        rowKey="id"
        params={{ id, username }}
        request={request}
        columns={columns}
        toolBarRender={() => [
          <Input.Search placeholder="评论ID" onSearch={(value) => setId(value)} />,
          <Input.Search placeholder="用户名" onSearch={(value) => setUsername(value)} />,
        ]}
        search={false}
      />
    </GridContent>
  );
};

export default CommnetList;
