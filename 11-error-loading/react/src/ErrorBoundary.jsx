import React from 'react';

/**
 * 수동 ErrorBoundary (클래스 컴포넌트)
 * - getDerivedStateFromError로 render phase 에러 catch
 * - 재시도 버튼으로 state 초기화
 * - Next의 error.tsx + reset 함수 자동 주입과 대비
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  reset() {
    this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, border: '1px solid #f33', margin: 16 }}>
          <h2>에러 발생 (수동 ErrorBoundary)</h2>
          <p>{this.state.error.message}</p>
          <button onClick={this.reset}>다시 시도</button>
        </div>
      );
    }
    return this.props.children;
  }
}
