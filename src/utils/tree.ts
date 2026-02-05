/**
 * Tree structure manipulation utilities
 */

import type { TreeNode, TocItem } from '../types';

/**
 * Assign sequential node IDs to a tree structure
 * Returns the next available node ID
 */
export function writeNodeId(data: TreeNode | TreeNode[], nodeId: number = 0): number {
    if (Array.isArray(data)) {
        for (const item of data) {
            nodeId = writeNodeId(item, nodeId);
        }
    } else {
        data.nodeId = String(nodeId).padStart(4, '0');
        nodeId++;
        if (data.nodes) {
            nodeId = writeNodeId(data.nodes, nodeId);
        }
    }
    return nodeId;
}

/**
 * Get all nodes from a tree structure as a flat list
 */
export function getNodes(structure: TreeNode | TreeNode[]): Omit<TreeNode, 'nodes'>[] {
    const nodes: Omit<TreeNode, 'nodes'>[] = [];

    if (Array.isArray(structure)) {
        for (const item of structure) {
            nodes.push(...getNodes(item));
        }
    } else {
        const { nodes: children, ...nodeWithoutChildren } = structure;
        nodes.push(nodeWithoutChildren);
        if (children) {
            nodes.push(...getNodes(children));
        }
    }

    return nodes;
}

/**
 * Convert structure to flat list (includes nodes property)
 */
export function structureToList(structure: TreeNode | TreeNode[]): TreeNode[] {
    const nodes: TreeNode[] = [];

    if (Array.isArray(structure)) {
        for (const item of structure) {
            nodes.push(...structureToList(item));
        }
    } else {
        nodes.push(structure);
        if (structure.nodes) {
            nodes.push(...structureToList(structure.nodes));
        }
    }

    return nodes;
}

/**
 * Get only leaf nodes from a tree structure
 */
export function getLeafNodes(structure: TreeNode | TreeNode[]): Omit<TreeNode, 'nodes'>[] {
    const leaves: Omit<TreeNode, 'nodes'>[] = [];

    if (Array.isArray(structure)) {
        for (const item of structure) {
            leaves.push(...getLeafNodes(item));
        }
    } else {
        if (!structure.nodes || structure.nodes.length === 0) {
            const { nodes: _, ...nodeWithoutChildren } = structure;
            leaves.push(nodeWithoutChildren);
        } else {
            leaves.push(...getLeafNodes(structure.nodes));
        }
    }

    return leaves;
}

/**
 * Check if a node is a leaf node
 */
export function isLeafNode(data: TreeNode | TreeNode[], nodeId: string): boolean {
    const findNode = (structure: TreeNode | TreeNode[]): TreeNode | null => {
        if (Array.isArray(structure)) {
            for (const item of structure) {
                const found = findNode(item);
                if (found) return found;
            }
            return null;
        }

        if (structure.nodeId === nodeId) return structure;
        if (structure.nodes) {
            return findNode(structure.nodes);
        }
        return null;
    };

    const node = findNode(data);
    return node !== null && (!node.nodes || node.nodes.length === 0);
}

/**
 * Get parent structure code (e.g., "1.2" from "1.2.3")
 */
function getParentStructure(structure: string | undefined): string | null {
    if (!structure) return null;
    const parts = structure.split('.');
    return parts.length > 1 ? parts.slice(0, -1).join('.') : null;
}

/**
 * Convert flat list with structure indices to hierarchical tree
 */
export function listToTree(data: TocItem[]): TreeNode[] {
    const nodes: Map<string, TreeNode> = new Map();
    const rootNodes: TreeNode[] = [];

    for (const item of data) {
        const structure = item.structure || '';
        const node: TreeNode = {
            title: item.title,
            startIndex: item.physicalIndex ?? undefined,
            endIndex: undefined,
            nodes: [],
        };

        nodes.set(structure, node);

        const parentStructure = getParentStructure(structure);
        if (parentStructure && nodes.has(parentStructure)) {
            nodes.get(parentStructure)!.nodes!.push(node);
        } else {
            rootNodes.push(node);
        }
    }

    // Clean empty nodes arrays
    const cleanNode = (node: TreeNode): TreeNode => {
        if (!node.nodes || node.nodes.length === 0) {
            delete node.nodes;
        } else {
            node.nodes = node.nodes.map(cleanNode);
        }
        return node;
    };

    return rootNodes.map(cleanNode);
}

/**
 * Remove text field from structure
 */
export function removeStructureText(data: TreeNode | TreeNode[]): void {
    if (Array.isArray(data)) {
        for (const item of data) {
            removeStructureText(item);
        }
    } else {
        delete data.text;
        if (data.nodes) {
            removeStructureText(data.nodes);
        }
    }
}

/**
 * Reorder keys in an object
 */
function reorderDict<T extends Record<string, unknown>>(data: T, keyOrder: string[]): T {
    if (!keyOrder.length) return data;

    const result: Record<string, unknown> = {};
    for (const key of keyOrder) {
        if (key in data) {
            result[key] = data[key];
        }
    }
    return result as T;
}

/**
 * Format structure with specified key order
 */
export function formatStructure(
    structure: TreeNode | TreeNode[],
    order?: string[]
): TreeNode | TreeNode[] {
    if (!order) return structure;

    if (Array.isArray(structure)) {
        return structure.map(item => formatStructure(item, order) as TreeNode);
    }

    const formatted = { ...structure };

    if (formatted.nodes) {
        formatted.nodes = formatStructure(formatted.nodes, order) as TreeNode[];
    }

    if (!formatted.nodes || formatted.nodes.length === 0) {
        delete formatted.nodes;
    }

    return reorderDict(formatted, order);
}

/**
 * Remove specified fields from structure
 */
export function removeFields(
    data: TreeNode | TreeNode[],
    fields: string[] = ['text']
): TreeNode | TreeNode[] {
    if (Array.isArray(data)) {
        return data.map(item => removeFields(item, fields) as TreeNode);
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        if (!fields.includes(key)) {
            if (key === 'nodes' && Array.isArray(value)) {
                result[key] = removeFields(value as TreeNode[], fields);
            } else {
                result[key] = value;
            }
        }
    }
    return result as unknown as TreeNode;
}

/**
 * Print tree structure as table of contents
 */
export function printToc(tree: TreeNode[], indent: number = 0): void {
    for (const node of tree) {
        console.log('  '.repeat(indent) + node.title);
        if (node.nodes) {
            printToc(node.nodes, indent + 1);
        }
    }
}
