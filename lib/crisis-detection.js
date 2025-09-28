/**
 * Crisis Detection Utilities
 * Matches the functionality from the Python version
 */

// Crisis keywords from Python version
const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "end it all", "don't want to live", 
  "hurt myself", "self harm", "cutting", "overdose", "jump off",
  "hopeless", "no point", "better off dead", "ending my life",
  // Additional keywords for better detection
  "want to die", "can't go on", "nothing matters", "give up",
  "self-harm", "self injury", "razor", "pills", "bridge",
  "gun", "rope", "hanging", "drowning", "suffocate"
];

// Additional context patterns that might indicate crisis
const CRISIS_PATTERNS = [
  /i (want to|gonna|going to) (die|kill myself|end it)/i,
  /life (isn't|is not) worth (living|it)/i,
  /nobody (cares|would miss me|loves me)/i,
  /world (would be better|is better) without me/i,
  /can't (take it|handle it|deal with it) anymore/i,
  /thinking about (dying|suicide|killing myself)/i
];

/**
 * Check if the message contains crisis-related keywords or patterns
 * @param {string} message - The user's message to analyze
 * @returns {boolean} - True if crisis indicators are found
 */
function containsCrisisKeywords(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const messageLower = message.toLowerCase().trim();
  
  // Check for direct keyword matches
  const hasKeywords = CRISIS_KEYWORDS.some(keyword => 
    messageLower.includes(keyword.toLowerCase())
  );
  
  // Check for pattern matches
  const hasPatterns = CRISIS_PATTERNS.some(pattern => 
    pattern.test(messageLower)
  );
  
  return hasKeywords || hasPatterns;
}

/**
 * Analyze message severity and provide appropriate crisis context
 * @param {string} message - The user's message
 * @returns {Object} - Analysis result with severity and context
 */
function analyzeCrisisLevel(message) {
  const isCrisis = containsCrisisKeywords(message);
  
  if (!isCrisis) {
    return {
      isCrisis: false,
      severity: 'none',
      context: null
    };
  }

  // Determine crisis severity based on specific indicators
  let severity = 'moderate';
  let immediateKeywords = [
    'kill myself', 'suicide', 'end it all', 'overdose', 
    'jump off', 'hanging', 'gun', 'razor'
  ];
  
  if (immediateKeywords.some(keyword => 
    message.toLowerCase().includes(keyword))) {
    severity = 'high';
  }

  // Crisis context to append to message (matching Python version)
  const crisisContext = "\n\n[CRISIS ALERT: The user may be expressing thoughts of self-harm. Respond with immediate crisis resources and supportive language.]";
  
  return {
    isCrisis: true,
    severity: severity,
    context: crisisContext
  };
}

/**
 * Get immediate crisis resources
 * @returns {Object} - Crisis resources and contacts
 */
function getCrisisResources() {
  return {
    immediate: {
      suicide_prevention: {
        number: "988",
        description: "National Suicide Prevention Lifeline - Available 24/7"
      },
      crisis_text: {
        number: "741741",
        text: "HOME",
        description: "Crisis Text Line - Text HOME to 741741"
      },
      emergency: {
        number: "911",
        description: "Emergency Services - For immediate danger"
      }
    },
    online: [
      {
        name: "Crisis Chat",
        url: "https://suicidepreventionlifeline.org/chat/",
        description: "24/7 online crisis chat support"
      },
      {
        name: "Campus Resources",
        description: "Contact your campus counseling center for support"
      }
    ],
    followUp: [
      "Campus counseling services",
      "Student mental health services", 
      "Local mental health crisis centers",
      "Trusted friends, family, or mentors"
    ]
  };
}

/**
 * Generate crisis response template
 * @param {string} severity - Crisis severity level
 * @returns {string} - Template response for crisis situations
 */
function getCrisisResponseTemplate(severity = 'moderate') {
  const resources = getCrisisResources();
  
  const templates = {
    high: `🚨 **IMMEDIATE CRISIS RESOURCES** 🚨

I'm very concerned about what you've shared. Please reach out for immediate help:

📞 **Call 988** - National Suicide Prevention Lifeline (24/7)
💬 **Text HOME to 741741** - Crisis Text Line (24/7)  
🆘 **Call 911** - If you're in immediate danger

You are not alone, and there are people who want to help you right now. Please reach out to one of these resources immediately.`,

    moderate: `I hear that you're going through a really difficult time right now, and I'm glad you felt comfortable sharing that with me. 

**Crisis Support Available:**
• 📞 988 - National Suicide Prevention Lifeline
• 💬 Text HOME to 741741 - Crisis Text Line
• Campus counseling services

These feelings can be overwhelming, but they can also change with proper support. Would you like to talk about what's been contributing to these feelings?`
  };
  
  return templates[severity] || templates.moderate;
}

module.exports = {
  containsCrisisKeywords,
  analyzeCrisisLevel,
  getCrisisResources,
  getCrisisResponseTemplate,
  CRISIS_KEYWORDS,
  CRISIS_PATTERNS
};