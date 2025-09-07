from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import openai
import firebase_admin
from firebase_admin import credentials, firestore
import uuid
from datetime import datetime
import json

# Initialize FastAPI app
app = FastAPI(title="Atal Idea Generator API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase Admin
db = None
try:
    if not firebase_admin._apps:
        # Try different authentication methods
        try:
            # Method 1: Application Default Credentials
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("✅ Firebase initialized with Application Default Credentials")
        except Exception as e:
            print(f"⚠️  Application Default Credentials failed: {e}")
            try:
                # Method 2: Service account key file
                key_file = os.path.join(os.path.dirname(__file__), 'firebase-key.json')
                if os.path.exists(key_file):
                    cred = credentials.Certificate(key_file)
                    firebase_admin.initialize_app(cred)
                    db = firestore.client()
                    print("✅ Firebase initialized with service account key")
                else:
                    print("⚠️  No Firebase credentials found, using mock mode")
                    # We'll create a mock db for development
                    db = None
            except Exception as e2:
                print(f"⚠️  Firebase initialization failed: {e2}")
                db = None
    else:
        db = firestore.client()
        print("✅ Firebase was already initialized")
except Exception as e:
    print(f"⚠️  Firebase setup error: {e}")
    db = None

# Mock data for development when Firebase is not available
MOCK_COMPONENTS = [
    {
        "id": "comp_1",
        "name": "Arduino Uno",
        "category": "Microcontrollers",
        "description": "Popular microcontroller board based on ATmega328P",
        "price": 450.0,
        "availability": "Available",
        "specifications": {
            "microcontroller": "ATmega328P",
            "operating_voltage": "5V",
            "digital_pins": 14,
            "analog_pins": 6
        }
    },
    {
        "id": "comp_2",
        "name": "Servo Motor SG90",
        "category": "Motors",
        "description": "Micro servo motor for robotics projects",
        "price": 150.0,
        "availability": "Available",
        "specifications": {
            "torque": "1.8 kg-cm",
            "speed": "0.1 sec/60°",
            "voltage": "4.8V-6V"
        }
    },
    {
        "id": "comp_3",
        "name": "Ultrasonic Sensor HC-SR04",
        "category": "Sensors",
        "description": "Distance measuring sensor using ultrasonic waves",
        "price": 120.0,
        "availability": "Available",
        "specifications": {
            "range": "2cm-400cm",
            "accuracy": "3mm",
            "voltage": "5V"
        }
    },
    {
        "id": "comp_4",
        "name": "LED Strip WS2812B",
        "category": "Display",
        "description": "Addressable RGB LED strip",
        "price": 300.0,
        "availability": "Available",
        "specifications": {
            "leds_per_meter": 60,
            "voltage": "5V",
            "power_consumption": "18W/m"
        }
    },
    {
        "id": "comp_5",
        "name": "ESP32 DevKit",
        "category": "Microcontrollers",
        "description": "WiFi and Bluetooth enabled microcontroller",
        "price": 550.0,
        "availability": "Available",
        "specifications": {
            "cpu": "Dual-core 240MHz",
            "memory": "520KB RAM",
            "wifi": "802.11 b/g/n",
            "bluetooth": "v4.2 BR/EDR and BLE"
        }
    }
]

MOCK_IDEAS = []
MOCK_PREFERENCES = {
    "id": "default_user",
    "skill_level": "Beginner",
    "selected_themes": [],
    "interests": [],
    "dark_mode_enabled": False,
    "project_duration": "Short-term",
    "team_size": "Individual"
}

# Initialize OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Pydantic models
class Component(BaseModel):
    id: Optional[str] = None
    name: str
    category: str
    description: str
    price: float
    availability: str = "Available"
    image_url: Optional[str] = None
    specifications: Optional[Dict] = None

class IdeaRequest(BaseModel):
    selected_components: List[str]
    theme: str
    skill_level: str = "Beginner"
    count: int = 5

class Idea(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    problem_statement: str
    working_principle: str
    difficulty: str
    estimated_cost: str
    components: List[str]
    innovation_elements: List[str]
    scalability_options: List[str]
    is_favorite: bool = False
    tags: List[str] = []
    notes: Optional[str] = None
    created_at: Optional[str] = None

class UserPreferences(BaseModel):
    id: Optional[str] = None
    skill_level: str = "Beginner"
    selected_themes: List[str] = []
    interests: List[str] = []
    dark_mode_enabled: bool = False
    project_duration: str = "Short-term"
    team_size: str = "Individual"

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Atal Idea Generator API is running"}

# Components endpoints
@app.get("/api/components")
async def get_components():
    try:
        if db:
            components_ref = db.collection("components")
            docs = components_ref.stream()
            components = []
            for doc in docs:
                component_data = doc.to_dict()
                component_data["id"] = doc.id
                components.append(component_data)
            
            # If no components in Firebase, return mock data
            if not components:
                print("⚠️  No components found in Firebase, returning mock data")
                return MOCK_COMPONENTS
            return components
        else:
            print("⚠️  Firebase not available, returning mock data")
            return MOCK_COMPONENTS
    except Exception as e:
        print(f"⚠️  Error fetching components from Firebase: {e}")
        return MOCK_COMPONENTS

@app.post("/api/components")
async def create_component(component: Component):
    try:
        component_dict = component.dict()
        if not component_dict.get("id"):
            component_dict["id"] = str(uuid.uuid4())
        
        component_dict["created_at"] = datetime.now().isoformat()
        
        if db:
            # Add to Firebase
            doc_ref = db.collection("components").document(component_dict["id"])
            doc_ref.set(component_dict)
            print(f"✅ Component {component_dict['name']} added to Firebase")
        else:
            # Add to mock data
            MOCK_COMPONENTS.append(component_dict)
            print(f"✅ Component {component_dict['name']} added to mock data")
        
        return component_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating component: {str(e)}")

@app.get("/api/components/{component_id}")
async def get_component(component_id: str):
    try:
        doc_ref = db.collection("components").document(component_id)
        doc = doc_ref.get()
        if doc.exists:
            component_data = doc.to_dict()
            component_data["id"] = doc.id
            return component_data
        else:
            raise HTTPException(status_code=404, detail="Component not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching component: {str(e)}")

@app.delete("/api/components/{component_id}")
async def delete_component(component_id: str):
    try:
        doc_ref = db.collection("components").document(component_id)
        doc = doc_ref.get()
        if doc.exists:
            doc_ref.delete()
            return {"message": f"Component {component_id} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Component not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting component: {str(e)}")

@app.get("/api/components/category/{category}")
async def get_components_by_category(category: str):
    try:
        components_ref = db.collection("components").where("category", "==", category)
        docs = components_ref.stream()
        components = []
        for doc in docs:
            component_data = doc.to_dict()
            component_data["id"] = doc.id
            components.append(component_data)
        return components
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching components by category: {str(e)}")

# Ideas endpoints
@app.get("/api/ideas")
async def get_ideas():
    try:
        ideas_ref = db.collection("ideas")
        docs = ideas_ref.stream()
        ideas = []
        for doc in docs:
            idea_data = doc.to_dict()
            idea_data["id"] = doc.id
            ideas.append(idea_data)
        return ideas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching ideas: {str(e)}")

@app.post("/api/ideas")
async def save_idea(idea: Idea):
    try:
        idea_dict = idea.dict()
        if not idea_dict.get("id"):
            idea_dict["id"] = str(uuid.uuid4())
        
        idea_dict["created_at"] = datetime.now().isoformat()
        
        # Add to Firebase
        doc_ref = db.collection("ideas").document(idea_dict["id"])
        doc_ref.set(idea_dict)
        
        return idea_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving idea: {str(e)}")

@app.put("/api/ideas/{idea_id}")
async def update_idea(idea_id: str, idea: Idea):
    try:
        idea_dict = idea.dict()
        idea_dict["id"] = idea_id
        idea_dict["updated_at"] = datetime.now().isoformat()
        
        doc_ref = db.collection("ideas").document(idea_id)
        doc_ref.set(idea_dict, merge=True)
        
        return idea_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating idea: {str(e)}")

@app.delete("/api/ideas/{idea_id}")
async def delete_idea(idea_id: str):
    try:
        doc_ref = db.collection("ideas").document(idea_id)
        doc = doc_ref.get()
        if doc.exists:
            doc_ref.delete()
            return {"message": f"Idea {idea_id} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Idea not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting idea: {str(e)}")

@app.patch("/api/ideas/{idea_id}/favorite")
async def toggle_favorite(idea_id: str, is_favorite: bool):
    try:
        doc_ref = db.collection("ideas").document(idea_id)
        doc_ref.update({"is_favorite": is_favorite})
        return {"message": f"Idea favorite status updated to {is_favorite}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating favorite status: {str(e)}")

@app.get("/api/ideas/search")
async def search_ideas(query: str):
    try:
        ideas_ref = db.collection("ideas")
        docs = ideas_ref.stream()
        ideas = []
        for doc in docs:
            idea_data = doc.to_dict()
            idea_data["id"] = doc.id
            # Simple text search in title, description, and tags
            search_text = f"{idea_data.get('title', '')} {idea_data.get('description', '')} {' '.join(idea_data.get('tags', []))}"
            if query.lower() in search_text.lower():
                ideas.append(idea_data)
        return ideas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching ideas: {str(e)}")

# AI Idea Generation
@app.post("/api/generate-ideas")
async def generate_ideas(request: IdeaRequest):
    try:
        if not openai.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        components_str = ", ".join(request.selected_components)
        
        prompt = f"""
        Generate {request.count} innovative project ideas using these electronic components: {components_str}
        
        Theme: {request.theme}
        Skill Level: {request.skill_level}
        
        For each idea, provide:
        1. Title (creative and engaging)
        2. Description (2-3 sentences)
        3. Problem Statement (what problem does it solve)
        4. Working Principle (how it works technically)
        5. Difficulty level (Beginner/Intermediate/Advanced)
        6. Estimated Cost (in ₹)
        7. Innovation Elements (unique features)
        8. Scalability Options (how to expand the project)
        9. Tags (relevant keywords)
        
        Format as JSON array with these exact fields:
        [{{
            "title": "Project Title",
            "description": "Brief description",
            "problem_statement": "Problem it solves",
            "working_principle": "How it works",
            "difficulty": "Beginner/Intermediate/Advanced",
            "estimated_cost": "₹X,XXX",
            "components": [list of components used],
            "innovation_elements": [list of unique features],
            "scalability_options": [list of expansion possibilities],
            "tags": [relevant tags]
        }}]
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.8
        )
        
        # Parse the response
        ideas_text = response.choices[0].message.content
        try:
            ideas = json.loads(ideas_text)
            # Add unique IDs and timestamps
            for idea in ideas:
                idea["id"] = str(uuid.uuid4())
                idea["is_favorite"] = False
                idea["created_at"] = datetime.now().isoformat()
            return ideas
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            raise HTTPException(status_code=500, detail="Error parsing AI response")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating ideas: {str(e)}")

# User Preferences
@app.get("/api/preferences")
async def get_preferences():
    try:
        if db:
            # For now, return default preferences or get from a single user document
            doc_ref = db.collection("preferences").document("default_user")
            doc = doc_ref.get()
            if doc.exists:
                prefs = doc.to_dict()
                prefs["id"] = doc.id
                return prefs
            else:
                # Return default preferences
                return MOCK_PREFERENCES.copy()
        else:
            # Use mock preferences when Firebase is not available
            return MOCK_PREFERENCES.copy()
    except Exception as e:
        print(f"⚠️  Error fetching preferences: {e}")
        return MOCK_PREFERENCES.copy()

@app.post("/api/preferences")
async def save_preferences(preferences: UserPreferences):
    try:
        prefs_dict = preferences.dict()
        prefs_dict["updated_at"] = datetime.now().isoformat()
        
        doc_ref = db.collection("preferences").document("default_user")
        doc_ref.set(prefs_dict, merge=True)
        
        return prefs_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving preferences: {str(e)}")

# User Stats
@app.get("/api/stats")
async def get_stats():
    try:
        # Count ideas and components
        ideas_ref = db.collection("ideas")
        components_ref = db.collection("components")
        
        ideas_count = len(list(ideas_ref.stream()))
        components_count = len(list(components_ref.stream()))
        
        return {
            "ideas_generated": ideas_count,
            "components_available": components_count,
            "projects_completed": 0,  # This could be tracked separately
            "favorite_ideas": len([doc for doc in ideas_ref.stream() if doc.to_dict().get("is_favorite", False)])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)