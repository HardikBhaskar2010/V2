import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Heart, Share2, Eye, Bookmark, Lightbulb, Zap, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { apiService } from '../services/apiService';
import { useUser } from '../contexts/UserContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AdvancedLoadingSpinner from '../components/common/AdvancedLoadingSpinner';
import AnimatedCard from '../components/common/AnimatedCard';
import EnhancedModal from '../components/common/EnhancedModal';
import DevelopedByFooter from '../components/common/DevelopedByFooter';

const AIIdeaGeneration = () => {
  const navigate = useNavigate();
  const { selectedComponents, userPreferences, incrementStat } = useUser();
  const [generatedIdeas, setGeneratedIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [savedIdeas, setSavedIdeas] = useState(new Set());

  const generateIdeasMutation = useMutation(apiService.generateIdeas, {
    onSuccess: (data) => {
      setGeneratedIdeas(data);
      toast.success('Ideas generated successfully!');
      incrementStat('ideas_generated', data.length);
    },
    onError: (error) => {
      toast.error('Failed to generate ideas. Please try again.');
      console.error('Generate ideas error:', error);
    }
  });

  const saveIdeaMutation = useMutation(apiService.saveIdea, {
    onSuccess: (data) => {
      setSavedIdeas(prev => new Set([...prev, data.id]));
      toast.success('Idea saved to your library!');
    },
    onError: (error) => {
      toast.error('Failed to save idea');
      console.error('Save idea error:', error);
    }
  });

  useEffect(() => {
    if (selectedComponents.length === 0) {
      toast.error('Please select components first');
      navigate('/component-selection');
      return;
    }
    
    // Auto-generate ideas on component load
    generateIdeas();
  }, []);

  const generateIdeas = () => {
    const request = {
      selected_components: selectedComponents.map(comp => comp.name),
      user_preferences: userPreferences,
      count: 5
    };
    
    generateIdeasMutation.mutate(request);
  };

  const handleSaveIdea = (idea) => {
    const savedIdea = {
      ...idea,
      components: idea.components || selectedComponents.map(comp => comp.name)
    };
    
    saveIdeaMutation.mutate(savedIdea);
  };

  const handleShareIdea = (idea) => {
    const shareText = `Check out this project idea: ${idea.title}\n\n${idea.description}`;
    
    if (navigator.share) {
      navigator.share({
        title: idea.title,
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Idea copied to clipboard!');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Partially Available': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      default: return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    }
  };

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/theme-selection')}
                className="btn-outline flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Idea Generation
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {generatedIdeas.length > 0 
                    ? `${generatedIdeas.length} ideas generated based on your selections`
                    : 'Generating personalized project ideas...'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/ideas-library')}
                className="btn-outline flex items-center space-x-2"
              >
                <Bookmark className="h-4 w-4" />
                <span>Library</span>
              </button>
              
              {generatedIdeas.length > 0 && (
                <button
                  onClick={generateIdeas}
                  disabled={generateIdeasMutation.isLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${generateIdeasMutation.isLoading ? 'animate-spin' : ''}`} />
                  <span>Generate More</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {generateIdeasMutation.isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <AdvancedLoadingSpinner 
              size="xl" 
              variant="pulse"
            />
            <div className="mt-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Generating Ideas...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI is creating personalized project ideas based on your components and preferences
              </p>
            </div>
            
            {/* Enhanced Loading Messages */}
            <div className="mt-6 max-w-md">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3 text-center text-sm text-gray-600 dark:text-gray-400"
              >
                <motion.div
                  className="flex items-center justify-center space-x-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <p>Analyzing your selected components...</p>
                </motion.div>
                <motion.div
                  className="flex items-center justify-center space-x-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
                  <p>Matching with your skill level and preferences...</p>
                </motion.div>
                <motion.div
                  className="flex items-center justify-center space-x-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
                  <p>Creating innovative project ideas...</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Error State */}
        {generateIdeasMutation.isError && (
          <div className="text-center py-16">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Generation Failed
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Unable to generate project ideas. Please check your connection and try again.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => navigate('/component-selection')}
                className="btn-outline"
              >
                Change Components
              </button>
              <button
                onClick={generateIdeas}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Generated Ideas */}
        {generatedIdeas.length > 0 && (
          <div>
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Lightbulb className="h-6 w-6 text-accent" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Generated Ideas
                </h2>
              </div>
              
              {/* Selected Components Summary */}
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Based on your selected components:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedComponents.map((component) => (
                    <span
                      key={component.id}
                      className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border"
                    >
                      {component.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {generatedIdeas.map((idea, index) => (
                <AnimatedCard
                  key={idea.id}
                  hover3D={true}
                  clickAnimation={true}
                  glowEffect={false}
                  className="p-6 hover:shadow-lg transition-all duration-200"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <motion.h3 
                          className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
                          layoutId={`idea-title-${idea.id}`}
                        >
                          {idea.title}
                        </motion.h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {idea.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <motion.span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(idea.difficulty)}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {idea.difficulty}
                      </motion.span>
                      <motion.span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(idea.availability)}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {idea.availability}
                      </motion.span>
                      <motion.span 
                        className="text-sm font-medium text-primary"
                        whileHover={{ scale: 1.05 }}
                      >
                        {idea.estimated_cost}
                      </motion.span>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                        Required Components:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {idea.components?.slice(0, 3).map((component, idx) => (
                          <motion.span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400"
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(46, 125, 50, 0.1)' }}
                          >
                            {component}
                          </motion.span>
                        ))}
                        {idea.components?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                            +{idea.components.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedIdea(idea)}
                        className="flex-1 btn-outline text-sm py-2 flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View Details</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSaveIdea(idea)}
                        disabled={savedIdeas.has(idea.id) || saveIdeaMutation.isLoading}
                        className={`btn-primary text-sm py-2 px-3 ${
                          savedIdeas.has(idea.id) ? 'bg-green-500 hover:bg-green-600' : ''
                        }`}
                      >
                        <Heart className={`h-3 w-3 ${savedIdeas.has(idea.id) ? 'fill-current' : ''}`} />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleShareIdea(idea)}
                        className="btn-outline text-sm py-2 px-3"
                      >
                        <Share2 className="h-3 w-3" />
                      </motion.button>
                    </div>
                  </motion.div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generateIdeasMutation.isLoading && !generateIdeasMutation.isError && generatedIdeas.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Zap className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Ready to Generate Ideas
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Click the button below to start generating personalized project ideas
            </p>
            <button
              onClick={generateIdeas}
              className="btn-primary"
            >
              Generate Ideas
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Idea Detail Modal */}
      <EnhancedModal
        isOpen={!!selectedIdea}
        onClose={() => setSelectedIdea(null)}
        size="lg"
        animation="scale"
        closeOnBackdrop={true}
        closeOnEscape={true}
      >
        {selectedIdea && (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedIdea.title}
                </h2>
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedIdea.difficulty)}`}>
                    {selectedIdea.difficulty}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {selectedIdea.estimated_cost}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Problem Statement
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedIdea.problem_statement}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Working Principle
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedIdea.working_principle}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Required Components
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedIdea.components?.map((component, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                    >
                      {component}
                    </span>
                  ))}
                </div>
              </div>

              {selectedIdea.innovation_elements && selectedIdea.innovation_elements.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Innovation Elements
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    {selectedIdea.innovation_elements.map((element, index) => (
                      <li key={index}>{element}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedIdea.scalability_options && selectedIdea.scalability_options.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Scalability Options
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    {selectedIdea.scalability_options.map((option, index) => (
                      <li key={index}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    handleSaveIdea(selectedIdea);
                    setSelectedIdea(null);
                  }}
                  disabled={savedIdeas.has(selectedIdea.id)}
                  className={`btn-primary flex items-center space-x-2 ${
                    savedIdeas.has(selectedIdea.id) ? 'bg-green-500 hover:bg-green-600' : ''
                  }`}
                >
                  <Heart className={`h-4 w-4 ${savedIdeas.has(selectedIdea.id) ? 'fill-current' : ''}`} />
                  <span>{savedIdeas.has(selectedIdea.id) ? 'Saved' : 'Save Idea'}</span>
                </button>
                
                <button
                  onClick={() => handleShareIdea(selectedIdea)}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </EnhancedModal>

      <DevelopedByFooter />
    </div>
  );
};

export default AIIdeaGeneration;