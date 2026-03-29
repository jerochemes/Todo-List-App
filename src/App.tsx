/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Search, 
  Calendar,
  MoreVertical,
  Edit2,
  X,
  Check
} from "lucide-react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type FilterType = "all" | "active" | "completed";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load tasks from local storage
  useEffect(() => {
    const savedTasks = localStorage.getItem("taskflow_tasks");
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save tasks to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setInputValue("");
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = () => {
    if (!editText.trim() || !editingId) return;
    setTasks(tasks.map(task => 
      task.id === editingId ? { ...task, text: editText.trim() } : task
    ));
    setEditingId(null);
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filter === "active") return !task.completed;
      if (filter === "completed") return task.completed;
      return true;
    })
    .filter(task => 
      task.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-blue-100">
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-2"
          >
            <h1 className="text-4xl font-bold tracking-tight">TaskFlow</h1>
            <div className="text-sm font-medium text-[#86868B] flex items-center gap-2">
              <Calendar size={14} />
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#86868B]"
          >
            Organiza tu día con simplicidad.
          </motion.p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "bg-white" },
            { label: "Pendientes", value: stats.active, color: "bg-white" },
            { label: "Completadas", value: stats.completed, color: "bg-white" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className={`${stat.color} p-4 rounded-2xl shadow-sm border border-black/5 flex flex-col items-center justify-center`}
            >
              <span className="text-2xl font-semibold mb-1">{stat.value}</span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#86868B]">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={addTask}
          className="relative mb-8"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="¿Qué necesitas hacer hoy?"
            className="w-full bg-white border border-black/5 rounded-2xl px-6 py-5 pr-16 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-lg"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#1D1D1F] text-white rounded-xl flex items-center justify-center hover:bg-black disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <Plus size={20} />
          </button>
        </motion.form>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex bg-white p-1 rounded-xl border border-black/5 shadow-sm w-full md:w-auto">
            {(["all", "active", "completed"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === f 
                    ? "bg-[#1D1D1F] text-white shadow-md" 
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                {f === "all" ? "Todas" : f === "active" ? "Activas" : "Hechas"}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -20 }}
                  className={`group bg-white rounded-2xl p-4 border border-black/5 shadow-sm flex items-center gap-4 transition-all ${
                    task.completed ? "opacity-60" : ""
                  }`}
                >
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`shrink-0 transition-colors ${
                      task.completed ? "text-green-500" : "text-[#86868B] hover:text-[#1D1D1F]"
                    }`}
                  >
                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    {editingId === task.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-full bg-[#F5F5F7] border-none rounded-lg px-3 py-1 text-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                        />
                        <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded-lg">
                          <Check size={18} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded-lg">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <p className={`text-lg truncate transition-all ${
                        task.completed ? "line-through text-[#86868B]" : ""
                      }`}>
                        {task.text}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEditing(task)}
                      className="p-2 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-[#86868B] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-black/5 shadow-sm">
                  <CheckCircle2 size={32} className="text-[#86868B]" />
                </div>
                <h3 className="text-lg font-medium">No hay tareas</h3>
                <p className="text-[#86868B] text-sm">Todo está bajo control.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-black/5 text-center">
          <p className="text-xs text-[#86868B] font-medium uppercase tracking-widest">
            TaskFlow &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
