import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Check, Zap, Cpu, Eye, Bluetooth } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TestComponentsScreen = () => {
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
      <div className="max-w-7xl mx-auto px-4 py-6">
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
                <button
                  onClick={() => handleAddToProject(component)}
                  disabled={isSelected}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-green-900/30 text-green-400 border border-green-500/30 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-lg hover:shadow-blue-500/25'
                  }`}
                >
                  {isSelected ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Check className="h-4 w-4" />
                      <span>Added to Project</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add to Project</span>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Add New Component Button */}
        <div className="mt-8 text-center">
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
    </div>
  );
};

export default TestComponentsScreen;