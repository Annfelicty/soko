import natural from 'natural';

export class SMSParser {
  constructor() {
    this.mpesaPatterns = [
      /confirmed\.?\s*you\s*have\s*received\s*ksh?\s*([\d,]+\.?\d*)/i,
      /confirmed\.?\s*ksh?\s*([\d,]+\.?\d*)\s*sent\s*to/i,
      /confirmed\.?\s*ksh?\s*([\d,]+\.?\d*)\s*paid\s*to/i,
      /balance\s*is\s*ksh?\s*([\d,]+\.?\d*)/i,
      /new\s*m-pesa\s*balance\s*is\s*ksh?\s*([\d,]+\.?\d*)/i
    ];
    
    this.transactionTypes = {
      received: ['received', 'from', 'sent by'],
      sent: ['sent to', 'paid to', 'transferred to'],
      withdrawal: ['withdraw', 'cash withdrawal'],
      deposit: ['deposit', 'top up', 'airtime']
    };
  }

  async parseTransaction(smsContent) {
    try {
      const cleanSMS = smsContent.toLowerCase().trim();
      
      // Extract amount
      const amount = this.extractAmount(cleanSMS);
      if (!amount) return null;

      // Determine transaction type
      const type = this.determineTransactionType(cleanSMS);
      
      // Extract sender/recipient
      const party = this.extractParty(cleanSMS);
      
      // Extract reference/transaction ID
      const reference = this.extractReference(cleanSMS);
      
      // Generate description
      const description = this.generateDescription(cleanSMS, type, party, amount);

      return {
        amount: parseFloat(amount.replace(/,/g, '')),
        type: type,
        party: party,
        reference: reference,
        description: description,
        timestamp: new Date().toISOString(),
        source: 'sms_parsed'
      };
    } catch (error) {
      console.error('SMS parsing error:', error);
      return null;
    }
  }

  extractAmount(sms) {
    for (const pattern of this.mpesaPatterns) {
      const match = sms.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Fallback pattern for any KSh amount
    const fallbackMatch = sms.match(/ksh?\s*([\d,]+\.?\d*)/i);
    return fallbackMatch ? fallbackMatch[1] : null;
  }

  determineTransactionType(sms) {
    for (const [type, keywords] of Object.entries(this.transactionTypes)) {
      for (const keyword of keywords) {
        if (sms.includes(keyword)) {
          return type === 'received' ? 'credit' : 'debit';
        }
      }
    }
    
    // Default based on common M-Pesa language
    if (sms.includes('received') || sms.includes('from')) {
      return 'credit';
    } else if (sms.includes('sent') || sms.includes('paid')) {
      return 'debit';
    }
    
    return 'unknown';
  }

  extractParty(sms) {
    // Extract names (capitalized words that aren't M-PESA, KSh, etc.)
    const namePattern = /(?:from|to|by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i;
    const match = sms.match(namePattern);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    // Extract phone numbers
    const phonePattern = /(\+?254\d{9}|\d{10})/;
    const phoneMatch = sms.match(phonePattern);
    
    return phoneMatch ? phoneMatch[1] : 'Unknown';
  }

  extractReference(sms) {
    // M-Pesa transaction codes are usually 10 characters
    const refPattern = /([A-Z0-9]{10})/;
    const match = sms.match(refPattern);
    
    return match ? match[1] : null;
  }

  generateDescription(sms, type, party, amount) {
    if (type === 'credit') {
      return `Payment received from ${party}`;
    } else if (type === 'debit') {
      if (sms.includes('airtime')) {
        return 'Airtime purchase';
      } else if (sms.includes('withdraw')) {
        return 'Cash withdrawal';
      } else {
        return `Payment sent to ${party}`;
      }
    }
    
    return 'Transaction processed';
  }

  // Parse business sales from various SMS formats
  parseSalesData(sms) {
    const salesKeywords = ['sale', 'sold', 'payment for', 'business'];
    const hasSalesKeyword = salesKeywords.some(keyword => 
      sms.toLowerCase().includes(keyword)
    );
    
    if (hasSalesKeyword) {
      const amount = this.extractAmount(sms);
      if (amount) {
        return {
          type: 'business_sale',
          amount: parseFloat(amount.replace(/,/g, '')),
          category: this.categorizeBusinessSale(sms),
          timestamp: new Date().toISOString()
        };
      }
    }
    
    return null;
  }

  categorizeBusinessSale(sms) {
    const categories = {
      'airtime': ['airtime', 'credit', 'bundles'],
      'retail': ['shop', 'store', 'goods'],
      'services': ['service', 'repair', 'consultation'],
      'food': ['food', 'restaurant', 'meal']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => sms.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }
}
