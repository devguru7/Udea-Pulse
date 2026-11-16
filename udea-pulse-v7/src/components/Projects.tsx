import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../lib/store';
import { Avatar, Icon } from './UI';
import type { KanbanColumn, Project, ProjectStatus } from '../types';
import { springs } from '../lib/motionConfig';

const STATUS_FILTERS: { id: 'all' | ProjectStatus; label: string }[] = [
  { id: 'all', label: 'All Projects' },
  { id: 'looking', label: 'Looking for contributors' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

const COLUMN_META: { id: KanbanColumn; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: '#6B7280' },
  { id: 'in_progress', label: 'In Progress', color: '#3B82F6' },
  { id: 'review', label: 'Review', color: '#F59E0B' },
  { id: 'done', label: 'Done', color: '#10B981' },
];

function KanbanBoard({ project }: { project: Project }) {
  const app = useApp();
  const cards = project.kanban;
  const [showAddCard, setShowAddCard] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDue, setNewDue] = useState('');

  const moveCard = (cardId: string, to: KanbanColumn) => {
    app.moveKanbanCard(project.id, cardId, to);
    app.pushToast({
      tone: 'success',
      title: 'Card moved',
      message: `Moved to ${COLUMN_META.find((c) => c.id === to)?.label}`,
    });
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    app.addKanbanCard(project.id, {
      title: newTitle.trim(),
      assigneeName: newAssignee || undefined,
      dueDate: newDue || undefined,
    });
    setNewTitle('');
    setNewAssignee('');
    setNewDue('');
    setShowAddCard(false);
  };

  return (
    <div className="kanban-board">
      <div className="kanban-toolbar">
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddCard(!showAddCard)}>
          <Icon name="plus" size={14} /> Add Card
        </button>
      </div>
      {showAddCard && (
        <form className="kanban-add-form" onSubmit={handleAddCard}>
          <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Card title" className="kanban-input" autoFocus />
          <input type="text" value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)} placeholder="Assignee name" className="kanban-input" />
          <input type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)} className="kanban-input" />
          <div className="kanban-add-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={!newTitle.trim()}>Create</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddCard(false)}>Cancel</button>
          </div>
        </form>
      )}
      {COLUMN_META.map((col) => {
        const colCards = cards.filter((c) => c.column === col.id);
        return (
          <div key={col.id} className="kanban-column">
            <div className="kanban-col-head">
              <span className="kanban-dot" style={{ background: col.color }} />
              <span className="kanban-col-title">{col.label}</span>
              <span className="kanban-col-count">{colCards.length}</span>
            </div>
            <div className="kanban-cards">
              <AnimatePresence>
                {colCards.map((card) => (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={springs.snappy}
                    className="kanban-card"
                  >
                    <p className="kanban-card-title">{card.title}</p>
                    {card.assigneeName && (
                      <span className="kanban-card-assignee">
                        <Avatar name={card.assigneeName} size={18} color="#8B5CF6" />
                        {card.assigneeName}
                      </span>
                    )}
                    {card.dueDate && (
                      <span className="kanban-card-due">
                        <Icon name="calendar" size={12} /> {card.dueDate}
                      </span>
                    )}
                    {typeof card.progress === 'number' && (
                      <div className="kanban-progress">
                        <div className="kanban-progress-bar" style={{ width: `${card.progress}%` }} />
                        <span>{card.progress}%</span>
                      </div>
                    )}
                    <div className="kanban-card-actions">
                      {COLUMN_META.filter((c) => c.id !== card.column).map((target) => (
                        <button
                          key={target.id}
                          className="kanban-move-btn"
                          onClick={() => moveCard(card.id, target.id)}
                          title={`Move to ${target.label}`}
                        >
                          <span className="kanban-dot" style={{ background: target.color, width: 6, height: 6 }} />
                        </button>
                      ))}
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={card.progress ?? 0}
                        onChange={(e) => app.updateKanbanCardProgress(project.id, card.id, Number(e.target.value))}
                        className="kanban-progress-slider"
                        title={`Progress: ${card.progress ?? 0}%`}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {colCards.length === 0 && (
                <div className="kanban-empty">No cards</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) {
  const statusColors: Record<ProjectStatus, string> = {
    looking: '#8B5CF6',
    active: '#3B82F6',
    completed: '#10B981',
  };
  const statusLabels: Record<ProjectStatus, string> = {
    looking: 'Looking for contributors',
    active: 'Active',
    completed: 'Completed',
  };

  return (
    <motion.div
      className="project-card"
      whileHover={{ y: -2 }}
      onClick={onOpen}
    >
      <div className="project-card-head">
        <h3>{project.title}</h3>
        <span
          className="project-status-badge"
          style={{ background: `${statusColors[project.status]}18`, color: statusColors[project.status], borderColor: `${statusColors[project.status]}40` }}
        >
          {statusLabels[project.status]}
        </span>
      </div>
      <p className="project-card-desc">{project.description}</p>
      {project.clubName && (
        <span className="project-club-tag">
          <Icon name="users" size={12} /> {project.clubName}
        </span>
      )}
      <div className="project-card-footer">
        <div className="project-members-row">
          {project.members.slice(0, 4).map((m, i) => (
            <Avatar key={m.userId} name={m.name} size={22} color={['#2563EB', '#8B5CF6', '#10B981', '#EC4899'][i % 4]} />
          ))}
          {project.members.length > 4 && (
            <span className="project-more">+{project.members.length - 4}</span>
          )}
        </div>
        <div className="project-tags">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="project-tag">{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const app = useApp();
  const [filter, setFilter] = useState<'all' | ProjectStatus>('all');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const projects = app.state.projects ?? [];
  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);
  const opened = projects.find((p) => p.id === selectedProject);

  return (
    <section className="projects-view">
      <div className="section-head">
        <div>
          <h2>Projects & Kanban</h2>
          <p className="section-sub">Student & club projects on Boshlik Campus</p>
        </div>
      </div>

      <div className="filter-pills">
        {STATUS_FILTERS.map((sf) => (
          <button
            key={sf.id}
            className={`filter-pill ${filter === sf.id ? 'is-active' : ''}`}
            onClick={() => setFilter(sf.id)}
          >
            {filter === sf.id && (
              <motion.span
                layoutId="project-filter-pill"
                className="liquid-pill-bg"
                transition={springs.pill}
              />
            )}
            <span style={{ position: 'relative' }}>{sf.label}</span>
          </button>
        ))}
      </div>

      {opened ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="project-detail"
        >
          <button className="back-btn" onClick={() => setSelectedProject(null)}>
            <Icon name="arrow" size={16} style={{ transform: 'rotate(180deg)' }} /> All Projects
          </button>
          <div className="project-detail-head">
            <h2>{opened.title}</h2>
            <span
              className="project-status-badge"
              style={{
                background: `${opened.status === 'looking' ? '#8B5CF6' : opened.status === 'active' ? '#3B82F6' : '#10B981'}18`,
                color: opened.status === 'looking' ? '#8B5CF6' : opened.status === 'active' ? '#3B82F6' : '#10B981',
              }}
            >
              {opened.status === 'looking' ? 'Looking for contributors' : opened.status === 'active' ? 'Active' : 'Completed'}
            </span>
          </div>
          <p className="project-detail-desc">{opened.description}</p>
          <div className="project-detail-members">
            <h4>Team ({opened.members.length})</h4>
            {opened.members.map((m, i) => (
              <div key={m.userId} className="project-member-row">
                <Avatar name={m.name} size={28} color={['#2563EB', '#8B5CF6', '#10B981', '#EC4899'][i % 4]} />
                <div>
                  <strong>{m.name}</strong>
                  <span>{m.role}</span>
                </div>
              </div>
            ))}
          </div>
          <h4 style={{ marginTop: 20 }}>Kanban Board</h4>
          <KanbanBoard project={opened} />
        </motion.div>
      ) : (
        <div className="projects-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Icon name="layers" size={32} />
              <p>No projects match this filter</p>
            </div>
          ) : (
            filtered.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onOpen={() => setSelectedProject(p.id)}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}
