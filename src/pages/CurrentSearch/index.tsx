import { searchRecords } from '@/mock/searchRecords';
import { SearchOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Card, List, Modal, Tag, Typography } from 'antd';
import { useRef, useState } from 'react';

interface SearchRecordItem {
  id: number;
  search_key: string;
  total_word: string[];
  comments: Array<{
    card: string;
    content: string;
    username: string;
  }>;
  created_time: string;
  updated_time: string;
  user_account_id: number;
  ai_report_id: number;
}

const CurrentSearch: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [selectedRecord, setSelectedRecord] = useState<SearchRecordItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const columns: ProColumns<SearchRecordItem>[] = [
    {
      title: '搜索关键词',
      dataIndex: 'search_key',
      valueType: 'text',
      search: true,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '搜索时间',
      dataIndex: 'created_time',
      valueType: 'dateTime',
      sorter: true,
      search: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_time',
      valueType: 'dateTime',
      sorter: true,
      search: false,
    },
    {
      title: '关键词',
      dataIndex: 'total_word',
      search: false,
      render: (_, record) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {record.total_word.map((word, index) => (
            <Tag key={index} color="green">
              {word}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: '评论数',
      dataIndex: 'comments',
      search: false,
      render: (_, record) => record.comments.length,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="view"
          type="link"
          onClick={() => {
            setSelectedRecord(record);
            setIsModalVisible(true);
          }}
        >
          查看详情
        </Button>,
        <Button
          key="delete"
          type="link"
          danger
          onClick={() => {
            // 删除逻辑
            console.log('删除记录:', record);
          }}
        >
          删除
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<SearchRecordItem>
        headerTitle="个人搜索记录"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" key="primary" icon={<SearchOutlined />}>
            搜索
          </Button>,
        ]}
        request={async () => {
          // 使用模拟数据
          return {
            data: searchRecords,
            success: true,
            total: searchRecords.length,
          };
        }}
        columns={columns}
        dateFormatter="string"
        toolbar={{
          title: '搜索记录列表',
        }}
        options={{
          density: true,
          fullScreen: true,
          reload: () => actionRef.current?.reload(),
          setting: true,
        }}
        pagination={{
          pageSize: 10,
        }}
      />

      <Modal
        title="评论详情"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedRecord && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <Typography.Title level={5}>搜索信息</Typography.Title>
              <p>
                搜索关键词：<Tag color="blue">{selectedRecord.search_key}</Tag>
              </p>
              <p>搜索时间：{selectedRecord.created_time}</p>
              <p>更新时间：{selectedRecord.updated_time}</p>
              <p>
                关键词：
                {selectedRecord.total_word.map((word, index) => (
                  <Tag key={index} color="green" style={{ marginRight: 8 }}>
                    {word}
                  </Tag>
                ))}
              </p>
            </Card>

            <List
              header={<Typography.Title level={5}>评论列表</Typography.Title>}
              dataSource={selectedRecord.comments}
              renderItem={(comment) => (
                <List.Item>
                  <Card style={{ width: '100%' }}>
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}
                    >
                      <span>用户：{comment.username}</span>
                      <span>商品：{comment.card}</span>
                    </div>
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {comment.content}
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default CurrentSearch;
