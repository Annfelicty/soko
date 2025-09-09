import natural from 'natural';

export class FraudDetector {
  constructor() {
    this.scamPatterns = [
      // Prize/lottery scams
      /congratulations.*won.*ksh?\s*[\d,]+/i,
      /you.*have.*won.*prize/i,
      /lottery.*winner/i,
      /claim.*prize.*fee/i,
      
      // Fake bank alerts
      /account.*will.*be.*closed/i,
      /verify.*account.*immediately/i,
      /suspended.*account/i,
      /click.*link.*verify/i,
      
      // PIN/password requests
      /send.*pin/i,
      /share.*password/i,
      /confirm.*pin/i,
      /enter.*secret/i,
      
      // Urgent money requests
      /urgent.*send.*money/i,
      /emergency.*cash/i,
      /help.*need.*money/i,
      /send.*ksh.*immediately/i,
      
      // Fake loan offers
      /instant.*loan.*approved/i,
      /loan.*without.*collateral/i,
      /quick.*cash.*loan/i,
      /processing.*fee.*required/i
    ];
    
    this.suspiciousKeywords = [
      'processing fee', 'activation fee', 'click link', 'bit.ly',
      'tinyurl', 'urgent', 'congratulations', 'winner', 'prize',
      'verify account', 'suspended', 'expired', 'claim now',
      'send pin', 'share password', 'confirm details'
    ];
    
    this.safePatterns = [
      /confirmed.*ksh.*received/i,
      /m-pesa.*transaction/i,
      /balance.*is.*ksh/i,
      /airtime.*purchase/i,
      /bill.*payment/i
    ];
    
    this.trustedSenders = [
      'MPESA', 'M-PESA', 'SAFARICOM', 'AIRTEL', 'EQUITEL',
      'KCBMPESA', 'COOPBANK', 'ABSA', 'STANDARDBANK'
    ];
  }

  async analyzeSMS(smsContent, sender) {
    try {
      const analysis = {
        riskLevel: 'safe',
        confidence: 0,
        reasons: [],
        recommendations: []
      };

      const cleanSMS = smsContent.toLowerCase().trim();
      const cleanSender = sender.toUpperCase().trim();

      // Check if sender is trusted
      if (this.isTrustedSender(cleanSender)) {
        // Even trusted senders can be spoofed, so still check content
        if (this.containsSafePatterns(cleanSMS)) {
          analysis.confidence = 95;
          analysis.reasons.push('Trusted sender with legitimate transaction pattern');
          return analysis;
        }
      }

      // Check for obvious scam patterns
      const scamScore = this.calculateScamScore(cleanSMS);
      
      if (scamScore >= 80) {
        analysis.riskLevel = 'scam';
        analysis.confidence = scamScore;
        analysis.reasons.push('High probability scam detected');
        analysis.recommendations.push('Do not respond or click any links');
        analysis.recommendations.push('Block this sender immediately');
      } else if (scamScore >= 50) {
        analysis.riskLevel = 'suspicious';
        analysis.confidence = scamScore;
        analysis.reasons.push('Suspicious patterns detected');
        analysis.recommendations.push('Verify sender through official channels');
        analysis.recommendations.push('Do not share personal information');
      } else {
        analysis.confidence = 100 - scamScore;
      }

      // Additional checks for unknown senders
      if (!this.isTrustedSender(cleanSender)) {
        if (this.containsMoneyRequest(cleanSMS)) {
          analysis.riskLevel = 'suspicious';
          analysis.confidence = Math.max(analysis.confidence, 70);
          analysis.reasons.push('Money request from unknown sender');
        }
      }

      return analysis;
      
    } catch (error) {
      console.error('Fraud detection error:', error);
      return {
        riskLevel: 'unknown',
        confidence: 0,
        reasons: ['Analysis failed'],
        recommendations: ['Manual review required']
      };
    }
  }

  calculateScamScore(sms) {
    let score = 0;
    
    // Check scam patterns (high weight)
    for (const pattern of this.scamPatterns) {
      if (pattern.test(sms)) {
        score += 30;
      }
    }
    
    // Check suspicious keywords (medium weight)
    for (const keyword of this.suspiciousKeywords) {
      if (sms.includes(keyword.toLowerCase())) {
        score += 15;
      }
    }
    
    // Check for URLs (suspicious in financial SMS)
    if (/https?:\/\/|www\.|\.com|\.co\.ke|bit\.ly/i.test(sms)) {
      score += 25;
    }
    
    // Check for urgent language
    if (/urgent|immediate|asap|now|today|expire/i.test(sms)) {
      score += 10;
    }
    
    // Check for poor grammar/spelling (common in scams)
    const grammarScore = this.assessGrammar(sms);
    score += grammarScore;
    
    return Math.min(score, 100);
  }

  assessGrammar(sms) {
    let grammarIssues = 0;
    
    // Check for excessive caps
    const capsRatio = (sms.match(/[A-Z]/g) || []).length / sms.length;
    if (capsRatio > 0.3) grammarIssues += 10;
    
    // Check for multiple exclamation marks
    if (/!{2,}/.test(sms)) grammarIssues += 5;
    
    // Check for common misspellings in scams
    const misspellings = ['recieve', 'congradulations', 'wining', 'proces'];
    for (const word of misspellings) {
      if (sms.includes(word)) grammarIssues += 10;
    }
    
    return Math.min(grammarIssues, 25);
  }

  isTrustedSender(sender) {
    return this.trustedSenders.some(trusted => 
      sender.includes(trusted) || trusted.includes(sender)
    );
  }

  containsSafePatterns(sms) {
    return this.safePatterns.some(pattern => pattern.test(sms));
  }

  containsMoneyRequest(sms) {
    const moneyRequestPatterns = [
      /send.*ksh/i,
      /need.*money/i,
      /lend.*me/i,
      /borrow.*cash/i
    ];
    
    return moneyRequestPatterns.some(pattern => pattern.test(sms));
  }

  // Analyze call patterns for fraud
  analyzeCall(callerNumber, duration, userReported = false) {
    const analysis = {
      riskLevel: 'safe',
      confidence: 0,
      reasons: []
    };

    // Short calls requesting sensitive info are suspicious
    if (duration < 60 && userReported) {
      analysis.riskLevel = 'suspicious';
      analysis.confidence = 75;
      analysis.reasons.push('Short call with user reporting suspicious activity');
    }

    // Check against known scam number patterns
    if (this.isKnownScamPattern(callerNumber)) {
      analysis.riskLevel = 'scam';
      analysis.confidence = 90;
      analysis.reasons.push('Number matches known scam patterns');
    }

    return analysis;
  }

  isKnownScamPattern(number) {
    // Common scam number patterns in Kenya
    const scamPatterns = [
      /^\+254[17]\d{8}$/, // Some premium rate numbers
      /^07[0-9]{8}$/ // Some patterns used by scammers
    ];
    
    // This would be enhanced with a real database of reported numbers
    return false; // Placeholder
  }

  // Community-based fraud detection
  reportFraud(userId, fraudType, details) {
    // This would integrate with a community reporting system
    return {
      reportId: Date.now().toString(),
      status: 'reported',
      message: 'Thank you for reporting. This helps protect the community.'
    };
  }
}
