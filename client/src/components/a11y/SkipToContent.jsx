export function SkipToContent({ targetId = "main-content", children = "Skip to content" }) {
  return (
    <a href={`#${targetId}`} className="skip-to-content">
      {children}
    </a>
  );
}
