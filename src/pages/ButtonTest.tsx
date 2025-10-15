// import React from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Download, 
  Save, 
  X, 
  Eye, 
  Heart, 
  // Star,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  // User,
  // Mail,
  // Lock,
  // Search,
  // Filter,
  // MoreVertical
} from 'lucide-react';
import { Button, IconButton, ActionButton, LinkButton, ButtonGroup } from '../components/common/buttons';
import Navigation from '../components/layout/Navigation';

const ButtonTest = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Button Components Test Page</h1>
          <p className="text-gray-600">Test all button variants, sizes, and animations</p>
        </div>

        {/* Button Component */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Button Component</h2>
          
          <div className="space-y-8">
            {/* Variants */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" icon={Plus}>Primary</Button>
                <Button variant="secondary" icon={Edit}>Secondary</Button>
                <Button variant="outline" icon={Settings}>Outline</Button>
                <Button variant="ghost" icon={Eye}>Ghost</Button>
                <Button variant="danger" icon={Trash2}>Danger</Button>
                <Button variant="success" icon={Check}>Success</Button>
                <Button variant="warning" icon={AlertCircle}>Warning</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="xs" icon={Plus}>Extra Small</Button>
                <Button variant="primary" size="sm" icon={Plus}>Small</Button>
                <Button variant="primary" size="md" icon={Plus}>Medium</Button>
                <Button variant="primary" size="lg" icon={Plus}>Large</Button>
                <Button variant="primary" size="xl" icon={Plus}>Extra Large</Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">States</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" icon={Save}>Normal</Button>
                <Button variant="primary" icon={Save} loading>Loading</Button>
                <Button variant="primary" icon={Save} disabled>Disabled</Button>
                <Button variant="primary" icon={Save} fullWidth>Full Width</Button>
              </div>
            </div>

            {/* Icon Positions */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Icon Positions</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" icon={ArrowLeft} iconPosition="left">Left Icon</Button>
                <Button variant="primary" icon={ArrowRight} iconPosition="right">Right Icon</Button>
              </div>
            </div>
          </div>
        </section>

        {/* IconButton Component */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">IconButton Component</h2>
          
          <div className="space-y-8">
            {/* Variants */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Variants (Hover to see animation)</h3>
              <div className="flex flex-wrap gap-4">
                <IconButton icon={Edit} variant="default" />
                <IconButton icon={Trash2} variant="danger" />
                <IconButton icon={Check} variant="success" />
                <IconButton icon={AlertCircle} variant="warning" />
                <IconButton icon={Settings} variant="ghost" />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <IconButton icon={Plus} variant="default" size="xs" />
                <IconButton icon={Plus} variant="default" size="sm" />
                <IconButton icon={Plus} variant="default" size="md" />
                <IconButton icon={Plus} variant="default" size="lg" />
              </div>
            </div>

            {/* Interactive */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Interactive Examples</h3>
              <div className="flex flex-wrap gap-4">
                <IconButton icon={Edit} variant="default" onClick={() => alert('Edit clicked!')} title="Edit" />
                <IconButton icon={Trash2} variant="danger" onClick={() => alert('Delete clicked!')} title="Delete" />
                <IconButton icon={Settings} variant="default" onClick={() => alert('Settings clicked!')} title="Settings" />
                <IconButton icon={Download} variant="success" onClick={() => alert('Download clicked!')} title="Download" />
                <IconButton icon={Heart} variant="warning" onClick={() => alert('Like clicked!')} title="Like" />
              </div>
            </div>
          </div>
        </section>

        {/* ActionButton Component */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">ActionButton Component</h2>
          
          <div className="space-y-8">
            {/* Variants */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <ActionButton variant="default" icon={Edit}>Default</ActionButton>
                <ActionButton variant="primary" icon={Save}>Primary</ActionButton>
                <ActionButton variant="secondary" icon={Download}>Secondary</ActionButton>
                <ActionButton variant="danger" icon={Trash2}>Danger</ActionButton>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <ActionButton variant="primary" size="sm" icon={Plus}>Small</ActionButton>
                <ActionButton variant="primary" size="md" icon={Plus}>Medium</ActionButton>
                <ActionButton variant="primary" size="lg" icon={Plus}>Large</ActionButton>
              </div>
            </div>
          </div>
        </section>

        {/* LinkButton Component */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">LinkButton Component</h2>
          
          <div className="space-y-8">
            {/* Variants */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <LinkButton to="/dashboard" variant="default" icon={ArrowLeft}>Back to Dashboard</LinkButton>
                <LinkButton to="/projects" variant="primary" icon={Plus}>View Projects</LinkButton>
                <LinkButton to="/bugs" variant="secondary" icon={Eye}>View Bugs</LinkButton>
                <LinkButton to="/settings" variant="ghost" icon={Settings}>Settings</LinkButton>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <LinkButton to="/dashboard" variant="primary" size="sm" icon={ArrowLeft}>Small</LinkButton>
                <LinkButton to="/dashboard" variant="primary" size="md" icon={ArrowLeft}>Medium</LinkButton>
                <LinkButton to="/dashboard" variant="primary" size="lg" icon={ArrowLeft}>Large</LinkButton>
              </div>
            </div>
          </div>
        </section>

        {/* ButtonGroup Component */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">ButtonGroup Component</h2>
          
          <div className="space-y-8">
            {/* Horizontal */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Horizontal Groups</h3>
              <div className="space-y-4">
                <ButtonGroup orientation="horizontal" spacing="sm">
                  <Button variant="outline" icon={X}>Cancel</Button>
                  <Button variant="primary" icon={Save}>Save</Button>
                </ButtonGroup>
                
                <ButtonGroup orientation="horizontal" spacing="md">
                  <Button variant="secondary" icon={ArrowLeft}>Previous</Button>
                  <Button variant="primary" icon={ArrowRight}>Next</Button>
                </ButtonGroup>
              </div>
            </div>

            {/* Vertical */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Vertical Groups</h3>
              <ButtonGroup orientation="vertical" spacing="sm">
                <Button variant="outline" icon={Edit}>Edit</Button>
                <Button variant="outline" icon={Download}>Download</Button>
                <Button variant="danger" icon={Trash2}>Delete</Button>
              </ButtonGroup>
            </div>
          </div>
        </section>

        {/* Animation Instructions */}
        <section className="mb-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Animation Instructions</h3>
            <div className="space-y-2 text-blue-800">
              <p><strong>IconButton Animation:</strong> Hover over any IconButton to see the icon slide out left and appear from right</p>
              <p><strong>Button Hover:</strong> All buttons have smooth color transitions</p>
              <p><strong>Loading States:</strong> Buttons with loading prop show spinner animation</p>
              <p><strong>Focus States:</strong> Tab through buttons to see focus rings</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ButtonTest;
