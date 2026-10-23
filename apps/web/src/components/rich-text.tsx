import { Fragment } from 'react';
function Inline({ text }: { text: string }) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) =>
      part.startsWith('**') ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      ),
    );
}
export function RichText({ content }: { content: string }) {
  return (
    <div className="prose">
      {content.split(/\n{2,}/).map((block, index) => {
        const lines = block.split('\n');
        const bullets = lines.filter((line) => line.startsWith('- '));
        const normal = lines.filter((line) => !line.startsWith('- '));
        return (
          <Fragment key={index}>
            {normal.length > 0 && (
              <p>
                {normal.map((line, lineIndex) => (
                  <Fragment key={lineIndex}>
                    {lineIndex > 0 && <br />}
                    <Inline text={line} />
                  </Fragment>
                ))}
              </p>
            )}
            {bullets.length > 0 && (
              <ul>
                {bullets.map((line, lineIndex) => (
                  <li key={lineIndex}>
                    <Inline text={line.slice(2)} />
                  </li>
                ))}
              </ul>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
