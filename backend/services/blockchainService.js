import { Web3 } from 'web3';

export class BlockchainService {
  constructor() {
    // Using Celo testnet for African-focused blockchain
    this.web3 = new Web3('https://alfajores-forno.celo-testnet.org');
    this.contractABI = [
      {
        "inputs": [{"name": "_name", "type": "string"}],
        "name": "createChama",
        "outputs": [{"name": "", "type": "address"}],
        "type": "function"
      },
      {
        "inputs": [{"name": "_amount", "type": "uint256"}],
        "name": "contribute",
        "outputs": [],
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getTotalContributions",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
      }
    ];
    
    this.chamaContracts = new Map();
  }

  async createChamaContract(chamaName) {
    try {
      // In a real implementation, this would deploy a smart contract
      // For now, we'll simulate with a mock address
      const mockAddress = `0x${this.generateMockAddress()}`;
      
      this.chamaContracts.set(chamaName, {
        address: mockAddress,
        name: chamaName,
        totalContributions: 0,
        members: [],
        transactions: [],
        createdAt: new Date().toISOString()
      });
      
      console.log(`Chama contract created: ${chamaName} at ${mockAddress}`);
      
      return mockAddress;
    } catch (error) {
      console.error('Blockchain contract creation failed:', error);
      throw new Error('Failed to create blockchain contract');
    }
  }

  async recordContribution(chamaAddress, userId, amount, transactionHash = null) {
    try {
      const chama = this.findChamaByAddress(chamaAddress);
      if (!chama) {
        throw new Error('Chama contract not found');
      }

      const contribution = {
        id: Date.now().toString(),
        userId,
        amount,
        timestamp: new Date().toISOString(),
        transactionHash: transactionHash || this.generateMockTxHash(),
        verified: true
      };

      chama.transactions.push(contribution);
      chama.totalContributions += amount;

      // Add member if not already present
      if (!chama.members.includes(userId)) {
        chama.members.push(userId);
      }

      console.log(`Contribution recorded: ${amount} from user ${userId}`);
      
      return {
        success: true,
        transactionHash: contribution.transactionHash,
        newTotal: chama.totalContributions
      };
    } catch (error) {
      console.error('Contribution recording failed:', error);
      throw error;
    }
  }

  async getContributionHistory(chamaAddress) {
    try {
      const chama = this.findChamaByAddress(chamaAddress);
      if (!chama) {
        throw new Error('Chama contract not found');
      }

      return {
        chamaName: chama.name,
        totalContributions: chama.totalContributions,
        memberCount: chama.members.length,
        transactions: chama.transactions.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        )
      };
    } catch (error) {
      console.error('Failed to get contribution history:', error);
      throw error;
    }
  }

  async verifyTransaction(transactionHash) {
    try {
      // In a real implementation, this would query the blockchain
      // For simulation, we'll check our local records
      
      for (const chama of this.chamaContracts.values()) {
        const transaction = chama.transactions.find(tx => 
          tx.transactionHash === transactionHash
        );
        
        if (transaction) {
          return {
            verified: true,
            amount: transaction.amount,
            timestamp: transaction.timestamp,
            chamaName: chama.name
          };
        }
      }
      
      return { verified: false, error: 'Transaction not found' };
    } catch (error) {
      console.error('Transaction verification failed:', error);
      return { verified: false, error: error.message };
    }
  }

  async getChamaBalance(chamaAddress) {
    try {
      const chama = this.findChamaByAddress(chamaAddress);
      if (!chama) {
        throw new Error('Chama contract not found');
      }

      return {
        totalBalance: chama.totalContributions,
        memberCount: chama.members.length,
        lastActivity: chama.transactions.length > 0 ? 
          chama.transactions[chama.transactions.length - 1].timestamp : 
          chama.createdAt
      };
    } catch (error) {
      console.error('Failed to get chama balance:', error);
      throw error;
    }
  }

  async distributeFunds(chamaAddress, distributions) {
    try {
      const chama = this.findChamaByAddress(chamaAddress);
      if (!chama) {
        throw new Error('Chama contract not found');
      }

      const totalDistribution = distributions.reduce((sum, dist) => sum + dist.amount, 0);
      
      if (totalDistribution > chama.totalContributions) {
        throw new Error('Insufficient funds for distribution');
      }

      const distributionTxs = distributions.map(dist => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'distribution',
        userId: dist.userId,
        amount: -dist.amount, // Negative for withdrawal
        timestamp: new Date().toISOString(),
        transactionHash: this.generateMockTxHash(),
        verified: true
      }));

      chama.transactions.push(...distributionTxs);
      chama.totalContributions -= totalDistribution;

      return {
        success: true,
        distributionTxs: distributionTxs.map(tx => tx.transactionHash),
        remainingBalance: chama.totalContributions
      };
    } catch (error) {
      console.error('Fund distribution failed:', error);
      throw error;
    }
  }

  // Utility methods
  findChamaByAddress(address) {
    for (const chama of this.chamaContracts.values()) {
      if (chama.address === address) {
        return chama;
      }
    }
    return null;
  }

  generateMockAddress() {
    return Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  generateMockTxHash() {
    return '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  // Analytics for chama performance
  async getChamaAnalytics(chamaAddress) {
    try {
      const chama = this.findChamaByAddress(chamaAddress);
      if (!chama) {
        throw new Error('Chama contract not found');
      }

      const contributions = chama.transactions.filter(tx => tx.amount > 0);
      const withdrawals = chama.transactions.filter(tx => tx.amount < 0);

      const monthlyContributions = this.groupTransactionsByMonth(contributions);
      const memberContributions = this.groupTransactionsByMember(contributions);

      return {
        totalContributions: chama.totalContributions,
        totalTransactions: chama.transactions.length,
        averageContribution: contributions.length > 0 ? 
          contributions.reduce((sum, tx) => sum + tx.amount, 0) / contributions.length : 0,
        monthlyTrends: monthlyContributions,
        memberPerformance: memberContributions,
        growthRate: this.calculateGrowthRate(contributions)
      };
    } catch (error) {
      console.error('Analytics calculation failed:', error);
      throw error;
    }
  }

  groupTransactionsByMonth(transactions) {
    const monthly = {};
    
    transactions.forEach(tx => {
      const month = new Date(tx.timestamp).toISOString().substr(0, 7);
      if (!monthly[month]) {
        monthly[month] = { total: 0, count: 0 };
      }
      monthly[month].total += tx.amount;
      monthly[month].count += 1;
    });
    
    return monthly;
  }

  groupTransactionsByMember(transactions) {
    const byMember = {};
    
    transactions.forEach(tx => {
      if (!byMember[tx.userId]) {
        byMember[tx.userId] = { total: 0, count: 0 };
      }
      byMember[tx.userId].total += tx.amount;
      byMember[tx.userId].count += 1;
    });
    
    return byMember;
  }

  calculateGrowthRate(transactions) {
    if (transactions.length < 2) return 0;
    
    const sorted = transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const firstMonth = sorted.slice(0, Math.ceil(sorted.length / 2));
    const secondMonth = sorted.slice(Math.ceil(sorted.length / 2));
    
    const firstTotal = firstMonth.reduce((sum, tx) => sum + tx.amount, 0);
    const secondTotal = secondMonth.reduce((sum, tx) => sum + tx.amount, 0);
    
    return firstTotal > 0 ? ((secondTotal - firstTotal) / firstTotal) * 100 : 0;
  }
}
