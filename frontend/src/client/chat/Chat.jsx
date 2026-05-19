import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import api from '../utils/api.js';
import { io } from 'socket.io-client';
import {
  Search,
  Send,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Image as ImageIcon,
  FileText,
  Download,
  Check,
  CheckCheck,
  CornerUpLeft,
  Edit2,
  Trash2,
  Phone,
  Video,
  Info,
  ChevronDown,
  Pin,
  X,
  Play,
  Pause,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';

const THEME = {
  light: {
    bg: 'bg-[#F5EBE0]',
    card: 'bg-[#E3D5CA]/50 border-[#D6CCC2]/40',
    cardInner: 'bg-[#F5EBE0]/80 border-[#D6CCC2]/20',
    text: 'text-[#2B2B2B]',
    textMuted: 'text-[#4A4340]',
    accent: 'bg-[#C9B7A7]/50 text-[#2B2B2B]',
    border: 'border-[#D6CCC2]/30',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    inputBg: 'bg-white border-[#D6CCC2]/60 text-[#2B2B2B]',
    bubbleSender: 'bg-[#1E1A17] text-[#F5EBE0]',
    bubbleRecipient: 'bg-[#E3D5CA]/60 text-[#2B2B2B] border-[#D6CCC2]/30'
  },
  dark: {
    bg: 'bg-[#1E1A17]',
    card: 'bg-[#2A241F]/60 border-[#3A312B]',
    cardInner: 'bg-[#1E1A17]/80 border-[#3A312B]',
    text: 'text-[#F5EBE0]',
    textMuted: 'text-[#E3D5CA]/70',
    accent: 'bg-[#3A312B] text-[#F5EBE0]',
    border: 'border-[#3A312B]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
    inputBg: 'bg-[#1E1A17] border-[#3A312B] text-[#F5EBE0]',
    bubbleSender: 'bg-[#F5EBE0] text-[#1E1A17]',
    bubbleRecipient: 'bg-[#2A241F]/80 text-[#F5EBE0] border-[#3A312B]'
  }
};

const EMOJI_REACTIONS = ['❤️', '😂', '👍', '🔥', '😍', '👏'];

export default function Chat() {
  const { isNight } = useThemeStore();
  const theme = isNight ? THEME.dark : THEME.light;

  // Realtime States
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Interactive Panel States
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(null); // stores message ID or 'input'
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Audio / Voice Note States
  const [isRecording, setIsRecording] = useState(false);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [playingDuration, setPlayingDuration] = useState(0);

  // References
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recordTimerRef = useRef(null);
  const typingTimerRef = useRef(null);

  // 1. Initial Load - fetch User & Conversations
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        // Load current profile
        const userRes = await api.get('/auth/me');
        setCurrentUser(userRes.data.data);

        // Load conversations
        const convRes = await api.get('/chat/conversations');
        setConversations(convRes.data.data);

        // Auto select first conversation on mount
        if (convRes.data.data.length > 0) {
          setActiveConversation(convRes.data.data[0]);
        }
      } catch (err) {
        console.error('Failed to init dynamic luxury chat:', err);
      } finally {
        setLoading(false);
      }
    };
    initializeChat();
  }, []);

  // 2. Load Messages when Active Conversation changes + Bind Sockets
  useEffect(() => {
    if (!activeConversation || !currentUser) return;

    const fetchMessageHistory = async () => {
      try {
        setLoadingMessages(true);
        const res = await api.get(`/chat/${activeConversation._id}/messages`);
        setMessages(res.data.data);
        scrollToBottom();

        // 3. Setup socket channel join
        const token = localStorage.getItem('token');
        if (token) {
          const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
          const socket = io(socketUrl, { auth: { token } });
          socketRef.current = socket;

          socket.on('connect', () => {
            socket.emit('join:room', activeConversation._id);
          });

          // Live message incoming
          socket.on('receive-message', ({ message, conversation }) => {
            if (message.conversationId === activeConversation._id) {
              setMessages((prev) => {
                // Prevent duplicate dispatches
                if (prev.some((m) => m._id === message._id)) return prev;
                return [...prev, message];
              });
              scrollToBottom();
            }

            // Sync recent lists
            setConversations((prevList) => {
              const updated = prevList.map((c) =>
                c._id === conversation._id ? conversation : c
              );
              return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            });
          });

          // Live seen indicators
          socket.on('message-seen', ({ conversationId, seenBy, messageIds }) => {
            if (conversationId === activeConversation._id) {
              setMessages((prev) =>
                prev.map((m) =>
                  messageIds.includes(m._id)
                    ? { ...m, seenBy: [...m.seenBy, seenBy], status: 'seen' }
                    : m
                )
              );
            }
          });

          // Live typing alerts
          socket.on('typing:start', ({ userId }) => {
            if (userId !== currentUser._id) {
              setOtherUserTyping(true);
            }
          });

          socket.on('typing:stop', ({ userId }) => {
            if (userId !== currentUser._id) {
              setOtherUserTyping(false);
            }
          });

          // Live edits
          socket.on('message-edit', ({ messageId, text }) => {
            setMessages((prev) =>
              prev.map((m) => (m._id === messageId ? { ...m, text, edited: true } : m))
            );
          });

          // Live delete for everyone
          socket.on('message-delete', ({ messageId }) => {
            setMessages((prev) =>
              prev.map((m) =>
                m._id === messageId
                  ? { ...m, text: 'This message was deleted', deletedForEveryone: true, attachments: [] }
                  : m
              )
            );
          });

          // Live reactions
          socket.on('reaction-added', ({ messageId, reactions }) => {
            setMessages((prev) =>
              prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
            );
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessageHistory();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      setOtherUserTyping(false);
    };
  }, [activeConversation, currentUser]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Typing status triggers
  const handleTyping = () => {
    if (!socketRef.current || !activeConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('typing:start', { roomId: activeConversation._id });
    }

    // Debounce stop typing trigger
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      socketRef.current.emit('typing:stop', { roomId: activeConversation._id });
    }, 2000);
  };

  // 4. Send Message Handler
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    const currentMsgText = messageText;
    setMessageText('');
    setReplyToMessage(null);

    // Optimistic UI update
    const tempId = Math.random().toString();
    const optimisticMsg = {
      _id: tempId,
      conversationId: activeConversation._id,
      senderId: currentUser._id,
      text: currentMsgText,
      status: 'sending',
      seenBy: [currentUser._id],
      createdAt: new Date().toISOString(),
      replyTo: replyToMessage ? replyToMessage : null
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const res = await api.post('/chat/send', {
        conversationId: activeConversation._id,
        text: currentMsgText,
        replyTo: replyToMessage?._id || null
      });

      // Update optimistic message with actual DB details
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? res.data.data : m))
      );
    } catch (err) {
      console.error(err);
      // Mark as failed
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, status: 'failed' } : m))
      );
    }
  };

  // 5. Send Audio voice note
  const startRecordingAudio = () => {
    setIsRecording(true);
    setRecordedDuration(0);
    recordTimerRef.current = setInterval(() => {
      setRecordedDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopRecordingAudio = async () => {
    setIsRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);

    if (recordedDuration < 1) return;

    // Simulate luxury audio record uploading
    try {
      const audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      const uploadRes = await api.post('/chat/upload', {
        type: 'audio',
        url: audioUrl,
        name: `VoiceNote-${Date.now()}.mp3`
      });

      const res = await api.post('/chat/send', {
        conversationId: activeConversation._id,
        attachments: [{
          ...uploadRes.data.data,
          duration: recordedDuration
        }]
      });

      setMessages((prev) => [...prev, res.data.data]);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Message
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingMessage || !editingText.trim()) return;

    const targetId = editingMessage._id;
    const newText = editingText;
    setEditingMessage(null);
    setEditingText('');

    try {
      await api.patch(`/chat/message/${targetId}/edit`, { text: newText });
      setMessages((prev) =>
        prev.map((m) => (m._id === targetId ? { ...m, text: newText, edited: true } : m))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Reactions
  const handleReact = async (messageId, emoji) => {
    setShowEmojiPicker(null);
    try {
      const res = await api.post(`/chat/message/${messageId}/react`, { emoji });
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions: res.data.data.reactions } : m))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Delete For Everyone
  const handleDeleteEveryone = async (messageId) => {
    try {
      await api.delete(`/chat/message/${messageId}/delete-for-everyone`);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, text: 'This message was deleted', deletedForEveryone: true, attachments: [] }
            : m
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Delete For Me
  const handleDeleteMe = async (messageId) => {
    try {
      await api.delete(`/chat/message/${messageId}/delete-for-me`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      console.error(err);
    }
  };

  // Helper formatting durations
  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const other = c.participants.find((p) => p._id !== currentUser?._id);
    return other?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter messages
  const filteredMessages = messages.filter((m) =>
    m.text?.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  const getRecipientProfile = (c) => {
    if (!c || !currentUser) return null;
    return c.participants.find((p) => p._id !== currentUser._id);
  };

  const recipient = getRecipientProfile(activeConversation);

  return (
    <div className={`w-full h-[82vh] rounded-3xl border ${theme.card} ${theme.shadow} flex overflow-hidden backdrop-blur-md relative`}>
      
      {/* 1. SIDEBAR: Recent Conversational list */}
      <div className={`w-full lg:w-80 h-full border-r ${theme.border} flex flex-col shrink-0 ${activeConversation ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Search header bar */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 space-y-3">
          <h2 className={`text-base font-extrabold uppercase tracking-widest ${theme.text}`}>Collaborators</h2>
          
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${theme.inputBg}`}>
            <Search className="w-4 h-4 opacity-55" />
            <input
              type="text"
              placeholder="Search collaborator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-transparent outline-none border-none"
            />
          </div>
        </div>

        {/* Conversational list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className={`w-6 h-6 animate-spin ${theme.textMuted}`} /></div>
          ) : filteredConversations.length === 0 ? (
            <div className={`text-center py-12 text-xs ${theme.textMuted}`}>No active collaborations found.</div>
          ) : (
            filteredConversations.map((c) => {
              const other = getRecipientProfile(c);
              const isSelected = activeConversation?._id === c._id;
              const unread = c.unreadCounts?.[currentUser?._id] || 0;

              return (
                <div
                  key={c._id}
                  onClick={() => setActiveConversation(c)}
                  className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] ${
                    isSelected ? theme.accent : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-[#C9B7A7]/40 bg-linear-to-tr from-[#D6CCC2] to-[#817773] flex items-center justify-center font-bold text-white text-sm">
                        {other?.profileImage ? (
                          <img src={other.profileImage} alt={other.fullName} className="w-full h-full object-cover" />
                        ) : (
                          other?.fullName[0]
                        )}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-600 rounded-full border-2 border-white dark:border-[#1E1A17]" />
                    </div>

                    <div className="min-w-0">
                      <h4 className={`text-xs font-black truncate ${theme.text}`}>{other?.fullName}</h4>
                      <p className={`text-[9px] uppercase tracking-wide font-bold opacity-60`}>{other?.role}</p>
                      <p className={`text-[10px] truncate ${theme.textMuted} mt-0.5`}>
                        {c.lastMessage?.deletedForEveryone 
                          ? 'This message was deleted' 
                          : c.lastMessage?.text 
                          ? c.lastMessage.text
                          : c.lastMessage?.attachments?.length > 0 
                          ? `Sent ${c.lastMessage.attachments[0].type}`
                          : 'Seeded layout design references'}
                      </p>
                    </div>
                  </div>

                  {/* Badges metrics */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[8px] opacity-60">
                      {c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    {unread > 0 && (
                      <span className="w-4 h-4 rounded-full bg-amber-700 dark:bg-amber-600 text-white font-extrabold text-[8px] flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. MAIN CHAT WINDOW */}
      {activeConversation ? (
        <div className="flex-1 h-full flex flex-col min-w-0 bg-transparent">
          
          {/* Header Panel */}
          <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between gap-4 shrink-0 bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setActiveConversation(null)} className="lg:hidden p-1 rounded hover:bg-black/5">
                <CornerUpLeft className="w-5 h-5" />
              </button>

              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#C9B7A7]/40 bg-linear-to-tr from-[#D6CCC2] to-[#817773] flex items-center justify-center font-bold text-white text-sm">
                  {recipient?.profileImage ? (
                    <img src={recipient.profileImage} alt={recipient.fullName} className="w-full h-full object-cover" />
                  ) : (
                    recipient?.fullName[0]
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-600 rounded-full border-2 border-white dark:border-[#1E1A17]" />
              </div>

              <div className="min-w-0">
                <h3 className={`text-xs font-black ${theme.text}`}>{recipient?.fullName}</h3>
                <span className="text-[9px] uppercase tracking-widest font-extrabold text-emerald-600 dark:text-emerald-500 animate-pulse">
                  {otherUserTyping ? 'Typing layout update...' : 'Online now'}
                </span>
              </div>
            </div>

            {/* Quick Actions Search triggers */}
            <div className="flex items-center gap-3">
              <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg border ${theme.border} text-xs`}>
                <Search className="w-3.5 h-3.5 opacity-55" />
                <input
                  type="text"
                  placeholder="Filter messages..."
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  className="bg-transparent outline-none border-none text-[10px]"
                />
              </div>

              <button className={`p-2 rounded-xl border ${theme.border} hover:scale-105 transition-all`}>
                <Phone className="w-4 h-4 opacity-75" />
              </button>
              <button className={`p-2 rounded-xl border ${theme.border} hover:scale-105 transition-all`}>
                <Video className="w-4 h-4 opacity-75" />
              </button>
            </div>
          </div>

          {/* Messages list Grid */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0 bg-black/5 dark:bg-white/5">
            {loadingMessages ? (
              <div className="w-full h-full flex items-center justify-center"><Loader2 className={`w-8 h-8 animate-spin ${theme.textMuted}`} /></div>
            ) : filteredMessages.length === 0 ? (
              <div className={`text-center py-20 text-xs ${theme.textMuted}`}>No matching collaboration dispatches found.</div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = msg.senderId === currentUser?._id;
                const statusIcons = {
                  sending: <Clock className="w-3 h-3 text-stone-400" />,
                  sent: <Check className="w-3.5 h-3.5 text-stone-400" />,
                  delivered: <CheckCheck className="w-3.5 h-3.5 text-stone-400" />,
                  seen: <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                };

                const quoteReply = msg.replyTo ? messages.find((m) => m._id === msg.replyTo) : null;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg._id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} relative group`}
                  >
                    
                    {/* Reactions Floating drawer panel */}
                    <div className="absolute top-0 right-2 z-25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-full shadow-lg p-1 border">
                      {EMOJI_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReact(msg._id, emoji)}
                          className="hover:scale-120 active:scale-95 transition-all text-xs"
                        >
                          {emoji}
                        </button>
                      ))}
                      <button onClick={() => setReplyToMessage(msg)} className="p-1 rounded text-stone-400 hover:text-stone-900" title="Reply">
                        <CornerUpLeft className="w-3 h-3" />
                      </button>
                      {isMe && !msg.deletedForEveryone && (
                        <>
                          <button onClick={() => { setEditingMessage(msg); setEditingText(msg.text); }} className="p-1 rounded text-stone-400 hover:text-stone-900" title="Edit">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteEveryone(msg._id)} className="p-1 rounded text-red-400 hover:text-red-600" title="Delete Everyone">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDeleteMe(msg._id)} className="p-1 rounded text-stone-400 hover:text-stone-900" title="Delete For Me">
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Chat Bubble card container */}
                    <div className={`p-4 rounded-3xl max-w-[80%] border ${
                      isMe ? theme.bubbleSender : theme.bubbleRecipient
                    }`}>
                      
                      {/* Quoted Message layout preview */}
                      {quoteReply && (
                        <div className="mb-2 p-2 rounded-xl bg-black/10 border-l-4 border-amber-600 text-[10px] opacity-80 max-w-full truncate">
                          <span className="font-bold block">Quoted Dispatch</span>
                          <span>{quoteReply.text}</span>
                        </div>
                      )}

                      {/* Text */}
                      {msg.deletedForEveryone ? (
                        <span className="text-xs italic opacity-60 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          This message was deleted
                        </span>
                      ) : (
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      )}

                      {/* Attachments rendering */}
                      {msg.attachments?.map((att, idx) => (
                        <div key={idx} className="mt-3">
                          {att.type === 'image' ? (
                            <div
                              onClick={() => setSelectedImage(att.url)}
                              className="aspect-video w-full rounded-2xl overflow-hidden cursor-zoom-in border border-black/5 dark:border-white/5 relative group/img"
                            >
                              <img src={att.url} alt="Reference Attachment" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform" />
                            </div>
                          ) : att.type === 'audio' ? (
                            <div className="p-3 rounded-2xl bg-black/10 flex items-center gap-3">
                              <button
                                onClick={() =>
                                  playingAudioId === msg._id ? setPlayingAudioId(null) : setPlayingAudioId(msg._id)
                                }
                                className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center shrink-0"
                              >
                                {playingAudioId === msg._id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </button>
                              <div className="flex-1">
                                <div className="h-1 bg-stone-300 rounded-full w-full overflow-hidden relative">
                                  {playingAudioId === msg._id && (
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: '100%' }}
                                      transition={{ duration: att.duration, ease: 'linear' }}
                                      className="h-full bg-amber-700 absolute left-0"
                                    />
                                  )}
                                </div>
                                <span className="text-[8px] opacity-70 mt-1 block">Voice note • {att.duration}s</span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-2xl bg-black/10 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-5 h-5 shrink-0" />
                                <span className="text-xs truncate font-bold">{att.name}</span>
                              </div>
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl bg-white/20 hover:scale-105 transition-all text-xs"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* reactions display */}
                      {msg.reactions?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {msg.reactions.map((r, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded-full bg-black/10 border text-[10px] cursor-pointer" title={`Reacted`}>
                              {r.emoji}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Timestamp panel & ticks */}
                      <div className="flex items-center justify-end gap-1.5 mt-2 text-[8px] opacity-60">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.edited && <span className="uppercase tracking-wide font-black">(Edited)</span>}
                        {isMe && statusIcons[msg.status]}
                      </div>

                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Inline Edit form */}
          {editingMessage && (
            <form onSubmit={handleEditSubmit} className="p-3 border-t border-black/5 dark:border-white/5 flex gap-2 items-center bg-black/5">
              <span className="text-xs font-bold text-amber-700 shrink-0">Edit message:</span>
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className={`flex-1 text-xs p-2 rounded-xl border outline-none ${theme.inputBg}`}
              />
              <button type="submit" className="px-4 py-2 bg-amber-700 text-white rounded-xl text-xs">Save</button>
              <button type="button" onClick={() => setEditingMessage(null)} className="px-3 py-2 bg-stone-300 text-black rounded-xl text-xs">Cancel</button>
            </form>
          )}

          {/* Quoted Message Reply preview bar */}
          {replyToMessage && (
            <div className="p-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-3 bg-black/5 text-xs">
              <div className="flex items-center gap-2 truncate">
                <CornerUpLeft className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="truncate opacity-75">Replying to: <b>{replyToMessage.text || 'Layout attachments'}</b></span>
              </div>
              <button onClick={() => setReplyToMessage(null)} className="p-1 rounded hover:bg-stone-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bottom input board */}
          <div className="p-4 border-t border-black/5 dark:border-white/5 flex items-center gap-3 bg-black/5 dark:bg-white/5">
            <button className={`p-2.5 rounded-xl border ${theme.border} hover:scale-105 active:scale-95 transition-all`}>
              <Paperclip className="w-4 h-4 opacity-75" />
            </button>
            
            <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Discuss custom layout designs..."
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  handleTyping();
                }}
                className={`flex-1 text-xs p-3 rounded-2xl border outline-none ${theme.inputBg}`}
              />
              
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecordingAudio}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Stop {formatTime(recordedDuration)}
                </button>
              ) : messageText.trim() ? (
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-2xl font-bold uppercase tracking-wider transition-all text-xs flex items-center gap-1.5 ${
                    isNight ? 'bg-[#F5EBE0] text-[#1E1A17] hover:bg-white' : 'bg-[#1E1A17] text-[#F5EBE0] hover:bg-black'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecordingAudio}
                  className={`p-2.5 rounded-xl border ${theme.border} hover:scale-105 active:scale-95 transition-all`}
                >
                  <Mic className="w-4 h-4 opacity-75" />
                </button>
              )}
            </form>
          </div>

        </div>
      ) : (
        <div className="flex-1 h-full flex flex-col items-center justify-center text-center p-8 bg-black/5 dark:bg-white/5">
          <Loader2 className={`w-8 h-8 opacity-25 animate-spin ${theme.text}`} />
          <h3 className={`text-base font-bold ${theme.text} mt-4`}>Premium Collaboration Desk</h3>
          <p className={`text-xs ${theme.textMuted} mt-1 max-w-sm`}>
            Select an active design task or consultant from the sidebar to initialize real-time dispatches.
          </p>
        </div>
      )}

      {/* Lightbox photo viewer overlay */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={selectedImage}
              alt="Design Reference zoom"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
