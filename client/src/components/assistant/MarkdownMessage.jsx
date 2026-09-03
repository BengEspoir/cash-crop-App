import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function MarkdownMessage({ content, className }) {
  return (
    <div className={cn("min-w-0 max-w-[75ch] break-words text-[13px] leading-6", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children }) => (
            <h3 className="mt-4 font-display text-xl font-semibold leading-tight text-ink-950 first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="mt-4 font-display text-lg font-semibold leading-tight text-ink-950 first:mt-0">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-4 text-[15px] font-bold leading-tight text-ink-900 first:mt-0">
              {children}
            </h4>
          ),
          h4: ({ children }) => (
            <h5 className="mt-3 text-[14px] font-bold leading-tight text-ink-900 first:mt-0">
              {children}
            </h5>
          ),
          p: ({ children }) => <p className="mt-3 first:mt-0">{children}</p>,
          ul: ({ children }) => <ul className="mt-3 list-disc space-y-1 pl-5 first:mt-0">{children}</ul>,
          ol: ({ children }) => <ol className="mt-3 list-decimal space-y-1 pl-5 first:mt-0">{children}</ol>,
          li: ({ children }) => <li className="pl-0.5 marker:text-green-700">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-green-800 underline decoration-green-300 underline-offset-2 hover:text-green-700"
            >
              {children}
            </a>
          ),
          code: ({ className: codeClassName, children, ...props }) => (
            <code
              className={cn(
                "rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[0.92em] text-ink-900",
                codeClassName,
              )}
              {...props}
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="mt-3 max-w-full overflow-x-auto rounded-xl bg-ink-950 p-3 text-ink-50 first:mt-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mt-3 border-l-4 border-green-300 bg-green-50 px-3 py-2 text-ink-700 first:mt-0">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="mt-3 max-w-full overflow-x-auto rounded-lg border border-ink-200 first:mt-0">
              <table className="min-w-[30rem] border-collapse text-left text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-green-50 text-green-950">{children}</thead>,
          th: ({ children }) => <th className="border-b border-ink-200 px-3 py-2 font-bold">{children}</th>,
          td: ({ children }) => <td className="border-b border-ink-100 px-3 py-2 align-top">{children}</td>,
          hr: () => <hr className="my-4 border-ink-200" />,
        }}
      >
        {String(content || "")}
      </ReactMarkdown>
    </div>
  );
}
