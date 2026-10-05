import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

const GREETING =
  "Ask me about coaches, class times, plans, or opening hours. I can also hold a session with a coach for you.";

const QUICK = [
  'Who are the coaches?',
  'What classes are on this week?',
  'How much is the Forge plan?',
  'Book me with a coach on Friday',
];

const WELCOME = {
  role: 'assistant',
  content: GREETING,
  actions: [
    { label: 'Show me the coaches', payload: { kind: 'coaches' } },
    { label: 'Class times', payload: { kind: 'classes' } },
    { label: 'Plans & prices', payload: { kind: 'plans' } },
  ],
};

const SUGGESTED_BY_INTENT = {
  coaches: 'Who are the coaches?',
  classes: 'What classes are on this week?',
  plans: 'How much is the Forge plan?',
  hours: 'What are your opening hours?',
  book_prompt: 'Book me with a coach on Friday',
  join: 'I want to join',
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const identify = () => {
    try {
      const raw = localStorage.getItem('pf_user');
      if (!raw) return {};
      const u = JSON.parse(raw);
      return { email: u.email, name: u.firstName };
    } catch {
      return {};
    }
  };

  const send = async (text) => {
    const trimmed = (text ?? message).trim();
    if (!trimmed || loading) return;

    setMessage('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, ...identify() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: data?.message || 'Something broke on my side. Try again in a moment.',
          error: true,
        }]);
        return;
      }

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.reply,
        actions: data.actions || [],
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'I cannot reach the club system right now. Check your connection and try again.',
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const runAction = (action) => {
    const { kind, to } = action.payload || {};
    if (kind === 'navigate' && to) {
      window.location.assign(to);
      return;
    }
    const prompt = SUGGESTED_BY_INTENT[action.payload?.kind];
    if (prompt) send(prompt);
    else send(action.label);
  };

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      if (!next) setUnread(0);
      return next;
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="chat-fab"
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        aria-expanded={open}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unread > 0 && <span className="chat-fab-dot">{unread}</span>}
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Club assistant">
          <div className="chat-head">
            <div className="chat-head-text">
              <h3>Club Assistant</h3>
              <p>Live answers from the PulseForge system</p>
            </div>
            <button type="button" className="chat-close" onClick={toggle} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="chat-log" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className="chat-msg-row">
                <div className={`chat-bubble ${m.role === 'user' ? 'me' : 'bot'}${m.error ? ' err' : ''}`}>
                  {m.content}
                </div>
                {m.actions?.length > 0 && (
                  <div className="chat-actions">
                    {m.actions.map((a, j) => (
                      <button key={j} type="button" onClick={() => runAction(a)}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-msg-row">
                <div className="chat-bubble bot chat-typing">
                  <Loader2 size={14} className="chat-spin" /> checking the floor
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="chat-actions chat-actions-initial">
                {QUICK.map((q) => (
                  <button key={q} type="button" onClick={() => send(q)}>{q}</button>
                ))}
              </div>
            )}
          </div>

          <form
            className="chat-input"
            onSubmit={(e) => { e.preventDefault(); send(); }}
          >
            <input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about coaches, classes, plans..."
              aria-label="Message"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !message.trim()} aria-label="Send">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}