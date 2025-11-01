import React, { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language: _language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative group my-4">
      <pre className="bg-gray-100 text-gray-900 p-4 rounded-lg overflow-x-auto border border-gray-200">
        <code className="text-sm">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  const renderContent = (text: string) => {
    if (!text) return <p className="text-gray-500 italic">No description provided</p>;
    
    // Split content by code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textContent = text.slice(lastIndex, match.index);
        parts.push(renderMarkdownText(textContent));
      }
      
      // Add code block
      parts.push(
        <CodeBlock 
          key={match.index} 
          code={match[2].trim()} 
          language={match[1]} 
        />
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      parts.push(renderMarkdownText(remainingText));
    }
    
    return parts.length > 0 ? parts : renderMarkdownText(text);
  };

  const renderMarkdownText = (text: string) => {
    let html = text;
    
    // Remove stray HTML attributes that might be mixed in with markdown content
    html = html.replace(/class="[^"]*"/g, '');
    html = html.replace(/target="[^"]*"/g, '');
    html = html.replace(/rel="[^"]*"/g, '');
    html = html.replace(/style="[^"]*"/g, '');
    html = html.replace(/data-[^=]*="[^"]*"/g, '');
    
    // Remove orphaned HTML fragments
    html = html.replace(/>\s*/g, ' ');
    html = html.replace(/\s*</g, ' ');
    html = html.replace(/\s*>\s*/g, ' ');
    
    // Clean up multiple spaces but preserve line breaks
    html = html.replace(/[ \t]+/g, ' ');
    html = html.trim();
    
    // Handle headers (process from largest to smallest to avoid conflicts)
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h1>');
    
    // Handle blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 py-2 my-2 text-gray-600 bg-gray-50 rounded-r">$1</blockquote>');
    
    // Handle markdown links
    if (!html.includes('<a href=')) {
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    }
    
    // Handle numbered lists (after links are processed)
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 list-decimal">$2</li>');
    
    // Handle unordered lists (after links are processed)
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
    
    
    
    // Handle inline formatting
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>');
    html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>');
    
    // Handle paragraphs and line breaks
    html = html.replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs if not already wrapped
    if (!html.includes('<h1') && !html.includes('<h2') && !html.includes('<h3') && !html.includes('<blockquote') && !html.includes('<li')) {
      html = html.replace(/^(.*)$/gm, '<p class="mb-4 text-gray-700 leading-relaxed">$1</p>');
    }
    
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: html }}
        key={`markdown-${Math.random()}`}
      />
    );
  };

  return (
    <div 
      className={`prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm break-words overflow-wrap-anywhere ${className}`}
      style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
    >
      {renderContent(content)}
    </div>
  );
};

export default MarkdownRenderer;
