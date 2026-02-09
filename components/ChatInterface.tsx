
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Terminal, Sparkles, ChevronDown, ChevronUp, Maximize2, Minimize2, ExternalLink, MapPin } from 'lucide-react';
import { AgentType, Message } from '../types';
import { AGENTS } from '../constants';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  activeAgent: AgentType;
  isTyping: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const AgentDisplayAvatar = ({ type, userAvatar, showMinimize = false }: { type: AgentType | 'USER', userAvatar?: string, showMinimize?: boolean }) => {
  if (type === 'USER') {
    return (
      <div className="w-full h-full rounded-xl overflow-hidden border border-blue-500/50 bg-blue-500/10 flex items-center justify-center">
        {userAvatar ? (
          <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
        ) : (
          <User className="w-4 h-4 text-blue-400" />
        )}
      </div>
    );
  }

  const agent = AGENTS[type];
  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 bg-slate-900 flex items-center justify-center shadow-inner relative group">
      <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
      {showMinimize && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
           <Minimize2 size={16} className="text-white" />
        </div>
      )}
    </div>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, activeAgent, isTyping, isCollapsed, onToggleCollapse }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !isCollapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isCollapsed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  // Fixed AgentType.CITY to AgentType.CITY_CORE as AgentType.CITY does not exist
  const currentAgentData = AGENTS[activeAgent] || AGENTS[AgentType.CITY_CORE];

  if (isCollapsed) {
    return (
      <button 
        onClick={onToggleCollapse}
        className="w-full h-full flex items-center justify-center hover:bg-white/5 transition-all p-1 group relative"
      >
        <div className="w-full h-full relative">
          <AgentDisplayAvatar type={activeAgent} />
          <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-all">
             <Maximize2 size={20} className="text-white animate-pulse" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0f172a]/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleCollapse}
            className="w-12 h-12 relative group hover:scale-105 transition-all active:scale-95"
          >
            <AgentDisplayAvatar type={activeAgent} showMinimize={true} />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[#020617] animate-pulse ${currentAgentData.color}`} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-widest uppercase text-white/90">{currentAgentData.name}</h3>
              <Sparkles size={12} className="text-blue-400 animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">{currentAgentData.role}</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-gradient-to-b from-transparent to-blue-500/5">
        {messages.map((m) => {
          const senderData = m.sender !== 'USER' ? AGENTS[m.sender] : null;
          const groundingMetadata = m.metadata?.grounding || [];
          
          return (
            <div key={m.id} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.sender === 'USER' ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 flex-shrink-0 mt-1">
                <AgentDisplayAvatar type={m.sender} />
              </div>
              <div className={`flex flex-col gap-1.5 max-w-[85%] ${m.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    {m.sender === 'USER' ? 'Authorized User' : senderData?.name}
                  </span>
                </div>
                <div className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm
                  ${m.sender === 'USER' 
                    ? 'bg-blue-600/20 text-blue-50 border border-blue-500/20 rounded-tr-none' 
                    : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'}`}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  
                  {/* Google Maps Grounding Links */}
                  {groundingMetadata.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                      {groundingMetadata.map((chunk: any, i: number) => {
                        const link = chunk.maps?.uri || chunk.web?.uri;
                        const title = chunk.maps?.title || chunk.web?.title;
                        if (!link) return null;
                        return (
                          <a 
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-[10px] text-blue-400 font-mono transition-all"
                          >
                            <MapPin size={10} />
                            <span className="truncate max-w-[150px]">{title}</span>
                            <ExternalLink size={10} className="opacity-50" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-mono text-white/20 px-1">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-10 h-10 flex-shrink-0 animate-pulse">
              <AgentDisplayAvatar type={activeAgent} />
            </div>
            <div className="flex flex-col gap-1.5">
               <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">
                 {currentAgentData.name} processing grounding...
               </span>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 rounded-tl-none">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 border-t border-white/10 bg-black/20">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Instruct @${activeAgent.toLowerCase()}...`}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 pr-16 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm placeholder:text-white/20 text-white shadow-inner"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 disabled:hover:bg-blue-600 rounded-xl transition-all text-white shadow-lg active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
