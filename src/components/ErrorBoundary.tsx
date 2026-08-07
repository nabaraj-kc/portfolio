"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Global Error Boundary] Caught exception:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] w-full flex flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 my-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-3">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold mb-1">
            {this.props.fallbackTitle || "Something went wrong in this component"}
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mb-4 leading-relaxed">
            An unexpected error occurred. The application remains operational and technical details have been logged.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer border border-zinc-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
