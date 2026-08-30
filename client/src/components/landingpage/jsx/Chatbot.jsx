import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaTimes, FaPaperPlane, FaMinus, FaRobot } from 'react-icons/fa';
import { FiMessageCircle } from 'react-icons/fi';
import '../css/Chatbot.css';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! Welcome to FurniHaven. How can I help you find the perfect furniture today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Track the end of client-bot messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        text: data.reply || "I'm not sure how to respond. Please contact us directly at info@furnihaven.co.ke or +254727713219.",
        sender: 'bot'
      }]);
    } catch {
      setMessages(prev => [...prev, {
        text: "Sorry, I'm having trouble connecting. Please try again later or reach us on WhatsApp at +254727713219.",
        sender: 'bot'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => e.key === 'Enter' && handleSend();
  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);
  const toggleMinimize = useCallback(() => setIsMinimized(prev => !prev), []);

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button className="chatbot-toggle" onClick={toggleChat} aria-label="Open chat">
          <FiMessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`chatbot-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <FaRobot size={18} />
              <span>FurniHaven Assistant</span>
            </div>
            <div className="chatbot-header-actions">
              <button onClick={toggleMinimize} className="chatbot-minimize-btn" aria-label="Minimize">
                <FaMinus size={14} />
              </button>
              <button onClick={toggleChat} className="chatbot-close-btn" aria-label="Close">
                <FaTimes size={15} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="chatbot-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`chatbot-message ${msg.sender}`}>
                    {msg.sender === 'bot' && (
                      <div className="chatbot-avatar">
                        <FaRobot size={14} />
                      </div>
                    )}
                    <div className="chatbot-bubble">{msg.text}</div>
                  </div>
                ))}
                {loading && (
                  <div className="chatbot-message bot">
                    <div className="chatbot-avatar"><FaRobot size={14} /></div>
                    <div className="chatbot-bubble typing">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="chatbot-input">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about furniture, pricing, delivery..."
                  disabled={loading}
                />
                <button onClick={handleSend} disabled={loading || !input.trim()} aria-label="Send">
                  <FaPaperPlane size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Chatbot;