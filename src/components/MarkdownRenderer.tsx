import HtmlToReact from "html-to-react";

const htmlToReactParser = HtmlToReact.Parser();

type MarkdownRendererProps = {
  className?: string;
  markdown: string;
  parse: (markdown: string) => string;
};

export default function MarkdownRenderer(props: MarkdownRendererProps) {
  const { className = '', markdown, parse } = props;
  const html = parse(markdown);
  const reactElement = htmlToReactParser.parse(html);

  return (
    <div
      className={`
        prose flex flex-col gap-2 
        [&>h1]:text-2xl 
        [&>h2]:text-xl
        [&>blockquote]:border-s-4 
        [&>blockquote]:ps-2 
        [&>blockquote]:text-[#909090]
        [&>ul]:list-disc 
        [&>ul]:pl-8 
        [&>ol]:list-decimal 
        [&>ol]:pl-8
        ${className}
      `}
      style={
        {
          '--tw-prose-bullets': 'rgb(55, 65, 81)',
        } as any
      }
    >
      {reactElement}
    </div>
  );
}
