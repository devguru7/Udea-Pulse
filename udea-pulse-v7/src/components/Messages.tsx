import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../lib/store';
import { Avatar, Icon } from './UI';
import { springs } from '../lib/motionConfig';
import { STUDENT_DIRECTORY } from '../lib/seed';
import type { Conversation, MessagePrivacy } from '../types';

type Tab = 'inbox' | 'requests' | 'clubs';

function ConversationItem({
  convo,
  personaId,
  onClick,
}: {
  convo: Conversation;
  personaId: string;
  onClick: () => void;
}) {
  const otherName = convo.participantNames.find(
    (_, i) => convo.participantIds[i] !== personaId,
  ) || convo.clubChannel || 'Unknown';
  const lastMsg = convo.messages[convo.messages.length - 1];
  const isClub = Boolean(convo.clubChannel);

  return (
    <motion.button
      className="convo-item"
      onClick={onClick}
      whileHover={{ x: 2 }}
      transition={springs.snappy}
    >
      <Avatar
        name={isClub ? convo.clubChannel! : otherName}
        size={40}
        color={isClub ? '#10B981' : '#8B5CF6'}
      />
      <div className="convo-meta">
        <div className="convo-top-row">
          <strong>{isClub ? `# ${convo.clubChannel}` : otherName}</strong>
          {convo.isRequest && !convo.accepted && (
            <span className="request-badge">Request</span>
          )}
        </div>
        {lastMsg && (
          <p className="convo-preview">
            {lastMsg.senderName.split(' ')[0]}: {lastMsg.text.slice(0, 60)}
            {lastMsg.text.length > 60 ? '...' : ''}
          </p>
        )}
      </div>
    </motion.button>
  );
}

function ChatView({
  convo,
  personaId,
  personaName,
  onBack,
  onAccept,
  onDecline,
  onSend,
}: {
  convo: Conversation;
  personaId: string;
  personaName: string;
  onBack: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const isClub = Boolean(convo.clubChannel);
  const otherName = convo.participantNames.find(
    (_, i) => convo.participantIds[i] !== personaId,
  ) || convo.clubChannel || 'Chat';

  return (
    <div className="chat-view">
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}>
          <Icon name="arrow" size={16} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <Avatar name={isClub ? convo.clubChannel! : otherName} size={32} color={isClub ? '#10B981' : '#8B5CF6'} />
        <strong>{isClub ? `# ${convo.clubChannel}` : otherName}</strong>
      </div>

      {convo.isRequest && !convo.accepted && (
        <div className="request-banner">
          <p><strong>{otherName}</strong> wants to message you</p>
          <div className="request-actions">
            <button className="btn btn-primary btn-sm" onClick={onAccept}>Accept</button>
            <button className="btn btn-outline btn-sm" onClick={onDecline}>Decline</button>
          </div>
        </div>
      )}

      <div className="chat-messages">
        <AnimatePresence>
          {convo.messages.map((msg) => {
            const isMine = msg.senderId === personaId;
            return (
              <motion.div
                key={msg.id}
                className={`chat-bubble ${isMine ? 'is-mine' : 'is-other'}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springs.snappy}
              >
                {!isMine && <span className="bubble-author">{msg.senderName.split(' ')[0]}</span>}
                <p>{msg.text}</p>
                <span className="bubble-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {(!convo.isRequest || convo.accepted) && (
        <form
          className="chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            onSend(text.trim());
            setText('');
          }}
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!text.trim()}>
            Send
          </button>
        </form>
      )}
    </div>
  );
}

const PRIVACY_OPTIONS: { id: MessagePrivacy; label: string; desc: string }[] = [
  { id: 'everyone', label: 'Everyone', desc: 'Anyone can message you directly' },
  { id: 'club_first', label: 'Club First', desc: 'Non-club members send a Message Request' },
  { id: 'nobody', label: 'Nobody', desc: 'All new DMs are blocked' },
];

function NewMessageComposer({ onClose, onSend }: { onClose: () => void; onSend: (targetId: string, targetName: string, text: string) => void }) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msgText, setMsgText] = useState('');
  const app = useApp();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return STUDENT_DIRECTORY.filter(
      (s) => s.id !== app.persona.id && (s.name.toLowerCase().includes(q) || s.programme.toLowerCase().includes(q)),
    );
  }, [search, app.persona.id]);

  const selected = STUDENT_DIRECTORY.find((s) => s.id === selectedId);

  return (
    <div className="new-message-composer">
      <div className="composer-header">
        <button className="back-btn" onClick={onClose}>
          <Icon name="arrow" size={16} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <strong>New Message</strong>
      </div>
      {!selectedId ? (
        <div className="composer-pick">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="chat-input"
            autoFocus
          />
          <div className="composer-results">
            {filtered.map((s) => (
              <button key={s.id} className="convo-item" onClick={() => setSelectedId(s.id)}>
                <Avatar name={s.name} size={32} color={s.color} />
                <div className="convo-meta">
                  <strong>{s.name}</strong>
                  <p className="convo-preview">{s.programmeShort}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="empty-hint">No students found</p>}
          </div>
        </div>
      ) : (
        <div className="composer-write">
          <div className="composer-to">
            <span>To:</span>
            <span className="composer-to-name">
              <Avatar name={selected!.name} size={20} color={selected!.color} />
              {selected!.name}
            </span>
            <button className="btn btn-ghost btn-xs" onClick={() => setSelectedId(null)}>Change</button>
          </div>
          <form
            className="chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              if (!msgText.trim() || !selectedId) return;
              onSend(selectedId, selected!.name, msgText.trim());
              setMsgText('');
            }}
          >
            <input
              type="text"
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder="Type your message..."
              className="chat-input"
              autoFocus
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!msgText.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Messages() {
  const app = useApp();
  const [tab, setTab] = useState<Tab>('inbox');
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const personaId = app.persona.id;
  const conversations = app.state.conversations ?? [];

  const myConvos = useMemo(
    () => conversations.filter((c) => c.participantIds.includes(personaId)),
    [conversations, personaId],
  );

  const inbox = myConvos.filter((c) => !c.clubChannel && (!c.isRequest || c.accepted));
  const requests = myConvos.filter((c) => c.isRequest && !c.accepted);
  const myClubIds = new Set(
    app.state.clubs
      .filter((cl) => cl.leadId === personaId || cl.roster.some((r) => r.userId === personaId))
      .map((cl) => cl.id),
  );
  const clubs = myConvos.filter((c) => Boolean(c.clubChannel));

  const activeConvo = conversations.find((c) => c.id === activeConvoId);
  const privacy = app.state.privacy ?? { profileVisibility: 'public' as const, messagingPermission: 'everyone' as MessagePrivacy };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'inbox', label: 'Inbox', count: inbox.length },
    { id: 'requests', label: 'Requests', count: requests.length },
    { id: 'clubs', label: 'Club Channels', count: clubs.length },
  ];

  const handleAccept = (convoId: string) => app.acceptMessageRequest(convoId);
  const handleDecline = (convoId: string) => app.declineMessageRequest(convoId);
  const handleSend = (convoId: string, text: string) => app.sendDirectMessage(convoId, text);

  if (showComposer) {
    return (
      <section className="messages-view">
        <NewMessageComposer
          onClose={() => setShowComposer(false)}
          onSend={(targetId, targetName, text) => {
            app.startConversation(targetId, targetName, text);
            setShowComposer(false);
          }}
        />
      </section>
    );
  }

  if (activeConvo) {
    return (
      <section className="messages-view">
        <ChatView
          convo={activeConvo}
          personaId={personaId}
          personaName={app.persona.name}
          onBack={() => setActiveConvoId(null)}
          onAccept={() => handleAccept(activeConvo.id)}
          onDecline={() => handleDecline(activeConvo.id)}
          onSend={(text) => handleSend(activeConvo.id, text)}
        />
      </section>
    );
  }

  const listForTab = tab === 'inbox' ? inbox : tab === 'requests' ? requests : clubs;

  return (
    <section className="messages-view">
      <div className="section-head">
        <div>
          <h2>Messages</h2>
          <p className="section-sub">
            Direct messages & club channels
            {privacy.messagingPermission !== 'everyone' && (
              <span className="privacy-indicator">
                <Icon name="shield" size={12} /> {privacy.messagingPermission === 'club_first' ? 'Requests first' : 'DMs off'}
              </span>
            )}
          </p>
        </div>
        <div className="section-head-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowComposer(true)}>
            <Icon name="edit" size={14} /> New Message
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowPrivacy(!showPrivacy)}>
            <Icon name="shield" size={14} /> Privacy
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPrivacy && (
          <motion.div
            className="privacy-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="privacy-bar-inner">
              <strong><Icon name="shield" size={14} /> Who can message me</strong>
              <div className="privacy-options">
                {PRIVACY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    className={`privacy-opt ${privacy.messagingPermission === opt.id ? 'is-active' : ''}`}
                    onClick={() => app.updatePrivacy({ messagingPermission: opt.id })}
                  >
                    <span className="privacy-opt-label">{opt.label}</span>
                    <span className="privacy-opt-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="filter-pills">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`filter-pill ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {tab === t.id && (
              <motion.span
                layoutId="msg-tab-pill"
                className="liquid-pill-bg"
                transition={springs.pill}
              />
            )}
            <span style={{ position: 'relative' }}>
              {t.label}
              {t.count > 0 && <b className="filter-pill-count">{t.count}</b>}
            </span>
          </button>
        ))}
      </div>

      <div className="convo-list">
        {listForTab.length === 0 ? (
          <div className="empty-state">
            <Icon name={tab === 'requests' ? 'bell' : tab === 'clubs' ? 'users' : 'telegram'} size={32} />
            <p>
              {tab === 'requests'
                ? 'No pending message requests'
                : tab === 'clubs'
                  ? 'Join a club to see team channels'
                  : 'No conversations yet'}
            </p>
          </div>
        ) : (
          listForTab.map((c) => (
            <ConversationItem
              key={c.id}
              convo={c}
              personaId={personaId}
              onClick={() => setActiveConvoId(c.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
