import {
  EditOutlined,
  HeartOutlined,
  LockOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Rate,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';

const Center: React.FC = () => {
  const [form] = Form.useForm();
  const [onlineHours, setOnlineHours] = useState(0);

  // 直接从 localStorage 获取用户信息
  const userInfoStr = localStorage.getItem('userInfo');
  console.log('localStorage userInfo:', userInfoStr);
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {};
  console.log('parsed userInfo:', userInfo);

  // 计算在线时长
  useEffect(() => {
    if (userInfo.last_login) {
      const lastLoginTime = new Date(userInfo.last_login).getTime();
      const updateOnlineHours = () => {
        const now = new Date().getTime();
        const hours = Math.floor((now - lastLoginTime) / (1000 * 60 * 60));
        setOnlineHours(hours);
      };

      // 立即更新一次
      updateOnlineHours();

      // 每分钟更新一次
      const timer = setInterval(updateOnlineHours, 1000 * 60);

      // 清理定时器
      return () => clearInterval(timer);
    }
  }, [userInfo.last_login]);

  const handleFeedback = (values: any) => {
    console.log('反馈内容:', values);
    message.success('感谢您的反馈！');
    form.resetFields();
  };

  return (
    <PageContainer>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* 个人信息概览 */}
        <Card
          style={{
            marginBottom: 24,
            background: 'linear-gradient(135deg, #c6c9ec 0%, #36cfc9 100%)',
            color: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <Row gutter={24} align="middle">
            <Col span={8} style={{ textAlign: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  padding: '4px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #1890ff, #52c41a)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                <Avatar
                  size={120}
                  src="https://img.rongyuejiaoyu.com/uploads/20240728/02511242750.jpeg"
                  style={{
                    border: '4px solid white',
                    backgroundColor: '#f0f2f5',
                  }}
                />
              </div>
            </Col>
            <Col span={16}>
              <Typography.Title level={2} style={{ color: 'white', marginBottom: 8 }}>
                {userInfo.name || '未设置姓名'}
              </Typography.Title>
              <Space wrap>
                <Tag color="white" style={{ color: '#1890ff' }}>
                  <UserOutlined /> 普通用户
                </Tag>
                <Tag color="white" style={{ color: '#1890ff' }}>
                  <SafetyCertificateOutlined /> 已认证
                </Tag>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={24}>
          {/* 左侧信息卡片 */}
          <Col span={16}>
            {/* 基本信息 */}
            <Card
              title={
                <Space>
                  <UserOutlined />
                  基本信息
                </Space>
              }
              style={{ marginBottom: 24 }}
              extra={
                <Button type="link" icon={<EditOutlined />}>
                  编辑资料
                </Button>
              }
            >
              <Row gutter={[24, 24]}>
                <Col span={12}>
                  <Card
                    hoverable
                    style={{
                      background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                      border: 'none',
                    }}
                  >
                    <Statistic
                      title={<span style={{ color: '#52c41a' }}>用户名</span>}
                      value={userInfo.name || '未设置'}
                      prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    hoverable
                    style={{
                      background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                      border: 'none',
                    }}
                  >
                    <Statistic
                      title={<span style={{ color: '#1890ff' }}>账号</span>}
                      value={userInfo.user_account || '未设置'}
                      prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                    />
                  </Card>
                </Col>
                <Col span={24}>
                  <Card
                    hoverable
                    style={{
                      background: 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)',
                      border: 'none',
                    }}
                  >
                    <Statistic
                      title={<span style={{ color: '#faad14' }}>手机号</span>}
                      value={userInfo.phone || '未设置'}
                      prefix={<PhoneOutlined style={{ color: '#faad14' }} />}
                    />
                  </Card>
                </Col>
                <Col span={24}>
                  <Card
                    hoverable
                    style={{
                      background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                      border: 'none',
                    }}
                  >
                    <Statistic
                      title="在线时长"
                      value={onlineHours}
                      suffix="小时"
                      prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                      formatter={(value) => <span>{value}</span>}
                    />
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* 账号安全 */}
            <Card
              title={
                <Space>
                  <LockOutlined />
                  账号安全
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <Row gutter={[24, 24]}>
                <Col span={12}>
                  <Card
                    hoverable
                    style={{
                      background: 'linear-gradient(135deg, #fff1f0 0%, #ffa39e 100%)',
                      border: 'none',
                    }}
                  >
                    <Statistic
                      title={<span style={{ color: '#f5222d' }}>登录密码</span>}
                      value="已设置"
                      prefix={<LockOutlined style={{ color: '#f5222d' }} />}
                      suffix={
                        <Button type="link" size="small">
                          修改
                        </Button>
                      }
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    hoverable
                    style={{
                      background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)',
                      border: 'none',
                    }}
                  >
                    <Statistic
                      title={<span style={{ color: '#722ed1' }}>手机绑定</span>}
                      value={userInfo.phone ? '已绑定' : '未绑定'}
                      prefix={<PhoneOutlined style={{ color: '#722ed1' }} />}
                      suffix={
                        <Button type="link" size="small">
                          修改
                        </Button>
                      }
                    />
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 右侧信息卡片 */}
          <Col span={8}>
            {/* 用户反馈 */}
            <Card
              title={
                <Space>
                  <StarOutlined />
                  用户反馈
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFeedback}
                initialValues={{
                  rating: 5,
                  feedback: '',
                }}
              >
                <Form.Item
                  label="系统评分"
                  name="rating"
                  rules={[{ required: true, message: '请选择评分' }]}
                >
                  <Rate style={{ fontSize: 24 }} />
                </Form.Item>
                <Form.Item
                  label="反馈内容"
                  name="feedback"
                  rules={[{ required: true, message: '请输入反馈内容' }]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="请输入您的反馈意见..."
                    style={{ resize: 'none' }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" block icon={<HeartOutlined />} htmlType="submit">
                    提交反馈
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* 用户统计 */}
            <Card
              title={
                <Space>
                  <TeamOutlined />
                  用户统计
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic
                  title="注册时间"
                  value={userInfo.create_time || '未知'}
                  prefix={<UserOutlined />}
                />
                <Statistic
                  title="最后登录"
                  value={userInfo.last_login || '未知'}
                  prefix={<UserOutlined />}
                />
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default Center;
