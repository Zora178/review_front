import { Column, Line, Pie } from '@ant-design/charts';
import { WordCloud } from '@ant-design/plots';
import { PageContainer } from '@ant-design/pro-components';
import { useLocation, useNavigate } from '@umijs/max';
import {
  Button,
  Card,
  Collapse,
  Flex,
  Progress,
  Select,
  Statistic,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 定义数据类型
interface VisualData {
  word_cloud: Array<{ text: string; value: number }>;
  time_trend: {
    year_count: Array<{ date: string; value: number }>;
    month_count: Array<{ date: string; value: number }>;
    day_count: Array<{ date: string; value: number }>;
  };
  model_distribution: {
    model_count: Array<{ type: string; value: number }>;
  };
  length_distribution: Array<{ length: string; value: number }>;
}

interface ConclusionData {
  value: string;
  visual_data: VisualData;
}

interface ReportItem {
  id: number;
  search_key: string;
  report: string;
  visual_data: VisualData;
  word_cloud: Array<{ text: string; value: number }>;
  year_count: Array<{ date: string; value: number }>;
  month_count: Array<{ date: string; value: number }>;
  day_count: Array<{ date: string; value: number }>;
  model_distribution: Array<{ type: string; value: number }>;
  length_distribution: Array<{ length: string; value: number }>;
}

const Admin: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportList, setReportList] = useState<ReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [wordCloudData, setWordCloudData] = useState<Array<{ text: string; value: number }>>([]);
  const [yearTrendData, setYearTrendData] = useState<Array<{ date: string; count: number }>>([]);
  const [monthTrendData, setMonthTrendData] = useState<Array<{ date: string; count: number }>>([]);
  const [dayTrendData, setDayTrendData] = useState<Array<{ date: string; count: number }>>([]);
  const [modelData, setModelData] = useState<Array<{ type: string; count: number }>>([]);
  const [lengthData, setLengthData] = useState<Array<{ length: string; count: number }>>([]);

  // 处理数据格式化
  const processData = (report: ReportItem) => {
    // 处理词云图数据
    if (report.word_cloud) {
      const wordCloudData = report.word_cloud.map((item) => ({
        ...item,
        name: item.text,
      }));
      setWordCloudData(wordCloudData);
    }

    // 处理年度趋势数据
    if (report.year_count) {
      const yearData = report.year_count.map((item) => ({
        date: `${item.date}年`,
        count: Number(item.value),
      }));
      setYearTrendData(yearData);
    }

    // 处理月度趋势数据
    if (report.month_count) {
      const monthData = report.month_count.map((item) => ({
        date: item.date,
        count: Number(item.value),
      }));
      setMonthTrendData(monthData);
    }

    // 处理日度趋势数据
    if (report.day_count) {
      const dayData = report.day_count.map((item) => ({
        date: item.date,
        count: Number(item.value),
      }));
      setDayTrendData(dayData);
    }

    // 处理产品型号分布数据
    if (report.model_distribution) {
      const modelDistributionData = report.model_distribution.map((item) => ({
        type: item.type,
        count: Number(item.value),
      }));
      setModelData(modelDistributionData);
    }

    // 处理评论长度分布数据
    if (report.length_distribution) {
      const lengthDistributionData = report.length_distribution.map((item) => ({
        length: `${item.length}字`,
        count: Number(item.value),
      }));
      setLengthData(lengthDistributionData);
    }
  };

  // 获取报告列表
  useEffect(() => {
    const fetchReportList = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/ai_report_list/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        if (response.ok && result.code === 200) {
          setReportList(result.data);
        } else {
          message.error(result.msg || '获取报告列表失败');
        }
      } catch (error) {
        message.error('获取报告列表失败');
      }
    };
    fetchReportList();
  }, []);

  // 从URL获取搜索关键词
  const searchKey = new URLSearchParams(location.search).get('searchKey') || '';

  // 处理查询
  const handleSearch = () => {
    if (selectedReport) {
      const report = reportList.find((item) => item.search_key === selectedReport);
      if (report) {
        try {
          // 存储数据到localStorage
          const conclusionData = {
            value: report.report,
            visual_data: {
              word_cloud: report.word_cloud,
              time_trend: {
                year_count: report.year_count,
                month_count: report.month_count,
                day_count: report.day_count,
              },
              model_distribution: {
                model_count: report.model_distribution,
              },
              length_distribution: report.length_distribution,
            },
          };
          localStorage.setItem('conclusionData', JSON.stringify(conclusionData));
          localStorage.setItem('currentSearchKey', selectedReport);
          // 处理并显示数据
          setMarkdownContent(report.report);
          processData(report);
          navigate(`/admin?searchKey=${selectedReport}`);
        } catch (error) {
          message.error('数据解析失败，请检查数据格式');
          console.error('JSON解析错误:', error);
        }
      }
    }
  };

  // 获取报告和可视化数据
  useEffect(() => {
    const conclusionDataStr = localStorage.getItem('conclusionData');
    const currentSearchKey = localStorage.getItem('currentSearchKey');
    if (conclusionDataStr && currentSearchKey) {
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
        setSelectedReport(currentSearchKey);

        // 处理可视化数据
        if (conclusionData.visual_data) {
          const reportData = {
            id: 0,
            search_key: currentSearchKey,
            report: content,
            visual_data: conclusionData.visual_data,
            word_cloud: conclusionData.visual_data.word_cloud,
            year_count: conclusionData.visual_data.time_trend.year_count as Array<{
              date: string;
              value: number;
            }>,
            month_count: conclusionData.visual_data.time_trend.month_count as Array<{
              date: string;
              value: number;
            }>,
            day_count: conclusionData.visual_data.time_trend.day_count as Array<{
              date: string;
              value: number;
            }>,
            model_distribution: conclusionData.visual_data.model_distribution.model_count as Array<{
              type: string;
              value: number;
            }>,
            length_distribution: conclusionData.visual_data.length_distribution as Array<{
              length: string;
              value: number;
            }>,
          };
          processData(reportData);
        }
      } catch (error) {
        message.error('数据解析失败！');
      }
    } else {
      // 如果没有存储的数据，显示搜索框
      setMarkdownContent('');
      setWordCloudData([]);
      setYearTrendData([]);
      setMonthTrendData([]);
      setDayTrendData([]);
      setModelData([]);
      setLengthData([]);
    }
    setLoading(false);
  }, [searchKey]);

  // 处理报告选择
  const handleReportSelect = (value: string) => {
    setSelectedReport(value);
  };

  // 处理切换
  const handleSwitch = () => {
    if (selectedReport) {
      const report = reportList.find((item) => item.search_key === selectedReport);
      if (report) {
        try {
          // 存储数据到localStorage
          const conclusionData = {
            value: report.report,
            visual_data: {
              word_cloud: report.word_cloud,
              time_trend: {
                year_count: report.year_count,
                month_count: report.month_count,
                day_count: report.day_count,
              },
              model_distribution: {
                model_count: report.model_distribution,
              },
              length_distribution: report.length_distribution,
            },
          };
          localStorage.setItem('conclusionData', JSON.stringify(conclusionData));
          localStorage.setItem('currentSearchKey', selectedReport);

          // 处理并显示数据
          setMarkdownContent(report.report);
          processData(report);
          navigate(`/admin?searchKey=${selectedReport}`);
        } catch (error) {
          message.error('数据解析失败，请检查数据格式');
          console.error('JSON解析错误:', error);
        }
      }
    }
  };

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
          padding: '24px',
        }}
      >
        {!localStorage.getItem('conclusionData') ? (
          <>
            <div
              style={{
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>选择商品：</span>
              <Select
                style={{
                  width: 400,
                  borderRadius: '8px',
                }}
                placeholder="请选择搜索关键词"
                value={selectedReport}
                onChange={handleReportSelect}
                options={reportList.map((item) => ({
                  label: item.search_key,
                  value: item.search_key,
                }))}
                size="large"
              />
              <Button
                type="primary"
                onClick={handleSearch}
                size="large"
                style={{
                  height: '40px',
                  padding: '0 24px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
                }}
              >
                查询
              </Button>
            </div>
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Typography.Text type="secondary" style={{ fontSize: '16px' }}>
                暂无报告内容
              </Typography.Text>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>切换商品：</span>
              <Select
                style={{
                  width: 400,
                  borderRadius: '8px',
                }}
                value={selectedReport}
                onChange={handleReportSelect}
                options={reportList.map((item) => ({
                  label: item.search_key,
                  value: item.search_key,
                }))}
                size="large"
              />
              <Button
                type="primary"
                onClick={handleSwitch}
                size="large"
                style={{
                  height: '40px',
                  padding: '0 24px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
                }}
              >
                切换
              </Button>
            </div>
            {!markdownContent && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  marginBottom: '24px',
                }}
              >
                <Typography.Text type="secondary" style={{ fontSize: '16px' }}>
                  暂无报告内容
                </Typography.Text>
              </div>
            )}
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
                    value={lengthData.reduce((sum, item) => sum + item.count, 0)}
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
                    value={yearTrendData.map(({ date, count }) => `${date}: ${count}条`).join(', ')}
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
                    value={wordCloudData
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 3)
                      .map(({ text, value }) => `${text}(${value})`)
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
                      ...lengthData.map((item) => parseInt(item.length)),
                    )}字, 最长${Math.max(...lengthData.map((item) => parseInt(item.length)))}字`}
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
          </>
        )}
      </Card>
    </PageContainer>
  );
};

export default Admin;
