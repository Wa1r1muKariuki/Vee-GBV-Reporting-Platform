"""
Main NLP Analysis Engine for Vee
Integrates intent classification, entity extraction, and emotion detection
"""

import spacy
from transformers import pipeline
from typing import Dict, List, Any, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VeeNLP:
    """Unified NLP engine for trauma-informed GBV support"""
    
    def __init__(self):
        # Load spaCy for entity extraction
        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("✅ spaCy model loaded")
        except OSError:
            logger.error("spaCy model not found. Run: python -m spacy download en_core_web_sm")
            raise
        
        # Load Hugging Face models
        try:
            self.emotion_classifier = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                top_k=None
            )
            logger.info("✅ Emotion classifier loaded")
            
            self.intent_classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli"
            )
            logger.info("✅ Intent classifier loaded")
            
        except Exception as e:
            logger.error(f"Failed to load Hugging Face models: {e}")
            raise
        
        # Define intent categories
        self.report_intents = [
            "reporting an incident",
            "describing violence",
            "seeking help",
            "requesting resources",
            "casual conversation",
            "expressing distress"
        ]
        
        # Crisis keywords for immediate detection
        self.crisis_keywords = {
            "immediate_danger": ["right now", "happening now", "he's here", "attacking me", "help me"],
            "suicidal": ["kill myself", "end my life", "want to die", "suicide", "hurt myself"],
            "severe_distress": ["can't breathe", "panic attack", "breakdown", "can't take it"]
        }
    
    def analyze_full_context(
        self, 
        user_message: str, 
        conversation_history: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Complete NLP analysis pipeline
        Returns: {
            "entities": {...},
            "emotion": {...},
            "intent": {...},
            "report_detection": {...},
            "response_strategy": {...}
        }
        """
        
        # 1. Extract entities
        entities = self.extract_entities(user_message)
        
        # 2. Detect emotion
        emotion = self.detect_emotion(user_message)
        
        # 3. Classify intent
        intent = self.classify_intent(user_message)
        
        # 4. Detect report initiation
        report_detection = self.detect_report_initiation(user_message, conversation_history)
        
        # 5. Generate response strategy
        response_strategy = self.generate_response_strategy(
            emotion, intent, report_detection, entities
        )
        
        return {
            "entities": entities,
            "emotion": emotion,
            "intent": intent,
            "report_detection": report_detection,
            "response_strategy": response_strategy
        }
    
    def extract_entities(self, text: str) -> Dict[str, List[Dict]]:
        """Extract key entities using spaCy"""
        doc = self.nlp(text.lower())
        
        entities = {
            "dates": [],
            "locations": [],
            "people": [],
            "organizations": []
        }
        
        for ent in doc.ents:
            if ent.label_ == "DATE":
                entities["dates"].append({
                    "text": ent.text,
                    "label": ent.label_
                })
            elif ent.label_ in ["GPE", "LOC"]:
                entities["locations"].append({
                    "text": ent.text,
                    "label": ent.label_
                })
            elif ent.label_ == "PERSON":
                entities["people"].append({
                    "text": ent.text,
                    "label": ent.label_
                })
            elif ent.label_ == "ORG":
                entities["organizations"].append({
                    "text": ent.text,
                    "label": ent.label_
                })
        
        # Extract incident type keywords
        incident_keywords = {
            "physical": ["hit", "beat", "slap", "punch", "kick", "choke", "push"],
            "sexual": ["rape", "assault", "forced", "touched", "molest"],
            "emotional": ["threaten", "insult", "control", "manipulate", "scream"],
            "economic": ["money", "salary", "work", "financial", "control finances"]
        }
        
        detected_types = []
        text_lower = text.lower()
        for incident_type, keywords in incident_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                detected_types.append(incident_type)
        
        entities["incident_types"] = detected_types
        
        return entities
    
    def detect_emotion(self, text: str) -> Dict[str, Any]:
        """Detect emotional tone using DistilRoBERTa"""
        try:
            results = self.emotion_classifier(text)[0]
            
            # Sort by score
            sorted_emotions = sorted(results, key=lambda x: x['score'], reverse=True)
            
            primary_emotion = sorted_emotions[0]['label']
            confidence = sorted_emotions[0]['score']
            
            # Map to intensity levels
            intensity = "mild"
            if confidence > 0.8:
                intensity = "severe"
            elif confidence > 0.6:
                intensity = "moderate"
            
            # Check for crisis indicators
            is_crisis = any(
                keyword in text.lower() 
                for keywords in self.crisis_keywords.values() 
                for keyword in keywords
            )
            
            if is_crisis:
                intensity = "crisis"
            
            return {
                "primary_emotion": primary_emotion,
                "confidence": confidence,
                "intensity": intensity,
                "all_emotions": [
                    {"emotion": e['label'], "score": e['score']} 
                    for e in sorted_emotions[:3]
                ],
                "crisis_detected": is_crisis
            }
            
        except Exception as e:
            logger.error(f"Emotion detection failed: {e}")
            return {
                "primary_emotion": "neutral",
                "confidence": 0.5,
                "intensity": "mild",
                "all_emotions": [],
                "crisis_detected": False
            }
    
    def classify_intent(self, text: str) -> Dict[str, Any]:
        """Classify user intent using zero-shot classification"""
        try:
            result = self.intent_classifier(
                text,
                candidate_labels=self.report_intents,
                multi_label=False
            )
            
            return {
                "primary_intent": result['labels'][0],
                "confidence": result['scores'][0],
                "all_intents": [
                    {"intent": label, "score": score}
                    for label, score in zip(result['labels'], result['scores'])
                ]
            }
            
        except Exception as e:
            logger.error(f"Intent classification failed: {e}")
            return {
                "primary_intent": "unknown",
                "confidence": 0.0,
                "all_intents": []
            }
    
    def detect_report_initiation(
        self, 
        text: str, 
        conversation_history: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """Detect if user is starting to report an incident"""
        
        # Report trigger phrases
        report_phrases = [
            "something happened", "i want to report", "i need to tell",
            "he did", "she did", "it happened", "i was",
            "happened to me", "need help with", "want to share"
        ]
        
        text_lower = text.lower()
        
        # Check for explicit report triggers
        has_trigger_phrase = any(phrase in text_lower for phrase in report_phrases)
        
        # Check for incident description
        has_incident_keywords = any(
            keyword in text_lower 
            for keywords in [
                ["hit", "beat", "hurt", "attacked"],
                ["rape", "assaulted", "forced"],
                ["threatened", "controlled", "abused"]
            ]
            for keyword in keywords
        )
        
        # Check conversation context
        context_suggests_report = False
        if conversation_history:
            recent_messages = [msg.get("text", "").lower() for msg in conversation_history[-3:]]
            context_suggests_report = any(
                "report" in msg or "incident" in msg or "happened" in msg
                for msg in recent_messages
            )
        
        is_report_initiation = (
            has_trigger_phrase or 
            (has_incident_keywords and len(text.split()) > 5) or
            context_suggests_report
        )
        
        confidence = 0.0
        if has_trigger_phrase:
            confidence = 0.9
        elif has_incident_keywords:
            confidence = 0.7
        elif context_suggests_report:
            confidence = 0.5
        
        return {
            "is_report_initiation": is_report_initiation,
            "confidence": confidence,
            "indicators": {
                "has_trigger_phrase": has_trigger_phrase,
                "has_incident_keywords": has_incident_keywords,
                "context_suggests_report": context_suggests_report
            }
        }
    
    def generate_response_strategy(
        self, 
        emotion: Dict, 
        intent: Dict, 
        report_detection: Dict,
        entities: Dict
    ) -> Dict[str, Any]:
        """Generate adaptive response strategy based on analysis"""
        
        # Default strategy
        strategy = {
            "tone": "empathetic",
            "next_action": "continue_conversation",
            "escalation_needed": False,
            "should_ask_consent": False,
            "resource_type": None
        }
        
        # Check for crisis
        if emotion.get("crisis_detected") or emotion.get("intensity") == "crisis":
            strategy.update({
                "tone": "urgent_support",
                "next_action": "provide_emergency_resources",
                "escalation_needed": True
            })
            return strategy
        
        # Check for report initiation
        if report_detection.get("is_report_initiation") and report_detection.get("confidence") > 0.6:
            strategy.update({
                "next_action": "start_report_flow",
                "should_ask_consent": True
            })
        
        # Adapt tone based on emotion
        primary_emotion = emotion.get("primary_emotion", "neutral")
        intensity = emotion.get("intensity", "mild")
        
        if primary_emotion in ["fear", "sadness", "disgust"] and intensity in ["moderate", "severe"]:
            strategy["tone"] = "gentle_supportive"
        
        if primary_emotion == "anger" and intensity == "severe":
            strategy["tone"] = "validating"
        
        # Determine resource needs from entities
        incident_types = entities.get("incident_types", [])
        if incident_types:
            if "physical" in incident_types or "sexual" in incident_types:
                strategy["resource_type"] = "medical"
            elif "emotional" in incident_types:
                strategy["resource_type"] = "counseling"
            elif "economic" in incident_types:
                strategy["resource_type"] = "legal"
        
        return strategy


# Standalone testing
if __name__ == "__main__":
    nlp = VeeNLP()
    
    test_messages = [
        "He hit me again last night and I don't know what to do",
        "I want to report something that happened to me",
        "I'm feeling scared and overwhelmed",
        "Can you help me find a lawyer?"
    ]
    
    for msg in test_messages:
        print(f"\n{'='*60}")
        print(f"Message: {msg}")
        print(f"{'='*60}")
        result = nlp.analyze_full_context(msg)
        
        print(f"Emotion: {result['emotion']['primary_emotion']} ({result['emotion']['intensity']})")
        print(f"Intent: {result['intent']['primary_intent']}")
        print(f"Report detected: {result['report_detection']['is_report_initiation']}")
        print(f"Strategy: {result['response_strategy']['next_action']}")