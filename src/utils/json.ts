/**
 * JSON extraction and manipulation utilities
 */

/**
 * Extract JSON content from markdown code blocks
 */
export function getJsonContent(response: string): string {
    let content = response;

    const startIdx = content.indexOf('```json');
    if (startIdx !== -1) {
        content = content.substring(startIdx + 7);
    }

    const endIdx = content.lastIndexOf('```');
    if (endIdx !== -1) {
        content = content.substring(0, endIdx);
    }

    return content.trim();
}

/**
 * Extract and parse JSON from LLM response
 * Handles markdown code blocks and common formatting issues
 */
export function extractJson<T = unknown>(content: string): T {
    try {
        // First, try to extract JSON enclosed within ```json and ```
        let jsonContent = content;

        const startIdx = content.indexOf('```json');
        if (startIdx !== -1) {
            const afterStart = content.substring(startIdx + 7);
            const endIdx = afterStart.lastIndexOf('```');
            jsonContent = afterStart.substring(0, endIdx).trim();
        } else {
            jsonContent = content.trim();
        }

        // Clean up common issues
        jsonContent = jsonContent
            .replace(/None/g, 'null')  // Replace Python None with JSON null
            .replace(/\n/g, ' ')
            .replace(/\r/g, ' ');

        // Normalize whitespace
        jsonContent = jsonContent.split(/\s+/).join(' ');

        return JSON.parse(jsonContent) as T;
    } catch (error) {
        // Try to clean up further
        try {
            let jsonContent = content
                .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
                .replace(/,\s*}/g, '}'); // Remove trailing commas before }

            // Try extracting again
            const startIdx = jsonContent.indexOf('```json');
            if (startIdx !== -1) {
                const afterStart = jsonContent.substring(startIdx + 7);
                const endIdx = afterStart.lastIndexOf('```');
                jsonContent = afterStart.substring(0, endIdx).trim();
            }

            return JSON.parse(jsonContent) as T;
        } catch {
            console.error('Failed to parse JSON even after cleanup');
            return {} as T;
        }
    }
}

/**
 * Convert page field to integer
 */
export function convertPageToInt<T extends { page?: string | number }>(data: T[]): T[] {
    return data.map(item => {
        if (item.page !== undefined && typeof item.page === 'string') {
            const parsed = parseInt(item.page, 10);
            if (!isNaN(parsed)) {
                return { ...item, page: parsed };
            }
        }
        return item;
    });
}

/**
 * Convert physical_index string format to integer
 */
export function convertPhysicalIndexToInt<T extends { physicalIndex?: string | number | null }>(
    data: T[]
): T[] {
    return data.map(item => {
        if (item.physicalIndex !== undefined && item.physicalIndex !== null) {
            if (typeof item.physicalIndex === 'string') {
                // Handle format like "<physical_index_5>" or "physical_index_5"
                const match = item.physicalIndex.match(/physical_index_(\d+)/);
                if (match) {
                    return { ...item, physicalIndex: parseInt(match[1], 10) };
                }
            }
        }
        return item;
    });
}

/**
 * Convert a single physical index string to integer
 */
export function parsePhysicalIndex(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined) return null;

    if (typeof value === 'number') return value;

    if (typeof value === 'string') {
        const match = value.match(/physical_index_(\d+)/);
        if (match) {
            return parseInt(match[1], 10);
        }
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed)) return parsed;
    }

    return null;
}
