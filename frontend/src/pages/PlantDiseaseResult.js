import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Row, 
  Col, 
  Tag, 
  Progress, 
  Alert, 
  Button, 
  Space, 
  Divider,
  Statistic,
  Timeline,
  Badge,
  message,
  Spin,
  Descriptions,
  List,
  Tooltip,
  Tabs,
  Select,
  Input
} from 'antd';
import { 
  CheckCircleOutlined, 
  WarningOutlined, 
  DownloadOutlined,
  ShareAltOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  MedicineBoxOutlined,
  LineChartOutlined,
  CalendarOutlined,
  EditOutlined,
  SaveOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Item } = Descriptions;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const PlantDiseaseResult = () => {
  const { predictionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(location.state?.result || null);
  const [image, setImage] = useState(location.state?.image || null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [treatmentStatus, setTreatmentStatus] = useState('pending');

  useEffect(() => {
    if (!result && predictionId) {
      fetchPredictionDetails();
    }
    if (result) {
      setNotes(result.notes || '');
      setTreatmentStatus(result.status || 'pending');
    }
  }, [predictionId, result]);

  const fetchPredictionDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5001/api/plant-disease/${predictionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setResult(response.data.data);
        setImage(response.data.data.imagePath);
        setNotes(response.data.data.notes || '');
        setTreatmentStatus(response.data.data.status || 'pending');
      }
    } catch (error) {
      message.error('Failed to load result');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const element = document.getElementById('result-content');
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`plant-disease-report-${moment().format('YYYY-MM-DD')}.pdf`);
      message.success('PDF downloaded successfully');
    } catch (error) {
      message.error('Failed to generate PDF');
    }
  };

  const shareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Plant Disease Detection Results',
        text: `Disease: ${result?.prediction?.disease}\nConfidence: ${(result?.prediction?.confidence * 100).toFixed(2)}%`,
        url: window.location.href
      });
    } else {
      const text = `Disease: ${result?.prediction?.disease}\nConfidence: ${(result?.prediction?.confidence * 100).toFixed(2)}%\n${window.location.href}`;
      navigator.clipboard.writeText(text);
      message.success('Results copied to clipboard');
    }
  };

  const saveNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5001/api/plant-disease/${predictionId}/treatment`,
        {
          notes: notes,
          status: treatmentStatus
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setEditingNotes(false);
      message.success('Notes saved successfully');
      
      // Update local result
      setResult(prev => ({
        ...prev,
        notes: notes,
        status: treatmentStatus
      }));
    } catch (error) {
      message.error('Failed to save notes');
    }
  };

  const getSeverityColor = (confidence) => {
    if (confidence > 0.8) return '#f5222d';
    if (confidence > 0.6) return '#fa8c16';
    return '#52c41a';
  };

  const getSeverityTag = (disease) => {
    if (disease.includes('healthy')) return { color: 'green', text: 'Healthy' };
    if (disease.includes('blight') || disease.includes('rot')) return { color: 'red', text: 'Severe' };
    if (disease.includes('spot') || disease.includes('mildew')) return { color: 'orange', text: 'Moderate' };
    return { color: 'blue', text: 'Mild' };
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <Title level={4} style={{ marginTop: 16 }}>Loading results...</Title>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <WarningOutlined style={{ fontSize: 48, color: '#f5222d' }} />
        <Title level={4}>No results found</Title>
        <Button type="primary" onClick={() => navigate('/plant-disease/upload')}>
          Upload New Image
        </Button>
      </div>
    );
  }

  const severity = getSeverityTag(result.prediction.disease);
  const confidence = result.prediction.confidence;
  const recommendations = result.recommendations;

  return (
    <div id="result-content">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Uploaded Image" className="result-card">
            {image && (
              <img
                src={image.startsWith('data:') ? image : `http://localhost:5001/${image}`}
                alt="Plant disease"
                style={{
                  width: '100%',
                  borderRadius: 8,
                  marginBottom: 16
                }}
              />
            )}
            <Space>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                onClick={downloadPDF}
              >
                Download PDF
              </Button>
              <Button 
                icon={<ShareAltOutlined />} 
                onClick={shareResults}
              >
                Share Results
              </Button>
              <Button 
                icon={<PrinterOutlined />} 
                onClick={() => window.print()}
              >
                Print
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Detection Results" className="result-card">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>{result.prediction.disease.replace(/___/g, ' - ')}</Title>
                <Tag color={severity.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {severity.text}
                </Tag>
                <Tag color={getStatusColor(treatmentStatus)} style={{ marginLeft: 8 }}>
                  Status: {treatmentStatus}
                </Tag>
              </div>

              <div>
                <Text strong>Confidence Level:</Text>
                <Progress
                  percent={Math.round(confidence * 100)}
                  strokeColor={getSeverityColor(confidence)}
                  format={(percent) => `${percent}%`}
                  style={{ marginTop: 8 }}
                />
              </div>

              <Alert
                message={confidence > 0.7 ? "High Confidence Detection" : "Moderate Confidence Detection"}
                description={
                  confidence > 0.7 
                    ? "Our AI model is highly confident in this diagnosis. Follow the recommended treatment."
                    : "Consider consulting with an agricultural expert for confirmation."
                }
                type={confidence > 0.7 ? "success" : "warning"}
                showIcon
              />
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <MedicineBoxOutlined />
                Recommended Treatment
              </Space>
            } 
            className="result-card"
          >
            <Descriptions column={1} size="small">
              <Item label="Pesticide">
                <Text strong>{recommendations.pesticide}</Text>
              </Item>
              <Item label="Usage">
                <Text>{recommendations.usage}</Text>
              </Item>
              <Item label="Application Method">
                <Text>{recommendations.applicationMethod}</Text>
              </Item>
              <Item label="Frequency">
                <Text>{recommendations.frequency}</Text>
              </Item>
            </Descriptions>

            <Divider />
            
            <div>
              <Text strong>Safety Tips:</Text>
              <Paragraph style={{ marginTop: 4 }}>
                {recommendations.safetyTips}
              </Paragraph>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <SafetyOutlined />
                Prevention & Management
              </Space>
            } 
            className="result-card"
          >
            <Tabs defaultActiveKey="1">
              <TabPane tab="Prevention" key="1">
                <List
                  size="small"
                  dataSource={recommendations.prevention}
                  renderItem={(item, index) => (
                    <List.Item>
                      <Text>{index + 1}. {item}</Text>
                    </List.Item>
                  )}
                />
              </TabPane>
              <TabPane tab="Soil Management" key="2">
                <List
                  size="small"
                  dataSource={recommendations.soilManagement}
                  renderItem={(item, index) => (
                    <List.Item>
                      <Text>{index + 1}. {item}</Text>
                    </List.Item>
                  )}
                />
              </TabPane>
              <TabPane tab="Water Management" key="3">
                <List
                  size="small"
                  dataSource={recommendations.waterManagement}
                  renderItem={(item, index) => (
                    <List.Item>
                      <Text>{index + 1}. {item}</Text>
                    </List.Item>
                  )}
                />
              </TabPane>
              <TabPane tab="Fertilizer" key="4">
                <Paragraph>
                  {recommendations.fertilizerSuggestion}
                </Paragraph>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {result.location && (
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <EnvironmentOutlined />
                  Location Information
                </Space>
              } 
              className="result-card"
            >
              <Descriptions column={2} size="small">
                <Item label="Latitude">
                  {result.location.latitude?.toFixed(4)}
                </Item>
                <Item label="Longitude">
                  {result.location.longitude?.toFixed(4)}
                </Item>
                {result.location.address && (
                  <Item label="Address" span={2}>
                    {result.location.address}
                  </Item>
                )}
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <CalendarOutlined />
                  Crop Information
                </Space>
              } 
              className="result-card"
            >
              {result.cropInfo ? (
                <Descriptions column={2} size="small">
                  <Item label="Crop Type">
                    {result.cropInfo.cropType}
                  </Item>
                  <Item label="Growth Stage">
                    {result.cropInfo.growthStage}
                  </Item>
                  {result.cropInfo.plantingDate && (
                    <Item label="Planting Date" span={2}>
                      {moment(result.cropInfo.plantingDate).format('YYYY-MM-DD')}
                    </Item>
                  )}
                </Descriptions>
              ) : (
                <Text type="secondary">No crop information provided</Text>
              )}
            </Card>
          </Col>
        </Row>
      )}

      <Card 
        title="Treatment Timeline & Notes" 
        className="result-card" 
        style={{ marginTop: 24 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Timeline>
              <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                <Text strong>Disease Detected</Text>
                <br />
                <Text type="secondary">{moment(result.timestamp || result.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
              </Timeline.Item>
              <Timeline.Item color="blue" dot={<MedicineBoxOutlined />}>
                <Text strong>Apply Treatment</Text>
                <br />
                <Text type="secondary">Follow recommended application method</Text>
              </Timeline.Item>
              <Timeline.Item color="orange" dot={<ClockCircleOutlined />}>
                <Text strong>Monitor Progress</Text>
                <br />
                <Text type="secondary">Check plant condition after 3-5 days</Text>
              </Timeline.Item>
              <Timeline.Item color="green" dot={<CalendarOutlined />}>
                <Text strong>Follow-up Treatment</Text>
                <br />
                <Text type="secondary">Apply second treatment if needed</Text>
              </Timeline.Item>
            </Timeline>
          </Col>
          
          <Col xs={24} lg={12}>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Text strong>Additional Notes:</Text>
                <Button 
                  size="small" 
                  icon={<EditOutlined />} 
                  onClick={() => setEditingNotes(true)}
                >
                  Edit
                </Button>
              </Space>
            </div>
            
            {editingNotes ? (
              <div>
                <TextArea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Add your observations and treatment notes..."
                />
                <Space style={{ marginTop: 8 }}>
                  <Button 
                    type="primary" 
                    size="small" 
                    icon={<SaveOutlined />}
                    onClick={saveNotes}
                  >
                    Save
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => setEditingNotes(false)}
                  >
                    Cancel
                  </Button>
                </Space>
              </div>
            ) : (
              <Paragraph>
                {notes || 'No additional notes added yet.'}
              </Paragraph>
            )}
            
            <div style={{ marginTop: 16 }}>
              <Space>
                <Text strong>Treatment Status:</Text>
                <Select
                  value={treatmentStatus}
                  onChange={setTreatmentStatus}
                  size="small"
                  style={{ width: 120 }}
                >
                  <Option value="pending">Pending</Option>
                  <Option value="treated">Treated</Option>
                  <Option value="monitoring">Monitoring</Option>
                  <Option value="resolved">Resolved</Option>
                </Select>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Space>
          <Button type="primary" onClick={() => navigate('/plant-disease/upload')}>
            Analyze Another Plant
          </Button>
          <Button onClick={() => navigate('/plant-disease/history')}>
            View History
          </Button>
          <Button onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
        </Space>
      </div>

      <style jsx>{`
        .result-card .ant-card-head-title {
          font-size: 16px;
          font-weight: 600;
        }
        .ant-statistic-title {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.65);
        }
        .ant-statistic-content {
          font-size: 20px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default PlantDiseaseResult;
