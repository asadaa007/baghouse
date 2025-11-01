import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBugs } from '../context/BugContext';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/layout/Navigation';
import Breadcrumb from '../components/common/Breadcrumb';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import Loading from '../components/common/Loading';
import { 
  ArrowLeft, 
  Edit, 
  MessageSquare, 
  Paperclip, 
  Calendar,
  User,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Send,
  Image,
  FileText,
  Download,
  Flag,
  Activity,
  Search,
  X,
  ChevronDown,
  Plus,
  Users
} from 'lucide-react';
import { Button, IconButton } from '../components/common/buttons';
import { getUserById } from '../services/userService';
import { getTeamById } from '../services/teamService';

const BugDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bugs, loading: bugsLoading, updateBug } = useBugs();
  const { projects } = useProjects();
  const { user } = useAuth();
  
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showExternalAssigneeDropdown, setShowExternalAssigneeDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [externalAssigneeSearch, setExternalAssigneeSearch] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [bugHistory, setBugHistory] = useState<any[]>([]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAssigneeDropdown || showExternalAssigneeDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-dropdown]')) {
          setShowAssigneeDropdown(false);
          setShowExternalAssigneeDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAssigneeDropdown, showExternalAssigneeDropdown]);

  const bug = bugs.find(b => b.id === id);
  const project = projects.find(p => p.id === bug?.projectId);

  // Fetch all users for assignee selection
  useEffect(() => {
    const fetchUsers = async () => {
      if (!project) return;
      
      setLoadingUsers(true);
      try {
        // Get team members from the project's assigned team
        let users: any[] = [];
        
        if (project.teamId) {
          const team = await getTeamById(project.teamId);
          if (team && team.members) {
            const memberPromises = team.members.map(memberId => getUserById(memberId));
            const members = await Promise.all(memberPromises);
            users = members.filter(member => member !== null);
          }
        }
        
        setAllUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [project]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!assigneeSearch.trim()) return allUsers;
    return allUsers.filter(user => 
      user.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(assigneeSearch.toLowerCase())
    );
  }, [allUsers, assigneeSearch]);


  // Handle assignee change
  const handleAssigneeChange = async (userId: string, userName: string) => {
    if (!bug) return;
    
    try {
      await updateBug(bug.id, {
        assignee: userId,
        assigneeName: userName
      });
      setShowAssigneeDropdown(false);
    } catch (error) {
      console.error('Error updating assignee:', error);
    }
  };


  // Remove assignee
  const handleRemoveAssignee = async (type: 'assignee' | 'externalAssignee') => {
    if (!bug) return;
    
    try {
      if (type === 'assignee') {
        await updateBug(bug.id, {
          assignee: '',
          assigneeName: ''
        });
      } else {
        await updateBug(bug.id, {
          externalAssignee: '',
          externalAssigneeName: ''
        });
      }
    } catch (error) {
      console.error('Error removing assignee:', error);
    }
  };

  // Generate bug history from bug data
  useEffect(() => {
    if (!bug) return;

    const history = [];

    // Bug creation
    history.push({
      id: 'created',
      type: 'created',
      description: 'Bug was created',
      user: bug.reporterName || bug.reporter || 'Unknown',
      timestamp: bug.createdAt,
      icon: 'plus',
      color: 'blue'
    });

    // Status changes (simulated - in real app, this would come from history)
    if (bug.status !== 'new') {
      history.push({
        id: 'status-change',
        type: 'status',
        description: `Status changed to ${bug.status}`,
        user: bug.assigneeName || 'System',
        timestamp: bug.updatedAt,
        icon: 'edit',
        color: 'green'
      });
    }

    // Assignment changes
    if (bug.assigneeName) {
      history.push({
        id: 'assigned',
        type: 'assignment',
        description: `Assigned to ${bug.assigneeName}`,
        user: bug.reporterName || 'System',
        timestamp: bug.updatedAt,
        icon: 'user',
        color: 'purple'
      });
    }

    // External assignment
    if (bug.externalAssigneeName) {
      history.push({
        id: 'external-assigned',
        type: 'external_assignment',
        description: `Externally assigned to ${bug.externalAssigneeName}`,
        user: bug.reporterName || 'System',
        timestamp: bug.updatedAt,
        icon: 'users',
        color: 'orange'
      });
    }

    // Comments (simulated)
    if (bug.comments && bug.comments.length > 0) {
      bug.comments.forEach((comment, index) => {
        history.push({
          id: `comment-${index}`,
          type: 'comment',
          description: 'Added a comment',
          user: comment.author,
          timestamp: comment.createdAt,
          icon: 'message',
          color: 'gray'
        });
      });
    }

    // Sort by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setBugHistory(history);
  }, [bug]);

  // Get history icon
  const getHistoryIcon = (icon: string) => {
    switch (icon) {
      case 'plus': return <Plus className="w-4 h-4" />;
      case 'edit': return <Edit className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      case 'users': return <Users className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Get history color
  const getHistoryColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      case 'orange': return 'bg-orange-100 text-orange-800';
      case 'gray': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status and priority colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'revision': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready-for-qc': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in-qc': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'revision': return <Edit className="w-4 h-4" />;
      case 'ready-for-qc': return <Clock className="w-4 h-4" />;
      case 'in-qc': return <Search className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    
    setIsSubmittingComment(true);
    try {
      // TODO: Implement comment addition
      console.log('Adding comment:', newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (bugsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loading size="lg" text="Loading bug details..." />
        </div>
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bug Not Found</h2>
            <p className="text-gray-600 mb-6">The bug you're looking for doesn't exist or has been deleted.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Bugs', href: '/bugs' },
            { label: `${bug.customId || bug.id}` }
          ]}
          showBackButton={false}
        />

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{bug.title}</h1>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusColor(bug.status)}`}>
                      {getStatusIcon(bug.status)}
                      {bug.status.replace('-', ' ')}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${getPriorityColor(bug.priority)}`}>
                      <Flag className="w-3 h-3" />
                      {bug.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {bug.customId || bug.id}
                  </span>
                  {project && (
                    <span className="flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      {project.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created {new Date(bug.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                <Button variant="primary" icon={Edit}>
                  Edit Bug
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>
              </div>
              <div className="px-6 py-6">
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={bug.description || ''} />
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
              </div>
              <div className="px-6 py-6">
                {bug.comments && bug.comments.length > 0 ? (
                  <div className="space-y-4">
                    {bug.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900">{comment.author}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No comments yet</p>
                  </div>
                )}
                
                {/* Add Comment */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"
                        rows={3}
                      />
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <IconButton
                            icon={Image}
                            variant="default"
                            size="sm"
                          />
                          <IconButton
                            icon={Paperclip}
                            variant="default"
                            size="sm"
                          />
                        </div>
                        <Button
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || isSubmittingComment}
                          variant="primary"
                          icon={Send}
                          loading={isSubmittingComment}
                        >
                          {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bug History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">History</h2>
              </div>
              <div className="px-6 py-6">
                {bugHistory.length > 0 ? (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="space-y-6">
                      {bugHistory.map((item) => (
                        <div key={item.id} className="relative flex gap-4">
                          <div className="flex-shrink-0 relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getHistoryColor(item.color)}`}>
                              {getHistoryIcon(item.icon)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 pb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">{item.user}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No history available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bug Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Details</h3>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Reporter</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{bug.reporterName || bug.reporter || 'Unknown'}</span>
                  </div>
                </div>

                {/* Assignee Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Assignee</label>
                  <div className="relative" data-dropdown>
                    <button
                      onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                      className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {bug.assigneeName || 'Unassigned'}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {showAssigneeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-3 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search team members..."
                              value={assigneeSearch}
                              onChange={(e) => setAssigneeSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {loadingUsers ? (
                            <div className="p-4 text-center text-gray-500">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                              Loading team members...
                            </div>
                          ) : filteredUsers.length > 0 ? (
                            <>
                              {bug.assigneeName && (
                                <button
                                  onClick={() => handleRemoveAssignee('assignee')}
                                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b border-gray-100"
                                >
                                  <X className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">Unassign</span>
                                </button>
                              )}
                              {filteredUsers.map((user) => (
                                <button
                                  key={user.id}
                                  onClick={() => handleAssigneeChange(user.id, user.name)}
                                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                                >
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                  </div>
                                </button>
                              ))}
                            </>
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              No team members found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* External Assignee Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">External Assignee</label>
                  <div className="relative" data-dropdown>
                    <button
                      onClick={() => setShowExternalAssigneeDropdown(!showExternalAssigneeDropdown)}
                      className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {bug.externalAssigneeName || 'No external assignee'}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {showExternalAssigneeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-3 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search external users..."
                              value={externalAssigneeSearch}
                              onChange={(e) => setExternalAssigneeSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {bug.externalAssigneeName && (
                            <button
                              onClick={() => handleRemoveAssignee('externalAssignee')}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b border-gray-100"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Remove external assignee</span>
                            </button>
                          )}
                          {externalAssigneeSearch.trim() && (
                            <div className="p-3 text-center text-gray-500 text-sm">
                              Search for users from other teams...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{new Date(bug.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{new Date(bug.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Labels */}
            {bug.labels && bug.labels.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Labels</h3>
                </div>
                <div className="px-6 py-6">
                  <div className="flex flex-wrap gap-2">
                    {bug.labels.map((label) => (
                      <span key={label} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
                        <Tag className="w-3 h-3" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Attachments */}
            {bug.attachments && bug.attachments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                </div>
                <div className="px-6 py-6">
                  <div className="space-y-3">
                    {bug.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                          <p className="text-xs text-gray-500">{attachment.size || 'Unknown size'}</p>
                        </div>
                        <IconButton
                          icon={Download}
                          variant="default"
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugDetail; 