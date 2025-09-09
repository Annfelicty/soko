export class TrustScoreCalculator {
  constructor() {
    this.scoreFactors = {
      transactionConsistency: 0.25,
      fraudAvoidance: 0.20,
      savingsHabits: 0.20,
      communityParticipation: 0.15,
      accountAge: 0.10,
      verificationLevel: 0.10
    };
    
    this.baseScore = 300;
    this.maxScore = 850;
  }

  calculateTrustScore(userId, userData) {
    let score = this.baseScore;
    
    // Transaction Consistency (25%)
    const consistencyScore = this.calculateConsistencyScore(userData.transactions);
    score += consistencyScore * this.scoreFactors.transactionConsistency * 100;
    
    // Fraud Avoidance (20%)
    const fraudScore = this.calculateFraudAvoidanceScore(userData.fraudAlerts);
    score += fraudScore * this.scoreFactors.fraudAvoidance * 100;
    
    // Savings Habits (20%)
    const savingsScore = this.calculateSavingsScore(userData.savings);
    score += savingsScore * this.scoreFactors.savingsHabits * 100;
    
    // Community Participation (15%)
    const communityScore = this.calculateCommunityScore(userData.chamaActivity);
    score += communityScore * this.scoreFactors.communityParticipation * 100;
    
    // Account Age (10%)
    const ageScore = this.calculateAccountAgeScore(userData.accountAge);
    score += ageScore * this.scoreFactors.accountAge * 100;
    
    // Verification Level (10%)
    const verificationScore = this.calculateVerificationScore(userData.verifications);
    score += verificationScore * this.scoreFactors.verificationLevel * 100;
    
    return Math.min(Math.max(Math.round(score), this.baseScore), this.maxScore);
  }

  calculateConsistencyScore(transactions) {
    if (!transactions || transactions.length < 5) return 0.3;
    
    const monthlyTotals = this.groupTransactionsByMonth(transactions);
    const months = Object.keys(monthlyTotals);
    
    if (months.length < 2) return 0.4;
    
    // Calculate coefficient of variation (lower is better for consistency)
    const values = Object.values(monthlyTotals);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const cv = Math.sqrt(variance) / mean;
    
    // Convert to score (0-1, where 1 is most consistent)
    return Math.max(0, 1 - (cv / 2));
  }

  calculateFraudAvoidanceScore(fraudAlerts) {
    if (!fraudAlerts || fraudAlerts.length === 0) return 1.0;
    
    const recentAlerts = fraudAlerts.filter(alert => {
      const alertDate = new Date(alert.created_at);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return alertDate > threeMonthsAgo;
    });
    
    const scamAlerts = recentAlerts.filter(alert => alert.risk_level === 'scam');
    const fallenForScams = recentAlerts.filter(alert => 
      alert.risk_level === 'scam' && alert.status === 'ignored'
    );
    
    // Penalty for falling for scams, bonus for avoiding them
    if (fallenForScams.length > 0) {
      return Math.max(0, 0.8 - (fallenForScams.length * 0.2));
    } else if (scamAlerts.length > 0) {
      return 1.0; // Bonus for successfully avoiding scams
    }
    
    return 0.9; // Neutral score for no recent fraud activity
  }

  calculateSavingsScore(savingsData) {
    if (!savingsData) return 0.2;
    
    const { totalSaved, savingsGoals, monthlyContributions } = savingsData;
    
    let score = 0;
    
    // Regular savings habit (40% of savings score)
    if (monthlyContributions && monthlyContributions.length >= 3) {
      const consistentMonths = monthlyContributions.filter(month => month.amount > 0).length;
      score += (consistentMonths / monthlyContributions.length) * 0.4;
    }
    
    // Goal achievement (40% of savings score)
    if (savingsGoals && savingsGoals.length > 0) {
      const achievedGoals = savingsGoals.filter(goal => goal.achieved).length;
      score += (achievedGoals / savingsGoals.length) * 0.4;
    }
    
    // Total savings amount (20% of savings score)
    if (totalSaved > 0) {
      score += Math.min(0.2, totalSaved / 50000); // Max score at KSh 50,000
    }
    
    return Math.min(score, 1.0);
  }

  calculateCommunityScore(chamaActivity) {
    if (!chamaActivity) return 0.1;
    
    const { chamasJoined, totalContributions, leadershipRoles, helpedMembers } = chamaActivity;
    
    let score = 0;
    
    // Active participation in chamas (50%)
    if (chamasJoined > 0) {
      score += Math.min(0.5, chamasJoined * 0.2);
    }
    
    // Regular contributions (30%)
    if (totalContributions > 0) {
      score += Math.min(0.3, totalContributions / 100000); // Max at KSh 100,000
    }
    
    // Leadership and helping others (20%)
    if (leadershipRoles > 0) score += 0.1;
    if (helpedMembers > 0) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  calculateAccountAgeScore(accountAge) {
    if (!accountAge) return 0;
    
    const ageInMonths = accountAge / (30 * 24 * 60 * 60 * 1000); // Convert to months
    
    // Score increases with age, maxing out at 12 months
    return Math.min(1.0, ageInMonths / 12);
  }

  calculateVerificationScore(verifications) {
    if (!verifications) return 0;
    
    let score = 0;
    
    if (verifications.phoneVerified) score += 0.3;
    if (verifications.emailVerified) score += 0.2;
    if (verifications.idVerified) score += 0.3;
    if (verifications.businessVerified) score += 0.2;
    
    return score;
  }

  updateScore(userId, activity, value) {
    // This would be called when specific activities occur
    const updates = {
      transaction: () => this.handleTransactionUpdate(userId, value),
      fraudReport: () => this.handleFraudReportUpdate(userId, value),
      savingsGoal: () => this.handleSavingsGoalUpdate(userId, value),
      chamaJoin: () => this.handleChamaJoinUpdate(userId, value)
    };
    
    if (updates[activity]) {
      return updates[activity]();
    }
    
    return { success: false, message: 'Unknown activity type' };
  }

  handleTransactionUpdate(userId, amount) {
    // Immediate small boost for regular transactions
    const boost = Math.min(2, amount / 1000); // Max 2 points per transaction
    
    return {
      success: true,
      scoreChange: boost,
      message: `Trust score increased by ${boost} points for transaction activity`
    };
  }

  handleFraudReportUpdate(userId, reportData) {
    const { wasScam, userAction } = reportData;
    
    let scoreChange = 0;
    let message = '';
    
    if (wasScam && userAction === 'avoided') {
      scoreChange = 5;
      message = 'Trust score increased for avoiding fraud';
    } else if (wasScam && userAction === 'fell_for') {
      scoreChange = -10;
      message = 'Trust score decreased for falling for fraud';
    } else if (!wasScam && userAction === 'reported') {
      scoreChange = 2;
      message = 'Trust score increased for helping community safety';
    }
    
    return {
      success: true,
      scoreChange,
      message
    };
  }

  handleSavingsGoalUpdate(userId, goalData) {
    const { achieved, amount } = goalData;
    
    if (achieved) {
      const boost = Math.min(10, amount / 5000); // Max 10 points
      return {
        success: true,
        scoreChange: boost,
        message: `Trust score increased by ${boost} points for achieving savings goal`
      };
    }
    
    return { success: true, scoreChange: 0, message: 'Savings goal noted' };
  }

  handleChamaJoinUpdate(userId, chamaData) {
    return {
      success: true,
      scoreChange: 3,
      message: 'Trust score increased for joining community savings group'
    };
  }

  getScoreBreakdown(userId, userData) {
    const breakdown = {};
    
    breakdown.transactionConsistency = {
      score: this.calculateConsistencyScore(userData.transactions),
      weight: this.scoreFactors.transactionConsistency,
      description: 'Regular and consistent transaction patterns'
    };
    
    breakdown.fraudAvoidance = {
      score: this.calculateFraudAvoidanceScore(userData.fraudAlerts),
      weight: this.scoreFactors.fraudAvoidance,
      description: 'Successfully avoiding and reporting fraud'
    };
    
    breakdown.savingsHabits = {
      score: this.calculateSavingsScore(userData.savings),
      weight: this.scoreFactors.savingsHabits,
      description: 'Regular savings and goal achievement'
    };
    
    breakdown.communityParticipation = {
      score: this.calculateCommunityScore(userData.chamaActivity),
      weight: this.scoreFactors.communityParticipation,
      description: 'Active participation in community savings'
    };
    
    breakdown.accountAge = {
      score: this.calculateAccountAgeScore(userData.accountAge),
      weight: this.scoreFactors.accountAge,
      description: 'Length of time using TajiriCircle'
    };
    
    breakdown.verificationLevel = {
      score: this.calculateVerificationScore(userData.verifications),
      weight: this.scoreFactors.verificationLevel,
      description: 'Identity and business verification status'
    };
    
    return breakdown;
  }

  groupTransactionsByMonth(transactions) {
    const monthly = {};
    
    transactions.forEach(tx => {
      const month = new Date(tx.created_at).toISOString().substr(0, 7);
      if (!monthly[month]) {
        monthly[month] = 0;
      }
      monthly[month] += Math.abs(tx.amount);
    });
    
    return monthly;
  }
}
