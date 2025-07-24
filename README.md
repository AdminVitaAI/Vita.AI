# 🌟 Vita.AI - Your Smart Health Companion

<div align="center">
  <img src="https://vita-ai.app/logo.png" alt="Vita.AI Logo" width="200"/>
  
  [![Website](https://img.shields.io/badge/Website-vita--ai.app-green)](https://vita-ai.app)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
  [![Flask](https://img.shields.io/badge/Flask-2.x-red)](https://flask.palletsprojects.com/)
  [![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange)](https://openai.com/)
</div>

## 📖 About

Vita.AI is an intelligent health and nutrition tracking application that leverages artificial intelligence to help users monitor their diet, track calories, and achieve their health goals. Built with modern web technologies and powered by OpenAI's GPT models.

### 🎯 Key Features

- **🤖 AI-Powered Food Analysis** - Simply type "كوب حليب" and get instant nutritional information
- **📱 Barcode Scanning** - Scan product barcodes for automatic nutrition data
- **📸 Food Image Recognition** - Take photos of your meals for AI-powered analysis
- **📊 Smart Dashboard** - Track your daily progress with beautiful visualizations
- **🎨 Modern UI/UX** - Responsive design that works on all devices
- **🌐 Arabic Support** - Full Arabic language support for the MENA region

## 🚀 Live Demo

Visit our live application: **[vita-ai.app](https://vita-ai.app)**

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **OpenAI API** - AI-powered food analysis
- **Flask-CORS** - Cross-origin resource sharing

### AI & APIs
- **OpenAI GPT-3.5/4** - Food analysis and recommendations
- **OpenAI Vision** - Image recognition for food photos
- **Open Food Facts API** - Barcode nutrition database

## 📁 Project Structure

```
vita-ai/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── assets/          # Static assets
│   ├── public/              # Public files
│   └── package.json         # Frontend dependencies
├── backend/                 # Flask backend API
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── models/          # Database models
│   │   └── main.py          # Application entry point
│   └── requirements.txt     # Python dependencies
├── docs/                    # Documentation
├── .github/                 # GitHub workflows
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **OpenAI API Key**

### 1. Clone the Repository

```bash
git clone https://github.com/AdminVitaAI/Vita.AI.git
cd Vita.AI
```

### 2. Setup Backend

```bash
cd backend
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY="your-openai-api-key"
export OPENAI_API_BASE="https://api.openai.com/v1"

# Run the Flask server
python src/main.py
```

The backend will be available at `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_API_BASE=https://api.openai.com/v1
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
```

### Database Setup

The application uses SQLite by default. The database will be created automatically when you first run the backend.

For production, you can configure PostgreSQL or MySQL by updating the `SQLALCHEMY_DATABASE_URI` in `backend/src/main.py`.

## 📱 Features Overview

### 🍎 Smart Food Analysis
- Type food descriptions in Arabic or English
- Get instant calorie and nutrition information
- AI-powered portion estimation

### 📊 Nutrition Tracking
- Track daily calories, protein, carbs, and fats
- Visual progress indicators
- Weekly and monthly reports

### 🔍 Barcode Scanning
- Scan product barcodes for instant nutrition data
- Supports thousands of products via Open Food Facts
- Automatic portion calculation

### 📸 Food Image Recognition
- Take photos of your meals
- AI identifies food items and estimates portions
- Batch analysis for complex meals

### 👤 User Management
- Secure user registration and authentication
- Personalized health goals
- Progress tracking and analytics

## 🌐 API Documentation

### Authentication Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile

### Food Analysis Endpoints
- `POST /api/ai/analyze-food` - Analyze food by description
- `POST /api/camera/analyze-food` - Analyze food from image
- `POST /api/barcode/scan` - Get nutrition from barcode

### Meal Management
- `GET /api/meals` - Get user meals
- `POST /api/meals` - Add new meal
- `DELETE /api/meals/:id` - Delete meal

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder to your hosting provider

### Backend Deployment (Railway/Heroku)

1. Set environment variables on your hosting platform
2. Deploy the `backend` folder
3. Ensure the database is properly configured

### Full-Stack Deployment

The application can be deployed as a single unit by serving the frontend from the Flask backend. The built frontend files should be placed in `backend/src/static/`.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing powerful AI models
- **Open Food Facts** for the comprehensive food database
- **React** and **Flask** communities for excellent frameworks
- All contributors and users who make this project possible

## 📞 Support

- **Website**: [vita-ai.app](https://vita-ai.app)
- **Email**: support@vita-ai.app
- **Issues**: [GitHub Issues](https://github.com/AdminVitaAI/Vita.AI/issues)

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] Meal planning and recipes
- [ ] Social features and challenges
- [ ] Integration with fitness trackers
- [ ] Multi-language support
- [ ] Advanced analytics and insights

---

<div align="center">
  Made with ❤️ by the Vita.AI Team
  
  ⭐ Star us on GitHub if you find this project useful!
</div>

