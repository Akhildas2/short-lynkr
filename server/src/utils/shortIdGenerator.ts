import { init } from '@paralleldrive/cuid2';

// Initialize generator
const generateCuid = init();

// Function to generate fixed-length short IDs
export const generateShortId = (length = 8) => {
    return generateCuid().slice(0, length);
};