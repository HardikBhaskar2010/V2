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
if not firebase_admin._apps:
    # Use service account key from environment or default credentials
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)

db = firestore.client()

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
        components_ref = db.collection("components")
        docs = components_ref.stream()
        components = []
        for doc in docs:
            component_data = doc.to_dict()
            component_data["id"] = doc.id
            components.append(component_data)
        return components
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching components: {str(e)}")

@app.post("/api/components")
async def create_component(component: Component):
    try:
        component_dict = component.dict()
        if not component_dict.get("id"):
            component_dict["id"] = str(uuid.uuid4())
        
        component_dict["created_at"] = datetime.now().isoformat()
        
        # Add to Firebase
        doc_ref = db.collection("components").document(component_dict["id"])
        doc_ref.set(component_dict)
        
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
        # For now, return default preferences or get from a single user document
        doc_ref = db.collection("preferences").document("default_user")
        doc = doc_ref.get()
        if doc.exists:
            prefs = doc.to_dict()
            prefs["id"] = doc.id
            return prefs
        else:
            # Return default preferences
            default_prefs = {
                "id": "default_user",
                "skill_level": "Beginner",
                "selected_themes": [],
                "interests": [],
                "dark_mode_enabled": False,
                "project_duration": "Short-term",
                "team_size": "Individual"
            }
            return default_prefs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching preferences: {str(e)}")

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