import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const sampleUsers: Record<string, { id: string; name: string; initials: string; bio?: string }> = {
  u1: { id: 'u1', name: 'John Doe', initials: 'J', bio: 'Interested in full-stack development' },
  u2: { id: 'u2', name: 'Priya Verma', initials: 'P', bio: 'Competitive programmer & mentor' },
  u3: { id: 'u3', name: 'Amit Sharma', initials: 'A', bio: 'Data Science enthusiast' },
};

const commonEmojis = [
  '😀', '😂', '😍', '🥰', '😘', '😭', '😡', '🤔',
  '😎', '🤩', '🥳', '😴', '😤', '🤬', '😱', '🥺',
  '👍', '👎', '👏', '🙌', '💪', '🤝', '✋', '👋',
  '❤️', '💯', '🔥', '⭐', '✅', '❌', '💡', '🎉',
];

type Message = {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
  files?: Array<{ name: string; size: string }>;
  scheduledSession?: { date: string; time: string };
};

export default function ChatView() {
  const { id } = useParams();
  const user = id ? sampleUsers[id] : null;
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', fromMe: false, text: 'Hey, are you free tomorrow?', time: '10:12 AM' },
    { id: 'm2', fromMe: true, text: 'Yes, I am. Want to schedule a session?', time: '10:15 AM' },
  ]);
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string }>>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleEmojiSelect = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        name: file.name,
        size: formatFileSize(file.size),
      }));
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScheduleSession = () => {
    if (scheduledDate && scheduledTime) {
      setShowScheduler(false);
      // Message will be created with scheduled session info
      return true;
    }
    return false;
  };

  const send = () => {
    if (!text.trim() && attachedFiles.length === 0 && !scheduledDate) return;

    const newMessage: Message = {
      id: String(Date.now()),
      fromMe: true,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...(attachedFiles.length > 0 ? { files: attachedFiles } : {}),
      ...(scheduledDate && scheduledTime ? { scheduledSession: { date: scheduledDate, time: scheduledTime } } : {}),
    };

    setMessages((m) => [...m, newMessage]);
    setText('');
    setAttachedFiles([]);
    setScheduledDate('');
    setScheduledTime('');
  };

  if (!user) return <div>User not found</div>;

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)]">
      {/* header */}
      <div className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900">
        <div className="flex items-center justify-between p-3 border-b border-white/5">
          <button onClick={() => navigate(`/profile/view/${user.id}`)} className="flex items-center gap-3 text-left">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold">{user.initials}</div>
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs text-neutral-400">{user.bio}</div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button className="text-sm text-neutral-400">•••</button>
          </div>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-auto hide-scrollbar p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[70%] ${m.fromMe ? 'ml-auto' : ''}`}>
            <div className={`p-3 rounded-lg ${m.fromMe ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'bg-white/5 text-neutral-900 dark:text-neutral-100'}`}>
              {m.text && <div className="text-sm">{m.text}</div>}

              {m.files && m.files.length > 0 && (
                <div className={`mt-2 space-y-1 ${m.text ? 'border-t border-current opacity-70 pt-2' : ''}`}>
                  {m.files.map((file, idx) => (
                    <div key={idx} className="text-xs flex items-center gap-1 opacity-90">
                      <span>📎</span>
                      <span className="truncate">{file.name}</span>
                      <span className="text-xs opacity-70">({file.size})</span>
                    </div>
                  ))}
                </div>
              )}

              {m.scheduledSession && (
                <div className={`mt-2 ${m.text || m.files ? 'border-t border-current opacity-70 pt-2' : ''}`}>
                  <div className="text-xs font-semibold">📅 Session Scheduled:</div>
                  <div className="text-xs opacity-90">{m.scheduledSession.date} at {m.scheduledSession.time}</div>
                </div>
              )}

              <div className="text-xs text-neutral-400 mt-1 opacity-75">{m.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* input toolbar */}
      <div className="sticky bottom-0 z-10 bg-neutral-50 dark:bg-neutral-900 border-t border-white/5">
        {/* Attached files preview */}
        {attachedFiles.length > 0 && (
          <div className="px-3 pt-2 pb-1">
            <div className="text-xs text-neutral-500 mb-1">Attached files:</div>
            <div className="space-y-1">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/5 rounded px-2 py-1 text-xs">
                  <span className="truncate">📎 {file.name}</span>
                  <button onClick={() => removeFile(idx)} className="text-neutral-400 hover:text-red-400 ml-2">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled session preview */}
        {scheduledDate && scheduledTime && (
          <div className="px-3 pt-1 pb-1 text-xs bg-blue-50 dark:bg-blue-950 rounded-t">
            <div className="flex items-center justify-between">
              <span>📅 Session: {scheduledDate} at {scheduledTime}</span>
              <button onClick={() => { setScheduledDate(''); setScheduledTime(''); }} className="text-blue-600 dark:text-blue-400 hover:text-red-500">
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-3 flex items-center gap-2 flex-wrap">
          {/* Emoji picker button */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 transition-colors"
              title="Emoji"
            >
              🙂
            </button>

            {/* Emoji picker dropdown */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-2 grid grid-cols-8 gap-1 w-64 border border-neutral-200 dark:border-neutral-700">
                {commonEmojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-lg cursor-pointer transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* File attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 transition-colors"
            title="Attach file"
          >
            📎
          </button>
          <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />

          {/* Schedule session button */}
          <div className="relative">
            <button
              onClick={() => setShowScheduler(!showScheduler)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 transition-colors"
              title="Schedule session"
            >
              📅
            </button>

            {/* Scheduler dropdown */}
            {showScheduler && (
              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-4 w-72 border border-neutral-200 dark:border-neutral-700 z-50">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Select Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full mt-1 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Select Time</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full mt-1 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowScheduler(false)}
                      className="flex-1 px-2 py-1 text-xs rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleScheduleSession}
                      disabled={!scheduledDate || !scheduledTime}
                      className="flex-1 px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Set Session
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message input */}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && send()}
            className="flex-1 min-w-32 rounded-lg bg-neutral-100 dark:bg-neutral-800/50 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
            placeholder="Type a message..."
          />

          {/* Send button */}
          <button
            onClick={send}
            disabled={!text.trim() && attachedFiles.length === 0 && !scheduledDate}
            className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
