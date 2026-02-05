/**
 * PageIndex Types
 * TypeScript interfaces for the PageIndex library
 */

/**
 * User-provided LLM function signature
 * Users can provide any LLM (OpenAI, Anthropic, Gemini, local models, etc.)
 */
export type LLMFunction = (prompt: string) => Promise<string>;

/** Configuration options for PageIndex */
export interface PageIndexOptions {
    /** User-provided LLM function (REQUIRED) */
    llm: LLMFunction;
    /** Document name for output */
    docName?: string;
    /** Number of pages to check for table of contents (default: 20) */
    tocCheckPageNum?: number;
    /** Maximum pages per node (default: 10) */
    maxPageNumEachNode?: number;
    /** Maximum tokens per node (default: 20000) */
    maxTokenNumEachNode?: number;
    /** Whether to add node IDs (default: true) */
    ifAddNodeId?: boolean;
    /** Whether to add node summaries (default: true) */
    ifAddNodeSummary?: boolean;
    /** Whether to add document description (default: false) */
    ifAddDocDescription?: boolean;
    /** Whether to add node text content (default: false) */
    ifAddNodeText?: boolean;
}

/** Configuration options for Markdown processing */
export interface MarkdownOptions {
    /** User-provided LLM function (REQUIRED for summaries) */
    llm?: LLMFunction;
    /** User-provided LLM function (REQUIRED for summaries) */
    ifThinning?: boolean;
    /** Minimum token threshold for thinning (default: 5000) */
    thinningThreshold?: number;
    /** Token threshold for generating summaries (default: 200) */
    summaryTokenThreshold?: number;
    /** Whether to add node summaries */
    ifAddNodeSummary?: boolean;
    /** Whether to add document description */
    ifAddDocDescription?: boolean;
    /** Whether to add node text content */
    ifAddNodeText?: boolean;
    /** Whether to add node IDs */
    ifAddNodeId?: boolean;
}

/** A node in the tree structure */
export interface TreeNode {
    /** Title of the section */
    title: string;
    /** Unique node identifier */
    nodeId?: string;
    /** Starting page/line index */
    startIndex?: number;
    /** Ending page/line index */
    endIndex?: number;
    /** Summary of the node content */
    summary?: string;
    /** Prefix summary for nodes with children */
    prefixSummary?: string;
    /** Full text content of the node */
    text?: string;
    /** Child nodes */
    nodes?: TreeNode[];
}

/** Result from PageIndex processing */
export interface PageIndexResult {
    /** Document name */
    docName: string;
    /** Document description (if generated) */
    docDescription?: string;
    /** Hierarchical tree structure */
    structure: TreeNode[];
}

/** Internal TOC item during processing */
export interface TocItem {
    /** Structure index (e.g., "1.2.3") */
    structure?: string;
    /** Section title */
    title: string;
    /** Page number from TOC */
    page?: number;
    /** Physical page index in document */
    physicalIndex?: number | null;
    /** List index for internal tracking */
    listIndex?: number;
    /** Whether section appears at start of page */
    appearStart?: string;
}

/** Page content with token count */
export interface PageContent {
    /** Extracted text content */
    text: string;
    /** Token count for the page */
    tokenCount: number;
}

/** TOC check result */
export interface TocCheckResult {
    /** Raw TOC content */
    tocContent: string | null;
    /** List of page indices containing TOC */
    tocPageList: number[];
    /** Whether page numbers are given in TOC */
    pageIndexGivenInToc: 'yes' | 'no';
}

/** Verification result for TOC items */
export interface VerificationResult {
    /** Index in the list */
    listIndex: number;
    /** Section title */
    title: string;
    /** Whether the result is correct */
    answer: 'yes' | 'no';
    /** Page number */
    pageNumber: number | null;
}

/**
 * Input for document processing - user provides the text content
 */
export interface DocumentInput {
    /** Document name */
    name: string;
    /** Array of page texts (for PDFs) or single text content */
    pages: string[];
}
