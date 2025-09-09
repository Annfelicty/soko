import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  Shield, 
  Target, 
  Star, 
  AlertTriangle, 
  Phone, 
  DollarSign,
  Eye,
  RefreshCw,
  Zap
} from 'lucide-react';

export function Dashboard() {
  const [trustScore, setTrustScore] = useState(0);
  const [savingsProgress, setSavingsProgress] = useState(0);

  // Animate counters on mount
  useEffect(() => {
    const trustScoreTimer = setInterval(() => {
      setTrustScore(prev => prev < 85 ? prev + 1 : prev);
    }, 30);

    const savingsTimer = setInterval(() => {
      setSavingsProgress(prev => prev < 67 ? prev + 1 : prev);
    }, 40);

    return () => {
      clearInterval(trustScoreTimer);
      clearInterval(savingsTimer);
    };
  }, []);

  // Mock data for charts
  const salesData = [
    { day: 'Mon', amount: 1200 },
    { day: 'Tue', amount: 2100 },
    { day: 'Wed', amount: 800 },
    { day: 'Thu', amount: 1600 },
    { day: 'Fri', amount: 2400 },
    { day: 'Sat', amount: 3200 },
    { day: 'Sun', amount: 1800 }
  ];

  const expenseData = [
    { name: 'Business', value: 60, color: '#A51C30' },
    { name: 'Personal', value: 25, color: '#FFB84D' },
    { name: 'Savings', value: 15, color: '#5A0C17' }
  ];

  const scamAlerts = [
    { id: 1, type: 'SMS', message: 'Loan offer from unknown sender', risk: 'high', time: '2 hours ago' },
    { id: 2, type: 'Call', message: 'Suspicious call requesting PIN', risk: 'critical', time: '5 hours ago' }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Good morning, Janet!</h1>
            <p className="text-red-100">Here's your financial overview for today</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">KSh 24,680</div>
            <div className="text-red-200 text-sm">Total Balance</div>
          </div>
        </div>
      </div>

      {/* Scam Alert Banner */}
      {scamAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 font-medium">
            {scamAlerts.length} new fraud alerts detected. 
            <Button variant="link" className="text-red-600 font-semibold p-0 ml-1 h-auto">
              Review now →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Sales Card */}
        <Card className="col-span-1 md:col-span-2 bg-white/90 backdrop-blur-sm shadow-xl border-red-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-red-600" />
              Daily Sales (SMS Parsed)
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2 mb-4">
              <div className="text-3xl font-bold text-red-900">KSh 3,200</div>
              <div className="text-sm text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +15% vs yesterday
              </div>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`KSh ${value}`, 'Sales']}
                    labelStyle={{ color: '#000' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#A51C30" 
                    strokeWidth={3}
                    dot={{ fill: '#A51C30', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trust Score Card */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-red-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Trust Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <div className="w-24 h-24 mx-auto relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#FFB84D"
                    strokeWidth="2"
                    strokeDasharray={`${trustScore}, 100`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{trustScore}</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Excellent Rating
              </Badge>
              <p className="text-xs text-gray-600 mt-2">Based on transaction history</p>
            </div>
          </CardContent>
        </Card>

        {/* Savings Goal Card */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-red-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-red-600" />
              Savings Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">KSh 16,800 / KSh 25,000</span>
                <span className="text-red-600 font-medium">{savingsProgress}%</span>
              </div>
              <Progress 
                value={savingsProgress} 
                className="h-3 bg-gray-200"
                style={{
                  background: 'linear-gradient(to right, #FFB84D, #A51C30)'
                }}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Monthly target</span>
                <span className="text-green-600 font-medium">On track</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Next milestone</span>
                <span className="text-red-600 font-medium">KSh 20,000</span>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium text-sm">
              <DollarSign className="w-4 h-4 mr-1" />
              Add Money
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-red-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-red-600" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {expenseData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color }} />
                  <div className="text-xs text-gray-600">{item.name}</div>
                  <div className="text-sm font-medium">{item.value}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-red-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <div className="text-sm font-medium">Payment received</div>
                    <div className="text-xs text-gray-600">From: John M.</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600">+KSh 1,200</div>
                  <div className="text-xs text-gray-500">2 mins ago</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div>
                    <div className="text-sm font-medium">Chama contribution</div>
                    <div className="text-xs text-gray-600">To: Umoja Group</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-blue-600">-KSh 500</div>
                  <div className="text-xs text-gray-500">1 hour ago</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <div>
                    <div className="text-sm font-medium">Fraud alert blocked</div>
                    <div className="text-xs text-gray-600">Suspicious SMS</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-600">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-gray-500">3 hours ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}