import { history } from '@umijs/max';
import React, { useEffect } from 'react';

// 不需要登录就能访问的路径
const publicPaths = ['/user/login', '/user/register'];

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const pathname = window.location.pathname;
    const isLogin = localStorage.getItem('isLogin');
    const userInfo = localStorage.getItem('userInfo');

    // 如果是公开路径，直接返回
    if (publicPaths.includes(pathname)) {
      return;
    }

    // 未登录则跳转到登录页
    if (!isLogin || !userInfo) {
      history.push('/user/login');
    }
  }, []);

  return <>{children}</>;
};

export default AuthRoute;
