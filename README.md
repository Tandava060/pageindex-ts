# PageIndex JS 📑

**Build intelligent document indices for RAG and Agents.**

`pageindex-js` converts documents Markdown into a hierarchical tree structure with semantic summaries. This structure gives your LLM a "map" of the document, allowing it to navigate large texts efficiently without getting lost in the context window.

> 💡 **Inspiration:** This project is a TypeScript port and adaptation inspired by [VectifyAI/PageIndex](https://github.com/VectifyAI/PageIndex) (Python).

<br/>

## Why do I need this?

When you blindly chunk a large document (like a 50-page PDF) for RAG, you lose context.
- "Section 1.2" might depend on "Section 1.0", but they end up in different chunks.
- The LLM sees a fragment of text but doesn't know *where* it fits in the bigger picture.

**PageIndex solves this by building a Tree:**
1.  **Structure**: It understands headers and hierarchy (H1 -> H2 -> H3).
2.  **Summary**: It generates a tiny summary for *each node* in the tree.
3.  **Navigation**: You can feed this lightweight tree to an LLM so it can "look up" exactly which section it needs to read.

---

## Installation

```bash
npm install pageindex-js
```

## Quick Start

### 1. The "Bring Your Own" Philosophy
We don't force you to use specific tools.
- **Bring Your Own LLM**: Use OpenAI, Anthropic, Gemini, or even Ollama.
- **Bring Your Own Markdown Parser**: use llama-parse, docling or any other pdf to markdown parser.

### 2. Usage (Markdown)

```typescript
import { mdToTree } from 'pageindex-js';
import OpenAI from 'openai';

// 1. Define your LLM function
const openai = new OpenAI();
const myLLM = async (prompt: string) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [{ role: 'user', content: prompt }],
  });
  return completion.choices[0].message.content || '';
};

// 2. Your Content
const markdown = `
# Project Alpha
## Overview
This project aims to...
## Timeline
Phase 1 starts in...
`;

// 3. Create the Index
const result = await mdToTree(markdown, docName, {
        llm,
        ifAddNodeSummary: true,
        ifAddNodeId: true,
        ifAddNodeText: true, // Store full text in nodes (matches Python notebook)
    });

console.log(JSON.stringify(result.structure, null, 2));
---

## How it Works

1.  **Parsing**: Identifies headers (Markdown).
2.  **Tree Building**: Constructs a nested JSON tree representing the document structure.
3.  **Summarization**: (Optional) Uses your LLM to generate a 1-sentence summary for every branch of the tree.

## Comparison with Original (Python)
- **Language**: TypeScript vs Python.
- **Async First**: Built for Node.js non-blocking I/O.
- **Zero Dependencies**: Lightweight, unlike the Python version which includes heavier ML libraries by default.
- **No PDF Support**: This version does not support PDF parsing.
- **Bring Your Own LLM**: Use OpenAI, Anthropic, Gemini, or even Ollama.
- **Bring Your Own Markdown Parser**: use llama-parse, docling or any other pdf to markdown parser.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT
