import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  LayoutDashboard, 
  Map, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  User, 
  LogOut, 
  Plus,
  Brain,
  Code,
  Search,
  Clock,
  FileText,
  MessageSquare,
  Send,
  RefreshCw,
  Zap,
  Lock,
  Mail,
  ChevronRight,
  ArrowLeft,
  Star,
  MoreHorizontal,
  PlayCircle,
  Bell,
  Check,
  Eye,
  File,
  BookOpen,
  Video,
  List,
  Sparkles,
  Award,
  ThumbsUp,
  MessageCircle,
  X,
  Edit2,
  Camera,
  Save,
  Menu,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

// --- GEMINI API UTILITIES ---

const apiKey = ""; // Provided by environment

const callGemini = async (prompt, schema = null) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: schema ? "application/json" : "text/plain",
      ...(schema && { responseSchema: schema })
    }
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  for (let i = 0; i < 3; i++) { // Retry up to 3 times
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (schema && text) {
        // Clean markdown code blocks if present
        text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        return JSON.parse(text);
      }
      return text;
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error);
      if (i === 2) throw error; // Re-throw on last attempt
      await delay(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
};

// --- MOCK DATABASE ---

const MOCK_USERS = [
  { 
    id: 'u1', 
    email: 'admin@edu.com', 
    password: 'admin', 
    name: 'Sarah Administrator', 
    role: 'admin', 
    avatar: 'S' 
  },
  { 
    id: 's1', 
    email: 'student@edu.com', 
    password: '123', 
    name: 'Alice Johnson', 
    role: 'student', 
    avatar: 'A',
    resume: {
      summary: "Computer Science Major with a passion for web development and campus community service.",
      gpa: "3.8",
      experience: ["Library Volunteer (2022)", "Hackathon Winner (2023)"]
    },
    enrolledCourses: [] 
  },
  { 
    id: 'p1', 
    email: 'pro@career.com', 
    password: '123', 
    name: 'Mike Professional', 
    role: 'pro', 
    avatar: 'M' 
  }
];

const DB = {
  jobs: [
    { id: 1, title: 'Library Assistant', dept: 'Library Services', pay: '$15/hr', description: 'Assist students with research, organize shelves, and manage the front desk during evening hours.', skills: ['Organization', 'Customer Service'], color: 'bg-emerald-600' },
    { id: 2, title: 'IT Helpdesk Support', dept: 'IT Department', pay: '$18/hr', description: 'Level 1 tech support for campus computers. Must know how to troubleshoot Windows and MacOS issues.', skills: ['Windows', 'Troubleshooting'], color: 'bg-blue-600' },
    { id: 3, title: 'Research Aide', dept: 'Biology Lab', pay: '$16/hr', description: 'Clean equipment and log data samples for the new genome project. Requires safety certification.', skills: ['Data Entry', 'Lab Safety'], color: 'bg-indigo-600' },
    { id: 4, title: 'Campus Tour Guide', dept: 'Student Affairs', pay: '$14/hr', description: 'Lead prospective students on tours around campus. Must have good public speaking skills and know campus history.', skills: ['Public Speaking', 'History'], color: 'bg-orange-600' },
  ],
  applications: [
    { 
      id: 102, 
      jobId: 2, 
      jobTitle: 'IT Helpdesk Support', 
      studentId: 's1', 
      studentName: 'Alice Johnson', 
      status: 'Approved', 
      feedback: 'Welcome to the team!', 
      date: '2023-10-24',
      resumeSnapshot: {
        summary: "Computer Science Major with a passion for web development.",
        gpa: "3.8",
        experience: ["Library Volunteer (2022)"]
      },
      coverLetter: "I am excited to apply..."
    },
  ],
  notifications: [
    { id: 1, userId: 's1', message: 'Your application for IT Helpdesk Support was Approved!', read: false },
    { id: 2, userId: 'u1', message: 'New application received for Library Assistant.', read: true }
  ],
  courses: [
    {
      id: 'c1',
      title: 'Full Stack Web Development',
      description: 'Master the MERN stack (MongoDB, Express, React, Node) and build modern web applications.',
      tags: ['React', 'Node.js', 'Web'],
      color: 'bg-cyan-600',
      modules: [
        { id: 'm1', title: 'HTML5 & CSS3 Architecture', content: 'In this module, we dive deep into Semantic HTML5 elements and modern CSS layout techniques including Flexbox and CSS Grid.' },
        { id: 'm2', title: 'JavaScript ES6+ Deep Dive', content: 'Master the new features of JavaScript: Arrow functions, Destructuring, Promises, and Async/Await.' },
        { id: 'm3', title: 'React: Components & State', content: 'Learn the core of React: Functional Components, Hooks (useState, useEffect), and managing data flow.' },
        { id: 'm4', title: 'Node.js & Express API', content: 'Build robust RESTful APIs using Node.js and Express. Connect your frontend to a backend server.' }
      ]
    },
    {
      id: 'c2',
      title: 'Java Full Stack Bootcamp',
      description: 'Enterprise-grade development using Java, Spring Boot, and Angular.',
      tags: ['Java', 'Spring Boot', 'Angular'],
      color: 'bg-orange-600',
      modules: [
        { id: 'm1', title: 'Java Core Fundamentals', content: 'Object-Oriented Programming (OOP) concepts: Inheritance, Polymorphism, Encapsulation, and Abstraction.' },
        { id: 'm2', title: 'Spring Boot Basics', content: 'Introduction to Dependency Injection, Inversion of Control, and building Microservices.' },
        { id: 'm3', title: 'Hibernate & JPA', content: 'Managing database operations using Java Persistence API (JPA) and Hibernate ORM.' }
      ]
    },
    {
      id: 'c3',
      title: 'Python Mastery',
      description: 'From scripting to data analysis. Learn the language that powers AI and Data Science.',
      tags: ['Python', 'Data', 'Scripting'],
      color: 'bg-yellow-600',
      modules: [
        { id: 'm1', title: 'Python Syntax', content: 'Lists, Dictionaries, Tuples, and Sets. Control flow and error handling in Python.' },
        { id: 'm2', title: 'Data Handling with Pandas', content: 'Loading dataframes, cleaning data, and performing basic statistical analysis.' }
      ]
    },
    {
      id: 'c4',
      title: 'Database Management Systems',
      description: 'Learn SQL and NoSQL database design, querying, and optimization.',
      tags: ['SQL', 'MongoDB', 'Data'],
      color: 'bg-purple-600',
      modules: [
        { id: 'm1', title: 'Relational Design & SQL', content: 'ER Diagrams, Normalization, and writing complex JOIN queries in PostgreSQL.' },
        { id: 'm2', title: 'NoSQL with MongoDB', content: 'Document-based storage, Collections, and aggregation pipelines.' }
      ]
    }
  ]
};

// --- GEMINI POWERED AI CONTROLLER ---
const AI_CONTROLLER = {
  // ... existing AI logic ...
  generateRoadmap: async (goal) => {
    const prompt = `Create a 3-phase career learning roadmap for becoming a "${goal}". 
    Output strictly JSON. Return an ARRAY of objects. Each object must have:
    - "phase": string title (e.g. "Phase 1: Basics")
    - "items": array of 3-4 specific strings of topics to learn.`;
    
    try {
      const schema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            phase: { type: "STRING" },
            items: { type: "ARRAY", items: { type: "STRING" } }
          }
        }
      };
      const result = await callGemini(prompt, schema);
      return Array.isArray(result) ? result : [
        { phase: 'Error: Format Invalid', items: ['Could not parse roadmap data.'] }
      ];
    } catch (e) {
      console.error("Gemini Roadmap Error:", e);
      return [
        { phase: `Phase 1: ${goal} Basics`, items: ['Core Concepts', 'Syntax & Tools', 'First Project'] },
        { phase: 'Phase 2: Intermediate', items: ['Advanced Patterns', 'Best Practices', 'Frameworks'] },
        { phase: 'Phase 3: Professional', items: ['Real-world Application', 'Optimization', 'Career Prep'] },
      ];
    }
  },

  evaluateSkills: async (goal) => {
    const prompt = `Generate 3 multiple-choice quiz questions to test knowledge of "${goal}".
    Output strictly JSON. Return an ARRAY of objects. Each object must have:
    - "q": The question string.
    - "options": An array of 3 distinct string options.
    - "correct": The integer index (0, 1, or 2) of the correct answer.`;

    try {
      const schema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            q: { type: "STRING" },
            options: { type: "ARRAY", items: { type: "STRING" } },
            correct: { type: "INTEGER" }
          }
        }
      };
      const result = await callGemini(prompt, schema);
      return Array.isArray(result) ? result : [
        { q: "Validation Error", options: ["Error", "Retry", "Exit"], correct: 0 }
      ];
    } catch (e) {
      console.error("Gemini Skills Error:", e);
      return [
        { q: `What is a key concept in ${goal}?`, options: ["Concept A", "Concept B", "Concept C"], correct: 0 },
        { q: `Which tool is popular for ${goal}?`, options: ["Tool X", "Tool Y", "Tool Z"], correct: 1 },
        { q: `How do you start a ${goal} project?`, options: ["Method 1", "Method 2", "Method 3"], correct: 0 },
      ];
    }
  },

  recommendCourse: (goal) => {
    const goalLower = goal.toLowerCase();
    if (goalLower.includes('web') || goalLower.includes('react')) return 'c1';
    if (goalLower.includes('java')) return 'c2';
    if (goalLower.includes('python') || goalLower.includes('data')) return 'c3';
    if (goalLower.includes('sql') || goalLower.includes('base')) return 'c4';
    return 'c1'; 
  },

  rebuildSkillSet: async (goal) => {
    const prompt = `Create a remediation plan for failing a quiz on "${goal}".
    Output strictly JSON. Return an ARRAY of objects.
    - "type": string (e.g. "Study", "Practice")
    - "task": string`;

    try {
      const schema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            type: { type: "STRING" },
            task: { type: "STRING" }
          }
        }
      };
      const result = await callGemini(prompt, schema);
      return Array.isArray(result) ? result : [];
    } catch (e) {
      return [
        { type: 'Foundational', task: `Review official documentation for ${goal}` },
        { type: 'Practical', task: 'Build a small "Hello World" equivalent' },
        { type: 'Correction', task: 'Analyze where you went wrong in the quiz' },
        { type: 'Mentorship', task: 'Find a community forum for help' }
      ];
    }
  },

  calculateLayoffRisk: async (skills) => {
    const prompt = `Analyze the following skill set for 2025 job market stability: "${skills}".
    Return a JSON object with:
    - "riskLevel": One of "Low", "Medium", "High".
    - "score": Integer 0-100 (100 is safest).
    - "advice": A short sentence of career advice.`;

    try {
      const schema = {
        type: "OBJECT",
        properties: {
          riskLevel: { type: "STRING", enum: ["Low", "Medium", "High"] },
          score: { type: "INTEGER" },
          advice: { type: "STRING" }
        }
      };
      return await callGemini(prompt, schema);
    } catch (e) {
      return { riskLevel: 'Medium', score: 50, advice: "Market data unavailable. Keep learning new skills." };
    }
  },

  analyzeCandidateFit: async (resume, jobDesc) => {
    const prompt = `Match resume "${resume}" to job "${jobDesc}".
    Output strictly JSON object: { "score": 0-100, "analysis": string }`;

    try {
      const schema = {
        type: "OBJECT",
        properties: {
          score: { type: "INTEGER" },
          analysis: { type: "STRING" }
        }
      };
      return await callGemini(prompt, schema);
    } catch (e) {
      return { score: 0, analysis: "AI Analysis unavailable." };
    }
  },

  explainConcept: async (conceptText) => {
    const prompt = `Explain this concept simply in 2 sentences: "${conceptText.substring(0, 300)}..."`;
    try {
      return await callGemini(prompt);
    } catch (e) {
      return "Unable to generate explanation.";
    }
  },

  generateCoverLetter: async (resume, jobTitle, jobDesc) => {
    const prompt = `Write a short cover letter for "${jobTitle}" based on resume: "${resume}".`;
    try {
      return await callGemini(prompt);
    } catch (e) {
      return "I am excited to apply for this position and believe my skills make me a great fit.";
    }
  },

  chatWithCoach: async (message) => {
    const prompt = `Career Coach Chat. User: "${message}". Reply concisely.`;
    try {
      return await callGemini(prompt);
    } catch (e) {
      return "I'm having trouble connecting right now. Please try again.";
    }
  }
};

// --- UI COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false, type = 'button' }) => {
   const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 justify-center text-sm";
   const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-5 border-b sticky top-0 bg-white flex justify-between items-center z-10">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><XCircle size={20} className="text-slate-400"/></button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// ... ProfileModal, NotificationBell, HeroCard, ContentCard, SectionHeader ...
const ProfileModal = ({ user, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      resume: { ...prev.resume, [name]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="My Profile">
      <div className="space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-4xl mb-4 relative group">
            {formData.avatar}
            {isEditing && (
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            )}
          </div>
          {!isEditing ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800">{formData.name}</h2>
              <p className="text-slate-500">{formData.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wide">{formData.role}</span>
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                disabled={!isEditing}
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${isEditing ? 'border-slate-300 focus:ring-2 focus:ring-blue-500' : 'border-transparent bg-slate-50'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${isEditing ? 'border-slate-300 focus:ring-2 focus:ring-blue-500' : 'border-transparent bg-slate-50'}`}
              />
            </div>
          </div>

          {user.role === 'student' && (
            <div className="border-t border-slate-100 pt-4 mt-4">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><FileText size={18}/> Resume Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Professional Summary</label>
                  <textarea
                    name="summary"
                    rows={3}
                    disabled={!isEditing}
                    value={formData.resume?.summary || ''}
                    onChange={handleResumeChange}
                    className={`w-full p-2 border rounded-lg ${isEditing ? 'border-slate-300 focus:ring-2 focus:ring-blue-500' : 'border-transparent bg-slate-50'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GPA</label>
                  <input
                    type="text"
                    name="gpa"
                    disabled={!isEditing}
                    value={formData.resume?.gpa || ''}
                    onChange={handleResumeChange}
                    className={`w-full p-2 border rounded-lg ${isEditing ? 'border-slate-300 focus:ring-2 focus:ring-blue-500' : 'border-transparent bg-slate-50'}`}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setIsEditing(false); setFormData(user); }}>Cancel</Button>
                <Button type="submit"><Save size={16} /> Save Changes</Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline"><Edit2 size={16} /> Edit Profile</Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

const NotificationBell = ({ notifications, onMarkRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-blue-600 transition relative">
        <Bell size={20} />
        {unreadCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 animate-fade-in">
          <div className="p-3 border-b border-slate-100 flex justify-between items-center">
            <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
            <span className="text-xs text-slate-500">{unreadCount} unread</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? <div className="p-4 text-center text-xs text-slate-400">No notifications</div> : 
              notifications.map(n => (
                <div key={n.id} onClick={() => onMarkRead(n.id)} className={`p-3 text-sm border-b border-slate-50 cursor-pointer hover:bg-slate-50 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                  <p className={`text-slate-700 ${!n.read ? 'font-semibold' : ''}`}>{n.message}</p>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

const HeroCard = ({ title, subtitle, progress, buttonText, icon: Icon, colorClass = "bg-blue-600", onButtonClick }) => (
  <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
    <div className={`md:w-1/3 ${colorClass} p-8 text-white flex flex-col justify-center relative overflow-hidden`}>
      <div className="relative z-10">
        <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm"><Icon size={24} className="text-white" /></div>
        <h2 className="text-2xl font-bold mb-2">Jump back in</h2>
        <p className="text-blue-50 opacity-90 text-sm">Continue where you left off</p>
      </div>
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
    </div>
    <div className="md:w-2/3 p-8 flex flex-col justify-center">
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 mb-6">{subtitle}</p>
      {progress !== undefined && (
        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2"><span>Progress</span><span>{progress}%</span></div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div></div>
        </div>
      )}
      <div className="flex gap-3">
        <Button variant="primary" className="w-fit" onClick={onButtonClick}>{buttonText}</Button>
        <Button variant="secondary" className="w-fit">View Details</Button>
      </div>
    </div>
  </div>
);

const ContentCard = ({ title, type, subtitle, tags, imageColor, actionLabel, onClick, status }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group flex flex-col h-full">
    <div className={`h-32 ${imageColor} relative p-4 flex items-start justify-between`}>
       <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-slate-800 uppercase tracking-wider">{type}</span>
       <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/30 transition"><Star size={16} /></div>
    </div>
    <div className="p-5 flex-1 flex flex-col">
      <h4 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2">{title}</h4>
      <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-3">{subtitle}</p>
      <div className="flex flex-wrap gap-2 mb-4">{tags.slice(0, 2).map((t, i) => <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{t}</span>)}</div>
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1 text-xs text-slate-400 font-medium"><PlayCircle size={14} /> 4 Modules</div>
        {status ? (
           <span className={`text-xs font-bold px-3 py-1 rounded-full ${status === 'Approved' ? 'bg-green-100 text-green-700' : status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{status}</span>
        ) : (
           <button onClick={onClick} className="text-blue-600 text-sm font-bold hover:underline">{actionLabel}</button>
        )}
      </div>
    </div>
  </div>
);

const SectionHeader = ({ title, linkText = "View all", onLinkClick }) => (
  <div className="flex justify-between items-end mb-4">
    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
    <button onClick={onLinkClick} className="text-blue-600 text-sm font-medium hover:text-blue-700">{linkText}</button>
  </div>
);

const AuthScreen = ({ onLogin, users, onRegister }) => {
  const [step, setStep] = useState('role-select');
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep('login-form');
    setError('');
    const demoUser = users.find(u => u.role === role);
    if (demoUser) {
      setEmail(demoUser.email);
      setPassword(''); 
    }
  };

  const handleBack = () => {
    setStep('role-select');
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmitLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const user = users.find(u => u.email === email && u.password === password && u.role === selectedRole);
      if (user) {
        onLogin(user);
      } else {
        const demoUser = users.find(u => u.role === selectedRole);
        if (demoUser && (email === demoUser.email)) {
             setError(`Wrong password. Try '${demoUser.password}' for demo.`);
        } else {
             setError('Invalid credentials.');
        }
        setLoading(false);
      }
    }, 800);
  };

  const handleSubmitRegister = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Basic Validation
      if (password.length < 3) {
        setError('Password must be at least 3 characters long.');
        setLoading(false);
        return;
      }
      if (users.some(u => u.email === email)) {
        setError('This email is already registered.');
        setLoading(false);
        return;
      }
      if (selectedRole === 'admin' && users.filter(u => u.role === 'admin').length >= 1) {
        setError('Only one mock admin account is allowed (for demo purposes).');
        setLoading(false);
        return;
      }

      // Mock ID generation
      const newId = `u${Date.now()}`;
      const newUser = {
          id: newId,
          email: email,
          password: password,
          name: name.trim() || 'New User',
          role: selectedRole,
          avatar: (name.trim() || 'N')[0].toUpperCase(),
          // Add initial resume data for students
          ...(selectedRole === 'student' && {
            resume: { summary: "New student looking for opportunities.", gpa: "N/A", experience: [] },
            enrolledCourses: []
          })
      };

      onRegister(newUser); // Register and log in the new user
    }, 800);
  };

  const handleGoToRegister = () => {
    // Clear login fields and switch to register form
    setStep('register-form');
    setEmail('');
    setPassword('');
    setError('');
  }

  const handleGoToLogin = () => {
    // Clear register fields and switch to login form
    setStep('login-form');
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        <div className="md:w-5/12 bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Work Study</h1>
            <p className="text-blue-100 text-lg">Your integrated platform for employment, skills, and growth.</p>
          </div>
          <div className="relative z-10 space-y-6 mt-12">
            <div className="flex items-center gap-4"><div className="p-3 bg-blue-500/30 rounded-lg backdrop-blur-sm"><Briefcase size={24}/></div><div><h3 className="font-bold">Find Jobs</h3></div></div>
            <div className="flex items-center gap-4"><div className="p-3 bg-blue-500/30 rounded-lg backdrop-blur-sm"><Brain size={24}/></div><div><h3 className="font-bold">AI Skill Check</h3></div></div>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-indigo-500 rounded-full opacity-30 blur-3xl"></div>
        </div>

        <div className="md:w-7/12 p-12 flex flex-col justify-center bg-white relative">
          {step === 'role-select' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome</h2>
              <p className="text-slate-500 mb-8">Please select your portal to continue.</p>
              <div className="grid gap-4">
                <button onClick={() => handleRoleSelect('student')} className="group flex items-center gap-4 p-5 border border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50/50 transition-all text-left">
                  <div className="p-3 bg-green-100 text-green-600 rounded-lg"><GraduationCap size={24} /></div>
                  <div><h3 className="font-bold text-slate-800">Student Portal</h3><p className="text-sm text-slate-500">Apply & Track.</p></div>
                  <ChevronRight className="ml-auto text-slate-300 group-hover:text-green-500" />
                </button>
                <button onClick={() => handleRoleSelect('admin')} className="group flex items-center gap-4 p-5 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><LayoutDashboard size={24} /></div>
                  <div><h3 className="font-bold text-slate-800">Admin Portal</h3><p className="text-sm text-slate-500">Manage Everything.</p></div>
                  <ChevronRight className="ml-auto text-slate-300 group-hover:text-blue-500" />
                </button>
                <button onClick={() => handleRoleSelect('pro')} className="group flex items-center gap-4 p-5 border border-slate-200 rounded-xl hover:border-orange-500 hover:bg-orange-50/50 transition-all text-left">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><Briefcase size={24} /></div>
                  <div><h3 className="font-bold text-slate-800">Professional Portal</h3><p className="text-sm text-slate-500">Upskill & Risk Meter.</p></div>
                  <ChevronRight className="ml-auto text-slate-300 group-hover:text-orange-500" />
                </button>
              </div>
            </div>
          )}

          {step === 'login-form' && (
            <div className="animate-fade-in">
              <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 text-sm font-medium transition-colors"><ArrowLeft size={16} /> Back to Role Select</button>
              <h2 className="text-3xl font-bold text-slate-800 mb-2 capitalize">{selectedRole} Login</h2>
              <form onSubmit={handleSubmitLogin} className="space-y-4 mt-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" required className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" required className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertTriangle size={16} /> {error}</div>}
                <Button type="submit" className="w-full py-3 text-lg mt-4" disabled={loading}>{loading ? 'Verifying...' : 'Sign In'}</Button>
                <div className="text-center text-sm mt-4">
                    Don't have an account? <button type="button" onClick={handleGoToRegister} className="text-blue-600 hover:underline font-medium">Register</button>
                </div>
              </form>
            </div>
          )}

          {step === 'register-form' && (
             <div className="animate-fade-in">
                <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 text-sm font-medium transition-colors"><ArrowLeft size={16} /> Back to Role Select</button>
                <h2 className="text-3xl font-bold text-slate-800 mb-2 capitalize">{selectedRole} Registration</h2>
                <form onSubmit={handleSubmitRegister} className="space-y-4 mt-8">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input type="text" required className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" required className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password (min 3 chars)</label>
                    <input type="password" required className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertTriangle size={16} /> {error}</div>}
                  <Button type="submit" className="w-full py-3 text-lg mt-4" disabled={loading}>{loading ? 'Registering...' : 'Register Account'}</Button>
                  <div className="text-center text-sm mt-4">
                      Already have an account? <button type="button" onClick={handleGoToLogin} className="text-blue-600 hover:underline font-medium">Sign In</button>
                  </div>
                </form>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- FEATURE COMPONENTS ---

const RoadmapGenerator = () => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);

  const handleGenerate = async () => {
    if (!goal) return;
    setLoading(true);
    const data = await AI_CONTROLLER.generateRoadmap(goal);
    setRoadmap(data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
      <Card className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto"><Map size={32}/></div>
        <h2 className="text-2xl font-bold text-slate-800">AI Career Roadmap</h2>
        <p className="text-slate-500">Enter your target role (e.g., Full Stack Dev, Data Scientist) to generate a curriculum.</p>
        <div className="flex gap-2 max-w-lg mx-auto">
          <input type="text" placeholder="Dream Job Title..." className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={goal} onChange={(e) => setGoal(e.target.value)} />
          <Button onClick={handleGenerate} disabled={loading}>{loading ? 'Generating with AI...' : <><Sparkles size={16} className="fill-white"/> Generate</>}</Button>
        </div>
      </Card>
      {roadmap && Array.isArray(roadmap) && (
        <div className="space-y-6">
          {roadmap.map((phase, idx) => (
            <Card key={idx} className="p-6 border-l-4 border-l-blue-500">
              <h3 className="font-bold text-lg text-slate-800 mb-4">{phase.phase}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {phase.items && phase.items.map((item, i) => <div key={i} className="bg-slate-50 p-3 rounded border border-slate-100 text-sm text-slate-700 flex items-center gap-2"><CheckCircle size={14} className="text-green-500" />{item}</div>)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const CoursePlayer = ({ course, onBack, onCompleteCourse }) => {
  const [activeModuleId, setActiveModuleId] = useState(course.modules[0].id);
  const [completedModules, setCompletedModules] = useState([]);
  const [explanation, setExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  
  const activeModuleIndex = course.modules.findIndex(m => m.id === activeModuleId);
  const activeModule = course.modules[activeModuleIndex];
  
  const progress = Math.round((completedModules.length / course.modules.length) * 100);

  const handleExplain = async () => {
    setExplaining(true);
    const result = await AI_CONTROLLER.explainConcept(activeModule.content);
    setExplanation(result);
    setExplaining(false);
  };

  useEffect(() => { setExplanation(null); }, [activeModuleId]); 

  const handleNext = () => {
    if (!completedModules.includes(activeModuleId)) {
        setCompletedModules([...completedModules, activeModuleId]);
    }
    if (activeModuleIndex === course.modules.length - 1) {
        setShowCompletion(true);
    } else {
        setActiveModuleId(course.modules[activeModuleIndex + 1].id);
    }
  };

  const handleMarkComplete = () => {
     if (!completedModules.includes(activeModuleId)) {
        setCompletedModules([...completedModules, activeModuleId]);
     }
  };

  if (showCompletion) {
      return (
          <div className="flex items-center justify-center h-full bg-slate-50 animate-fade-in">
              <Card className="max-w-lg w-full p-12 text-center shadow-xl border-t-8 border-t-green-500">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><Award size={48} /></div>
                  <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Course Completed!</h1>
                  <p className="text-slate-500 text-lg mb-8">You have successfully mastered {course.title}.</p>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8 text-left">
                      <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Briefcase size={18}/> Next Steps</h4>
                      <p className="text-sm text-slate-600 mb-4">Your new skills qualify you for open positions.</p>
                      <Button onClick={onCompleteCourse} className="w-full justify-center">View Related Jobs <ArrowLeft className="rotate-180" size={16}/></Button>
                  </div>
                  <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-sm font-medium">Back to Dashboard</button>
              </Card>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ArrowLeft size={20}/></button>
            <div>
               <h2 className="font-bold text-slate-800 text-lg">{course.title}</h2>
               <div className="flex items-center gap-2 text-xs text-slate-500"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">Enrolled</span><span>• {course.modules.length} Modules</span></div>
            </div>
         </div>
         <div className="flex items-center gap-4">
             <div className="text-right"><div className="text-sm font-medium text-slate-600">Progress</div><div className="text-xs text-slate-400">{progress}% Complete</div></div>
             <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all duration-500" style={{width: `${progress}%`}}></div></div>
         </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
         <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
            <div className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Course Roadmap</div>
            <div className="space-y-1 p-2">
               {course.modules.map((mod, idx) => (
                  <button key={mod.id} onClick={() => setActiveModuleId(mod.id)} className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${activeModuleId === mod.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50'}`}>
                     <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${completedModules.includes(mod.id) ? 'bg-green-500 text-white' : activeModuleId === mod.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{completedModules.includes(mod.id) ? <Check size={10}/> : idx + 1}</div>
                     <div><div className={`text-sm font-medium ${activeModuleId === mod.id ? 'text-blue-700' : completedModules.includes(mod.id) ? 'text-slate-500 line-through' : 'text-slate-700'}`}>{mod.title}</div><div className="text-xs text-slate-400">15 mins</div></div>
                  </button>
               ))}
            </div>
         </div>
         <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto">
               <div className="aspect-video bg-slate-900 rounded-xl mb-8 flex items-center justify-center text-slate-500 shadow-lg relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="text-center relative z-10"><PlayCircle size={64} className="text-white/80 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300"/><p className="text-sm font-medium text-white/80">Video Player Placeholder</p></div>
               </div>
               <div className="flex justify-between items-start mb-6">
                 <h1 className="text-3xl font-bold text-slate-800">{activeModule.title}</h1>
                 <Button onClick={handleExplain} variant="secondary" disabled={explaining}>{explaining ? 'Analyzing...' : <><Sparkles size={16} className="text-purple-500"/> Explain with AI</>}</Button>
               </div>
               {explanation && (
                 <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-lg text-purple-900 text-sm animate-fade-in"><h4 className="font-bold mb-1 flex items-center gap-2"><Sparkles size={14}/> AI Explanation</h4>{explanation}</div>
               )}
               <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                  <p className="mb-4 text-lg">{activeModule.content}</p>
                  <p className="mb-4">This section covers the essential theory required to master {activeModule.title}.</p>
                  <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Key Takeaways</h3>
                  <ul className="list-disc pl-5 space-y-2"><li>Understanding the core concepts.</li><li>Practical application.</li></ul>
               </div>
               <div className="mt-12 flex justify-between pt-8 border-t border-slate-200">
                  <Button variant="outline" onClick={handleMarkComplete}>{completedModules.includes(activeModuleId) ? <><Check size={16}/> Completed</> : <><ThumbsUp size={16}/> Mark as Complete</>}</Button>
                  <Button onClick={handleNext}>{activeModuleIndex === course.modules.length - 1 ? 'Finish Course' : 'Next Topic'} <ChevronRight size={16}/></Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const LearnDashboard = ({ courses, onStartCourse }) => {
   return (
      <div className="max-w-6xl mx-auto p-6 animate-fade-in">
         <div className="mb-8"><h1 className="text-2xl font-bold text-slate-800">Learning Center</h1><p className="text-slate-500">Upgrade your skills with industry-standard courses.</p></div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
               <div key={course.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                  <div className={`h-40 ${course.color} p-6 flex flex-col justify-between text-white relative overflow-hidden`}>
                     <div className="relative z-10"><span className="bg-white/20 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">Course</span><h3 className="font-bold text-xl mt-2">{course.title}</h3></div>
                     <BookOpen size={120} className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                     <p className="text-slate-600 text-sm mb-4 flex-1">{course.description}</p>
                     <div className="flex flex-wrap gap-2 mb-6">{course.tags.map(t => <span key={t} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">{t}</span>)}</div>
                     <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1"><List size={14}/> {course.modules.length} Modules</div>
                        <button onClick={() => onStartCourse(course.id)} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:gap-2 transition-all">Start Learning <ChevronRight size={16}/></button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

const SkillEvaluator = ({ onRecommendCourse }) => {
  const [step, setStep] = useState('init');
  const [goal, setGoal] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const startQuiz = async () => {
    if(!goal) return;
    setLoading(true);
    const qs = await AI_CONTROLLER.evaluateSkills(goal);
    setQuestions(qs);
    setLoading(false);
    setStep('quiz');
    setScore(0);
    setCurrentQ(0);
  };

  const handleAnswer = (idx) => {
    if (idx === questions[currentQ].correct) setScore(s => s + 1);
    if (currentQ < questions.length - 1) setCurrentQ(c => c + 1);
    else setStep('result');
  };

  const handleRecommend = () => {
     const courseId = AI_CONTROLLER.recommendCourse(goal);
     onRecommendCourse(courseId);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 animate-fade-in">
      <Card className="p-8">
        {step === 'init' && (
          <div className="text-center space-y-4">
             <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto"><Brain size={32}/></div>
             <h2 className="text-2xl font-bold">Skill Evaluator</h2>
             <p className="text-slate-600">Test your knowledge. We'll suggest courses if you need them.</p>
             <input type="text" placeholder="e.g. Web Development, Java, Python" className="w-full p-3 border rounded-lg text-center max-w-md mx-auto block" value={goal} onChange={e => setGoal(e.target.value)} />
             <Button onClick={startQuiz} className="w-full max-w-md mx-auto" disabled={loading}>{loading ? 'Generating Quiz...' : 'Start Assessment'}</Button>
          </div>
        )}
        {step === 'quiz' && questions.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between text-sm font-medium text-slate-500"><span>Question {currentQ + 1}/{questions.length}</span><span className="capitalize">{goal}</span></div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div></div>
            <h3 className="text-xl font-semibold">{questions[currentQ].q}</h3>
            <div className="space-y-3">
              {questions[currentQ].options.map((opt, idx) => (
                <button key={idx} onClick={() => handleAnswer(idx)} className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors">{opt}</button>
              ))}
            </div>
          </div>
        )}
        {step === 'result' && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">Results for {goal}</h2>
            <div className="text-6xl font-black text-blue-600">{Math.round((score / questions.length) * 100)}%</div>
            {score < questions.length ? (
               <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 text-left">
                  <div className="flex items-start gap-4">
                     <div className="p-2 bg-amber-200 text-amber-700 rounded-lg"><AlertTriangle size={24}/></div>
                     <div>
                        <h3 className="font-bold text-slate-800">Skill Gap Detected</h3>
                        <p className="text-sm text-slate-600 mt-1 mb-4">You seem to be missing some core concepts in {goal}. We recommend enrolling in a dedicated course to bridge this gap.</p>
                        <Button onClick={handleRecommend} className="w-full justify-center bg-amber-600 hover:bg-amber-700 shadow-none border-0">View Recommended Course <ChevronRight size={16}/></Button>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-left">
                  <div className="flex items-start gap-4">
                     <div className="p-2 bg-green-200 text-green-700 rounded-lg"><CheckCircle size={24}/></div>
                     <div>
                        <h3 className="font-bold text-slate-800">Great Job!</h3>
                        <p className="text-sm text-slate-600 mt-1">Your skills are up to date. Check the "Jobs" tab for new opportunities.</p>
                     </div>
                  </div>
               </div>
            )}
            <Button onClick={() => setStep('init')} variant="outline" className="w-full">Take Another Quiz</Button>
          </div>
        )}
      </Card>
    </div>
  );
};

const LayoffMeter = () => {
  const [skills, setSkills] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!skills) return;
    setLoading(true);
    const data = await AI_CONTROLLER.calculateLayoffRisk(skills);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 animate-fade-in">
      <Card className="p-8 border-orange-100 bg-gradient-to-br from-white to-orange-50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><TrendingUp size={24} /></div>
          <div><h2 className="text-xl font-bold text-slate-900">Layoff Risk Meter</h2><p className="text-sm text-slate-500">Market Relevance Calculator</p></div>
        </div>
        {!result ? (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Enter your key skills</label>
            <textarea rows={3} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g., Python, Project Management..." value={skills} onChange={(e) => setSkills(e.target.value)} />
            <Button variant="primary" className="w-full bg-orange-600 hover:bg-orange-700" onClick={calculate} disabled={loading}>{loading ? "Analyzing Market Data..." : "Calculate Risk"}</Button>
          </div>
        ) : (
          <div className="text-center animate-fade-in">
             <div className="text-4xl font-black mb-2" style={{color: result.score > 80 ? '#22c55e' : result.score > 40 ? '#f59e0b' : '#ef4444'}}>{result.score}/100 Safe</div>
             <h3 className="text-2xl font-bold mb-2">Risk Level: {result.riskLevel}</h3>
             <p className="text-slate-600 mb-6">{result.advice}</p>
             <Button variant="outline" onClick={() => { setResult(null); setSkills(''); }} className="w-full border-orange-600 text-orange-600">Analyze Again</Button>
          </div>
        )}
      </Card>
    </div>
  );
};

const JobsList = ({ jobs, applications, onApply }) => {
  return (
    <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {jobs.map(job => {
        const app = applications.find(a => a.jobId === job.id);
        const status = app ? app.status : null;
        return (
          <ContentCard 
            key={job.id}
            type="Work-Study"
            title={job.title}
            subtitle={job.description}
            tags={job.skills}
            imageColor={job.color || 'bg-slate-500'}
            actionLabel={status ? status : "Apply Now"}
            status={status}
            onClick={() => onApply(job.id)}
          />
        );
      })}
    </div>
  );
};

const ReviewApplicationModal = ({ app, job, onClose, onAction }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await AI_CONTROLLER.analyzeCandidateFit(app.resumeSnapshot.summary, job.description);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <Modal isOpen={!!app} onClose={onClose} title="Review Application">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl">{app.studentName[0]}</div>
          <div><h2 className="text-xl font-bold text-slate-800">{app.studentName}</h2><p className="text-slate-500">Applicant for <span className="font-semibold text-blue-600">{job?.title}</span></p></div>
        </div>
        
        {analysis ? (
           <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                 <h4 className="font-bold text-purple-900 flex items-center gap-2"><Sparkles size={16}/> AI Match Score</h4>
                 <span className="text-lg font-black text-purple-700">{analysis.score}%</span>
              </div>
              <p className="text-sm text-purple-800">{analysis.analysis}</p>
           </div>
        ) : (
           <Button onClick={handleAnalyze} variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50" disabled={loading}>
              {loading ? 'Analyzing...' : <><Sparkles size={16}/> Analyze Fit with AI</>}
           </Button>
        )}

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <h4 className="font-bold text-slate-700 mb-2 text-sm uppercase tracking-wide flex items-center gap-2"><Briefcase size={16}/> Job Context</h4>
          <p className="text-sm text-slate-600">{job?.description}</p>
        </div>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100 p-3 border-b border-slate-200 flex justify-between items-center"><span className="font-bold text-slate-700 text-sm flex items-center gap-2"><FileText size={16}/> Candidate Resume</span><span className="text-xs bg-white border px-2 py-1 rounded">PDF Preview</span></div>
          <div className="p-6 bg-white space-y-4">
             {app.resumeSnapshot ? (
               <>
                 <div><label className="text-xs font-bold text-slate-400 uppercase">Professional Summary</label><p className="text-slate-800 font-medium">{app.resumeSnapshot.summary}</p></div>
                 <div className="flex gap-8">
                    <div><label className="text-xs font-bold text-slate-400 uppercase">GPA</label><p className="text-slate-800">{app.resumeSnapshot.gpa}</p></div>
                    <div><label className="text-xs font-bold text-slate-400 uppercase">Experience</label><ul className="list-disc list-inside text-sm text-slate-700">{app.resumeSnapshot.experience.map((exp, i) => <li key={i}>{exp}</li>)}</ul></div>
                 </div>
               </>
             ) : <div className="text-center text-slate-400 italic py-4">No resume attached</div>}
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <Button onClick={() => onAction(app.id, 'Approved')} variant="success" className="flex-1"><Check size={18}/> Approve Application</Button>
          <Button onClick={() => onAction(app.id, 'Rejected')} variant="danger" className="flex-1"><XCircle size={18}/> Reject Application</Button>
        </div>
      </div>
    </Modal>
  );
};

// --- NEW COMPONENT: Job Application Modal with AI Cover Letter ---
const JobApplicationModal = ({ job, user, onClose, onSubmit }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    const draft = await AI_CONTROLLER.generateCoverLetter(user.resume.summary, job.title, job.description);
    setCoverLetter(draft);
    setGenerating(false);
  };

  return (
    <Modal isOpen={!!job} onClose={onClose} title={`Apply for ${job.title}`}>
      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="font-bold text-sm text-slate-700">Job Description</h4>
          <p className="text-sm text-slate-600 mt-1">{job.description}</p>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-slate-700">Cover Letter / Note to Recruiter</label>
            <button 
              onClick={handleGenerate} 
              disabled={generating}
              className="text-xs flex items-center gap-1 text-purple-600 font-bold hover:text-purple-700 disabled:opacity-50"
            >
              <Sparkles size={12} /> {generating ? 'Drafting...' : 'AI Auto-Draft'}
            </button>
          </div>
          <textarea 
            rows={5} 
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            placeholder="Why are you a good fit for this role?"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(job.id, coverLetter)}>Submit Application</Button>
        </div>
      </div>
    </Modal>
  );
};

// --- NEW COMPONENT: Career Chatbot ---
const CareerChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am your AI Career Coach. Ask me anything about skills, interviews, or this platform.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    
    const response = await AI_CONTROLLER.chatWithCoach(userMsg);
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-fade-in" style={{ height: '500px' }}>
          <div className="bg-blue-600 p-4 text-white flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full"><Sparkles size={18} /></div>
            <div>
              <h3 className="font-bold text-sm">Career Coach AI</h3>
              <p className="text-xs opacity-80">Always here to help</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-xl rounded-tl-none text-slate-400 text-xs italic">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              className="flex-1 p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={loading} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// --- MAIN APP ---

export default function App() {
  const [users, setUsers] = useState(MOCK_USERS); // State to manage mock users
  const [currentUser, setCurrentUser] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState(DB.jobs);
  const [applications, setApplications] = useState(DB.applications);
  const [notifications, setNotifications] = useState(DB.notifications);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [reviewingApp, setReviewingApp] = useState(null);
  const [applyingJob, setApplyingJob] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const addNotification = (userId, message) => {
    setNotifications(prev => [{ id: Date.now(), userId, message, read: false }, ...prev]);
  };

  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    setShowProfile(false);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleRegister = (newUser) => {
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
  };

  const handleSubmitApplication = (jobId, coverLetter) => {
    const job = jobs.find(j => j.id === jobId);
    const alreadyApplied = applications.find(a => a.jobId === jobId && a.studentId === currentUser.id);
    if (alreadyApplied) return;
    
    const resumeSnapshot = currentUser.resume ? { ...currentUser.resume } : null;
    const newApp = { 
      id: Date.now(), 
      jobId, 
      jobTitle: job.title, 
      studentId: currentUser.id, 
      studentName: currentUser.name, 
      status: 'Pending', 
      date: new Date().toLocaleDateString(), 
      resumeSnapshot,
      coverLetter 
    };
    
    setApplications([...applications, newApp]);
    addNotification('u1', `New application for ${job.title} from ${currentUser.name}`);
    addNotification(currentUser.id, `You applied for ${job.title}. Good luck!`);
    setApplyingJob(null); 
  };

  const handleAppAction = (appId, status) => {
    const app = applications.find(a => a.id === appId);
    setApplications(apps => apps.map(a => a.id === appId ? { ...a, status } : a));
    addNotification(app.studentId, `Your application for ${app.jobTitle} was ${status}`);
    setReviewingApp(null);
  };

  const handleMarkRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const handleStartCourse = (courseId) => {
    setActiveCourseId(courseId);
  };

  const handleRecommendCourse = (courseId) => {
    setActiveTab('learn');
    setActiveCourseId(courseId);
  };

  const handleCourseCompletion = () => {
      setActiveCourseId(null);
      setActiveTab('jobs'); 
  };

  const handleApplyClick = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    setApplyingJob(job);
  };

  if (!currentUser) return <AuthScreen onLogin={handleLogin} users={users} onRegister={handleRegister} />;

  const userRole = currentUser.role;
  const myNotifications = notifications.filter(n => n.userId === currentUser.id);

  if (activeCourseId) {
    const course = DB.courses.find(c => c.id === activeCourseId);
    return (
        <CoursePlayer 
            course={course} 
            onBack={() => setActiveCourseId(null)} 
            onCompleteCourse={handleCourseCompletion}
        />
    );
  }

  // Define renderStudentDashboard
  const renderStudentDashboard = () => (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <HeroCard 
        title="Full Stack Development Path"
        subtitle="You are 30% through your Web Development roadmap."
        progress={30}
        buttonText="Continue Learning"
        icon={Map}
        colorClass="bg-gradient-to-r from-blue-600 to-indigo-600"
        onButtonClick={() => handleRecommendCourse('c1')}
      />

      <SectionHeader title="Recommended Opportunities" onLinkClick={() => setActiveTab('jobs')} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {jobs.map(job => {
           const app = applications.find(a => a.jobId === job.id && a.studentId === currentUser.id);
           return (
            <ContentCard 
              key={job.id}
              type="Work-Study"
              title={job.title}
              subtitle={job.dept}
              tags={job.skills}
              imageColor={job.color || 'bg-slate-500'}
              actionLabel="Apply Now"
              status={app?.status}
              onClick={() => handleApplyClick(job.id)}
            />
          );
        })}
      </div>

      <SectionHeader title="Build Your Skill Set" linkText="Go to Evaluator" onLinkClick={() => setActiveTab('eval')} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => setActiveTab('eval')} className="bg-white p-6 rounded-xl border border-slate-200 flex gap-4 items-center cursor-pointer hover:border-blue-400 transition">
           <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Brain size={24}/></div>
           <div><h4 className="font-bold text-slate-800">React Assessment</h4><p className="text-xs text-slate-500">Advanced • 15 mins</p></div>
        </div>
        <div onClick={() => setActiveTab('eval')} className="bg-white p-6 rounded-xl border border-slate-200 flex gap-4 items-center cursor-pointer hover:border-blue-400 transition">
           <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><TrendingUp size={24}/></div>
           <div><h4 className="font-bold text-slate-800">Soft Skills Quiz</h4><p className="text-xs text-slate-500">Intermediate • 10 mins</p></div>
        </div>
      </div>
    </div>
  );

  // Define renderAdminDashboard
  const renderAdminDashboard = () => (
    <div className="max-w-6xl mx-auto animate-fade-in">
       <HeroCard 
        title="Admin Overview"
        subtitle={`You have ${applications.filter(a => a.status === 'Pending').length} pending applications requiring review.`}
        buttonText="Review Queue"
        icon={LayoutDashboard}
        colorClass="bg-gradient-to-r from-slate-700 to-slate-800"
        onButtonClick={() => setActiveTab('apps')}
      />
      
      <SectionHeader title="Pending Applications" linkText="View All" />
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
        {applications.filter(a => a.status === 'Pending').length === 0 ? (
          <div className="p-8 text-center text-slate-400">No pending applications.</div>
        ) : (
          applications.filter(a => a.status === 'Pending').map(app => (
            <div key={app.id} className="p-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{app.studentName[0]}</div>
                 <div><h4 className="font-bold text-slate-800">{app.studentName}</h4><p className="text-xs text-slate-500">Applied for: <span className="font-semibold text-blue-600">{app.jobTitle}</span></p></div>
              </div>
              <Button onClick={() => setReviewingApp(app)} variant="outline" className="text-xs px-3 py-1"><Eye size={14}/> Review Application</Button>
            </div>
          ))
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-l-4 border-l-blue-500"><div className="text-slate-500 text-sm font-bold uppercase mb-1">Total Active Jobs</div><div className="text-3xl font-black text-slate-800">{jobs.length}</div></Card>
        <Card className="p-6 border-l-4 border-l-amber-500"><div className="text-slate-500 text-sm font-bold uppercase mb-1">Total Applications</div><div className="text-3xl font-black text-slate-800">{applications.length}</div></Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out ${isDesktopCollapsed ? 'w-20' : 'w-64'} ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className={`h-16 flex items-center ${isDesktopCollapsed ? 'justify-center' : 'justify-between px-6'} font-bold text-blue-700 text-xl border-b border-slate-100`}>
          {isDesktopCollapsed ? <span className="text-2xl">WS</span> : <span>Work Study</span>}
          {!isDesktopCollapsed && (
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-slate-100">
              <X size={20} className="text-slate-500"/>
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {userRole === 'student' && (
            <>
              <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" collapsed={isDesktopCollapsed} active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
              <NavItem icon={<BookOpen size={20}/>} label="Learn" collapsed={isDesktopCollapsed} active={activeTab === 'learn'} onClick={() => { setActiveTab('learn'); setIsSidebarOpen(false); }} />
              <div className={`pt-4 pb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400 ${isDesktopCollapsed ? 'hidden' : 'block'}`}>Career</div>
              <NavItem icon={<Briefcase size={20}/>} label="Jobs" collapsed={isDesktopCollapsed} active={activeTab === 'jobs'} onClick={() => { setActiveTab('jobs'); setIsSidebarOpen(false); }} />
              <NavItem icon={<Map size={20}/>} label="Roadmap" collapsed={isDesktopCollapsed} active={activeTab === 'roadmap'} onClick={() => { setActiveTab('roadmap'); setIsSidebarOpen(false); }} />
              <NavItem icon={<Brain size={20}/>} label="Skill Check" collapsed={isDesktopCollapsed} active={activeTab === 'eval'} onClick={() => { setActiveTab('eval'); setIsSidebarOpen(false); }} />
            </>
          )}
          {userRole === 'admin' && (
             <>
             <NavItem icon={<LayoutDashboard size={20}/>} label="Overview" collapsed={isDesktopCollapsed} active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
             <NavItem icon={<Briefcase size={20}/>} label="Jobs" collapsed={isDesktopCollapsed} active={activeTab === 'jobs'} onClick={() => { setActiveTab('jobs'); setIsSidebarOpen(false); }} />
             <NavItem icon={<User size={20}/>} label="Applications" collapsed={isDesktopCollapsed} active={activeTab === 'apps'} onClick={() => { setActiveTab('apps'); setIsSidebarOpen(false); }} />
             </>
          )}
          {userRole === 'pro' && (
             <>
             <NavItem icon={<LayoutDashboard size={20}/>} label="Overview" collapsed={isDesktopCollapsed} active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
             <NavItem icon={<BookOpen size={20}/>} label="Upskill" collapsed={isDesktopCollapsed} active={activeTab === 'learn'} onClick={() => { setActiveTab('learn'); setIsSidebarOpen(false); }} />
             <NavItem icon={<TrendingUp size={20}/>} label="Layoff Meter" collapsed={isDesktopCollapsed} active={activeTab === 'meter'} onClick={() => { setActiveTab('meter'); setIsSidebarOpen(false); }} />
             </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
           <button 
             onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} 
             className="hidden lg:flex items-center gap-3 text-slate-400 hover:text-slate-600 w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium justify-center"
           >
             {isDesktopCollapsed ? <PanelLeftOpen size={18} /> : <div className="flex items-center gap-3 w-full"><PanelLeftClose size={18} /><span>Collapse</span></div>}
           </button>
           <button onClick={() => setCurrentUser(null)} className={`flex items-center gap-3 text-slate-500 hover:text-red-600 w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium ${isDesktopCollapsed ? 'justify-center' : ''}`}>
             <LogOut size={18} />
             {!isDesktopCollapsed && <span>Sign Out</span>}
           </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isDesktopCollapsed ? 'lg:ml-20' : 'lg:ml-64'} h-full flex flex-col`}>
        <header className="flex justify-between items-center h-16 px-8 border-b border-slate-200 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 capitalize hidden sm:block">{activeTab === 'dashboard' ? 'My Dashboard' : activeTab}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-700">{currentUser.name}</p>
                <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
             </div>
             <NotificationBell notifications={myNotifications} onMarkRead={handleMarkRead} />
             <div onClick={() => setShowProfile(true)} className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm cursor-pointer hover:shadow-md transition-shadow">{currentUser.avatar}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          {activeTab === 'dashboard' && userRole === 'student' && renderStudentDashboard()}
          {activeTab === 'dashboard' && userRole === 'admin' && renderAdminDashboard()}
          {activeTab === 'dashboard' && userRole === 'pro' && <LayoffMeter />}
          
          {activeTab === 'roadmap' && <RoadmapGenerator />}
          {activeTab === 'eval' && <SkillEvaluator onRecommendCourse={handleRecommendCourse} />}
          {activeTab === 'meter' && <LayoffMeter />}
          {activeTab === 'jobs' && <JobsList jobs={jobs} applications={applications.filter(a => a.studentId === currentUser.id)} onApply={handleApplyClick} />}
          {activeTab === 'learn' && <LearnDashboard courses={DB.courses} onStartCourse={handleStartCourse} />}
          
          {activeTab === 'apps' && (
             <div className="max-w-6xl mx-auto animate-fade-in">
               <SectionHeader title="All Applications" />
               <div className="grid grid-cols-1 gap-4">
                 {applications.map(app => (
                    <div key={app.id} className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                       <div><h4 className="font-bold">{app.studentName}</h4><p className="text-sm text-slate-500">{app.jobTitle} • {app.status}</p></div>
                       {app.status === 'Pending' && <Button onClick={() => setReviewingApp(app)} variant="outline" className="text-xs">Review</Button>}
                    </div>
                 ))}
               </div>
             </div>
          )}

          {/* Modals & Chatbot */}
          {reviewingApp && <ReviewApplicationModal app={reviewingApp} job={jobs.find(j => j.id === reviewingApp.jobId)} onClose={() => setReviewingApp(null)} onAction={handleAppAction}/>}
          {applyingJob && <JobApplicationModal job={applyingJob} user={currentUser} onClose={() => setApplyingJob(null)} onSubmit={handleSubmitApplication} />}
          {showProfile && <ProfileModal user={currentUser} onClose={() => setShowProfile(false)} onSave={handleUpdateProfile} />}
          <CareerChatbot />
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ icon, label, active, onClick, collapsed }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${collapsed ? 'justify-center' : ''}`}
    title={collapsed ? label : ''}
  >
    {icon} 
    {!collapsed && <span className="flex-1 text-left">{label}</span>}
    {!collapsed && active && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
  </button>
);