// Branch code to name mapping (extracted from Excel row 3)
export const BRANCH_NAMES: Record<string, string> = {
    'A': 'Chemical Engineering',
    'B': 'Civil Engineering',
    'C': 'Computer Engineering',
    'CSE': 'Computer Science Engineering',
    'D': 'Electrical Engineering',
    'E': 'Electronics Instrumentation Engineering',
    'F': 'Electronics and Communication Engineering',
    'G': 'Biotechnology Engineering',
    'H': 'Mechanical Engineering',
    'I': 'Mechatronics Engineering',
    'J': 'Biomedical Engineering',
    'O': 'Electronics and Computer Engineering',
    'P': 'Computer Science Engineering',
    'Q': 'Computer Science Engineering',
    'R': 'Computer Science and Business Systems',
    'S': 'Electrical and Computer Engineering',
    'U': 'Civil with Computer Application',
    'V': 'Electronics Engineering (VLSI Design)',
    'W': 'Robotics and Artificial Intelligence',
    'X': 'Cross-disciplinary',
}

// Get display name for branch code
export function getBranchDisplayName(code: string): string {
    return BRANCH_NAMES[code] || code
}

// Extract branch code from subgroup (e.g., 2CSE1 -> CSE, 3C11 -> C)
export function extractBranchCode(subgroup: string): string {
    const match = subgroup.match(/^\d([A-Z]+)\d+$/)
    return match ? match[1] : ''
}

// Extract pool from subgroup (e.g., 1A11 -> A, 1B23 -> B)
export function extractPool(subgroup: string): string {
    const match = subgroup.match(/^1([AB])\d+$/)
    return match ? match[1] : ''
}
