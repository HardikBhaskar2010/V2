import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Check, Zap, Cpu, Eye, Bluetooth, ArrowRight, Home, Settings, Lightbulb, BookOpen, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TestComponentsScreen = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Enhanced components data with icons and better mobile design
  const sampleComponents = [
    {
      id: "comp_1",
      name: "Arduino Uno",
      category: "Microcontrollers",
      description: "Popular microcontroller board based on ATmega328P",
      price: 450.0,
      availability: "Available",
      icon: Cpu,
      color: "from-blue-600 to-purple-600",
      stock: 15
    },
    {
      id: "comp_2", 
      name: "Servo Motor SG90",
      category: "Motors",
      description: "Micro servo motor for robotics projects",
      price: 150.0,
      availability: "Available",
      icon: Zap,
      color: "from-orange-500 to-red-500",
      stock: 8
    },
    {
      id: "comp_3",
      name: "Ultrasonic Sensor HC-SR04",
      category: "Sensors", 
      description: "Distance measuring sensor using ultrasonic waves",
      price: 120.0,
      availability: "Available",
      icon: Eye,
      color: "from-green-500 to-teal-500",
      stock: 12
    },
    {
      id: "comp_4",
      name: "LED Strip WS2812B",
      category: "Display",
      description: "Addressable RGB LED strip", 
      price: 300.0,
      availability: "Available",
      icon: Zap,
      color: "from-pink-500 to-rose-500",
      stock: 6
    },
    {
      id: "comp_5",
      name: "ESP32 DevKit",
      category: "Microcontrollers",
      description: "WiFi and Bluetooth enabled microcontroller",
      price: 550.0,
      availability: "Available",
      icon: Bluetooth,
      color: "from-indigo-500 to-blue-600",
      stock: 10
    }
  ];

  useEffect(() => {
    // Load selected components from localStorage
    const savedComponents = localStorage.getItem('selectedComponents');
    if (savedComponents) {
      setSelectedComponents(JSON.parse(savedComponents));
    }

    // Simulate loading components
    setTimeout(() => {
      setComponents(sampleComponents);
      setLoading(false);
    }, 800);
  }, []);

  // Handle adding component to project
  const handleAddToProject = (component) => {
    const isAlreadySelected = selectedComponents.some(c => c.id === component.id);
    
    if (isAlreadySelected) {
      toast.error(`${component.name} is already in your project!`);
      return;
    }

    const updatedComponents = [...selectedComponents, component];
    setSelectedComponents(updatedComponents);
    localStorage.setItem('selectedComponents', JSON.stringify(updatedComponents));
    
    toast.success(`${component.name} added to project! 🎉`);
  };

  // Handle adding new component
  const handleAddNewComponent = () => {
    setShowAddModal(true);
  };

  // Navigation functions
  const handleContinue = () => {
    if (selectedComponents.length === 0) {
      toast.error('Please select at least one component to continue');
      return;
    }
    
    toast.success(`Proceeding with ${selectedComponents.length} components!`);
    navigate('/generate'); // Go to AI Idea Generation
  };

  const handleNavigateToScreen = (screen) => {
    navigate(screen);
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Microcontrollers': 'bg-blue-900/20 text-blue-300 border-blue-500/30',
      'Motors': 'bg-orange-900/20 text-orange-300 border-orange-500/30',
      'Sensors': 'bg-green-900/20 text-green-300 border-green-500/30',
      'Display': 'bg-purple-900/20 text-purple-300 border-purple-500/30',
      'Cables': 'bg-gray-900/20 text-gray-300 border-gray-500/30'
    };
    return colors[category] || 'bg-gray-900/20 text-gray-300 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-500 mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg">Loading components...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your electronics library</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
            <p className="text-red-400 text-lg font-medium">Error loading components</p>
            <p className="text-gray-400 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Electronic Components</h1>
              <p className="text-gray-400 mt-1">Build your next amazing project</p>
            </div>
            <div className="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-blue-400" />
              <span className="text-white font-medium">{selectedComponents.length}</span>
            </div>
          </div>
          
          {/* Selected Components Counter */}
          {selectedComponents.length > 0 && (
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-300 text-sm">
                ✨ {selectedComponents.length} component{selectedComponents.length > 1 ? 's' : ''} selected for your project
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Components Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {components.map((component) => {
            const Icon = component.icon;
            const isSelected = selectedComponents.some(c => c.id === component.id);
            
            return (
              <div
                key={component.id}
                className={`bg-gray-800 border border-gray-700 rounded-xl p-5 hover:bg-gray-750 transition-all duration-300 transform hover:scale-105 ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-900/20' : ''
                }`}
              >
                {/* Component Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${component.color} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">₹{component.price}</div>
                    <div className="text-xs text-gray-400">{component.stock} in stock</div>
                  </div>
                </div>

                {/* Component Details */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
                    {component.name}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    {component.description}
                  </p>
                </div>

                {/* Category and Status */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(component.category)}`}>
                    {component.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs font-medium">{component.availability}</span>
                  </div>
                </div>

                {/* Action Button */}
                {isSelected ? (
                  <div className="space-y-2">
                    <div className="w-full py-3 px-4 rounded-lg bg-green-900/30 text-green-400 border border-green-500/30">
                      <div className="flex items-center justify-center space-x-2">
                        <Check className="h-4 w-4" />
                        <span>Added to Project</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFromProject(component)}
                      className="w-full py-2 px-4 rounded-lg font-medium text-sm bg-red-900/30 text-red-400 border border-red-500/30 hover:bg-red-900/50 transition-all duration-200 active:scale-95"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>×</span>
                        <span>Remove</span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToProject(component)}
                    className="w-full py-3 px-4 rounded-lg font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add to Project</span>
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          {/* Add New Component Button */}
          <div className="text-center">
            <button
              onClick={handleAddNewComponent}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-4 px-8 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-200 active:scale-95"
            >
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add New Component</span>
              </div>
            </button>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={selectedComponents.length === 0}
              className={`w-full max-w-sm mx-auto font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 active:scale-95 ${
                selectedComponents.length > 0
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-500/25'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>
                  {selectedComponents.length > 0 
                    ? `Continue with ${selectedComponents.length} Component${selectedComponents.length > 1 ? 's' : ''}` 
                    : 'Select Components to Continue'
                  }
                </span>
                {selectedComponents.length > 0 && <ArrowRight className="h-5 w-5" />}
              </div>
            </button>
          </div>
        </div>

        {/* Add New Component Modal */}
        {showAddModal && (
          <AddComponentModal 
            onClose={() => setShowAddModal(false)}
            onAdd={(newComponent) => {
              setComponents([...components, newComponent]);
              setShowAddModal(false);
              toast.success(`${newComponent.name} added to library! 🎉`);
            }}
          />
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-2 safe-area-pb">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          <button
            onClick={() => handleNavigateToScreen('/components')}
            className="flex flex-col items-center space-y-1 p-2 text-blue-400"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Components</span>
          </button>
          
          <button
            onClick={() => handleNavigateToScreen('/generate')}
            className="flex flex-col items-center space-y-1 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Lightbulb className="h-5 w-5" />
            <span className="text-xs font-medium">Generate</span>
          </button>
          
          <button
            onClick={() => handleNavigateToScreen('/library')}
            className="flex flex-col items-center space-y-1 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs font-medium">Library</span>
          </button>
          
          <button
            onClick={() => handleNavigateToScreen('/preferences')}
            className="flex flex-col items-center space-y-1 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs font-medium">Settings</span>
          </button>
          
          <button
            onClick={() => handleNavigateToScreen('/profile')}
            className="flex flex-col items-center space-y-1 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  );
};

// Add Component Modal Component
const AddComponentModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Microcontrollers',
    description: '',
    price: '',
    stock: ''
  });

  const categories = ['Microcontrollers', 'Motors', 'Sensors', 'Display', 'Cables', 'Power', 'Tools'];
  const icons = [Cpu, Zap, Eye, Zap, Cpu, Zap, Cpu];
  const colors = [
    'from-blue-600 to-purple-600',
    'from-orange-500 to-red-500', 
    'from-green-500 to-teal-500',
    'from-pink-500 to-rose-500',
    'from-gray-500 to-gray-600',
    'from-yellow-500 to-orange-500',
    'from-indigo-500 to-blue-600'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const categoryIndex = categories.indexOf(formData.category);
    const newComponent = {
      id: `comp_${Date.now()}`,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      price: parseFloat(formData.price),
      availability: "Available",
      icon: icons[categoryIndex] || Cpu,
      color: colors[categoryIndex] || 'from-blue-600 to-purple-600',
      stock: parseInt(formData.stock) || 10
    };

    onAdd(newComponent);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add New Component</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Plus className="h-6 w-6 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Component Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Arduino Nano"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the component..."
              rows="3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Price (₹) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="450"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
                min="0"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add Component
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestComponentsScreen;