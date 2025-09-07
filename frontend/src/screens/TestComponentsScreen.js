import React, { useState, useEffect } from 'react';

const TestComponentsScreen = () => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample components data
  const sampleComponents = [
    {
      id: "comp_1",
      name: "Arduino Uno",
      category: "Microcontrollers",
      description: "Popular microcontroller board based on ATmega328P",
      price: 450.0,
      availability: "Available"
    },
    {
      id: "comp_2", 
      name: "Servo Motor SG90",
      category: "Motors",
      description: "Micro servo motor for robotics projects",
      price: 150.0,
      availability: "Available"
    },
    {
      id: "comp_3",
      name: "Ultrasonic Sensor HC-SR04",
      category: "Sensors", 
      description: "Distance measuring sensor using ultrasonic waves",
      price: 120.0,
      availability: "Available"
    },
    {
      id: "comp_4",
      name: "LED Strip WS2812B",
      category: "Display",
      description: "Addressable RGB LED strip", 
      price: 300.0,
      availability: "Available"
    },
    {
      id: "comp_5",
      name: "ESP32 DevKit",
      category: "Microcontrollers",
      description: "WiFi and Bluetooth enabled microcontroller",
      price: 550.0,
      availability: "Available"
    }
  ];

  useEffect(() => {
    // Simulate loading components
    setTimeout(() => {
      setComponents(sampleComponents);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Electronic Components</h1>
          <p className="text-gray-600 mt-2">Select components for your project</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map((component) => (
            <div
              key={component.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {component.name}
                </h3>
                <span className="text-green-600 font-bold">
                  ₹{component.price}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">
                {component.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {component.category}
                </span>
                <span className="text-green-600 text-sm font-medium">
                  {component.availability}
                </span>
              </div>
              
              <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                Add to Project
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors">
            Add New Component
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestComponentsScreen;