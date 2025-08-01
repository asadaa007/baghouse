import { Plus, Users, Settings } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      id: '1',
      name: 'Project Alpha',
      description: 'Main website redesign project',
      members: 5,
      bugs: 12
    },
    {
      id: '2',
      name: 'Mobile App',
      description: 'iOS and Android mobile application',
      members: 8,
      bugs: 23
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Baghous</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-secondary mb-2">Projects</h2>
          <p className="text-gray-600">Manage your projects and team members.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary">{project.name}</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {project.members} members
                </div>
                <div>{project.bugs} bugs</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects; 