import React, { useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import PullToRefresh from '../atoms/PullToRefresh';
import TaskCard from '../molecules/TaskCard';
import TaskFilter from '../organisms/TaskFilter';
import AddTaskModal from '../organisms/AddTaskModal';
import TaskDetailsModal from '../organisms/TaskDetailsModal';

export default function TaskManager() {
  const store = useAppStore();
  const { 
    tasks, 
    members, 
    currentUser, 
    addTask, 
    updateTaskStatus, 
    addCommentToTask, 
    deleteTask,
    fetchInitialData 
  } = store;
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInitialData().catch(() => {});
    setRefreshing(false);
  }, [fetchInitialData]);

  const [activeFilterStatus, setActiveFilterStatus] = useState('all');
  const [activeAssigneeFilter, setActiveAssigneeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Scroll to top when filters change
  React.useEffect(() => {
    document.querySelector('.scrollable-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeFilterStatus, activeAssigneeFilter]);

  // Filtering Logic
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = activeFilterStatus === 'all' || task.status === activeFilterStatus;
    const matchesAssignee = activeAssigneeFilter === 'all' || task.assigneeId === activeAssigneeFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesAssignee && matchesSearch;
  });

  const getStatusLabel = (status) => {
    switch(status) {
      case 'todo': return 'في الانتظار';
      case 'progress': return 'قيد العمل';
      case 'review': return 'قيد المراجعة';
      case 'done': return 'مكتملة';
      default: return 'في الانتظار';
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} isRefreshing={refreshing}>
    <div className="task-manager-view">
      <TaskFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddClick={() => setShowAddModal(true)}
        members={members}
        activeAssigneeFilter={activeAssigneeFilter}
        setActiveAssigneeFilter={setActiveAssigneeFilter}
        activeFilterStatus={activeFilterStatus}
        setActiveFilterStatus={setActiveFilterStatus}
        tasks={tasks}
        getStatusLabel={getStatusLabel}
      />

      {/* Tasks List */}
      <div className="tasks-list">
        {filteredTasks.map(task => {
          const assignee = members.find(m => m.id === task.assigneeId) || currentUser;
          return (
            <TaskCard 
              key={task.id}
              task={task}
              assignee={assignee}
              onSelect={setSelectedTask}
            />
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="empty-state-card card">
            <p>لا توجد مهام مطابقة للبحث أو التصفية.</p>
          </div>
        )}
      </div>

      {/* ADD TASK MODAL */}
      <AddTaskModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addTask}
        members={members}
      />

      {/* TASK DETAILS & COMMENTS MODAL */}
      <TaskDetailsModal 
        task={selectedTask}
        tasks={tasks}
        members={members}
        currentUser={currentUser}
        updateTaskStatus={updateTaskStatus}
        addCommentToTask={addCommentToTask}
        deleteTask={deleteTask}
        onClose={() => setSelectedTask(null)}
      />

      <style>{`
        .task-manager-view {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .task-manager-view .task-header-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .task-manager-view .search-box {
          flex: 1;
          position: relative;
        }

        .task-manager-view .search-box input {
          width: 100%;
          padding: 12px 40px 12px 16px;
          border-radius: 16px;
          border: 1px solid var(--border);
          background-color: var(--bg-card);
          font-size: 0.9rem;
          outline: none;
          text-align: right;
        }

        .task-manager-view .search-box input:focus {
          border-color: var(--primary);
        }

        .task-manager-view .search-icon {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .task-manager-view .btn-add-fab {
          padding: 12px 20px;
          border-radius: 16px;
          font-size: 0.85rem;
          white-space: nowrap;
        }

        .task-manager-view .assignee-filter-bar {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 4px 0;
          scrollbar-width: none;
        }

        .task-manager-view .assignee-filter-bar::-webkit-scrollbar {
          display: none;
        }

        .task-manager-view .filter-pill {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-main);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .task-manager-view .filter-pill.active {
          background-color: var(--primary-light);
          border-color: var(--primary);
          color: var(--primary);
        }

        .task-manager-view .pill-avatar {
          width: 18px;
          height: 18px;
          border-radius: 50%;
        }

        .task-manager-view .status-tabs-container {
          display: flex;
          background-color: var(--primary-light);
          padding: 4px;
          border-radius: 14px;
          gap: 2px;
        }

        .task-manager-view .status-tab {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 10px 4px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }

        .task-manager-view .status-tab.active {
          background-color: #FFFFFF;
          color: var(--primary);
          box-shadow: var(--shadow-sm);
        }

        .task-manager-view .count-badge {
          font-size: 0.65rem;
          background-color: rgba(0, 0, 0, 0.05);
          color: var(--text-main);
          padding: 1px 6px;
          border-radius: 8px;
          font-family: var(--font-english);
        }

        .task-manager-view .status-tab.active .count-badge {
          background-color: var(--primary-light);
          color: var(--primary);
        }

        .task-manager-view .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          flex: 1;
          padding-bottom: 80px;
        }

        .task-manager-view .task-card {
          text-align: right;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .task-manager-view .task-card:active {
          transform: scale(0.98);
        }

        .task-manager-view .task-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .task-manager-view .task-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .task-manager-view .task-status-dot.status-todo { background-color: #888; }
        .task-manager-view .task-status-dot.status-progress { background-color: var(--primary); }
        .task-manager-view .task-status-dot.status-review { background-color: #cc8800; }
        .task-manager-view .task-status-dot.status-done { background-color: #009933; }

        .task-manager-view .task-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .task-manager-view .task-desc-preview {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .task-manager-view .task-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border);
          padding-top: 12px;
          margin-top: 4px;
        }

        .task-manager-view .task-meta {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .task-manager-view .due-date {
          font-size: 0.7rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-english);
        }

        .task-manager-view .comment-indicator {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .task-manager-view .assignee-avatar-wrapper {
          display: flex;
        }

        .task-manager-view .assignee-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1.5px solid #FFFFFF;
          box-shadow: var(--shadow-sm);
        }

        .task-manager-view .empty-state-card {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .task-manager-view .task-detail-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow-y: auto;
          flex: 1;
        }

        .task-manager-view .detail-task-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .task-manager-view .detail-task-desc {
          font-size: 0.95rem;
          color: var(--text-main);
          line-height: 1.6;
          background-color: var(--bg-app);
          padding: 12px;
          border-radius: 16px;
        }

        .task-manager-view .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          background-color: var(--bg-app);
          padding: 12px;
          border-radius: 16px;
          border: 1px solid var(--border);
        }

        .task-manager-view .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .task-manager-view .detail-item .label {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .task-manager-view .detail-item .val {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .task-manager-view .status-select {
          border: none;
          background: none;
          font-size: 0.8rem;
          font-weight: 700;
          outline: none;
          cursor: pointer;
          width: fit-content;
        }

        .task-manager-view .status-select.status-todo { color: #888; }
        .task-manager-view .status-select.status-progress { color: var(--primary); }
        .task-manager-view .status-select.status-review { color: #cc8800; }
        .task-manager-view .status-select.status-done { color: #009933; }

        .task-manager-view .detail-comments-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          min-height: 200px;
        }

        .task-manager-view .detail-comments-section h4 {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-main);
          border-bottom: 1px solid var(--border);
          padding-bottom: 6px;
        }

        .task-manager-view .comments-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 2px;
        }

        .task-manager-view .no-comments {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.8rem;
          padding: 20px 0;
        }

        .task-manager-view .comment-form {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .task-manager-view .comment-form input {
          flex: 1;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background-color: var(--bg-app);
          font-size: 0.85rem;
          outline: none;
          text-align: right;
        }

        .task-manager-view .comment-form input:focus {
          border-color: var(--primary);
        }

        .task-manager-view .comment-form .btn {
          padding: 12px;
          border-radius: 14px;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .task-manager-view .modal-footer-actions {
          border-top: 1px solid var(--border);
          padding-top: 12px;
          margin-top: auto;
        }

        .task-manager-view .btn-delete-task {
          background-color: #ffe5db;
          color: #ff3300;
          width: 100%;
          padding: 12px;
          font-size: 0.85rem;
          border-radius: 14px;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .task-manager-view .btn-delete-task:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
    </PullToRefresh>
  );
}
