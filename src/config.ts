/**
 * Configuration management for PageIndex
 */

import type { PageIndexOptions, MarkdownOptions, LLMFunction } from './types';

/**
 * Helper to estimate tokens (4 chars/token)
 */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

/** Default configuration values (without LLM - must be provided by user) */
export const DEFAULT_CONFIG = {
    tocCheckPageNum: 20,
    maxPageNumEachNode: 10,
    maxTokenNumEachNode: 20000,
    ifAddNodeId: true,
    ifAddNodeSummary: true,
    ifAddDocDescription: false,
    ifAddNodeText: false,
};

/** Default markdown configuration values */
export const DEFAULT_MARKDOWN_CONFIG = {
    ifThinning: false,
    thinningThreshold: 5000,
    summaryTokenThreshold: 200,
    ifAddNodeSummary: true,
    ifAddDocDescription: false,
    ifAddNodeText: false,
    ifAddNodeId: true,
};

/** Internal config with resolved LLM */
export interface ResolvedConfig {
    llm: LLMFunction;
    docName: string;
    tocCheckPageNum: number;
    maxPageNumEachNode: number;
    maxTokenNumEachNode: number;
    ifAddNodeId: boolean;
    ifAddNodeSummary: boolean;
    ifAddDocDescription: boolean;
    ifAddNodeText: boolean;
}

/** Internal markdown config with resolved functions */
export interface ResolvedMarkdownConfig {
    llm?: LLMFunction;
    ifThinning: boolean;
    thinningThreshold: number;
    summaryTokenThreshold: number;
    ifAddNodeSummary: boolean;
    ifAddDocDescription: boolean;
    ifAddNodeText: boolean;
    ifAddNodeId: boolean;
}

/**
 * Merge user options with default configuration
 */
export function loadConfig(userOptions: PageIndexOptions, docName: string): ResolvedConfig {
    if (!userOptions.llm) {
        throw new Error('LLM function is required. Please provide an llm function in options.');
    }

    return {
        llm: userOptions.llm,
        docName: userOptions.docName || docName,
        tocCheckPageNum: userOptions.tocCheckPageNum ?? DEFAULT_CONFIG.tocCheckPageNum,
        maxPageNumEachNode: userOptions.maxPageNumEachNode ?? DEFAULT_CONFIG.maxPageNumEachNode,
        maxTokenNumEachNode: userOptions.maxTokenNumEachNode ?? DEFAULT_CONFIG.maxTokenNumEachNode,
        ifAddNodeId: userOptions.ifAddNodeId ?? DEFAULT_CONFIG.ifAddNodeId,
        ifAddNodeSummary: userOptions.ifAddNodeSummary ?? DEFAULT_CONFIG.ifAddNodeSummary,
        ifAddDocDescription: userOptions.ifAddDocDescription ?? DEFAULT_CONFIG.ifAddDocDescription,
        ifAddNodeText: userOptions.ifAddNodeText ?? DEFAULT_CONFIG.ifAddNodeText,
    };
}

/**
 * Merge user options with default markdown configuration
 */
export function loadMarkdownConfig(userOptions?: Partial<MarkdownOptions>): ResolvedMarkdownConfig {
    return {
        llm: userOptions?.llm,
        ifThinning: userOptions?.ifThinning ?? DEFAULT_MARKDOWN_CONFIG.ifThinning,
        thinningThreshold: userOptions?.thinningThreshold ?? DEFAULT_MARKDOWN_CONFIG.thinningThreshold,
        summaryTokenThreshold: userOptions?.summaryTokenThreshold ?? DEFAULT_MARKDOWN_CONFIG.summaryTokenThreshold,
        ifAddNodeSummary: userOptions?.ifAddNodeSummary ?? DEFAULT_MARKDOWN_CONFIG.ifAddNodeSummary,
        ifAddDocDescription: userOptions?.ifAddDocDescription ?? DEFAULT_MARKDOWN_CONFIG.ifAddDocDescription,
        ifAddNodeText: userOptions?.ifAddNodeText ?? DEFAULT_MARKDOWN_CONFIG.ifAddNodeText,
        ifAddNodeId: userOptions?.ifAddNodeId ?? DEFAULT_MARKDOWN_CONFIG.ifAddNodeId,
    };
}
