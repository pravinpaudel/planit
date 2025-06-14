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

    // Second pass: Build the hierarchy (parent-child relationships)
    milestones.forEach(milestone => {
        if (milestone.parentId && milestoneMap[milestone.parentId]) {
            // Store the whole milestone object in the children array
            // This matches the Milestone interface where children is Milestone[]
            milestoneMap[milestone.parentId].children?.push(milestoneMap[milestone.id]);
        }
    });

    return milestoneMap;
};

export default transformToFrontendState;
