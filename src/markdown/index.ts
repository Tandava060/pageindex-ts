/**
 * Main Markdown processing module
 */

import * as fs from 'fs';
import * as path from 'path';
import type { TreeNode, MarkdownOptions, PageIndexResult, LLMFunction } from '../types';
import { loadMarkdownConfig, estimateTokens } from '../config';
import {
    extractNodesFromMarkdown,
    extractNodeTextContent,
    updateNodeListWithTextTokenCount,
    treeThinningForIndex,
} from './parser';
import { buildTreeFromNodes, cleanTreeForOutput } from './tree';
import { writeNodeId, structureToList, formatStructure } from '../utils/tree';

/**
 * Generate summary for a node
 */
async function getNodeSummary(
    node: TreeNode,
    summaryTokenThreshold: number,
    llm: LLMFunction,
): Promise<string> {
    const nodeText = node.text || '';
    const numTokens = estimateTokens(nodeText);

    if (numTokens < summaryTokenThreshold) {
        return nodeText;
    }

    const prompt = `You are given a part of a document, your task is to generate a description of the partial document about what are main points covered in the partial document.

Partial Document Text: ${nodeText}

Directly return the description, do not include any other text.`;

    return await llm(prompt);
}

/**
 * Generate summaries for all nodes
 */
async function generateSummariesForStructureMd(
    structure: TreeNode[],
    summaryTokenThreshold: number,
    llm: LLMFunction
): Promise<void> {
    const nodes = structureToList(structure);

    const summaryPromises = nodes.map(node =>
        getNodeSummary(node, summaryTokenThreshold, llm)
    );
    const summaries = await Promise.all(summaryPromises);

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!node.nodes || node.nodes.length === 0) {
            node.summary = summaries[i];
        } else {
            node.prefixSummary = summaries[i];
        }
    }
}

/**
 * Generate document description
 */
async function generateDocDescription(structure: TreeNode[], llm: LLMFunction): Promise<string> {
    const cleanStructure = structure.map(node => ({
        title: node.title,
        nodeId: node.nodeId,
        summary: node.summary,
        prefixSummary: node.prefixSummary,
    }));

    const prompt = `Your are an expert in generating descriptions for a document.
You are given a structure of a document. Your task is to generate a one-sentence description for the document, which makes it easy to distinguish the document from other documents.
    
Document Structure: ${JSON.stringify(cleanStructure)}

Directly return the description, do not include any other text.`;

    return await llm(prompt);
}

/**
 * Convert markdown content to tree structure
 * 
 * @param content - Markdown content as string (user provides the text!)
 * @param docName - Document name for output
 * @param options - Configuration options including optional LLM function for summaries
 */
export async function mdToTree(
    content: string,
    docName: string,
    options?: Partial<MarkdownOptions>
): Promise<PageIndexResult> {
    const config = loadMarkdownConfig(options);
    // Extract nodes from markdown
    const { nodeList, lines } = extractNodesFromMarkdown(content);
    let nodesWithContent = extractNodeTextContent(nodeList, lines);

    // Apply tree thinning if enabled
    if (config.ifThinning) {
        nodesWithContent = updateNodeListWithTextTokenCount(nodesWithContent);
        nodesWithContent = treeThinningForIndex(nodesWithContent, config.thinningThreshold);
    }

    // Build tree
    let treeStructure = buildTreeFromNodes(nodesWithContent);

    // Add node IDs
    if (config.ifAddNodeId) {
        writeNodeId(treeStructure);
    }

    // Define key order
    const keyOrder = ['title', 'nodeId', 'summary', 'prefixSummary', 'text', 'startIndex', 'nodes'];

    // Generate summaries if requested and LLM provided
    if (config.ifAddNodeSummary && config.llm) {
        treeStructure = formatStructure(treeStructure, keyOrder) as TreeNode[];
        await generateSummariesForStructureMd(
            treeStructure,
            config.summaryTokenThreshold,
            config.llm
        );

        if (!config.ifAddNodeText) {
            const orderWithoutText = keyOrder.filter(k => k !== 'text');
            treeStructure = formatStructure(treeStructure, orderWithoutText) as TreeNode[];
        }
    } else {
        const order = config.ifAddNodeText
            ? keyOrder
            : keyOrder.filter(k => k !== 'text');
        treeStructure = formatStructure(treeStructure, order) as TreeNode[];
    }

    const result: PageIndexResult = {
        docName,
        structure: treeStructure,
    };

    // Add document description if requested
    if (config.ifAddDocDescription && config.ifAddNodeSummary && config.llm) {
        result.docDescription = await generateDocDescription(treeStructure, config.llm);
    }

    return result;
}

/**
 * Convenience function to read markdown file and convert to tree
 */
export async function mdFileToTree(
    mdPath: string,
    options?: Partial<MarkdownOptions>
): Promise<PageIndexResult> {
    const content = fs.readFileSync(mdPath, 'utf-8');
    const docName = path.basename(mdPath, path.extname(mdPath));
    return mdToTree(content, docName, options);
}
