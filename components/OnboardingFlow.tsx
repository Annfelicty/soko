import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Phone, MessageSquare, Globe, CheckCircle, Star, Sparkles } from 'lucide-react';

interface OnboardingFlowProps {
  onAuthComplete: () => void;
}

export function OnboardingFlow({ onAuthComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<'language' | 'phone' | 'otp' | 'welcome'>('language');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [language, setLanguage] = useState('');

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setStep('phone');
  };

  const handlePhoneSubmit = () => {
    if (phoneNumber.length >= 10) {
      setStep('otp');
    }
  };

  const handleOtpSubmit = () => {
    if (otp.length === 6) {
      setStep('welcome');
      setTimeout(() => {
        onAuthComplete();
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-amber-50 flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-yellow-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-red-300/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Language Selection */}
        {step === 'language' && (
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-red-100 animate-fade-in">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-red-900 mb-2">Welcome to TajiriCircle</CardTitle>
                <p className="text-gray-600">Choose your preferred language</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleLanguageSelect('en')}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Globe className="w-5 h-5 mr-3" />
                English
              </Button>
              <Button
                onClick={() => handleLanguageSelect('sw')}
                variant="outline"
                className="w-full border-2 border-red-200 text-red-700 hover:bg-red-50 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Globe className="w-5 h-5 mr-3" />
                Kiswahili
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Phone Number Input */}
        {step === 'phone' && (
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-red-100 animate-slide-up">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-red-900">
                  {language === 'sw' ? 'Ingiza Nambari ya Simu' : 'Enter Your Phone Number'}
                </CardTitle>
                <p className="text-gray-600">
                  {language === 'sw' ? 'Tutatuma ujumbe wa kuthibitisha' : 'We\'ll send you a verification code'}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'sw' ? 'Nambari ya Simu' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-12 py-3 text-base border-red-200 focus:border-red-400 focus:ring-red-400"
                  />
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <Button
                onClick={handlePhoneSubmit}
                disabled={phoneNumber.length < 10}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {language === 'sw' ? 'Tuma Msimbo' : 'Send Code'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* OTP Verification */}
        {step === 'otp' && (
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-red-100 animate-slide-up">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-8 h-8 text-black" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-red-900">
                  {language === 'sw' ? 'Thibitisha Msimbo' : 'Verify Code'}
                </CardTitle>
                <p className="text-gray-600">
                  {language === 'sw' ? `Tumeteuma msimbo kwa ${phoneNumber}` : `We sent a code to ${phoneNumber}`}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'sw' ? 'Msimbo wa Kuthibitisha' : 'Verification Code'}
                </label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest py-4 border-red-200 focus:border-red-400 focus:ring-red-400"
                  maxLength={6}
                />
              </div>
              <Button
                onClick={handleOtpSubmit}
                disabled={otp.length !== 6}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {language === 'sw' ? 'Thibitisha' : 'Verify'}
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setStep('phone')}
                className="w-full text-red-600 hover:bg-red-50"
              >
                {language === 'sw' ? 'Badilisha Nambari' : 'Change Number'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Welcome Message */}
        {step === 'welcome' && (
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-red-100 animate-fade-in">
            <CardContent className="text-center py-12 space-y-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-900 mb-2">
                  {language === 'sw' ? 'Karibu TajiriCircle!' : 'Welcome to TajiriCircle!'}
                </h2>
                <p className="text-gray-600">
                  {language === 'sw' 
                    ? 'Kuanzia sasa unaweza kufuatilia fedha zako na kujikinga dhidi ya ujanja'
                    : 'You can now track your money and protect against fraud'
                  }
                </p>
              </div>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}