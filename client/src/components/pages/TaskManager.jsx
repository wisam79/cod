import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { CheckSquare, SearchX } from 'lucide-react';
import PullToRefresh from '../atoms/PullToRefresh';
import TaskCard from '../molecules/TaskCard';
import TaskFilter from '../organisms/TaskFilter';
import AddTaskModal from '../organisms/AddTaskModal';
import TaskDetailsModal from '../organisms/TaskDetailsModal';
import './TaskManager.css';

export default function TaskManager() {
  const { tasks, members, currentUser, addTask, updateTaskStatus, addCommentToTask, deleteCommentFromTask, deleteTask, fetchInitialData } = useAppStore(useShallow(s => ({
    tasks: s.tasks,
    members: s.members,
    currentUser: s.currentUser,
    addTask: s.addTask,
    updateTaskStatus: s.updateTaskStatus,
    addCommentToTask: s.addCommentToTask,
    deleteCommentFromTask: s.deleteCommentFromTask,
    deleteTask: s.deleteTask,
    fetchInitialData: s.fetchInitialData,
  })));
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInitialData().catch(() => {});
    setRefreshing(false);
  }, [fetchInitialData]);

  const [activeFilterStatus, setActiveFilterStatus] = useState('all');
  const [activeAssigneeFilter, setActiveAssigneeFilter] = useState('all');
  const [activePriorityFilter, setActivePriorityFilter] = useState('all');
  const [activeDateFilter, setActiveDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    document.querySelector('.scrollable-content')?.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeFilterStatus, activeAssigneeFilter, activePriorityFilter, activeDateFilter]);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter(task => {
      const matchesStatus = activeFilterStatus === 'all' || task.status === activeFilterStatus;
      const matchesAssignee = activeAssigneeFilter === 'all' || (task.assigneeId && task.assigneeId.toString() === activeAssigneeFilter);
      const matchesPriority = activePriorityFilter === 'all' || task.priority === activePriorityFilter;
      const matchesDate = activeDateFilter === 'all' || task.dueDate === activeDateFilter;
      const matchesSearch = !q || task.title.toLowerCase().includes(q) || (task.description && task.description.toLowerCase().includes(q));
      return matchesStatus && matchesAssignee && matchesPriority && matchesDate && matchesSearch;
    });
  }, [tasks, activeFilterStatus, activeAssigneeFilter, activePriorityFilter, activeDateFilter, searchQuery]);

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
        activePriorityFilter={activePriorityFilter}
        setActivePriorityFilter={setActivePriorityFilter}
        tasks={tasks}
        getStatusLabel={getStatusLabel}
        activeDateFilter={activeDateFilter}
        setActiveDateFilter={setActiveDateFilter}
      />

      <div className="tasks-list">
        {filteredTasks.map(task => {
          const assignee = members.find(m => m.id === task.assigneeId) || { name: 'غير محدد', avatar: '' };
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
            <div className="empty-state-icon">
              {tasks.length === 0 ? <CheckSquare size={28} /> : <SearchX size={28} />}
            </div>
            <p className="empty-title">
              {tasks.length === 0 ? 'لا توجد مهام بعد' : 'لا توجد نتائج مطابقة'}
            </p>
            <p className="empty-subtitle">
              {tasks.length === 0
                ? 'ابدأ بإضافة مهمة جديدة عبر زر "+" بالأعلى لتنظيم عمل فريقك.'
                : 'جرّب تغيير عوامل التصفية أو كلمة البحث للعثور على ما تريد.'}
            </p>
          </div>
        )}
      </div>

      {/* Desktop Kanban Board View */}
      <div className="kanban-board-desktop">
        {['todo', 'progress', 'review', 'done'].map(status => {
          const statusTasks = filteredTasks.filter(t => t.status === status);
          return (
            <div key={status} className="kanban-column">
              <div className="kanban-column-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`kanban-status-dot status-${status}`} />
                  <h3>{getStatusLabel(status)}</h3>
                </div>
                <span className="kanban-count-badge font-english">{statusTasks.length}</span>
              </div>
              <div className="kanban-column-tasks">
                {statusTasks.map(task => {
                  const assignee = members.find(m => m.id === task.assigneeId) || { name: 'غير محدد', avatar: '' };
                  return (
                    <TaskCard 
                      key={task.id}
                      task={task}
                      assignee={assignee}
                      onSelect={setSelectedTask}
                    />
                  );
                })}
                {statusTasks.length === 0 && (
                  <div className="kanban-empty-column" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-faint)', fontSize: '0.75rem' }}>
                    لا توجد مهام
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddTaskModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addTask}
        members={members}
      />

      <TaskDetailsModal 
        task={selectedTask}
        tasks={tasks}
        members={members}
        currentUser={currentUser}
        updateTaskStatus={updateTaskStatus}
        addCommentToTask={addCommentToTask}
        deleteCommentFromTask={deleteCommentFromTask}
        deleteTask={deleteTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
    </PullToRefresh>
  );
}
