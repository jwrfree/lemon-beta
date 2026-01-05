
'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Wrench, Mail, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUI } from '@/components/ui-provider';

const CategoryPlaceholderIllustration = () => (
    <div className="relative w-40 h-40 flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
        <div className="relative w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center">
            <Wrench className="h-16 w-16 text-primary" strokeWidth={1} />
        </div>
    </div>
);

export default function CategoriesPage() {
    const router = useRouter();
    const { showToast } = useUI();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
        if (email) {
            showToast("Terima kasih! Kami akan memberi tahu Anda.", 'success');
        } else {
            showToast("Harap masukkan alamat email Anda.", 'error');
        }
    };
    
    return (
        <div className="h-full bg-muted flex flex-col">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4"
                    onClick={() => router.back()}
                    aria-label="Kembali"
                >
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                    <span className="sr-only">Kembali</span>
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Kelola Kategori</h1>
            </header>
            <main className="flex justify-center p-8 text-center pt-16">
                <div className="flex flex-col items-center">
                    <CategoryPlaceholderIllustration />
                    <h2 className="text-2xl font-bold mt-6">Kustomisasi Kategori Akan Segera Hadir</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                        Anda akan dapat menambah, mengubah, dan menyusun ulang kategori agar sesuai dengan gaya hidup finansial Anda.
                    </p>
                    <form className="mt-8 w-full max-w-sm" onSubmit={handleSubmit}>
                        <p className="text-sm font-medium mb-2">Dapatkan notifikasi saat fitur ini siap!</p>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input name="email" type="email" placeholder="email@example.com" className="pl-10 pr-10" />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
                                aria-label="Kirim email pemberitahuan"
                            >
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Kirim</span>
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};
