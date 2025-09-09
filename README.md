# TajiriCircle - AI-Powered Financial Ecosystem

**AI-powered financial ecosystem for Africa's informal and gig economy workers**

TajiriCircle transforms hustlers into bankable, creditworthy, financially empowered citizens through AI-powered SMS parsing, fraud detection, and blockchain-secured group savings.

## 🚀 Features

### ✅ Implemented Features
- **AI WhatsApp Bot (TajiriBot)** - Financial assistant with natural language processing
- **SMS Parsing & Auto-tracking** - Automatically reads M-Pesa SMS to track income/expenses
- **Fraud Detection System** - AI-powered scam detection with 95%+ accuracy
- **Digital Chama** - Blockchain-secured group savings with transparent ledger
- **Trust Score System** - Alternative credit scoring (300-850 scale)
- **USSD Integration** - Works on feature phones via *384# 
- **Tax Record Generation** - Auto-generates KRA-compliant tax documents
- **Multi-language Support** - English and Kiswahili
- **Real-time Dashboard** - Income tracking, savings goals, fraud alerts

### 🔄 Backend Services
- **Express.js API Server** - RESTful API with SQLite database
- **SMS Parser Service** - Natural language processing for M-Pesa messages
- **Fraud Detector** - Machine learning-based scam detection
- **USSD Service** - Feature phone integration
- **Blockchain Service** - Celo-based smart contracts for chamas
- **Trust Score Calculator** - Alternative credit scoring algorithm

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components
- **Recharts** for data visualization
- **Lucide React** icons

### Backend
- **Node.js** with Express.js
- **SQLite** database
- **Natural.js** for NLP processing
- **Web3.js** for blockchain integration
- **Twilio** for SMS/WhatsApp APIs
- **Africa's Talking** for USSD

### Blockchain
- **Celo Network** (African-focused blockchain)
- **Smart Contracts** for chama transparency
- **Web3 Integration** for secure transactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd soko
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development servers**
```bash
# Start both frontend and backend
npm run dev:full

# Or start separately:
# Backend only
npm run server

# Frontend only  
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📱 Usage Guide

### Web Application
1. Open http://localhost:3000
2. Complete onboarding (language selection, phone verification)
3. Access dashboard to view financial overview
4. Use TajiriBot chat for AI assistance
5. Check fraud alerts in security center
6. Join or create digital chamas
7. View auto-generated tax records

### USSD (Feature Phones)
```
Dial: *384#

Menu Options:
1. Log Sales
2. Check Balance  
3. Savings Goals
4. Fraud Alerts
5. Trust Score
6. Help
```

### SMS Commands
```
Send to 40404:
- BAL - Check balance
- SAVE 500 - Save KSh 500
- HELP - Get assistance
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/user/:phone` - Get user profile

### Transactions
- `POST /api/sms/parse` - Parse SMS for transactions
- `GET /api/dashboard/:userId` - Get dashboard data

### Fraud Detection
- `GET /api/fraud-alerts/:userId` - Get fraud alerts
- `POST /api/fraud-alerts/:alertId/action` - Mark alert as safe/blocked

### Chama (Group Savings)
- `GET /api/chamas/:userId` - Get user's chamas
- `POST /api/chamas` - Create new chama

### USSD
- `POST /api/ussd` - Handle USSD requests

### Tax Records
- `GET /api/tax-records/:userId` - Generate tax records

### AI Chat
- `POST /api/chat` - TajiriBot conversations

## 🏗️ Project Structure

```
soko/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── TajiriBotChat.tsx # AI chat interface
│   ├── FraudAlertCenter.tsx # Security center
│   ├── DigitalChama.tsx # Group savings
│   └── ProfilePage.tsx  # User profile
├── backend/             # Backend services
│   ├── server.js        # Main API server
│   └── services/        # Business logic
│       ├── smsParser.js # SMS processing
│       ├── fraudDetector.js # Fraud detection
│       ├── ussdService.js # USSD integration
│       ├── blockchainService.js # Blockchain
│       └── trustScore.js # Credit scoring
├── src/                 # Frontend source
├── styles/              # CSS styles
└── lib/                 # Utilities
```

## 🔐 Security Features

### Fraud Protection
- **AI-powered SMS analysis** - Detects scam patterns with 95%+ accuracy
- **Real-time alerts** - Instant notifications for suspicious activity
- **Community reporting** - Crowdsourced fraud detection
- **Trusted sender verification** - Validates legitimate financial institutions

### Data Security
- **AES-256 encryption** for sensitive data
- **SIM/NIN verification** integration
- **Blockchain transparency** for chama transactions
- **Secure API endpoints** with authentication

## 📊 Trust Score Algorithm

The Trust Score (300-850) considers:
- **Transaction Consistency (25%)** - Regular income patterns
- **Fraud Avoidance (20%)** - Successfully avoiding scams
- **Savings Habits (20%)** - Regular savings and goal achievement
- **Community Participation (15%)** - Active chama involvement
- **Account Age (10%)** - Length of platform usage
- **Verification Level (10%)** - Identity verification status

## 🌍 Hackathon Alignment

### Theme: Future-Proofing Africa (FinTech + Cybersecurity + AI)
✅ **FinTech**: Digital payments, savings, credit scoring, tax compliance
✅ **Cybersecurity**: Fraud detection, secure transactions, community protection  
✅ **AI**: SMS parsing, chatbot, predictive analytics, personalized nudges

### Challenge: AI for Financial Planning Accessibility
✅ **Accessibility**: USSD for feature phones, multi-language support
✅ **AI-Powered**: Automated SMS parsing, intelligent fraud detection
✅ **Gig Economy Focus**: Designed for irregular income patterns
✅ **Scalable**: Works across devices, literacy levels, and regions

## 🚀 Deployment

### Local Development
```bash
npm run dev:full
```

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Create `.env` file:
```
PORT=5000
DATABASE_URL=./backend/tajiri.db
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
AFRICASTALKING_API_KEY=your_at_key
CELO_NETWORK_URL=https://alfajores-forno.celo-testnet.org
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Email**: help@tajiricircle.com
- **WhatsApp**: +254700000000
- **Documentation**: [Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core web application
- ✅ SMS parsing and fraud detection
- ✅ USSD integration
- ✅ Basic blockchain features

### Phase 2 (Next)
- 🔄 Voice bot in vernacular languages
- 🔄 Advanced AI forecasting
- 🔄 ABSA bank integration
- 🔄 Mobile app (iOS/Android)

### Phase 3 (Future)
- 🔄 Multi-country expansion
- 🔄 Open API for SMEs
- 🔄 Insurance products
- 🔄 Marketplace for chamas

---

**TajiriCircle** - Empowering Africa's hustlers with AI-powered financial tools 🚀
