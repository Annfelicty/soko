export class USSDService {
  constructor() {
    this.sessions = new Map();
    this.menuStructure = {
      main: {
        text: "Welcome to TajiriCircle\n1. Log Sales\n2. Check Balance\n3. Savings Goals\n4. Fraud Alerts\n5. Trust Score\n6. Help",
        options: {
          '1': 'log_sales',
          '2': 'check_balance', 
          '3': 'savings',
          '4': 'fraud_alerts',
          '5': 'trust_score',
          '6': 'help'
        }
      },
      log_sales: {
        text: "Log Sales\n1. Quick Sale (KSh 100)\n2. Custom Amount\n3. View Today's Sales\n0. Back",
        options: {
          '1': 'quick_sale_100',
          '2': 'custom_amount',
          '3': 'view_sales',
          '0': 'main'
        }
      },
      check_balance: {
        text: "Your Balance: KSh 2,450\nToday's Income: KSh 800\nThis Week: KSh 3,200\n0. Back to Menu",
        options: {
          '0': 'main'
        }
      },
      savings: {
        text: "Savings Goals\n1. Add to Savings\n2. Set New Goal\n3. View Progress\n0. Back",
        options: {
          '1': 'add_savings',
          '2': 'set_goal',
          '3': 'view_progress',
          '0': 'main'
        }
      },
      fraud_alerts: {
        text: "Fraud Protection\n2 new alerts detected!\n1. View Alerts\n2. Report Scam\n0. Back",
        options: {
          '1': 'view_alerts',
          '2': 'report_scam',
          '0': 'main'
        }
      },
      trust_score: {
        text: "Your Trust Score: 85/100\nRating: Excellent\nNext milestone: 90\n0. Back to Menu",
        options: {
          '0': 'main'
        }
      },
      help: {
        text: "TajiriCircle Help\n1. How to use\n2. Contact Support\n3. SMS Commands\n0. Back",
        options: {
          '1': 'how_to_use',
          '2': 'contact_support',
          '3': 'sms_commands',
          '0': 'main'
        }
      }
    };
  }

  handleUSSDRequest(text, phoneNumber) {
    const sessionId = this.getOrCreateSession(phoneNumber);
    const session = this.sessions.get(sessionId);
    
    if (text === '') {
      // Initial USSD request
      session.currentMenu = 'main';
      return this.formatResponse(this.menuStructure.main.text, false);
    }
    
    const input = text.split('*').pop();
    const currentMenu = this.menuStructure[session.currentMenu];
    
    if (!currentMenu) {
      return this.formatResponse("Service error. Please try again.", true);
    }
    
    // Handle menu navigation
    if (currentMenu.options && currentMenu.options[input]) {
      const nextMenu = currentMenu.options[input];
      
      // Handle special actions
      switch (nextMenu) {
        case 'quick_sale_100':
          this.logSale(phoneNumber, 100, 'Quick sale');
          return this.formatResponse("Sale of KSh 100 logged successfully!\nYour new balance: KSh 2,550\n0. Back to Menu", false);
          
        case 'custom_amount':
          session.currentMenu = 'custom_amount_input';
          return this.formatResponse("Enter sale amount (KSh):", false);
          
        case 'add_savings':
          session.currentMenu = 'savings_amount_input';
          return this.formatResponse("Enter amount to save (KSh):", false);
          
        case 'view_alerts':
          return this.formatResponse("Recent Alerts:\n1. Scam SMS from +254700123456\n2. Suspicious call detected\nBoth blocked automatically.\n0. Back", false);
          
        case 'report_scam':
          session.currentMenu = 'report_scam_input';
          return this.formatResponse("Forward the scam message to 40404 or describe the incident:", false);
          
        case 'how_to_use':
          return this.formatResponse("Dial *384# anytime to:\n- Log sales instantly\n- Check your balance\n- Save money\n- Get fraud alerts\n0. Back", false);
          
        case 'contact_support':
          return this.formatResponse("TajiriCircle Support:\nWhatsApp: +254700000000\nEmail: help@tajiricircle.com\nCall: 0800-TAJIRI\n0. Back", false);
          
        case 'sms_commands':
          return this.formatResponse("SMS Commands:\nSend 'BAL' to 40404 for balance\nSend 'SAVE 500' to save KSh 500\nSend 'HELP' for assistance\n0. Back", false);
          
        default:
          if (this.menuStructure[nextMenu]) {
            session.currentMenu = nextMenu;
            return this.formatResponse(this.menuStructure[nextMenu].text, false);
          }
      }
    }
    
    // Handle input states
    if (session.currentMenu === 'custom_amount_input') {
      const amount = parseInt(input);
      if (amount && amount > 0) {
        this.logSale(phoneNumber, amount, 'Custom sale');
        session.currentMenu = 'main';
        return this.formatResponse(`Sale of KSh ${amount} logged successfully!\nYour new balance: KSh ${2450 + amount}\n0. Back to Menu`, false);
      } else {
        return this.formatResponse("Invalid amount. Please enter a valid number:", false);
      }
    }
    
    if (session.currentMenu === 'savings_amount_input') {
      const amount = parseInt(input);
      if (amount && amount > 0) {
        this.addToSavings(phoneNumber, amount);
        session.currentMenu = 'main';
        return this.formatResponse(`KSh ${amount} added to savings!\nTotal savings: KSh ${16800 + amount}\n0. Back to Menu`, false);
      } else {
        return this.formatResponse("Invalid amount. Please enter a valid number:", false);
      }
    }
    
    if (session.currentMenu === 'report_scam_input') {
      this.reportScam(phoneNumber, input);
      session.currentMenu = 'main';
      return this.formatResponse("Thank you for reporting! This helps protect our community.\n0. Back to Menu", false);
    }
    
    // Invalid input
    return this.formatResponse("Invalid option. Please try again.\n" + currentMenu.text, false);
  }

  getOrCreateSession(phoneNumber) {
    const sessionId = `ussd_${phoneNumber}_${Date.now()}`;
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        phoneNumber,
        currentMenu: 'main',
        startTime: new Date(),
        data: {}
      });
    }
    return sessionId;
  }

  formatResponse(text, end = false) {
    return end ? `END ${text}` : `CON ${text}`;
  }

  logSale(phoneNumber, amount, description) {
    // This would integrate with the main database
    console.log(`Sale logged: ${phoneNumber} - KSh ${amount} - ${description}`);
    
    // In a real implementation, this would:
    // 1. Store in database
    // 2. Update user balance
    // 3. Update trust score
    // 4. Generate receipt
    
    return {
      success: true,
      amount,
      timestamp: new Date().toISOString(),
      reference: `TJ${Date.now().toString().slice(-6)}`
    };
  }

  addToSavings(phoneNumber, amount) {
    console.log(`Savings added: ${phoneNumber} - KSh ${amount}`);
    
    // In a real implementation, this would:
    // 1. Update savings balance
    // 2. Check if goal reached
    // 3. Send confirmation SMS
    // 4. Update trust score
    
    return {
      success: true,
      amount,
      newTotal: 16800 + amount
    };
  }

  reportScam(phoneNumber, details) {
    console.log(`Scam reported by ${phoneNumber}: ${details}`);
    
    // In a real implementation, this would:
    // 1. Store report in fraud database
    // 2. Analyze for patterns
    // 3. Alert other users if needed
    // 4. Update community protection
    
    return {
      success: true,
      reportId: `RPT${Date.now().toString().slice(-6)}`
    };
  }

  // Clean up old sessions (run periodically)
  cleanupSessions() {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      const sessionAge = now - session.startTime;
      if (sessionAge > 300000) { // 5 minutes
        this.sessions.delete(sessionId);
      }
    }
  }

  // Get user's recent activity for personalized menus
  getPersonalizedMenu(phoneNumber) {
    // This would query the database for user's recent activity
    // and customize the menu accordingly
    
    return this.menuStructure.main;
  }

  // Handle bulk USSD operations
  handleBulkOperation(phoneNumbers, operation) {
    const results = [];
    
    for (const phoneNumber of phoneNumbers) {
      try {
        const result = this.handleUSSDRequest('', phoneNumber);
        results.push({ phoneNumber, success: true, result });
      } catch (error) {
        results.push({ phoneNumber, success: false, error: error.message });
      }
    }
    
    return results;
  }
}
