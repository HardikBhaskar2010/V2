import OpenAI from 'openai';

// Initialize OpenAI client only if API key is available
let openai = null;

const initializeOpenAI = () => {
  if (process.env.REACT_APP_OPENAI_API_KEY && process.env.REACT_APP_OPENAI_API_KEY !== 'placeholder_key') {
    try {
      openai = new OpenAI({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // This is needed for client-side usage
      });
      console.log('✅ OpenAI client initialized successfully');
    } catch (error) {
      console.warn('⚠️ Failed to initialize OpenAI client:', error);
      openai = null;
    }
  } else {
    console.log('⚠️ OpenAI API key not found - AI features will use fallback responses');
  }
};

// =============================
// 🤖 AI IDEA GENERATION
// =============================

// Fallback function when OpenAI is not available
function generateFallbackIdeas({ selectedComponents, theme, skillLevel, count }) {
  const fallbackIdeas = [
    {
      title: "Smart Home Automation Hub",
      description: "Control home appliances and monitor sensors remotely using Arduino and ESP32.",
      problemStatement: "Managing multiple home devices manually is inefficient and energy-wasteful.",
      workingPrinciple: "ESP32 connects to WiFi and controls relays based on sensor inputs and user commands.",
      difficulty: skillLevel,
      estimatedCost: "₹800-1200",
      components: selectedComponents.length > 0 ? selectedComponents : ["Arduino Uno", "ESP32 DevKit", "Servo Motor SG90"],
      innovationElements: ["Remote control", "Automated scheduling", "Energy monitoring"],
      scalabilityOptions: ["Voice control integration", "Mobile app", "Cloud dashboard"],
      tags: [theme, "IoT", "Home Automation", "Smart Home"]
    },
    {
      title: "Environmental Monitoring Station",
      description: "Track temperature, humidity, air quality and send alerts when thresholds are exceeded.",
      problemStatement: "Indoor air quality affects health but is often unmonitored.",
      workingPrinciple: "Sensors collect environmental data, Arduino processes it and triggers alerts.",
      difficulty: skillLevel,
      estimatedCost: "₹600-900",
      components: selectedComponents.length > 0 ? selectedComponents : ["Arduino Uno", "Ultrasonic Sensor HC-SR04", "LED Strip WS2812B"],
      innovationElements: ["Real-time monitoring", "Visual alerts", "Data logging"],
      scalabilityOptions: ["Web dashboard", "Historical data analysis", "Multiple sensor nodes"],
      tags: [theme, "Environment", "Health", "Monitoring"]
    },
    {
      title: "Automated Plant Care System",
      description: "Monitor soil moisture and automatically water plants when needed.",
      problemStatement: "Plants often die due to inconsistent watering schedules.",
      workingPrinciple: "Soil moisture sensor triggers water pump when moisture drops below threshold.",
      difficulty: skillLevel,
      estimatedCost: "₹500-750",
      components: selectedComponents.length > 0 ? selectedComponents : ["Arduino Uno", "Servo Motor SG90", "PIR Motion Sensor"],
      innovationElements: ["Automated watering", "Moisture tracking", "Plant health monitoring"],
      scalabilityOptions: ["Multiple plant monitoring", "Weather integration", "Growth tracking"],
      tags: [theme, "Agriculture", "Automation", "Gardening"]
    },
    {
      title: "Security Alert System",
      description: "Motion-activated security system with LED indicators and remote notifications.",
      problemStatement: "Traditional security systems are expensive and complex to install.",
      workingPrinciple: "PIR sensor detects motion, triggers LED alerts and can send notifications via ESP32.",
      difficulty: skillLevel,
      estimatedCost: "₹400-650",
      components: selectedComponents.length > 0 ? selectedComponents : ["ESP32 DevKit", "PIR Motion Sensor", "LED Strip WS2812B"],
      innovationElements: ["Motion detection", "Visual alerts", "Remote notifications"],
      scalabilityOptions: ["Camera integration", "Mobile alerts", "Multi-zone monitoring"],
      tags: [theme, "Security", "IoT", "Monitoring"]
    },
    {
      title: "Smart Lighting Controller",
      description: "Automated lighting system that adjusts brightness based on ambient light and time.",
      problemStatement: "Manual lighting control wastes energy and isn't convenient.",
      workingPrinciple: "Light sensors detect ambient conditions and control LED brightness via PWM.",
      difficulty: skillLevel,
      estimatedCost: "₹450-700",
      components: selectedComponents.length > 0 ? selectedComponents : ["Arduino Uno", "LED Strip WS2812B", "Ultrasonic Sensor HC-SR04"],
      innovationElements: ["Automatic brightness", "Color temperature control", "Energy efficiency"],
      scalabilityOptions: ["Room-by-room control", "Schedule programming", "Voice control"],
      tags: [theme, "Smart Home", "Lighting", "Energy"]
    }
  ];

  // Return the requested number of ideas
  const selectedIdeas = fallbackIdeas.slice(0, Math.min(count, fallbackIdeas.length));
  
  return selectedIdeas.map((idea, index) => ({
    ...idea,
    id: `fallback_idea_${Date.now()}_${index}`,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    generatedBy: "Fallback Generator (OpenAI unavailable)",
    theme: theme,
    skillLevel: skillLevel
  }));
}

export async function generateProjectIdeas({
  selectedComponents = [],
  theme = "General",
  skillLevel = "Beginner",
  count = 5
}) {
  try {
    // Initialize OpenAI if not already done
    if (!openai) {
      initializeOpenAI();
    }

    // If still no OpenAI client, return fallback ideas
    if (!openai) {
      console.log('🔄 Using fallback project ideas (OpenAI not available)');
      return generateFallbackIdeas({ selectedComponents, theme, skillLevel, count });
    }

    const componentsStr = selectedComponents.join(", ");
    
    const prompt = `Generate ${count} innovative electronic project ideas using these components: ${componentsStr}

Theme: ${theme}
Skill Level: ${skillLevel}

For each project idea, provide a detailed JSON object with these exact fields:
- title: Creative and engaging project name
- description: 2-3 sentence project overview
- problemStatement: What real-world problem does this solve?
- workingPrinciple: How does the project work technically?
- difficulty: ${skillLevel}
- estimatedCost: Cost in ₹ (Indian Rupees)
- components: Array of components used from the provided list
- innovationElements: Array of unique/innovative features
- scalabilityOptions: Array of ways to expand/improve the project
- tags: Array of relevant keywords/categories

Return ONLY a valid JSON array with ${count} project objects. No additional text or explanation.

Example format:
[
  {
    "title": "Smart Plant Watering System",
    "description": "Automated plant care system that waters plants based on soil moisture levels.",
    "problemStatement": "Plants often die due to inconsistent watering schedules.",
    "workingPrinciple": "Soil moisture sensor triggers water pump when moisture is low.",
    "difficulty": "${skillLevel}",
    "estimatedCost": "₹800",
    "components": ["Arduino Uno", "Soil Moisture Sensor", "Water Pump"],
    "innovationElements": ["Automated scheduling", "Mobile notifications"],
    "scalabilityOptions": ["Multiple plant monitoring", "Weather integration"],
    "tags": ["Agriculture", "IoT", "Automation"]
  }
]`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert electronics engineer and educator. Generate practical, educational, and innovative project ideas that match the user's skill level and available components. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2500,
      temperature: 0.8,
      top_p: 0.9
    });

    const ideasText = response.choices[0].message.content.trim();
    
    try {
      // Parse the JSON response
      const ideas = JSON.parse(ideasText);
      
      // Validate and enhance each idea
      const enhancedIdeas = ideas.map((idea, index) => ({
        ...idea,
        id: `idea_${Date.now()}_${index}`,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        generatedBy: "OpenAI GPT-3.5-turbo",
        theme: theme,
        skillLevel: skillLevel
      }));
      
      return enhancedIdeas;
      
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Raw response:", ideasText);
      
      // Fallback: return a sample idea
      return [{
        id: `idea_${Date.now()}`,
        title: `${theme} Project with ${selectedComponents[0] || 'Arduino'}`,
        description: `An innovative ${skillLevel.toLowerCase()} level project using ${componentsStr}.`,
        problemStatement: "Address real-world challenges through technology.",
        workingPrinciple: "Combine sensors, microcontrollers, and actuators for smart solutions.",
        difficulty: skillLevel,
        estimatedCost: "₹500-1000",
        components: selectedComponents,
        innovationElements: ["Smart automation", "Real-time monitoring"],
        scalabilityOptions: ["IoT connectivity", "Mobile app integration"],
        tags: [theme, "Electronics", "DIY"],
        isFavorite: false,
        createdAt: new Date().toISOString(),
        generatedBy: "Fallback Generator"
      }];
    }
    
  } catch (error) {
    console.error("Error generating ideas:", error);
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      throw new Error("OpenAI API quota exceeded. Please check your billing details or add credits to your OpenAI account.");
    } else if (error.code === 'invalid_api_key') {
      throw new Error("Invalid OpenAI API key. Please check your API key configuration.");
    } else if (error.message?.includes('rate_limit')) {
      throw new Error("OpenAI API rate limit exceeded. Please try again in a moment.");
    }
    
    throw new Error(`AI service error: ${error.message}`);
  }
}

// =============================
// 🔍 IDEA ENHANCEMENT
// =============================

export async function enhanceProjectIdea(idea) {
  try {
    // Initialize OpenAI if not already done
    if (!openai) {
      initializeOpenAI();
    }

    // If still no OpenAI client, return enhanced fallback
    if (!openai) {
      console.log('🔄 Using fallback enhancement (OpenAI not available)');
      return {
        ...idea,
        implementationSteps: [
          "1. Gather all required components and tools",
          "2. Create circuit diagram and plan connections",
          "3. Set up breadboard and make initial connections",
          "4. Write and upload basic code to microcontroller",
          "5. Test individual components and sensors",
          "6. Integrate all components and test full system",
          "7. Debug and refine the project",
          "8. Create enclosure and finalize the project"
        ],
        circuitDiagram: "Connect components according to their pin requirements. Use appropriate resistors and ensure proper power supply connections.",
        codeSnippet: "// Basic Arduino code structure\nvoid setup() {\n  // Initialize pins and sensors\n}\n\nvoid loop() {\n  // Main program logic\n}",
        troubleshooting: [
          "Check all connections if project doesn't work",
          "Verify power supply voltage and current",
          "Use serial monitor for debugging",
          "Test components individually if needed"
        ],
        learningOutcomes: [
          "Understanding of electronic circuit design",
          "Programming microcontrollers",
          "Sensor integration and data processing",
          "Problem-solving and debugging skills"
        ],
        enhanced: true,
        enhancedAt: new Date().toISOString(),
        enhancedBy: "Fallback Enhancer (OpenAI unavailable)"
      };
    }

    const prompt = `Enhance this project idea with more technical details and implementation steps:

Project: ${idea.title}
Description: ${idea.description}
Components: ${idea.components?.join(', ')}

Provide enhanced details in JSON format with these additional fields:
- implementationSteps: Array of step-by-step instructions
- circuitDiagram: Text description of circuit connections
- codeSnippet: Basic Arduino/microcontroller code structure
- troubleshooting: Common issues and solutions
- learningOutcomes: Educational benefits

Return only valid JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an electronics engineering instructor. Provide detailed, educational enhancements to project ideas."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const enhancementText = response.choices[0].message.content.trim();
    const enhancement = JSON.parse(enhancementText);
    
    return {
      ...idea,
      ...enhancement,
      enhanced: true,
      enhancedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("Error enhancing idea:", error);
    // Return original idea if enhancement fails
    return idea;
  }
}

// =============================
// 💡 IDEA SUGGESTIONS
// =============================

export async function getProjectSuggestions(userPreferences) {
  try {
    // Initialize OpenAI if not already done
    if (!openai) {
      initializeOpenAI();
    }

    // If still no OpenAI client, return fallback suggestions
    if (!openai) {
      console.log('🔄 Using fallback suggestions (OpenAI not available)');
      return [
        {
          title: "IoT Weather Station",
          description: "Build a comprehensive weather monitoring system with multiple sensors",
          requiredComponents: ["ESP32 DevKit", "Temperature Sensor", "Humidity Sensor", "Display"]
        },
        {
          title: "Smart Garden Monitor",
          description: "Automated plant care system with soil moisture and light monitoring",
          requiredComponents: ["Arduino Uno", "Soil Moisture Sensor", "Light Sensor", "Water Pump"]
        },
        {
          title: "Home Security System",
          description: "Motion-activated security with alerts and remote monitoring",
          requiredComponents: ["PIR Motion Sensor", "ESP32 DevKit", "LED Strip", "Buzzer"]
        }
      ];
    }

    const { skillLevel, selectedThemes, interests } = userPreferences;
    
    const prompt = `Based on user preferences, suggest 3 trending project ideas:
    
Skill Level: ${skillLevel}
Themes: ${selectedThemes?.join(', ') || 'General Electronics'}
Interests: ${interests?.join(', ') || 'Learning'}

Provide suggestions as a JSON array with title, description, and requiredComponents fields.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a project advisor. Suggest relevant, trending electronics projects."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.8
    });

    const suggestionsText = response.choices[0].message.content.trim();
    return JSON.parse(suggestionsText);
    
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return [];
  }
}

// Initialize OpenAI client when module loads
initializeOpenAI();