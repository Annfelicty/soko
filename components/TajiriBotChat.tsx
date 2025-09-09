import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  MessageCircle, 
  Send, 
  Camera, 
  Shield, 
  BookOpen, 
  X,
  Bot,
  User,
  Zap,
  AlertTriangle,
  DollarSign,
  Receipt
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: string;
  type?: 'text' | 'action' | 'alert';
}

interface TajiriBotChatProps {
  onClose: () => void;
}

export function TajiriBotChat({ onClose }: TajiriBotChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      message: 'Habari! I\'m TajiriBot, your AI financial assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString(),
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { id: 'learn', label: 'Learn about money', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'scan', label: 'Scan receipt', icon: Camera, color: 'bg-green-500' },
    { id: 'scam', label: 'Check scam alert', icon: Shield, color: 'bg-red-500' },
    { id: 'budget', label: 'Budget help', icon: DollarSign, color: 'bg-yellow-500' }
  ];

  const handleQuickAction = (actionId: string) => {
    let actionMessage = '';
    let botResponse = '';

    switch (actionId) {
      case 'learn':
        actionMessage = 'I want to learn about money management';
        botResponse = 'Great choice! Here are some key money management tips:\n\n• Track your income and expenses daily\n• Save at least 10% of your income\n• Separate business and personal money\n• Join a chama for group savings\n• Always verify before sending money\n\nWould you like me to explain any of these in detail?';
        break;
      case 'scan':
        actionMessage = 'I want to scan a receipt';
        botResponse = 'I can help you scan and categorize receipts for tax purposes! 📸\n\n• Take a clear photo of your receipt\n• I\'ll extract the amount, date, and vendor\n• Automatically categorize for tax records\n• Store securely in your profile\n\nReady to scan? Use the camera button below!';
        break;
      case 'scam':
        actionMessage = 'Check if this is a scam alert';
        botResponse = '🛡️ I\'m always watching for scam patterns! Here\'s what to watch for:\n\n• Requests for PIN/passwords\n• "You\'ve won" messages requiring fees\n• Urgent bank account warnings\n• Unknown senders asking for money\n\nShare any suspicious message and I\'ll analyze it instantly!';
        break;
      case 'budget':
        actionMessage = 'I need help with budgeting';
        botResponse = 'Let me help you create a simple budget! 💰\n\nThe 50/30/20 rule works well:\n• 50% - Essential expenses (rent, food)\n• 30% - Personal spending\n• 20% - Savings and debt\n\nBased on your recent transactions, you earn about KSh 24,680. Would you like me to suggest a personalized budget?';
        break;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: actionMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        message: botResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = '';
      const lowerMessage = inputMessage.toLowerCase();

      if (lowerMessage.includes('scam') || lowerMessage.includes('fraud')) {
        botResponse = '🚨 I detected a potential fraud concern! Please share the suspicious message or call details, and I\'ll analyze it immediately. Your safety is my priority!';
      } else if (lowerMessage.includes('save') || lowerMessage.includes('chama')) {
        botResponse = '💰 Savings are important! I recommend:\n\n• Join a digital chama for group savings\n• Set automatic savings goals\n• Track your progress weekly\n\nYour current savings rate is excellent at 67% of your goal!';
      } else if (lowerMessage.includes('tax') || lowerMessage.includes('receipt')) {
        botResponse = '📋 I handle all your tax needs automatically!\n\n• Auto-generate KRA-compliant records\n• Scan receipts with camera\n• Track business expenses\n• Export PDF reports\n\nYour Q1 2024 records are ready for download!';
      } else if (lowerMessage.includes('help') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        botResponse = 'Hello! I\'m here to help with:\n\n• Money management tips\n• Fraud detection\n• Receipt scanning\n• Tax record keeping\n• Savings goals\n\nWhat would you like assistance with today?';
      } else {
        botResponse = 'I understand you\'re asking about: "' + inputMessage + '"\n\nI\'m continuously learning to better assist you. For now, try using the quick action buttons below, or ask me about money management, fraud detection, or tax records!';
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        message: botResponse,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl h-[600px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-red-500 to-red-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg">TajiriBot</CardTitle>
                <p className="text-red-100 text-sm">AI Financial Assistant</p>
              </div>
              <Badge className="bg-green-500 text-white border-green-400 animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-1" />
                Online
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={message.sender === 'user' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}>
                    {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`rounded-2xl px-4 py-3 ${message.sender === 'user' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="whitespace-pre-line text-sm leading-relaxed">
                    {message.message}
                  </div>
                  <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-red-100' : 'text-gray-500'}`}>
                    {message.timestamp}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.id)}
                className="text-xs border-red-200 text-red-700 hover:bg-red-50"
              >
                <action.icon className="w-3 h-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <Camera className="w-4 h-4" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 border-red-200 focus:border-red-400 focus:ring-red-400"
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}