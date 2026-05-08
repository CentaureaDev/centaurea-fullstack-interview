import { Component } from 'react';
import Button from './Button';
import Section from './Section';
import SectionHeader from './SectionHeader';
import StatusMessage from './StatusMessage';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('Unhandled render error:', error);
  }

  handleTryAgain = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Section>
          <SectionHeader title="Something went wrong" />
          <StatusMessage variant="error">
            An unexpected UI error occurred. Please try again.
          </StatusMessage>
          <Button type="button" onClick={this.handleTryAgain}>
            Try Again
          </Button>
        </Section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
