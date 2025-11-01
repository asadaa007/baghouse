
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
  Star,
  Workflow
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Bug,
      title: 'Advanced Bug Management',
      description: 'Comprehensive bug tracking with custom fields, attachments, and detailed categorization for better organization.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Real-time collaboration with team members, assignees, and stakeholders for seamless project management.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Detailed analytics and custom reports to track project progress and team performance metrics.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with role-based access control and data encryption to protect your sensitive information.'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Instant notifications and real-time synchronization across all team members and devices.'
    },
    {
      icon: Workflow,
      title: 'Workflow Automation',
      description: 'Customizable workflows and automated processes to streamline your bug resolution pipeline.'
    }
  ];

  const benefits = [
    'Zero configuration - ready to use immediately',
    'Rich bug reporting with attachments and markdown support',
    'Real-time team collaboration and notifications',
    'Comprehensive analytics and custom reporting',
    'Enterprise-grade security and compliance',
    'Seamless integration with development workflows'
  ];

  const stats = [
    { number: '10K+', label: 'Bugs Tracked' },
    { number: '500+', label: 'Teams Using' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
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
      <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 500+ Development Teams
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Professional Bug Tracking
              <span className="text-primary block">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Streamline your development workflow with our comprehensive bug tracking platform. 
              Built for teams who demand excellence in software quality and project management.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="bg-primary text-white px-8 py-4 rounded-xl hover:bg-primary/90 transition-all duration-200 font-semibold flex items-center shadow-lg hover:shadow-xl"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="bg-primary text-white px-8 py-4 rounded-xl hover:bg-primary/90 transition-all duration-200 font-semibold flex items-center shadow-lg hover:shadow-xl"
                  >
                    Get Started Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link 
                    to="/login" 
                    className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and capabilities designed for professional development teams and enterprise environments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-start mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mr-5 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Professional Teams Choose BugKiller
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built by developers, for developers. Experience the difference that professional-grade tools make in your workflow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-8">
              {benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-start space-x-5">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg text-gray-900 font-semibold">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-8">
              {benefits.slice(3).map((benefit, index) => (
                <div key={index} className="flex items-start space-x-5">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg text-gray-900 font-semibold">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-blue-600">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Bug Tracking?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
              Join thousands of professional development teams who trust BugKiller to deliver exceptional software quality and streamlined project management.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="bg-white text-primary px-10 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 font-bold inline-flex items-center shadow-lg hover:shadow-xl"
                >
                  Access Your Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="bg-white text-primary px-10 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 font-bold inline-flex items-center shadow-lg hover:shadow-xl"
                  >
                    Get Started Today
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link 
                    to="/login" 
                    className="border-2 border-white text-white px-10 py-4 rounded-xl hover:bg-white/10 transition-all duration-200 font-bold"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Bug className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">BugKiller</span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                Professional bug tracking platform designed for modern development teams. 
                Streamline your workflow and deliver exceptional software quality.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <div className="space-y-3">
                <Link to="/features" className="block text-gray-400 hover:text-white transition-colors">Features</Link>
                <Link to="/integrations" className="block text-gray-400 hover:text-white transition-colors">Integrations</Link>
                <Link to="/security" className="block text-gray-400 hover:text-white transition-colors">Security</Link>
                <Link to="/api" className="block text-gray-400 hover:text-white transition-colors">API</Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <div className="space-y-3">
                <Link to="/help" className="block text-gray-400 hover:text-white transition-colors">Help Center</Link>
                <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">Contact Us</Link>
                <Link to="/status" className="block text-gray-400 hover:text-white transition-colors">Status</Link>
                <Link to="/community" className="block text-gray-400 hover:text-white transition-colors">Community</Link>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                <p>&copy; 2024 BugKiller. All rights reserved.</p>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 