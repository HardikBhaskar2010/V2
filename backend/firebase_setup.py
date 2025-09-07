#!/usr/bin/env python3
"""
Firebase Setup Script for Atal Idea Generator

This script helps initialize Firebase connection using Application Default Credentials.
Since we're using Firebase Admin SDK, we can use different authentication methods:

1. Application Default Credentials (recommended for development)
2. Service Account Key File
3. Environment variables
"""

import os
import firebase_admin
from firebase_admin import credentials, firestore
import json

def setup_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if Firebase is already initialized
        if firebase_admin._apps:
            print("✅ Firebase is already initialized")
            return firestore.client()
        
        # Method 1: Try to use Application Default Credentials
        try:
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)
            print("✅ Firebase initialized with Application Default Credentials")
            return firestore.client()
        except Exception as e:
            print(f"❌ Application Default Credentials failed: {e}")
        
        # Method 2: Try to use service account key file
        key_file_path = os.path.join(os.path.dirname(__file__), 'firebase-key.json')
        if os.path.exists(key_file_path):
            try:
                cred = credentials.Certificate(key_file_path)
                firebase_admin.initialize_app(cred)
                print("✅ Firebase initialized with service account key file")
                return firestore.client()
            except Exception as e:
                print(f"❌ Service account key file failed: {e}")
        
        # Method 3: Try to create from existing Firebase config
        firebase_config = {
            "type": "service_account",
            "project_id": "atl-idea-gen",
            "private_key_id": "dummy_key_id",
            "private_key": "-----BEGIN PRIVATE KEY-----\nDUMMY_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
            "client_email": "firebase-adminsdk@atl-idea-gen.iam.gserviceaccount.com",
            "client_id": "dummy_client_id",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk@atl-idea-gen.iam.gserviceaccount.com"
        }
        
        print("⚠️  Using dummy credentials - Firebase operations may not work in production")
        print("   Please set up proper Firebase credentials for production use")
        
        # For development, we'll continue without proper Firebase credentials
        # The app will still work with local data and API endpoints
        return None
        
    except Exception as e:
        print(f"❌ Firebase setup failed: {e}")
        return None

def test_firebase_connection(db):
    """Test Firebase connection by trying to read/write"""
    if not db:
        print("⚠️  Skipping Firebase connection test - no database client")
        return False
    
    try:
        # Try to access a test collection
        test_ref = db.collection('test').document('connection_test')
        test_ref.set({'timestamp': firestore.SERVER_TIMESTAMP, 'status': 'connected'})
        
        # Try to read it back
        doc = test_ref.get()
        if doc.exists:
            print("✅ Firebase connection test successful")
            # Clean up test document
            test_ref.delete()
            return True
        else:
            print("❌ Firebase connection test failed - document not found")
            return False
            
    except Exception as e:
        print(f"❌ Firebase connection test failed: {e}")
        return False

def create_sample_data(db):
    """Create sample components data in Firebase"""
    if not db:
        print("⚠️  Skipping sample data creation - no database client")
        return
    
    sample_components = [
        {
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
    
    try:
        components_ref = db.collection('components')
        
        # Check if components already exist
        existing_docs = list(components_ref.limit(1).stream())
        if existing_docs:
            print("✅ Sample components already exist in database")
            return
        
        # Add sample components
        for component in sample_components:
            doc_ref = components_ref.add(component)
            print(f"✅ Added component: {component['name']}")
        
        print(f"✅ Successfully created {len(sample_components)} sample components")
        
    except Exception as e:
        print(f"❌ Failed to create sample data: {e}")

if __name__ == "__main__":
    print("🔥 Setting up Firebase for Atal Idea Generator...")
    print("=" * 50)
    
    # Initialize Firebase
    db = setup_firebase()
    
    # Test connection
    if db:
        test_firebase_connection(db)
        create_sample_data(db)
    
    print("\n" + "=" * 50)
    print("🔥 Firebase setup complete!")
    print("\nNext steps:")
    print("1. Start the backend server: python server.py")
    print("2. Start the frontend: cd ../frontend && yarn start")