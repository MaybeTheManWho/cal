import React, { createContext, useState, useEffect } from 'react';
import { format } from 'date-fns';

export const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar_events');
    const savedTodos = localStorage.getItem('todos');
    
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (error) {
        console.error('Error parsing saved events:', error);
        setEvents([]);
      }
    }
    
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error('Error parsing saved todos:', error);
        setTodos([]);
      }
    }
    
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever events or todos change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('calendar_events', JSON.stringify(events));
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [events, todos, isLoading]);

  // Event methods
  const addEvent = (event) => {
    const newEvent = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      reminder: event.reminder || null,
      completed: false,
      completedAt: null,
      ...event
    };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const updateEvent = (id, updates) => {
    setEvents(prev => 
      prev.map(event => {
        if (event.id === id) {
          // If marking as completed, add completedAt timestamp
          if (updates.completed === true && !event.completed) {
            updates.completedAt = new Date().toISOString();
          }
          // If marking as not completed, remove completedAt
          else if (updates.completed === false && event.completed) {
            updates.completedAt = null;
          }
          return { ...event, ...updates };
        }
        return event;
      })
    );
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const getEventsByDate = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return events.filter(event => {
      const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
      return eventDate === formattedDate;
    });
  };

  // Todo methods
  const addTodo = (todo) => {
    const newTodo = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
      status: todo.status || 'not-started', // not-started, in-progress, completed
      completedAt: null,
      ...todo
    };
    setTodos(prev => [...prev, newTodo]);
    return newTodo;
  };

  const updateTodo = (id, updates) => {
    setTodos(prev => 
      prev.map(todo => {
        if (todo.id === id) {
          // If status is being changed to completed, add completedAt timestamp
          if (updates.status === 'completed' && todo.status !== 'completed') {
            updates.completedAt = new Date().toISOString();
            updates.completed = true;
          }
          // If status is being changed from completed, remove completedAt
          else if (updates.status && updates.status !== 'completed' && todo.status === 'completed') {
            updates.completedAt = null;
            updates.completed = false;
          }
          return { ...todo, ...updates };
        }
        return todo;
      })
    );
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const toggleTodoComplete = (id) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <CalendarContext.Provider value={{ 
      events, 
      todos,
      addEvent,
      updateEvent,
      deleteEvent,
      getEventsByDate,
      addTodo,
      updateTodo,
      deleteTodo,
      toggleTodoComplete
    }}>
      {children}
    </CalendarContext.Provider>
  );
};