import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Typography, 
  Tag, 
  Button, 
  Space, 
  Input, 
  DatePicker, 
  Select,
  message,
  Empty,
  Tooltip,
  Progress,
  Row,
  Col,
  Statistic,
  Pagination
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  DownloadOutlined, 
  DeleteOutlined,
  FilterOutlined,
  CalendarOutlined,
  EditOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const PlantDiseaseHistory = () => {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statistics, setStatistics] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPredictions();
    fetchStatistics();
  }, [currentPage, pageSize, searchText, dateRange, diseaseFilter, statusFilter, severityFilter]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      if (searchText) params.disease = searchText;
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      if (diseaseFilter !== 'all') params.disease = diseaseFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (severityFilter !== 'all') params.severity = severityFilter;

      const response = await axios.get(
        'http://localhost:5001/api/plant-disease/history',
        {
          params,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setPredictions(response.data.data.predictions);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      message.error('Failed to fetch prediction history');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5001/api/plant-disease/statistics',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const getDiseaseColor = (disease) => {
    if (disease.includes('healthy')) return 'green';
    if (disease.includes('blight') || disease.includes('rot')) return 'red';
    if (disease.includes('spot') || disease.includes('mildew')) return 'orange';
    return 'blue';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.8) return '#52c41a';
    if (confidence > 0.6) return '#fa8c16';
    return '#f5222d';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'treated': return 'blue';
      case 'resolved': return 'green';
      case 'monitoring': return 'purple';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      case 'severe': return 'red';
      default: return 'default';
    }
  };

  const viewResult = (prediction) => {
    navigate(`/plant-disease/result/${prediction._id}`, { 
      state: { 
        result: prediction
      } 
    });
  };

  const downloadReport = async (prediction) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5001/api/plant-disease/${prediction._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Create a simple text report for now
      const reportData = `
PLANT DISEASE DETECTION REPORT
=============================
Date: ${moment(prediction.createdAt).format('YYYY-MM-DD HH:mm:ss')}
Disease: ${prediction.disease}
Confidence: ${(prediction.confidence * 100).toFixed(2)}%
Severity: ${prediction.severity}
Status: ${prediction.status}

RECOMMENDED TREATMENT:
=====================
Pesticide: ${prediction.pesticide}
Usage: ${prediction.usage}
Application Method: ${prediction.applicationMethod}
Frequency: ${prediction.frequency}

SAFETY TIPS:
${prediction.safetyTips}

PREVENTION MEASURES:
${prediction.prevention.join('\n')}

SOIL MANAGEMENT:
${prediction.soilManagement.join('\n')}

WATER MANAGEMENT:
${prediction.waterManagement.join('\n')}

FERTILIZER SUGGESTION:
${prediction.fertilizerSuggestion}
      `;
      
      const blob = new Blob([reportData], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `disease-report-${prediction._id}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success('Report downloaded successfully');
    } catch (error) {
      message.error('Failed to download report');
    }
  };

  const deletePrediction = async (predictionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5001/api/plant-disease/${predictionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      message.success('Prediction deleted successfully');
      fetchPredictions();
      fetchStatistics();
    } catch (error) {
      message.error('Failed to delete prediction');
    }
  };

  const clearFilters = () => {
    setSearchText('');
    setDateRange(null);
    setDiseaseFilter('all');
    setStatusFilter('all');
    setSeverityFilter('all');
    setCurrentPage(1);
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Disease',
      dataIndex: 'disease',
      key: 'disease',
      render: (disease) => (
        <Tooltip title={disease}>
          <Tag color={getDiseaseColor(disease)}>
            {disease.replace(/___/g, ' - ').substring(0, 25)}...
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence) => (
        <div style={{ width: 100 }}>
          <Progress
            percent={Math.round(confidence * 100)}
            size="small"
            strokeColor={getConfidenceColor(confidence)}
            format={(percent) => `${percent}%`}
          />
        </div>
      ),
      sorter: (a, b) => a.confidence - b.confidence,
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Low', value: 'low' },
        { text: 'Medium', value: 'medium' },
        { text: 'High', value: 'high' },
        { text: 'Severe', value: 'severe' },
      ],
      onFilter: (value, record) => record.severity === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Treated', value: 'treated' },
        { text: 'Monitoring', value: 'monitoring' },
        { text: 'Resolved', value: 'resolved' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Pesticide',
      dataIndex: 'pesticide',
      key: 'pesticide',
      render: (pesticide) => (
        <Tooltip title={pesticide}>
          <Text ellipsis style={{ maxWidth: 120 }}>
            {pesticide}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => viewResult(record)}
            />
          </Tooltip>
          <Tooltip title="Download Report">
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => downloadReport(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => deletePrediction(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Plant Disease Detection History</Title>
      
      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Predictions"
                value={statistics.summary.totalPredictions}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Healthy Plants"
                value={statistics.summary.healthyCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Diseased Plants"
                value={statistics.summary.diseasedCount}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Disease Rate"
                value={statistics.summary.diseaseRate}
                suffix="%"
                prefix={<FilterOutlined />}
                valueStyle={{ 
                  color: statistics.summary.diseaseRate > 50 ? '#f5222d' : '#fa8c16' 
                }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search by disease or pesticide"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              placeholder={['Start Date', 'End Date']}
              onChange={(dates) => setDateRange(dates)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Filter by disease"
              value={diseaseFilter}
              onChange={setDiseaseFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Diseases</Option>
              <Option value="healthy">Healthy Only</Option>
              <Option value="diseased">Diseased Only</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="treated">Treated</Option>
              <Option value="monitoring">Monitoring</Option>
              <Option value="resolved">Resolved</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchPredictions}
              >
                Refresh
              </Button>
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Predictions Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={predictions}
          rowKey="_id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No prediction history found"
              >
                <Button type="primary" onClick={() => navigate('/plant-disease/upload')}>
                  Make Your First Prediction
                </Button>
              </Empty>
            )
          }}
        />
        
        {/* Pagination */}
        {total > 0 && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Pagination
              current={currentPage}
              total={total}
              pageSize={pageSize}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} of ${total} predictions`
              }
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default PlantDiseaseHistory;
