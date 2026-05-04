import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Send, User, ArrowLeft, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface ChatSession {
  sessionId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

interface ChatMsg {
  id: number;
  sessionId: string;
  senderType: 'visitor' | 'admin';
  visitorName: string | null;
  message: string;
  createdAt: string;
}

function timeAgo(date: string | Date): string {
  const d = new Date(date).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminChat() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: sessionsData, isLoading } = useQuery<{ sessions: ChatSession[] }>({
    queryKey: ['/api/admin/chat/sessions'],
    refetchInterval: 8000,
  });

  const sessions = sessionsData?.sessions || [];
  const totalUnread = sessions.reduce((s, c) => s + c.unread, 0);

  const fetchMsgs = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/admin/chat/messages/${sid}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMsgs(data.messages || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchMsgs(selectedSession);
      pollRef.current = setInterval(() => fetchMsgs(selectedSession), 4000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedSession, fetchMsgs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const replyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/admin/chat/reply', {
        sessionId: selectedSession,
        message: reply.trim(),
      });
    },
    onSuccess: () => {
      setReply('');
      if (selectedSession) fetchMsgs(selectedSession);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chat/sessions'] });
    },
    onError: () => {},
  });

  const sendReply = () => {
    if (!reply.trim() || replyMutation.isPending) return;
    replyMutation.mutate();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  const activeSession = sessions.find(s => s.sessionId === selectedSession);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h2 className="text-3xl font-heading font-bold">Live Chat</h2>
            <p className="text-muted-foreground">
              {totalUnread > 0 ? `${totalUnread} unread message${totalUnread !== 1 ? 's' : ''}` : 'Manage visitor conversations'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/chat/sessions'] })}
            data-testid="button-refresh-chats"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '500px' }}>
          {/* Sessions list */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {sessions.map(s => (
                    <li key={s.sessionId}>
                      <button
                        onClick={() => setSelectedSession(s.sessionId)}
                        className={`w-full text-left px-4 py-3 hover-elevate transition-colors ${
                          selectedSession === s.sessionId ? 'bg-muted' : ''
                        }`}
                        data-testid={`chat-session-${s.sessionId}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">
                            {s.visitorName || 'Anonymous'}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            {s.unread > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {s.unread}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{timeAgo(s.lastAt)}</span>
                          </div>
                        </div>
                        {s.visitorEmail && (
                          <p className="text-xs text-muted-foreground truncate">{s.visitorEmail}</p>
                        )}
                        <p className="text-xs text-muted-foreground truncate mt-1">{s.lastMessage}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Chat area */}
          <Card className="lg:col-span-2 flex flex-col">
            {!selectedSession ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 border-b flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="lg:invisible"
                    onClick={() => setSelectedSession(null)}
                    data-testid="button-back-sessions"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div>
                    <p className="font-semibold text-sm">{activeSession?.visitorName || 'Anonymous'}</p>
                    {activeSession?.visitorEmail && (
                      <p className="text-xs text-muted-foreground">{activeSession.visitorEmail}</p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="admin-chat-messages">
                  {msgs.map((msg, idx) => {
                    const isAdminMsg = msg.senderType === 'admin';
                    const showDate = idx === 0 || formatDate(msgs[idx - 1].createdAt) !== formatDate(msg.createdAt);
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <p className="text-center text-xs text-muted-foreground my-2">{formatDate(msg.createdAt)}</p>
                        )}
                        <div className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] rounded-lg px-3 py-2 ${
                              isAdminMsg
                                ? 'text-white'
                                : 'bg-muted text-foreground'
                            }`}
                            style={isAdminMsg ? { backgroundColor: '#c0392b' } : undefined}
                          >
                            {!isAdminMsg && (
                              <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                                <User className="w-3 h-3" /> {msg.visitorName || 'Visitor'}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            <p className={`text-[10px] mt-1 ${isAdminMsg ? 'text-white/60' : 'text-muted-foreground'}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Reply */}
                {replyMutation.isError && (
                  <div className="px-4 py-1">
                    <p className="text-xs text-destructive">Failed to send reply. Please try again.</p>
                  </div>
                )}
                <div className="border-t p-3 flex items-end gap-2">
                  <Textarea
                    value={reply}
                    onChange={(e) => { setReply(e.target.value); replyMutation.reset(); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your reply..."
                    className="resize-none text-sm min-h-[40px] max-h-[100px]"
                    rows={1}
                    data-testid="input-admin-reply"
                  />
                  <Button
                    size="icon"
                    onClick={sendReply}
                    disabled={!reply.trim() || replyMutation.isPending}
                    data-testid="button-send-reply"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
