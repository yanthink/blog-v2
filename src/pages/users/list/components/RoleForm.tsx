import { Form, Modal, Checkbox, Tooltip } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import React from 'react';
import { IRole, IUser } from '@/models/data';

const CheckboxGroup = Checkbox.Group;

interface RoleFormProps extends FormComponentProps {
  modalVisible: boolean;
  handleAssignRoles: (user_id: number, values: { roles: number }) => Promise<void>;
  handleModalVisible: () => void;
  loading: boolean;
  currentUser: IUser,
  currentRoles: IRole[];
  allRoles: IRole[];
}

const RoleForm: React.FC<RoleFormProps> = props => {
  const {
    modalVisible,
    form,
    handleAssignRoles,
    handleModalVisible,
    loading,
    currentUser,
    currentRoles,
    allRoles,
  } = props;
  const { getFieldDecorator } = form;

  const okHandle = () => {
    form.validateFields(async (err, values) => {
      if (err) return;
      await handleAssignRoles(currentUser.id as number, values);
      form.resetFields();
    });
  };

  return (
    <Modal
      destroyOnClose
      title={`给「${currentUser.username}」分配角色`}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
      confirmLoading={loading}
      width={800}
    >
      <div style={{ padding: '0 40px' }}>
        {getFieldDecorator('roles', {
          initialValue: currentRoles.map(item => item.id),
        })(
          <CheckboxGroup style={{ display: 'block' }}>
            {allRoles.map((role: IRole) => (
              <Tooltip title={role.name} key={role.id}>
                <Checkbox value={role.id}>{role.display_name}</Checkbox>
              </Tooltip>
            ))}
          </CheckboxGroup>,
        )}
      </div>
    </Modal>
  );
};

export default Form.create<RoleFormProps>()(RoleForm);
