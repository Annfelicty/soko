import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Phone, 
  MessageSquare, 
  Search,
  Filter,
  Eye,
  Ban,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';

interface FraudAlert {
  id: string;
  type: 'sms' | 'call' | 'mpesa';
  sender: string;
  message: string;
  riskLevel: 'safe' | 'suspicious' | 'scam';
  timestamp: string;
  status: 'pending' | 'reviewed' | 'blocked';
  aiConfidence: number;
}

export function FraudAlertCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'safe' | 'suspicious' | 'scam'>('all');

  const fraudAlerts: FraudAlert[] = [
    {
      id: '1',
      type: 'sms',
      sender: '+254700123456',
      message: 'Congratulations! You have won KSh 50,000. Send KSh 500 processing fee to claim...',
      riskLevel: 'scam',
      timestamp: '2 hours ago',
      status: 'blocked',
      aiConfidence: 98
    },
    {
      id: '2',
      type: 'call',
      sender: '+254711987654',
      message: 'Caller requested M-Pesa PIN and personal details',
      riskLevel: 'scam',
      timestamp: '5 hours ago',
      status: 'blocked',
      aiConfidence: 95
    },
    {
      id: '3',
      type: 'sms',
      sender: 'MPESA',
      message: 'You have received KSh 1,200 from John Doe. Your balance is KSh 3,400',
      riskLevel: 'safe',
      timestamp: '1 day ago',
      status: 'reviewed',
      aiConfidence: 99
    },
    {
      id: '4',
      type: 'sms',
      sender: '+254722555888',
      message: 'Urgent: Your bank account will be closed. Click link to verify: bit.ly/verify123',
      riskLevel: 'suspicious',
      timestamp: '3 hours ago',
      status: 'pending',
      aiConfidence: 87
    },
    {
      id: '5',
      type: 'mpesa',
      sender: 'Unknown',
      message: 'Request to send KSh 5,000 to unfamiliar number',
      riskLevel: 'suspicious',
      timestamp: '6 hours ago',
      status: 'pending',
      aiConfidence: 78
    }
  ];

  const filteredAlerts = fraudAlerts.filter(alert => {
    const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.sender.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || alert.riskLevel === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'text-green-600 bg-green-50 border-green-200';
      case 'suspicious': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'scam': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'suspicious': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'scam': return <Ban className="w-4 h-4 text-red-600" />;
      default: return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'mpesa': return <Zap className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const stats = {
    total: fraudAlerts.length,
    blocked: fraudAlerts.filter(a => a.status === 'blocked').length,
    pending: fraudAlerts.filter(a => a.status === 'pending').length,
    safe: fraudAlerts.filter(a => a.riskLevel === 'safe').length
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              Fraud Alert Center
            </h1>
            <p className="text-red-100">AI-powered protection against financial fraud</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.blocked}</div>
            <div className="text-red-200 text-sm">Threats Blocked</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-red-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Alerts</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 shadow-lg border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
            <div className="text-sm text-red-700">Blocked</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 shadow-lg border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-yellow-700">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 shadow-lg border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.safe}</div>
            <div className="text-sm text-green-700">Safe</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Protection Status */}
      <Alert className="border-blue-200 bg-blue-50">
        <Zap className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>AI Protection Active:</strong> TajiriBot is actively monitoring your messages and transactions for potential fraud.
          <div className="flex items-center space-x-4 mt-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>SMS Monitoring</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Call Analysis</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Transaction Screening</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Search and Filter */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-red-100">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search alerts by message or sender..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-red-200 focus:border-red-400 focus:ring-red-400"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {['all', 'safe', 'suspicious', 'scam'].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter as any)}
                  className={selectedFilter === filter ? '' : 'border-red-200 text-red-700 hover:bg-red-50'}
                >
                  <Filter className="w-3 h-3 mr-1" />
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-red-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Fraud Alerts ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border-2 ${getRiskColor(alert.riskLevel)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getTypeIcon(alert.type)}
                      <Badge variant="outline" className="text-xs">
                        {alert.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">{alert.sender}</span>
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        {getRiskIcon(alert.riskLevel)}
                        <span className="text-sm font-medium capitalize">
                          {alert.riskLevel}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>AI Confidence: {alert.aiConfidence}%</span>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          alert.status === 'blocked' ? 'border-red-300 text-red-700' :
                          alert.status === 'pending' ? 'border-yellow-300 text-yellow-700' :
                          'border-green-300 text-green-700'
                        }`}
                      >
                        {alert.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                        {alert.status === 'blocked' && <Ban className="w-3 h-3 mr-1" />}
                        {alert.status === 'reviewed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    {alert.status === 'pending' && (
                      <>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                          <Ban className="w-3 h-3 mr-1" />
                          Block
                        </Button>
                        <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Safe
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" className="text-gray-600 hover:text-gray-900">
                      <Eye className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredAlerts.length === 0 && (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No alerts found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}