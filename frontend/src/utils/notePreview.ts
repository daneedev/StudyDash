function truncatePreview(text: string, maxWords = 15) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return text;
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
}

export function createContentPreview(
  content: string,
  options?: { emptyLabel?: string; maxWords?: number },
) {
  const emptyLabel = options?.emptyLabel ?? "Prázdná poznámka";
  const maxWords = options?.maxWords ?? 15;

  if (!content.trim()) {
    return emptyLabel;
  }

  try {
    const parsed = JSON.parse(content) as { content?: unknown[] };
    const fragments: string[] = [];

    const collectText = (node: unknown) => {
      if (!node || typeof node !== "object") {
        return;
      }

      const typedNode = node as { text?: string; content?: unknown[] };
      if (typeof typedNode.text === "string") {
        fragments.push(typedNode.text);
      }

      if (Array.isArray(typedNode.content)) {
        typedNode.content.forEach(collectText);
      }
    };

    if (Array.isArray(parsed.content)) {
      parsed.content.forEach(collectText);
      const text = fragments.join(" ").replace(/\s+/g, " ").trim();
      return text ? truncatePreview(text, maxWords) : emptyLabel;
    }
  } catch {
  }

  const text = content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text ? truncatePreview(text, maxWords) : emptyLabel;
}
