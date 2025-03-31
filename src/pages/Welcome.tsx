import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Card, Flex, message, Modal, Spin, Tag, theme } from 'antd';
import Search from 'antd/es/input/Search';
import React, { useEffect, useState } from 'react';
import ssImg from '../../public/images/start.png';

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const InfoCard: React.FC<{
  title: string;
  index: number;
  desc: string;
  href: string;
}> = ({ title, href, index, desc }) => {
  const { useToken } = theme;

  const colors = [
    'magenta',
    'red',
    'volcano',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'blue',
    'geekblue',
    'purple',
  ];
  const { token } = useToken();

  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        border: '2px solid rgb(181, 213, 237)',
        boxShadow: token.boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '16px 19px',
        minWidth: '220px',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            lineHeight: '22px',
            backgroundSize: '100%',
            textAlign: 'center',
            padding: '8px 16px 16px 12px',
            color: '#FFF',
            fontWeight: 'bold',
            backgroundImage:
              "url('https://gw.alipayobjects.com/zos/bmw-prod/daaf8d50-8e6d-4251-905d-676a24ddfa12.svg')",
          }}
        >
          {index}
        </div>
        <div
          style={{
            fontSize: '16px',
            color: token.colorText,
            paddingBottom: 8,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: token.colorTextSecondary,
          textAlign: 'justify',
          lineHeight: '22px',
          marginBottom: 10,
        }}
      >
        <Flex gap="4px 4px" wrap>
          {desc
            .split(',')
            .slice(0, 25)
            .map((item, index) => (
              <Tag key={index} color={colors[Math.floor(Math.random() * colors.length)]}>
                {item}
              </Tag>
            ))}
        </Flex>
      </div>
      <a onClick={() => history.push(href)} style={{ cursor: 'pointer' }}>
        查看详情报告内容... {'>'}
      </a>
    </div>
  );
};

interface CommentData {
  search_key: string;
  total_word: string[];
  created_time: string;
}

const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const [commentData, setCommentData] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [loadingText, setLoadingText] = useState('正在爬取数据...');

  // 获取用户信息
  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {};

  // 页面加载时获取用户评论数据
  useEffect(() => {
    const fetchUserComments = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/user/comments/${userInfo.user_id}/`,
        );
        const result = await response.json();

        if (response.ok && result.code === 200) {
          // 只取前6条数据
          setCommentData(result.data.slice(0, 6));
        } else {
          message.error(result.msg || '获取评论数据失败！');
        }
      } catch (error) {
        message.error('获取评论数据失败！');
      }
    };

    if (userInfo.user_id) {
      fetchUserComments();
    }
  }, [userInfo.user_id]);

  // 处理搜索
  const handleSearch = async (value: string) => {
    try {
      setLoading(true);
      setLoadingModalVisible(true);
      setLoadingText('正在爬取数据...');

      // 先调用爬取接口
      const scrapeResponse = await fetch('http://localhost:8000/api/scraper/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: value,
          user_id: userInfo.user_id,
        }),
      });

      const scrapeData = await scrapeResponse.json();
      if (scrapeResponse.ok) {
        message.success('爬取成功！');
        setLoadingText('正在生成AI分析报告...');
        // 跳转到可视化页面
        try {
          const response = await fetch('http://localhost:8000/api/conclusion/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              search_key: value,
            }),
          });

          const result = await response.json();

          if (response.ok && result.code === 200) {
            // 将数据存储在 localStorage 中
            localStorage.setItem('conclusionData', JSON.stringify(result.data));
            setLoadingText('报告生成完成，正在跳转...');
            // 跳转到可视化页面
            history.push('/admin/sub-page');
          } else {
            message.error(result.msg || '获取数据失败！');
            setLoadingModalVisible(false);
          }
        } catch (error) {
          message.error('获取数据失败！');
          setLoadingModalVisible(false);
        }
      } else {
        message.error(scrapeData.message || '爬取失败，请重试！');
        setLoadingModalVisible(false);
      }
    } catch (error) {
      message.error('操作失败，请重试！');
      setLoadingModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      style={{
        background:
          'radial-gradient(circle at center,rgb(238, 243, 247) 0%,rgb(196, 223, 246) 40%,rgb(180, 159, 209) 100%)',
      }}
    >
      <Card
        style={{
          borderRadius: 8,
          border: '3px solid rgb(181, 213, 237)',
        }}
        // bodyStyle={{
        //   backgroundImage:
        //     initialState?.settings?.navTheme === 'realDark'
        //       ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
        //       : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
        // }}
      >
        <div
          style={{
            width: '100%',
            // height: 'auto',
            backgroundPosition: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '200px 200px',
            backgroundImage: `url(${ssImg})`,
            // borderRadius: '8px',
            // "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: token.colorTextHeading,
            }}
          >
            搜索商品
          </div>
          {/* <p
            style={{
              fontSize: '14px',
              color: token.colorTextSecondary,
              lineHeight: '22px',
              marginTop: 16,
              marginBottom: 32,
              width: '65%',
            }}
          >
            Ant Design Pro 是一个整合了 umi，Ant Design 和 ProComponents
            的脚手架方案。致力于在设计规范和基础组件的基础上，继续向上构建，提炼出典型模板/业务组件/配套设计资源，进一步提升企业级中后台产品设计研发过程中的『用户』和『设计者』的体验。
          </p> */}
          <div style={{ display: 'flex' }}>
            <Search
              style={{ width: '60%', marginTop: 20, marginBottom: 20 }}
              placeholder="请输入商品名称"
              enterButton="查询"
              size="large"
              loading={loading}
              onSearch={handleSearch}
            />
          </div>
          {/* <Image src={ssImg} style={{ width: 150, height: 150 }} /> */}
          <div style={{ marginTop: 20, marginBottom: 20 }}>最近搜索历史记录</div>
          <div
            style={{
              width: '70%',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            {commentData.length > 0 ? (
              commentData.map((item, index) => (
                <InfoCard
                  key={index}
                  index={index + 1}
                  href="/center/sub-search-page"
                  title={item.search_key}
                  desc={item.total_word.join(',')}
                />
              ))
            ) : (
              <div style={{ width: '100%', textAlign: 'center', color: token.colorTextSecondary }}>
                暂无搜索记录
              </div>
            )}
          </div>
        </div>
      </Card>

      <Modal
        title="处理中"
        open={loadingModalVisible}
        footer={null}
        closable={false}
        centered
        width={300}
        style={{ textAlign: 'center' }}
      >
        <div style={{ padding: '20px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', fontSize: '16px', color: '#1890ff' }}>{loadingText}</div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default Welcome;
