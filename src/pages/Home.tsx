import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bug, Zap, Users, Shield, BarChart3, MessageSquare } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Bug,
      title: 'Visual Bug Reporting',
      description: 'Capture screenshots and annotate bugs directly on your website with our browser extension.'
    },
    {
      icon: Zap,
      title: 'Real-time Collaboration',
      description: 'Work together with your team in real-time to track and resolve issues faster.'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Invite team members, assign roles, and manage permissions with ease.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is secure with enterprise-grade security and privacy controls.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Get insights into your bug tracking with detailed analytics and reports.'
    },
    {
      icon: MessageSquare,
      title: 'Comments & Notifications',
      description: 'Keep everyone in the loop with comments, mentions, and real-time notifications.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Baghous</h1>
            </div>
            <nav className="flex items-center space-x-8">
              <Link to="/login" className="text-secondary hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary-dark/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-secondary mb-6">
              Bug Tracking Made
              <span className="text-primary"> Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Capture, track, and resolve bugs with visual feedback. Baghous makes bug reporting 
              as easy as taking a screenshot.
            </p>
            <div className="flex justify-center space-x-4">
              {user ? (
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-3">
                    Start Free Trial
                  </Link>
                  <Link to="/login" className="btn-outline text-lg px-8 py-3">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              Everything you need to track bugs effectively
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From visual bug reporting to team collaboration, Baghous provides all the tools 
              you need to maintain high-quality software.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <feature.icon className="w-8 h-8 text-primary mr-3" />
                  <h3 className="text-xl font-semibold text-secondary">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to improve your bug tracking?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of teams using Baghous to ship better software faster.
          </p>
          <Link to="/register" className="bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Baghous</h3>
            <p className="text-gray-400 mb-6">
              Visual bug tracking for modern teams
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/help" className="hover:text-white transition-colors">Help</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 