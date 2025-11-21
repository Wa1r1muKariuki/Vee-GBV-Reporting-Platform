from typing import Any, Dict, List, Text
from rasa.nlu.extractors.extractor import EntityExtractor
from rasa.shared.nlu.training_data.message import Message
from rasa.shared.nlu.constants import ENTITIES
import re


class GBVEntityExtractor(EntityExtractor):
    """Custom entity extractor for GBV-specific entities"""
    
    # Violence type patterns
    VIOLENCE_PATTERNS = {
        "physical_violence": [
            r"\b(hit|beat|slap|punch|kick|choke|strangle|push|shove)\b",
            r"\bphysical(ly)? (attack|assault|abuse|violence)\b",
        ],
        "sexual_violence": [
            r"\b(rape|sexual assault|molest|forced|touched)\b",
            r"\bsexual(ly)? (abuse|violence|harassment)\b",
        ],
        "emotional_abuse": [
            r"\b(threaten|insult|humiliate|control|manipulate)\b",
            r"\b(emotional|psychological|verbal) abuse\b",
        ],
        "economic_abuse": [
            r"\b(financial|economic) (abuse|control)\b",
            r"\bcontrol(s)? (money|salary|finances)\b",
        ]
    }
    
    # Temporal patterns
    TEMPORAL_PATTERNS = {
        "happening_now": [r"\b(right now|happening now|currently|as we speak)\b"],
        "recent": [r"\b(today|yesterday|last night|this morning|this week)\b"],
        "ongoing": [r"\b(keeps|repeatedly|always|every time|ongoing|continues)\b"],
    }
    
    # Relationship patterns
    RELATIONSHIP_PATTERNS = {
        "intimate_partner": [r"\b(husband|boyfriend|partner|spouse|wife|girlfriend)\b"],
        "ex_partner": [r"\b(ex-husband|ex-boyfriend|ex-partner|former partner)\b"],
        "family_member": [r"\b(father|mother|uncle|brother|sister|cousin|relative)\b"],
        "stranger": [r"\b(stranger|unknown person|someone I don't know)\b"],
        "authority_figure": [r"\b(boss|teacher|supervisor|manager|employer)\b"],
    }
    
    def __init__(self, component_config: Dict[Text, Any] = None):
        super().__init__(component_config)
    
    def extract_entities(self, message: Message) -> List[Dict[Text, Any]]:
        """Extract GBV-specific entities"""
        entities = []
        text = message.get("text", "").lower()
        
        # Extract violence types
        for violence_type, patterns in self.VIOLENCE_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    entities.append({
                        "entity": "incident_type",
                        "value": violence_type,
                        "confidence": 0.9,
                        "extractor": "GBVEntityExtractor"
                    })
                    break
        
        # Extract temporal information
        for timeframe, patterns in self.TEMPORAL_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    entities.append({
                        "entity": "timeframe",
                        "value": timeframe,
                        "confidence": 0.85,
                        "extractor": "GBVEntityExtractor"
                    })
                    break
        
        # Extract relationships
        for relationship, patterns in self.RELATIONSHIP_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    entities.append({
                        "entity": "relationship",
                        "value": relationship,
                        "confidence": 0.85,
                        "extractor": "GBVEntityExtractor"
                    })
                    break
        
        return entities
    
    def process(self, message: Message, **kwargs: Any) -> None:
        """Process message and add extracted entities"""
        extracted_entities = self.extract_entities(message)
        
        # Get existing entities
        existing_entities = message.get(ENTITIES, [])
        
        # Add new entities
        message.set(ENTITIES, existing_entities + extracted_entities, add_to_output=True)