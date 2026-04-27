import React, { useState, useCallback } from 'react';
import { 
  Card, 
  Upload, 
  Button, 
  Typography, 
  Space, 
  Spin, 
  message, 
  Row, 
  Col,
  Alert,
  Progress,
  Tag,
  Divider,
  Select,
  Input,
  DatePicker
} from 'antd';
import { 
  InboxOutlined, 
  CameraOutlined, 
  UploadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;
const { Option } = Select;
const { TextArea } = Input;

const PlantDiseaseUpload = () => {
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [location, setLocation] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cropInfo, setCropInfo] = useState({
    cropType: '',
    growthStage: '',
    plantingDate: null
  });
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();
  const webcamRef = React.useRef(null);

  // Get user location
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(file);
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  const captureFromCamera = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPreview(imageSrc);
    setUseCamera(false);
    
    // Convert base64 to file
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setUploadedImage(file);
      });
  }, []);

  const handleDetectDisease = async () => {
    if (!uploadedImage) {
      message.error('Please upload an image first');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      
      if (location) {
        formData.append('location', JSON.stringify(location));
      }
      
      if (cropInfo.cropType) {
        formData.append('cropInfo', JSON.stringify(cropInfo));
      }
      
      if (notes) {
        formData.append('notes', notes);
      }

      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/api/plant-disease/upload-image',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          ...config
        }
      );

      if (response.data.success) {
        message.success('Disease detected successfully!');
        // Navigate to result page with prediction data
        navigate('/plant-disease/result/' + response.data.data.id, { 
          state: { 
            result: response.data.data,
            image: preview 
          } 
        });
      } else {
        message.error('Failed to detect disease');
      }
    } catch (error) {
      console.error('Detection error:', error);
      message.error('Error detecting disease. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setPreview(null);
    setUploadProgress(0);
    setCropInfo({
      cropType: '',
      growthStage: '',
      plantingDate: null
    });
    setNotes('');
  };

  const getSeverityColor = (confidence) => {
    if (confidence > 0.8) return '#f5222d';
    if (confidence > 0.6) return '#fa8c16';
    return '#52c41a';
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card title="Upload Plant Image for Disease Detection" className="upload-card">
            {!preview ? (
              <>
                {!useCamera ? (
                  <>
                    <div {...getRootProps()} style={{ cursor: 'pointer' }}>
                      <input {...getInputProps()} />
                      <Dragger>
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">
                          Click or drag plant leaf image to this area to upload
                        </p>
                        <p className="ant-upload-hint">
                          Support for JPG, PNG, GIF files. Max file size: 10MB
                        </p>
                      </Dragger>
                    </div>
                    
                    <Divider>OR</Divider>
                    
                    <Button
                      type="primary"
                      icon={<CameraOutlined />}
                      onClick={() => setUseCamera(true)}
                      block
                      size="large"
                    >
                      Take Photo with Camera
                    </Button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      width="100%"
                      style={{ maxWidth: 400 }}
                    />
                    <Space style={{ marginTop: 16 }}>
                      <Button
                        type="primary"
                        onClick={captureFromCamera}
                        icon={<CameraOutlined />}
                      >
                        Capture Photo
                      </Button>
                      <Button onClick={() => setUseCamera(false)}>
                        Cancel
                      </Button>
                    </Space>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={preview}
                  alt="Plant preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    borderRadius: 8,
                    marginBottom: 16
                  }}
                />
                <Space>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={handleDetectDisease}
                    loading={loading}
                    size="large"
                  >
                    Detect Disease
                  </Button>
                  <Button onClick={resetUpload}>
                    Upload Different Image
                  </Button>
                </Space>
                
                {loading && (
                  <div style={{ marginTop: 16 }}>
                    <Progress percent={uploadProgress} status="active" />
                    <Text type="secondary">Analyzing image with AI...</Text>
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="Additional Information" className="info-card">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Crop Type:</Text>
                  <Select
                    placeholder="Select crop type"
                    value={cropInfo.cropType}
                    onChange={(value) => setCropInfo({...cropInfo, cropType: value})}
                    style={{ width: '100%', marginTop: 4 }}
                  >
                    <Option value="tomato">Tomato</Option>
                    <Option value="apple">Apple</Option>
                    <Option value="corn">Corn</Option>
                    <Option value="grape">Grape</Option>
                    <Option value="potato">Potato</Option>
                    <Option value="pepper">Pepper</Option>
                    <Option value="strawberry">Strawberry</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </div>

                <div>
                  <Text strong>Growth Stage:</Text>
                  <Select
                    placeholder="Select growth stage"
                    value={cropInfo.growthStage}
                    onChange={(value) => setCropInfo({...cropInfo, growthStage: value})}
                    style={{ width: '100%', marginTop: 4 }}
                  >
                    <Option value="seedling">Seedling</Option>
                    <Option value="vegetative">Vegetative</Option>
                    <Option value="flowering">Flowering</Option>
                    <Option value="fruiting">Fruiting</Option>
                    <Option value="mature">Mature</Option>
                  </Select>
                </div>

                <div>
                  <Text strong>Planting Date:</Text>
                  <DatePicker
                    value={cropInfo.plantingDate}
                    onChange={(date) => setCropInfo({...cropInfo, plantingDate: date})}
                    style={{ width: '100%', marginTop: 4 }}
                    placeholder="Select planting date"
                  />
                </div>

                <div>
                  <Text strong>Additional Notes:</Text>
                  <TextArea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional observations..."
                    rows={3}
                    style={{ marginTop: 4 }}
                  />
                </div>
              </Space>
            </Card>

            <Card title="How to Use" className="info-card">
              <ol>
                <li>Upload a clear image of plant leaf showing symptoms</li>
                <li>Ensure good lighting and focus on affected areas</li>
                <li>Fill in crop information for better recommendations</li>
                <li>Click "Detect Disease" to analyze</li>
                <li>View detailed results and treatment recommendations</li>
              </ol>
            </Card>

            <Card title="Supported Diseases" className="info-card">
              <Space wrap>
                <Tag color="green">Apple Scab</Tag>
                <Tag color="green">Black Rot</Tag>
                <Tag color="green">Cedar Rust</Tag>
                <Tag color="blue">Early Blight</Tag>
                <Tag color="blue">Late Blight</Tag>
                <Tag color="orange">Powdery Mildew</Tag>
                <Tag color="orange">Leaf Spot</Tag>
                <Tag color="red">Bacterial Spot</Tag>
                <Tag color="purple">Rust</Tag>
                <Tag color="purple">Mosaic Virus</Tag>
              </Space>
            </Card>

            {location && (
              <Card 
                title="Location Services" 
                className="info-card"
                extra={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              >
                <p>
                  <Text strong>Location detected:</Text> {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
                <p>
                  <Text type="secondary">
                    Location data helps provide better recommendations based on your region.
                  </Text>
                </p>
              </Card>
            )}

            <Alert
              message="AI-Powered Disease Detection"
              description="Our advanced MobileNetV2 model analyzes plant images with 95% accuracy to identify diseases and provide targeted treatment recommendations."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
            />
          </Space>
        </Col>
      </Row>

      <style jsx>{`
        .upload-card .ant-card-head-title {
          font-size: 18px;
          font-weight: 600;
        }
        .info-card .ant-card-head-title {
          font-size: 16px;
          font-weight: 600;
        }
        .ant-upload-drag {
          border: 2px dashed #d9d9d9;
          border-radius: 8px;
          background: #fafafa;
          padding: 20px;
        }
        .ant-upload-drag:hover {
          border-color: #1890ff;
        }
      `}</style>
    </div>
  );
};

export default PlantDiseaseUpload;
