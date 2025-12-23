import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig(({ mode }) => {
    // 方法1: 使用 loadEnv（可能只加载 VITE_ 前缀的变量）
    const env = loadEnv(mode, process.cwd(), '');
    
    // 方法2: 直接读取 .env.local 文件
    let apiKey = env.GEMINI_API_KEY || '';
    
    if (!apiKey) {
      try {
        const envPath = path.join(process.cwd(), '.env.local');
        console.log('📁 尝试读取文件:', envPath);
        console.log('📁 文件是否存在:', fs.existsSync(envPath));
        
        if (fs.existsSync(envPath)) {
          // 尝试多种编码：先尝试 UTF-8，如果失败则尝试 UTF-16
          let content = '';
          try {
            content = fs.readFileSync(envPath, 'utf-8');
            // 检查是否是 UTF-16（包含大量 \u0000）
            if (content.includes('\u0000') || content.charCodeAt(0) === 0xFEFF) {
              console.log('📄 检测到 UTF-16 编码，重新读取...');
              content = fs.readFileSync(envPath, 'utf-16le');
              // 移除 BOM
              if (content.charCodeAt(0) === 0xFEFF) {
                content = content.substring(1);
              }
            }
          } catch (e) {
            // 如果 UTF-8 失败，尝试 UTF-16
            try {
              content = fs.readFileSync(envPath, 'utf-16le');
              if (content.charCodeAt(0) === 0xFEFF) {
                content = content.substring(1);
              }
            } catch (e2) {
              throw e;
            }
          }
          console.log('📄 文件内容长度:', content.length);
          console.log('📄 文件内容前100字符:', JSON.stringify(content.substring(0, 100)));
          
          // 尝试多种解析方式
          // 方式1: 简单匹配 KEY=VALUE
          let match = content.match(/GEMINI_API_KEY\s*=\s*(.+?)(?:\r?\n|$)/);
          if (match) {
            apiKey = match[1].trim();
            // 移除可能的引号
            apiKey = apiKey.replace(/^["']|["']$/g, '');
            console.log('✅ 从 .env.local 直接读取到 GEMINI_API_KEY (方式1)');
          } else {
            // 方式2: 按行解析
            const lines = content.split(/\r?\n/);
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('GEMINI_API_KEY=')) {
                apiKey = trimmed.substring('GEMINI_API_KEY='.length).trim();
                apiKey = apiKey.replace(/^["']|["']$/g, '');
                console.log('✅ 从 .env.local 直接读取到 GEMINI_API_KEY (方式2)');
                break;
              }
            }
            
            if (!apiKey) {
              console.warn('⚠️ .env.local 文件中未找到 GEMINI_API_KEY');
              console.warn('📄 文件所有行:', lines);
            }
          }
        } else {
          console.warn('⚠️ .env.local 文件不存在于:', envPath);
        }
      } catch (e) {
        console.error('❌ 读取 .env.local 失败:', e);
      }
    } else {
      console.log('✅ 从 loadEnv 加载到 GEMINI_API_KEY');
    }
    
    if (!apiKey) {
      console.error('❌ 未找到 GEMINI_API_KEY！请检查 .env.local 文件');
    } else {
      console.log('✅ Vite 配置: GEMINI_API_KEY 已加载');
    }
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // 确保环境变量被正确传递到浏览器端
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        // 同时支持 VITE_ 前缀的方式
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
