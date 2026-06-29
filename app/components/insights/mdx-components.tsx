import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import FlipCard from "./FlipCard";
import TldrReveal from "./TldrReveal";
import InlinePoll from "./InlinePoll";
import ParamTinker from "./ParamTinker";
import DiffSlider from "./DiffSlider";
import QuizCard from "./QuizCard";
import AnnotatedCode from "./AnnotatedCode";
import PinnedChart from "./PinnedChart";
import Scrollytell from "./Scrollytell";
import ConceptNest from "./ConceptNest";
import ReasoningLoop from "./ReasoningLoop";
import PlatformStack from "./PlatformStack";
import AgentSwarm from "./AgentSwarm";

type ComponentsMap = NonNullable<MDXRemoteProps["components"]>;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function H2({ children, ...rest }: { children?: React.ReactNode }) {
  const text = typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "";
  const id = text ? slugify(text) : undefined;
  return (
    <h2 id={id} className="insight-h2" {...rest}>
      {children}
    </h2>
  );
}

function H3({ children, ...rest }: { children?: React.ReactNode }) {
  const text = typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "";
  const id = text ? slugify(text) : undefined;
  return (
    <h3 id={id} className="insight-h3" {...rest}>
      {children}
    </h3>
  );
}

export const mdxComponents: ComponentsMap = {
  FlipCard,
  TldrReveal,
  InlinePoll,
  ParamTinker,
  DiffSlider,
  QuizCard,
  AnnotatedCode,
  PinnedChart,
  Scrollytell,
  ConceptNest,
  ReasoningLoop,
  PlatformStack,
  AgentSwarm,
  h1: ({ children, ...rest }) => <h1 className="insight-h1" {...rest}>{children}</h1>,
  h2: H2,
  h3: H3,
  p: ({ children, ...rest }) => <p className="insight-p" {...rest}>{children}</p>,
  ul: ({ children, ...rest }) => <ul className="insight-ul" {...rest}>{children}</ul>,
  ol: ({ children, ...rest }) => <ol className="insight-ol" {...rest}>{children}</ol>,
  blockquote: ({ children, ...rest }) => <blockquote className="insight-quote" {...rest}>{children}</blockquote>,
  code: ({ children, ...rest }) => <code className="insight-icode" {...rest}>{children}</code>,
  pre: ({ children, ...rest }) => <pre className="insight-pre" {...rest}>{children}</pre>,
  a: ({ children, href, ...rest }) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        className="insight-link"
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        {...rest}
      >
        {children}
        {external && <span aria-hidden> ↗</span>}
      </a>
    );
  },
  hr: () => <hr className="insight-hr" />,
};
