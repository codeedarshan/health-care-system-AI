import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Languages, AlertCircle, Bot, User, CornerDownLeft } from "lucide-react";
import { ChatMessage } from "../types";

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  loading: boolean;
}

export default function ChatView({ messages, onSendMessage, loading }: ChatViewProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterQuestions = [
    { text: "What are some safe home remedies for dry cough?", lang: "EN" },
    { text: "स्वस्थ और फिट रहने के लिए सोने का सही समय क्या है?", lang: "HI" },
    { text: "Suggest some high-fiber foods for better digestion.", lang: "EN" },
    { text: "गैस और अपच (Indigestion) के लिए तुरंत आराम के उपाय बताएं।", lang: "HI" }
  ];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;

    const textToSend = inputText;
    setInputText("");
    await onSendMessage(textToSend);
  };

  const handleStarterClick = async (questionText: string) => {
    if (loading) return;
    await onSendMessage(questionText);
  };

  // Helper to parse markdown bold/italic tags cleanly without leaving raw asterisks
  const parseInlineFormatting = (textStr: string) => {
    // Regex to split on **bold**, *italic*, __bold__, _italic_
    const tokens = textStr.split(/(\*\*.*?\*\*|\*.*?\*|__.*?__|_[^_]+_)/g);

    return tokens.map((token, index) => {
      if ((token.startsWith("**") && token.endsWith("**")) || (token.startsWith("__") && token.endsWith("__"))) {
        const cleanText = token.slice(2, -2);
        return <strong key={index} className="font-bold text-slate-900">{cleanText}</strong>;
      }
      if ((token.startsWith("*") && token.endsWith("*")) || (token.startsWith("_") && token.endsWith("_"))) {
        const cleanText = token.slice(1, -1);
        return <span key={index} className="italic text-slate-800 font-semibold">{cleanText}</span>;
      }
      return token;
    });
  };

  // Render AI responses with clear point-based structure and no raw asterisks
  const renderFormattedMessage = (messageText: string) => {
    if (!messageText) return null;

    const lines = messageText.split("\n");

    return (
      <div className="space-y-2 text-xs md:text-sm leading-relaxed font-medium">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Bullet point match
          const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
          if (bulletMatch) {
            const content = bulletMatch[1];
            return (
              <div key={idx} className="flex items-start space-x-2.5 my-1.5 pl-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] mt-2 shrink-0" />
                <div className="flex-1 text-slate-700 leading-snug">
                  {parseInlineFormatting(content)}
                </div>
              </div>
            );
          }

          // Numbered list match (e.g., 1. or 1))
          const numberMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
          if (numberMatch) {
            const num = numberMatch[1];
            const content = numberMatch[2];
            return (
              <div key={idx} className="flex items-start space-x-2.5 my-1.5 pl-0.5">
                <span className="inline-flex items-center justify-center bg-red-100 text-[#DC2626] font-bold text-[10px] min-w-[20px] h-5 px-1 rounded-md shrink-0 mt-0.5">
                  {num}
                </span>
                <div className="flex-1 text-slate-700 leading-snug">
                  {parseInlineFormatting(content)}
                </div>
              </div>
            );
          }

          // Regular text line
          return (
            <p key={idx} className="text-slate-700">
              {parseInlineFormatting(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  // Scroll to bottom whenever messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[600px] overflow-hidden" id="chat-container">
      {/* Top bar */}
      <div className="bg-[#FAFAFA] text-[#000000] border-b border-slate-200 p-4 flex items-center justify-between" id="chat-header">
        <div className="flex items-center space-x-3">
          <div className="bg-red-50 p-2 rounded-lg text-[#DC2626]">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-sm md:text-base font-sans text-slate-800">AuraHealth AI Companion</h2>
              <span className="bg-red-50 border border-red-100 text-[9px] text-[#DC2626] uppercase px-1.5 py-0.5 rounded-full font-bold">Bilingual</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold">Empathetic English & Hindi Wellness Helper</p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-xs bg-white text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
          <Languages size={12} className="text-slate-400" />
          <span className="font-semibold">English / हिंदी / Hinglish</span>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-orange-50 border-b border-orange-100 p-3 flex items-start space-x-2 text-xs text-orange-900" id="chat-safety-banner">
        <AlertCircle size={15} className="mt-0.5 shrink-0 text-orange-600" />
        <p className="leading-relaxed font-medium">
          <strong>Important Safety Note:</strong> AuraHealth AI provides general health tips and natural wellness care guides. We are not a medical service; if you feel extremely unwell, please visit a doctor.
        </p>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" id="chat-messages-scroll">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
            <div className="bg-red-50 p-4 rounded-full text-[#DC2626]">
              <Sparkles size={36} className="animate-spin-slow" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 font-sans">Ask AuraHealth AI</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Start typing your health questions, request nutritional plans, or ask for simple Ayurvedic home remedies. I speak both English and Hindi!
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full pt-2">
              {starterQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStarterClick(q.text)}
                  className="text-left text-xs bg-white hover:bg-red-50 hover:border-red-200 border border-slate-200 p-3 rounded-xl shadow-2xs font-bold text-slate-700 transition-all flex items-center justify-between"
                  id={`starter-q-${idx}`}
                >
                  <span>{q.text}</span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1 rounded uppercase shrink-0 ml-2">{q.lang}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3.5 ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className={`p-2 rounded-full shrink-0 ${msg.sender === "user" ? "bg-[#DC2626] text-white shadow-sm" : "bg-slate-200 text-slate-600"}`}>
                  {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-xs leading-relaxed text-sm ${
                  msg.sender === "user"
                    ? "bg-[#DC2626] text-white rounded-tr-none shadow-md font-medium"
                    : "bg-white text-slate-700 border border-slate-200 rounded-tl-none font-medium"
                }`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1" id={`msg-sender-label-${msg.id}`}>
                    {msg.sender === "user" ? "You" : "AuraHealth AI"}
                  </p>
                  <div>
                    {msg.sender === "user" ? msg.text : renderFormattedMessage(msg.text)}
                  </div>
                  <p className="text-[10px] opacity-50 mt-1 text-right">{msg.timestamp}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start space-x-3.5">
                <div className="p-2 rounded-full bg-slate-200 text-slate-600 shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-xs max-w-sm">
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full animate-bounce delay-200"></span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">AuraHealth is thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="border-t border-slate-200 p-4 bg-slate-50 flex items-center space-x-2" id="chat-input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          placeholder="Ask anything about health, diet, remedies... (e.g., सिरदर्द दूर करने के उपाय)"
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#DC2626] transition-all disabled:opacity-50"
          id="chat-input-field"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="bg-[#DC2626] hover:bg-[#B91C1C] text-white p-3.5 rounded-xl transition-all disabled:opacity-50 disabled:bg-slate-200 flex items-center justify-center shadow-md shrink-0"
          id="chat-submit-btn"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
