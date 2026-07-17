import React, { useState, useEffect, useRef, useMemo } from 'react';
import Avatar from '../atoms/Avatar';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

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
  getStatusLabel,
  activeDateFilter = 'all',
  setActiveDateFilter
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

  const weekDays = useMemo(() => {
    const days = [];
    const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNameAr: dayNamesAr[d.getDay()],
        dayNameEn: dayNamesEn[d.getDay()],
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('ar-EG', { month: 'short' }),
        yearNum: d.getFullYear()
      });
    }
    return days;
  }, []);

  const selectedDateLabel = useMemo(() => {
    if (!activeDateFilter || activeDateFilter === 'all') return 'جدول المواعيد';
    const matched = weekDays.find(w => w.dateStr === activeDateFilter);
    if (matched) {
      return `${matched.dayNameAr}، ${matched.dayNum} ${matched.monthName}`;
    }
    return activeDateFilter;
  }, [activeDateFilter, weekDays]);

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

      {/* Date title & Horizontal Scroll picker */}
      <div className="date-picker-section" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl', marginTop: 'var(--space-1)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {selectedDateLabel}
          </span>
          <button 
            className={`filter-pill ${(!activeDateFilter || activeDateFilter === 'all') ? 'active' : ''}`}
            onClick={() => {
              triggerHaptic('light');
              setActiveDateFilter('all');
            }}
            style={{ minHeight: '30px', height: '30px', padding: '0 12px', fontSize: '0.7rem', borderRadius: '15px' }}
          >
            عرض الكل
          </button>
        </div>
        
        <div className="horizontal-date-scroll" style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {weekDays.map((day) => {
            const isSelected = activeDateFilter === day.dateStr;
            return (
              <button
                key={day.dateStr}
                className={`date-scroll-card ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveDateFilter(isSelected ? 'all' : day.dateStr);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '56px',
                  height: '68px',
                  borderRadius: '16px',
                  border: isSelected ? 'none' : '1px solid var(--border)',
                  background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all var(--dur-fast) var(--ease-in-out)',
                  boxShadow: isSelected ? '0 4px 12px rgba(168, 85, 247, 0.3)' : 'var(--shadow-xs)'
                }}
              >
                <span className="font-english" style={{ fontSize: '0.7rem', fontWeight: 500, color: isSelected ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-muted)' }}>
                  {day.dayNameEn}
                </span>
                <span className="font-english" style={{ fontSize: '1.125rem', fontWeight: 800, marginTop: '2px' }}>
                  {day.dayNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Team Member Filter pills */}
      <div className="assignee-filter-bar" style={{ marginTop: 'var(--space-1)' }}>
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
