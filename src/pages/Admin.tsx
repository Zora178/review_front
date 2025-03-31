import { Column, Line, Pie } from '@ant-design/charts';
import { WordCloud } from '@ant-design/plots';
import { PageContainer } from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import { Alert, Card, Collapse, Flex, Progress, Statistic, Typography, message } from 'antd';
import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 定义数据类型
interface VisualData {
  word_cloud: Record<string, number>;
  time_trend: {
    year_count: Record<string, number>;
    month_count: Record<string, number>;
    day_count: Record<string, number>;
  };
  model_distribution: {
    model_count: Record<string, number>;
  };
  length_distribution: Record<string, number>;
}

interface ConclusionData {
  value: string;
  visual_data: VisualData;
}

const Admin: React.FC = () => {
  const location = useLocation();
  const [markdownContent, setMarkdownContent] = useState('');
  const [visualData, setVisualData] = useState<VisualData>({
    word_cloud: {},
    time_trend: {
      year_count: {},
      month_count: {},
      day_count: {},
    },
    model_distribution: {
      model_count: {},
    },
    length_distribution: {},
  });
  const [loading, setLoading] = useState(true);

  // 从URL获取搜索关键词
  const searchKey = new URLSearchParams(location.search).get('searchKey') || '';

  // 获取报告和可视化数据
  useEffect(() => {
    const conclusionDataStr = localStorage.getItem('conclusionData');
    if (conclusionDataStr) {
      try {
        const conclusionData: ConclusionData = JSON.parse(conclusionDataStr);
        // 处理 markdown 内容
        let content = conclusionData.value;

        // 删除第一个评论真实性的部分
        content = content.replace(
          /#### \*\*一、评论真实性识别\*\*[\s\S]*?#### \*\*二、商品多维度分析\*\*/g,
          '#### **一、商品多维度分析**',
        );

        // 重新编号所有章节
        content = content
          .replace(/#### \*\*二、/g, '#### **一、')
          .replace(/#### \*\*三、/g, '#### **二、')
          .replace(/#### \*\*四、/g, '#### **三、')
          .replace(/#### \*\*五、/g, '#### **四、');

        setMarkdownContent(content);
        setVisualData(conclusionData.visual_data);
      } catch (error) {
        message.error('数据解析失败！');
      }
    }
    setLoading(false);
  }, []);

  // 处理表格单元格换行的函数
  // 格式化词云数据
  const wordCloudData = Object.entries(visualData.word_cloud).map(([word, count]) => ({
    text: word,
    value: count,
    name: word,
  }));

  // 格式化年度趋势数据
  const yearTrendData = Object.entries(visualData.time_trend.year_count).map(([date, count]) => ({
    date,
    count,
  }));

  // 格式化月度趋势数据
  const monthTrendData = Object.entries(visualData.time_trend.month_count).map(([date, count]) => ({
    date,
    count,
  }));

  // 格式化日度趋势数据
  const dayTrendData = Object.entries(visualData.time_trend.day_count).map(([date, count]) => ({
    date,
    count,
  }));

  // 格式化产品型号分布数据
  const modelData = Object.entries(visualData.model_distribution.model_count).map(
    ([type, count]) => ({
      type,
      count,
    }),
  );

  // 格式化评论长度分布数据
  const lengthData = Object.entries(visualData.length_distribution).map(([length, count]) => ({
    length: `${length}字`,
    count,
  }));

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Progress type="circle" percent={100} status="active" />
            <div style={{ marginTop: '20px' }}>正在加载数据...</div>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card
        style={{
          background: 'linear-gradient(135deg, rgba(230, 247, 255, 0.8), rgba(255, 255, 255, 0.9))',
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        }}
      >
        <Alert
          message={`搜索关键词：${searchKey}`}
          type="success"
          showIcon
          banner
          style={{
            margin: -12,
            marginBottom: 48,
          }}
        />
        <Collapse
          items={[
            {
              key: '1',
              label: '评论分析报告',
              children: (
                <div
                  style={{
                    padding: '20px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h3: ({ ...props }) => (
                        <h3
                          style={{
                            color: '#1a1a1a',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginBottom: '24px',
                            borderBottom: '2px solid #f0f0f0',
                            paddingBottom: '12px',
                          }}
                          {...props}
                        />
                      ),
                      h4: ({ ...props }) => (
                        <h4
                          style={{
                            color: '#262626',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            marginTop: '24px',
                            marginBottom: '16px',
                          }}
                          {...props}
                        />
                      ),
                      p: ({ ...props }) => (
                        <p
                          style={{
                            color: '#595959',
                            fontSize: '16px',
                            lineHeight: '1.8',
                            marginBottom: '16px',
                          }}
                          {...props}
                        />
                      ),
                      ul: ({ ...props }) => (
                        <ul
                          style={{
                            paddingLeft: '24px',
                            marginBottom: '16px',
                          }}
                          {...props}
                        />
                      ),
                      li: ({ ...props }) => (
                        <li
                          style={{
                            color: '#595959',
                            fontSize: '16px',
                            lineHeight: '1.8',
                            marginBottom: '8px',
                          }}
                          {...props}
                        />
                      ),
                      table: ({ ...props }) => (
                        <table
                          style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginBottom: '16px',
                            tableLayout: 'fixed',
                          }}
                          {...props}
                        />
                      ),
                      th: ({ ...props }) => (
                        <th
                          style={{
                            backgroundColor: '#fafafa',
                            padding: '12px',
                            border: '1px solid #f0f0f0',
                            fontWeight: 'bold',
                            textAlign: 'left',
                            width: props.children === '维度' ? '100px' : 'auto',
                          }}
                          {...props}
                        />
                      ),
                      td: ({ ...props }) => (
                        <td
                          style={{
                            padding: '12px',
                            border: '1px solid #f0f0f0',
                            color: '#595959',
                          }}
                          {...props}
                        >
                          {(() => {
                            const content =
                              typeof props.children === 'string'
                                ? props.children
                                : String(props.children || '');
                            return content.split(/<br\s*\/?>/).map((item, index) => (
                              <div key={index} style={{ marginBottom: '8px' }}>
                                {item.trim()}
                              </div>
                            ));
                          })()}
                        </td>
                      ),
                      strong: ({ ...props }) => (
                        <strong
                          style={{
                            color: '#262626',
                            fontWeight: 'bold',
                          }}
                          {...props}
                        />
                      ),
                      blockquote: ({ ...props }) => (
                        <blockquote
                          style={{
                            borderLeft: '4px solid #1890ff',
                            margin: '16px 0',
                            padding: '12px 16px',
                            backgroundColor: '#f6f6f6',
                            color: '#595959',
                          }}
                          {...props}
                        />
                      ),
                    }}
                  >
                    {markdownContent}
                  </Markdown>
                </div>
              ),
            },
          ]}
        />
        {/* 数据概览 */}
        <div style={{ padding: '20px' }}>
          <Typography.Title level={4}>数据概览</Typography.Title>
          <Flex wrap="wrap" gap="middle">
            <Card
              hoverable
              style={{
                width: 300,
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              styles={{
                body: {
                  background:
                    'linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0.05))',
                  padding: '20px',
                  borderRadius: '12px',
                },
              }}
            >
              <Statistic
                title={
                  <span style={{ color: '#1890ff', fontSize: '16px', fontWeight: 'bold' }}>
                    总评论数
                  </span>
                }
                value={Object.values(visualData.time_trend.year_count).reduce((a, b) => a + b, 0)}
                valueStyle={{
                  color: '#1a1a1a',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
            </Card>
            <Card
              hoverable
              style={{
                width: 300,
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              styles={{
                body: {
                  background:
                    'linear-gradient(135deg, rgba(82, 196, 26, 0.1), rgba(82, 196, 26, 0.05))',
                  padding: '20px',
                  borderRadius: '12px',
                },
              }}
            >
              <Statistic
                title={
                  <span style={{ color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }}>
                    评论年份分布
                  </span>
                }
                value={Object.entries(visualData.time_trend.year_count)
                  .map(([year, count]) => `${year}年: ${count}条`)
                  .join(', ')}
                valueStyle={{
                  color: '#1a1a1a',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
            </Card>
            <Card
              hoverable
              style={{
                width: 300,
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              styles={{
                body: {
                  background:
                    'linear-gradient(135deg, rgba(250, 173, 20, 0.1), rgba(250, 173, 20, 0.05))',
                  padding: '20px',
                  borderRadius: '12px',
                },
              }}
            >
              <Statistic
                title={
                  <span style={{ color: '#faad14', fontSize: '16px', fontWeight: 'bold' }}>
                    热门关键词
                  </span>
                }
                value={Object.entries(visualData.word_cloud)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([word, count]) => `${word}(${count})`)
                  .join(', ')}
                valueStyle={{
                  color: '#1a1a1a',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
            </Card>
            <Card
              hoverable
              style={{
                width: 300,
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              styles={{
                body: {
                  background:
                    'linear-gradient(135deg, rgba(245, 34, 45, 0.1), rgba(245, 34, 45, 0.05))',
                  padding: '20px',
                  borderRadius: '12px',
                },
              }}
            >
              <Statistic
                title={
                  <span style={{ color: '#f5222d', fontSize: '16px', fontWeight: 'bold' }}>
                    评论长度分布
                  </span>
                }
                value={`最短${Math.min(
                  ...Object.keys(visualData.length_distribution).map(Number),
                )}字, 最长${Math.max(
                  ...Object.keys(visualData.length_distribution).map(Number),
                )}字`}
                valueStyle={{
                  color: '#1a1a1a',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
            </Card>
          </Flex>
        </div>
        {/* 可视化图表 */}
        <div style={{ padding: '20px' }}>
          <Typography.Title level={4}>数据可视化</Typography.Title>
          <Flex vertical gap="middle">
            {/* 词云图 */}
            <Card
              style={{
                width: '100%',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(255, 165, 0, 0.1)',
              }}
            >
              <Typography.Title level={5}>关键词云</Typography.Title>
              <WordCloud
                data={wordCloudData}
                wordField="text"
                weightField="value"
                colorField="text"
                wordStyle={{
                  fontFamily: 'Verdana',
                  fontSize: [16, 80],
                  rotation: [-90, 90],
                  padding: 2,
                }}
                layout={{ spiral: 'rectangular' }}
                height={300}
                width={800}
                padding={20}
                appendPadding={[10, 10]}
                tooltip={{
                  formatter: (datum: { text: string; value: number }) => {
                    return {
                      name: datum.text,
                      value: datum.value,
                    };
                  },
                }}
              />
            </Card>

            {/* 年度趋势图 */}
            <Card
              style={{
                width: '100%',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(255, 165, 0, 0.1)',
              }}
            >
              <Typography.Title level={5}>评论时间趋势（年度）</Typography.Title>
              <Line
                data={yearTrendData}
                xField="date"
                yField="count"
                point={{
                  size: 4,
                  shape: 'diamond',
                }}
                label={{
                  style: {
                    fill: '#aaa',
                  },
                }}
                height={300}
              />
            </Card>

            {/* 月度趋势图 */}
            <Card
              style={{
                width: '100%',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(255, 165, 0, 0.1)',
              }}
            >
              <Typography.Title level={5}>评论时间趋势（月度）</Typography.Title>
              <Line
                data={monthTrendData}
                xField="date"
                yField="count"
                point={{
                  size: 4,
                  shape: 'diamond',
                }}
                label={{
                  style: {
                    fill: '#aaa',
                  },
                }}
                height={300}
              />
            </Card>

            {/* 日度趋势图 */}
            <Card
              style={{
                width: '100%',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(255, 165, 0, 0.1)',
              }}
            >
              <Typography.Title level={5}>评论时间趋势（日度）</Typography.Title>
              <Line
                data={dayTrendData}
                xField="date"
                yField="count"
                point={{
                  size: 4,
                  shape: 'diamond',
                }}
                label={{
                  style: {
                    fill: '#aaa',
                  },
                }}
                height={300}
              />
            </Card>

            {/* 产品型号分布 */}
            <Card
              style={{
                width: '100%',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(255, 165, 0, 0.1)',
              }}
            >
              <Typography.Title level={5}>产品型号分布</Typography.Title>
              <Pie
                data={modelData}
                angleField="count"
                colorField="type"
                radius={0.8}
                label={{
                  type: 'outer',
                  content: '{name} {percentage}%',
                }}
                height={300}
              />
            </Card>

            {/* 评论长度分布 */}
            <Card
              style={{
                width: '100%',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(255, 165, 0, 0.1)',
              }}
            >
              <Typography.Title level={5}>评论长度分布</Typography.Title>
              <Column
                data={lengthData}
                xField="length"
                yField="count"
                label={{
                  position: 'middle',
                  style: {
                    fill: '#FFFFFF',
                  },
                }}
                height={300}
              />
            </Card>
          </Flex>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Admin;
