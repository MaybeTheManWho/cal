import React, { useState, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  FaPlus, 
  FaTrash, 
  FaCheck,
  FaEdit,
  FaCalendarAlt,
  FaSearch,
  FaBold,
  FaItalic,
  FaUnderline,
  FaLink,
  FaListUl,
  FaListOl,
  FaTable
} from 'react-icons/fa';
import { CalendarContext } from '../contexts/CalendarContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const TodoPage = () => {
  // Get context data
  const calendarContext = useContext(CalendarContext);
  const { 
    todos, 
    addTodo, 
    updateTodo, 
    deleteTodo, 
    toggleTodoComplete
  } = calendarContext;
  
  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  
  // Refs
  const titleRef = useRef();
  const descriptionRef = useRef();
  const dateRef = useRef();
  const statusRef = useRef();
  
  // Open modal to add new todo
  const handleAddTodo = () => {
    setEditMode(false);
    setCurrentTodo(null);
    setIsModalOpen(true);
  };
  
  // Open modal to edit existing todo
  const handleEditTodo = (todo) => {
    setEditMode(true);
    setCurrentTodo(todo);
    setIsModalOpen(true);
  };
  
  // Save todo (add or update)
  const handleSaveTodo = (e) => {
    e.preventDefault();
    
    const todoData = {
      title: titleRef.current.value,
      description: descriptionRef.current.value,
      status: statusRef.current.value,
      dueDate: dateRef.current.value ? new Date(dateRef.current.value).toISOString() : null
    };
    
    if (editMode && currentTodo) {
      updateTodo(currentTodo.id, todoData);
    } else {
      addTodo(todoData);
    }
    
    setIsModalOpen(false);
  };
  
  // Update todo status
  const handleStatusChange = (id, status) => {
    updateTodo(id, { status });
  };
  
  // Apply filters and search
  const filteredTodos = todos
    .filter(todo => {
      // Apply status filter
      if (filter === 'completed') return todo.completed;
      if (filter === 'active') return !todo.completed;
      return true; // 'all' filter
    })
    .filter(todo => {
      // Apply search query
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        todo.title?.toLowerCase().includes(query) ||
        todo.description?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      // Sort by completed status, then by creation date (newest first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  
  // Process events for the calendar table view
  const getEventsGroupedByDate = () => {
    const { events } = calendarContext;
    const groupedEvents = {};
    
    if (events && Array.isArray(events)) {
      events.forEach(event => {
        if (event && event.date) {
          const dateStr = format(new Date(event.date), 'yyyy-MM-dd');
          if (!groupedEvents[dateStr]) {
            groupedEvents[dateStr] = [];
          }
          groupedEvents[dateStr].push(event);
        }
      });
    }
    
    return groupedEvents;
  };
  
  const groupedEvents = getEventsGroupedByDate();
  const sortedEventDates = Object.keys(groupedEvents).sort();
  
  // Toggle event completion status
  const toggleEventCompletion = (eventId) => {
    const event = calendarContext.events.find(e => e.id === eventId);
    if (event) {
      calendarContext.updateEvent(eventId, { completed: !event.completed });
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="container mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-text-primary mb-2 md:mb-0">To-Do List</h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-3"
        >
          <div className="relative">
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          </div>
          
          <Button 
            onClick={handleAddTodo}
            icon={<FaPlus />}
          >
            Add Task
          </Button>
        </motion.div>
      </div>
      
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex justify-between mb-6 border-b border-background-light"
      >
        <div className="flex">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 px-4 font-medium ${filter === 'all' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`pb-3 px-4 font-medium ${filter === 'active' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`pb-3 px-4 font-medium ${filter === 'completed' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
          >
            Completed
          </button>
        </div>
        <div className="flex">
          <button
            onClick={() => setViewMode('list')}
            className={`pb-3 px-4 font-medium ${viewMode === 'list' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('todo-table')}
            className={`pb-3 px-4 font-medium ${viewMode === 'todo-table' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
          >
            <FaTable className="inline mr-1" /> 
            Todo Table
          </button>
          <button
            onClick={() => setViewMode('calendar-table')}
            className={`pb-3 px-4 font-medium ${viewMode === 'calendar-table' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
          >
            <FaCalendarAlt className="inline mr-1" /> 
            Calendar Events
          </button>
        </div>
      </motion.div>
      
      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        /* Todo List View */
        filteredTodos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <div className="bg-background-light p-8 rounded-lg inline-block">
              <FaCheck className="text-4xl text-primary mx-auto mb-3 opacity-50" />
              <h3 className="text-xl font-medium text-text-primary mb-2">
                {searchQuery
                  ? "No tasks match your search"
                  : filter === "completed"
                  ? "No completed tasks yet"
                  : filter === "active"
                  ? "No active tasks"
                  : "No tasks yet"}
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                {searchQuery
                  ? "Try a different search term"
                  : "Click the 'Add Task' button to create your first task"}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4"
          >
            <AnimatePresence>
              {filteredTodos.map(todo => (
                <motion.div
                  key={todo.id}
                  variants={itemVariants}
                  layout
                  exit="exit"
                  className={`bg-background-light rounded-lg p-4 flex items-center ${todo.status === 'completed' ? 'opacity-60' : ''}`}
                >
                  <div className="flex-shrink-0 mr-4">
                    <div className="relative inline-block w-32">
                      <select
                        value={todo.status}
                        onChange={(e) => handleStatusChange(todo.id, e.target.value)}
                        className="appearance-none w-full px-3 py-1.5 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                        style={{
                          backgroundColor: todo.status === 'not-started' ? '#f3f4f6' : 
                                         todo.status === 'in-progress' ? '#dbeafe' : 
                                         '#d1fae5',
                          color: todo.status === 'not-started' ? '#374151' : 
                                todo.status === 'in-progress' ? '#1e40af' : 
                                '#047857',
                          paddingRight: '2rem'
                        }}
                      >
                        <option value="not-started" className="bg-background-dark">Not Started</option>
                        <option value="in-progress" className="bg-background-dark">In Progress</option>
                        <option value="completed" className="bg-background-dark">Completed</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-text-primary truncate ${todo.status === 'completed' ? 'line-through' : ''}`}>
                      {todo.title}
                    </h3>
                    
                    {todo.description && (
                      <div className="text-text-secondary text-sm mt-1 bg-background p-2 rounded max-h-24 overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: todo.description.replace(/\n/g, '<br />') }} />
                      </div>
                    )}
                    
                    <div className="flex items-center mt-2 text-xs">
                      {todo.dueDate && (
                        <div className="flex items-center text-text-muted mr-3">
                          <FaCalendarAlt className="mr-1" />
                          <span>{format(new Date(todo.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      
                      {todo.status === 'completed' && todo.completedAt && (
                        <div className="flex items-center text-green-500">
                          <FaCheck className="mr-1" />
                          <span>Completed on {format(new Date(todo.completedAt), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center ml-4 gap-2">
                    <button
                      onClick={() => handleEditTodo(todo)}
                      className="p-2 text-text-secondary hover:text-primary rounded-full hover:bg-background transition-colors"
                    >
                      <FaEdit />
                    </button>
                    
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-2 text-text-secondary hover:text-accent rounded-full hover:bg-background transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )
      ) : viewMode === 'todo-table' ? (
        /* Todo Table View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden bg-background-light rounded-lg"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-background">
              <thead className="bg-background-dark">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Task
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Completed On
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background-light divide-y divide-background">
                {filteredTodos.length > 0 ? (
                  filteredTodos.map((todo, index) => {
                    const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
                    const isPastDue = dueDate && dueDate < new Date() && todo.status !== 'completed';
                    const isToday = dueDate && format(dueDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    
                    return (
                      <tr 
                        key={todo.id}
                        className={`${index % 2 === 0 ? 'bg-background-light' : 'bg-background'} 
                          hover:bg-background-dark transition-colors
                          ${isPastDue ? 'border-l-4 border-accent' : ''}
                          ${isToday ? 'border-l-4 border-primary' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          <div className="flex items-center">
                            <span className={todo.status === 'completed' ? 'line-through opacity-60' : ''}>
                              {todo.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <select
                            value={todo.status}
                            onChange={(e) => handleStatusChange(todo.id, e.target.value)}
                            className={`
                              px-2 py-1 rounded text-xs font-medium
                              ${todo.status === 'not-started' ? 'bg-gray-200 text-gray-700' : 
                                todo.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 
                                  'bg-green-100 text-green-700'}
                            `}
                          >
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {todo.dueDate ? 
                            <span className={isPastDue ? 'text-accent' : ''}>
                              {format(new Date(todo.dueDate), 'MMM d, yyyy')}
                              {isToday && <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">Today</span>}
                            </span> 
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">
                          {todo.completedAt ? format(new Date(todo.completedAt), 'MMM d, yyyy') : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary max-w-md truncate">
                          {todo.description ? todo.description.replace(/<[^>]*>?/gm, '') : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditTodo(todo)}
                              className="p-1.5 text-text-secondary hover:text-primary rounded-full hover:bg-background transition-colors"
                            >
                              <FaEdit />
                            </button>
                            
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="p-1.5 text-text-secondary hover:text-accent rounded-full hover:bg-background transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-text-muted">
                      No matching tasks found. Add a new task to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        /* Calendar Events Table */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden bg-background-light rounded-lg"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-background">
              <thead className="bg-background-dark">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Event
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Reminder
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background-light divide-y divide-background">
                {sortedEventDates.length > 0 ? (
                  sortedEventDates.map(dateStr => {
                    const formattedDate = format(new Date(dateStr), 'EEE, MMM d, yyyy');
                    const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
                    
                    return groupedEvents[dateStr].map((event, index) => {
                      const eventDate = new Date(event.date);
                      const isPast = eventDate < new Date() && !event.completed;
                      
                      return (
                        <tr 
                          key={event.id} 
                          className={`
                            ${index % 2 === 0 ? 'bg-background-light' : 'bg-background'} 
                            hover:bg-background-dark transition-colors 
                            ${isToday ? 'border-l-4 border-primary' : ''}
                            ${event.completed ? 'opacity-60' : ''}
                            ${isPast && !event.completed ? 'border-l-4 border-accent' : ''}
                          `}
                        >
                          {index === 0 && (
                            <td 
                              rowSpan={groupedEvents[dateStr].length} 
                              className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isToday ? 'text-primary' : 'text-text-secondary'}`}
                            >
                              {formattedDate}
                              {isToday && <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">Today</span>}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-lg bg-primary bg-opacity-20 flex items-center justify-center mr-3">
                                <img 
                                  src={`/assets/photo${event.imageIndex || 1}.png`}
                                  alt={event.title}
                                  className="w-4 h-4 object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `/assets/photo1.png`;
                                  }}
                                />
                              </div>
                              <span className={event.completed ? 'line-through' : ''}>
                                {event.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {format(eventDate, 'h:mm a')}
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary max-w-md truncate">
                            {event.description || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">
                            {event.reminder ? 
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary bg-opacity-20 text-primary">
                                {event.reminder} min before
                              </span> : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">
                            <div className="flex items-center">
                              <button
                                onClick={() => toggleEventCompletion(event.id)}
                                className={`
                                  px-2 py-1 rounded text-xs font-medium
                                  ${event.completed 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                                `}
                              >
                                {event.completed ? (
                                  <>
                                    <FaCheck className="inline mr-1" />
                                    Completed {event.completedAt ? `on ${format(new Date(event.completedAt), 'MMM d')}` : ''}
                                  </>
                                ) : 'Mark as Done'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-text-muted">
                      No calendar events found. Add events to your calendar to see them here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      
      {/* Add/Edit Todo Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode ? "Edit Task" : "Add New Task"}
      >
        <form onSubmit={handleSaveTodo}>
          <Input
            ref={titleRef}
            label="Title"
            placeholder="Task title"
            defaultValue={currentTodo?.title || ''}
            required
            autoFocus
          />
          
          <div className="mb-4">
            <label className="block text-text-primary mb-2 font-medium">
              Description (optional)
            </label>
            <div className="border rounded-lg border-background-light bg-background-dark overflow-hidden">
              <div className="border-b border-background-light p-2 flex space-x-2">
                <button type="button" className="p-1.5 hover:bg-background rounded" title="Bold">
                  <FaBold className="text-text-secondary" />
                </button>
                <button type="button" className="p-1.5 hover:bg-background rounded" title="Italic">
                  <FaItalic className="text-text-secondary" />
                </button>
                <button type="button" className="p-1.5 hover:bg-background rounded" title="Underline">
                  <FaUnderline className="text-text-secondary" />
                </button>
                <div className="h-6 w-px bg-background-light mx-1"></div>
                <button type="button" className="p-1.5 hover:bg-background rounded" title="Link">
                  <FaLink className="text-text-secondary" />
                </button>
                <div className="h-6 w-px bg-background-light mx-1"></div>
                <button type="button" className="p-1.5 hover:bg-background rounded" title="Bullet List">
                  <FaListUl className="text-text-secondary" />
                </button>
                <button type="button" className="p-1.5 hover:bg-background rounded" title="Numbered List">
                  <FaListOl className="text-text-secondary" />
                </button>
              </div>
              <textarea
                ref={descriptionRef}
                className="w-full p-4 bg-background-dark text-text-primary min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add rich details about your task here..."
                defaultValue={currentTodo?.description || ''}
              ></textarea>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Tip: Use Shift+Enter for new lines. Format text with the toolbar or markdown syntax.
            </p>
          </div>
          
          <Input
            ref={dateRef}
            type="date"
            label="Due Date (optional)"
            defaultValue={currentTodo?.dueDate ? format(new Date(currentTodo.dueDate), 'yyyy-MM-dd') : ''}
          />
          
          <div className="mb-4">
            <label className="block text-text-primary mb-2 font-medium">
              Status
            </label>
            <div className="relative">
              <select
                ref={statusRef}
                className="appearance-none w-full px-4 py-2 bg-background-dark border border-background-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue={currentTodo?.status || 'not-started'}
                style={{ paddingRight: '2.5rem' }}
              >
                <option value="not-started" className="bg-background-dark py-2">Not Started</option>
                <option value="in-progress" className="bg-background-dark py-2">In Progress</option>
                <option value="completed" className="bg-background-dark py-2">Completed</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            
            <Button type="submit">
              {editMode ? "Update Task" : "Add Task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TodoPage;