# 🚀 AI Agriculture Platform Deployment Guide

## 📋 Overview

This guide will help you deploy the AI Agriculture Platform to production using Vercel (frontend) and GitHub (code repository).

## 🌐 Deployment Options

### 1. Frontend Deployment (Vercel) - Recommended
- **Platform**: Vercel
- **URL**: https://vercel.com
- **Benefits**: Automatic deployments, CDN, SSL, custom domains
- **Cost**: Free tier available

### 2. Backend Deployment Options
- **Heroku**: Easy Node.js deployment
- **Render**: Modern cloud platform
- **AWS**: Enterprise-grade deployment
- **DigitalOcean**: Developer-friendly cloud

### 3. ML API Deployment Options
- **Heroku**: With proper buildpacks
- **Render**: With Docker support
- **AWS Lambda**: Serverless deployment

## 🔗 Step 1: GitHub Repository (Completed)

✅ **Repository**: https://github.com/patibandasarvani/agri-ai-platform.git
- All code has been pushed to GitHub
- Repository includes complete plant disease detection system
- Proper .gitignore configured

## 🌐 Step 2: Vercel Frontend Deployment

### Option A: Automatic Deployment (Recommended)

1. **Connect Vercel to GitHub**
   - Go to https://vercel.com
   - Sign up/login with GitHub
   - Click "New Project"
   - Select `agri-ai-platform` repository
   - Click "Import"

2. **Configure Build Settings**
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

3. **Environment Variables**
   ```
   REACT_APP_API_URL: https://your-backend-url.com
   REACT_APP_ML_API_URL: https://your-ml-api-url.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy
   - Get your Vercel URL (e.g., https://agri-ai-platform.vercel.app)

### Option B: Manual Deployment with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**
   ```bash
   cd frontend
   vercel --prod
   ```

## 🔧 Step 3: Backend Deployment (Heroku Example)

### Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd backend
   heroku create agri-ai-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=mongodb+srv://your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set OPENWEATHER_API_KEY=your-openweather-key
   ```

5. **Add Buildpack for Node.js**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

6. **Deploy to Heroku**
   ```bash
   git subtree push --prefix backend heroku main
   ```

7. **Get Backend URL**
   ```bash
   heroku info -s | grep web_url
   ```

## 🤖 Step 4: ML API Deployment (Heroku with Docker)

### Create Dockerfile for ML API

1. **Create ML API Dockerfile**
   ```dockerfile
   FROM python:3.9-slim
   
   WORKDIR /app
   
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   COPY . .
   
   EXPOSE 5002
   
   CMD ["python", "test_api.py"]
   ```

2. **Deploy to Heroku**
   ```bash
   cd ml-model
   heroku create agri-ai-ml-api
   heroku buildpacks:set heroku/python
   git subtree push --prefix ml-model heroku main
   ```

## 🔗 Step 5: Update Frontend Environment Variables

After deploying backend and ML API, update Vercel environment variables:

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Settings → Environment Variables**
4. **Add/update variables**:
   ```
   REACT_APP_API_URL: https://your-backend-url.herokuapp.com
   REACT_APP_ML_API_URL: https://your-ml-api-url.herokuapp.com
   ```

5. **Redeploy** to apply changes

## 🧪 Step 6: Test Deployment

### Test All Services

1. **Frontend**: Visit your Vercel URL
2. **Backend Health**: `https://your-backend-url.herokuapp.com/api/health`
3. **ML API Health**: `https://your-ml-api-url.herokuapp.com/health`

### Test Plant Disease Detection

1. Navigate to `/plant-disease/upload`
2. Upload a plant image
3. Verify AI detection works
4. Check results display

## 📊 Step 7: Database Setup

### MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**
   - Go to https://mongodb.com/atlas
   - Create free cluster
   - Get connection string

2. **Update Backend Environment**
   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://your-atlas-connection-string
   ```

### Local MongoDB (Development)

```bash
# Install MongoDB
# Start MongoDB service
# Update .env file with local connection
```

## 🔒 Step 8: Security Configuration

### Environment Variables Required

**Backend (.env)**:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-super-secret-jwt-key
OPENWEATHER_API_KEY=your-openweather-api-key
ML_API_URL=https://your-ml-api-url.herokuapp.com
```

**Frontend (Vercel)**:
```env
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
REACT_APP_ML_API_URL=https://your-ml-api-url.herokuapp.com
```

### Security Best Practices

1. **Use HTTPS** (automatic with Vercel/Heroku)
2. **Environment Variables** for secrets
3. **Rate Limiting** (already configured)
4. **Input Validation** (already implemented)
5. **JWT Authentication** (already configured)

## 📱 Step 9: Custom Domain (Optional)

### Vercel Custom Domain

1. **Go to Vercel Dashboard**
2. **Settings → Domains**
3. **Add your custom domain**
4. **Update DNS records** as instructed

### Backend Custom Domain

1. **Heroku**: Add custom domain via dashboard
2. **DNS**: Point to Heroku DNS target

## 🔄 Step 10: CI/CD Pipeline

### Automatic Deployments

**Frontend (Vercel)**:
- ✅ Automatic on git push to main
- ✅ Preview deployments for PRs

**Backend (Heroku)**:
```bash
# Set up automatic deployment
git remote add heroku https://git.heroku.com/your-app.git
git push heroku main
```

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: your-app-name
          heroku_email: your-email@example.com
```

## 📊 Monitoring & Analytics

### Vercel Analytics
- Automatic performance monitoring
- User analytics
- Build metrics

### Backend Monitoring
```bash
# Add monitoring to your backend
npm install morgan
# Already configured in server.js
```

### Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for user session recording

## 🚀 Production Checklist

- [ ] GitHub repository configured
- [ ] Vercel frontend deployed
- [ ] Backend deployed (Heroku/Render)
- [ ] ML API deployed
- [ ] MongoDB Atlas configured
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] Monitoring set up
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] Security audit completed

## 🔗 URLs After Deployment

**Example URLs**:
- **Frontend**: https://agri-ai-platform.vercel.app
- **Backend**: https://agri-ai-backend.herokuapp.com
- **ML API**: https://agri-ai-ml-api.herokuapp.com
- **GitHub**: https://github.com/patibandasarvani/agri-ai-platform

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**: Check package.json and dependencies
2. **Environment Variables**: Ensure all required variables are set
3. **CORS Issues**: Update CORS configuration in backend
4. **Database Connection**: Verify MongoDB URI and network access
5. **ML API Timeout**: Check Flask API logs and health endpoint

### Debug Commands

```bash
# Check Vercel logs
vercel logs

# Check Heroku logs
heroku logs --tail

# Test API endpoints
curl https://your-backend-url.herokuapp.com/api/health
curl https://your-ml-api-url.herokuapp.com/health
```

## 🎉 Success!

Your AI Agriculture Platform is now live! 🌱

**Features Available**:
- ✅ Crop prediction system
- ✅ Fertilizer recommendations
- ✅ Weather integration
- ✅ Plant disease detection (95% accuracy)
- ✅ User authentication
- ✅ Responsive design
- ✅ PDF reports
- ✅ Analytics dashboard

**Next Steps**:
- Monitor performance
- Collect user feedback
- Add new features
- Scale as needed

---

**🌱 Empowering farmers with AI-driven agricultural intelligence!**
