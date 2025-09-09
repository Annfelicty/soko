import { useState, useEffect } from 'react';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Dashboard } from './components/Dashboard';
import { DigitalChama } from './components/DigitalChama';
import { FraudAlertCenter } from './components/FraudAlertCenter';
import { ProfilePage } from './components/ProfilePage';
import { TajiriBotChat } from './components/TajiriBotChat';
import { Button } from './components/ui/button';
import { Phone, Shield, Users, AlertTriangle, User, MessageCircle, Star, Sparkles } from 'lucide-react';

type Page = 'onboarding' | 'dashboard' | 'chama' | 'fraud' | 'profile' | 'chat';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('onboarding');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4
    }));
    setParticles(newParticles);
  }, []);

  const handleAuthComplete = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  if (!isAuthenticated) {
    return <OnboardingFlow onAuthComplete={handleAuthComplete} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'chama':
        return <DigitalChama />;
      case 'fraud':
        return <FraudAlertCenter />;
      case 'profile':
        return <ProfilePage />;
      case 'chat':
        return <TajiriBotChat onClose={() => setCurrentPage('dashboard')} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-amber-50">
      {/* Background particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="fixed w-1 h-1 bg-red-400/20 rounded-full animate-bounce pointer-events-none z-0"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: '4s'
          }}
        />
      ))}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-red-100 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-900">TajiriCircle</h1>
                <p className="text-xs text-gray-600">AI-Powered Finance</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Button
                variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentPage('dashboard')}
                className="text-xs"
              >
                <Phone className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
              <Button
                variant={currentPage === 'chama' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentPage('chama')}
                className="text-xs"
              >
                <Users className="w-4 h-4 mr-1" />
                Digital Chama
              </Button>
              <Button
                variant={currentPage === 'fraud' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentPage('fraud')}
                className="text-xs"
              >
                <Shield className="w-4 h-4 mr-1" />
                Fraud Alerts
              </Button>
              <Button
                variant={currentPage === 'profile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentPage('profile')}
                className="text-xs"
              >
                <User className="w-4 h-4 mr-1" />
                Profile
              </Button>
            </nav>

            {/* Chat button */}
            <Button
              onClick={() => setCurrentPage('chat')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              TajiriBot
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 relative z-10">
        {renderPage()}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-red-100 md:hidden z-50">
        <div className="flex items-center justify-around py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage('dashboard')}
            className={`flex flex-col items-center space-y-1 p-2 ${currentPage === 'dashboard' ? 'text-red-600' : 'text-gray-600'}`}
          >
            <Phone className="w-4 h-4" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage('chama')}
            className={`flex flex-col items-center space-y-1 p-2 ${currentPage === 'chama' ? 'text-red-600' : 'text-gray-600'}`}
          >
            <Users className="w-4 h-4" />
            <span className="text-xs">Chama</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage('fraud')}
            className={`flex flex-col items-center space-y-1 p-2 ${currentPage === 'fraud' ? 'text-red-600' : 'text-gray-600'}`}
          >
            <Shield className="w-4 h-4" />
            <span className="text-xs">Security</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage('profile')}
            className={`flex flex-col items-center space-y-1 p-2 ${currentPage === 'profile' ? 'text-red-600' : 'text-gray-600'}`}
          >
            <User className="w-4 h-4" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>

      {/* Custom animations */}
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