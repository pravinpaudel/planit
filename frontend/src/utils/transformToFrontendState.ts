import { Milestone } from "../types";

/**
 * Transforms an array of milestone objects into a hierarchical structure.
 * @param milestones - Array of milestones to transform
 * @returns A record mapping milestone IDs to their transformed state
 */
const transformToFrontendState = (milestones: Milestone[]): Record<string, Milestone> => {
    const milestoneMap: Record<string, Milestone> = {};
    
    // First pass: Create basic milestone objects
    milestones.forEach(milestone => {
        milestoneMap[milestone.id] = {
            ...milestone,
            children: [] // Initialize children as an empty array
        };
    });

    // Create a temporary map to preserve child order
    const childOrderMap: Record<string, string[]> = {};
    
    // Collect child IDs in order for each parent
    milestones.forEach(milestone => {
        if (milestone.parentId && milestoneMap[milestone.parentId]) {
            if (!childOrderMap[milestone.parentId]) {
                childOrderMap[milestone.parentId] = [];
            }
            childOrderMap[milestone.parentId].push(milestone.id);
        }
    });
    
    // Second pass: Build the hierarchy (parent-child relationships)
    // Use the preserved order from childOrderMap
    Object.entries(childOrderMap).forEach(([parentId, childIds]) => {
        if (milestoneMap[parentId]) {
            // Add children in the same order they were provided in the original array
            milestoneMap[parentId].children = childIds.map(id => milestoneMap[id]);
        }
    });

    return milestoneMap;
};

export default transformToFrontendState;
