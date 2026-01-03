/**
 * Generates a unique inquiry ID.
 */
export const generateInquiryId = () => {
    return `INQ-${Date.now().toString(36).toUpperCase()}`;
};