import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from './UI';
import { springs } from '../lib/motionConfig';

type HelpTab = 'students' | 'coordinators' | 'admins';

const TAB_META: { id: HelpTab; label: string; color: string; icon: string }[] = [
  { id: 'students', label: 'For Students', color: '#8B5CF6', icon: 'users' },
  { id: 'coordinators', label: 'For Coordinators', color: '#10B981', icon: 'shield' },
  { id: 'admins', label: 'For Administrators', color: '#F97316', icon: 'sliders' },
];

interface HelpStep {
  title: string;
  description: string;
  icon: string;
}

const STUDENT_STEPS: HelpStep[] = [
  { title: 'Browse Events on Explore', description: 'Filter by category, date, Boshlik room zone, or language. The Spotlight countdown shows the next flagship event.', icon: 'compass' },
  { title: '1-Click RSVP & QR Pass', description: 'Tap "Register" on any event card. Your holographic QR pass appears instantly in My Passes with an offline cache.', icon: 'ticket' },
  { title: 'Confirm Attendance 4h Before', description: 'Get a Telegram reminder 4 hours before the event. Confirm to lock your seat — skipping releases it to the waitlist.', icon: 'clock' },
  { title: 'Door Check-In via QR Scanner', description: 'Show your QR pass at the door. The scanner works offline and validates your ticket hash in under 1 second.', icon: 'qr' },
  { title: 'Team Finder & Squad Builder', description: 'Toggle "Looking for Team" on hackathon events. Classmates see your skill tag and can invite you to their squad.', icon: 'userPlus' },
  { title: 'Campus XP & Co-Curricular Passport', description: 'Earn XP for RSVP, check-in, task completion, and poll voting. Track your reliability score and download verified certificates.', icon: 'award' },
  { title: 'Direct Messages & Privacy', description: 'Message classmates directly. If you are not in the same club, your first message goes as a Request they can accept or decline.', icon: 'telegram' },
  { title: 'Personal To-Do List & Google Tasks', description: 'Add personal reminders in My Tasks. Sync them to Google Tasks with one click for calendar integration.', icon: 'check' },
];

const COORDINATOR_STEPS: HelpStep[] = [
  { title: 'Open the Teal Coordinator Studio', description: 'Sign in with your coordinator credentials or redeem a Role Invite Code. Your workspace opens in the Teal theme.', icon: 'shield' },
  { title: 'Create Events in Host Studio', description: 'Fill the event form: title, Boshlik room, date/time, capacity, registration mode. The room conflict engine warns you of overlaps.', icon: 'plus' },
  { title: 'Manage the Club Kanban Board', description: 'Create project cards, assign members, set deadlines. Members update progress from 0% to 100% on their assigned tasks.', icon: 'layers' },
  { title: 'Assign Club Tasks to Members', description: 'Create tasks under your club. Assignees see them in their My Tasks panel and can update status and progress.', icon: 'check' },
  { title: 'Use the QR Scanner at Events', description: 'Open the Scanner from Organizer Studio. Scan attendee QR codes or type their student ID / Telegram handle.', icon: 'qr' },
  { title: 'Publish Campus Posts & Recaps', description: 'Create announcements, event promos, recaps with stats, or discussion polls. Pin important posts to the top of the feed.', icon: 'edit' },
  { title: 'Role Architect: Delegate Permissions', description: 'Create custom roles with specific permissions (create events, book rooms, scan tickets, etc.) and assign them to members.', icon: 'sliders' },
  { title: 'Generate Role Invite Codes', description: 'Create shareable invite codes like FINTECH-COORD-2026. Anyone who redeems the code gets the role and its permissions.', icon: 'copy' },
];

const ADMIN_STEPS: HelpStep[] = [
  { title: 'Open the Orange Admin Console', description: 'Sign in as an administrator. The console opens with the orange theme and full platform control.', icon: 'shield' },
  { title: 'Approve Boshlik Room Requests', description: 'Review pending room bookings in the Organizer panel. Approve, suggest an alternate room, or reject with a note.', icon: 'pin' },
  { title: 'Launch Official Clubs', description: 'Create new verified clubs with the blue checkmark. Set the club category, partner organization, and assign the first president.', icon: 'users' },
  { title: 'Generate One-Time Passwords (OTP)', description: 'Issue OTP codes (UDEA-OTP-XXXX) for coordinators or new admins. The recipient uses the OTP to set their password on first login.', icon: 'copy' },
  { title: 'Manage the Campus Directory', description: 'View all registered students, their programmes, clubs, and roles. Reset passwords or update student records.', icon: 'file' },
  { title: 'Toggle Verified Blue Checkmark', description: 'Grant or revoke the official "Verified" status on clubs. Verified clubs appear with a blue checkmark across the platform.', icon: 'check' },
  { title: 'Preview as Student', description: 'Click "Preview as Student" in the topbar to see the platform exactly as a regular student sees it, without admin features.', icon: 'globe' },
  { title: 'Run the 15-Point QA Suite', description: 'Open Tasks & QA and run the automated test suite. It validates registration, OTP, roles, rooms, RSVP, kanban, messages, and more.', icon: 'spark' },
];

function StepCard({ step, index }: { step: HelpStep; index: number }) {
  return (
    <motion.div
      className="help-step"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, ...springs.snappy }}
    >
      <div className="help-step-num">{index + 1}</div>
      <div className="help-step-icon">
        <Icon name={step.icon} size={20} />
      </div>
      <div className="help-step-body">
        <h4>{step.title}</h4>
        <p>{step.description}</p>
      </div>
    </motion.div>
  );
}

export default function HelpCenter() {
  const [tab, setTab] = useState<HelpTab>('students');
  const steps = tab === 'students' ? STUDENT_STEPS : tab === 'coordinators' ? COORDINATOR_STEPS : ADMIN_STEPS;
  const meta = TAB_META.find((t) => t.id === tab)!;

  return (
    <section className="help-view">
      <div className="section-head">
        <div>
          <h2>Help & Guide</h2>
          <p className="section-sub">Step-by-step workflows for every role on Boshlik Campus</p>
        </div>
      </div>

      <div className="help-tabs">
        {TAB_META.map((t) => (
          <button
            key={t.id}
            className={`help-tab-btn ${tab === t.id ? 'is-active' : ''}`}
            style={tab === t.id ? { borderColor: t.color, color: t.color } : undefined}
            onClick={() => setTab(t.id)}
          >
            {tab === t.id && (
              <motion.span
                layoutId="help-tab-pill"
                className="help-tab-bg"
                style={{ background: `${t.color}12` }}
                transition={springs.pill}
              />
            )}
            <Icon name={t.icon} size={16} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="help-role-header" style={{ borderLeftColor: meta.color }}>
        <h3 style={{ color: meta.color }}>{meta.label}</h3>
        <p>
          {tab === 'students'
            ? 'Everything a Boshlik Campus student needs: events, passes, tasks, teams, and certificates.'
            : tab === 'coordinators'
              ? 'Club presidents and delegated coordinators: events, posts, roles, kanban, and QR scanning.'
              : 'Platform administrators: room approvals, club creation, OTP management, and QA diagnostics.'}
        </p>
      </div>

      <div className="help-steps">
        {steps.map((step, i) => (
          <StepCard key={step.title} step={step} index={i} />
        ))}
      </div>
    </section>
  );
}
