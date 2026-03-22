import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const conversations = [
  { id: 'u1', name: 'John Doe', last: 'Hey, are you free tomorrow?', initials: 'J' },
  { id: 'u2', name: 'Priya Verma', last: 'Thanks for the guidance!', initials: 'P' },
  { id: 'u3', name: 'Amit Sharma', last: 'Sent the notes.', initials: 'A' },
];

export default function MessagesList() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)]">
      <div>
        <h2 className="text-2xl font-bold">Messages</h2>
        <p className="text-sm text-neutral-500">Recent conversations</p>
      </div>

      <div className="mt-4 flex-1 overflow-auto hide-scrollbar">
        {conversations.map((c) => (
          <div key={c.id} className="p-3 rounded-lg hover:bg-white/5 transition mb-2">
            <button onClick={() => navigate(`/messages/${c.id}`)} className="w-full text-left flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold">{c.initials}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-neutral-400">2d</div>
                </div>
                <div className="text-sm text-neutral-500 truncate">{c.last}</div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
