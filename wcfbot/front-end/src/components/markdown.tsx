import { FC, memo, ReactNode, ComponentPropsWithoutRef, useState } from "react";
import ReactMarkdown, { Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlockRender } from "./codeblock";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import Image from "next/image";

type ComponentType = Partial<ComponentPropsWithoutRef<"code">> & {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
};

type ListItemProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"li">;

type OrderedListProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"ol">;

type TableProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"table">;

type TableCellProps = {
  children?: ReactNode;
  className?: string;
  isHeader?: boolean;
} & ComponentPropsWithoutRef<"td">;

const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children,
);

const preprocessLaTeX = (content: string) => {
  if (!content) return '';
  
  // Convert LaTeX to simple display format for now
  const blockProcessedContent = content.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, equation) => `**Math Block:** ${equation}`,
  );
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_, equation) => `**Math:** ${equation}`,
  );
  return inlineProcessedContent;
};

const preprocessMedia = (content: string) => {
  if (!content) return '';
  return content.replace(/(sandbox|attachment|snt):/g, "");
};

// New function to handle task lists
const preprocessTaskLists = (content: string) => {
  if (!content) return '';
  
  return content.replace(
    /- \[ \](.*)/g, 
    '- <input type="checkbox" disabled /> $1'
  ).replace(
    /- \[x\](.*)/g, 
    '- <input type="checkbox" checked disabled /> $1'
  );
};

// New function to handle footnotes
const preprocessFootnotes = (content: string) => {
  if (!content) return '';
  
  // Find all footnote references [^1]
  const footnoteRefs = content.match(/\[\^(\d+)\]/g) || [];
  let processedContent = content;
  
  // Process each footnote reference
  footnoteRefs.forEach(ref => {
    const footnoteNum = ref.match(/\[\^(\d+)\]/)?.[1];
    if (footnoteNum) {
      const footnoteDefRegex = new RegExp(`\\[\\^${footnoteNum}\\]:\\s(.+)(?:\\n|$)`);
      const footnoteDef = content.match(footnoteDefRegex);
      
      if (footnoteDef && footnoteDef[1]) {
        // Create HTML for the footnote
        const footnoteHTML = `<sup><a href="#footnote-${footnoteNum}" id="footnote-ref-${footnoteNum}">${footnoteNum}</a></sup>`;
        // Replace the reference with HTML
        processedContent = processedContent.replace(ref, footnoteHTML);
        
        // Create the footnote definition
        const footnoteDefHTML = `<div id="footnote-${footnoteNum}" class="footnote"><sup>${footnoteNum}</sup> ${footnoteDef[1]} <a href="#footnote-ref-${footnoteNum}">↩</a></div>`;
        // Replace the definition with HTML
        processedContent = processedContent.replace(footnoteDef[0], footnoteDefHTML);
      }
    }
  });
  
  return processedContent;
};

const preprocessContent = (content: string | undefined | null) => {
  // Ensure content is a string
  if (content === undefined || content === null) {
    return ''; // Return empty string if content is not provided
  }
  
  // Convert to string if it's not already (safety check)
  const contentStr = String(content);
  
  // Process the content
  const taskListProcessed = preprocessTaskLists(contentStr);
  const footnoteProcessed = preprocessFootnotes(taskListProcessed);
  return preprocessMedia(preprocessLaTeX(footnoteProcessed));
};

interface MarkdownProps {
  content: string;
  darkMode?: boolean;
}

// New component for collapsible details
const CollapsibleDetails = ({ children, summary }: { children: ReactNode, summary: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="my-4 border border-gray-200 dark:border-gray-700 rounded-md">
      <div 
        className="flex items-center p-3 cursor-pointer bg-gray-50 dark:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="mr-2">{isOpen ? '▼' : '▶'}</span>
        <div className="font-medium">{summary}</div>
      </div>
      {isOpen && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
};

interface CustomImageProps {
  src?: string | Blob;
  alt?: string;
  [key: string]: unknown;
}

const CustomImage = ({ src, alt, ...props }: CustomImageProps) => {
  if (!src || typeof src !== 'string') return null;
  
  return (
    <div className="my-4 relative">
      <div className="relative w-full h-auto min-h-[200px]">
        <Image 
          src={src}
          alt={alt || ''}
          fill
          style={{ objectFit: 'contain' }}
          className="rounded-md"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          {...props}
        />
      </div>
      {alt && <p className="text-sm text-center text-gray-500 mt-2">{alt}</p>}
    </div>
  );
};

export default function Markdown({ content = '', darkMode = false }: MarkdownProps) {
  const processedContent = preprocessContent(content);

  return (
    <MemoizedReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }]
      ]}
      components={{
        p({ children }) {
          return <p className="last:mb-0">{children}</p>;
        },
        h1({ children, id }) {
          return (
            <h1 id={id} className="group flex items-center">
              {children}
              {id && (
                <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600">
                  #
                </a>
              )}
            </h1>
          );
        },
        h2({ children, id }) {
          return (
            <h2 id={id} className="group flex items-center ">
              {children}
              {id && (
                <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600">
                  #
                </a>
              )}
            </h2>
          );
        },
        h3({ children, id }) {
          return (
            <h3 id={id} className="group flex items-center">
              {children}
              {id && (
                <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600">
                  #
                </a>
              )}
            </h3>
          );
        },
        blockquote({ children }) {
          return (
            <blockquote className="pl-4 border-l-4 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 italic">
              {children}
            </blockquote>
          );
        },
        ol({ children, className, ...props }: OrderedListProps) {
          return (
            <ol 
              className={`list-decimal pl-6 my-2 ${className || ''}`} 
              {...props}
            >
              {children}
            </ol>
          );
        },
        ul({ children, className, ...props }) {
          return (
            <ul 
              className={`list-disc pl-6 space-y-0 ${className || ''}`} 
              {...props}
            >
              {children}
            </ul>
          );
        },
        li({ children, className, ...props }: ListItemProps) {
          return (
            <li 
              className={`my-0 leading-normal ${className || ''}`} 
              {...props}
            >
              {children}
            </li>
          );
        },
        a({ href, children, ...props }) {
          const isExternal = href?.startsWith('http');
          return (
            <a 
              href={href} 
              className="text-[#FFA200] hover:underline"
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              {...props}
            >
              {children}
              {isExternal && <span className="ml-1 text-xs">↗</span>}
            </a>
          );
        },
        img(props) {
          return <CustomImage {...props} />;
        },
        table({ children, className, ...props }: TableProps) {
          return (
            <div className="overflow-x-auto my-4">
              <table 
                className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className || ''}`}
                {...props}
              >
                {children}
              </table>
            </div>
          );
        },
        thead({ children }) {
          return (
            <thead className="bg-gray-50 dark:bg-gray-800">
              {children}
            </thead>
          );
        },
        tbody({ children }) {
          return (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {children}
            </tbody>
          );
        },
        tr({ children, className, ...props }) {
          return (
            <tr 
              className={`${className || ''}`}
              {...props}
            >
              {children}
            </tr>
          );
        },
        th({ children, className, ...props }) {
          return (
            <th
              className={`px-6 py-3 text-left border-l border-r border-t border-[#ff3600] text-xs font-medium text-black bg-white uppercase tracking-wider ${className || ''}`}
              {...props}
            >
              {children}
            </th>
          );
        },
        td({ children, className, ...props }: TableCellProps) {
          return (
            <td
              className={`px-6 py-4 border-l border-r border-b border-t border-[#ff3600] whitespace-nowrap text-sm text-gray-500 ${className || ''}`}
              {...props}
            >
              {children}
            </td>
          );
        },
        // Custom handling for details/summary elements
        details({ children }) {
          let summary = "Details";
          let content = children;
          
          if (Array.isArray(children)) {
            const summaryNode = children.find(child => 
              typeof child === 'object' && 
              child !== null && 
              'type' in child && 
              child.type === 'summary'
            );
            
            if (summaryNode && 'props' in summaryNode && summaryNode.props.children) {
              summary = summaryNode.props.children;
              content = children.filter(child => 
                typeof child !== 'object' || 
                child === null || 
                !('type' in child) || 
                child.type !== 'summary'
              );
            }
          }
          
          return <CollapsibleDetails summary={summary}>{content}</CollapsibleDetails>;
        },
        code(props: ComponentType) {
          const { inline, className, children, ...rest } = props;          
          const childContent = Array.isArray(children) ? children[0] : children;
          
          if (childContent === "▍") {
            return (
              <span className="animate-pulse cursor-default">▍</span>
            );
          }

          const processedChildren = typeof childContent === "string"
            ? childContent.replace("`▍`", "▍")
            : children;

          const match = /language-(\w+)/.exec(className || "");

          if (inline) {
            return (
              <code className={`px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 ${className}`} {...rest}>
                {processedChildren}
              </code>
            );
          }

          return (
            <div className="relative group">
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={String(children || "").replace(/\n$/, "")} />
              </div>
              <CodeBlockRender
                key={Math.random()}
                language={(match && match[1]) || ""}
                value={String(children || "").replace(/\n$/, "")}
                {...rest}
              />
            </div>
          );
        },
      }}
    >
      {processedContent}
    </MemoizedReactMarkdown>
  );
}

// Inline copy button component
const CopyButton: FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
      )}
    </button>
  );
};