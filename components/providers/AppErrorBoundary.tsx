import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * Last-resort UI when a render throws. Prevents a blank white screen for customers.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error('[AppErrorBoundary]', error, info.componentStack);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          backgroundColor: '#F8FAFC',
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A', textAlign: 'center' }}>
          Something went wrong
        </Text>
        <Text style={{ marginTop: 8, fontSize: 15, lineHeight: 22, color: '#475569', textAlign: 'center' }}>
          Please try again. If this keeps happening, contact SiamEZ support.
        </Text>
        <Pressable
          onPress={this.handleRetry}
          accessibilityRole="button"
          accessibilityLabel="Try again"
          style={{
            marginTop: 20,
            backgroundColor: '#2C54C6',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
