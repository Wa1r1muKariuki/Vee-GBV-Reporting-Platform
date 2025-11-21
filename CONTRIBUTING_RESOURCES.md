# Contributing County Resources Guide

## 📋 Overview

This guide helps contributors add GBV support resources for all 47 counties in Kenya. We need accurate, verified contact information for medical facilities, legal aid, counseling, shelters, and police gender desks.

## 🎯 Current Status

- ✅ **7 counties verified**: Nairobi, Mombasa, Kisumu, Nakuru, Uasin Gishu, Kiambu, Machakos
- ⏳ **40 counties need verification**: Basic structure exists, needs actual contacts
- 📊 **Total resources so far**: ~50 across verified counties

## 🚀 How to Contribute

### Step 1: Choose a County

Pick an unverified county from the list (see `counties_resources.json`). Counties marked `"verified": false` need help.

**Priority Counties** (Large populations):
1. Kakamega
2. Bungoma
3. Meru
4. Nyeri
5. Trans Nzoia
6. Kericho
7. Kilifi
8. Kitui

### Step 2: Research Resources

For your chosen county, find:

#### 🏥 Medical Facilities
- County Referral Hospital (Level 4/5/6)
- Sub-county hospitals with GBV units
- Private hospitals offering GBV services

**What to find:**
- Official name
- Phone number (landline + mobile)
- Physical address
- Operating hours (24/7 preferred)
- Services offered (PEP, counseling, forensics, etc.)
- Cost (free/subsidized/paid)

**Where to look:**
- Ministry of Health Kenya website
- County government health department
- Hospital websites/Facebook pages
- Call the hospital directly

#### ⚖️ Legal Services
- FIDA Kenya branch (if exists)
- Legal aid organizations
- Kituo Cha Sheria presence
- County government legal aid

**What to find:**
- Organization name
- Phone number
- Office location
- Operating hours
- Services (free legal aid, court representation, etc.)

**Where to look:**
- FIDA Kenya website: www.fidakenya.org
- County government justice department
- Local NGO directories

#### 💙 Counseling Services
- County-run counseling centers
- NGO counseling services
- Private therapists offering free/subsidized GBV counseling
- Religious organizations with counseling

**What to find:**
- Service name
- Phone number
- Location
- Hours
- Cost
- Languages spoken

#### 🏠 Shelters
- Women's shelters
- Safe houses
- Emergency accommodation
- Church-run shelters

**What to find:**
- Shelter name
- Contact phone (may be confidential)
- Referral process
- Capacity
- Duration of stay

**Note:** Many shelters keep locations private for safety. Focus on contact numbers.

#### 🚔 Police
- County/Sub-county police stations with Gender Desks
- Gender Violence Recovery Units
- Community policing centers

**What to find:**
- Station name
- Phone number
- Location
- Gender Desk contact

### Step 3: Verify Information

**ALWAYS VERIFY** by:
1. ✅ Call the phone number
2. ✅ Check official websites
3. ✅ Visit if possible
4. ✅ Cross-reference with multiple sources

**Red flags:**
- ❌ Numbers that don't work
- ❌ "Contact available on request" (get actual contact!)
- ❌ Outdated information (>1 year old)
- ❌ Unverified social media claims

### Step 4: Format Your Data

Use this exact format in `counties_resources.json`:

```json
{
  "name": "Exact Official Name",
  "type": "Category (Public Hospital, NGO, etc.)",
  "phone": "123-456789 / 0712-345678",
  "location": "Physical address or area",
  "services": ["Service 1", "Service 2", "Service 3"],
  "hours": "24/7 or Mon-Fri 8:00-17:00",
  "cost": "FREE or Subsidized or specific amount",
  "email": "email@example.org",
  "website": "www.example.org",
  "notes": "Any special information"
}
```

**Example:**

```json
{
  "name": "Kakamega County General Hospital - GBV Unit",
  "type": "Public Hospital",
  "phone": "056-30101 / 0721-123456",
  "location": "Kakamega Town, near Bus Station",
  "services": ["Medical examination", "PEP", "Counseling", "Referrals"],
  "hours": "24/7",
  "cost": "Free for GBV survivors"
}
```

### Step 5: Update the JSON File

1. Find your county in `counties_resources.json`
2. Replace `"TO BE VERIFIED"` with actual phone numbers
3. Add new resources to appropriate arrays (medical, legal, etc.)
4. Change `"verified": false` to `"verified": true` when county is complete
5. Update `"last_updated"` in metadata

### Step 6: Test Your Changes

Run the validation script:

```bash
python load_counties.py
```

This will show:
- Total resources added
- Any missing required fields
- Phone numbers still marked "TO BE VERIFIED"
- Coverage statistics

### Step 7: Submit

Create a pull request with:
- County name in title: "Add resources for Kakamega County"
- List of resources added
- Verification method (called, visited, official website, etc.)
- Date verified

## 📝 Data Quality Standards

### Required Fields
- ✅ `name` - Official name
- ✅ `phone` - Working phone number
- ✅ `services` - At least one service

### Recommended Fields
- 📍 `location` - Physical address
- ⏰ `hours` - Operating hours
- 💰 `cost` - Pricing info

### Optional Fields
- 📧 `email`
- 🌐 `website`
- 📝 `notes`

## 🔍 Verification Checklist

Before submitting, ensure:

- [ ] All phone numbers tested (called and confirmed)
- [ ] Services list is accurate
- [ ] Operating hours confirmed
- [ ] Cost information verified
- [ ] Location address is correct
- [ ] Organization still exists and operating
- [ ] JSON syntax is valid (no missing commas, brackets)
- [ ] No duplicate entries

## 🌍 Research Resources

### Official Sources
1. **Ministry of Health Kenya**
   - Website: www.health.go.ke
   - County health departments

2. **FIDA Kenya**
   - Website: www.fidakenya.org
   - National toll-free: 0800-720553

3. **County Government Websites**
   - Format: usually `www.[county-name].go.ke`
   - Check health and gender departments

4. **Kenya Police Service**
   - Website: www.kenyapolice.go.ke
   - Gender Desk information

### NGO Networks
- Coalition on Violence Against Women (COVAW)
- Federation of Women Lawyers (FIDA)
- Cradle - The Children Foundation
- Kenya Red Cross

### Community Sources
- County hospitals (call reception)
- Local administration (chiefs, county commissioners)
- Women's groups and CBOs
- Religious organizations

## ❌ Common Mistakes to Avoid

1. **Don't use:**
   - Personal phone numbers
   - Unverified social media contacts
   - Inactive organizations
   - Numbers from >2 years ago without verification

2. **Don't include:**
   - Resources outside Kenya
   - Resources not related to GBV
   - Private businesses (unless they offer free/subsidized GBV services)

3. **Don't forget:**
   - To test phone numbers
   - To specify if service is FREE
   - To note 24/7 availability
   - To update metadata dates

## 💡 Tips for Rural Counties

For counties with limited resources:

1. **Start with basics:**
   - County referral hospital
   - Police station
   - FIDA toll-free number

2. **Look for:**
   - Sub-county hospitals
   - Community health centers
   - Religious organization support
   - Women's groups

3. **Document gaps:**
   - Note if NO shelter exists
   - Note if NO counseling available
   - This helps identify where resources are needed

4. **Regional resources:**
   - If county has no FIDA office, note nearest one
   - List regional hospitals if local ones lack GBV units

## 📞 National Fallbacks

Every county should at minimum have:

```json
{
  "legal": [
    {
      "name": "FIDA Kenya - National Toll-free",
      "phone": "0800-720553",
      "cost": "FREE",
      "services": ["Legal aid", "Referrals to nearest office"]
    }
  ],
  "police": [
    {
      "name": "Police Emergency",
      "phone": "999 / 112",
      "services": ["Emergency response"]
    }
  ]
}
```

## 🎓 Training Materials

Need help understanding GBV resources? Check:

1. **Ministry of Public Service and Gender**
   - GBV guidelines and policies

2. **WHO Guidelines**
   - Clinical management of rape survivors

3. **Protection Against Domestic Violence Act, 2015**
   - Legal framework for GBV response

## 🤝 Getting Help

Questions? Contact:
- Project maintainer: [your contact]
- Email: [project email]
- Open an issue on GitHub

## 📊 Progress Tracking

We'll update this weekly:

| Region | Counties | Verified | Percentage |
|--------|----------|----------|------------|
| Nairobi | 1 | 1 | 100% |
| Central | 5 | 1 | 20% |
| Coast | 6 | 1 | 17% |
| Eastern | 8 | 1 | 13% |
| North Eastern | 3 | 0 | 0% |
| Nyanza | 6 | 1 | 17% |
| Rift Valley | 14 | 2 | 14% |
| Western | 4 | 0 | 0% |
| **TOTAL** | **47** | **7** | **15%** |

## 🌟 Recognition

Contributors who verify counties will be:
- Listed in CONTRIBUTORS.md
- Acknowledged in project documentation
- Helping save lives 💙

## 📅 Update Schedule

Resources should be re-verified:
- **Monthly**: National hotlines
- **Quarterly**: County hospitals and FIDA offices
- **Annually**: All resources

Mark last verification date in county notes.

---

## Example: Complete County Entry

Here's what a fully verified county looks like:

```json
"Kakamega": {
  "county_code": "037",
  "region": "Western",
  "verified": true,
  "last_verified": "2024-11-07",
  "medical": [
    {
      "name": "Kakamega County General Hospital",
      "type": "Public Hospital",
      "phone": "056-30101 / 0721-654321",
      "location": "Hospital Road, Kakamega Town",
      "services": ["Medical examination", "PEP", "Emergency contraception", "Counseling", "Forensics"],
      "hours": "24/7",
      "cost": "Free for GBV survivors",
      "notes": "Ask for GBV unit at main reception"
    }
  ],
  "legal": [
    {
      "name": "FIDA Kenya",
      "phone": "0800-720553",
      "services": ["Legal aid", "Court representation"],
      "cost": "FREE",
      "notes": "National number, serves Kakamega"
    }
  ],
  "counseling": [
    {
      "name": "Kakamega Counseling Centre",
      "phone": "056-12345",
      "location": "Main Street, opposite post office",
      "services": ["Individual counseling", "Group therapy"],
      "hours": "Mon-Fri 8:00-17:00",
      "cost": "Sliding scale, GBV survivors free"
    }
  ],
  "shelters": [
    {
      "name": "Western Kenya Women's Shelter",
      "phone": "0712-345678",
      "services": ["Emergency housing", "Food", "Security"],
      "duration": "Up to 3 months",
      "notes": "Referral through hospital or police"
    }
  ],
  "police": [
    {
      "name": "Kakamega Police Station - Gender Desk",
      "phone": "056-20000 / 999",
      "location": "Kakamega Town, near County HQ",
      "services": ["GBV reporting", "Protection orders"]
    }
  ]
}
```

---

**Thank you for contributing to this life-saving resource! Every phone number you verify could help a survivor find safety. 💙**