import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBugs } from '../../context/BugContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import MarkdownRenderer from '../common/MarkdownRenderer';
import type { Bug, Comment } from '../../types/bugs';
import { 
  MessageSquare, 
  Paperclip, 
  User, 
  Tag, 
  Edit,
  Trash2
} from 'lucide-react';

interface BugViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bug: Bug | null;
  onEdit?: (bug: Bug) => void;
  onDelete?: (bugId: string) => void;
}

const BugViewModal: React.FC<BugViewModalProps> = ({ 
  isOpen, 
  onClose, 
  bug, 
  onEdit, 
  onDelete 
}) => {
  const { user } = useAuth();
  const { updateBug } = useBugs();
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  if (!bug) return null;

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsAddingComment(true);
    try {
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        author: user.name || user.email || 'Unknown',
        userId: user.id,
        userName: user.name,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedComments = [...bug.comments, comment];
      await updateBug(bug.id, { comments: updatedComments });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this bug? This action cannot be undone.')) {
      onDelete(bug.id);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'revision': return 'bg-orange-100 text-orange-800';
      case 'ready-for-qc': return 'bg-purple-100 text-purple-800';
      case 'in-qc': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bug ${bug.customId || bug.id}`}
      size="full"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{bug.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Created {formatDate(bug.createdAt)}</span>
              {bug.updatedAt && bug.updatedAt !== bug.createdAt && (
                <span>Updated {formatDate(bug.updatedAt)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(bug)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(bug.status)}`}>
            {bug.status.replace('-', ' ')}
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(bug.priority)}`}>
            {bug.priority}
          </span>
          {bug.projectName && (
            <span className="text-sm text-gray-600">
              Project: {bug.projectName}
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <MarkdownRenderer content={bug.description || ''} />
          </div>
        </div>

        {/* Assignees */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bug.assignee && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-1" />
                Team Assignee
              </h3>
              <div className="bg-blue-50 rounded-lg p-3">
                <span className="text-sm font-medium text-blue-900">
                  {bug.assigneeName || bug.assignee}
                </span>
              </div>
            </div>
          )}
          {bug.externalAssignee && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-1" />
                External Assignee
              </h3>
              <div className="bg-purple-50 rounded-lg p-3">
                <span className="text-sm font-medium text-purple-900">
                  {bug.externalAssigneeName || bug.externalAssignee}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Labels */}
        {bug.labels && bug.labels.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Tag className="w-4 h-4 mr-1" />
              Labels
            </h3>
            <div className="flex flex-wrap gap-2">
              {bug.labels.map((label, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {bug.attachments && bug.attachments.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Paperclip className="w-4 h-4 mr-1" />
              Attachments ({bug.attachments.length})
            </h3>
            <div className="space-y-2">
              {bug.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <Paperclip className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{attachment.name}</span>
                  </div>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <MessageSquare className="w-4 h-4 mr-1" />
            Comments ({bug.comments.length})
          </h3>
          
          {/* Add Comment */}
          {user && (
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isAddingComment}
                  loading={isAddingComment}
                  size="sm"
                >
                  Add Comment
                </Button>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {bug.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {comment.userName || comment.author}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bug History */}
        {bug.history && bug.history.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History ({bug.history.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {bug.history
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((entry) => (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {entry.userName || 'System'}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          {entry.action}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                    {entry.field && (
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">{entry.field}:</span>
                        {entry.oldValue && (
                          <span className="text-red-600 line-through ml-1">
                            {entry.oldValue}
                          </span>
                        )}
                        {entry.newValue && (
                          <span className="text-green-600 ml-1">
                            → {entry.newValue}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BugViewModal;
