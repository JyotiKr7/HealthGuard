import React, { useState, useRef, useEffect } from "react";
import { Bot, User, Send, Sparkles, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";
import { HealthMetrics, RiskAnalysis } from "../types";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface HealthAssistantProps {
  metrics: HealthMetrics;
  risks: RiskAnalysis[];
}

export default function HealthAssistant({ metrics, risks }: HealthAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Authorized Clinical Sync finished. I have read your real-time smartwatch stream. Ask me to explain high-resolution anomalies, model attribution metrics, or direct preventive exercise regimens. How can I assist you today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Recommended prompt trigger options for easy testing
  const suggestions = [
    "Explain my cardiovascular risk reduction path.",
    "Why does my elevated stress level drop my HRV measurements?",
    "Give customized low-sodium exercise habits."
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", text: textToSend }];
    setMessages(newMessages);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: newMessages.slice(0, -1) // Excluding the last message to avoid duplicating on server
        })
      });
      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: "model", text: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: "model", text: "[Error] AI engine failed to stream clinical interpretations. Check server configuration." }]);
      }
    } catch (err) {
      console.error("AI Assistant connection error", err);
      setMessages(prev => [...prev, { role: "model", text: "[Sandbox Falls] Cloud servers did not respond. Local heuristic recommendation: Maintain daily fitness hours and keep hydration targets high (>2500ml) to ensure robust blood dynamic parameters." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between h-[520px]" id="health-assistant-chat">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-indigo-950 border border-indigo-800 rounded-lg text-indigo-400">
            <Bot className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <h3 className="text-white text-xs font-semibold uppercase tracking-wider font-sans">Server-Side Clinical Assistant</h3>
            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping inline-block"></span> Vitals-Aware Context Enabled
            </span>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3 text-xs leading-relaxed ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role !== "user" && (
              <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-850 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
              </span>
            )}
            <div className={`p-3 max-w-[85%] rounded-xl font-sans ${
              m.role === "user" 
                ? "bg-emerald-600 text-white rounded-tr-none" 
                : "bg-slate-900 border border-slate-850 text-slate-200 rounded-tl-none whitespace-pre-wrap"
            }`}>
              {m.role === "model" && idx === 0 && (
                <span className="text-[10px] bg-indigo-950 border border-indigo-900/60 text-indigo-300 font-mono px-1.5 py-0.5 rounded mr-1.5 align-middle uppercase tracking-widest leading-none">
                  AI Context
                </span>
              )}
              {m.text}
            </div>
            {m.role === "user" && (
              <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 text-xs justify-start">
            <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center shrink-0">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            </span>
            <div className="p-3 bg-slate-900/40 rounded-xl rounded-tl-none text-slate-400 font-mono italic animate-pulse">
              HealthGuard AI compiling medical knowledge graph...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested clinical click chips */}
      {messages.length === 1 && !loading && (
        <div className="border-t border-slate-900 pt-3 pb-2">
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <HelpCircle className="w-3" /> Quick Diagnostic Prompts
          </p>
          <div className="flex flex-col gap-1.5">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(s)}
                className="text-[10px] text-left text-slate-300 font-sans p-2 bg-slate-905 border border-slate-850 rounded hover:border-slate-700 transition cursor-pointer flex gap-1.5 hover:bg-slate-900/40"
              >
                <Sparkles className="w-3 shrink-0 text-amber-500 mt-0.5" /> {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input controls form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(inputMessage);
        }}
        className="flex gap-2 border-t border-slate-900 pt-3 shrink-0"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask HealthGuard AI (e.g., 'What are the warnings of hypoxia?')"
          className="flex-1 bg-slate-900 text-xs text-white placeholder-slate-500 border border-slate-800 rounded-lg p-2.5 focus:border-indigo-650 font-sans"
        />
        <button
          type="submit"
          className="bg-indigo-650 hover:bg-indigo-700 text-white p-2.5 rounded-lg transition text-xs font-mono font-bold flex items-center justify-center shrink-0 w-10 h-10 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
