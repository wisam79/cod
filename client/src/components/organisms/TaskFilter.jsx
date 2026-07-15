import React from 'react';
import Avatar from '../atoms/Avatar';
import { Search, Plus } from 'lucide-react';

export default function TaskFilter({ 
  searchQuery, 
  setSearchQuery, 
  onAddClick, 
  members, 
  activeAssigneeFilter, 
  setActiveAssigneeFilter,
  activeFilterStatus,
  setActiveFilterStatus,
  tasks,
  getStatusLabel
}) {
  return (
    <div className="task-filter-organism">
      {/* Header Search & Actions */}
      <div className="task-header-row">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="البحث عن مهمة..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-add-fab" onClick={onAddClick} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Plus size={16} />
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

      {/* Task Status Filters */}
      <div className="status-tabs-container">
        {['all', 'todo', 'progress', 'review', 'done'].map((status) => (
          <button
            key={status}
            className={`status-tab ${activeFilterStatus === status ? 'active' : ''}`}
            onClick={() => setActiveFilterStatus(status)}
          >
            {status === 'all' ? 'الكل' : getStatusLabel(status)}
            <span className="count-badge">
              {status === 'all' 
                ? tasks.length 
                : tasks.filter(t => t.status === status).length}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
