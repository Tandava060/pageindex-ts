/**
 * Markdown parsing utilities
 */

import { estimateTokens } from '../config';

/** Internal node representation during parsing */
export interface MarkdownNode {
    title: string;
    lineNum: number;
    level: number;
    text?: string;
    textTokenCount?: number;
}

/**
 * Extract header nodes from markdown content
 */
export function extractNodesFromMarkdown(
    markdownContent: string
): { nodeList: Array<{ nodeTitle: string; lineNum: number }>; lines: string[] } {
    const headerPattern = /^(#{1,6})\s+(.+)$/;
    const codeBlockPattern = /^```/;
    const nodeList: Array<{ nodeTitle: string; lineNum: number }> = [];

    const lines = markdownContent.split('\n');
    let inCodeBlock = false;

    for (let lineNum = 1; lineNum <= lines.length; lineNum++) {
        const line = lines[lineNum - 1];
        const strippedLine = line.trim();

        if (codeBlockPattern.test(strippedLine)) {
            inCodeBlock = !inCodeBlock;
            continue;
        }

        if (!strippedLine) continue;

        if (!inCodeBlock) {
            const match = strippedLine.match(headerPattern);
            if (match) {
                const title = match[2].trim();
                nodeList.push({ nodeTitle: title, lineNum });
            }
        }
    }

    return { nodeList, lines };
}

/**
 * Extract text content for each node
 */
export function extractNodeTextContent(
    nodeList: Array<{ nodeTitle: string; lineNum: number }>,
    markdownLines: string[]
): MarkdownNode[] {
    const allNodes: MarkdownNode[] = [];

    for (const node of nodeList) {
        const lineContent = markdownLines[node.lineNum - 1];
        const headerMatch = lineContent.match(/^(#{1,6})/);

        if (!headerMatch) continue;

        allNodes.push({
            title: node.nodeTitle,
            lineNum: node.lineNum,
            level: headerMatch[1].length,
        });
    }

    for (let i = 0; i < allNodes.length; i++) {
        const node = allNodes[i];
        const startLine = node.lineNum - 1;
        const endLine = i + 1 < allNodes.length
            ? allNodes[i + 1].lineNum - 1
            : markdownLines.length;

        node.text = markdownLines.slice(startLine, endLine).join('\n').trim();
    }

    return allNodes;
}

/**
 * Find all children of a parent node
 */
function findAllChildren(parentIndex: number, parentLevel: number, nodeList: MarkdownNode[]): number[] {
    const childrenIndices: number[] = [];

    for (let i = parentIndex + 1; i < nodeList.length; i++) {
        if (nodeList[i].level <= parentLevel) break;
        childrenIndices.push(i);
    }

    return childrenIndices;
}

/**
 * Update node list with cumulative text token counts
 */
export function updateNodeListWithTextTokenCount(
    nodeList: MarkdownNode[]
): MarkdownNode[] {
    const resultList = [...nodeList];

    for (let i = resultList.length - 1; i >= 0; i--) {
        const currentNode = resultList[i];
        const childrenIndices = findAllChildren(i, currentNode.level, resultList);

        let totalText = currentNode.text || '';

        for (const childIndex of childrenIndices) {
            const childText = resultList[childIndex].text;
            if (childText) {
                totalText += '\n' + childText;
            }
        }

        resultList[i].textTokenCount = estimateTokens(totalText);
    }

    return resultList;
}

/**
 * Apply tree thinning to merge small nodes
 */
export function treeThinningForIndex(
    nodeList: MarkdownNode[],
    minNodeToken: number
): MarkdownNode[] {
    const resultList = [...nodeList];
    const nodesToRemove = new Set<number>();

    for (let i = resultList.length - 1; i >= 0; i--) {
        if (nodesToRemove.has(i)) continue;

        const currentNode = resultList[i];
        const totalTokens = currentNode.textTokenCount || 0;

        if (totalTokens < minNodeToken) {
            const childrenIndices = findAllChildren(i, currentNode.level, resultList);

            const childrenTexts: string[] = [];
            for (const childIndex of childrenIndices.sort((a, b) => a - b)) {
                if (!nodesToRemove.has(childIndex)) {
                    const childText = resultList[childIndex].text;
                    if (childText?.trim()) {
                        childrenTexts.push(childText);
                    }
                    nodesToRemove.add(childIndex);
                }
            }

            if (childrenTexts.length > 0) {
                let mergedText = currentNode.text || '';
                for (const childText of childrenTexts) {
                    if (mergedText && !mergedText.endsWith('\n')) {
                        mergedText += '\n\n';
                    }
                    mergedText += childText;
                }

                resultList[i].text = mergedText;
                resultList[i].textTokenCount = estimateTokens(mergedText);
            }
        }
    }

    const indicesToRemove = Array.from(nodesToRemove).sort((a, b) => b - a);
    for (const index of indicesToRemove) {
        resultList.splice(index, 1);
    }

    return resultList;
}
