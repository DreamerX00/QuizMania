"use client";

/**
 * Client-side XSS Protection Utilities
 * Use DOMPurify for sanitizing HTML in the browser
 */

import React from "react";
import DOMPurify from "dompurify";

/**
 * Sanitize HTML for safe rendering in React
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Safe HTML rendering component
 * Usage: <SafeHtml html={userContent} />
 */
interface SafeHtmlProps {
  html: string;
  className?: string;
}

export function SafeHtml({ html, className }: SafeHtmlProps) {
  const clean = sanitizeHtml(html);

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
  );
}

/**
 * Escape HTML entities for display as text
 */
export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
