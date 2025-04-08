import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { message } from 'antd';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useCallback } from 'react';
import HeaderDropdown from '../HeaderDropdown';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const userInfo = localStorage.getItem('userInfo');
  const name = userInfo ? JSON.parse(userInfo).name : '';
  return <span className="anticon">{name}</span>;
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ children }) => {
  const onMenuClick = useCallback((event: MenuInfo) => {
    const { key } = event;
    if (key === 'logout') {
      // 清除登录信息
      localStorage.removeItem('isLogin');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('conclusionData');
      message.success('退出登录成功');
      history.push('/user/login');
      return;
    }
    if (key === 'center') {
      history.push('/center/sub-page');
    }
  }, []);

  const menuItems = [
    {
      key: 'center',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      {children}
    </HeaderDropdown>
  );
};
