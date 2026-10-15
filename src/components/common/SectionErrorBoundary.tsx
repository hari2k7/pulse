import { Component, type ReactNode, type ErrorInfo } from 'react';

export interface SectionErrorBoundaryProps {
  children: ReactNode;
  sectionName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Isolated Section Error Boundary
 * Wraps optional and atmospheric components (hero effects, countdown,
 * featured row, prize pool, lightbox, related row, cursor, back-to-top).
 *
 * Fallback is strictly "render nothing" (null) and logs nothing in production.
 * A crash in one isolated section never affects another section or route.
 */
export class SectionErrorBoundary extends Component<SectionErrorBoundaryProps, State> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.warn(
        `[SectionErrorBoundary:${this.props.sectionName || 'anonymous'}] caught error:`,
        error,
        errorInfo
      );
    }
    // In production: log nothing per PROJECT.md Section 7 & Task 2
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
