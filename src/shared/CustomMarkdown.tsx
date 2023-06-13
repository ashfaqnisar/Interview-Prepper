import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

const CustomMarkdown = ({ value }: { value: string }) => {
  return (
    <ReactMarkdown
      components={{
        code: ({ inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              style={dracula}
              language={match[1]?.replace(/^(.+?)import$/, "$1") ?? "javascript"}
              PreTag="div"
              CodeTag={"code"}
              codeTagProps={{
                style: {
                  fontFamily: "inherit"
                }
              }}
              customStyle={{
                fontSize: "inherit",
                fontFamily: "inherit",
                margin: 0
              }}
              wrapLongLines={true}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
      }}
      remarkPlugins={[remarkGfm]}
    >
      {value}
    </ReactMarkdown>
  );
};

export default CustomMarkdown;
