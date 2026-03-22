import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log the error - keep minimal to avoid exposing sensitive data
    // eslint-disable-next-line no-console
    console.error('Captured error in ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // Render minimal fallback to avoid interfering with dev overlay internals
      return (
        <div style={{ padding: 20 }}>
          <h2>Something went wrong.</h2>
          <p>Please check the console for details.</p>
        </div>
      );
    }

    return this.props.children as JSX.Element;
  }
}
