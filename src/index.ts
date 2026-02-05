/**
 * PageIndex - Framework-agnostic document indexing library
 *
 * Key design:
 * - User provides their own LLM function (OpenAI, Anthropic, Gemini, local models, etc.)
 * - User provides the markdown (can use any OCR/PDF library they want)
 */

// Main functions
export { mdToTree, mdFileToTree } from './markdown';

// Types
export type {
    LLMFunction,
    PageIndexOptions,
    MarkdownOptions,
    TreeNode,
    PageIndexResult,
    PageContent,
    TocItem,
    DocumentInput,
} from './types';

// Utilities
export {
    writeNodeId,
    getNodes,
    structureToList,
    getLeafNodes,
    isLeafNode,
    listToTree,
    removeStructureText,
    formatStructure,
    removeFields,
    printToc,
} from './utils/tree';

export { extractJson, getJsonContent } from './utils/json';
