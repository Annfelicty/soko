import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  User, 
  Star, 
  Download, 
  FileText, 
  Receipt, 
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Award,
  DollarSign,
  Eye
} from 'lucide-react';

export function ProfilePage() {
  const [trustScore] = useState(85);
  
  const userProfile = {
    name: 'Janet Wanjiku',
    phone: '+254 700 123 456',
    email: 'janet.wanjiku@email.com',
    location: 'Nairobi, Kenya',
    joinDate: 'March 2024',
    businessType: 'Retail Shop',
    verified: true
  };

  const taxRecords = [
    {
      id: '1',
      period: 'Q1 2024',
      type: 'VAT Return',
      amount: 24560,
      status: 'Filed',
      date: '2024-04-15',
      receiptUrl: '#'
    },
    {
      id: '2',
      period: 'Q4 2023',
      type: 'Income Tax',
      amount: 45000,
      status: 'Filed',
      date: '2024-01-31',
      receiptUrl: '#'
    },
    {
      id: '3',
      period: 'Q3 2023',
      type: 'VAT Return',
      amount: 18790,
      status: 'Filed',
      date: '2023-10-15',
      receiptUrl: '#'
    }
  ];

  const achievements = [
    { id: 1, title: 'Early Adopter', description: 'One of the first 100 users', icon: '🚀', earned: true },
    { id: 2, title: 'Fraud Fighter', description: 'Reported 5+ suspicious activities', icon: '🛡️', earned: true },
    { id: 3, title: 'Savings Champion', description: 'Reached 3 consecutive savings goals', icon: '🎯', earned: true },
    { id: 4, title: 'Community Builder', description: 'Created a successful chama group', icon: '👥', earned: false },
    { id: 5, title: 'Tax Pro', description: 'Filed taxes on time for 1 year', icon: '📊', earned: true }
  ];

  const transactionHistory = [
    { id: 1, date: '2024-03-15', description: 'Sale - Phone accessories', amount: 1200, type: 'credit' },
    { id: 2, date: '2024-03-14', description: 'Chama contribution - Umoja Traders', amount: -500, type: 'debit' },
    { id: 3, date: '2024-03-13', description: 'Sale - Mobile airtime', amount: 800, type: 'credit' },
    { id: 4, date: '2024-03-12', description: 'Business supplies purchase', amount: -2400, type: 'debit' },
    { id: 5, date: '2024-03-11', description: 'Sale - Data bundles', amount: 650, type: 'credit' }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-red-500 to-red-700 text-white shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-24 h-24 border-4 border-white/20">
              <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                {userProfile.verified && (
                  <Badge className="bg-green-500 text-white border-green-400">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 text-red-100">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{userProfile.phone}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{userProfile.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{userProfile.location}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {userProfile.joinDate}</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 mx-auto relative">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#FFB84D"
                      strokeWidth="2"
                      strokeDasharray={`${trustScore}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{trustScore}</span>
                  </div>
                </div>
              </div>
              <div className="text-red-100">
                <div className="text-lg font-semibold">Trust Score</div>
                <Badge className="bg-yellow-500 text-black border-yellow-400 mt-1">
                  <Star className="w-3 h-3 mr-1" />
                  Excellent
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tax-records" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="tax-records">Tax Records</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Tax Records Tab */}
        <TabsContent value="tax-records" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-red-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-red-600" />
                  Auto-Generated Tax Records
                </CardTitle>
                <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium">
                  <Download className="w-4 h-4 mr-2" />
                  Export All PDF
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Tax records are automatically generated from your transaction data
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
                        <Receipt className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{record.type}</div>
                        <div className="text-sm text-gray-600">{record.period}</div>
                        <div className="text-xs text-gray-500">Filed on {record.date}</div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="font-semibold text-gray-900">
                        KSh {record.amount.toLocaleString()}
                      </div>
                      <div className="flex space-x-2">
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          {record.status}
                        </Badge>
                        <Button size="sm" variant="outline" className="text-xs border-red-200 text-red-700 hover:bg-red-50">
                          <Download className="w-3 h-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 text-blue-800 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Automated Tax Compliance</span>
                </div>
                <p className="text-sm text-blue-700">
                  TajiriCircle automatically tracks your business income and expenses to generate accurate tax records. 
                  All documents are KRA-compliant and ready for submission.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-red-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                Your Achievements
              </CardTitle>
              <p className="text-sm text-gray-600">
                Unlock badges by completing tasks and reaching milestones
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-4 rounded-lg border-2 ${achievement.earned ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{achievement.title}</div>
                        <div className="text-sm text-gray-600">{achievement.description}</div>
                      </div>
                      {achievement.earned ? (
                        <Badge className="bg-yellow-500 text-black border-yellow-400">
                          <Star className="w-3 h-3 mr-1" />
                          Earned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-gray-300 text-gray-600">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Achievement Progress</span>
                  <span className="text-sm text-gray-600">
                    {achievements.filter(a => a.earned).length} / {achievements.length}
                  </span>
                </div>
                <Progress 
                  value={(achievements.filter(a => a.earned).length / achievements.length) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-red-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                  Recent Transactions
                </CardTitle>
                <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactionHistory.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <DollarSign className={`w-5 h-5 ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{transaction.description}</div>
                        <div className="text-sm text-gray-600">{transaction.date}</div>
                      </div>
                    </div>
                    <div className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : ''}KSh {Math.abs(transaction.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}