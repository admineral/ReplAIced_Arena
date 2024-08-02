'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '@/firebase-config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { signInWithPopup, GithubAuthProvider, User } from 'firebase/auth';

interface Todo {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'started' | 'in-progress' | 'completed';
  importance: 'low' | 'medium' | 'high';
  addedBy: string;
  createdAt: Timestamp;
}

const columns = ['todo', 'started', 'in-progress', 'completed'];
const importanceLevels = ['low', 'medium', 'high'];

export default function TodoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Todo['status']>('todo');
  const [importance, setImportance] = useState<Todo['importance']>('medium');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "todo"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todoList: Todo[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Todo));
      setTodos(todoList);
    });

    return () => unsubscribe();
  }, []);

  const handleGitHubSignIn = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setIsLoginModalOpen(false);
      if (todoToDelete) {
        await deleteTodo(todoToDelete);
        setTodoToDelete(null);
      }
    } catch (error) {
      console.error('GitHub sign in error:', error);
    }
  };

  const addOrUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTodo) {
        await updateDoc(doc(db, "todo", editingTodo.id), {
          title,
          description,
          status,
          importance,
          updatedAt: Timestamp.now(),
        });
        setIsModalOpen(false);
      } else {
        await addDoc(collection(db, "todo"), {
          title,
          description,
          status,
          importance,
          addedBy: user?.displayName || user?.email || 'Anonymous',
          createdAt: Timestamp.now(),
        });
      }
      resetForm();
    } catch (err) {
      console.error("Error adding/updating document: ", err);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!user) {
      setTodoToDelete(id);
      setIsLoginModalOpen(true);
      return;
    }
    try {
      await deleteDoc(doc(db, "todo", id));
    } catch (err) {
      console.error("Error deleting document: ", err);
    }
  };

  const updateTodoStatus = async (todo: Todo, newStatus: Todo['status']) => {
    try {
      await updateDoc(doc(db, "todo", todo.id), { 
        status: newStatus,
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      console.error("Error updating todo status: ", err);
    }
  };

  const onDragStart = (e: React.DragEvent, todoId: string) => {
    e.dataTransfer.setData('todoId', todoId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent, status: Todo['status']) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData('todoId');
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      await updateTodoStatus(todo, status);
    }
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDescription(todo.description);
    setStatus(todo.status);
    setImportance(todo.importance);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('todo');
    setImportance('medium');
    setEditingTodo(null);
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Todo Board</h1>

        <form onSubmit={addOrUpdateTodo} className="mb-12 bg-gray-900 p-6 rounded-xl shadow-sm">
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Todo['status'])}
                  className="appearance-none w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white pr-8"
                >
                  {columns.map(col => (
                    <option key={col} value={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              <div className="relative">
                <select
                  value={importance}
                  onChange={(e) => setImportance(e.target.value as Todo['importance'])}
                  className="appearance-none w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white pr-8"
                >
                  {importanceLevels.map(level => (
                    <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            >
              {editingTodo ? 'Update Todo' : 'Add Todo'}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <div 
              key={column} 
              className="bg-gray-900 p-6 rounded-xl shadow-sm"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, column as Todo['status'])}
            >
              <h2 className="text-lg font-semibold mb-4 text-white">{column.charAt(0).toUpperCase() + column.slice(1)}</h2>
              <div className="space-y-4">
                {todos.filter(todo => todo.status === column).map((todo) => (
                  <div 
                    key={todo.id} 
                    className="bg-gray-800 p-4 rounded-lg border border-gray-700 cursor-move"
                    draggable
                    onDragStart={(e) => onDragStart(e, todo.id)}
                  >
                    <h3 className="font-medium text-white">{todo.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{todo.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        todo.importance === 'high' ? 'bg-red-900 text-red-200' :
                        todo.importance === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-green-900 text-green-200'
                      }`}>
                        {todo.importance}
                      </span>
                      <span className="text-xs text-gray-500">{todo.addedBy}</span>
                    </div>
                    <div className="mt-3 flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(todo)}
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Todo</h2>
            <form onSubmit={addOrUpdateTodo} className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Todo['status'])}
                    className="appearance-none w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white pr-8"
                  >
                    {columns.map(col => (
                      <option key={col} value={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={importance}
                    onChange={(e) => setImportance(e.target.value as Todo['importance'])}
                    className="appearance-none w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white pr-8"
                  >
                    {importanceLevels.map(level => (
                      <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                >
                  Update Todo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Login Required</h2>
            <p className="mb-4">You need to be logged in to delete a task.</p>
            <button
              onClick={handleGitHubSignIn}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
            >
              Sign in with GitHub
            </button>
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                setTodoToDelete(null);
              }}
              className="w-full mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}