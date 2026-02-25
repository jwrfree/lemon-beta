"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { 
  Plus, 
  MoreVertical, 
  Calendar, 
  Wallet,
  ChevronRight,
  CheckCircle,
  Trophy
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FAB } from "@/components/ui/fab";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";

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
// Tipe data Goal
interface Goal {
  id: string;
  title: string;
  emoji: string;
  currentAmount: number;
  targetAmount: number;
  deadline: string;
  category: string;
  color: string;
  barColor: string;
}

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'completed'>('active');
  const [isMounted, setIsMounted] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    
    const fetchGoals = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

interface GoalRow {
  id: string;
  title: string;
  emoji: string;
  current_amount: number;
  target_amount: number;
  deadline: string;
  category: string;
  color: string;
  bar_color: string;
}

// ... in useEffect ...
        if (data) {
          // Mapping snake_case dari DB ke camelCase untuk UI
          const goalsData: Goal[] = (data as GoalRow[]).map((doc) => ({
            id: doc.id,
            title: doc.title,
            emoji: doc.emoji,
            currentAmount: doc.current_amount,
            targetAmount: doc.target_amount,
            deadline: doc.deadline,
            category: doc.category,
            color: doc.color,
            barColor: doc.bar_color
          }));
          setGoals(goalsData);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchGoals();

    // Realtime Subscription
    const channel = supabase
      .channel('goals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
        fetchGoals();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Kalkulasi ringkasan
  const totalSavings = goals.reduce((acc, goal) => acc + goal.currentAmount, 0);
  const totalTarget = goals.reduce((acc, goal) => acc + goal.targetAmount, 0);
  const totalProgress = calculateProgress(totalSavings, totalTarget);

  return (
    <div className="flex flex-col h-full min-h-screen font-sans relative">
      <PageHeader 
        title="Target Keuangan" 
        extraActions={
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="w-5 h-5 md:h-6 md:w-6 text-muted-foreground" strokeWidth={1.75} />
          </Button>
        }
      />

      <main className="flex-1 p-4 md:p-8 space-y-8 pb-24 max-w-7xl mx-auto w-full">
        {/* Summary Card - Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg p-6 md:p-8 text-white shadow-lg shadow-teal-900/20 relative overflow-hidden"
          >
            {/* Elemen Dekoratif */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/10 rounded-full -ml-20 -mb-20 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 opacity-90">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Wallet className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium tracking-widest uppercase">Total Tabungan Terkumpul</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
                  {formatCurrency(totalSavings)}
                </h2>

                <div className="flex items-center gap-4 text-sm font-medium text-teal-50">
                   <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-yellow-300" />
                      <span>{goals.length} Target</span>
                   </div>
                   <div className="w-1 h-1 bg-white/30 rounded-full" />
                   <span>Target Terdekat: Des 2025</span>
                </div>
              </div>
              
              <div className="w-full md:w-64 space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="opacity-90 tracking-wide">Progres Keseluruhan</span>
                  <span className="text-yellow-300">{totalProgress}%</span>
                </div>
                <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${totalProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-teal-100/70 text-center italic">
                  Tersisa {formatCurrency(totalTarget - totalSavings)} lagi untuk mencapai semua target
                </p>
              </div>
            </div>
          </motion.div>

          {/* Desktop Quick Info/Motivation Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="hidden lg:flex flex-col justify-center bg-card border border-border/50 rounded-lg p-6 shadow-card"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-lg">Semangat Menabung!</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Kamu telah mengumpulkan <strong>{totalProgress}%</strong> dari total targetmu. Sedikit lagi menuju impian!
                </p>
              </div>
              <Button variant="outline" className="w-full rounded-lg border-dashed" onClick={() => router.push('/goals/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Target Baru
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Goals List Section */}
        <Tabs defaultValue="active" value={filter} onValueChange={(v) => setFilter(v as 'active' | 'completed')} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-medium tracking-tight">Daftar Target</h3>
              <p className="text-sm text-muted-foreground">Kelola dan pantau progres setiap target keuanganmu</p>
            </div>
            
            <TabsList className="bg-muted p-1 rounded-lg h-14 w-full md:w-[320px] grid grid-cols-2">
              <TabsTrigger value="active" className="h-full rounded-md font-medium text-xs uppercase tracking-wider transition-all data-[state=active]:bg-background data-[state=active]:text-foreground">
                Aktif
              </TabsTrigger>
              <TabsTrigger value="completed" className="h-full rounded-md font-medium text-xs uppercase tracking-wider transition-all data-[state=active]:bg-background data-[state=active]:text-foreground">
                Selesai
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {loading ? (
                 // Skeleton Loading State
                 Array.from({ length: 3 }).map((_, i) => (
                   <div key={i} className="h-48 rounded-lg bg-muted/50 animate-pulse" />
                 ))
              ) : goals.filter(g => g.currentAmount < g.targetAmount).length > 0 ? (
                goals.filter(g => g.currentAmount < g.targetAmount).map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.28, ease: "easeOut" }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="group hover:bg-card hover:shadow-card hover:border-primary/20 border-border/50 rounded-lg shadow-card transition-all cursor-pointer relative overflow-hidden h-full">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-3xl shadow-inner shrink-0 ${goal.color}`}>
                          {goal.emoji}
                        </div>
                        <Badge variant="secondary" className="text-xs px-2 py-1 rounded-md uppercase tracking-widest font-medium bg-muted/50">
                          {goal.category}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-lg text-foreground truncate">{goal.title}</h4>
                          <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Terkumpul</span>
                              <span className="font-medium text-lg text-primary">{formatCurrency(goal.currentAmount)}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Target</span>
                              <span className="font-medium text-sm">{formatCurrency(goal.targetAmount)}</span>
                            </div>
                          </div>
                          
                          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${calculateProgress(goal.currentAmount, goal.targetAmount)}%` }}
                              transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                              className={`absolute inset-y-0 left-0 rounded-full ${goal.barColor}`}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-xs font-medium text-foreground/50 uppercase tracking-tighter">
                                 {calculateProgress(goal.currentAmount, goal.targetAmount)}%
                               </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 text-primary/60" strokeWidth={2} />
                            <span>
                              {isMounted 
                                ? new Date(goal.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                : goal.deadline
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-muted-foreground/50" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-foreground">Tidak ada target aktif</h3>
                    <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                      Semua targetmu sudah tercapai? Hebat! Buat target baru yuk.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {goals.filter(g => g.currentAmount >= g.targetAmount).length > 0 ? (
                goals.filter(g => g.currentAmount >= g.targetAmount).map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.28, ease: "easeOut" }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="group hover:bg-card hover:shadow-card hover:border-primary/20 border-border/50 rounded-lg shadow-card transition-all cursor-pointer relative overflow-hidden h-full">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-3xl shadow-inner shrink-0 ${goal.color}`}>
                          {goal.emoji}
                        </div>
                        <Badge variant="secondary" className="text-xs px-2 py-1 rounded-lg uppercase tracking-widest font-medium bg-muted/50">
                          {goal.category}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-lg text-foreground truncate">{goal.title}</h4>
                          <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Terkumpul</span>
                              <span className="font-medium text-lg text-primary">{formatCurrency(goal.currentAmount)}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Target</span>
                              <span className="font-medium text-sm">{formatCurrency(goal.targetAmount)}</span>
                            </div>
                          </div>
                          
                          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                            <div className={`absolute inset-0 rounded-full ${goal.barColor}`} />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-xs font-medium text-white uppercase tracking-tighter">
                                 100%
                               </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 text-primary/60" strokeWidth={2} />
                            <span>
                              {isMounted 
                                ? `Selesai pada ${new Date(goal.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                : `Selesai pada ${goal.deadline}`
                              }
                            </span>
                          </div>
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs h-5">
                            Selesai
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-yellow-500/50" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-foreground">Belum ada target tercapai</h3>
                    <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                      Terus menabung untuk mencapai target impianmu!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Button (FAB) */}
      <FAB onClick={() => router.push('/goals/new')} label="Buat target baru" mobileOnly={false} />
    </div>
  );
}
