import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ChatMsg {
  id: number;
  sessionId: string;
  senderType: 'visitor' | 'admin';
  visitorName: string | null;
  visitorEmail: string | null;
  message: string;
  createdAt: string;
}

function getSessionId(): string {
  let id = localStorage.getItem('autopro_chat_session');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('autopro_chat_session', id);
  }
  return id;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [text, setText] = useState('');
  const [name, setName] = useState(() => localStorage.getItem('autopro_chat_name') || '');
  const [email, setEmail] = useState(() => localStorage.getItem('autopro_chat_email') || '');
  const [started, setStarted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getSessionId());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/messages/${sessionId.current}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {}
  }, []);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/unread/${sessionId.current}`);
      if (res.ok) {
        const data = await res.json();
        setUnread(data.unread || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchMessages().then(() => {
      setStarted(prev => prev);
    });
    fetchUnread();
  }, [fetchMessages, fetchUnread]);

  useEffect(() => {
    if (messages.length > 0 && !started) {
      setStarted(true);
    }
  }, [messages, started]);

  useEffect(() => {
    if (open) {
      fetchMessages();
      setUnread(0);
      pollRef.current = setInterval(fetchMessages, 4000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, fetchMessages]);

  useEffect(() => {
    if (!open) {
      const interval = setInterval(fetchUnread, 10000);
      return () => clearInterval(interval);
    }
  }, [open, fetchUnread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const startChat = () => {
    if (name.trim()) {
      localStorage.setItem('autopro_chat_name', name.trim());
      if (email.trim()) localStorage.setItem('autopro_chat_email', email.trim());
      setStarted(true);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    setSendError(false);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId.current,
          message: text.trim(),
          visitorName: name.trim() || undefined,
          visitorEmail: email.trim() || undefined,
        }),
      });
      if (res.ok) {
        setText('');
        await fetchMessages();
      } else {
        setSendError(true);
      }
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        data-testid="button-live-chat"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#c0392b' }}
        aria-label="Live Chat"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-7 h-7 text-white" />
            {unread > 0 && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#f59e0b' }}
                data-testid="badge-chat-unread"
              >
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50">
          <Card className="w-[340px] sm:w-[380px] flex flex-col overflow-hidden shadow-xl" style={{ height: '480px' }}>
            <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: '#c0392b' }}>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">AutoPro Support</p>
                <p className="text-white/70 text-xs">Live Chat</p>
              </div>
            </div>

            {!started ? (
              <div className="flex-1 flex flex-col justify-center p-6 gap-4">
                <div className="text-center mb-2">
                  <h3 className="font-semibold text-lg">Start a conversation</h3>
                  <p className="text-muted-foreground text-sm mt-1">Enter your name to begin chatting with our team.</p>
                </div>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-chat-name"
                  onKeyDown={(e) => e.key === 'Enter' && startChat()}
                />
                <Input
                  placeholder="Email (optional)"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-chat-email"
                  onKeyDown={(e) => e.key === 'Enter' && startChat()}
                />
                <Button
                  onClick={startChat}
                  disabled={!name.trim()}
                  data-testid="button-start-chat"
                  className="w-full"
                >
                  Start Chat
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="chat-messages-area">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm mt-8">
                      <p>Send us a message and we'll reply as soon as possible.</p>
                    </div>
                  )}
                  {messages.map((msg) => {
                    const isAdmin = msg.senderType === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                        data-testid={`chat-message-${msg.id}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            isAdmin
                              ? 'bg-muted text-foreground'
                              : 'text-white'
                          }`}
                          style={!isAdmin ? { backgroundColor: '#c0392b' } : undefined}
                        >
                          {isAdmin && (
                            <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                              <User className="w-3 h-3" /> AutoPro
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          <p className={`text-[10px] mt-1 ${isAdmin ? 'text-muted-foreground' : 'text-white/60'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {sendError && (
                  <div className="px-4 py-1">
                    <p className="text-xs text-destructive">Failed to send. Please try again.</p>
                  </div>
                )}
                <div className="border-t p-3 flex items-end gap-2">
                  <Textarea
                    value={text}
                    onChange={(e) => { setText(e.target.value); setSendError(false); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="resize-none text-sm min-h-[40px] max-h-[100px]"
                    rows={1}
                    data-testid="input-chat-message"
                  />
                  <Button
                    size="icon"
                    onClick={sendMessage}
                    disabled={!text.trim() || sending}
                    data-testid="button-send-chat"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
