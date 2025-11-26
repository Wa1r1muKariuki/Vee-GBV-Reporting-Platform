// frontend/app/report/page.js
"use client";
import { AlertTriangle, CheckCircle, Shield } from "lucide-react";
import Link from "next/link";


import { useState } from "react";

export default function ReportPage() {
  const [formData, setFormData] = useState({
    consent_given: false,
    incident_type: "",
    timeframe: "",
    county: "",
    location_description: "",
    relationship_to_perpetrator: "",
    support_needs: [],
    reporting_barriers: [],
    language_used: "en",
    reported_to_authorities: false,
    incident_description: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.consent_given) {
      newErrors.consent_given = "Consent is required to submit a report";
    }
    if (!formData.incident_type) {
      newErrors.incident_type = "Please select an incident type";
    }
    if (!formData.timeframe) {
      newErrors.timeframe = "Please indicate when this happened";
    }
    if (!formData.county.trim()) {
      newErrors.county = "Please specify the county";
    }
    if (!formData.location_description.trim()) {
      newErrors.location_description = "Please describe the location";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSupportNeedsChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentNeeds = prev.support_needs || [];
      if (checked) {
        return { ...prev, support_needs: [...currentNeeds, value] };
      } else {
        return { 
          ...prev, 
          support_needs: currentNeeds.filter(need => need !== value) 
        };
      }
    });
  };

  const handleReportingBarriersChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentBarriers = prev.reporting_barriers || [];
      if (checked) {
        return { ...prev, reporting_barriers: [...currentBarriers, value] };
      } else {
        return { 
          ...prev, 
          reporting_barriers: currentBarriers.filter(barrier => barrier !== value) 
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setStatus("❌ Please fix the errors above before submitting");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("http://localhost:8000/report/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consent_given: formData.consent_given,
          incident_type: formData.incident_type,
          timeframe: formData.timeframe,
          county: formData.county,
          location_description: formData.location_description,
          relationship_to_perpetrator: formData.relationship_to_perpetrator,
          support_needs: formData.support_needs,
          reporting_barriers: formData.reporting_barriers,
          language_used: formData.language_used,
          reported_to_authorities: formData.reported_to_authorities,
          incident_description: formData.incident_description,
          source: "web_form"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      setStatus("✅ Report submitted successfully! " + (data.message || ""));
      
      // Show resources to user
      if (data.resources && data.resources.length > 0) {
        setTimeout(() => {
          setStatus(prev => prev + " Check the resources section below for support options.");
        }, 2000);
      }
      
      // Reset form
      setFormData({
        consent_given: false,
        incident_type: "",
        timeframe: "",
        county: "",
        location_description: "",
        relationship_to_perpetrator: "",
        support_needs: [],
        reporting_barriers: [],
        language_used: "en",
        reported_to_authorities: false,
        incident_description: "",
      });
      
    } catch (err) {
      console.error("Submission error:", err);
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const emergencyResources = [
    { name: "GBV Hotline", number: "1195", description: "24/7 Free confidential support" },
    { name: "Police Emergency", number: "999 / 112", description: "Immediate danger" },
    { name: "FIDA Kenya", number: "0800 720 553", description: "Free legal aid for women" },
    { name: "Befrienders Kenya", number: "0722 178 177", description: "Counselling support" }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-800 text-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-300 mb-4">Report Incident</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Your safety and privacy are our priority. All information is encrypted and stored securely.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md p-6 rounded-2xl space-y-6 border border-white/10">
              {/* Consent */}
              <div className={`bg-black/30 p-4 rounded-lg border ${errors.consent_given ? 'border-red-400' : 'border-white/10'}`}>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="consent_given"
                    checked={formData.consent_given}
                    onChange={handleChange}
                    className="accent-teal-400 mt-1 flex-shrink-0"
                    required
                  />
                  <span className="text-sm">
                    I understand that this information will be stored securely and used 
                    to track incidents and provide appropriate support. I give consent 
                    to submit this report. *
                  </span>
                </label>
                {errors.consent_given && (
                  <p className="text-red-400 text-sm mt-2">{errors.consent_given}</p>
                )}
              </div>

              {/* Incident Details Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Incident Type */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Type of Incident *
                  </label>
                  <select
                    name="incident_type"
                    value={formData.incident_type}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg bg-black/40 border ${errors.incident_type ? 'border-red-400' : 'border-white/10'} transition-colors`}
                  >
                    <option value="">Select incident type</option>
                    <option value="physical_violence">Physical Violence</option>
                    <option value="sexual_violence">Sexual Violence</option>
                    <option value="emotional_abuse">Emotional Abuse</option>
                    <option value="economic_abuse">Economic Abuse</option>
                    <option value="harassment">Harassment</option>
                    <option value="stalking">Stalking</option>
                    <option value="online_gbv">Online GBV</option>
                    <option value="harmful_practices">Harmful Practices</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.incident_type && (
                    <p className="text-red-400 text-sm mt-1">{errors.incident_type}</p>
                  )}
                </div>

                {/* Timeframe */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    When did it happen? *
                  </label>
                  <select
                    name="timeframe"
                    value={formData.timeframe}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg bg-black/40 border ${errors.timeframe ? 'border-red-400' : 'border-white/10'} transition-colors`}
                  >
                    <option value="">Select timeframe</option>
                    <option value="recent">Recent (within last week)</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="past_week">Past Week</option>
                    <option value="past_month">Past Month</option>
                    <option value="past_year">Past Year</option>
                    <option value="long_ago">Long time ago</option>
                  </select>
                  {errors.timeframe && (
                    <p className="text-red-400 text-sm mt-1">{errors.timeframe}</p>
                  )}
                </div>
              </div>

              {/* Location Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    County *
                  </label>
                  <input
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    placeholder="e.g., Nairobi, Mombasa, Kisumu"
                    className={`w-full p-3 rounded-lg bg-black/40 border ${errors.county ? 'border-red-400' : 'border-white/10'} transition-colors`}
                  />
                  {errors.county && (
                    <p className="text-red-400 text-sm mt-1">{errors.county}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Location Description *
                  </label>
                  <input
                    name="location_description"
                    value={formData.location_description}
                    onChange={handleChange}
                    placeholder="e.g., home, workplace, public transport"
                    className={`w-full p-3 rounded-lg bg-black/40 border ${errors.location_description ? 'border-red-400' : 'border-white/10'} transition-colors`}
                  />
                  {errors.location_description && (
                    <p className="text-red-400 text-sm mt-1">{errors.location_description}</p>
                  )}
                </div>
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Relationship to Perpetrator
                </label>
                <select
                  name="relationship_to_perpetrator"
                  value={formData.relationship_to_perpetrator}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-black/40 border border-white/10 transition-colors"
                >
                  <option value="">Select relationship (optional)</option>
                  <option value="intimate_partner">Intimate Partner/Spouse</option>
                  <option value="ex_partner">Ex-partner</option>
                  <option value="family_member">Family Member</option>
                  <option value="acquaintance">Acquaintance</option>
                  <option value="colleague">Colleague</option>
                  <option value="authority_figure">Authority Figure</option>
                  <option value="stranger">Stranger</option>
                  <option value="multiple_perpetrators">Multiple Perpetrators</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              {/* Support Needs */}
              <div>
                <label className="block text-sm text-gray-300 mb-3">
                  What support do you need? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-black/30 p-4 rounded-lg">
                  {[
                    {value: "immediate_safety", label: "🚨 Immediate Safety", emoji: "🚨"},
                    {value: "medical_care", label: "🏥 Medical Care", emoji: "🏥"},
                    {value: "legal_assistance", label: "⚖️ Legal Assistance", emoji: "⚖️"},
                    {value: "counseling", label: "💬 Counseling/Therapy", emoji: "💬"},
                    {value: "shelter", label: "🏠 Safe Shelter", emoji: "🏠"},
                    {value: "police_report", label: "👮 Police Report Help", emoji: "👮"},
                    {value: "documentation", label: "📝 Documentation", emoji: "📝"},
                    {value: "safety_planning", label: "🛡️ Safety Planning", emoji: "🛡️"},
                    {value: "none_now", label: "💭 No support needed now", emoji: "💭"}
                  ].map((need) => (
                    <label key={need.value} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                      <input
                        type="checkbox"
                        value={need.value}
                        checked={formData.support_needs.includes(need.value)}
                        onChange={handleSupportNeedsChange}
                        className="accent-teal-400"
                      />
                      <span className="text-sm flex items-center gap-2">
                        <span>{need.emoji}</span>
                        {need.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Barriers to Reporting */}
              <div>
                <label className="block text-sm text-gray-300 mb-3">
                  Barriers to Reporting (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-black/30 p-4 rounded-lg">
                  {[
                    {value: "fear_of_retaliation", label: "😨 Fear of retaliation"},
                    {value: "stigma", label: "😔 Stigma or shame"},
                    {value: "dont_trust_authorities", label: "🤝 Don't trust authorities"},
                    {value: "dont_know_how", label: "❓ Don't know how to report"},
                    {value: "economic_dependence", label: "💰 Economic dependence"},
                    {value: "family_pressure", label: "👪 Family pressure"},
                    {value: "cultural_norms", label: "🌍 Cultural norms"},
                    {value: "previous_bad_experience", label: "😞 Previous bad experience"},
                    {value: "other", label: "📝 Other"}
                  ].map((barrier) => (
                    <label key={barrier.value} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                      <input
                        type="checkbox"
                        value={barrier.value}
                        checked={formData.reporting_barriers.includes(barrier.value)}
                        onChange={handleReportingBarriersChange}
                        className="accent-teal-400"
                      />
                      <span className="text-sm">{barrier.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Incident Description */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Incident Description
                </label>
                <textarea
                  name="incident_description"
                  value={formData.incident_description}
                  onChange={handleChange}
                  placeholder="Please describe what happened (avoid personal identifiers like names, specific addresses, etc.)"
                  rows={4}
                  className="w-full p-3 rounded-lg bg-black/40 border border-white/10 transition-colors resize-vertical"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Remember: Avoid including personally identifiable information
                </p>
              </div>

              {/* Additional Info Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Language */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Language used during incident
                  </label>
                  <select
                    name="language_used"
                    value={formData.language_used}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-black/40 border border-white/10 transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="sw">Kiswahili</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Reported to authorities */}
                <div className="flex items-center justify-center md:justify-start">
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-black/30 hover:bg-black/40 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      name="reported_to_authorities"
                      checked={formData.reported_to_authorities}
                      onChange={handleChange}
                      className="accent-teal-400"
                    />
                    <span className="text-sm">I have reported this to authorities</span>
                  </label>
                </div>
              </div>

              {/* Submit Section */}
              <div className="pt-4 border-t border-white/10">
                {status && (
                  <div className={`p-4 rounded-lg mb-4 ${
                    status.includes('✅') ? 'bg-green-500/20 border border-green-400' : 
                    status.includes('❌') ? 'bg-red-500/20 border border-red-400' : 
                    'bg-yellow-500/20 border border-yellow-400'
                  }`}>
                    <p className="text-sm">{status}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loading || !formData.consent_given}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-teal-400 font-semibold py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-teal-500 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.clear();
                        sessionStorage.clear();
                        document.body.style.filter = "blur(8px)";
                        setTimeout(() => window.location.replace("https://www.google.com"), 150);
                      } catch {
                        window.location.replace("https://www.google.com");
                      }
                    }}
                    className="px-6 py-4 bg-black/20 rounded-lg border border-white/10 hover:bg-black/30 transition-colors flex items-center justify-center gap-2"
                  >
                    🚪 Quick Exit
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Emergency Resources Sidebar */}
          <div className="space-y-6">
            <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                🚨 Emergency Contacts
              </h3>
              <div className="space-y-3">
                {emergencyResources.map((resource, index) => (
                  <div key={index} className="bg-black/20 p-3 rounded-lg">
                    <div className="font-semibold text-white">{resource.name}</div>
                    <div className="text-teal-300 font-mono text-lg">{resource.number}</div>
                    <div className="text-gray-400 text-sm">{resource.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-teal-500/10 border border-teal-400/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-teal-300 mb-4 flex items-center gap-2">
                💡 Safety Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Your report is anonymous and encrypted</li>
                <li>• If in immediate danger, call 999 first</li>
                <li>• Seek medical care within 72 hours if needed</li>
                <li>• Consider professional counseling for support</li>
                <li>• Use Quick Exit button if you need to leave quickly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}