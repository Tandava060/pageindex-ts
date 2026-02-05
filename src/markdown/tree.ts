/**
 * Markdown tree building utilities
 */

import type { TreeNode } from '../types';
import type { MarkdownNode } from './parser';

/**
 * Build hierarchical tree from flat node list
 */
export function buildTreeFromNodes(nodeList: MarkdownNode[]): TreeNode[] {
    if (nodeList.length === 0) return [];

    const stack: Array<{ node: TreeNode; level: number }> = [];
    const rootNodes: TreeNode[] = [];
    let nodeCounter = 1;

    for (const node of nodeList) {
        const currentLevel = node.level;

        const treeNode: TreeNode = {
            title: node.title,
            nodeId: String(nodeCounter).padStart(4, '0'),
            text: node.text,
            startIndex: node.lineNum,
            nodes: [],
        };
        nodeCounter++;

        // Pop nodes from stack until we find parent
        while (stack.length > 0 && stack[stack.length - 1].level >= currentLevel) {
            stack.pop();
        }

        if (stack.length === 0) {
            rootNodes.push(treeNode);
        } else {
            const parent = stack[stack.length - 1].node;
            parent.nodes!.push(treeNode);
        }

        stack.push({ node: treeNode, level: currentLevel });
    }

    return rootNodes;
}

/**
 * Clean tree by removing empty nodes arrays
 */
export function cleanTreeForOutput(treeNodes: TreeNode[]): TreeNode[] {
    return treeNodes.map(node => {
        const cleanedNode: TreeNode = {
            title: node.title,
            nodeId: node.nodeId,
            text: node.text,
            startIndex: node.startIndex,
        };

        if (node.nodes && node.nodes.length > 0) {
            cleanedNode.nodes = cleanTreeForOutput(node.nodes);
        }

        return cleanedNode;
    });
}
