import React, { useState, useEffect, useRef } from 'react';
import Avatar from '../atoms/Avatar';
import { Search, Plus, AlertCircle } from 'lucide-react';

export default function TaskFilter({ 
  searchQuery, 
  setSearchQuery, 
  onAddClick, 
  members, 
  activeAssigneeFilter, 
  setActiveAssigneeFilter,
  activeFilterStatus,
  setActiveFilterStatus,
  activePriorityFilter,
  setActivePriorityFilter,
  tasks,
  getStatusLabel
}) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="task-filter-organism">
      {/* Header Search & Actions */}
      <div className="task-header-row">
        <div className="search-box">
          <Search className="search-icon" size={16} />
          <input 
            type="text" 
            placeholder="البحث عن مهمة..." 
            value={localSearch}
            onChange={handleSearchChange}
          />
        </div>
        <button className="btn btn-primary" onClick={onAddClick} style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '44px', flexShrink: 0 }}>
          <Plus size={14} />
          جديد
        </button>
      </div>

      {/* Team Member Filter pills */}
      <div className="assignee-filter-bar">
        <button 
          className={`filter-pill ${activeAssigneeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveAssigneeFilter('all')}
        >
          الكل
        </button>
        {members.map(member => (
          <button 
            key={member.id}
            className={`filter-pill ${activeAssigneeFilter === member.id.toString() ? 'active' : ''}`}
            onClick={() => setActiveAssigneeFilter(member.id.toString())}
          >
            <Avatar src={member.avatar} alt={member.name} size="sm" className="pill-avatar" />
            {member.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Priority Filter pills */}
      <div className="assignee-filter-bar priority-filter-bar" style={{ marginTop: 'var(--space-2)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-2)' }}>
        <span className="priority-icon-label" title="الأولوية">
          <AlertCircle size={14} />
        </span>
        <button 
          className={`filter-pill ${activePriorityFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActivePriorityFilter('all')}
        >
          الكل
        </button>
        <button 
          className={`filter-pill ${activePriorityFilter === 'high' ? 'active' : ''}`}
          onClick={() => setActivePriorityFilter('high')}
        >
          عالية
        </button>
        <button 
          className={`filter-pill ${activePriorityFilter === 'medium' ? 'active' : ''}`}
          onClick={() => setActivePriorityFilter('medium')}
        >
          متوسطة
        </button>
        <button 
          className={`filter-pill ${activePriorityFilter === 'low' ? 'active' : ''}`}
          onClick={() => setActivePriorityFilter('low')}
        >
          منخفضة
        </button>
      </div>

      {/* Task Status Filters */}
      <div className="status-tabs-container">
        {['all', 'todo', 'progress', 'review', 'done'].map((status) => (
          <button
            key={status}
            className={`status-tab ${activeFilterStatus === status ? 'active' : ''}`}
            onClick={() => setActiveFilterStatus(status)}
          >
            {status === 'all' ? 'الكل' : getStatusLabel(status)}
            <span className="count-badge font-english">
              {status === 'all' 
                ? tasks.length 
                : tasks.filter(t => t.status === status).length}
            </span>
          </button>
        ))}
      </div>

      <style>{`
        .task-filter-organism {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .task-header-row {
          display: flex;
          gap: var(--space-2);
          align-items: center;
        }

        .search-box {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-box .search-icon {
          position: absolute;
          right: var(--space-3);
          color: var(--text-faint);
          pointer-events: none;
        }

        .search-box input {
          width: 100%;
          padding: 10px var(--space-3) 10px var(--space-3);
          padding-right: 36px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          outline: none;
          font-size: 0.875rem;
          text-align: right;
          height: 44px;
          background-color: var(--bg-card);
          color: var(--text-main);
          transition: border-color var(--dur-fast) var(--ease-in-out);
        }

        .search-box input:focus {
          border-color: var(--primary);
        }

        .assignee-filter-bar {
          display: flex;
          overflow-x: auto;
          gap: var(--space-2);
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-bottom: var(--space-1);
        }

        .assignee-filter-bar::-webkit-scrollbar { display: none; }

        .priority-icon-label {
          font-size: 0.75rem;
          color: var(--text-faint);
          display: flex;
          align-items: center;
          flex-shrink: 0;
          padding-left: var(--space-1);
        }

        .filter-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          min-height: 38px;
          transition: all var(--dur-fast) var(--ease-in-out);
        }

        .filter-pill:active { transform: scale(0.96); }

        .filter-pill.active {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
        }

        .pill-avatar {
          width: 20px !important;
          height: 20px !important;
        }

        .status-tabs-container {
          display: flex;
          gap: 2px;
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          padding: 3px;
        }

        .status-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: var(--space-2) var(--space-1);
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 0.6875rem;
          font-weight: 600;
          cursor: pointer;
          min-height: 42px;
          white-space: nowrap;
          transition: all var(--dur-fast) var(--ease-in-out);
        }

        .status-tab.active {
          background: var(--bg-card);
          color: var(--text-main);
          font-weight: 700;
          box-shadow: var(--shadow-xs);
        }

        .status-tab:active {
          transform: scale(0.96);
        }

        .count-badge {
          font-size: 0.625rem;
          background: var(--bg-elevated);
          padding: 1px 5px;
          border-radius: var(--radius-xs);
          color: var(--text-faint);
          font-weight: 600;
        }

        .status-tab.active .count-badge {
          background: var(--primary-light);
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
