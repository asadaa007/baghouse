import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { useBugs } from '../context/BugContext';
import Navigation from '../components/layout/Navigation';
import BreadcrumbNew from '../components/common/BreadcrumbNew';
import BugForm from '../components/dashboard/BugForm';
import Loading from '../components/common/Loading';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/buttons';
import type { Bug } from '../types/bugs';

const BugEdit = () => {
  const { id: bugId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useProjects();
  const { bugs, updateBug } = useBugs();
  
  const [bug, setBug] = useState<Bug | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role-based permissions
  const canEditBug = user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'team_lead';

  // Find the bug to edit
  useEffect(() => {
    if (bugId && bugs.length > 0) {
      // Try to find bug with exact ID first
      let foundBug = bugs.find(b => b.id === bugId);
      
      // If not found, try with # prefix
      if (!foundBug) {
        foundBug = bugs.find(b => b.id === `#${bugId}`);
      }
      
      // If still not found, try without # prefix
      if (!foundBug) {
        foundBug = bugs.find(b => b.id.replace('#', '') === bugId);
      }
      
      if (foundBug) {
        setBug(foundBug);
      }
      setLoading(false);
    }
  }, [bugId, bugs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Loading bug details..." />
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Bug Not Found</h1>
            <p className="text-gray-600 mb-6">The bug you're looking for doesn't exist.</p>
            <Button
              onClick={() => navigate('/bugs')}
              variant="primary"
              icon={ArrowLeft}
            >
              Back to Bugs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!canEditBug) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to edit this bug.</p>
            <Button
              onClick={() => navigate(`/bugs/${bug.id}`)}
              variant="primary"
              icon={ArrowLeft}
            >
              Back to Bug
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (bugData: any) => {
    setIsSubmitting(true);
    try {
      await updateBug(bug.id, bugData);
      navigate(`/bugs/${bug.id}`);
    } catch (error) {
      console.error('Error updating bug:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/bugs/${bug.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <BreadcrumbNew 
          items={[
            { label: 'Bugs', href: '/bugs' },
            { label: bug.title || 'Edit Bug' }
          ]}
          showBackButton={false}
        />

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Bug</h1>
              <p className="text-gray-600 mt-2">Update bug details and information</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                icon={ArrowLeft}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>

        {/* Bug Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <BugForm
            bug={bug}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            projects={projects}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

export default BugEdit;
