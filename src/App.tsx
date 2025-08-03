import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Github, Linkedin, Youtube, Brain, Database, Globe, Code, BookOpen, FileText, Calendar, Star, Briefcase, Users, Mail, Heart, Shield, Layers, X, Mic } from "lucide-react";

function App() {
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [isLoading, setIsLoading] = useState(true);
  const [githubProjects, setGithubProjects] = useState<any[]>([]);


  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Function to generate intelligent descriptions based on repo name and language
  const generateSmartDescription = (repo: any) => {
    if (repo.description && repo.description.trim() && repo.description !== 'No description available') {
      return repo.description;
    }

    const name = repo.name?.toLowerCase() || '';
    const language = repo.language?.toLowerCase() || '';
    
    // Smart descriptions based on project name patterns and language
    const patterns = {
      'chatbot|chat-bot|llm|genai|gemini': 'Intelligent conversational AI system with advanced natural language processing capabilities',
      'recommendation|recommender': 'Personalized recommendation engine using machine learning algorithms',
      'dermatology|skin|disease': 'Deep learning model for medical diagnosis and image classification',
      'crypto|price|prediction|trading': 'Financial forecasting model with real-time market analysis',
      'food|ordering|restaurant|cravings': 'Modern food ordering platform with seamless user experience',
      'attendance|proxy|qr': 'Smart attendance management system with automated verification',
      'brain|tumor|medical|detection': 'Medical imaging analysis using advanced computer vision techniques',
      'portfolio|website|personal': 'Professional portfolio showcasing projects and achievements',
      'ml|machine-learning|algorithms': 'Implementation of cutting-edge machine learning algorithms',
      'computer-vision|cv|image': 'Computer vision project with advanced image processing capabilities',
      'nlp|natural-language|text': 'Natural language processing application with text analysis features',
      'data-science|analytics|visualization': 'Comprehensive data analysis and visualization project',
      'web|frontend|react|vue|angular': 'Modern web application with responsive design',
      'api|backend|server|node': 'Robust backend service with RESTful API architecture',
      'mobile|app|flutter|react-native': 'Cross-platform mobile application with native performance',
    };

    for (const [pattern, description] of Object.entries(patterns)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(name)) {
        return description;
      }
    }

    // Language-based fallback descriptions
    const languageDescriptions = {
      'python': 'Python-based application showcasing modern development practices',
      'javascript': 'Interactive web application built with modern JavaScript',
      'typescript': 'Type-safe application with enhanced developer experience',
      'react': 'Dynamic React application with component-based architecture',
      'vue': 'Progressive Vue.js application with reactive interfaces',
      'java': 'Robust Java application with enterprise-grade architecture',
      'c++': 'High-performance C++ application with optimized algorithms',
      'html': 'Modern web interface with clean and responsive design',
      'css': 'Stylish frontend project with advanced CSS techniques',
    };

    if (language && languageDescriptions[language as keyof typeof languageDescriptions]) {
      return languageDescriptions[language as keyof typeof languageDescriptions];
    }

    return 'Innovative project showcasing modern development practices and clean architecture';
  };

  // Function to fetch README and detect live preview URLs
  const fetchLivePreviewUrl = async (repo: any) => {
    try {
      // Check if repo already has homepage URL
      if (repo.homepage) {
        return repo.homepage;
      }

      // Try to fetch README content to find live preview URLs
      let readmeResponse = await fetch(`https://api.github.com/repos/YooshaMirza/${repo.name}/readme`);
      
      if (!readmeResponse.ok) {
        readmeResponse = await fetch(`https://api.github.com/repos/yooshamirza/${repo.name}/readme`);
      }

      if (readmeResponse.ok) {
        const readmeData = await readmeResponse.json();
        const readmeContent = atob(readmeData.content); // Decode base64 content
        
        // Look for common live preview patterns in README
        const liveUrlPatterns = [
          /(?:live|demo|preview|website|app)(?:\s*[:\-]\s*|\s+)(\S*(?:netlify\.app|vercel\.app|github\.io|herokuapp\.com|surge\.sh|firebase\.app|pages\.dev)[^\s)]*)/gi,
          /\[(?:live|demo|preview|website|app)\]\(([^)]+)\)/gi,
          /https?:\/\/(?:\S*\.)?(?:netlify\.app|vercel\.app|github\.io|herokuapp\.com|surge\.sh|firebase\.app|pages\.dev)[^\s)"]*/gi
        ];

        for (const pattern of liveUrlPatterns) {
          const matches = readmeContent.match(pattern);
          if (matches && matches.length > 0) {
            // Extract URL from markdown link format or direct URL
            let url = matches[0];
            const markdownMatch = url.match(/\[.*?\]\(([^)]+)\)/);
            if (markdownMatch) {
              url = markdownMatch[1];
            } else {
              // For pattern matches that include text before URL
              const urlMatch = url.match(/(https?:\/\/\S+)/);
              if (urlMatch) {
                url = urlMatch[1];
              }
            }
            return url.trim();
          }
        }
      }
    } catch (error) {
      console.log(`Could not fetch README for ${repo.name}:`, error);
    }
    return null;
  };

  // Fetch GitHub repositories
  useEffect(() => {
    const fetchGitHubRepos = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching GitHub repositories...');
        
        // Try both possible usernames
        let response = await fetch('https://api.github.com/users/YooshaMirza/repos?per_page=100&sort=updated');
        
        if (!response.ok) {
          console.log('Trying alternative username...');
          response = await fetch('https://api.github.com/users/yooshamirza/repos?per_page=100&sort=updated');
        }
        
        if (response.ok) {
          const repos = await response.json();
          console.log('GitHub API response:', repos);
          
          // Filter and format repositories
          const filteredRepos = repos.filter((repo: any) => !repo.fork);
          
          // Fetch live preview URLs for each repo
          const formattedRepos = await Promise.all(
            filteredRepos.map(async (repo: any) => {
              const liveUrl = await fetchLivePreviewUrl(repo);
              const smartDescription = generateSmartDescription(repo);
              return {
                title: repo.name,
                description: smartDescription,
                githubUrl: repo.html_url,
                demoUrl: repo.homepage || liveUrl,
                language: repo.language,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                updated: repo.updated_at,
                hasLivePreview: !!(repo.homepage || liveUrl)
              };
            })
          );
          
          const sortedRepos = formattedRepos.sort((a: any, b: any) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
          
          console.log('Formatted repos with live preview detection:', sortedRepos);
          setGithubProjects(sortedRepos);
        } else {
          console.warn('Failed to fetch GitHub repos, status:', response.status);
          setGithubProjects([]);
        }
      } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        setGithubProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGitHubRepos();
  }, []);

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Resume link
  const resumeLink = "https://drive.google.com/file/d/1iq7ibtC6xuRVvLhAjQircHz2w7_OGCd-/view?usp=sharing";

  // Experience categories
  const experienceCategories = {
    aiml: {
      title: "AI & Machine Learning Internships",
      items: [
        {
          title: "Machine Learning & AI Intern",
          company: "Sarvm.ai",
          period: "Dec 2024 – Jan 2025",
          description: [
            "Built Multilingual LLM models for text generation",
            "Fine-tuned large language models to enhance performance"
          ],
          icon: Brain
        },
        {
          title: "Machine Learning Intern",
          company: "IIT Indore DRISHTI CPS Foundation",
          period: "June 2024 – Aug 2024",
          description: [
            "Developed an LSTM model for time-series classification on NIFTY data",
            "Optimized feature extraction with technical indicators"
          ],
          icon: Database
        },
        {
          title: "Deep Learning Intern",
          company: "BIT Sindri, Jharkhand",
          period: "June 2024 – July 2024",
          description: [
            "Built an unsupervised learning model for real-time anomaly detection in WAAM"
          ],
          icon: Brain
        }
      ]
    },
    webdev: {
      title: "Web Development Internships",
      items: [
        {
          title: "Web Development Intern",
          company: "Sync",
          period: "Dec 2024 – Dec 2024",
          description: [
            "Developed high-performance web applications with modern frontend technologies"
          ],
          icon: Globe
        },
        {
          title: "Web Development Intern",
          company: "Octanet Services Pvt Ltd",
          period: "Dec 2023 – Jan 2024",
          description: [
            "Created interactive landing pages improving UX/UI"
          ],
          icon: Code
        },
        {
          title: "Python Developer Intern",
          company: "Dabotics India Pvt Ltd",
          period: "Dec 2023 – Jan 2024",
          description: [
            "Developed an OTP verification system and a URL shortener"
          ],
          icon: Code
        }
      ]
    },
    other: {
      title: "Other Professional Experience",
      items: [
        {
          title: "Quality Check Analyst Intern",
          company: "Cloudbird Digital",
          period: "May 2022 – July 2022",
          description: [
            "Verified and optimized Physics & Chemistry content for accuracy"
          ],
          icon: FileText
        }
      ]
    }
  };

  // Education data
  const educationList = [
    {
      degree: "Bachelor of Technology - BTech",
      institution: "Bennett University",
      period: "Sep 2022 – Sep 2026",
      field: "Computer Science Engineering",
      currentCGPA: "9.0",
      isHighlighted: true,
      details: [
        "Current Overall CGPA: 9.0 (Till 5th Semester)",
        "Semester-wise Performance:",
        "• 2nd Semester: 9.4 CGPA",
        "• 4th Semester: 9.0 CGPA", 
        "• 5th Semester: 9.0 CGPA",
        "Specialization: AI/ML, Data Structures, Computer Vision"
      ]
    },
    {
      degree: "Class XII (Higher Secondary)",
      institution: "Spring Dales Public School",
      period: "Jun 2020 – Jul 2021",
      field: "PCM Stream",
      details: [
        "Percentage: 92.6%"
      ]
    },
    {
      degree: "Class X (Secondary)",
      institution: "ShriRam School",
      period: "Jun 2018 – Jul 2019",
      field: "Secondary Education",
      details: [
        "Percentage: 93.6%"
      ]
    }
  ];

  // Simple function to redirect to GitHub profile
  const handleLoadAllRepos = () => {
    window.open('https://github.com/YooshaMirza', '_blank', 'noopener,noreferrer');
  };

  const leadershipRoles = [
    {
      title: "Freelancer",
      company: "Fiverr",
      period: "May 2021 – Present",
      description: [
        "Delivered AI/ML projects, web development, and content creation",
        "Maintained 5-star ratings on multiple projects"
      ],
      icon: Star
    },
    {
      title: "YouTuber",
      period: "July 2022 – Present",
      description: [
        "Created educational content on AI, ML, Web Development, and Competitive Programming"
      ],
      icon: Youtube
    },
    {
      title: "Placement Committee Member",
      period: "May 2025 – Present",
      description: [
        "Coordinated placement activities between students and recruiting companies",
        "Assisted in organizing campus recruitment drives"
      ],
      icon: Briefcase
    },
    {
      title: "Batch Representative",
      period: "Oct 2022 – Present",
      description: [
        "Bridged communication between students and faculty"
      ],
      icon: Users
    },
    {
      title: "Junior Core Team Member",
      company: "CodeChef BU",
      period: "Oct 2022 – Jan 2023",
      description: [
        "Organized coding contests and mentored students in competitive programming"
      ],
      icon: Code
    }
  ];

  // Project categories for organized display
  const projectCategories = {
    aiml: {
      title: "AI & Machine Learning",
      icon: Brain,
      projects: [
        {
          title: "3D-Voice-Bot-with-RAG-and-LLM",
          description: "Advanced 3D voice bot with Retrieval Augmented Generation and Large Language Models for interactive conversational AI experiences.",
          githubUrl: "https://github.com/YooshaMirza/3D-Voice-Bot-with-RAG-and-LLM",
          demoUrl: "https://chatbot-murex-eta-24.vercel.app/",
          hasLivePreview: true,
          language: "HTML",
          stars: 0,
          forks: 0,
          category: "AI/ML"
        },
        {
          title: "llm_chatbot",
          description: "Intelligent conversational AI system powered by Large Language Models for real-time conversations and natural language processing.",
          githubUrl: "https://github.com/YooshaMirza/llm_chatbot",
          demoUrl: "https://llmchatbot-dtlt9bfmcqup4kqek6yzfo.streamlit.app/",
          hasLivePreview: true,
          language: "Python",
          stars: 1,
          forks: 0,
          category: "AI/ML"
        },
        {
          title: "Text-to-Image-Video-Generation-Model",
          description: "Advanced AI model for generating images and videos from text descriptions using state-of-the-art deep learning techniques.",
          githubUrl: "https://github.com/YooshaMirza/Text-to-Image-Video-Generation-Model",
          demoUrl: null,
          hasLivePreview: false,
          language: "Jupyter Notebook",
          stars: 0,
          forks: 0,
          category: "AI/ML"
        },
        {
          title: "CRYPTO-PRICE-PREDICTION-MODEL",
          description: "Sophisticated cryptocurrency price prediction model using machine learning algorithms and technical analysis indicators.",
          githubUrl: "https://github.com/YooshaMirza/CRYPTO-PRICE-PREDICTION-MODEL",
          demoUrl: null,
          hasLivePreview: false,
          language: "Jupyter Notebook",
          stars: 0,
          forks: 0,
          category: "AI/ML"
        },
        {
          title: "AQI-forecast-website",
          description: "Air Quality Index forecasting website with predictive analytics and real-time environmental data visualization.",
          githubUrl: "https://github.com/YooshaMirza/AQI-forecast-website",
          demoUrl: "https://aqi-forecast-website.onrender.com/",
          hasLivePreview: true,
          language: "Python",
          stars: 0,
          forks: 0,
          category: "AI/ML"
        }
      ]
    },
    healthcare: {
      title: "Healthcare & Medical AI",
      icon: Heart,
      projects: [
        {
          title: "Deep-Learning-Skin-disease-and-skin-cancer-predition-model-using-CNN",
          description: "Advanced CNN model for skin disease and skin cancer prediction using deep learning with high accuracy medical image classification.",
          githubUrl: "https://github.com/YooshaMirza/Deep-Learning-Skin-disease-and-skin-cancer-predition-model-using-CNN",
          demoUrl: "https://delhi-care.vercel.app/",
          hasLivePreview: true,
          language: "HTML",
          stars: 0,
          forks: 0,
          category: "Healthcare"
        },
        {
          title: "Brain-tumor-Detection",
          description: "Medical imaging analysis system using advanced deep learning for brain tumor detection in MRI scans with clinical-grade accuracy.",
          githubUrl: "https://github.com/YooshaMirza/Brain-tumor-Detection",
          demoUrl: null,
          hasLivePreview: false,
          language: "Jupyter Notebook",
          stars: 0,
          forks: 0,
          category: "Healthcare"
        }
      ]
    },
    webdev: {
      title: "Web Development",
      icon: Globe,
      projects: [
        {
          title: "campus-cravings",
          description: "Modern food ordering platform with responsive design, Firebase backend, real-time order tracking, and seamless payment integration for campus dining.",
          githubUrl: "https://github.com/YooshaMirza/campus-cravings",
          demoUrl: "https://yooshamirza.github.io/campus-cravings/",
          hasLivePreview: true,
          language: "HTML",
          stars: 0,
          forks: 0,
          category: "Web Development"
        },
        {
          title: "Portfolio-Website",
          description: "Professional portfolio website built with React, TypeScript, and Framer Motion featuring responsive design, dark mode, and smooth animations.",
          githubUrl: "https://github.com/YooshaMirza/Portfolio-Website",
          demoUrl: "https://yoosha-portfolio.netlify.app/",
          hasLivePreview: true,
          language: "TypeScript",
          stars: 0,
          forks: 0,
          category: "Web Development"
        },
        {
          title: "Alumni-Connect-Portal",
          description: "Comprehensive alumni networking platform built with modern web technologies for connecting graduates and current students.",
          githubUrl: "https://github.com/YooshaMirza/Alumni-Connect-Portal-",
          demoUrl: "https://alumniconnectproject.netlify.app/",
          hasLivePreview: true,
          language: "TypeScript",
          stars: 0,
          forks: 0,
          category: "Web Development"
        }
      ]
    },
    systems: {
      title: "System Development & Security",
      icon: Shield,
      projects: [
        {
          title: "ANTI-PROXY-PROJECT",
          description: "Smart anti-proxy attendance management system with advanced verification algorithms to prevent proxy attendance and ensure authenticity.",
          githubUrl: "https://github.com/YooshaMirza/ANTI-PROXY-PROJECT",
          demoUrl: null,
          hasLivePreview: false,
          language: "Python",
          stars: 0,
          forks: 0,
          category: "System Development"
        },
        {
          title: "FireGuard-Advanced-Firewall-Management-System",
          description: "Advanced firewall management system with real-time threat detection and automated security response mechanisms.",
          githubUrl: "https://github.com/YooshaMirza/FireGuard-Advanced-Firewall-Management-System",
          demoUrl: null,
          hasLivePreview: false,
          language: "Python",
          stars: 0,
          forks: 0,
          category: "System Development"
        }
      ]
    },
    tools: {
      title: "Educational Tools & Visualization",
      icon: Layers,
      projects: [
        {
          title: "DSA-CODE-VISUALIZER",
          description: "Interactive data structures and algorithms visualizer with step-by-step code execution and visual representations.",
          githubUrl: "https://github.com/YooshaMirza/DSA-CODE-VISUALIZER",
          demoUrl: null,
          hasLivePreview: false,
          language: "Python",
          stars: 0,
          forks: 0,
          category: "Educational Tools"
        },
        {
          title: "segmentation-of-satellite-image-using-google-search-engine",
          description: "Satellite image segmentation project using Google Earth Engine for geospatial analysis and remote sensing applications.",
          githubUrl: "https://github.com/YooshaMirza/segmentation-of-satellite-image-using-google-search-engine",
          demoUrl: null,
          hasLivePreview: false,
          language: "Jupyter Notebook",
          stars: 0,
          forks: 0,
          category: "Educational Tools"
        }
      ]
    }
  };

  // Fallback projects if GitHub API fails (flattened for backward compatibility)
  const projects = Object.values(projectCategories).flatMap(category => category.projects);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Enhanced Sticky Navigation with Advanced Animations */}
      <motion.nav 
        className="fixed w-full z-50 relative"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Enhanced Glass Background with Dynamic Particles */}
        <motion.div 
          className="absolute inset-0 backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border-b border-white/20 dark:border-gray-700/30 shadow-2xl"
          animate={{
            backdropFilter: ["blur(8px)", "blur(12px)", "blur(8px)"],
            backgroundColor: [
              "rgba(255, 255, 255, 0.08)",
              "rgba(255, 255, 255, 0.12)",
              "rgba(255, 255, 255, 0.08)"
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Enhanced Floating Navbar Particles with More Layers */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Layer 1: Primary Particles - Reduced */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`nav-particle-primary-${i}`}
                className="absolute w-1 h-1 bg-teal-400/25 rounded-full"
                initial={{
                  x: Math.random() * 100,
                  y: Math.random() * 100,
                }}
                animate={{
                  x: [
                    Math.random() * 200 - 100,
                    Math.random() * 200 - 100
                  ],
                  y: [
                    Math.random() * 40 - 20,
                    Math.random() * 40 - 20
                  ],
                  opacity: [0, 0.7, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${5 + (i % 8) * 12}%`,
                  top: `${15 + Math.random() * 70}%`,
                }}
              />
            ))}
            
            {/* Layer 2: Secondary Glow Particles - Reduced */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`nav-particle-glow-${i}`}
                className="absolute w-2 h-2 bg-gradient-to-br from-cyan-400/15 to-blue-400/10 rounded-full blur-sm"
                initial={{
                  x: Math.random() * 100,
                  y: Math.random() * 100,
                }}
                animate={{
                  x: [0, Math.random() * 100 - 50, 0],
                  y: [0, Math.random() * 20 - 10, 0],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${8 + (i % 5) * 18}%`,
                  top: `${25 + Math.random() * 50}%`,
                }}
              />
            ))}
            
            {/* Layer 3: Micro Sparkles - Reduced */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`nav-sparkle-${i}`}
                className="absolute w-0.5 h-0.5 bg-white/30 rounded-full"
                initial={{
                  x: Math.random() * 100,
                  y: Math.random() * 100,
                }}
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [0, 0.8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
          
          {/* Simplified Animated Gradient Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-teal-500/8 via-transparent to-blue-500/8"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%"],
              opacity: 0.4,
            }}
            transition={{
              backgroundPosition: { duration: 15, repeat: Infinity, ease: "linear" },
            }}
            style={{ backgroundSize: "200% 100%" }}
          />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-center h-16 items-center">
            {/* Enhanced Logo/Brand Section with More Animations */}
            <motion.div 
              className="absolute left-4 md:left-8 flex items-center"
              initial={{ opacity: 0, x: -30, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                className="relative"
                whileHover={{ 
                  scale: 1.15, 
                  rotate: 10,
                  transition: { type: "spring", stiffness: 400, damping: 15 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-8 h-8 rounded-lg relative overflow-hidden"
                  style={{ background: 'transparent' }}
                  animate={{
                    boxShadow: [
                      "0 0 10px rgba(20, 184, 166, 0.3)",
                      "0 0 20px rgba(20, 184, 166, 0.5)",
                      "0 0 10px rgba(20, 184, 166, 0.3)"
                    ]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-teal-400 font-bold text-sm z-10">
                    YM
                  </div>
                  
                  {/* Single dot instead of orbital particles */}
                  <motion.div
                    className="absolute w-1 h-1 bg-teal-400/60 rounded-full"
                    style={{
                      left: '75%',
                      top: '25%',
                    }}
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Enhanced Navigation Links with Advanced Animations */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-6">
              {[
                { href: "#about", label: "About", icon: "👨‍💻" },
                { href: "#experience", label: "Experience", icon: "💼" },
                { href: "#projects", label: "Projects", icon: "🚀" },
                { href: "#research", label: "Research", icon: "📚" },
                { href: "#contact", label: "Contact", icon: "📧" }
              ].map((item, index) => (
                <motion.a 
                  key={item.href}
                  href={item.href} 
                  className="relative group font-medium px-2 sm:px-3 md:px-4 py-2 rounded-xl text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-all duration-300 overflow-hidden"
                  initial={{ opacity: 0, y: -30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.2 + index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ 
                    scale: 1.08, 
                    y: -3,
                    transition: { type: "spring", stiffness: 400, damping: 20 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Enhanced Multi-Layer Background Effects */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 rounded-xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ 
                      opacity: 1, 
                      scale: 1,
                      background: "linear-gradient(90deg, rgba(20, 184, 166, 0.1), rgba(20, 184, 166, 0.25), rgba(34, 211, 238, 0.1))"
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Secondary Glow Layer */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-blue-400/0 rounded-xl blur-sm"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                  
                  {/* Simplified Icon Animation */}
                  <motion.span 
                    className="hidden md:inline-block mr-2 text-sm relative"
                    style={{ filter: 'none' }}
                    whileHover={{
                      scale: 1.2,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <span style={{ color: 'inherit', textShadow: 'none' }}>
                      {item.icon}
                    </span>
                  </motion.span>
                  
                  {/* Enhanced Text */}
                  <span className="relative z-10 text-sm md:text-base">
                    {item.label}
                  </span>
                  
                  {/* Enhanced Underline with Multiple Effects */}
                  <motion.span 
                    className="absolute bottom-1 left-3 md:left-4 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
                    initial={{ width: 0, opacity: 0 }}
                    whileHover={{ 
                      width: "calc(100% - 1.5rem)",
                      opacity: 1,
                      boxShadow: [
                        "0 0 5px rgba(20, 184, 166, 0.4)",
                        "0 0 15px rgba(34, 211, 238, 0.6)",
                        "0 0 25px rgba(20, 184, 166, 0.4)"
                      ]
                    }}
                    transition={{ 
                      width: { duration: 0.3, ease: "easeOut" },
                      boxShadow: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                    }}
                  />
                  
                  {/* Removed Particle Trail for Performance */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {/* Reduced to 2 particles */}
                    {[...Array(2)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
                        style={{
                          left: `${25 + i * 25}%`,
                          top: `${50}%`,
                        }}
                        animate={{
                          opacity: [0, 0.8, 0],
                          scale: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </motion.div>
                  
                  {/* Magnetic Effect Indicator */}
                  <motion.div
                    className="absolute inset-0 rounded-xl border border-teal-400/20"
                    initial={{ scale: 1, opacity: 0 }}
                    whileHover={{ 
                      scale: 1.1, 
                      opacity: 1,
                      borderColor: "rgba(20, 184, 166, 0.5)"
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
              
              {/* Ultra Enhanced Dark Mode Toggle */}
              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                className="relative p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-600 dark:text-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ml-4"
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 1, 
                  delay: 0.8,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.15, 
                  y: -3, 
                  rotate: darkMode ? -20 : 20,
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)"
                }}
                whileTap={{ scale: 0.9 }}
              >
                {/* Enhanced Multi-Layer Background Animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-teal-400/15 to-cyan-400/15 rounded-xl"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileHover={{ 
                    opacity: 1, 
                    scale: 1,
                    background: darkMode 
                      ? "linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.2))"
                      : "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.2))"
                  }}
                  transition={{ duration: 0.4 }}
                />
                
                {/* Rotating Background Ring */}
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-gradient-to-r from-teal-400/30 to-cyan-400/30"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Simplified Orbital Particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(2)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-1 h-1 ${darkMode ? 'bg-yellow-400/70' : 'bg-purple-400/70'} rounded-full`}
                      style={{
                        left: '50%',
                        top: '50%',
                      }}
                      animate={{
                        x: Math.cos((i * 180) * Math.PI / 180) * 18,
                        y: Math.sin((i * 180) * Math.PI / 180) * 18,
                        opacity: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
                
                {/* Enhanced Icon with Complex Animations */}
                <motion.div
                  className="relative z-10"
                  animate={{ 
                    rotate: darkMode ? 0 : 180,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 0.6, ease: "easeInOut" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  {darkMode ? (
                    <motion.div
                      animate={{ 
                        textShadow: [
                          "0 0 5px rgba(251, 191, 36, 0.5)",
                          "0 0 20px rgba(251, 191, 36, 0.8)",
                          "0 0 35px rgba(245, 158, 11, 0.6)",
                          "0 0 5px rgba(251, 191, 36, 0.5)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sun size={20} style={{ color: '#f59e0b', filter: 'none' }} />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ 
                        textShadow: [
                          "0 0 5px rgba(139, 92, 246, 0.5)",
                          "0 0 20px rgba(139, 92, 246, 0.8)",
                          "0 0 35px rgba(99, 102, 241, 0.6)",
                          "0 0 5px rgba(139, 92, 246, 0.5)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Moon size={20} style={{ color: '#8b5cf6', filter: 'none' }} />
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Removed Multiple Ripples for better performance - just one simpler effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-teal-400/15"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.1, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Simplified Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-teal-400/60 to-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%"],
              opacity: 0.5,
            }}
            transition={{
              backgroundPosition: { duration: 8, repeat: Infinity, ease: "linear" },
            }}
            style={{ backgroundSize: "200% 100%" }}
          />
        </div>
      </motion.nav>

      {/* Hero Section - Matching Website Vibe with Same Animations */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 relative overflow-hidden min-h-screen flex items-center">
        {/* Background matching website's sophisticated theme */}
        <div className="absolute inset-0">
          {/* Primary Dark Gradient Background matching other sections */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-900 to-slate-700 dark:from-slate-700 dark:via-slate-900 dark:to-slate-700 opacity-90"></div>
          
          {/* Enhanced Animated Mesh Overlay with website colors */}
          <motion.div
            className="absolute inset-0 opacity-15"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, #334155 0%, transparent 60%), radial-gradient(circle at 80% 20%, #475569 0%, transparent 60%), radial-gradient(circle at 40% 80%, #64748b 0%, transparent 60%), radial-gradient(circle at 70% 40%, #334155 0%, transparent 50%)",
                "radial-gradient(circle at 60% 70%, #334155 0%, transparent 60%), radial-gradient(circle at 30% 40%, #475569 0%, transparent 60%), radial-gradient(circle at 80% 10%, #64748b 0%, transparent 60%), radial-gradient(circle at 10% 60%, #475569 0%, transparent 50%)",
                "radial-gradient(circle at 90% 30%, #334155 0%, transparent 60%), radial-gradient(circle at 20% 80%, #475569 0%, transparent 60%), radial-gradient(circle at 50% 20%, #64748b 0%, transparent 60%), radial-gradient(circle at 40% 90%, #334155 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, #334155 0%, transparent 60%), radial-gradient(circle at 80% 20%, #475569 0%, transparent 60%), radial-gradient(circle at 40% 80%, #64748b 0%, transparent 60%), radial-gradient(circle at 70% 40%, #334155 0%, transparent 50%)",
              ]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Significantly Reduced Floating Particles */}
          <div className="absolute inset-0">
            {/* Layer 1: Minimal Teal particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`teal-${i}`}
                className="absolute w-1 h-1 bg-teal-400/10 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  y: [0, -150, 0],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
              />
            ))}
            
            {/* Layer 2: Minimal ambient particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`ambient-${i}`}
                className="absolute w-2 h-2 bg-gradient-to-br from-teal-400/3 to-slate-400/3 rounded-full blur-sm"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  opacity: [0, 0.15, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          
          {/* Enhanced Grid Pattern with website colors */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.05, scale: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(20, 184, 166, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(20, 184, 166, 0.08) 1px, transparent 1px),
                linear-gradient(rgba(100, 116, 139, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(100, 116, 139, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px, 60px 60px, 20px 20px, 20px 20px',
            }}
          />
          
          {/* Removed Animated Light Rays for better performance */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 3 }}
          >
            {/* Static light effect instead of animated rays */}
            <div
              className="absolute w-full h-64 bg-gradient-to-b from-teal-400/5 to-transparent"
              style={{
                top: '10%',
                opacity: 0.3,
              }}
            />
          </motion.div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            {/* Enhanced Main Title with website-matching colors */}
            <motion.div className="relative mb-8">
              <motion.h1
                variants={fadeInUp}
                className="text-6xl md:text-8xl lg:text-9xl font-bold relative"
              >
                {/* Enhanced Background Text Effect with website colors */}
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-slate-400/10 via-slate-300/10 to-slate-400/10 bg-clip-text text-transparent blur-lg"
                  animate={{ 
                    scale: [1, 1.02, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Hi, I'm Mirza Yoosha Minhaj
                </motion.span>
                
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-slate-300/8 via-slate-200/8 to-slate-300/8 bg-clip-text text-transparent blur-md"
                  animate={{ 
                    scale: [1, 1.01, 1],
                    opacity: [0.15, 0.3, 0.15],
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  Hi, I'm Mirza Yoosha Minhaj
                </motion.span>
                
                {/* Enhanced Main Text with AI/ML Developer Colors */}
                <motion.span 
                  className="relative z-10"
                  initial={{ backgroundPosition: "0% 50%" }}
                  animate={{ 
                    textShadow: [
                      "0 0 30px rgba(20, 184, 166, 0.2)",
                      "0 0 50px rgba(20, 184, 166, 0.3)",
                      "0 0 30px rgba(20, 184, 166, 0.2)"
                    ]
                  }}
                  transition={{ 
                    textShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <span className="text-white">Hi, I'm </span>
                  <motion.span 
                    className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
                    animate={{ 
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                    style={{
                      backgroundSize: "200% 100%"
                    }}
                  >
                    Mirza Yoosha
                  </motion.span>
                  <span className="text-slate-200"> </span>
                  <motion.span 
                    className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent"
                    animate={{ 
                      backgroundPosition: ["100% 50%", "0% 50%", "100% 50%"],
                    }}
                    transition={{ 
                      duration: 6, 
                      repeat: Infinity, 
                      ease: "linear",
                      delay: 1
                    }}
                    style={{
                      backgroundSize: "200% 100%"
                    }}
                  >
                    Minhaj
                  </motion.span>
                </motion.span>
                
                {/* Enhanced Underline Effect with AI/ML gradient */}
                <motion.div
                  className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-teal-400/70 via-cyan-400/90 to-blue-400/70 rounded-full"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ 
                    width: ["0%", "90%", "0%"],
                    opacity: [0, 0.9, 0],
                    boxShadow: [
                      "0 0 10px rgba(20, 184, 166, 0.4)",
                      "0 0 30px rgba(34, 211, 238, 0.6)",
                      "0 0 10px rgba(59, 130, 246, 0.4)"
                    ]
                  }}
                  transition={{ 
                    width: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                    boxShadow: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
                
                {/* Enhanced Floating Tech Keywords with AI/ML colors */}
                <div className="absolute inset-0 pointer-events-none">
                  {[
                    { text: "AI", color: "from-teal-400 to-cyan-400" },
                    { text: "ML", color: "from-blue-400 to-purple-400" },
                    { text: "CV", color: "from-emerald-400 to-teal-400" },
                    { text: "DL", color: "from-purple-400 to-pink-400" },
                    { text: "NLP", color: "from-cyan-400 to-blue-400" },
                    { text: "LLM", color: "from-indigo-400 to-purple-400" }
                  ].map((tech, index) => (
                    <motion.span
                      key={tech.text}
                      className={`absolute bg-gradient-to-r ${tech.color} bg-clip-text text-transparent text-xl font-semibold`}
                      initial={{
                        x: Math.random() * 400 - 200,
                        y: Math.random() * 400 - 200,
                        opacity: 0,
                      }}
                      animate={{
                        x: [
                          Math.random() * 400 - 200,
                          Math.random() * 600 - 300,
                          Math.random() * 400 - 200
                        ],
                        y: [
                          Math.random() * 400 - 200,
                          Math.random() * 600 - 300,
                          Math.random() * 400 - 200
                        ],
                        opacity: [0, 0.6, 0],
                        rotate: [0, 360, 720],
                        scale: [0.8, 1.4, 0.8],
                      }}
                      transition={{
                        duration: 15,
                        repeat: Infinity,
                        delay: index * 2.5,
                        ease: "easeInOut",
                      }}
                      style={{
                        textShadow: `0 0 20px rgba(20, 184, 166, 0.4)`
                      }}
                    >
                      {tech.text}
                    </motion.span>
                  ))}
                </div>
                
                {/* Enhanced Orbital Elements with AI/ML Technology Colors */}
                <div className="absolute inset-0 pointer-events-none">
                  {[
                    { color: "bg-teal-400/30", size: "w-2 h-2" },
                    { color: "bg-cyan-400/25", size: "w-3 h-3" },
                    { color: "bg-blue-400/30", size: "w-1.5 h-1.5" },
                    { color: "bg-purple-400/25", size: "w-2.5 h-2.5" },
                    { color: "bg-emerald-400/30", size: "w-2 h-2" },
                    { color: "bg-indigo-400/25", size: "w-1.5 h-1.5" }
                  ].map((orbital, i) => (
                    <motion.div
                      key={`orbital-${i}`}
                      className={`absolute ${orbital.size} ${orbital.color} rounded-full`}
                      style={{
                        left: '50%',
                        top: '50%',
                        boxShadow: `0 0 10px ${orbital.color.split('/')[0].replace('bg-', 'rgba(').replace('-400', ', 0.5)')}`
                      }}
                      animate={{
                        x: Math.cos((i * 60 + Date.now() * 0.001) * Math.PI / 180) * (150 + i * 20),
                        y: Math.sin((i * 60 + Date.now() * 0.001) * Math.PI / 180) * (100 + i * 15),
                        opacity: [0.2, 0.8, 0.2],
                        scale: [0.5, 1.8, 0.5],
                      }}
                      transition={{
                        duration: 8 + i,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  ))}
                </div>
              </motion.h1>
            </motion.div>
            
            {/* Enhanced Subtitle with AI/ML Developer Theme */}
            <motion.div
              variants={fadeInUp}
              className="mb-6 relative"
            >
              <motion.p
                className="text-2xl md:text-4xl font-light tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
              >
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 2, duration: 3, ease: "easeInOut" }}
                  className="inline-block overflow-hidden whitespace-nowrap border-r-2 border-teal-400/60"
                  style={{
                    textShadow: "0 0 20px rgba(20, 184, 166, 0.15)"
                  }}
                >
                  <span className="text-slate-300">Machine Learning Engineer & </span>
                  <motion.span 
                    className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent"
                    animate={{ 
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                    style={{
                      backgroundSize: "200% 100%"
                    }}
                  >
                    AI Researcher
                  </motion.span>
                </motion.span>
              </motion.p>
              
              {/* Enhanced glow effect with AI colors */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-teal-400/8 via-cyan-400/8 to-blue-400/8 blur-2xl -z-10"
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            
            {/* Enhanced Description with website colors */}
            <motion.div
              variants={fadeInUp}
              className="max-w-4xl mx-auto mb-12"
            >
              <motion.p 
                className="text-lg md:text-xl text-slate-400 dark:text-slate-300 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3, duration: 1 }}
              >
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.2, duration: 1 }}
                >
                  AI/ML and Computer Vision enthusiast with hands-on experience in deep learning, LLMs, and full-stack development.
                </motion.span>
                <br />
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.8, duration: 1 }}
                >
                  Proficient in Python, OpenCV, TensorFlow, and Keras, with real-world experience in building and deploying
                  image and video processing applications.
                </motion.span>
                <br />
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 4.4, duration: 1 }}
                >
                  Strong academic background (CGPA 9.0) with internships at IIT Indore and BIT Sindri.
                </motion.span>
              </motion.p>
            </motion.div>

            {/* Enhanced Action Buttons matching website theme */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5, duration: 1 }}
            >
              <motion.a
                href="https://wa.me/919528114494?text=Hello%20Mirza%20Yoosha%2C%20I%20am%20interested%20in%20hiring%20you%20for%20a%20project.%20I%20found%20your%20portfolio%20impressive%20and%20would%20like%20to%20discuss%20potential%20opportunities."
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-10 py-4 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white text-lg font-semibold shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(20, 184, 166, 0.2)",
                    "0 0 40px rgba(20, 184, 166, 0.3)",
                    "0 0 20px rgba(20, 184, 166, 0.2)"
                  ]
                }}
                transition={{
                  boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <span className="relative z-10">Chat on WhatsApp</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-700"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              </motion.a>
              
              <motion.a
                href={resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-10 py-4 rounded-full border-2 border-slate-500 dark:border-slate-400 text-slate-700 dark:text-slate-300 text-lg font-semibold hover:bg-slate-600 hover:text-white transition-all duration-300 backdrop-blur-sm bg-slate-100/80 dark:bg-slate-800/60 shadow-xl hover:shadow-2xl overflow-hidden"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  borderColor: [
                    "rgb(100, 116, 139)",
                    "rgb(20, 184, 166)",
                    "rgb(148, 163, 184)",
                    "rgb(100, 116, 139)"
                  ],
                  boxShadow: [
                    "0 10px 25px rgba(100, 116, 139, 0.2)",
                    "0 15px 35px rgba(20, 184, 166, 0.3)",
                    "0 20px 40px rgba(148, 163, 184, 0.25)",
                    "0 10px 25px rgba(100, 116, 139, 0.2)"
                  ]
                }}
                transition={{
                  borderColor: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  boxShadow: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                {/* Enhanced Background Layers */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-600/20 via-teal-500/10 to-slate-600/20"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
                
                {/* Secondary Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Enhanced Text with Icon */}
                <span className="relative z-10 flex items-center gap-2">
                  <motion.span
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    whileHover={{
                      rotate: 15,
                      scale: 1.2,
                      transition: { duration: 0.2 }
                    }}
                  >
                    📄
                  </motion.span>
                  View Resume
                </span>
                
                {/* Floating Particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-gradient-to-r from-slate-400 to-teal-400 rounded-full"
                      style={{
                        left: `${20 + i * 20}%`,
                        top: `${30 + Math.random() * 40}%`,
                      }}
                      animate={{
                        y: [0, -12, 0],
                        x: [0, Math.random() * 8 - 4, 0],
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1.2, 0.5],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
                
                {/* Enhanced Border Shimmer */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-transparent"
                  style={{
                    background: "linear-gradient(45deg, transparent, rgba(20, 184, 166, 0.3), transparent)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "exclude",
                  }}
                  animate={{
                    rotate: [0, 360],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                    opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
                
                {/* Ripple Effect on Hover */}
                <motion.div
                  className="absolute inset-0 rounded-full border border-slate-400/30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0, 0.2],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.a>
            </motion.div>

            {/* Enhanced Social Links with website theme */}
            <motion.div
              variants={fadeInUp}
              className="flex justify-center space-x-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5.5, duration: 1 }}
            >
              {[
                { href: "https://github.com/YooshaMirza", icon: Github, bgColor: "bg-slate-800", name: "GitHub" },
                { href: "https://www.linkedin.com/in/mirza-yoosha-minhaj", icon: Linkedin, bgColor: "bg-blue-700", name: "LinkedIn" },
                { href: "https://www.youtube.com/@yooshamirza", icon: Youtube, bgColor: "bg-red-700", name: "YouTube" }
              ].map(({ href, icon: Icon, bgColor, name }, index) => (
                <motion.a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative p-4 rounded-full ${bgColor} text-white shadow-xl transition-all duration-300 hover:shadow-2xl z-10`}
                  initial={{ opacity: 0, y: 20, scale: 0.8, rotate: -10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1, 
                    rotate: 0,
                  }}
                  transition={{ delay: 5.7 + index * 0.1, duration: 0.6 }}
                  whileHover={{ 
                    scale: 1.15, 
                    y: -8,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={28} className="relative z-10" />
                  
                  {/* Enhanced glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white/10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Orbital ring effect with website colors */}
                  <motion.div
                    className="absolute inset-0 rounded-full border border-white/15"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0, 0.3, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.5,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* Tooltip on hover */}
                  <motion.div
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    initial={{ y: 10 }}
                    whileHover={{ y: 0 }}
                  >
                    {name}
                  </motion.div>
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-100 to-slate-300 dark:from-slate-700 dark:via-slate-900 dark:to-slate-700 opacity-90"></div>
        
        {/* Background Animations for About Section */}
        <div className="absolute inset-0">
          {/* Minimal Decoration Elements */}
          <div className="absolute inset-0">
            {/* Reduced Teal particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`about-teal-${i}`}
                className="absolute w-1 h-1 bg-teal-400/8 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                }}
                animate={{
                  opacity: [0, 0.2, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: i,
                  ease: "easeInOut",
                }}
              />
            ))}
            
            {/* Layer 2: Larger ambient particles */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`about-ambient-${i}`}
                className="absolute w-2 h-2 bg-gradient-to-br from-teal-400/4 to-slate-400/4 rounded-full blur-sm"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  y: [0, -150, 0],
                  x: [0, Math.random() * 80 - 40, 0],
                  opacity: [0, 0.2, 0],
                  scale: [0.5, 1.3, 0.5],
                }}
                transition={{
                  duration: Math.random() * 8 + 6,
                  repeat: Infinity,
                  delay: Math.random() * 6,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          
          {/* Enhanced Floating Tech Keywords for About - More Frequent */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              { text: "React", color: "from-cyan-400 to-blue-400" },
              { text: "Python", color: "from-emerald-400 to-teal-400" },
              { text: "TypeScript", color: "from-blue-400 to-purple-400" },
              { text: "Research", color: "from-purple-400 to-pink-400" },
              { text: "AI", color: "from-teal-400 to-cyan-400" },
              { text: "ML", color: "from-purple-400 to-indigo-400" },
              { text: "Data", color: "from-emerald-400 to-cyan-400" },
              { text: "Code", color: "from-blue-400 to-purple-400" },
              { text: "Web", color: "from-cyan-400 to-blue-400" },
              { text: "Dev", color: "from-indigo-400 to-purple-400" },
              { text: "API", color: "from-pink-400 to-rose-400" },
              { text: "UI", color: "from-amber-400 to-orange-400" },
              { text: "UX", color: "from-lime-400 to-green-400" },
              { text: "CSS", color: "from-sky-400 to-cyan-400" },
              { text: "JS", color: "from-violet-400 to-purple-400" }
            ].map((tech, index) => (
              <motion.span
                key={`about-${tech.text}`}
                className={`absolute bg-gradient-to-r ${tech.color} bg-clip-text text-transparent text-lg font-semibold`}
                initial={{
                  x: Math.random() * 100 + 10,
                  y: Math.random() * 100 + 10,
                  opacity: 0,
                }}
                animate={{
                  x: [
                    Math.random() * 300 - 150,
                    Math.random() * 400 - 200,
                    Math.random() * 300 - 150
                  ],
                  y: [
                    Math.random() * 300 - 150,
                    Math.random() * 400 - 200,
                    Math.random() * 300 - 150
                  ],
                  opacity: [0, 0.8, 0],
                  rotate: [0, 180, 360],
                  scale: [0.8, 1.4, 0.8],
                }}
                transition={{
                  duration: 6 + Math.random() * 3,
                  repeat: Infinity,
                  delay: index * 0.4,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${5 + (index % 6) * 15}%`,
                  top: `${10 + Math.floor(index / 6) * 25}%`,
                  textShadow: `0 0 20px rgba(20, 184, 166, 0.4)`
                }}
              >
                {tech.text}
              </motion.span>
            ))}
          </div>
          
          {/* Reduced Floating Bubbles for About */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`about-bubble-${i}`}
                className="absolute rounded-full bg-gradient-to-br from-teal-400/10 to-cyan-400/5 border border-teal-400/20"
                style={{
                  width: Math.random() * 40 + 20,
                  height: Math.random() * 40 + 20,
                  left: `${10 + (i % 4) * 20}%`,
                  top: `${20 + (Math.floor(i / 4)) * 30}%`,
                }}
                animate={{
                  y: [0, -100],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8">
            {/* Enhanced Section Separator - Full Width */}
            <div className="flex items-center justify-center mb-6 w-full">
              <motion.div 
                className="flex items-center w-full max-w-4xl"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div 
                  className="flex-1 h-1 bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
                
                <motion.div
                  className="mx-6 px-4 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-medium dark:bg-teal-900 dark:text-teal-200 relative"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <motion.span
                    animate={{ 
                      boxShadow: [
                        "0 0 10px rgba(20, 184, 166, 0.3)",
                        "0 0 20px rgba(20, 184, 166, 0.6)",
                        "0 0 10px rgba(20, 184, 166, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    
                  </motion.span>
                </motion.div>
                
                <motion.div 
                  className="flex-1 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-teal-400 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
                  />
                </motion.div>
              </motion.div>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-title"
            >
              About Me
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            <motion.div 
              className="glass-card p-8 shadow-lg border border-teal-400/20 dark:border-teal-400/10 transition-all duration-300 bg-white/80 dark:bg-gray-900/80"
              whileHover={{ scale: 1.05, y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                My Background
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                My journey spans from academic research at prestigious institutions to hands-on development 
                of real-world AI solutions. With a strong foundation in computer vision and deep learning, 
                I've built systems that solve complex problems in healthcare, finance, and data analytics.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                As a content creator, I share my knowledge through YouTube tutorials and technical blogs,
                with a passion for making complex AI concepts accessible to a wider audience.
              </p>
            </motion.div>

            <motion.div 
              className="glass-card p-8 shadow-lg border border-teal-400/20 dark:border-teal-400/10 transition-all duration-300 bg-white/80 dark:bg-gray-900/80"
              whileHover={{ scale: 1.05, y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                My Expertise
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Brain className="text-teal-500 mr-3 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">AI & Machine Learning</h4>
                    <p className="text-gray-600 dark:text-gray-300">Developing custom CNN models, LLMs, and computer vision applications with Python, TensorFlow, and Keras</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Code className="text-teal-500 mr-3 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Full-Stack Development</h4>
                    <p className="text-gray-600 dark:text-gray-300">Building responsive web applications with React, TypeScript, and modern backend technologies</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <FileText className="text-teal-500 mr-3 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Research & Publication</h4>
                    <p className="text-gray-600 dark:text-gray-300">Conducting academic research in AI applications for healthcare and publishing in peer-reviewed journals</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-100 to-slate-300 dark:from-slate-700 dark:via-slate-900 dark:to-slate-700 opacity-90"></div>
        
        {/* Background Animations for Experience Section */}
        <div className="absolute inset-0">
          {/* Reduced Floating Particles */}
          <div className="absolute inset-0">
            {/* Layer 1: Minimal Professional particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`exp-particles-${i}`}
                className="absolute w-1.5 h-1.5 bg-blue-400/10 rounded-full"
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  y: [0, -60, 0],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
            
            {/* Layer 2: Minimal Career-themed bubbles */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`exp-bubbles-${i}`}
                className="absolute w-3 h-3 bg-gradient-to-br from-purple-400/6 to-indigo-400/6 rounded-full blur-sm"
                style={{
                  left: `${25 + i * 20}%`,
                  top: `${40 + (i % 2) * 30}%`,
                }}
                animate={{
                  opacity: [0, 0.2, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          
          {/* Reduced Floating Professional Keywords */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              { text: "Innovation", color: "from-blue-400 to-cyan-400" },
              { text: "Leadership", color: "from-purple-400 to-indigo-400" },
              { text: "Growth", color: "from-teal-400 to-emerald-400" },
              { text: "Excellence", color: "from-indigo-400 to-purple-400" },
              { text: "Skills", color: "from-purple-400 to-pink-400" }
            ].map((word, index) => (
              <motion.span
                key={`exp-${word.text}`}
                className={`absolute bg-gradient-to-r ${word.color} bg-clip-text text-transparent text-lg font-semibold`}
                initial={{
                  x: Math.random() * 100 + 10,
                  y: Math.random() * 100 + 10,
                  opacity: 0,
                }}
                animate={{
                  x: [
                    Math.random() * 350 - 175,
                    Math.random() * 450 - 225,
                    Math.random() * 350 - 175
                  ],
                  y: [
                    Math.random() * 350 - 175,
                    Math.random() * 450 - 225,
                    Math.random() * 350 - 175
                  ],
                  opacity: [0, 0.8, 0],
                  rotate: [0, 270, 540],
                  scale: [0.7, 1.5, 0.7],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: index * 0.5,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${3 + (index % 6) * 16}%`,
                  top: `${8 + Math.floor(index / 6) * 28}%`,
                  textShadow: `0 0 25px rgba(59, 130, 246, 0.4)`
                }}
              >
                {word.text}
              </motion.span>
            ))}
          </div>
          
          {/* Reduced Professional Bubbles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`exp-pro-bubble-${i}`}
                className="absolute rounded-full bg-gradient-to-br from-blue-400/8 to-purple-400/4 border border-blue-400/15"
                style={{
                  width: 40 + (i % 4) * 15,
                  height: 40 + (i % 4) * 15,
                  left: `${10 + (i % 4) * 25}%`,
                  top: `${20 + Math.floor(i / 4) * 40}%`,
                }}
                animate={{
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8">
            {/* Enhanced Section Separator - Full Width */}
            <div className="flex items-center justify-center mb-6 w-full">
              <motion.div 
                className="flex items-center w-full max-w-4xl"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div 
                  className="flex-1 h-1 bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
                
                <motion.div
                  className="mx-6 px-4 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-medium dark:bg-teal-900 dark:text-teal-200 relative"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <motion.span
                    animate={{ 
                      boxShadow: [
                        "0 0 10px rgba(20, 184, 166, 0.3)",
                        "0 0 20px rgba(20, 184, 166, 0.6)",
                        "0 0 10px rgba(20, 184, 166, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    
                  </motion.span>
                </motion.div>
                
                <motion.div 
                  className="flex-1 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-teal-400 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
                  />
                </motion.div>
              </motion.div>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-title"
            >
              Work Experience
            </motion.h2>
          </div>
          
          {/* Render each experience category */}
          {Object.values(experienceCategories).map((category, catIndex) => (
            <div key={catIndex} className="mb-12 last:mb-0">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100 flex items-center"
              >
                <span className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center mr-3 text-white">
                  {catIndex + 1}
                </span>
                <span className="relative">
                  {category.title}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500 to-transparent"></span>
                </span>
              </motion.h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((exp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="glass-card p-6 h-full flex flex-col shadow-lg border border-teal-400/20 dark:border-teal-400/10 transition-all duration-300 bg-white/80 dark:bg-gray-900/80"
                    whileHover={{ scale: 1.05, y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="flex items-start h-full">
                      <exp.icon className="text-teal-500 mr-4 flex-shrink-0" size={24} />
                      <div className="flex-grow">
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {exp.title}
                        </h4>
                        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{exp.company}</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Calendar className="mr-2" size={16} />
                          <span>{exp.period}</span>
                        </div>
                        <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                          {exp.description.map((desc, i) => (
                            <li key={i}>• {desc}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="text-center mb-8">
            {/* Enhanced Section Separator - Full Width */}
            <div className="flex items-center justify-center mb-6 w-full">
              <motion.div 
                className="flex items-center w-full max-w-4xl"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div 
                  className="flex-1 h-1 bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
                
                <motion.div
                  className="mx-6 px-4 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-medium dark:bg-teal-900 dark:text-teal-200 relative"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <motion.span
                    animate={{ 
                      boxShadow: [
                        "0 0 10px rgba(20, 184, 166, 0.3)",
                        "0 0 20px rgba(20, 184, 166, 0.6)",
                        "0 0 10px rgba(20, 184, 166, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    
                  </motion.span>
                </motion.div>
                
                <motion.div 
                  className="flex-1 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-teal-400 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
                  />
                </motion.div>
              </motion.div>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-title"
            >
              Leadership & Freelancing
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {/* Enhanced Leadership Background Animations */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Floating Leadership Keywords */}
              {[
                { text: "Lead", color: "from-amber-400 to-orange-400" },
                { text: "Mentor", color: "from-emerald-400 to-teal-400" },
                { text: "Guide", color: "from-blue-400 to-indigo-400" },
                { text: "Inspire", color: "from-purple-400 to-pink-400" },
                { text: "Achieve", color: "from-cyan-400 to-blue-400" },
                { text: "Success", color: "from-rose-400 to-pink-400" },
                { text: "Vision", color: "from-violet-400 to-purple-400" },
                { text: "Growth", color: "from-green-400 to-emerald-400" }
              ].map((word, index) => (
                <motion.span
                  key={`leadership-${word.text}`}
                  className={`absolute bg-gradient-to-r ${word.color} bg-clip-text text-transparent text-lg font-semibold`}
                  initial={{
                    x: Math.random() * 100 + 10,
                    y: Math.random() * 100 + 10,
                    opacity: 0,
                  }}
                  animate={{
                    x: [
                      Math.random() * 300 - 150,
                      Math.random() * 400 - 200,
                      Math.random() * 300 - 150
                    ],
                    y: [
                      Math.random() * 300 - 150,
                      Math.random() * 400 - 200,
                      Math.random() * 300 - 150
                    ],
                    opacity: [0, 0.8, 0],
                    rotate: [0, 180, 360],
                    scale: [0.8, 1.4, 0.8],
                  }}
                  transition={{
                    duration: 9 + Math.random() * 4,
                    repeat: Infinity,
                    delay: index * 0.8,
                    ease: "easeInOut",
                  }}
                  style={{
                    left: `${10 + (index % 4) * 20}%`,
                    top: `${15 + Math.floor(index / 4) * 30}%`,
                    textShadow: `0 0 25px rgba(245, 158, 11, 0.4)`
                  }}
                >
                  {word.text}
                </motion.span>
              ))}
              
              {/* Leadership Bubbles */}
              {[...Array(18)].map((_, i) => (
                <motion.div
                  key={`leadership-bubble-${i}`}
                  className="absolute rounded-full bg-gradient-to-br from-amber-400/8 to-orange-400/5 border border-amber-400/15"
                  style={{
                    width: Math.random() * 70 + 25,
                    height: Math.random() * 70 + 25,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -200 - Math.random() * 100],
                    x: [0, Math.random() * 100 - 50],
                    opacity: [0, 0.7, 0],
                    scale: [0.5, 1.3, 0.2],
                    rotate: [0, 270],
                  }}
                  transition={{
                    duration: 10 + Math.random() * 5,
                    repeat: Infinity,
                    delay: Math.random() * 4,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            
            {leadershipRoles.map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-6 h-full flex flex-col shadow-lg border border-teal-400/20 dark:border-teal-400/10 transition-all duration-300 bg-white/80 dark:bg-gray-900/80"
                whileHover={{ scale: 1.05, y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex items-start h-full">
                  <role.icon className="text-teal-500 mr-4 flex-shrink-0" size={24} />
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {role.title}
                    </h3>
                    {role.company && (
                      <p className="text-gray-600 dark:text-gray-400">{role.company}</p>
                    )}
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="mr-2" size={16} />
                      <span>{role.period}</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                      {role.description.map((desc, i) => (
                        <li key={i}>• {desc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-100 to-slate-300 dark:from-slate-700 dark:via-slate-900 dark:to-slate-700 opacity-90"></div>
        
        {/* Enhanced Background Animations for Projects Section - More Frequent Throughout */}
        <div className="absolute inset-0">
          {/* Minimized Layers of Floating Particles */}
          <div className="absolute inset-0">
            {/* Layer 1: Creative particles - Significantly Reduced */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`projects-particles-${i}`}
                className="absolute w-1.5 h-1.5 bg-emerald-400/15 rounded-full"
                style={{
                  left: `${10 + (i % 4) * 20}%`,
                  top: `${20 + Math.floor(i / 4) * 30}%`,
                }}
                animate={{
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
            
            {/* Layer 2: Project-themed elements - Minimal Static Version */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`projects-elements-${i}`}
                className="absolute w-3 h-3 bg-gradient-to-br from-emerald-400/10 to-cyan-400/8 rounded-full blur-sm"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${40 + (i % 2) * 20}%`,
                }}
                animate={{
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          
          {/* Enhanced Floating Project-related Keywords - More Frequent */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              { text: "Innovation", color: "from-emerald-400 to-teal-400" },
              { text: "Code", color: "from-cyan-400 to-blue-400" },
              { text: "Deploy", color: "from-blue-400 to-indigo-400" },
              { text: "Create", color: "from-teal-400 to-cyan-400" },
              { text: "Build", color: "from-indigo-400 to-purple-400" },
              { text: "Ship", color: "from-purple-400 to-pink-400" },
              { text: "Design", color: "from-pink-400 to-rose-400" },
              { text: "Develop", color: "from-violet-400 to-purple-400" },
              { text: "Launch", color: "from-green-400 to-emerald-400" },
              { text: "Scale", color: "from-blue-400 to-cyan-400" },
              { text: "Test", color: "from-amber-400 to-yellow-400" },
              { text: "Debug", color: "from-red-400 to-rose-400" },
              { text: "Optimize", color: "from-lime-400 to-green-400" },
              { text: "Release", color: "from-sky-400 to-blue-400" },
              { text: "Maintain", color: "from-slate-400 to-gray-400" }
            ].map((word, index) => (
              <motion.span
                key={`projects-${word.text}`}
                className={`absolute bg-gradient-to-r ${word.color} bg-clip-text text-transparent text-xl font-bold`}
                initial={{
                  x: Math.random() * 100 + 10,
                  y: Math.random() * 100 + 10,
                  opacity: 0,
                }}
                animate={{
                  x: [
                    Math.random() * 400 - 200,
                    Math.random() * 500 - 250,
                    Math.random() * 400 - 200
                  ],
                  y: [
                    Math.random() * 400 - 200,
                    Math.random() * 500 - 250,
                    Math.random() * 400 - 200
                  ],
                  opacity: [0, 0.9, 0],
                  rotate: [0, 360, 720],
                  scale: [0.6, 1.6, 0.6],
                }}
                transition={{
                  duration: 10 + Math.random() * 5,
                  repeat: Infinity,
                  delay: index * 0.7,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${2 + (index % 6) * 16}%`,
                  top: `${5 + Math.floor(index / 6) * 25}%`,
                  textShadow: `0 0 30px rgba(16, 185, 129, 0.4)`
                }}
              >
                {word.text}
              </motion.span>
            ))}
          </div>
          
          {/* Enhanced Project Bubbles - Throughout Section */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={`projects-bubble-${i}`}
                className="absolute rounded-full bg-gradient-to-br from-emerald-400/8 to-cyan-400/5 border border-emerald-400/15"
                style={{
                  width: Math.random() * 90 + 30,
                  height: Math.random() * 90 + 30,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -300 - Math.random() * 150],
                  x: [0, Math.random() * 150 - 75],
                  opacity: [0, 0.8, 0],
                  scale: [0.3, 1.4, 0.1],
                  rotate: [0, 270, 540],
                }}
                transition={{
                  duration: 12 + Math.random() * 6,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8">
            {/* Enhanced Section Separator - Full Width */}
            <div className="flex items-center justify-center mb-6 w-full">
              <motion.div 
                className="flex items-center w-full max-w-4xl"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div 
                  className="flex-1 h-1 bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
                
                <motion.div
                  className="mx-6 px-4 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-medium dark:bg-teal-900 dark:text-teal-200 relative"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <motion.span
                    animate={{ 
                      boxShadow: [
                        "0 0 10px rgba(20, 184, 166, 0.3)",
                        "0 0 20px rgba(20, 184, 166, 0.6)",
                        "0 0 10px rgba(20, 184, 166, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    
                  </motion.span>
                </motion.div>
                
                <motion.div 
                  className="flex-1 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-teal-400 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
                  />
                </motion.div>
              </motion.div>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-title"
            >
              Projects
            </motion.h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="loader"></div>
            </div>
          ) : (
            <>
              {/* Display projects by category if using fallback projects */}
              {true ? (
                // Show categorized projects
                Object.values(projectCategories).map((category, catIndex) => (
                  <div key={catIndex} className="mb-16 last:mb-8">
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100 flex items-center"
                    >
                      <span className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center mr-3 text-white">
                        <category.icon size={16} />
                      </span>
                      <span className="relative">
                        {category.title}
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500 to-transparent"></span>
                      </span>
                    </motion.h3>

                    <motion.div
                      initial="hidden"
                      whileInView="visible"
                      variants={staggerContainer}
                      viewport={{ once: true }}
                      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                      {category.projects.map((project, index) => (
                        <motion.div
                          key={`${project?.title || 'project'}-${index}`}
                          variants={fadeInUp}
                          className="group glass-card p-5 sm:p-6 md:p-8 flex flex-col justify-between shadow-xl border border-teal-400/20 dark:border-teal-400/10 transition-all duration-300 bg-white/90 dark:bg-gray-900/90 cursor-pointer rounded-2xl overflow-hidden"
                          style={{ minHeight: '350px' }}
                          whileHover={{ scale: 1.02, y: -8, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          onClick={() => {
                            if (project?.githubUrl) {
                              window.open(`${project.githubUrl}#readme`, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          {/* Header Section */}
                          <div className="flex-grow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <motion.div
                                  className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg"
                                  animate={{ 
                                    boxShadow: [
                                      "0 0 8px rgba(20, 184, 166, 0.4)",
                                      "0 0 20px rgba(20, 184, 166, 0.6)",
                                      "0 0 8px rgba(20, 184, 166, 0.4)"
                                    ]
                                  }}
                                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                              </div>
                              <motion.div
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                initial={{ rotate: 0 }}
                                whileHover={{ rotate: 12 }}
                              >
                                <category.icon size={18} className="text-teal-500" />
                              </motion.div>
                            </div>
                            
                            {/* Project Title */}
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-teal-500 transition-colors duration-300 leading-tight">
                              {project?.title?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Featured Project'}
                            </h3>
                            
                            {/* Category Badge */}
                            <div className="mb-3">
                              <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-900/50 text-teal-700 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-700/50 shadow-sm">
                                {project.category}
                              </span>
                            </div>
                            
                            {/* Project Description */}
                            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6 line-clamp-3">
                              {project?.description || 'Innovative project showcasing modern development practices and clean architecture'}
                            </p>

                            {/* Technology Tags */}
                            {(project?.language || (project?.stars !== undefined && project?.stars >= 0)) && (
                              <div className="flex flex-wrap gap-2 mb-6">
                                {project?.language && (
                                  <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-700/50 shadow-sm">
                                    {project.language}
                                  </span>
                                )}
                                {project?.stars !== undefined && project?.stars >= 0 && (
                                  <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 text-yellow-700 dark:text-yellow-300 rounded-full border border-yellow-200 dark:border-yellow-700/50 shadow-sm flex items-center">
                                    <Star size={12} className="mr-1" />
                                    {project.stars}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Footer Section */}
                          <div className="flex justify-between items-center pt-6">
                            <div className="flex space-x-3 w-full">
                              {/* GitHub Button */}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (project?.githubUrl) {
                                    window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
                                  }
                                }}
                                className="group relative flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex-1"
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-gray-600/5 dark:from-gray-100/5 dark:to-gray-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Github size={18} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
                                <span className="relative z-10 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">GitHub</span>
                                <div className="absolute inset-0 border border-transparent bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '1px' }}>
                                  <div className="h-full w-full bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl"></div>
                                </div>
                              </motion.button>
                              
                              {/* Live Demo Button */}
                              {project?.hasLivePreview && project?.demoUrl && (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (project?.demoUrl) {
                                      window.open(project.demoUrl, '_blank', 'noopener,noreferrer');
                                    }
                                  }}
                                  className="group relative flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex-1"
                                  whileHover={{ scale: 1.03, y: -2 }}
                                  whileTap={{ scale: 0.97 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                                    initial={{ x: "-100%" }}
                                    whileHover={{ x: "100%" }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                  />
                                  <Globe size={18} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
                                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">Live Demo</span>
                                  <motion.div
                                    className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full"
                                    animate={{ 
                                      scale: [1, 1.2, 1],
                                      opacity: [0.6, 1, 0.6]
                                    }}
                                    transition={{ 
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                    }}
                                  />
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                ))
              ) : (
                // Show GitHub projects in regular grid
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  variants={staggerContainer}
                  viewport={{ once: true }}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {githubProjects.map((project, index) => (
                    <motion.div
                      key={`${project?.title || 'project'}-${index}`}
                      variants={fadeInUp}
                      className="group glass-card p-8 flex flex-col justify-between shadow-xl border border-teal-400/20 dark:border-teal-400/10 transition-all duration-300 bg-white/90 dark:bg-gray-900/90 cursor-pointer rounded-2xl overflow-hidden"
                      style={{ minHeight: '350px' }}
                      whileHover={{ scale: 1.02, y: -8, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      onClick={() => {
                        if (project?.githubUrl) {
                          window.open(`${project.githubUrl}#readme`, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      {/* Header Section */}
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <motion.div
                              className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg"
                              animate={{ 
                                boxShadow: [
                                  "0 0 8px rgba(20, 184, 166, 0.4)",
                                  "0 0 20px rgba(20, 184, 166, 0.6)",
                                  "0 0 8px rgba(20, 184, 166, 0.4)"
                                ]
                              }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                          </div>
                          <motion.div
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={{ rotate: 0 }}
                            whileHover={{ rotate: 12 }}
                          >
                            <FileText size={18} className="text-teal-500" />
                          </motion.div>
                        </div>
                        
                        {/* Project Title */}
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-teal-500 transition-colors duration-300 leading-tight">
                          {project?.title?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Featured Project'}
                        </h3>
                        
                        {/* Project Description */}
                        <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6 line-clamp-3">
                          {project?.description || 'Innovative project showcasing modern development practices and clean architecture'}
                        </p>

                        {/* Technology Tags */}
                        {(project?.language || (project?.stars !== undefined && project?.stars >= 0)) && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {project?.language && (
                              <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-700/50 shadow-sm">
                                {project.language}
                              </span>
                            )}
                            {project?.stars !== undefined && project?.stars >= 0 && (
                              <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 text-yellow-700 dark:text-yellow-300 rounded-full border border-yellow-200 dark:border-yellow-700/50 shadow-sm flex items-center">
                                <Star size={12} className="mr-1" />
                                {project.stars}
                              </span>
                            )}
                            {project?.forks !== undefined && project?.forks >= 0 && (
                              <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-700/50 shadow-sm">
                                🍴 {project.forks}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Footer Section */}
                      <div className="flex justify-between items-center pt-6">
                        <div className="flex space-x-3 w-full">
                          {/* GitHub Button */}
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (project?.githubUrl) {
                                window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
                              }
                            }}
                            className="group relative flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex-1"
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-gray-600/5 dark:from-gray-100/5 dark:to-gray-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Github size={18} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
                            <span className="relative z-10 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">GitHub</span>
                            <div className="absolute inset-0 border border-transparent bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '1px' }}>
                              <div className="h-full w-full bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl"></div>
                            </div>
                          </motion.button>
                          
                          {/* Live Demo Button */}
                          {project?.hasLivePreview && project?.demoUrl && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (project?.demoUrl) {
                                  window.open(project.demoUrl, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              className="group relative flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex-1"
                              whileHover={{ scale: 1.03, y: -2 }}
                              whileTap={{ scale: 0.97 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                              />
                              <Globe size={18} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
                              <span className="relative z-10 group-hover:text-white transition-colors duration-300">Live Demo</span>
                              <motion.div
                                className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full"
                                animate={{ 
                                  scale: [1, 1.2, 1],
                                  opacity: [0.6, 1, 0.6]
                                }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {/* Show "All Repos" button - Links to GitHub */}
              {(githubProjects.length > 0 || projects.length > 6) && (
                <div className="text-center mt-12">
                  <motion.button 
                    onClick={handleLoadAllRepos}
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all flex items-center justify-center mx-auto space-x-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Github size={20} />
                    <span>View All Repositories on GitHub</span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      →
                    </motion.div>
                  </motion.button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                    Click to see all {githubProjects.length > 0 ? 'my' : 'my'} repositories and projects on GitHub
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Research Section */}
      <section id="research" className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-100 to-slate-300 dark:from-slate-700 dark:via-slate-900 dark:to-slate-700 opacity-90"></div>
        
        {/* Enhanced Background Animations for Research Section - More Frequent */}
        <div className="absolute inset-0">
          {/* Minimal Floating Particles */}
          <div className="absolute inset-0">
            {/* Layer 1: Academic particles - Greatly Reduced */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`research-particles-${i}`}
                className="absolute w-1.5 h-1.5 bg-purple-400/12 rounded-full"
                style={{
                  left: `${15 + i * 18}%`,
                  top: `${30 + (i % 3) * 20}%`,
                }}
                animate={{
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
            
            {/* Layer 2: Knowledge bubbles - Reduced to Static Elements */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`research-bubbles-${i}`}
                className="absolute w-2.5 h-2.5 bg-gradient-to-br from-purple-400/9 to-pink-400/7 rounded-full blur-sm"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${50 + (i % 3) * 10}%`,
                }}
                animate={{
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          
          {/* Enhanced Floating Research Keywords - More Frequent */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              { text: "Discovery", color: "from-purple-400 to-indigo-400" },
              { text: "Research", color: "from-violet-400 to-purple-400" },
              { text: "Science", color: "from-purple-400 to-fuchsia-400" },
              { text: "Data", color: "from-cyan-400 to-blue-400" }
            ].map((word, index) => (
              <motion.span
                key={`research-${word.text}`}
                className={`absolute bg-gradient-to-r ${word.color} bg-clip-text text-transparent text-lg font-semibold`}
                initial={{
                  x: Math.random() * 100 + 10,
                  y: Math.random() * 100 + 10,
                  opacity: 0,
                }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: index * 1.2,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${15 + index * 20}%`,
                  top: `${30 + (index % 2) * 25}%`,
                  textShadow: `0 0 15px rgba(147, 51, 234, 0.3)`
                }}
              >
                {word.text}
              </motion.span>
            ))}
          </div>
          
          {/* Simplified Research Academic Bubbles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`research-academic-bubble-${i}`}
                className="absolute rounded-full bg-gradient-to-br from-purple-400/8 to-indigo-400/5 border border-purple-400/15"
                style={{
                  width: 50 + (i % 3) * 20,
                  height: 50 + (i % 3) * 20,
                  left: `${10 + (i % 3) * 30}%`,
                  top: `${20 + Math.floor(i / 3) * 40}%`,
                }}
                animate={{
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8">
            {/* Enhanced Section Separator - Full Width */}
            <div className="flex items-center justify-center mb-6 w-full">
              <motion.div 
                className="flex items-center w-full max-w-4xl"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div 
                  className="flex-1 h-1 bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
                
                <motion.div
                  className="mx-6 px-4 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-medium dark:bg-teal-900 dark:text-teal-200 relative"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <motion.span
                    animate={{ 
                      boxShadow: [
                        "0 0 10px rgba(20, 184, 166, 0.3)",
                        "0 0 20px rgba(20, 184, 166, 0.6)",
                        "0 0 10px rgba(20, 184, 166, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    
                  </motion.span>
                </motion.div>
                
                <motion.div 
                  className="flex-1 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-teal-400 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
                  />
                </motion.div>
              </motion.div>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-title"
            >
              Research Publications
            </motion.h2>
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {/* Card 1: Dermatology */}
            <motion.div
              variants={fadeInUp}
              className="glass-card p-5 sm:p-6 md:p-8 shadow-lg border border-teal-400/20 dark:border-teal-400/10 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 flex flex-col justify-between text-left max-w-xl mx-auto"
              style={{ minHeight: 'auto', height: '100%' }}
              whileHover={{ scale: 1.03, y: -3, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div>
                <div className="flex items-start mb-3">
                  <BookOpen className="mr-2 mt-1 text-teal-400" size={22} />
                  <div>
                    <div className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-teal-400 transition-colors duration-200 leading-snug">
                      Deep Learning in Dermatology: Convolutional Neural Network-Based Classification of Skin Diseases and Cancer
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <Calendar size={15} className="mr-1" /> Published Jan 16, 2025
                      <span className="mx-2">•</span> IEEE Xplore
                    </div>
                  </div>
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-base leading-[1.8] space-y-5 mb-6 mt-3">
                  <p>Our research introduces a custom Convolutional Neural Network (CNN) model for classifying 57 types of skin diseases and cancers, achieving 96.64% accuracy. By leveraging deep learning, our model enhances dermatological diagnosis, surpassing traditional methods in speed and precision.</p>
                  <p>We also compared our model with pre-trained architectures such as VGG16, MobileNet, Inception V3, and Sequential CNN, analyzing their performance on the same dataset. Our CNN demonstrated superior accuracy and efficiency, processing images faster while maintaining high classification precision.</p>
                  <p>This study utilizes data augmentation techniques, TensorFlow ImageDataGenerator, and advanced model tuning to ensure reliability in real-world applications. Our findings contribute to AI-driven medical advancements, improving early detection and treatment in dermatology.</p>
                </div>
                <a
                  href="https://ieeexplore.ieee.org/document/10837323"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-teal-500 hover:underline text-base mt-2 group/link"
                >
                  <Globe size={17} className="mr-1 group-hover/link:text-teal-600" /> View Publication
                </a>
              </div>
            </motion.div>
            {/* Card 2: Brain Tumor */}
            <motion.div
              variants={fadeInUp}
              className="glass-card p-5 sm:p-6 md:p-8 shadow-lg border border-teal-400/20 dark:border-teal-400/10 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 flex flex-col justify-between text-left max-w-xl mx-auto"
              style={{ minHeight: 'auto', height: '100%' }}
              whileHover={{ scale: 1.03, y: -3, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div>
                <div className="flex items-start mb-2">
                  <BookOpen className="mr-2 mt-1 text-teal-400" size={20} />
                  <div className="flex-1">
                    <div className="font-bold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-teal-400 transition-colors duration-200 leading-snug">
                      Deep Learning-Based Brain Tumor Identification Using Custom CNN
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2">Under Publication</span>
                    </div>
                  </div>
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm sm:text-[15px] leading-relaxed space-y-2 sm:space-y-4 mb-4 mt-2">
                  <p>Our research presents a custom Convolutional Neural Network (CNN) model tailored for classifying four types of brain tumors using MRI scans: glioma, meningioma, pituitary tumor, and no tumor. Achieving a testing accuracy of 97.10%, the model leverages deep learning to significantly improve diagnostic accuracy, speed, and consistency in neuroimaging.</p>
                  <p>To validate its performance, we compared our custom model against well-known pre-trained CNN architectures including Xception, ResNet50, EfficientNetB4, DenseNet121, and MobileNetV2. Our custom CNN stood out by offering a strong balance of accuracy and computational efficiency, making it highly suitable for real-time medical applications, even in resource-limited settings.</p>
                  <p>The study employs data augmentation, dilated convolutions, and residual connections, alongside optimized training strategies using TensorFlow. This ensures the model can generalize well, even with limited labeled data — a common constraint in medical imaging.</p>
                  <p>By integrating AI into radiology workflows, our work contributes to earlier tumor detection, faster decision-making, and greater diagnostic reliability, aligning with the growing demand for intelligent healthcare systems.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Education Section (moved after Research) */}
      <section id="education" className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-100 to-slate-300 dark:from-slate-700 dark:via-slate-900 dark:to-slate-700 opacity-90"></div>
        
        {/* Enhanced Background Animations for Education Section - More Frequent */}
        <div className="absolute inset-0">
          {/* Multiple Layers of Floating Particles */}
          <div className="absolute inset-0">
            {/* Layer 1: Academic achievement particles - Reduced for mobile */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`education-particles-${i}`}
                className="absolute w-1.5 h-1.5 bg-amber-400/15 rounded-full"
                initial={{
                  x: Math.random() * 100 + 10,
                  y: Math.random() * 100 + 10,
                }}
                animate={{
                  y: [0, -210 - Math.random() * 90],
                  x: [0, Math.random() * 110 - 55],
                  opacity: [0, 0.8, 0],
                  scale: [1, 1.8, 1],
                }}
                transition={{
                  duration: Math.random() * 6 + 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${(i % 6) * 16}%`,
                  top: `${Math.floor(i / 6) * 23}%`,
                }}
              />
            ))}
            
            {/* Layer 2: Learning bubbles - Increased */}
            {[...Array(18)].map((_, i) => (
              <motion.div
                key={`education-bubbles-${i}`}
                className="absolute w-3 h-3 bg-gradient-to-br from-amber-400/10 to-orange-400/8 rounded-full blur-sm"
                initial={{
                  x: Math.random() * 100 + 10,
                  y: Math.random() * 100 + 10,
                }}
                animate={{
                  y: [0, -180 - Math.random() * 80],
                  x: [0, Math.random() * 100 - 50],
                  opacity: [0, 0.7, 0],
                  scale: [0.4, 1.6, 0.4],
                  rotate: [0, 270],
                }}
                transition={{
                  duration: Math.random() * 8 + 5,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${6 + (i % 5) * 17}%`,
                  top: `${10 + Math.floor(i / 5) * 25}%`,
                }}
              />
            ))}
          </div>
          
          {/* Enhanced Floating Education Keywords - Reduced for Mobile */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              { text: "Learn", color: "from-amber-400 to-orange-400" },
              { text: "Growth", color: "from-orange-400 to-red-400" },
              { text: "Knowledge", color: "from-yellow-400 to-amber-400" },
              { text: "Academic", color: "from-yellow-400 to-orange-400" },
              { text: "Education", color: "from-orange-400 to-yellow-400" }
            ].map((word, index) => (
              <motion.span
                key={`education-${word.text}`}
                className={`absolute bg-gradient-to-r ${word.color} bg-clip-text text-transparent text-base sm:text-lg font-semibold hidden sm:block`}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: index * 1,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${5 + (index % 3) * 30}%`,
                  top: `${15 + Math.floor(index / 3) * 30}%`,
                  textShadow: `0 0 15px rgba(245, 158, 11, 0.3)`
                }}
              >
                {word.text}
              </motion.span>
            ))}
          </div>
          
          {/* Simplified Education Achievement Bubbles for Mobile */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`education-achievement-bubble-${i}`}
                className="absolute rounded-full bg-gradient-to-br from-amber-400/8 to-yellow-400/5 border border-amber-400/15"
                style={{
                  width: 40,
                  height: 40,
                  left: `${10 + (i % 4) * 25}%`,
                  top: `${20 + Math.floor(i / 4) * 30}%`,
                }}
                animate={{
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8">
            {/* Enhanced Section Separator - Full Width */}
            <div className="flex items-center justify-center mb-6 w-full">
              <motion.div 
                className="flex items-center w-full max-w-4xl"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div 
                  className="flex-1 h-1 bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
                
                <motion.div
                  className="mx-6 px-4 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-medium dark:bg-teal-900 dark:text-teal-200 relative"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <motion.span
                    animate={{ 
                      boxShadow: [
                        "0 0 10px rgba(20, 184, 166, 0.3)",
                        "0 0 20px rgba(20, 184, 166, 0.6)",
                        "0 0 10px rgba(20, 184, 166, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    
                  </motion.span>
                </motion.div>
                
                <motion.div 
                  className="flex-1 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-teal-400 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
                  />
                </motion.div>
              </motion.div>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-title"
            >
              Education
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {educationList.map((edu, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-4 sm:p-6 md:p-8 flex flex-col h-full shadow-lg border border-teal-400/20 dark:border-teal-400/10 transition-all duration-300 bg-white/80 dark:bg-gray-900/80"
                whileHover={{ scale: 1.02, y: -3, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {edu.isHighlighted && (
                  <div className="flex items-center mb-3">
                    <Star className="text-teal-500 mr-2" size={20} />
                    <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/50 px-2 py-1 rounded-full">
                      CURRENT PURSUING
                    </span>
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {edu.degree}
                </h3>
                
                <p className="text-teal-600 dark:text-teal-400 font-medium mb-1">{edu.institution}</p>
                <p className="text-gray-500 dark:text-gray-300 mb-2">{edu.period}</p>
                
                {edu.field !== "--" && (
                  <p className="text-gray-700 dark:text-gray-200 mb-3 font-medium">
                    {edu.field}
                  </p>
                )}

                {edu.currentCGPA && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-teal-100 to-purple-100 dark:from-teal-900/30 dark:to-purple-900/30 rounded-lg border border-teal-200 dark:border-teal-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current CGPA</span>
                      <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">{edu.currentCGPA}</span>
                    </div>
                  </div>
                )}
                
                <div className="text-gray-600 dark:text-gray-300 text-sm space-y-1">
                  {edu.details.map((detail, i) => {
                    if (detail.startsWith("•")) {
                      return (
                        <div key={i} className="ml-4 flex items-start">
                          <span className="text-teal-500 mr-2 mt-1">•</span>
                          <span className="font-medium">{detail.substring(2)}</span>
                        </div>
                      );
                    } else if (detail.includes("Semester-wise") || detail.includes("Current Overall")) {
                      return (
                        <p key={i} className="font-semibold text-gray-800 dark:text-gray-200 mt-2">
                          {detail}
                        </p>
                      );
                    } else if (detail.startsWith("Percentage:")) {
                      return (
                        <div key={i} className="p-2 bg-gradient-to-r from-teal-100 to-purple-100 dark:from-teal-900/30 dark:to-purple-900/30 rounded-lg border border-teal-200 dark:border-teal-700">
                          <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{detail}</span>
                        </div>
                      );
                    } else {
                      return <p key={i}>{detail}</p>;
                    }
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section (WhatsApp, Email, Phone as buttons) */}
      <section id="contact" className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-100 to-slate-300 dark:from-slate-700 dark:via-slate-900 dark:to-slate-700 opacity-90"></div>
        
        {/* Enhanced Background Animations for Contact Section - More Frequent */}
        <div className="absolute inset-0">
          {/* Minimal Floating Particles */}
          <div className="absolute inset-0">
            {/* Layer 1: Communication particles - Greatly Reduced */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`contact-particles-${i}`}
                className="absolute w-1.5 h-1.5 bg-pink-400/12 rounded-full"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${30 + (i % 4) * 15}%`,
                }}
                animate={{
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
            
            {/* Layer 2: Minimal Connection bubbles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`contact-bubbles-${i}`}
                className="absolute w-3.5 h-3.5 bg-gradient-to-br from-pink-400/9 to-rose-400/7 rounded-full blur-sm"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${50 + (i % 2) * 20}%`,
                }}
                animate={{
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          
          {/* Reduced Contact Keywords */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              { text: "Connect", color: "from-pink-400 to-rose-400" },
              { text: "Contact", color: "from-purple-400 to-pink-400" },
              { text: "Email", color: "from-violet-400 to-purple-400" },
              { text: "WhatsApp", color: "from-green-400 to-emerald-400" }
            ].map((word, index) => (
              <motion.span
                key={`contact-${word.text}`}
                className={`absolute bg-gradient-to-r ${word.color} bg-clip-text text-transparent text-lg font-semibold`}
                initial={{
                  x: Math.random() * 100 + 10,
                  y: Math.random() * 100 + 10,
                  opacity: 0,
                }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  delay: index * 1,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${15 + index * 20}%`,
                  top: `${5 + Math.floor(index / 6) * 26}%`,
                  textShadow: `0 0 30px rgba(236, 72, 153, 0.4)`
                }}
              >
                {word.text}
              </motion.span>
            ))}
          </div>
          
          {/* Enhanced Contact Communication Bubbles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`contact-comm-bubble-${i}`}
                className="absolute rounded-full bg-gradient-to-br from-pink-400/8 to-rose-400/5 border border-pink-400/15"
                style={{
                  width: 40,
                  height: 40,
                  left: `${10 + i * 15}%`,
                  top: `${30 + (i % 3) * 20}%`,
                }}
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 14 + Math.random() * 6,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8">
            {/* Enhanced Section Separator - Full Width */}
            <div className="flex items-center justify-center mb-6 w-full">
              <motion.div 
                className="flex items-center w-full max-w-4xl"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div 
                  className="flex-1 h-1 bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
                
                <motion.div
                  className="mx-6 px-4 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-medium dark:bg-teal-900 dark:text-teal-200 relative"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <motion.span
                    animate={{ 
                      boxShadow: [
                        "0 0 10px rgba(20, 184, 166, 0.3)",
                        "0 0 20px rgba(20, 184, 166, 0.6)",
                        "0 0 10px rgba(20, 184, 166, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    
                  </motion.span>
                </motion.div>
                
                <motion.div 
                  className="flex-1 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-teal-400 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
                  />
                </motion.div>
              </motion.div>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-title"
            >
              Get In Touch
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl mx-auto"
          >
            <motion.div 
              className="glass-card p-6 sm:p-8 md:p-12 flex flex-col items-center text-center shadow-2xl border border-teal-400/30 dark:border-teal-400/20 transition-all duration-300 bg-white/90 dark:bg-gray-900/90 rounded-2xl"
              whileHover={{ 
                scale: 1.02, 
                y: -8, 
                boxShadow: "0 35px 60px -12px rgba(0, 0, 0, 0.3)",
                borderColor: "rgba(20, 184, 166, 0.4)"
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-6"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white bg-gradient-to-r from-teal-600 to-teal-800 dark:from-teal-400 dark:to-teal-600 bg-clip-text text-transparent">
                  Let's Connect
                </h3>
              </motion.div>
              
              <motion.p 
                className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-10 max-w-lg text-base sm:text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Ready to bring your ideas to life? Whether it's AI/ML projects, web development, or research collaboration, 
                I'm here to help. Let's discuss how we can work together!
              </motion.p>
              
              <motion.div 
                className="flex flex-row flex-wrap justify-center gap-4 sm:gap-6 w-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <motion.a
                  href="https://wa.me/919528114494?text=Hello%20Mirza%20Yoosha%2C%20I%20found%20your%20portfolio%20impressive%20and%20would%20like%20to%20discuss%20potential%20opportunities."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/80 dark:to-green-800/80 text-green-700 dark:text-green-300 transition-all duration-300 flex flex-col items-center justify-center shadow-lg border border-green-200 dark:border-green-700 min-w-[100px] sm:min-w-[120px]"
                  title="WhatsApp"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -2,
                    boxShadow: "0 15px 30px -5px rgba(34, 197, 94, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 14.487c-.263-.131-1.558-.77-1.799-.858-.241-.088-.417-.131-.593.132-.175.263-.676.858-.828 1.033-.151.175-.304.197-.567.066-.263-.132-1.111-.409-2.117-1.304-.782-.696-1.31-1.556-1.464-1.819-.151-.263-.016-.405.115-.536.118-.117.263-.304.395-.456.132-.151.175-.263.263-.438.088-.175.044-.329-.022-.46-.066-.132-.593-1.433-.813-1.963-.214-.514-.432-.444-.593-.452l-.504-.009c-.175 0-.46.066-.701.329-.241.263-.92.899-.92 2.192 0 1.293.942 2.544 1.073 2.719.132.175 1.853 2.83 4.49 3.852.628.271 1.117.433 1.499.554.63.2 1.204.172 1.658.104.506-.075 1.558-.637 1.779-1.253.221-.616.221-1.143.154-1.253-.066-.11-.241-.175-.504-.307z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0-4.97-4.03-9-9-9s-9 4.03-9 9c0 1.591.416 3.085 1.14 4.374L3 21l4.755-1.247A8.963 8.963 0 0012 21c4.97 0 9-4.03 9-9z" />
                    </svg>
                  </motion.div>
                  <span className="text-xs sm:text-sm font-semibold group-hover:text-green-800 dark:group-hover:text-green-200 transition-colors">WhatsApp</span>
                </motion.a>

                <motion.a
                  href="mailto:yoosha786@gmail.com?subject=Project%20Inquiry&body=Hello%20Mirza%20Yoosha%2C%0A%0AI%20found%20your%20portfolio%20impressive%20and%20would%20like%20to%20discuss%20a%20potential%20project.%0A%0ABest%20regards"
                  className="group p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/80 dark:to-teal-800/80 text-teal-700 dark:text-teal-300 transition-all duration-300 flex flex-col items-center justify-center shadow-lg border border-teal-200 dark:border-teal-700 min-w-[100px] sm:min-w-[120px]"
                  title="Email"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -2,
                    boxShadow: "0 15px 30px -5px rgba(20, 184, 166, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    whileHover={{ rotate: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Mail className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2" />
                  </motion.div>
                  <span className="text-xs sm:text-sm font-semibold group-hover:text-teal-800 dark:group-hover:text-teal-200 transition-colors">Email</span>
                </motion.a>

                <motion.a
                  href="tel:+919528114494"
                  className="group p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/80 dark:to-gray-700/80 text-gray-700 dark:text-gray-300 transition-all duration-300 flex flex-col items-center justify-center shadow-lg border border-gray-200 dark:border-gray-600 min-w-[100px] sm:min-w-[120px]"
                  title="Phone"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -2,
                    boxShadow: "0 15px 30px -5px rgba(107, 114, 128, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 002.25-2.25v-2.25a2.25 2.25 0 00-2.25-2.25h-2.25a.75.75 0 01-.75-.75v-2.25a.75.75 0 01.75-.75h2.25a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018.75 4.5h-1.5c-8.284 0-15 6.716-15 15z" />
                    </svg>
                  </motion.div>
                  <span className="text-xs sm:text-sm font-semibold group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">Call</span>
                </motion.a>
              </motion.div>

              <motion.div
                className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 w-full"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Available for freelance projects • Response within 24 hours
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="https://github.com/yooshamirza"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-teal-500 transition-colors duration-200"
                  >
                    <Github size={20} />
                  </a>
                  <a
                    href="https://linkedin.com/in/mirza-yoosha-minhaj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-teal-500 transition-colors duration-200"
                  >
                    <Linkedin size={20} />
                  </a>
                  <a
                    href="https://youtube.com/@yooshamirza"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-teal-500 transition-colors duration-200"
                  >
                    <Youtube size={20} />
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced 3D Voice Chatbot Widget - Opens in New Tab */}
      {/* Revolutionary AI Chatbot - Bottom Right Position */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
        {/* Attention-Grabbing Header with Instant Notification + Delayed Animations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, type: "spring", stiffness: 300 }}
          className="mb-4 text-center relative"
        >
          {/* Instant Notification Background */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4, type: "spring", stiffness: 400 }}
            className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-cyan-500/30 rounded-2xl blur-xl"
          />
          
          {/* Notification Popup Style */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1, duration: 0.5, type: "spring", stiffness: 300 }}
            className="relative bg-white/15 dark:bg-gray-900/25 backdrop-blur-lg rounded-2xl px-4 py-3 border-2 border-white/30 shadow-xl"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(147,51,234,0.1) 50%, rgba(59,130,246,0.1) 100%)"
            }}
          >
            {/* Instant Text Appearance */}
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, duration: 0.3 }}
              className="text-sm font-black tracking-wide uppercase text-white relative z-10 mb-1"
              style={{
                textShadow: "0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(147,51,234,0.6)"
              }}
            >
              🤖 CLICK TO CHAT NOW!
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.3 }}
              className="text-xs text-cyan-200 font-semibold"
            >
              💬 Opens Voice + Text AI Chatbot
            </motion.p>

            {/* Notification Bell Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.3, type: "spring", stiffness: 500 }}
              className="absolute -top-2 -right-2"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  scale: { delay: 2.5, duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white"
              >
                🔔
              </motion.div>
            </motion.div>

            {/* Static Period - Then Start Animations */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4, duration: 0.5 }}
              className="absolute inset-0"
            >
              {/* Simplified pulsing background */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  delay: 4.5,
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl"
              />
            </motion.div>
          </motion.div>
          
          {/* Simplified Text Animations */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5 }}
            className="absolute inset-0"
          >
            <motion.p
              animate={{ 
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
              className="text-sm font-black tracking-wide uppercase absolute top-3 left-4 right-4 z-20 text-center pointer-events-none text-white"
              style={{
                textShadow: "0 0 15px rgba(147, 51, 234, 0.6)"
              }}
            >
              🤖 CLICK TO CHAT NOW!
            </motion.p>
          </motion.div>
          
          {/* Simplified Spark Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 6, type: "spring", stiffness: 300 }}
            className="absolute -bottom-2 -left-2"
          >
            <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
              ✨
            </div>
          </motion.div>
        </motion.div>

        <motion.button
          onClick={() => {
            // Open chatbot in a dedicated popup window with optimal settings
            const chatbotWindow = window.open(
              'https://chatbot-murex-eta-24.vercel.app/',
              'chatbot',
              'width=1200,height=800,left=' + (screen.width/2 - 600) + ',top=' + (screen.height/2 - 400) + ',scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no'
            );
            if (chatbotWindow) {
              chatbotWindow.focus();
            } else {
              // Fallback: open in new tab if popup blocked
              window.open('https://chatbot-murex-eta-24.vercel.app/', '_blank', 'noopener,noreferrer');
            }
          }}
          whileHover={{ 
            scale: 1.1, 
            y: -5
          }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 20px 60px rgba(147, 51, 234, 0.6), 0 0 100px rgba(147, 51, 234, 0.3)",
              "0 25px 80px rgba(59, 130, 246, 0.7), 0 0 120px rgba(59, 130, 246, 0.4)",
              "0 30px 100px rgba(6, 182, 212, 0.6), 0 0 140px rgba(6, 182, 212, 0.3)",
              "0 20px 60px rgba(147, 51, 234, 0.6), 0 0 100px rgba(147, 51, 234, 0.3)"
            ],
            filter: [
              "brightness(1.1) saturate(1.2) contrast(1.1)",
              "brightness(1.3) saturate(1.4) contrast(1.2)",
              "brightness(1.2) saturate(1.3) contrast(1.15)",
              "brightness(1.1) saturate(1.2) contrast(1.1)"
            ],
            y: [0, -3, 0]
          }}
          transition={{
            boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            filter: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative w-24 h-24 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden group cursor-pointer"
          style={{ 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 30%, #06b6d4 60%, #10b981 90%)'
          }}
        >
          {/* Enhanced Holographic Background */}
          <motion.div
            animate={{ 
              opacity: [0.4, 0.6, 0.4],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute inset-0 opacity-40"
            style={{ 
              background: 'conic-gradient(from 0deg, rgba(139, 92, 246, 0.6), rgba(59, 130, 246, 0.6), rgba(6, 182, 212, 0.6), rgba(16, 185, 129, 0.6), rgba(139, 92, 246, 0.6))'
            }}
          />
          
          {/* Prismatic Glass Effect */}
          <motion.div
            animate={{
              background: [
                "radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)",
                "radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.5) 0%, transparent 60%)",
                "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)",
                "radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)"
              ]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 backdrop-blur-sm"
          />
          
          {/* Spectacular Particle System */}
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                animate={{
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
                style={{
                  width: 2,
                  height: 2,
                  background: `linear-gradient(45deg, 
                    ${i % 3 === 0 ? 'rgba(139, 92, 246, 0.8)' : 
                      i % 3 === 1 ? 'rgba(59, 130, 246, 0.8)' : 
                      'rgba(6, 182, 212, 0.8)'})`,
                  left: `${45 + i * 2}%`,
                  top: `${45 + i * 2}%`,
                }}
              />
            ))}
          </div>

          {/* Revolutionary Chatbot Icon Cluster - Simplified */}
          <motion.div
            animate={{ 
              scale: [0.95, 1, 0.95]
            }}
            transition={{ 
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative z-20"
          >
            {/* Main Robot Head - Dominant and Appealing */}
            <motion.div
              animate={{ 
                y: [0, -5, 0],
                scale: [1, 1.1, 1],
                filter: [
                  "drop-shadow(0 0 15px rgba(255, 255, 255, 1)) drop-shadow(0 0 25px rgba(139, 92, 246, 0.8))",
                  "drop-shadow(0 0 20px rgba(255, 255, 255, 1.2)) drop-shadow(0 0 35px rgba(59, 130, 246, 1))",
                  "drop-shadow(0 0 15px rgba(255, 255, 255, 1)) drop-shadow(0 0 25px rgba(139, 92, 246, 0.8))"
                ]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="relative"
            >
              {/* Chatbot Robot Head Design with Better Visibility */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                {/* Robot Head Shape - Enhanced Visibility */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-7 h-6 bg-white rounded-lg shadow-lg relative border-2 border-blue-200"
                  style={{
                    background: "linear-gradient(145deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%)",
                    boxShadow: "inset 0 2px 4px rgba(59, 130, 246, 0.2), 0 4px 8px rgba(0,0,0,0.1)"
                  }}
                >
                  {/* Robot Eyes - More Prominent */}
                  <motion.div
                    animate={{
                      scaleY: [1, 0.1, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="absolute top-1 left-1 flex space-x-1"
                  >
                    <div className="w-1.5 h-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full border border-blue-300">
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-full h-full bg-white/80 rounded-full border border-blue-400"
                      />
                    </div>
                    <div className="w-1.5 h-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full border border-blue-300">
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.2
                        }}
                        className="w-full h-full bg-white/80 rounded-full border border-blue-400"
                      />
                    </div>
                  </motion.div>
                  
                  {/* Robot Mouth - Speaking Animation */}
                  <motion.div
                    animate={{
                      width: ["6px", "10px", "6px"],
                      height: ["1px", "2px", "1px"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-gray-700 rounded-full border border-gray-500"
                  />
                  
                  {/* Robot Antenna */}
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.8
                    }}
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="w-0.5 h-1.5 bg-gradient-to-t from-gray-400 to-blue-300 rounded-full border border-blue-200" />
                    <motion.div
                      animate={{
                        scale: [1, 1.6, 1],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border border-yellow-300"
                      style={{
                        boxShadow: "0 0 6px rgba(251, 191, 36, 0.8)"
                      }}
                    />
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Pulsing Aura Around Robot */}
              <motion.div
                animate={{
                  scale: [1, 1.6, 1],
                  opacity: [0.3, 0.9, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/30 via-blue-400/30 to-cyan-400/30 blur-md -z-10"
              />
            </motion.div>
            
            {/* Voice Microphone - More Prominent */}
            <motion.div
              animate={{ 
                scale: [0.8, 1.2, 0.8],
                opacity: [0.7, 1, 0.7],
                x: [0, 4, 0],
                y: [0, -4, 0],
                filter: [
                  "drop-shadow(0 0 8px rgba(34, 197, 94, 0.8))",
                  "drop-shadow(0 0 15px rgba(34, 197, 94, 1.2))",
                  "drop-shadow(0 0 8px rgba(34, 197, 94, 0.8))"
                ]
              }}
              transition={{ 
                duration: 1.8, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1.2
              }}
              className="absolute top-1 right-1"
            >
              <Mic size={14} className="text-green-300 drop-shadow-lg" />
              
              {/* Voice Wave Effect */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 0, 0.4],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute inset-0 rounded-full border-2 border-green-400/60"
              />
            </motion.div>
            
            {/* RAG Database - Enhanced */}
            <motion.div
              animate={{ 
                scale: [0.8, 1.1, 0.8],
                opacity: [0.8, 1, 0.8],
                x: [0, 4, 0]
              }}
              transition={{ 
                duration: 2.2, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.4
              }}
              className="absolute -bottom-1 -right-1"
            >
              <Database size={16} className="text-cyan-200 drop-shadow-lg" />
              
              {/* Data Flow Effect */}
              <motion.div
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute inset-0 rounded-sm bg-cyan-400/40 blur-sm"
              />
            </motion.div>
            
            {/* Neural Network Layers - Enhanced */}
            <motion.div
              animate={{ 
                scale: [0.7, 1, 0.7],
                opacity: [0.7, 1, 0.7],
                x: [0, -4, 0]
              }}
              transition={{ 
                duration: 2.6, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.8
              }}
              className="absolute -top-1 -left-1"
            >
              <Layers size={14} className="text-purple-200 drop-shadow-lg" />
              
              {/* Layer Connection Effect */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3
                }}
              />
            </motion.div>
          </motion.div>

          {/* Spectacular Pulse Rings System */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 2.5 + i * 0.3, 1],
                opacity: [0.8 - i * 0.1, 0, 0.8 - i * 0.1]
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4
              }}
              className={`absolute inset-0 rounded-3xl border-2 ${
                i === 0 ? 'border-white/60' :
                i === 1 ? 'border-purple-400/50' :
                i === 2 ? 'border-blue-400/40' : 'border-cyan-400/30'
              }`}
            />
          ))}

          {/* Hover Tooltip - Enhanced Appeal */}
          <motion.div
            initial={{ 
              opacity: 0, 
              x: -20, 
              scale: 0.8
            }}
            whileHover={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4)"
            }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25 
            }}
            className="absolute right-full mr-6 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-gray-800/98 via-gray-900/98 to-black/98 backdrop-blur-xl text-white px-6 py-4 rounded-3xl whitespace-nowrap pointer-events-none border-2 border-purple-500/60 shadow-2xl overflow-hidden"
          >
            {/* Animated Background */}
            <motion.div
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))",
                  "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))",
                  "linear-gradient(45deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.1))"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0"
            />
            
            <div className="flex items-center gap-4 relative z-10">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                <Brain size={22} className="text-purple-400" />
              </motion.div>
              <div>
                <div className="font-black text-base bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  🚀 CLICK TO OPEN AI CHATBOT
                </div>
                <div className="text-sm text-gray-300 font-bold mt-1">
                  💬 Voice + Text • 🧠 Powered by AI • 🎤 Speech Recognition
                </div>
                <div className="text-xs text-cyan-300 font-semibold mt-1 animate-pulse">
                  ✨ Opens in Dedicated Window!
                </div>
              </div>
            </div>
            
            {/* Arrow Pointer - Now pointing right */}
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-r-0 border-l-12 border-t-8 border-b-8 border-transparent border-l-gray-800/98"></div>
            
            {/* Sparkle Effects - Simplified */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0, 0.7, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 1,
                  ease: "easeInOut"
                }}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                style={{
                  left: `${25 + i * 25}%`,
                  top: `${30 + i * 20}%`,
                }}
              />
            ))}
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}

export default App;

