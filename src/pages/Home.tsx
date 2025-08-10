
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bug, 
  Users, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  Shield,
  Zap,
  Clock
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Bug,
      title: 'Smart Bug Tracking',
      description: 'Capture and organize bugs with intelligent categorization and priority management.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with real-time updates and team notifications.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Get detailed reports and insights to improve your development process.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security to keep your data safe and accessible.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built for speed with instant updates and real-time synchronization.'
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'Track time spent on bugs and projects for better resource management.'
    }
  ];

  const benefits = [
    'No setup required - start in minutes',
    'Visual bug reporting with screenshots',
    'Real-time team collaboration',
    'Advanced analytics and reporting',
    'Enterprise security standards',
    'Easy integrations with your tools'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Bug className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">BugKiller</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Track bugs smarter, 
            <span className="text-primary"> not harder</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            A modern bug tracking platform designed for development teams who want to focus on building great software.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {user ? (
              <Link 
                to="/dashboard" 
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link 
                  to="/login" 
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to track bugs effectively
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, powerful tools designed for modern development teams.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why teams choose BugKiller
            </h2>
            <p className="text-lg text-gray-600">
              Built for developers, by developers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              {benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-6">
              {benefits.slice(3).map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to improve your bug tracking?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join teams using BugKiller to ship better software faster.
          </p>
          <Link 
            to="/register" 
            className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium inline-flex items-center"
          >
            Start Your Free Trial
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bug className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">BugKiller</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/support" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; 2024 BugKiller. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 