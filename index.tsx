
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('应用错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#050508',
          color: '#00f2ff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'monospace'
        }}>
          <h1 style={{ color: '#ff007f', fontSize: '2rem', marginBottom: '1rem' }}>
            系统错误
          </h1>
          <pre style={{
            backgroundColor: '#0a0a0f',
            padding: '1rem',
            borderRadius: '4px',
            maxWidth: '800px',
            overflow: 'auto',
            color: '#ff007f'
          }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.5rem 2rem',
              backgroundColor: '#00f2ff',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            重新加载
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 添加调试信息
console.log('🚀 开始初始化应用...');

// 添加全局测试函数
(window as any).testGeminiAPI = async () => {
  console.log('🧪 开始测试 Gemini API...');
  const apiKey = (process.env as any).API_KEY || (process.env as any).GEMINI_API_KEY;
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : '未找到');
  
  if (!apiKey) {
    console.error('❌ API Key 未找到！请检查 .env.local 文件并重启开发服务器');
    return;
  }
  
  try {
    const { generateMoodMenu } = await import('./services/gemini');
    const result = await generateMoodMenu('测试心情');
    console.log('✅ 测试成功！生成的菜单:', result);
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
};

console.log('💡 提示：在控制台输入 testGeminiAPI() 可以测试 Gemini API');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ 找不到 root 元素');
  throw new Error("Could not find root element to mount to");
}

console.log('✅ 找到 root 元素，开始渲染...');

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('✅ React 应用已成功挂载');
} catch (error) {
  console.error('❌ 渲染失败:', error);
  // 即使出错也显示一些内容
  rootElement.innerHTML = `
    <div style="
      min-height: 100vh;
      background-color: #050508;
      color: #ff007f;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      font-family: monospace;
    ">
      <h1 style="font-size: 2rem; margin-bottom: 1rem;">初始化错误</h1>
      <pre style="
        background-color: #0a0a0f;
        padding: 1rem;
        border-radius: 4px;
        max-width: 800px;
        overflow: auto;
        color: #ff007f;
      ">${error}</pre>
      <button
        onclick="window.location.reload()"
        style="
          margin-top: 2rem;
          padding: 0.5rem 2rem;
          background-color: #00f2ff;
          color: #000;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          font-weight: bold;
        "
      >
        重新加载
      </button>
    </div>
  `;
}
