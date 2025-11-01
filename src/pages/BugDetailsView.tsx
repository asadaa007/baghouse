import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBugs } from '../context/BugContext';
import { getAllUsers } from '../services/userService';
import { bugService } from '../services/bugService';
import MarkdownEditor from '../components/common/MarkdownEditor';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import { Button, IconButton } from '../components/common/buttons';
import Navigation from '../components/layout/Navigation';
import type { Bug, BugComment } from '../types/bugs';
import type { AppUser } from '../types/auth';
import { 
  ArrowLeft, 
  X, 
  User, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  Edit, 
  Settings,
  Plus,
  CheckCircle,
  Trash2
} from 'lucide-react';

const BugDetailsView = () => {
  const { id: bugId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateBug, deleteBug } = useBugs();
  
  const [bug, setBug] = useState<Bug | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [comments, setComments] = useState<BugComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showAssigneeSelector, setShowAssigneeSelector] = useState(false);
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState('');
  const [availableLabels] = useState(['Bug', 'Feature', 'Enhancement', 'Task', 'Fixed', 'Critical', 'High Priority']);
  const [newLabel, setNewLabel] = useState('');

  // Load bug data
  useEffect(() => {
    const loadBug = async () => {
      if (!bugId) return;
      
      try {
        setLoading(true);
        // Add # prefix to bug ID if not present
        const fullBugId = bugId.startsWith('#') ? bugId : `#${bugId}`;
        const bugData = await bugService.getBugById(fullBugId);
        if (bugData) {
          setBug(bugData);
          setComments(bugData.comments || []);
        } else {
          navigate('/bugs');
        }
      } catch (error) {
        console.error('Error loading bug:', error);
        navigate('/bugs');
      } finally {
        setLoading(false);
      }
    };

    loadBug();
  }, [bugId, navigate]);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

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

  const getLabelColor = (label: string) => {
    switch (label.toLowerCase()) {
      case 'bug': return 'bg-red-100 text-red-800';
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'enhancement': return 'bg-green-100 text-green-800';
      case 'task': return 'bg-purple-100 text-purple-800';
      case 'fixed': return 'bg-green-100 text-green-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high priority': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !bug || !user) return;

    try {
      const comment: BugComment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        author: user.name || 'Unknown',
        authorId: user.id,
        createdAt: new Date(),
        bugId: bug.id
      };

      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      
      await updateBug(bug.id, { 
        comments: updatedComments,
        history: [
          ...(bug.history || []),
          {
            id: Date.now().toString(),
            type: 'general',
            action: 'added a comment',
            userName: user.name || 'Unknown',
            userId: user.id,
            timestamp: new Date()
          }
        ]
      });
      
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAssigneeChange = async (user: AppUser) => {
    if (!bug) return;

    try {
      const historyEntry = {
        id: Date.now().toString(),
        type: 'assignee' as const,
        action: 'changed assignee',
        userName: user.name || 'Unknown',
        userId: user.id,
        timestamp: new Date(),
        oldValue: bug.assigneeName || 'Unassigned',
        newValue: user.name || 'Unknown'
      };

      await updateBug(bug.id, {
        assignee: user.id,
        assigneeName: user.name,
        history: [...(bug.history || []), historyEntry]
      });

      setBug(prev => prev ? { ...prev, assignee: user.id, assigneeName: user.name } : null);
      setShowAssigneeSelector(false);
    } catch (error) {
      console.error('Error updating assignee:', error);
    }
  };

  const handleAddLabel = async (label: string) => {
    if (!bug) return;

    try {
      const newLabels = [...(bug.labels || []), label];
      const historyEntry = {
        id: Date.now().toString(),
        type: 'labels' as const,
        action: 'added label',
        userName: user?.name || 'Unknown',
        userId: user?.id || 'unknown',
        timestamp: new Date(),
        newValue: label
      };

      await updateBug(bug.id, {
        labels: newLabels,
        history: [...(bug.history || []), historyEntry]
      });

      setBug(prev => prev ? { ...prev, labels: newLabels } : null);
    } catch (error) {
      console.error('Error adding label:', error);
    }
  };

  const handleRemoveLabel = async (label: string) => {
    if (!bug) return;

    try {
      const newLabels = (bug.labels || []).filter(l => l !== label);
      const historyEntry = {
        id: Date.now().toString(),
        type: 'labels' as const,
        action: 'removed label',
        userName: user?.name || 'Unknown',
        userId: user?.id || 'unknown',
        timestamp: new Date(),
        oldValue: label
      };

      await updateBug(bug.id, {
        labels: newLabels,
        history: [...(bug.history || []), historyEntry]
      });

      setBug(prev => prev ? { ...prev, labels: newLabels } : null);
    } catch (error) {
      console.error('Error removing label:', error);
    }
  };

  const handleTypeChange = async (priority: string) => {
    if (!bug) return;

    try {
      const historyEntry = {
        id: Date.now().toString(),
        type: 'priority' as const,
        action: 'changed priority',
        userName: user?.name || 'Unknown',
        userId: user?.id || 'unknown',
        timestamp: new Date(),
        oldValue: bug.priority,
        newValue: priority
      };

      await updateBug(bug.id, {
        priority: priority as any,
        history: [...(bug.history || []), historyEntry]
      });

      setBug(prev => prev ? { ...prev, priority: priority as any } : null);
      setShowTypeSelector(false);
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const handleEditBug = () => {
    if (bug) {
      const cleanBugId = bug.id.replace('#', '');
      navigate(`/bugs/${cleanBugId}/edit`);
    }
  };

  const handleDeleteBug = async () => {
    if (!bug || !confirm('Are you sure you want to delete this bug?')) return;

    try {
      await deleteBug(bug.id);
      navigate('/bugs');
    } catch (error) {
      console.error('Error deleting bug:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bug details...</p>
        </div>
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bug Not Found</h1>
          <Button onClick={() => navigate('/bugs')} variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bugs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4">
            {/* Top Row - Back Button and Action Buttons */}
            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={() => navigate('/bugs')}
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
              >
                Back to Bugs
              </Button>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleEditBug}
                  variant="outline"
                  size="sm"
                  icon={Edit}
                >
                  Edit Bug
                </Button>
                <Button
                  onClick={handleDeleteBug}
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
            
            {/* Bottom Row - Bug ID and Title */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-full">
                {bug.id}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{bug.title}</h1>
            </div>
          </div>
          
          {/* Bug Meta Information */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Reporter:</span>
                <span className="ml-2 font-medium text-gray-900">{bug.reporterName || 'Unknown'}</span>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Assignee:</span>
                <span className="ml-2 font-medium text-gray-900">{bug.assigneeName || 'Unassigned'}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(bug.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Description</h4>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={bug.description} />
                </div>
              </div>
            </div>

            {/* Activity Timeline and Comments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Activity & Comments</h4>
              
              {/* Bug Created */}
              <div className="flex items-start space-x-3 mb-6">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Plus className="w-3 h-3 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{bug.reporterName || 'Unknown'}</span>
                      <span className="text-xs text-gray-500">created this bug</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(bug.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Combined Timeline - History and Comments */}
              {(() => {
                const timelineItems = [];
                
                // Add history items
                if (bug.history && bug.history.length > 0) {
                  bug.history.forEach((historyItem, index) => {
                    const fullName = historyItem.userName || historyItem.user || user?.name || 'Unknown';
                    const firstName = fullName.split(' ')[0];
                    
                    let timestamp;
                    try {
                      if (historyItem.timestamp) {
                        if (historyItem.timestamp.toDate && typeof historyItem.timestamp.toDate === 'function') {
                          timestamp = historyItem.timestamp.toDate();
                        } else if (historyItem.timestamp.seconds) {
                          timestamp = new Date(historyItem.timestamp.seconds * 1000);
                        } else {
                          timestamp = new Date(historyItem.timestamp);
                        }
                      } else if (historyItem.createdAt) {
                        if (historyItem.createdAt.toDate && typeof historyItem.createdAt.toDate === 'function') {
                          timestamp = historyItem.createdAt.toDate();
                        } else if (historyItem.createdAt.seconds) {
                          timestamp = new Date(historyItem.createdAt.seconds * 1000);
                        } else {
                          timestamp = new Date(historyItem.createdAt);
                        }
                      } else {
                        timestamp = new Date();
                      }
                      
                      if (isNaN(timestamp.getTime())) {
                        timestamp = new Date();
                      }
                    } catch (error) {
                      timestamp = new Date();
                    }
                    
                    const changeType = historyItem.type || historyItem.field || 'general';
                    const actionText = historyItem.action || historyItem.description || 'Changed';
                    
                    timelineItems.push({
                      id: `history-${index}`,
                      type: 'history',
                      timestamp,
                      fullName,
                      firstName,
                      changeType,
                      actionText,
                      historyItem
                    });
                  });
                }
                
                // Add comments
                if (comments && comments.length > 0) {
                  comments.forEach(comment => {
                    const fullName = comment.author || 'Unknown';
                    const firstName = fullName.split(' ')[0];
                    
                    let timestamp;
                    try {
                      timestamp = new Date(comment.createdAt);
                      if (isNaN(timestamp.getTime())) {
                        timestamp = new Date();
                      }
                    } catch (error) {
                      timestamp = new Date();
                    }
                    
                    timelineItems.push({
                      id: comment.id,
                      type: 'comment',
                      timestamp,
                      fullName,
                      firstName,
                      comment
                    });
                  });
                }
                
                // Sort by timestamp (oldest first)
                timelineItems.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                
                return timelineItems.map((item, index) => {
                  if (item.type === 'history') {
                    return (
                      <div key={item.id} className="flex items-start space-x-3 mb-4">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {item.changeType === 'assignee' ? (
                            <User className="w-3 h-3 text-green-600" />
                          ) : item.changeType === 'status' ? (
                            <Clock className="w-3 h-3 text-yellow-600" />
                          ) : item.changeType === 'priority' ? (
                            <AlertCircle className="w-3 h-3 text-orange-600" />
                          ) : item.changeType === 'labels' ? (
                            <MessageSquare className="w-3 h-3 text-blue-600" />
                          ) : (
                            <Edit className="w-3 h-3 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span 
                                className="text-sm font-medium text-gray-900 cursor-help"
                                title={item.fullName}
                              >
                                {item.firstName}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {item.changeType === 'priority' ? 'changed priority' : 
                                   item.changeType === 'labels' ? (item.historyItem.action?.includes('removed') ? 'removed label' : 'added label') :
                                   item.changeType === 'status' ? 'changed status' : item.actionText}
                                </span>
                                {item.changeType === 'priority' && item.historyItem.oldValue && (
                                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor((() => {
                                    const rawValue = item.historyItem.oldValue;
                                    if (rawValue && typeof rawValue === 'string' && rawValue.includes('Changed from') && rawValue.includes('to')) {
                                      const match = rawValue.match(/from\s(.*?)\s+to/);
                                      return match && match[1] ? match[1] : rawValue;
                                    }
                                    return rawValue;
                                  })())}`}>
                                    {(() => {
                                      const rawValue = item.historyItem.oldValue;
                                      if (rawValue && typeof rawValue === 'string' && rawValue.includes('Changed from') && rawValue.includes('to')) {
                                        const match = rawValue.match(/from\s(.*?)\s+to/);
                                        return match && match[1] ? match[1] : rawValue;
                                      }
                                      return rawValue;
                                    })()}
                                  </span>
                                )}
                                {item.changeType === 'priority' && (() => {
                                  const rawNewValue = item.historyItem.newValue || 
                                                     item.historyItem.details || 
                                                     item.historyItem.action?.replace('Priority changed to ', '') ||
                                                     item.historyItem.description?.replace('Priority changed to ', '') ||
                                                     'unknown';
                                  let displayNewValue = rawNewValue;
                                  if (typeof rawNewValue === 'string' && rawNewValue.includes('Changed from') && rawNewValue.includes('to')) {
                                    const match = rawNewValue.match(/to\s(.*?)$/);
                                    if (match && match[1]) {
                                      displayNewValue = match[1];
                                    }
                                  }
                                  return (
                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(displayNewValue)}`}>
                                      {displayNewValue}
                                    </span>
                                  );
                                })()}
                                {item.changeType === 'status' && item.historyItem.oldValue && (
                                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor((() => {
                                    const rawValue = item.historyItem.oldValue;
                                    if (rawValue && typeof rawValue === 'string' && rawValue.includes('Changed from') && rawValue.includes('to')) {
                                      const match = rawValue.match(/from\s(.*?)\s+to/);
                                      return match && match[1] ? match[1] : rawValue;
                                    }
                                    return rawValue;
                                  })())}`}>
                                    {(() => {
                                      const rawValue = item.historyItem.oldValue;
                                      if (rawValue && typeof rawValue === 'string' && rawValue.includes('Changed from') && rawValue.includes('to')) {
                                        const match = rawValue.match(/from\s(.*?)\s+to/);
                                        return match && match[1] ? match[1] : rawValue;
                                      }
                                      return rawValue;
                                    })()}
                                  </span>
                                )}
                                {item.changeType === 'status' && (() => {
                                  const rawNewValue = item.historyItem.newValue || 
                                                     item.historyItem.details || 
                                                     item.historyItem.action?.replace('Status changed to ', '') ||
                                                     item.historyItem.description?.replace('Status changed to ', '') ||
                                                     'unknown';
                                  let displayNewValue = rawNewValue;
                                  if (typeof rawNewValue === 'string' && rawNewValue.includes('Changed from') && rawNewValue.includes('to')) {
                                    const match = rawNewValue.match(/to\s(.*?)$/);
                                    if (match && match[1]) {
                                      displayNewValue = match[1];
                                    }
                                  }
                                  return (
                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(displayNewValue)}`}>
                                      {displayNewValue}
                                    </span>
                                  );
                                })()}
                                {item.changeType === 'labels' && (() => {
                                  let labelValue = item.historyItem.newValue || item.historyItem.details || item.historyItem.action || 'unknown';
                                  
                                  if (typeof labelValue === 'string') {
                                    labelValue = labelValue.replace(/.*?(Added|Removed)\s+label:\s*/, '');
                                  }
                                  
                                  return (
                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getLabelColor(labelValue)}`}>
                                      {labelValue}
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400">
                                {item.timestamp.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Comment item
                    return (
                      <div key={item.id} className="flex items-start space-x-3 mb-4">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-3 h-3 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span 
                                className="text-sm font-medium text-gray-900 cursor-help"
                                title={item.fullName}
                              >
                                {item.firstName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {item.timestamp.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="prose prose-sm max-w-none">
                              <MarkdownRenderer content={item.comment.content} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                });
              })()}

              {/* Add Comment Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <h5 className="text-sm font-medium text-gray-900">Add a comment</h5>
                </div>
                
                <MarkdownEditor
                  value={newComment}
                  onChange={setNewComment}
                  placeholder="Use Markdown to format your comment"
                  className="mb-3"
                />

                <div className="flex justify-end mt-3">
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    variant="primary"
                    size="sm"
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignees */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">Assignees</label>
                <IconButton
                  onClick={() => setShowAssigneeSelector(!showAssigneeSelector)}
                  icon={Settings}
                  variant="ghost"
                  size="sm"
                />
              </div>

              {showAssigneeSelector ? (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setAssigneeSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {allUsers.filter(user => 
                      user.name.toLowerCase().includes(assigneeSearchTerm.toLowerCase())
                    ).map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleAssigneeChange(user)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center"
                      >
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {user.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {bug.assigneeName ? (
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <User className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-900">{bug.assigneeName}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No assignees</p>
                  )}
                </>
              )}
            </div>

            {/* Labels */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">Labels</label>
                <IconButton
                  onClick={() => setShowLabelManager(!showLabelManager)}
                  icon={Settings}
                  variant="ghost"
                  size="sm"
                />
              </div>

              {showLabelManager ? (
                <div className="space-y-2">
                  {availableLabels.map(label => (
                    <button
                      key={label}
                      onClick={() => handleAddLabel(label)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 flex items-center justify-between ${bug.labels?.includes(label) ? 'bg-blue-50' : ''}`}
                    >
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLabelColor(label)}`}>
                        {label}
                      </span>
                      {bug.labels?.includes(label) && (
                        <span className="text-blue-600 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  {bug.labels && bug.labels.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {bug.labels.map((label, index) => (
                        <div key={index} className="flex items-center">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getLabelColor(label)}`}>
                            {label}
                          </span>
                          <button
                            onClick={() => handleRemoveLabel(label)}
                            className="ml-1 text-gray-400 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No labels</p>
                  )}
                </>
              )}
            </div>

            {/* Type */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <IconButton
                  onClick={() => setShowTypeSelector(!showTypeSelector)}
                  icon={Settings}
                  variant="ghost"
                  size="sm"
                />
              </div>

              {showTypeSelector ? (
                <div className="space-y-2">
                  {['low', 'medium', 'high', 'critical'].map(type => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 ${bug.priority === type ? 'bg-blue-100 text-blue-800' : ''}`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              ) : (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(bug.priority)}`}>
                  {bug.priority.charAt(0).toUpperCase() + bug.priority.slice(1)}
                </span>
              )}
            </div>

            {/* Project Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">Project</label>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-2 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-900">{bug.projectName || 'Unknown Project'}</span>
                </div>
                <div className="ml-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Status</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bug.status)}`}>
                      {bug.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
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

export default BugDetailsView;
