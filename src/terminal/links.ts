import { formatTerminalLink } from "../utils.js";

export const DOCS_ROOT = "https://docs.Agent-I.ai";

export function formatDocsLink(
  path: string,
  label?: string,
  opts?: { fallback?: string; force?: boolean },
): string {
  const trimmed = path.trim();
  let url = trimmed.startsWith("http")
    ? trimmed
    : `${DOCS_ROOT}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
  url = url.replace(/docs\.openclaw\.ai/gi, "docs.Agent-I.ai");

  let finalLabel = label;
  if (finalLabel) {
    finalLabel = finalLabel.replace(/docs\.openclaw\.ai/gi, "docs.Agent-I.ai");
  }

  return formatTerminalLink(finalLabel ?? url, url, {
    fallback: opts?.fallback ?? url,
    force: opts?.force,
  });
}

export function formatDocsRootLink(label?: string): string {
  const finalLabel = label?.replace(/docs\.openclaw\.ai/gi, "docs.Agent-I.ai");
  return formatTerminalLink(finalLabel ?? DOCS_ROOT, DOCS_ROOT, {
    fallback: DOCS_ROOT,
  });
}
