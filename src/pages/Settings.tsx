import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield, Palette } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Baghous</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-secondary mb-2">Settings</h2>
          <p className="text-gray-600">Manage your account and preferences.</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-primary mr-3" />
              <h3 className="text-lg font-semibold text-secondary">Profile</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || ''}
                  className="mt-1 input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  className="mt-1 input-field"
                  disabled
                />
              </div>
              <button className="btn-primary">Save Changes</button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 text-primary mr-3" />
              <h3 className="text-lg font-semibold text-secondary">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-secondary">Email notifications</p>
                  <p className="text-sm text-gray-600">Receive email updates for bug changes</p>
                </div>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-secondary">Push notifications</p>
                  <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-primary mr-3" />
              <h3 className="text-lg font-semibold text-secondary">Security</h3>
            </div>
            <div className="space-y-4">
              <button className="btn-outline">Change Password</button>
              <button className="btn-outline">Enable Two-Factor Authentication</button>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Palette className="w-5 h-5 text-primary mr-3" />
              <h3 className="text-lg font-semibold text-secondary">Appearance</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Theme</label>
                <select className="mt-1 input-field">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 