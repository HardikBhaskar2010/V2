import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // This is needed for client-side usage
});

// =============================
// 🤖 AI IDEA GENERATION
// =============================

export async function generateProjectIdeas({
  selectedComponents = [],
  theme = "General",
  skillLevel = "Beginner",
  count = 5
}) {
  try {
    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
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