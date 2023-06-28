import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

const CustomMarkdown = ({ value }: { value: string }) => {
  return (
    <ReactMarkdown
      className={"text-sm 2xl:text-base"}
      components={{
        a: ({ children, ...props }) => {
          return (
            <a
              className={cn("font-medium text-primary underline")}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          );
        },
        strong: ({ children, ...props }) => {
          return (
            <b className={cn("font-semibold leading-6 text-foreground")} {...props}>
              {children}
            </b>
          );
        },
        p: ({ children, ...props }) => {
          return (
            <p
              className={cn(
                "text-base font-normal leading-relaxed text-foreground/90 2xl:text-lg",
                props.className
              )}
              {...props}
            >
              {children}
            </p>
          );
        },
        code: ({ inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          console.log("I am in code", children);

          return !inline && match ? (
            <div className={"mb-4"}>
              <SyntaxHighlighter
                // @ts-ignore
                style={dracula}
                language={match[1]?.replace(/^(.+?)import$/, "$1") ?? "javascript"}
                PreTag="div"
                CodeTag={"code"}
                codeTagProps={{
                  style: {
                    fontFamily: "inherit",
                  },
                }}
                customStyle={{
                  fontSize: "inherit",
                  fontFamily: "inherit",
                }}
                wrapLongLines={true}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
    >
      {value}
    </ReactMarkdown>
  );
};

export default CustomMarkdown;
