import React from "react";
import DOMPurify from "dompurify";

interface SanitizedHtmlProps {
  /** Raw HTML string. Sanitized with DOMPurify before it is rendered. */
  html?: string;
  /** Element to render as. Defaults to a paragraph. */
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  id?: string;
  "data-automation-id"?: string;
}

/**
 * Renders a sanitized HTML string, replacing the repeated
 * `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(...) }}` idiom used across
 * the payment flows. Safe to reuse anywhere server-provided rich text is displayed.
 */
const SanitizedHtml = ({
  html = "",
  as = "p",
  className,
  id,
  ...rest
}: SanitizedHtmlProps) => {
  if (!html) {
    return null;
  }
  return React.createElement(as, {
    id,
    className,
    ...rest,
    dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(html) },
  });
};

export default SanitizedHtml;
