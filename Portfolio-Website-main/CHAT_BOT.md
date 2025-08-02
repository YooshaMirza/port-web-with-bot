# Chat Bot - AI Assistant Implementation Guide

## Overview

Chat Bot is a personalized AI chatbot implemented in this portfolio website to showcase my skills in AI/ML and provide an interactive way for visitors to learn about me. This document outlines the implementation approach and structure.

## Implementation Architecture

```
┌─────────────────────────┐     ┌──────────────────────┐
│                         │     │                      │
│   Frontend Chat UI      │────▶│   API Connector      │
│ (React + Framer Motion) │     │                      │
│                         │◀────│                      │
└─────────────────────────┘     └──────────┬───────────┘
                                           │
                                           ▼
                               ┌──────────────────────────┐
                               │                          │
                               │     Gemini API with      │
                               │   Personal Knowledge     │
                               │         Base             │
                               │                          │
                               └──────────────────────────┘
```

## Components Structure

### 1. ChatBubble
The individual message bubbles in the chat, styled differently for user vs bot responses.

### 2. ChatWindow
The main container that holds all messages and input field.

### 3. ChatBot
The parent component that manages state and API calls.

## Knowledge Base

The chatbot's knowledge base includes:
- Professional background and skills
- Education and experience details
- Project descriptions and technologies
- Research publications and findings
- Personal interests and goals

## Technical Implementation

### State Management
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState('');
const [isTyping, setIsTyping] = useState(false);
const [isOpen, setIsOpen] = useState(false);
```

### API Integration
```typescript
const sendMessage = async (message: string) => {
  // Add user message to chat
  setMessages(prev => [...prev, { sender: 'user', text: message }]);
  
  // Show typing indicator
  setIsTyping(true);
  
  try {
    // Send request to Gemini API with context
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        history: messages.slice(-6) // Last 3 exchanges for context
      })
    });
    
    const data = await response.json();
    
    // Add bot response with typing effect
    setIsTyping(false);
    setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
  } catch (error) {
    console.error('Error communicating with chatbot:', error);
    setIsTyping(false);
    setMessages(prev => [...prev, { 
      sender: 'bot', 
      text: "I'm having trouble connecting right now. Please try again later." 
    }]);
  }
};
```

### Animation Logic
```typescript
const chatVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.8 }
};

const bubbleVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};
```

## Styling Approach

The Chad Bot follows the portfolio's design system with:
- Matching color scheme using teal primary color
- Glass-card styling consistent with other components
- Dark mode compatibility
- Responsive design that works on all devices

## Deployment Considerations

- Backend function deployed as serverless function
- Rate limiting to prevent abuse
- Error handling and fallback responses
- Smooth typing animation to enhance UX

---

This implementation showcases both technical AI implementation skills and frontend development capabilities in a practical, interactive format.
