# AI-Powered Smart Agriculture Decision Platform

## 🌱 Overview

A production-grade full-stack AI application that provides intelligent crop recommendations and fertilizer suggestions based on soil and environmental conditions. This platform combines Machine Learning, modern web technologies, and agricultural science to deliver actionable insights for farmers and agricultural professionals.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │  Node.js/Express│    │   Flask API     │
│   Frontend      │◄──►│   Backend       │◄──►│   ML Services   │
│                 │    │                 │    │                 │
│ - Dashboard     │    │ - Auth          │    │ - Crop Pred     │
│ - Predictions   │    │ - APIs          │    │ - Fertilizer    │
│ - Analytics     │    │ - Integration   │    │ - Models        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │   Database      │
                       │                 │
                       │ - Users         │
                       │ - Predictions   │
                       │ - Analytics     │
                       └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern functional components with hooks
- **Chart.js** - Data visualization and analytics
- **Axios** - HTTP client for API integration
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Puppeteer** - PDF generation

### Machine Learning
- **Python** - ML programming language
- **Scikit-learn** - ML algorithms
- **Flask** - REST API framework
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing
- **Matplotlib/Seaborn** - Data visualization

## 🚀 Features

### Core Features
- ✅ **Multi-Model ML Prediction** - Random Forest, Decision Tree, KNN
- ✅ **Fertilizer Recommendations** - AI-powered fertilizer suggestions
- ✅ **Weather Integration** - Real-time weather data from OpenWeather API
- ✅ **User Authentication** - Secure JWT-based login system
- ✅ **Prediction History** - Complete prediction tracking and analytics
- ✅ **PDF Reports** - Downloadable professional reports

### Advanced Features
- ✅ **Admin Dashboard** - User management and system monitoring
- ✅ **Data Visualization** - Interactive charts and analytics
- ✅ **Search & Filter** - Advanced data filtering capabilities
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Production Ready** - Scalable architecture

## 📁 Project Structure

```
ai-agriculture-platform/
├── ml-model/                     # Machine Learning Components
│   ├── data/                     # Dataset and data processing
│   ├── models/                   # Trained ML models
│   ├── src/                      # Source code
│   │   ├── data_preprocessing.py
│   │   ├── model_training.py
│   │   ├── fertilizer_model.py
│   │   └── evaluation.py
│   ├── api/                      # Flask API
│   │   ├── app.py
│   │   ├── routes/
│   │   └── services/
│   ├── requirements.txt
│   └── train_models.py
├── backend/                      # Node.js Backend
│   ├── src/
│   │   ├── controllers/          # Route controllers
│   │   ├── models/               # MongoDB schemas
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Custom middleware
│   │   ├── services/             # Business logic
│   │   └── utils/                # Utility functions
│   ├── config/                   # Configuration files
│   ├── tests/                    # Test files
│   ├── package.json
│   └── server.js
├── frontend/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Page components
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # API services
│   │   ├── utils/                # Utility functions
│   │   ├── styles/               # CSS and styling
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
├── docs/                         # Documentation
├── docker-compose.yml            # Docker configuration
└── README.md
```

## 🧪 Machine Learning Models

### Crop Prediction Models
1. **Random Forest** - Ensemble learning method
2. **Decision Tree** - Tree-based classification
3. **K-Nearest Neighbors** - Instance-based learning

### Fertilizer Recommendation Model
- **Rule-based System** - Expert agricultural knowledge
- **Nutrient Analysis** - Soil nutrient assessment
- **Crop-Specific Requirements** - Tailored recommendations

## 📊 Data Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // Hashed
  role: String, // 'user' | 'admin'
  createdAt: Date,
  updatedAt: Date
}
```

### Predictions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  input: {
    N: Number,
    P: Number,
    K: Number,
    temperature: Number,
    humidity: Number,
    ph: Number,
    rainfall: Number
  },
  prediction: {
    crop: String,
    confidence: Number,
    fertilizer: Object
  },
  weather: Object,
  timestamp: Date
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-agriculture-platform
```

2. **Set up ML Environment**
```bash
cd ml-model
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python train_models.py
```

3. **Start Flask API**
```bash
cd api
python app.py
```

4. **Set up Backend**
```bash
cd backend
npm install
npm run dev
```

5. **Set up Frontend**
```bash
cd frontend
npm install
npm start
```

### Environment Variables

Create `.env` files in appropriate directories:

**Backend/.env**
```
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/agriculture_platform
JWT_SECRET=your_jwt_secret_here
FLASK_API_URL=http://localhost:5000
WEATHER_API_KEY=your_openweather_api_key
```

## 📈 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Predictions
- `POST /api/predictions/crop` - Predict crop
- `POST /api/predictions/fertilizer` - Get fertilizer recommendation
- `GET /api/predictions/history` - Get prediction history
- `GET /api/predictions/:id` - Get specific prediction

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/crops` - Crop analytics
- `GET /api/analytics/trends` - Prediction trends

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/predictions` - Get all predictions
- `PUT /api/admin/users/:id` - Update user

## 🌦️ Weather Integration

The platform integrates with OpenWeatherMap API to provide:
- Current weather conditions
- Weather forecasts
- Agricultural insights
- Planting recommendations

## 📄 PDF Reports

Generate professional reports including:
- Prediction results
- Input parameters
- Weather conditions
- Fertilizer recommendations
- Agricultural insights

## 🔧 Development

### Code Quality
- ESLint for JavaScript linting
- Prettier for code formatting
- Comprehensive error handling
- Input validation and sanitization
- Security best practices

### Testing
- Unit tests for ML models
- Integration tests for APIs
- Frontend component testing
- End-to-end testing

## 🚀 Deployment

### Production Setup
1. Set up MongoDB cluster
2. Configure environment variables
3. Build and deploy frontend
4. Deploy backend services
5. Set up monitoring and logging

### Docker Support
```bash
docker-compose up -d
```

## 📊 Performance

- **ML Model Accuracy**: 95%+ (Random Forest)
- **API Response Time**: <200ms
- **Database Optimization**: Indexed queries
- **Caching Strategy**: Redis for frequent data
- **Load Balancing**: Nginx configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the FAQ section

---

**Built with ❤️ for the agricultural community**
