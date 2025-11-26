// Create a new file: lib/translations.ts

export const translations = {
  en: {
    // Navigation
    home: "Home",
    chat: "Chat",
    resources: "Resources",
    map: "Map",
    
    // Home Page
    heroTitle: "You are not",
    heroTitleHighlight: "alone.",
    heroSubtitle: "Vee helps you put words to your experience, and find safe places and people who can help.",
    startChat: "Start Chat with Vee",
    anonymous: "Anonymous • Secure • Available 24/7",
    
    // Chat
    typeMessage: "Type your message...",
    send: "Send",
    typing: "Vee is typing...",
    emptyChat: "Start a conversation with Vee",
    newChat: "New Chat",
    savedChats: "Saved Chats",
    
    // Map
    mapTitle: "Map Insights",
    mapSubtitle: "Visualize reported incidents across Kenya. Data is anonymized for safety.",
    allIncidents: "All Incidents",
    search: "Search incidents by type or location...",
    filterByType: "Incident Type",
    filterByTime: "Time Period",
    filterByLocation: "Location",
    allTime: "All Time",
    last24Hours: "Last 24 Hours",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    allLocations: "All Locations",
    
    // Incident Types
    harassment: "Harassment",
    assault: "Assault",
    femicide: "Femicide",
    publicViolence: "Public Violence",
    domesticViolence: "Domestic Violence",
    workplace: "Workplace",
    online: "Online",
    
    // Admin
    login: "Log In",
    logout: "Logout",
    dashboard: "Dashboard",
    reports: "Reports",
    verify: "Verify & Publish",
    reject: "Reject",
    exportCSV: "Export CSV",
    backToQueue: "Back to Queue",
    generateReports: "Generate Reports",
    
    // Bot Greetings
    botGreeting: "Hello, I'm Vee. I'm here to listen. You're safe here. Take your time—would you like to share what happened?",
    botFollowUp: "I believe you. What you're feeling is valid. Can you tell me more about where this happened?",
  },
  
  sw: {
    // Navigation
    home: "Nyumbani",
    chat: "Ongea",
    resources: "Rasilimali",
    map: "Ramani",
    
    // Home Page
    heroTitle: "Huko",
    heroTitleHighlight: "peke yako.",
    heroSubtitle: "Vee anakusaidia kuweka maneno kwa uzoefu wako, na kupata maeneo salama na watu wanaoweza kukusaidia.",
    startChat: "Anza Mazungumzo na Vee",
    anonymous: "Bila Jina • Salama • Inapatikana Saa 24/7",
    
    // Chat
    typeMessage: "Andika ujumbe wako...",
    send: "Tuma",
    typing: "Vee anaandika...",
    emptyChat: "Anza mazungumzo na Vee",
    newChat: "Mazungumzo Mapya",
    savedChats: "Mazungumzo Yaliyohifadhiwa",
    
    // Map
    mapTitle: "Ufahamu wa Ramani",
    mapSubtitle: "Angalia tukio lililoripotiwa nchini Kenya. Data imefichwa kwa usalama.",
    allIncidents: "Matukio Yote",
    search: "Tafuta matukio kwa aina au eneo...",
    filterByType: "Aina ya Tukio",
    filterByTime: "Kipindi cha Muda",
    filterByLocation: "Mahali",
    allTime: "Muda Wote",
    last24Hours: "Masaa 24 Yaliyopita",
    last7Days: "Siku 7 Zilizopita",
    last30Days: "Siku 30 Zilizopita",
    allLocations: "Maeneo Yote",
    
    // Incident Types
    harassment: "Unyanyasaji",
    assault: "Shambulio",
    femicide: "Mauaji ya Wanawake",
    publicViolence: "Jeuri za Umma",
    domesticViolence: "Jeuri za Nyumbani",
    workplace: "Kazini",
    online: "Mtandaoni",
    
    // Admin
    login: "Ingia",
    logout: "Toka",
    dashboard: "Dashibodi",
    reports: "Ripoti",
    verify: "Thibitisha na Chapisha",
    reject: "Kataa",
    exportCSV: "Pakua CSV",
    backToQueue: "Rudi Kwenye Foleni",
    generateReports: "Tengeneza Ripoti",
    
    // Bot Greetings
    botGreeting: "Habari, mimi ni Vee. Niko hapa kusikiliza. Uko salama hapa. Chukua muda wako—ungependa kushiriki nini kilichotokea?",
    botFollowUp: "Ninakuamini. Unachohisi ni halali. Je, unaweza kuniambia zaidi kuhusu mahali hii ilitokea?",
  }
};

// Hook to use translations
export function useTranslation(language: 'en' | 'sw') {
  return translations[language];
}