"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Loader2, Save, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Schema Validasi
const formSchema = z.object({
  title: z.string().min(1, "Nama target wajib diisi"),
  targetAmount: z.string().min(1, "Target jumlah wajib diisi").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Jumlah harus berupa angka positif"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  deadline: z.string().min(1, "Tenggat waktu wajib diisi"),
  notes: z.string().optional(),
});

// Helper untuk style kategori
const getCategoryStyle = (category: string) => {
  const styles: Record<string, { emoji: string; color: string; barColor: string }> = {
    "Keamanan": { emoji: "🛡️", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", barColor: "bg-emerald-500" },
    "Lifestyle": { emoji: "✈️", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", barColor: "bg-blue-500" },
    "Produktivitas": { emoji: "💻", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", barColor: "bg-purple-500" },
    "Properti": { emoji: "🏠", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", barColor: "bg-orange-500" },
    "Kendaraan": { emoji: "🚗", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", barColor: "bg-red-500" },
  };
  
  return styles[category] || { 
    emoji: "🎯", 
    color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", 
    barColor: "bg-gray-500" 
  };
};

export default function NewGoalPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      targetAmount: "",
      category: "",
      deadline: "",
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User tidak ditemukan. Silakan login kembali.");
      }

      const style = getCategoryStyle(values.category);

      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        title: values.title,
        target_amount: Number(values.targetAmount),
        current_amount: 0,
        category: values.category,
        deadline: values.deadline,
        notes: values.notes || "",
        emoji: style.emoji,
        color: style.color,
        bar_color: style.barColor
      });
      
      if (error) throw error;

      router.push("/goals");
    } catch (error) {
      console.error("Error adding goal: ", error);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-muted/30 min-h-screen font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="-ml-2 rounded-full"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" strokeWidth={1.5} />
        </Button>
        <h1 className="text-lg font-bold text-foreground">Buat Target Baru</h1>
      </header>

      <main className="flex-1 p-4 pb-10">
        <div className="max-w-md mx-auto space-y-6">
          <Card className="border-border/50 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Nama Target */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Target</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Liburan ke Bali" {...field} className="rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Target Jumlah */}
                  <FormField
                    control={form.control}
                    name="targetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Jumlah (Rp)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              className="pl-10 rounded-xl" 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Total uang yang ingin dikumpulkan.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Kategori */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Keamanan">🛡️ Keamanan (Dana Darurat)</SelectItem>
                            <SelectItem value="Lifestyle">✈️ Lifestyle (Liburan, Hobi)</SelectItem>
                            <SelectItem value="Produktivitas">💻 Produktivitas (Gadget, Kursus)</SelectItem>
                            <SelectItem value="Properti">🏠 Properti (Rumah, Renovasi)</SelectItem>
                            <SelectItem value="Kendaraan">🚗 Kendaraan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tenggat Waktu */}
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tenggat Waktu</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="rounded-xl block w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Catatan (Opsional) */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan (Opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Keterangan tambahan..." {...field} className="rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button type="submit" className="w-full rounded-xl h-12 text-base font-bold shadow-lg shadow-primary/20" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Simpan Target
                        </>
                      )}
                    </Button>
                  </div>

                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}