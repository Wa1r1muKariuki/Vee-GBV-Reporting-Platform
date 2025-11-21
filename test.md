3: Run mass testingd syntax
>> python test_bot_conversations.py
🤖 Vee Bot Mass Testing Tool
============================================================
This will test your chatbot with multiple scenarios
Make sure your backend and Rasa are running!  
============================================================

Press Enter to start testing...

🧪 STARTING BOT MASS TESTING
============================================================
Total Scenarios: 10
Start Time: 2025-11-09 16:50:51
============================================================

============================================================
Testing: Clear Harassment Report
============================================================

[1] User: Hi
[1] Bot (4.29s): Habari. I'm Vee, and I'm here to support you in a safe, confidential space. Everything we discuss is anonymous....       

[2] User: I want to report something
[2] Bot (0.34s): Before we begin, I want you to know:
• This conversation is completely anonymous   
• You can stop at any time
• You control what you share
• Your information helps identify areas needing support | Do yo...

[3] User: harassment
[3] Bot (2.41s): ...

[4] User: yesterday
[4] Bot (2.43s): Thank you for sharing when this happened. | How are you feeling right now? 
It's okay to take a break if you need one.... 

[5] User: Nairobi
[5] Bot (2.48s): Thank you. Knowing this helps us connect you with nearby support services if you need them. | If you're comfortable sharing, what is your relationship to the person who did this? You can skip this que...

[6] User: stranger
[6] Bot (2.45s): Thank you for sharing that information. | What kind of support would be most helpful for you right now?
• Medical care
• Legal assistance
• Counseling
• Safe shelter
• Just information...

[7] User: I need counseling
[7] Bot (2.63s): 💙 **Counseling & Emotional Support:** | • LVCT Health: 1190 (counseling hotline)
• Befrienders Kenya: 0722 178 177
• Many hospitals have GBV counselors
• Call 1195 for referrals | Many survivors face ...

[8] User: yes
[8] Bot (2.65s): Thank you for trusting me with this. Remember, you're in control—you can stop or skip any question. | When you're ready, 
could you tell me what happened? Take your time, and remember you can share as ...

────────────────────────────────────────────────────────────
EVALUATION:
  ✅ should_collect_incident_type
  ✅ should_collect_timeframe
  ❌ should_collect_location
  ✅ should_offer_resources

Score: 75.0%
Avg Response Time: 2.46s

============================================================
Testing: Emotional Support → Report
============================================================

[1] User: hello
[1] Bot (2.47s): Habari. I'm Vee, and I'm here to support you in a safe, confidential space. Everything we discuss is anonymous....       

[2] User: I'm feeling scared
[2] Bot (2.49s): Your fear is completely valid and understandable. Being afraid is a natural response to what you've experienced. You're showing courage by reaching out....

[3] User: my husband hit me
[3] Bot (2.45s): I understand this is someone 
very close to you. That makes this situation particularly complex and painful. You're not alone in this. | What kind of support would be most helpful for you right now?
• ...

[4] User: today
[4] Bot (2.45s): Thank you for sharing when this happened. | How are you feeling right now? 
It's okay to take a break if you need one.... 

[5] User: Mombasa
[5] Bot (2.48s): Thank you. Knowing this helps us connect you with nearby support services if you need them. | If you're comfortable sharing, what is your relationship to the person who did this? You can skip this que...

[6] User: my partner
[6] Bot (2.41s): Thank you for sharing that information. | What kind of support would be most helpful for you right now?
• Medical care
• Legal assistance
• Counseling
• Safe shelter
• Just information...

[7] User: I need medical care
[7] Bot (2.46s): 🏥 **Medical Support:** | • Seek care within 72 hours for sexual assault (PEP available)
• Nairobi Women's Hospital GBV Center: 0719 312 000
• Visit nearest public hospital - ask for Gender Desk
• Call...

[8] User: yes
[8] Bot (2.49s): Thank you for trusting me with this. Remember, you're in control—you can stop or skip any question. | When you're ready, 
could you tell me what happened? Take your time, and remember you can share as ...

────────────────────────────────────────────────────────────
EVALUATION:
  ✅ should_show_empathy
  ✅ should_recognize_violence
  ✅ should_offer_immediate_help

Score: 100.0%
Avg Response Time: 2.46s

============================================================
Testing: Hesitant User
============================================================

[1] User: hi
[1] Bot (2.40s): Habari. I'm Vee, and I'm here to support you in a safe, confidential space. Everything we discuss is anonymous....       

[2] User: I don't know if I should report this[2] Bot (4.51s): We're almost done. You're doing really well. Just a moment while I prepare 
your report summary... | ✅ **Report Submitted 
Successfully** | Your report ID: **VEE-62EAD7C3** | Your information has been r...

[3] User: something bad happened
[3] Bot (0.37s): Before we begin, I want you to know:
• This conversation is completely anonymous   
• You can stop at any time
• You control what you share
• Your information helps identify areas needing support | Do yo...

[4] User: I'm not sure
[4] Bot (0.37s): ...

[5] User: maybe yesterday
[5] Bot (0.35s): ...

[6] User: Kisumu
[6] Bot (2.47s): Thank you. Knowing this helps us connect you with nearby support services if you need them. | If you're comfortable sharing, what is your relationship to the person who did this? You can skip this que...

[7] User: no
[7] Bot (2.45s): I understand. Your wellbeing 
and comfort come first. If you change your mind, I'm here....

────────────────────────────────────────────────────────────
EVALUATION:
  ✅ should_be_patient
  ✅ should_not_pressure
  ✅ should_offer_exit

Score: 100.0%
Avg Response Time: 1.85s

============================================================
Testing: Emergency - Immediate Danger
============================================================

[1] User: help
[1] Bot (4.56s): We're almost done. You're doing really well. Just a moment while I prepare 
your report summary... | ✅ **Report Submitted 
Successfully** | Your report ID: **VEE-D39C6861** | Your information has been r...

[2] User: he's threatening me now
[2] Bot (4.67s): We're almost done. You're doing really well. Just a moment while I prepare 
your report summary... | ✅ **Report Submitted 
Successfully** | Your report ID: **VEE-041AB0D8** | Your information has been r...

[3] User: I'm scared
[3] Bot (2.55s): Your fear is completely valid and understandable. Being afraid is a natural response to what you've experienced. You're showing courage by reaching out....

[4] User: happening now
[4] Bot (2.41s): 🚨 **If you are in immediate 
danger:** | 1. Get to a safe place if possible2. Call 999 (Police) or 112 immediately       
3. Call 1195 (GBV Helpline - 24/7, free)      
4. Go to the nearest police station or publi...

[5] User: Nairobi
[5] Bot (2.48s): Thank you. Knowing this helps us connect you with nearby support services if you need them. | If you're comfortable sharing, what is your relationship to the person who did this? You can skip this que...

────────────────────────────────────────────────────────────
EVALUATION:
  ✅ should_prioritize_safety
  ✅ should_give_emergency_numbers
  ❌ response_time_under_2s

Score: 66.7%
Avg Response Time: 3.34s

============================================================
Testing: Multiple Types of Abuse
============================================================

[1] User: hi
[1] Bot (2.73s): Habari. I'm Vee, and I'm here to support you in a safe, confidential space. Everything we discuss is anonymous....       

[2] User: I need to report abuse
[2] Bot (4.52s): We're almost done. You're doing really well. Just a moment while I prepare 
your report summary... | ✅ **Report Submitted 
Successfully** | Your report ID: **VEE-9E63405B** | Your information has been r...

[3] User: physical and emotional abuse        
[3] Bot (2.46s): Thank you for sharing that with me. I want you to know that what happened to you is not your fault. You didn't deserve this. | When did this happen? You can be as specific or general as you feel comfo...

[4] User: this week
[4] Bot (0.37s): ...

[5] User: Nakuru
[5] Bot (2.45s): Thank you. Knowing this helps us connect you with nearby support services if you need them. | If you're comfortable sharing, what is your relationship to the person who did this? You can skip this que...

[6] User: my partner
[6] Bot (2.76s): Thank you for sharing that information. | What kind of support would be most helpful for you right now?
• Medical care
• Legal assistance
• Counseling
• Safe shelter
• Just information...

[7] User: I need everything - medical, legal, 
counseling
[7] Bot (4.69s): We're almost done. You're doing really well. Just a moment while I prepare 
your report summary... | ✅ **Report Submitted 
Successfully** | Your report ID: **VEE-3A90D815** | Your information has been r...

[8] User: yes
[8] Bot (2.62s): Thank you for trusting me with this. Remember, you're in control—you can stop or skip any question. | When you're ready, 
could you tell me what happened? Take your time, and remember you can share as ...

────────────────────────────────────────────────────────────
EVALUATION:
  ✅ should_handle_multiple_types
  ✅ should_provide_comprehensive_resources    

Score: 100.0%
Avg Response Time: 2.83s

============================================================
Testing: Swahili Speaker
============================================================

[1] User: Habari
[1] Bot (4.72s): We're almost done. You're doing really well. Just a moment while I prepare 
your report summary... | ✅ **Report Submitted 
Successfully** | Your report ID: **VEE-8A4FDFF0** | Your information has been r...

[2] User: nataka kuripoti
[2] Bot (4.49s): We're almost done. You're doing really well. Just a moment while I prepare 
your report summary... | ✅ **Report Submitted 
Successfully** | Your report ID: **VEE-0BF43F3C** | Your information has been r...

[3] User: nilidhulumika
[3] Bot (4.53s): We're almost done. You're doing really well. Just a moment while I prepare 
your report summary... | ✅ **Report Submitted 
Successfully** | Your report ID: **VEE-3C078546** | Your information has been r...

[4] User: jana
[4] Bot (4.57s): We're almost done. You're doing really well. Just a moment while I prepare 
your report summary... | ✅ **Report Submitted 
Successfully** | Your report ID: **VEE-757B445E** | Your information has been r...

[5] User: Mombasa
[5] Bot (2.58s): Thank you. Knowing this helps us connect you with nearby support services if you need them. | If you're comfortable sharing, what is your relationship to the person who did this? You can skip this que...

[6] User: ndio
[6] Bot (4.55s): We're almost done. You're doing really well. Just a moment while I prepare 
your report summary... | ✅ **Report Submitted 
Successfully** | Your report ID: **VEE-C5347E07** | Your information has been r...

────────────────────────────────────────────────────────────
EVALUATION:
  ✅ should_respond_in_swahili
  ✅ should_maintain_trauma_informed

Score: 100.0%
Avg Response Time: 4.24s

============================================================
Testing: User Wants to Vent
============================================================

[1] User: hi
[1] Bot (2.42s): Habari. I'm Vee, and I'm here to support you in a safe, confidential space. Everything we discuss is anonymous....       

[2] User: I just need to talk
[2] Bot (4.54s): We're almost done. You're doing really well. Just a moment while I prepare 
your report summary... | ✅ **Report Submitted 
Successfully** | Your report ID: **VEE-9C7B1511** | Your information has been r...

[3] User: I hate what he did to me
[3] Bot (2.41s): Thank you for sharing that with me. I want you to know that what happened to you is not your fault. You didn't deserve this. | When did this happen? You can be as specific or general as you feel comfo...

[4] User: He always does this and nobody believes me
[4] Bot (0.36s): ...

[5] User: I feel so alone
[5] Bot (0.33s): ...

[6] User: thank you for listening
[6] Bot (0.34s): You're welcome. Thank you for your courage in reaching out....

────────────────────────────────────────────────────────────
EVALUATION:
  ✅ should_validate_feelings
  ✅ should_not_rush_to_report
  ✅ should_offer_continued_support

Score: 100.0%
Avg Response Time: 1.73s

============================================================
Testing: Just Wants Information
============================================================

[1] User: hello
[1] Bot (2.49s): Habari. I'm Vee, and I'm here to support you in a safe, confidential space. Everything we discuss is anonymous....       

[2] User: what is GBV?
[2] Bot (4.48s): We're almost done. You're doing really well. Just a moment while I prepare 
your report summary... | ✅ **Report Submitted 
Successfully** | Your report ID: **VEE-076B3B05** | Your information has been r...

[3] User: what can I do if someone is being abused?
[3] Bot (2.39s): Thank you for sharing that with me. I want you to know that what happened to you is not your fault. You didn't deserve this. | When did this happen? You can be as specific or general as you feel comfo...

[4] User: where can I get help?
[4] Bot (2.41s): 📞 **24/7 Emergency Support:** | • **GBV Helpline: 1195** (toll-free, 24/7)• **Police Emergency: 999 or 112**
• **Befrienders Kenya: 0722 178 177** (emotional support) | 🆘 **Key Support Organizations:...

[5] User: thank you
[5] Bot (0.37s): You're welcome. Thank you for your courage in reaching out....

────────────────────────────────────────────────────────────
EVALUATION:
  ✅ should_provide_education
  ✅ should_not_assume_victim
  ✅ should_offer_resources

Score: 100.0%
Avg Response Time: 2.43s

============================================================
Testing: Workplace Harassment
============================================================

[1] User: hi
[1] Bot (2.47s): Habari. I'm Vee, and I'm here to support you in a safe, confidential space. Everything we discuss is anonymous....       

[2] User: my boss keeps making inappropriate comments
[2] Bot (4.47s): We're almost done. You're doing really well. Just a moment while I prepare 
your report summary... | ✅ **Report Submitted 
Successfully** | Your report ID: **VEE-4033FA82** | Your information has been r...

[3] User: this month
[3] Bot (2.43s): Thank you for sharing that with me. I want you to know that what happened to you is not your fault. You didn't deserve this. | When did this happen? You can be as specific or general as you feel comfo...

[4] User: Nairobi
[4] Bot (2.45s): Thank you. Knowing this helps us connect you with nearby support services if you need them. | If you're comfortable 
sharing, what is your relationship to the person who did this? You can skip this que...

[5] User: my boss
[5] Bot (2.56s): Thank you for sharing that information. | What kind of support would be most helpful for you right now?
• Medical care
• Legal assistance
• Counseling
• Safe shelter
• Just information...

[6] User: I need legal advice
[6] Bot (2.46s): ⚖️ **Legal Support (Free):** | • FIDA Kenya: 0800 720 553
• Legal Aid Clinic: Available at your nearest court
• You can get a Protection Order at court
• Call 1195 to be connected to legal aid | Many ...

[7] User: yes
[7] Bot (2.44s): Thank you for trusting me with this. Remember, you're in control—you can stop or skip any question. | When you're ready, could you tell me what happened? Take your time, and remember you can share as ...

────────────────────────────────────────────────────────────
EVALUATION:
  ✅ should_recognize_workplace_context
  ✅ should_offer_labor_resources

Score: 100.0%
Avg Response Time: 2.75s

============================================================
Testing: Minor Reporting
============================================================

[1] User: hi
[1] Bot (2.43s): Habari. I'm Vee, and I'm here to support you in a safe, confidential space. Everything we discuss is anonymous....

[2] User: I'm 16 and something happened to me
[2] Bot (0.34s): Before we begin, I want you to know:
• This conversation is completely anonymous
• You can stop at any time
• You control what you share
• Your information helps identify areas needing support | Do yo...

[3] User: a teacher touched me inappropriately
[3] Bot (4.52s): We're almost done. You're doing really well. Just a moment while I prepare your report summary... | ✅ **Report Submi
tted Successfully** | Your report ID: **VEE-50B1ADE0** | Your information has been r...

[4] User: last week
[4] Bot (0.38s): ...

[5] User: Kiambu
[5] Bot (2.40s): Thank you. Knowing this helps us connect you with nearby support services if you need them. | If you're comfortable 
sharing, what is your relationship to the person who did this? You can skip this que...

[6] User: my teacher
[6] Bot (0.02s): Error: 429...

[7] User: I'm scared to tell my parents
[7] Bot (0.02s): Error: 429...

────────────────────────────────────────────────────────────
EVALUATION:
  ❌ should_recognize_minor
  ✅ should_prioritize_protection
  ✅ should_mention_childrens_services

Score: 66.7%
Avg Response Time: 1.45s


============================================================
📊 TEST SUMMARY REPORT
============================================================

Total Scenarios Tested: 10
Scenarios Passed (≥70%): 8 (80.0%)
Average Score: 90.8%
Average Response Time: 2.55s

Individual Scenario Results:
────────────────────────────────────────────────────────────
✅ PASS Clear Harassment Report: 75.0% (2.46s avg)
✅ PASS Emotional Support → Report: 100.0% (2.46s avg)
✅ PASS Hesitant User: 100.0% (1.85s avg)
❌ FAIL Emergency - Immediate Danger: 66.7% (3.34s avg)
✅ PASS Multiple Types of Abuse: 100.0% (2.83s avg)
✅ PASS Swahili Speaker: 100.0% (4.24s avg)
✅ PASS User Wants to Vent: 100.0% (1.73s avg)
✅ PASS Just Wants Information: 100.0% (2.43s avg)
✅ PASS Workplace Harassment: 100.0% (2.75s avg)
❌ FAIL Minor Reporting: 66.7% (1.45s avg)

============================================================

📄 Detailed report saved: bot_test_report_20251109_165424.json
Traceback (most recent call last):
  File "C:\Projects\Vee\backend\test_bot_conversations.py", line 549, in <module>
    asyncio.run(main())
  File "C:\Users\hp\AppData\Local\Programs\Python\Python310\lib\asyncio\runners.py", line 44, in run
  File "C:\Users\hp\AppData\Local\Programs\Python\Python310\lib\asyncio\base_events.py", line 649, in run_until_complete
    return future.result()
  File "C:\Projects\Vee\backend\test_bot_conversations.py", line 538, in main
    await tester.run_all_tests()
  File "C:\Projects\Vee\backend\test_bot_conversations.py", line 451, in run_all_tests
    self.generate_report()
  File "C:\Projects\Vee\backend\test_bot_conversations.py", line 497, in generate_report
    self.save_report_to_file()
  File "C:\Projects\Vee\backend\test_bot_conversations.py", line 522, in save_report_to_file
    writer.writerow([
  File "C:\Users\hp\AppData\Local\Programs\Python\Python310\lib\encodings\cp1252.py", line 19, in encode
    return codecs.charmap_encode(input,self.errors,encoding_table)[0]
UnicodeEncodeError: 'charmap' codec can't encode character '\u2192' in position 18: character maps to <undefined>
(venv) PS C:\Projects\Vee\backend>
(venv) PS C:\Projects\Vee\backend>

PS C:\Projects\Vee> & C:\Projects\Vee\venv\Scripts\Activate.ps1
(venv) PS C:\Projects\Vee> cd backend
(venv) PS C:\Projects\Vee\backend> python quick_test_bot.py
🧪 Test 1: Basic Harassment Report

============================================================
Testing conversation: test_basic
============================================================

[1] You: Hi
[1] Bot (2.50s): Habari. I'm Vee, and I'm here to support you in a safe, confidential space. Everything we discuss is anonymous.

[2] You: I want to report harassment
[2] Bot (0.34s): Before we begin, I want you to know:
• This conversation is completely anonymous   
• You can stop at any time
• You control what you share
• Your information helps identify areas needing support | Do you consent to proceed with sharing information?

[3] You: yesterday
[3] Bot (2.40s): Thank you for sharing when this happened. | How are you feeling right now? 
It's okay to take a break if you need one.    

[4] You: Nairobi
[4] Bot (2.45s): Thank you. Knowing this helps us connect you with nearby support services if you need them. | If you're comfortable sharing, what is your relationship to the person who did this? You can skip this question if you 
prefer.

[5] You: yes
[5] Bot (2.38s): Thank you for trusting me with this. Remember, you're in control—you can stop or skip any question. | When you're ready, 
could you tell me what happened? Take your time, and remember you can share as much or as little as you're comfortable with.

────────────────────────────────────────────────────────────
Total time: 10.08s
Avg response time: 2.02s
============================================================

🧪 Test 2: Needs Emotional Support

============================================================
Testing conversation: test_emotional
============================================================

[1] You: Hello
[1] Bot (2.39s): Habari. I'm Vee, and I'm here to support you in a safe, confidential space. Everything we discuss is anonymous.

[2] You: I'm scared
[2] Bot (2.41s): Your fear is completely valid and understandable. Being afraid is a natural response to what you've experienced. You're showing courage by reaching out.

[3] You: My partner hit me
[3] Bot (4.47s): We're almost done. You're doing really well. Just a moment while I prepare 
your report summary... | ✅ **Report Submitted 
Successfully** | Your report ID: **VEE-762A27B2** | Your information has been recorded anonymously and securely. Thank you for your courage in sharing this. | **What happens next:**   
• Your data will help identify areas needing support services
• It contributes to understanding GBV patterns in Kenya
• You can access support resources anytime | **Remember:** You are not alone. Help is available 24/7 at 1195. | 📞 Support Services: 
• GBV Helpline: 1195 (24/7, Free)
• Police Emergency: 999
• FIDA Kenya Legal Aid: 0800 720 553
• Nairobi Women's Hospital GBV Center: 0719 312 000 | Would you like help finding services near you?

[4] You: today
[4] Bot (2.45s): Thank you for sharing when this happened. | How are you feeling right now? It's okay to take a break if you need one.

[5] You: Mombasa
[5] Bot (2.39s): Thank you. Knowing this helps us connect you with nearby support services if you need them. | If you're comfortable 
sharing, what is your relationship to the person who did this? You can skip this question if you prefer.

────────────────────────────────────────────────────────────
Total time: 14.11s
Avg response time: 2.82s
============================================================

🧪 Test 3: Emergency Situation

============================================================
Testing conversation: test_emergency
============================================================

[1] You: Help!
[1] Bot (4.47s): We're almost done. You're doing really well. Just a moment while I prepare your report summary... | ✅ **Report Submi
tted Successfully** | Your report ID: **VEE-73DE7E32** | Your information has been recorded anonymously and securely. Thank you for your courage in sharing this. | **What happens next:**
• Your data will help identify areas needing support services
• It contributes to understanding GBV patterns in Kenya
• You can access support resources anytime | **Remember:** You are not alone. Help is available 24/7 at 1195. | 📞 Support Services: 
• GBV Helpline: 1195 (24/7, Free)
• Police Emergency: 999
• FIDA Kenya Legal Aid: 0800 720 553
• Nairobi Women's Hospital GBV Center: 0719 312 000 | Would you like help finding services near you?

[2] You: I'm in danger right now
[2] Bot (2.43s): 🚨 **If you are in immediate danger:** | 1. Get to a safe place if possible
2. Call 999 (Police) or 112 immediately
3. Call 1195 (GBV Helpline - 24/7, free)
4. Go to the nearest police station or public place | Your safety is the priority. Please reach out for immediate help. | 🚨 If you are in immediate danger:
• Call 999 (Police Emergency)
• Call 1195 (GBV Helpline - 24/7)
• Go to the nearest police station or safe place | Would you like me to help you find nearby support services?

[3] You: Nairobi
[3] Bot (2.42s): Thank you. Knowing this helps us connect you with nearby support services if you need them. | If you're comfortable 
sharing, what is your relationship to the person who did this? You can skip this question if you prefer.

────────────────────────────────────────────────────────────
Total time: 9.31s
Avg response time: 3.10s
============================================================

🧪 Test 4: Hesitant/Unsure User

============================================================
Testing conversation: test_hesitant
============================================================

[1] You: Hi
[1] Bot (2.42s): Habari. I'm Vee, and I'm here to support you in a safe, confidential space. Everything we discuss is anonymous.

[2] You: I don't know if I should report
[2] Bot (4.54s): We're almost done. You're doing really well. Just a moment while I prepare your report summary... | ✅ **Report Submi
tted Successfully** | Your report ID: **VEE-C12B3A0F** | Your information has been recorded anonymously and securely. Thank you for your courage in sharing this. | **What happens next:**
• Your data will help identify areas needing support services
• It contributes to understanding GBV patterns in Kenya
• You can access support resources anytime | **Remember:** You are not alone. Help is available 24/7 at 1195. | 📞 Support Services: 
• GBV Helpline: 1195 (24/7, Free)
• Police Emergency: 999
• FIDA Kenya Legal Aid: 0800 720 553
• Nairobi Women's Hospital GBV Center: 0719 312 000 | Would you like help finding services near you?

[3] You: Something happened but I'm not sure
[3] Error: 429

[4] You: Maybe I shouldn't say anything
[4] Error: 429

────────────────────────────────────────────────────────────
Total time: 6.98s
Avg response time: 1.75s
============================================================

🧪 Test 5: Just Asking for Information

============================================================
Testing conversation: test_info
============================================================

[1] You: Hello
[1] Error: 429

[2] You: What is GBV?
[2] Error: 429

[3] You: Where can I get help?
[3] Error: 429

[4] You: Thank you
[4] Error: 429

────────────────────────────────────────────────────────────
Total time: 0.04s
Avg response time: 0.01s
============================================================


✅ All quick tests complete!

Look at the responses above and check:
  - Is the bot empathetic?
  - Does it collect necessary info?
  - Are response times acceptable (<2s)?
  - Does it offer resources?
  - Is it trauma-informed (no pressure)?
(venv) PS C:\Projects\Vee\backend> 

PS C:\Projects\Vee> & C:\Projects\Vee\venv\Scripts\Activate.ps1
(venv) PS C:\Projects\Vee> cd backend
(venv) PS C:\Projects\Vee\backend> python profile_bot.py
🤖 Bot Performance Profiler
============================================================
This will test your bot with various messages
and analyze response quality.

Testing bot with sample conversation...

[1/10] Testing: Hi
    ✅ Response in 2.41s
[2/10] Testing: I want to report something
    ✅ Response in 0.34s
[3/10] Testing: I was harassed
    ✅ Response in 2.46s
[4/10] Testing: I'm scared
    ✅ Response in 2.42s
[5/10] Testing: yesterday
    ✅ Response in 2.50s
[6/10] Testing: Nairobi
    ✅ Response in 2.48s
[7/10] Testing: I need help
    ✅ Response in 4.52s
[8/10] Testing: What should I do?
    ✅ Response in 4.52s
[9/10] Testing: Can you help me?
    ❌ Error: HTTP 429
[10/10] Testing: thank you
    ❌ Error: HTTP 429

✅ Testing complete!


============================================================
📊 BOT PERFORMANCE REPORT
============================================================

⏱️  Response Time Analysis:
   Average: 2.71s
   Fastest: 0.34s
   Slowest: 4.52s
   Rating: ⚠️  Acceptable

💚 Empathy & Support:
   Empathetic responses: 8/8 (100.0%)
   Rating: ✅ Very Empathetic

📝 Data Collection:
   Questions asked: 6/8 (75.0%)
   Rating: ✅ Good Data Collection

🏥 Resource Provision:
   Resource mentions: 6/8 (75.0%)
   Rating: ✅ Good Resource Sharing

🔧 Reliability:
   Errors: 2/8 (25.0%)
   Rating: ❌ Reliability Concerns

============================================================
🎯 Overall Bot Score: 76.5/100
   ⭐⭐⭐⭐ Good - Minor improvements recommended
============================================================

💡 Recommendations:
   • Optimize response time (reduce model complexity)
   • Fix error handling and improve reliability

(venv) PS C:\Projects\Vee\backend> 


update legal resourse to tell the victim, what type of harrasments, it's legal implications, where to get resourses, and remind the victim they are not alone.


Vee isn’t a counselor, but a guide — helping survivors name their experience, understand their rights, and find safe resources, all while reassuring them they’re not alone.