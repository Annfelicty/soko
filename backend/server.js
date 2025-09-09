import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SMSParser } from './services/smsParser.js';
import { FraudDetector } from './services/fraudDetector.js';
import { USSDService } from './services/ussdService.js';
import { BlockchainService } from './services/blockchainService.js';
import { TrustScoreCalculator } from './services/trustScore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
const db = new sqlite3.Database(join(__dirname, 'tajiri.db'));

// Initialize services
const smsParser = new SMSParser();
const fraudDetector = new FraudDetector();
const ussdService = new USSDService();
const blockchainService = new BlockchainService();
const trustScoreCalculator = new TrustScoreCalculator();

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE,
    name TEXT,
    email TEXT,
    trust_score INTEGER DEFAULT 300,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    type TEXT,
    description TEXT,
    source TEXT,
    sms_content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS fraud_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    sender TEXT,
    message TEXT,
    risk_level TEXT,
    ai_confidence REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS chama_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    total_savings REAL DEFAULT 0,
    monthly_target REAL,
    blockchain_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS chama_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chama_id INTEGER,
    user_id INTEGER,
    contribution REAL DEFAULT 0,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(chama_id) REFERENCES chama_groups(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

// API Routes

// User Authentication & Profile
app.post('/api/auth/register', (req, res) => {
  const { phone, name, email } = req.body;
  
  db.run('INSERT INTO users (phone, name, email) VALUES (?, ?, ?)', 
    [phone, name, email], 
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'User already exists or invalid data' });
      }
      res.json({ 
        success: true, 
        userId: this.lastID,
        message: 'User registered successfully' 
      });
    }
  );
});

app.get('/api/user/:phone', (req, res) => {
  const { phone } = req.params;
  
  db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// SMS Processing & Transaction Tracking
app.post('/api/sms/parse', async (req, res) => {
  const { smsContent, sender, userPhone } = req.body;
  
  try {
    // Parse SMS for transaction data
    const parsedData = await smsParser.parseTransaction(smsContent);
    
    if (parsedData) {
      // Get user ID
      db.get('SELECT id FROM users WHERE phone = ?', [userPhone], (err, user) => {
        if (user) {
          // Store transaction
          db.run(`INSERT INTO transactions 
            (user_id, amount, type, description, source, sms_content) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [user.id, parsedData.amount, parsedData.type, parsedData.description, sender, smsContent]
          );
          
          // Update trust score
          trustScoreCalculator.updateScore(user.id, 'transaction', parsedData.amount);
        }
      });
    }
    
    // Check for fraud
    const fraudResult = await fraudDetector.analyzeSMS(smsContent, sender);
    
    if (fraudResult.riskLevel !== 'safe') {
      // Store fraud alert
      db.get('SELECT id FROM users WHERE phone = ?', [userPhone], (err, user) => {
        if (user) {
          db.run(`INSERT INTO fraud_alerts 
            (user_id, sender, message, risk_level, ai_confidence) 
            VALUES (?, ?, ?, ?, ?)`,
            [user.id, sender, smsContent, fraudResult.riskLevel, fraudResult.confidence]
          );
        }
      });
    }
    
    res.json({
      transaction: parsedData,
      fraud: fraudResult,
      success: true
    });
    
  } catch (error) {
    res.status(500).json({ error: 'SMS processing failed', details: error.message });
  }
});

// Dashboard Data
app.get('/api/dashboard/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Get recent transactions
  db.all(`SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`, 
    [userId], (err, transactions) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Calculate totals
      const totalIncome = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      // Get trust score
      db.get('SELECT trust_score FROM users WHERE id = ?', [userId], (err, user) => {
        res.json({
          transactions,
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          trustScore: user ? user.trust_score : 300
        });
      });
    }
  );
});

// Fraud Alerts
app.get('/api/fraud-alerts/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(`SELECT * FROM fraud_alerts WHERE user_id = ? ORDER BY created_at DESC`, 
    [userId], (err, alerts) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(alerts);
    }
  );
});

app.post('/api/fraud-alerts/:alertId/action', (req, res) => {
  const { alertId } = req.params;
  const { action } = req.body; // 'block' or 'safe'
  
  const status = action === 'block' ? 'blocked' : 'reviewed';
  
  db.run('UPDATE fraud_alerts SET status = ? WHERE id = ?', [status, alertId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, message: `Alert marked as ${status}` });
  });
});

// USSD Integration
app.post('/api/ussd', (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  
  const response = ussdService.handleUSSDRequest(text, phoneNumber);
  
  res.set('Content-Type', 'text/plain');
  res.send(response);
});

// Chama (Group Savings)
app.get('/api/chamas/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(`SELECT c.*, cm.contribution 
    FROM chama_groups c 
    JOIN chama_members cm ON c.id = cm.chama_id 
    WHERE cm.user_id = ?`, [userId], (err, chamas) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(chamas);
    }
  );
});

app.post('/api/chamas', async (req, res) => {
  const { name, description, monthlyTarget, creatorId } = req.body;
  
  try {
    // Create blockchain address for the chama
    const blockchainAddress = await blockchainService.createChamaContract(name);
    
    db.run(`INSERT INTO chama_groups (name, description, monthly_target, blockchain_address) 
      VALUES (?, ?, ?, ?)`, 
      [name, description, monthlyTarget, blockchainAddress], 
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create chama' });
        }
        
        // Add creator as first member
        db.run(`INSERT INTO chama_members (chama_id, user_id) VALUES (?, ?)`, 
          [this.lastID, creatorId], (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to add creator to chama' });
            }
            
            res.json({ 
              success: true, 
              chamaId: this.lastID,
              blockchainAddress 
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Blockchain integration failed', details: error.message });
  }
});

// Tax Records Generation
app.get('/api/tax-records/:userId', (req, res) => {
  const { userId } = req.params;
  const { period } = req.query;
  
  db.all(`SELECT * FROM transactions WHERE user_id = ? 
    AND created_at >= date('now', '-3 months') 
    ORDER BY created_at DESC`, [userId], (err, transactions) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Generate tax summary
      const income = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      res.json({
        period: period || 'Q1 2024',
        totalIncome: income,
        totalExpenses: expenses,
        netIncome: income - expenses,
        transactions,
        generatedAt: new Date().toISOString()
      });
    }
  );
});

// TajiriBot Chat
app.post('/api/chat', async (req, res) => {
  const { message, userId } = req.body;
  
  try {
    // Simple AI response logic (can be enhanced with actual AI/ML)
    let response = '';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('balance') || lowerMessage.includes('money')) {
      // Get user's balance
      db.all(`SELECT * FROM transactions WHERE user_id = ?`, [userId], (err, transactions) => {
        const balance = transactions.reduce((sum, t) => {
          return sum + (t.type === 'credit' ? t.amount : -Math.abs(t.amount));
        }, 0);
        
        response = `Your current balance is KSh ${balance.toLocaleString()}. You've had ${transactions.length} transactions this month.`;
        res.json({ response, type: 'balance' });
      });
      return;
    }
    
    if (lowerMessage.includes('fraud') || lowerMessage.includes('scam')) {
      response = '🛡️ I\'m always monitoring for fraud! Share any suspicious messages and I\'ll analyze them instantly. Stay safe!';
    } else if (lowerMessage.includes('save') || lowerMessage.includes('goal')) {
      response = '💰 Great question about savings! I recommend the 50/30/20 rule. Would you like me to help set up a savings goal?';
    } else if (lowerMessage.includes('tax')) {
      response = '📋 I handle all your tax records automatically! I can generate KRA-compliant reports anytime. Want me to create your latest tax summary?';
    } else {
      response = 'I\'m here to help with money management, fraud detection, and tax records. What would you like assistance with?';
    }
    
    res.json({ response, type: 'general' });
    
  } catch (error) {
    res.status(500).json({ error: 'Chat processing failed', details: error.message });
  }
});

// Scheduled tasks
cron.schedule('0 9 * * *', () => {
  console.log('Running daily trust score updates...');
  // Update trust scores based on recent activity
});

cron.schedule('0 0 1 * *', () => {
  console.log('Generating monthly tax records...');
  // Auto-generate monthly tax records
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TajiriCircle Backend Server running on port ${PORT}`);
  console.log(`📱 SMS Parser: Active`);
  console.log(`🛡️ Fraud Detection: Active`);
  console.log(`📞 USSD Service: Active`);
  console.log(`⛓️ Blockchain Integration: Active`);
});

export default app;
