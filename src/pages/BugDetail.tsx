import { useParams } from 'react-router-dom';
import { useBugs } from '../context/BugContext';
import Navigation from '../components/layout/Navigation';
import { ArrowLeft, Edit, MessageSquare, Paperclip } from 'lucide-react';
import { Link } from 'react-router-dom';

const BugDetail = () => {
  const { id } = useParams();
  const { bugs } = useBugs();
  const bug = bugs.find(b => b.id === id);

  if (!bug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary mb-4">Bug not found</h2>
          <Link to="/bugs" className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bugs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Edit */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/bugs" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bugs
          </Link>
          <button className="btn-primary">
            <Edit className="w-4 h-4 mr-2" />
            Edit Bug
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-secondary">{bug.title}</h2>
                <p className="text-gray-600">#{bug.id} • {bug.projectId}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  bug.status === 'new' ? 'bg-blue-100 text-blue-800' :
                  bug.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                  bug.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {bug.status}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  bug.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  bug.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  bug.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {bug.priority}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-secondary mb-3">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{bug.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-secondary mb-3">Comments</h3>
                  <div className="space-y-4">
                    {bug.comments.map((comment) => (
                      <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-secondary">{comment.author}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <textarea
                      placeholder="Add a comment..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={3}
                    />
                    <button className="mt-2 btn-primary">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Add Comment
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-secondary mb-3">Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Reporter:</span>
                      <p className="text-secondary">{bug.reporter}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Assignee:</span>
                      <p className="text-secondary">{bug.assignee || 'Unassigned'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Created:</span>
                      <p className="text-secondary">{new Date(bug.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Updated:</span>
                      <p className="text-secondary">{new Date(bug.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-secondary mb-3">Labels</h3>
                  <div className="flex flex-wrap gap-2">
                    {bug.labels.map((label) => (
                      <span key={label} className="px-2 py-1 bg-primary/10 text-primary text-sm rounded">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-secondary mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {bug.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center p-2 bg-white rounded border">
                        <Paperclip className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-secondary">{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugDetail; 