"use client";

import React from "react";

interface ParsedTextProps {
  text: string | null | undefined;
}

export default function ParsedText({ text }: ParsedTextProps) {
  if (!text) return null;

  // Split by newlines first
  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, lineIndex) => {
        // Regex to match URLs and **bold** text
        // Group 1: URL
        // Group 2: Bold text (what's inside **)
        const regex = /(https?:\/\/[^\s]+)|(?:\*\*(.*?)\*\*)/g;
        
        const nodes: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(line)) !== null) {
          // Push preceding text as plain string
          if (match.index > lastIndex) {
            nodes.push(line.substring(lastIndex, match.index));
          }

          const urlMatch = match[1];
          const boldMatch = match[2];

          if (urlMatch) {
            nodes.push(
              <a
                key={`link-${lineIndex}-${match.index}`}
                href={urlMatch}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent-primary)", textDecoration: "underline" }}
                onClick={(e) => e.stopPropagation()} // Prevent card clicks
              >
                {urlMatch}
              </a>
            );
          } else if (boldMatch !== undefined) { 
            nodes.push(<strong key={`bold-${lineIndex}-${match.index}`}>{boldMatch}</strong>);
          }

          lastIndex = regex.lastIndex;
        }

        // Push any remaining text after the last match
        if (lastIndex < line.length) {
          nodes.push(line.substring(lastIndex));
        }

        return (
          <React.Fragment key={lineIndex}>
            {nodes.length > 0 ? nodes : line}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
}
