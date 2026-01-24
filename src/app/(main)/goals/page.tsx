"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Plus, 
  MoreVertical, 
  Calendar, 
  Wallet,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";

// Helper untuk format mata uang IDR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper untuk menghitung persentase
const calculateProgress = (current: number, target: number) => {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

// Mock data (simulasi data dari database)
const initialGoals = [
  {
    id: "1",
    title: "Dana Darurat",
    emoji: "🛡️",
    currentAmount: 15000000,
    targetAmount: 30000000,
    deadline: "2025-12-31",
    category: "Keamanan",
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    barColor: "bg-emerald-500"
  },
  {
    id: "2",
    title: "Liburan ke Jepang",
    emoji: "✈️",
    currentAmount: 5000000,
    targetAmount: 25000000,
    deadline: "2026-06-15",
    category: "Lifestyle",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    barColor: "bg-blue-500"
  },
  {
    id: "3",
    title: "Upgrade Laptop",
    emoji: "💻",
    currentAmount: 2000000,
    targetAmount: 30000000,
    deadline: "2025-09-01",
    category: "Produktivitas",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    barColor: "bg-purple-500"
  }
];

export default function GoalsPage() {
  const router = useRouter();
  const [goals] = useState(initialGoals);

  // Kalkulasi ringkasan
  const totalSavings = goals.reduce((acc, goal) => acc + goal.currentAmount, 0);
  const totalTarget = goals.reduce((acc, goal) => acc + goal.targetAmount, 0);
  const totalProgress = calculateProgress(totalSavings, totalTarget);

  return (
    <div className="flex flex-col h-full bg-muted/30 min-h-screen font-sans">
      {/* Header Sticky */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors active:scale-95"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
          <ArrowLeft className="w-6 h-6 text-foreground" strokeWidth={1.5} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Target Keuangan</h1>
        <div className="ml-auto">
          <button className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
            <MoreVertical className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6 pb-28">
        {/* Summary Card - Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg shadow-teal-900/20 relative overflow-hidden"
        >
          {/* Elemen Dekoratif */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full -ml-10 -mb-10 blur-xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Wallet className="w-4 h-4 text-white" />
                <Wallet className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium tracking-wide">Total Tabungan</span>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight mb-5">
              {formatCurrency(totalSavings)}
            </h2>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium opacity-90">
                <span>Progres Keseluruhan</span>
                <span>{totalProgress}%</span>
              </div>
              <div className="h-2.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${totalProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="h-full bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                  className="h-full bg-yellow-300 rounded-full shadow-[0_0_10px_rgba(253,224,71,0.5)]"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Goals List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Daftar Target</h3>
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
              {goals.length} Aktif
            </span>
          </div>

          <div className="grid gap-4">
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                whileTap={{ scale: 0.98 }}
                className="group bg-card hover:bg-card/80 border border-border/50 rounded-2xl p-4 shadow-sm transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  {/* Icon Container */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${goal.color}`}>
                    {goal.emoji}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Title & Category */}
                    <div className="flex justify-between items-start mb-1">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-foreground truncate pr-2 text-base">{goal.title}</h4>
                        <span className="inline-block text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md uppercase tracking-wide">
                          {goal.category}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                      <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                    </div>

                    {/* Progress Section */}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-sm text-foreground">{formatCurrency(goal.currentAmount)}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">Target: {formatCurrency(goal.targetAmount)}</span>
                      </div>
                      
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${calculateProgress(goal.currentAmount, goal.targetAmount)}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + (index * 0.1) }}
                          className={`h-full rounded-full ${goal.barColor}`}
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        <Calendar className="w-3 h-3" strokeWidth={1.5} />
                        <span>Tenggat: {new Date(goal.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3.5 rounded-full shadow-xl shadow-primary/30 font-bold tracking-wide"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          <Plus className="w-5 h-5" strokeWidth={2} />
          <span>Buat Target</span>
        </motion.button>
      </div>
    </div>
  );
}