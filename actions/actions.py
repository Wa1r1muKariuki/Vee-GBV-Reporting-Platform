from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, FollowupAction, SessionStarted
import uuid
import re
from datetime import datetime
import sys
import os
import httpx  # For calling FastAPI backend
from typing import Optional
import logging
from nlp_engine.analyzer import VeeNLP


# Add the parent directory to path to import resource modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from .resources_database import get_county_resources, get_national_resources, KENYA_GBV_RESOURCES, get_all_counties, get_verified_counties

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ActionGenerateSessionId(Action):
    """Generate unique session ID for tracking without identity"""
    
    def name(self) -> Text:
        return "action_generate_session_id"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        session_id = f"session_{uuid.uuid4().hex[:16]}"
        user_id = f"anon_{uuid.uuid4().hex[:8]}"
        
        return [
            SlotSet("session_id", session_id),
            SlotSet("user_id", user_id)
        ]


class ActionSaveConsent(Action):
    """Record user's consent and explain data use"""
    
    def name(self) -> Text:
        return "action_save_consent"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get last intent
        last_intent = tracker.latest_message.get('intent', {}).get('name')
        
        if last_intent == "affirm":
            return [
                SlotSet("consent_given", True),
                SlotSet("report_in_progress", True),
                FollowupAction("utter_affirm_courage")
            ]
        elif last_intent == "deny":
            dispatcher.utter_message(response="utter_withdraw_consent")
            return [SlotSet("consent_given", False)]
        else:
            # User asked for clarification
            dispatcher.utter_message(response="utter_explain_data_use")
            return []


class ActionCheckDistressLevel(Action):
    """Enhanced with NLP emotion detection"""
    
    def name(self) -> Text:
        return "action_check_distress_level"
    
    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # First call NLP analysis
        await self.run_action("action_analyze_with_nlp", dispatcher, tracker, domain)
        
        detected_emotion = tracker.get_slot("detected_emotion")
        distress_level = tracker.get_slot("distress_level")
        
        # Rest of your existing logic...
        if distress_level == "crisis":
            dispatcher.utter_message(response="utter_crisis_response")
            return [
                SlotSet("needs_immediate_safety", True),
                FollowupAction("action_provide_resources")
            ]


class ActionAssessSafety(Action):
    """Check if user is in immediate danger"""
    
    def name(self) -> Text:
        return "action_assess_safety"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        last_intent = tracker.latest_message.get('intent', {}).get('name')
        latest_message = tracker.latest_message.get('text', '').lower()
        
        emergency_indicators = [
            "right now", "happening now", "he's here", "she's here",
            "in danger", "attacking me", "emergency"
        ]
        
        timeframe = tracker.get_slot("timeframe")
        
        if (last_intent == "happening_now" or 
            any(word in latest_message for word in emergency_indicators) or
            timeframe == "happening_now"):
            
            return [
                SlotSet("needs_immediate_safety", True),
                FollowupAction("utter_provide_immediate_safety")
            ]
        
        return []


class ActionCollectIncidentDetails(Action):
    """Collect and store incident type information"""
    
    def name(self) -> Text:
        return "action_collect_incident_details"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        last_intent = tracker.latest_message.get('intent', {}).get('name')
        entities = tracker.latest_message.get('entities', [])
        
        # Map intents to incident types
        intent_to_type = {
            "describe_physical_violence": "physical_violence",
            "describe_sexual_violence": "sexual_violence",
            "describe_emotional_abuse": "emotional_abuse",
            "describe_economic_abuse": "economic_abuse",
            "describe_harassment": "harassment",
            "describe_online_gbv": "online_gbv"
        }
        
        incident_type = None
        incident_types_list = tracker.get_slot("incident_types_list") or []
        
        # Get from intent
        if last_intent in intent_to_type:
            incident_type = intent_to_type[last_intent]
            if incident_type not in incident_types_list:
                incident_types_list.append(incident_type)
        
        # Get from entity
        for entity in entities:
            if entity['entity'] == 'incident_type':
                incident_type = entity['value']
                if incident_type not in incident_types_list:
                    incident_types_list.append(incident_type)
        
        # Acknowledge and move forward
        dispatcher.utter_message(response="utter_acknowledge_incident_type")
        dispatcher.utter_message(response="utter_not_your_fault")
        
        # Calculate progress
        progress = tracker.get_slot("questions_answered") or 0.0
        progress += 0.2  # Incident type is 20% of report
        
        return [
            SlotSet("incident_type", incident_type),
            SlotSet("incident_types_list", incident_types_list),
            SlotSet("questions_answered", progress),
            SlotSet("last_checkpoint", "incident_collected"),
            FollowupAction("utter_ask_when_happened")
        ]


class ActionCollectTemporalInfo(Action):
    """Collect when the incident occurred"""
    
    def name(self) -> Text:
        return "action_collect_temporal_info"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        last_intent = tracker.latest_message.get('intent', {}).get('name')
        entities = tracker.latest_message.get('entities', [])
        
        # Map intents to timeframes
        intent_to_timeframe = {
            "happening_now": "happening_now",
            "recent_incident": "recent",
            "past_incident": "past",
            "ongoing_situation": "ongoing"
        }
        
        timeframe = None
        is_ongoing = False
        
        if last_intent in intent_to_timeframe:
            timeframe = intent_to_timeframe[last_intent]
            if last_intent == "ongoing_situation":
                is_ongoing = True
        
        # Get from entity
        for entity in entities:
            if entity['entity'] == 'timeframe':
                timeframe = entity['value']
        
        # Check for emergency
        if timeframe == "happening_now":
            return [
                SlotSet("timeframe", timeframe),
                SlotSet("needs_immediate_safety", True),
                FollowupAction("action_assess_safety")
            ]
        
        dispatcher.utter_message(response="utter_acknowledge_timing")
        
        progress = tracker.get_slot("questions_answered") or 0.2
        progress += 0.15
        
        return [
            SlotSet("timeframe", timeframe),
            SlotSet("is_ongoing", is_ongoing),
            SlotSet("questions_answered", progress),
            SlotSet("last_checkpoint", "temporal_collected"),
            FollowupAction("utter_check_in")  # Emotional check-in
        ]


class ActionCollectLocation(Action):
    """Collect location information with sensitivity"""
    
    def name(self) -> Text:
        return "action_collect_location"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        last_intent = tracker.latest_message.get('intent', {}).get('name')
        entities = tracker.latest_message.get('entities', [])
        
        if last_intent == "location_unsafe_to_share":
            dispatcher.utter_message(response="utter_respect_skip")
            return [
                SlotSet("county", "not_specified"),
                FollowupAction("utter_ask_who_perpetrator")
            ]
        
        county = None
        location_desc = None
        
        # Extract county from entities and validate
        for entity in entities:
            if entity['entity'] == 'county':
                county = entity['value']
                # Validate county
                all_counties = get_all_counties()
                if county.title() not in all_counties:
                    dispatcher.utter_message(text=f"I don't recognize '{county}'. Please provide a valid Kenyan county.")
                    return []
                county = county.title()
            elif entity['entity'] == 'location_type':
                location_desc = entity['value']
        
        if county:
            dispatcher.utter_message(response="utter_acknowledge_location")
            
            progress = tracker.get_slot("questions_answered") or 0.35
            progress += 0.15
            
            return [
                SlotSet("county", county),
                SlotSet("location_description", location_desc),
                SlotSet("questions_answered", progress),
                SlotSet("last_checkpoint", "location_collected"),
                FollowupAction("utter_ask_who_perpetrator")
            ]
        
        return []


class ActionCollectPerpetratorInfo(Action):
    """Collect perpetrator relationship information"""
    
    def name(self) -> Text:
        return "action_collect_perpetrator_info"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        last_intent = tracker.latest_message.get('intent', {}).get('name')
        entities = tracker.latest_message.get('entities', [])
        
        if last_intent == "prefer_not_say_perpetrator":
            dispatcher.utter_message(response="utter_respect_skip")
            return [
                SlotSet("relationship_to_perpetrator", "prefer_not_to_say"),
                FollowupAction("utter_ask_support_needs")
            ]
        
        # Map intents to relationships
        intent_to_relationship = {
            "intimate_partner": "intimate_partner",
            "ex_partner": "ex_partner",
            "family_member": "family_member",
            "stranger": "stranger",
            "authority_figure": "authority_figure"
        }
        
        relationship = None
        
        if last_intent in intent_to_relationship:
            relationship = intent_to_relationship[last_intent]
        
        # Get from entity
        for entity in entities:
            if entity['entity'] == 'relationship':
                relationship = entity['value']
        
        if relationship:
            dispatcher.utter_message(response="utter_acknowledge_relationship")
            
            progress = tracker.get_slot("questions_answered") or 0.5
            progress += 0.2
            
            return [
                SlotSet("relationship_to_perpetrator", relationship),
                SlotSet("questions_answered", progress),
                SlotSet("last_checkpoint", "perpetrator_collected"),
                FollowupAction("utter_ask_support_needs")
            ]
        
        return []


class ActionCollectSupportNeeds(Action):
    """Identify what support the survivor needs"""
    
    def name(self) -> Text:
        return "action_collect_support_needs"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        last_intent = tracker.latest_message.get('intent', {}).get('name')
        
        support_needs = tracker.get_slot("support_needs") or []
        
        # Map intents to needs
        intent_to_need = {
            "need_immediate_safety": "immediate_safety",
            "need_medical_care": "medical_care",
            "need_legal_help": "legal_assistance",
            "need_counseling": "counseling",
            "need_shelter": "shelter"
        }
        
        if last_intent in intent_to_need:
            need = intent_to_need[last_intent]
            if need not in support_needs:
                support_needs.append(need)
            
            # Provide immediate resource for that need
            if need == "immediate_safety":
                dispatcher.utter_message(response="utter_provide_immediate_safety")
            elif need == "medical_care":
                dispatcher.utter_message(response="utter_provide_medical_resources")
            elif need == "legal_assistance":
                dispatcher.utter_message(response="utter_provide_legal_resources")
            elif need == "counseling":
                dispatcher.utter_message(response="utter_provide_counseling_resources")
            elif need == "shelter":
                dispatcher.utter_message(response="utter_provide_shelter_resources")
        
        progress = tracker.get_slot("questions_answered") or 0.7
        progress += 0.15
        
        return [
            SlotSet("support_needs", support_needs),
            SlotSet("questions_answered", progress),
            SlotSet("last_checkpoint", "support_collected"),
            FollowupAction("utter_ask_reporting_barriers")
        ]


class ActionCollectBarriers(Action):
    """Understand barriers to reporting/seeking help"""
    
    def name(self) -> Text:
        return "action_collect_barriers"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        last_intent = tracker.latest_message.get('intent', {}).get('name')
        
        barriers = tracker.get_slot("reporting_barriers") or []
        
        intent_to_barrier = {
            "fear_retaliation": "fear_of_retaliation",
            "dont_trust_police": "dont_trust_authorities",
            "family_pressure": "family_pressure",
            "economic_dependence": "economic_dependence",
            "stigma_concern": "stigma"
        }
        
        if last_intent in intent_to_barrier:
            barrier = intent_to_barrier[last_intent]
            if barrier not in barriers:
                barriers.append(barrier)
            
            dispatcher.utter_message(response="utter_acknowledge_barriers")
        
        progress = tracker.get_slot("questions_answered") or 0.85
        progress += 0.15
        
        return [
            SlotSet("reporting_barriers", barriers),
            SlotSet("questions_answered", min(progress, 1.0)),
            SlotSet("last_checkpoint", "barriers_collected"),
            FollowupAction("utter_report_almost_complete")
        ]


class ActionSubmitReport(Action):
    """Finalize and submit the report to backend"""
    
    def name(self) -> Text:
        return "action_submit_report"
    
    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Collect all gathered information
        report_data = {
            "session_id": tracker.get_slot("session_id"),
            "user_id": tracker.get_slot("user_id"),
            "incident_types": tracker.get_slot("incident_types_list"),
            "timeframe": tracker.get_slot("timeframe"),
            "is_ongoing": tracker.get_slot("is_ongoing"),
            "county": tracker.get_slot("county"),
            "location_description": tracker.get_slot("location_description"),
            "relationship_to_perpetrator": tracker.get_slot("relationship_to_perpetrator"),
            "support_needs": tracker.get_slot("support_needs"),
            "reporting_barriers": tracker.get_slot("reporting_barriers"),
            "needs_immediate_safety": tracker.get_slot("needs_immediate_safety"),
            "consent_given": tracker.get_slot("consent_given"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # In production, send to your FastAPI backend
        # Example:
        # async with httpx.AsyncClient() as client:
        #     response = await client.post(
        #         "http://localhost:8000/report-incident",
        #         json=report_data
        #     )
        #     report_id = response.json().get("report_id")
        
        # For now, generate mock report ID
        report_id = f"rpt_{uuid.uuid4().hex[:8]}"
        
        # Provide response with report ID
        dispatcher.utter_message(
            response="utter_report_submitted",
            report_id=report_id
        )
        
        dispatcher.utter_message(response="utter_provide_next_steps")
        
        return [
            SlotSet("report_in_progress", False),
            SlotSet("questions_answered", 1.0)
        ]


class ActionSaveProgress(Action):
    """Save partial report for continuation later"""
    
    def name(self) -> Text:
        return "action_save_progress"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # In production, save to database
        # For now, maintain in slots
        
        dispatcher.utter_message(response="utter_save_progress")
        
        return [SlotSet("report_in_progress", True)]


class ActionRestoreSession(Action):
    """Restore previous session if user returns"""
    
    def name(self) -> Text:
        return "action_restore_session"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        report_in_progress = tracker.get_slot("report_in_progress")
        last_checkpoint = tracker.get_slot("last_checkpoint")
        
        if report_in_progress and last_checkpoint:
            # Resume from checkpoint
            checkpoint_to_action = {
                "incident_collected": "utter_ask_when_happened",
                "temporal_collected": "utter_ask_where_happened",
                "location_collected": "utter_ask_who_perpetrator",
                "perpetrator_collected": "utter_ask_support_needs",
                "support_collected": "utter_ask_reporting_barriers",
                "barriers_collected": "action_submit_report"
            }
            
            next_action = checkpoint_to_action.get(last_checkpoint, "utter_ask_what_happened")
            
            dispatcher.utter_message(text="Welcome back. Let's continue from where we left off.")
            
            return [FollowupAction(next_action)]
        
        return []


class ActionProvideResources(Action):
    """Provide comprehensive resources based on needs and location"""
    
    def name(self) -> Text:
        return "action_provide_resources"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        county = tracker.get_slot("county")
        support_needs = tracker.get_slot("support_needs") or []
        
        # Always provide national emergency numbers
        message = "📞 **24/7 Emergency Support:**\n\n"
        message += "• GBV Helpline: **1195** (toll-free)\n"
        message += "• Police Emergency: **999 or 112**\n"
        message += "• Befrienders Kenya: **0722 178 177**\n\n"
        
        # Fetch county-specific resources if a county is known
        resources = None
        if county:
            try:
                resources = get_county_resources(county)
            except Exception:
                resources = None
        
        # Provide county-specific resources if available
        if resources:
            message += f"📍 **Resources in {county}:**\n\n"
            
            # Medical
            if "medical_care" in support_needs and resources.get("medical"):
                facility = resources["medical"][0]
                message += f"{facility['name']}: {facility['phone']}\n"
            
            # Legal
            if "legal_assistance" in support_needs and resources.get("legal"):
                legal = resources["legal"][0]
                message += f"{legal['name']}: {legal['phone']}\n"
            
            # Counseling
            if "counseling" in support_needs and resources.get("counseling"):
                counselor = resources["counseling"][0]
                message += f"{counselor['name']}: {counselor['phone']}\n"
            
            # Shelter
            if "shelter" in support_needs and resources.get("shelters"):
                shelter = resources["shelters"][0]
                message += f"{shelter['name']}: {shelter['phone']}\n"
            
            message += "\n"
        
        message += "Would you like detailed information about any specific service?"
        
        dispatcher.utter_message(text=message)
        
        return []


class ActionGroundingExercise(Action):
    """Provide grounding technique for distress"""
    
    def name(self) -> Text:
        return "action_grounding_exercise"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        distress_level = tracker.get_slot("distress_level")
        
        if distress_level in ["severe", "crisis"]:
            dispatcher.utter_message(response="utter_5_4_3_2_1")
        else:
            dispatcher.utter_message(response="utter_grounding_prompt")
        
        return []


class ActionCalculateProgress(Action):
    """Calculate and show progress through reporting"""
    
    def name(self) -> Text:
        return "action_calculate_progress"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        progress = tracker.get_slot("questions_answered") or 0.0
        progress_percent = int(progress * 100)
        
        dispatcher.utter_message(
            text=f"Progress: {progress_percent}% complete"
        )
        
        return []

class ActionGetNationalHotlines(Action):
    """Provide national emergency hotlines"""
    
    def name(self) -> Text:
        return "action_get_national_hotlines"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        hotlines = KENYA_GBV_RESOURCES["national_hotlines"]
        
        message = "🚨 **National Emergency Hotlines (24/7)**\n\n"
        
        # GBV Helpline
        gbv = hotlines["gbv_helpline"]
        message += f"📞 **{gbv['name']}**: {gbv['number']}\n"
        message += f"   • {gbv['cost']} • {gbv['availability']}\n"
        message += f"   • Services: {', '.join(gbv['services'][:3])}\n\n"
        
        # Police Emergency
        police = hotlines["police_emergency"]
        message += f"**{police['name']}**: {police['number']}\n"
        message += f"   • {police['cost']} • {police['availability']}\n\n"
        
        # Childline
        childline = hotlines["childline_kenya"]
        message += f" **{childline['name']}**: {childline['number']}\n"
        message += f"   • {childline['cost']} • For {childline['age_group']}\n\n"
        
        message += "💡 All these services are confidential and free."
        
        dispatcher.utter_message(text=message)
        
        return []


class ActionSearchCountyResources(Action):
    """Search all resources in a specific county"""
    
    def name(self) -> Text:
        return "action_search_county_resources"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get county from slot or entity
        county = tracker.get_slot("county")
        if not county:
            entities = tracker.latest_message.get("entities", [])
            for entity in entities:
                if entity["entity"] == "county":
                    county = entity["value"]
                    break
        
        if not county:
            dispatcher.utter_message(response="utter_ask_county_for_resources")
            return []
        
        # Capitalize county name
        county = county.title()
        
        # Get resources
        resources = get_county_resources(county)
        
        if not resources:
            message = f"I don't have detailed resources for {county} yet.\n\n"
            message += "**However, you can always use these national services:**\n"
            message += "• GBV Helpline: **1195** (24/7, Free)\n"
            message += "• FIDA Kenya Legal Aid: **0800 720 553** (Free)\n"
            message += "• Police Emergency: **999**"
            dispatcher.utter_message(text=message)
            return [SlotSet("county", county)]
        
        # Build response
        message = f"📍 **Resources in {county} County**\n\n"
        
        # Medical
        if resources.get("medical"):
            message += " **Medical Facilities:**\n"
            for facility in resources["medical"][:2]:  # Show top 2
                message += f"• **{facility['name']}**\n"
                message += f"  📞 {facility['phone']}\n"
                if facility.get('hours'):
                    message += f"   {facility['hours']}\n"
                message += "\n"
        
        # Legal
        if resources.get("legal"):
            message += "⚖️ **Legal Services:**\n"
            for service in resources["legal"][:2]:
                message += f"• **{service['name']}**\n"
                message += f"   {service['phone']}\n"
                if service.get('cost'):
                    message += f"  {service['cost']}\n"
                message += "\n"
        
        # Counseling
        if resources.get("counseling"):
            message += " **Counseling Services:**\n"
            for counselor in resources["counseling"][:2]:
                message += f"• **{counselor['name']}**\n"
                message += f"  📞 {counselor['phone']}\n"
                message += "\n"
        
        # Shelters
        if resources.get("shelters"):
            message += "🏠 **Safe Shelters:**\n"
            for shelter in resources["shelters"][:1]:
                message += f"• **{shelter['name']}**\n"
                message += f"  📞 {shelter['phone']}\n"
                message += "\n"
        
        message += "Would you like more details about any specific service?"
        
        dispatcher.utter_message(text=message)
        
        return [SlotSet("county", county)]


class ActionSearchMedicalFacilities(Action):
    """Search medical facilities with GBV units"""
    
    def name(self) -> Text:
        return "action_search_medical_facilities"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        county = tracker.get_slot("county")
        
        if not county:
            # Check for county in latest entities
            entities = tracker.latest_message.get("entities", [])
            for entity in entities:
                if entity["entity"] == "county":
                    county = entity["value"]
                    break
        
        if not county:
            dispatcher.utter_message(response="utter_ask_county_for_resources")
            return []
        
        county = county.title()
        resources = get_county_resources(county, "medical")
        
        if not resources or not resources.get("medical"):
            message = f"I don't have specific medical facilities for {county} yet.\n\n"
            message += "**You can get help at:**\n"
            message += "• Any county referral hospital\n"
            message += "• Call GBV Helpline **1195** for referrals\n"
            message += "• Emergency: **999**"
            dispatcher.utter_message(text=message)
            return [SlotSet("county", county)]
        
        message = f" **Medical Facilities with GBV Services in {county}**\n\n"
        
        for facility in resources["medical"][:3]:  # Top 3
            message += f"**{facility['name']}**\n"
            message += f"📞 Phone: {facility['phone']}\n"
            
            if facility.get('location'):
                message += f"📍 Location: {facility['location']}\n"
            
            if facility.get('services'):
                services_text = ', '.join(facility['services'][:4])
                message += f"Services: {services_text}\n"
            
            if facility.get('hours'):
                message += f" Hours: {facility['hours']}\n"
            
            if facility.get('cost'):
                message += f" Cost: {facility['cost']}\n"
            
            message += "\n"
        
        message += "💡 **Important:**\n"
        message += "• Go within 72 hours for PEP (HIV prevention)\n"
        message += "• Don't wash or change clothes (preserves evidence)\n"
        message += "• All GBV medical care is free or subsidized"
        
        dispatcher.utter_message(text=message)
        
        return [SlotSet("county", county)]


class ActionSearchLegalServices(Action):
    """Search free legal aid services"""
    
    def name(self) -> Text:
        return "action_search_legal_services"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        county = tracker.get_slot("county")
        
        if not county:
            entities = tracker.latest_message.get("entities", [])
            for entity in entities:
                if entity["entity"] == "county":
                    county = entity["value"]
                    break
        
        if not county:
            dispatcher.utter_message(response="utter_ask_county_for_resources")
            return []
        
        county = county.title()
        resources = get_county_resources(county, "legal")
        
        message = f"⚖️ **Free Legal Aid Services in {county}**\n\n"
        
        if resources and resources.get("legal"):
            for service in resources["legal"][:2]:
                message += f"**{service['name']}**\n"
                message += f"📞 {service['phone']}\n"
                
                if service.get('services'):
                    message += f"Services: {', '.join(service['services'][:3])}\n"
                
                if service.get('hours'):
                    message += f" Hours: {service['hours']}\n"
                
                message += f" Cost: {service.get('cost', 'FREE')}\n\n"
        else:
            message += "**FIDA Kenya** provides free legal aid nationwide:\n"
            message += "📞 Toll-free: **0800 720 553**\n"
            message += " Mon-Fri 8:00-17:00\n\n"
            message += "Services include:\n"
            message += "• Free legal advice\n"
            message += "• Court representation\n"
            message += "• Protection orders\n"
            message += "• Legal documentation\n"
        
        dispatcher.utter_message(text=message)
        
        return [SlotSet("county", county)]


class ActionSearchCounselingServices(Action):
    """Search counseling and mental health services"""
    
    def name(self) -> Text:
        return "action_search_counseling_services"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        county = tracker.get_slot("county")
        
        if not county:
            entities = tracker.latest_message.get("entities", [])
            for entity in entities:
                if entity["entity"] == "county":
                    county = entity["value"]
                    break
        
        if not county:
            dispatcher.utter_message(response="utter_ask_county_for_resources")
            return []
        
        county = county.title()
        resources = get_county_resources(county, "counseling")
        
        message = f" **Counseling Services in {county}**\n\n"
        
        if resources and resources.get("counseling"):
            for counselor in resources["counseling"]:
                message += f"**{counselor['name']}**\n"
                message += f"📞 {counselor['phone']}\n"
                
                if counselor.get('services'):
                    message += f"Services: {', '.join(counselor['services'][:3])}\n"
                
                message += "\n"
        else:
            message += "**National Counseling Services:**\n\n"
            message += "• **LVCT Health**: 1190 (Free)\n"
            message += "• **Befrienders Kenya**: 0722 178177 (24/7)\n"
            message += "• **Kenya Red Cross**: 1199 (24/7)\n\n"
            message += "All services are confidential and free."
        
        dispatcher.utter_message(text=message)
        
        return [SlotSet("county", county)]


class ActionSearchShelters(Action):
    """Search safe shelters and housing"""
    
    def name(self) -> Text:
        return "action_search_shelters"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        county = tracker.get_slot("county")
        
        if not county:
            entities = tracker.latest_message.get("entities", [])
            for entity in entities:
                if entity["entity"] == "county":
                    county = entity["value"]
                    break
        
        if not county:
            dispatcher.utter_message(response="utter_ask_county_for_resources")
            return []
        
        county = county.title()
        resources = get_county_resources(county, "shelters")
        
        message = f" **Safe Shelters in {county}**\n\n"
        
        if resources and resources.get("shelters"):
            for shelter in resources["shelters"]:
                message += f"**{shelter['name']}**\n"
                message += f"📞 {shelter['phone']}\n"
                
                if shelter.get('services'):
                    message += f"Services: {', '.join(shelter['services'][:3])}\n"
                
                if shelter.get('duration'):
                    message += f"Duration: {shelter['duration']}\n"
                
                message += "\n"
        else:
            message += "**For safe shelter, contact:**\n\n"
            message += "• **GBV Helpline**: 1195\n"
            message += "  They can connect you to safe houses\n\n"
            message += "• **COVAW**: 0736 002606 / 0722 384096\n"
            message += "  Provides shelter and support\n"
        
        message += "\n💡 Shelters provide:\n"
        message += "• Safe temporary housing\n"
        message += "• Counseling\n"
        message += "• Legal support\n"
        message += "• Economic empowerment programs"
        
        dispatcher.utter_message(text=message)
        
        return [SlotSet("county", county)]


class ActionExplainResourceCosts(Action):
    """Explain which services are free"""
    
    def name(self) -> Text:
        return "action_explain_resource_costs"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        message = " **FREE Services for GBV Survivors:**\n\n"
        message += "**Legal Services:**\n"
        message += "• FIDA Kenya: 0800 720 553 (Toll-free)\n"
        message += "• Kituo Cha Sheria (Legal aid)\n\n"
        
        message += "**Medical Care:**\n"
        message += "• Public hospital GBV units (Free/Subsidized)\n"
        message += "• PEP and emergency contraception (Free)\n"
        message += "• Nairobi Women's Hospital GBV Centre (Free)\n\n"
        
        message += "**Counseling:**\n"
        message += "• LVCT Health: 1190\n"
        message += "• Befrienders: 0722 178177\n"
        message += "• Kenya Red Cross: 1199\n\n"
        
        message += "**Hotlines:**\n"
        message += "• GBV Helpline: 1195 (24/7)\n"
        message += "• Police: 999 (24/7)\n\n"
        
        message += "❗ **Don't let money stop you from getting help.**"
        
        dispatcher.utter_message(text=message)
        
        return []


class ActionValidateCounty(Action):
    """Validate if county name is recognized"""
    
    def name(self) -> Text:
        return "action_validate_county"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        county = tracker.get_slot("county")
        
        if not county:
            return []
        
        all_counties = get_all_counties()
        county_title = county.title()
        
        if county_title not in all_counties:
            message = f"I don't recognize '{county}'. Available counties include:\n"
            message += ", ".join(all_counties[:10]) + ", and more.\n\n"
            message += "Which county are you in?"
            
            dispatcher.utter_message(text=message)
            return [SlotSet("county", None)]
        
        return [SlotSet("county", county_title)]


class ActionGetAllCounties(Action):
    """List all available counties"""
    
    def name(self) -> Text:
        return "action_get_all_counties"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        all_counties = get_all_counties()
        verified_counties = get_verified_counties()
        
        message = "📍 **Counties with Verified Resources:**\n"
        message += ", ".join(verified_counties) + "\n\n"
        
        message += "**All Kenya Counties:**\n"
        message += ", ".join(all_counties) + "\n\n"
        
        message += "For any county, you can always use:\n"
        message += "• GBV Helpline: 1195\n"
        message += "• FIDA Kenya: 0800 720 553"
        
        dispatcher.utter_message(text=message)
        
        return []        
    
    # Add this class to your actions.py file

from typing import Dict, Text, Any, List
from rasa_sdk import FormValidationAction, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.types import DomainDict
from rasa_sdk.events import SlotSet


class ValidateIncidentReportForm(FormValidationAction):
    """Validates the incident report form with trauma-informed approach"""
    
    def name(self) -> Text:
        return "validate_incident_report_form"
    
    # === CONSENT VALIDATION ===
    def validate_consent_given(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate consent"""
        
        last_intent = tracker.latest_message.get("intent", {}).get("name")
        
        if last_intent == "affirm":
            dispatcher.utter_message(text="Thank you for trusting me. Your courage matters.")
            return {"consent_given": True}
        elif last_intent == "deny" or last_intent == "withdraw_consent":
            dispatcher.utter_message(response="utter_withdraw_consent")
            return {"consent_given": False, "requested_slot": None}
        elif last_intent == "ask_why_question":
            dispatcher.utter_message(response="utter_explain_data_use")
            return {"consent_given": None}  # Ask again
        else:
            return {"consent_given": None}
    
    # === INCIDENT TYPE VALIDATION ===
    def validate_incident_type(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate and acknowledge incident type"""
        
        last_intent = tracker.latest_message.get("intent", {}).get("name")
        
        # Map intents to incident types
        intent_to_type = {
            "describe_physical_violence": "physical_violence",
            "describe_sexual_violence": "sexual_violence",
            "describe_emotional_abuse": "emotional_abuse",
            "describe_economic_abuse": "economic_abuse",
        }
        
        # Handle skip
        if last_intent == "want_to_skip":
            dispatcher.utter_message(response="utter_skip_question")
            return {"incident_type": "not_specified"}
        
        # Handle emotional distress
        if last_intent in ["express_fear", "express_shame", "express_overwhelm"]:
            # Respond to emotion first
            if last_intent == "express_fear":
                dispatcher.utter_message(response="utter_respond_to_fear")
            elif last_intent == "express_shame":
                dispatcher.utter_message(response="utter_respond_to_shame")
            elif last_intent == "express_overwhelm":
                dispatcher.utter_message(response="utter_respond_to_overwhelm")
                dispatcher.utter_message(response="utter_offer_break")
            
            # Don't fill slot yet, ask again gently
            dispatcher.utter_message(text="Whenever you're ready, could you tell me what happened? Take your time.")
            return {"incident_type": None}
        
        # Get incident type from intent
        if last_intent in intent_to_type:
            incident_type = intent_to_type[last_intent]
            
            # Trauma-informed acknowledgment
            dispatcher.utter_message(response="utter_acknowledge_incident_type")
            dispatcher.utter_message(response="utter_not_your_fault")
            
            # Check for immediate danger
            if last_intent == "describe_physical_violence":
                dispatcher.utter_message(text="Are you safe right now?")
            
            return {"incident_type": incident_type}
        
        # If slot_value provided (from entity or custom)
        if slot_value:
            dispatcher.utter_message(response="utter_acknowledge_incident_type")
            return {"incident_type": slot_value}
        
        return {"incident_type": None}
    
    # === TIMEFRAME VALIDATION ===
    def validate_timeframe(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate timing"""
        
        last_intent = tracker.latest_message.get("intent", {}).get("name")
        
        # Skip handling
        if last_intent == "want_to_skip":
            dispatcher.utter_message(response="utter_skip_question")
            return {"timeframe": "not_specified"}
        
        # Emergency handling
        if last_intent == "report_emergency" or "happening now" in tracker.latest_message.get("text", "").lower():
            dispatcher.utter_message(response="utter_emergency_response")
            return {"timeframe": "happening_now", "needs_immediate_safety": True}
        
        # Intent mapping
        intent_to_timeframe = {
            "recent_incident": "recent",
            "ongoing_situation": "ongoing"
        }
        
        if last_intent in intent_to_timeframe:
            timeframe = intent_to_timeframe[last_intent]
            dispatcher.utter_message(response="utter_acknowledge_timing")
            
            # Emotional check-in
            dispatcher.utter_message(text="How are you feeling right now?")
            
            return {"timeframe": timeframe}
        
        if slot_value:
            dispatcher.utter_message(response="utter_acknowledge_timing")
            return {"timeframe": slot_value}
        
        return {"timeframe": None}
    
    # === LOCATION VALIDATION ===
    def validate_county(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate county with safety consideration"""
        
        last_intent = tracker.latest_message.get("intent", {}).get("name")
        
        # Respect safety concerns
        if last_intent == "location_unsafe_to_share" or last_intent == "want_to_skip":
            dispatcher.utter_message(text="That's completely okay. Your safety comes first.")
            return {"county": "not_specified"}
        
        # Extract from entities
        entities = tracker.latest_message.get("entities", [])
        for entity in entities:
            if entity["entity"] == "county":
                county = entity["value"].title()
                
                # Validate against known counties
                valid_counties = [
                    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu",
                    "Uasin Gishu", "Machakos", "Kilifi", "Kakamega", "Nyeri",
                    "Eldoret", "Meru", "Kisii", "Bungoma", "Garissa"
                ]
                
                if county in valid_counties:
                    dispatcher.utter_message(response="utter_acknowledge_location")
                    return {"county": county}
                else:
                    dispatcher.utter_message(
                        text=f"I don't recognize '{county}'. Could you provide a Kenyan county name? You can also skip this question."
                    )
                    return {"county": None}
        
        if slot_value:
            dispatcher.utter_message(response="utter_acknowledge_location")
            return {"county": slot_value}
        
        return {"county": None}
    
    # === PERPETRATOR RELATIONSHIP VALIDATION ===
    def validate_relationship_to_perpetrator(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate perpetrator relationship"""
        
        last_intent = tracker.latest_message.get("intent", {}).get("name")
        
        # Skip handling
        if last_intent == "prefer_not_say_perpetrator" or last_intent == "want_to_skip":
            dispatcher.utter_message(text="That's okay. You don't have to share this.")
            return {"relationship_to_perpetrator": "prefer_not_to_say"}
        
        # Intent mapping
        intent_to_relationship = {
            "intimate_partner": "intimate_partner",
            "ex_partner": "ex_partner",
            "family_member": "family_member",
            "stranger": "stranger",
            "authority_figure": "authority_figure"
        }
        
        if last_intent in intent_to_relationship:
            relationship = intent_to_relationship[last_intent]
            dispatcher.utter_message(response="utter_acknowledge_relationship")
            
            # Context-specific responses
            if relationship == "intimate_partner":
                dispatcher.utter_message(
                    text="I understand. Many people face violence from someone close to them. You're not alone."
                )
            elif relationship == "authority_figure":
                dispatcher.utter_message(
                    text="Thank you for sharing. Abuse of power is particularly difficult. You deserve support."
                )
            
            return {"relationship_to_perpetrator": relationship}
        
        if slot_value:
            dispatcher.utter_message(response="utter_acknowledge_relationship")
            return {"relationship_to_perpetrator": slot_value}
        
        return {"relationship_to_perpetrator": None}
    
    # === SUPPORT NEEDS VALIDATION ===
    def validate_support_needs(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Collect support needs"""
        
        last_intent = tracker.latest_message.get("intent", {}).get("name")
        
        support_needs = []
        
        # Map intents to needs
        intent_to_need = {
            "need_immediate_safety": "immediate_safety",
            "need_medical_care": "medical_care",
            "need_legal_help": "legal_assistance",
            "need_counseling": "counseling",
            "need_shelter": "shelter"
        }
        
        if last_intent in intent_to_need:
            need = intent_to_need[last_intent]
            support_needs.append(need)
            
            # Provide immediate guidance for that need
            if need == "immediate_safety":
                dispatcher.utter_message(response="utter_emergency_response")
            elif need == "medical_care":
                dispatcher.utter_message(
                    text="It's important to seek medical care soon, especially within 72 hours for certain treatments. I can help you find facilities near you."
                )
            elif need == "legal_assistance":
                dispatcher.utter_message(
                    text="Legal help is available. FIDA Kenya provides free legal aid: 0800 720 553."
                )
            elif need == "counseling":
                dispatcher.utter_message(
                    text="Counseling can be very helpful. There are free services available."
                )
            elif need == "shelter":
                dispatcher.utter_message(
                    text="Safe shelter is available. The GBV Helpline (1195) can connect you to safe houses."
                )
            
            return {"support_needs": support_needs}
        
        # Handle request for resources
        if last_intent == "request_resources":
            dispatcher.utter_message(
                text="I can help you find resources. Let me know what you need: medical, legal, counseling, or shelter?"
            )
            return {"support_needs": None}
        
        if last_intent == "want_to_skip":
            dispatcher.utter_message(text="That's okay. You can access resources anytime.")
            return {"support_needs": ["none_specified"]}
        
        if slot_value:
            return {"support_needs": slot_value if isinstance(slot_value, list) else [slot_value]}
        
        return {"support_needs": None}
    
class ActionAnalyzeWithNLP(Action):
    """Use FastAPI NLP endpoint to analyze user message"""
    
    def name(self) -> Text:
        return "action_analyze_with_nlp"
    
    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        latest_message = tracker.latest_message.get('text', '')
        
        # Call FastAPI NLP endpoint
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "http://localhost:8000/analyze",
                    json={"message": latest_message},
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    nlp_result = response.json()["analysis"]
                    
                    # Update slots based on NLP analysis
                    return [
                        SlotSet("detected_emotion", nlp_result["emotion"]["primary_emotion"]),
                        SlotSet("distress_level", nlp_result["emotion"]["intensity"]),
                        SlotSet("is_report_initiation", nlp_result["report_detection"]["is_report_initiation"])
                    ]
            except Exception as e:
                logger.error(f"NLP analysis failed: {e}")
        
        return []

# NEW: Action to call FastAPI for report submission
class ActionSubmitToBackend(Action):
    """Submit report to FastAPI backend"""
    
    def name(self) -> Text:
        return "action_submit_to_backend"
    
    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        report_data = {
            "consent_given": tracker.get_slot("consent_given"),
            "incident_type": tracker.get_slot("incident_type"),
            "timeframe": tracker.get_slot("timeframe"),
            "county": tracker.get_slot("county"),
            "relationship_to_perpetrator": tracker.get_slot("relationship_to_perpetrator"),
            "support_needs": tracker.get_slot("support_needs"),
            "incident_description": tracker.latest_message.get("text", ""),
            "language_used": "en"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "http://localhost:8000/report/submit",
                    json=report_data,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    report_id = result.get("report_id", "")
                    
                    dispatcher.utter_message(
                        text=f"Your report has been submitted safely. Reference: {report_id}"
                    )
                    
                    # Provide resources
                    resources = result.get("resources", [])
                    if resources:
                        resource_text = "\n\n📞 **Available Resources:**\n\n"
                        for r in resources[:3]:
                            resource_text += f"• **{r['name']}**: {r['contact']}\n"
                        dispatcher.utter_message(text=resource_text)
                    
                    return [SlotSet("report_submitted", True)]
                    
            except Exception as e:
                logger.error(f"Report submission failed: {e}")
                dispatcher.utter_message(
                    text="I'm having trouble submitting your report. Your information is safe. Would you like to try again?"
                )
        
        return []   

vee_nlp = VeeNLP()

class ActionAnalyzeWithNLP(Action):
    """Enhanced NLP analysis using VeeNLP"""
    
    def name(self) -> Text:
        return "action_analyze_with_nlp"
    
    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        latest_message = tracker.latest_message.get('text', '')
        
        # Get conversation history for context
        conversation_history = []
        for event in tracker.events:
            if event.get("event") == "user":
                conversation_history.append({"text": event.get("text", "")})
        
        try:
            # Full NLP analysis
            analysis = vee_nlp.analyze_full_context(latest_message, conversation_history)
            
            emotion = analysis["emotion"]
            intent = analysis["intent"]
            report_detection = analysis["report_detection"]
            entities = analysis["entities"]
            strategy = analysis["response_strategy"]
            
            # Log for monitoring
            logger.info(f"NLP Analysis: Emotion={emotion['primary_emotion']}, "
                       f"Intent={intent['primary_intent']}, "
                       f"Report={report_detection['is_report_initiation']}")
            
            slots_to_set = [
                SlotSet("detected_emotion", emotion["primary_emotion"]),
                SlotSet("distress_level", emotion["intensity"]),
                SlotSet("is_report_initiation", report_detection["is_report_initiation"])
            ]
            
            # Auto-extract entities if found
            if entities.get("incident_types"):
                slots_to_set.append(SlotSet("incident_type", entities["incident_types"][0]))
            
            if entities.get("locations") and not tracker.get_slot("county"):
                # Try to extract county
                location = entities["locations"][0]["text"].title()
                slots_to_set.append(SlotSet("county", location))
            
            # Handle crisis immediately
            if emotion.get("crisis_detected"):
                dispatcher.utter_message(response="utter_crisis_response")
                slots_to_set.append(SlotSet("needs_immediate_safety", True))
                return slots_to_set + [FollowupAction("action_provide_resources")]
            
            # Start report flow if detected
            if (report_detection["is_report_initiation"] and 
                report_detection["confidence"] > 0.7 and
                not tracker.get_slot("consent_given")):
                return slots_to_set + [FollowupAction("utter_ask_consent")]
            
            return slots_to_set
            
        except Exception as e:
            logger.error(f"NLP analysis failed: {e}")
            return []
