'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error in widget:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="h-full min-h-[150px] border-destructive/30 bg-destructive/5 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3">
                        <div className="p-2 bg-destructive/10 rounded-full">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium text-destructive">Gagal memuat widget</h3>
                            <p className="text-xs text-muted-foreground max-w-[200px]">
                                Terjadi kesalahan saat menampilkan data ini.
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={this.handleRetry}
                            className="h-7 text-xs border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        >
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Coba Lagi
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}