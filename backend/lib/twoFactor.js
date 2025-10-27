import crypto from 'crypto';

/**
 * Generate a 6-digit verification code
 * @returns {string} 6-digit code
 */
export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate expiration time for verification code (10 minutes from now)
 * @returns {Date} Expiration timestamp
 */
export const generateCodeExpiration = () => {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Check if verification code is expired
 * @param {Date} expiration - Code expiration timestamp
 * @returns {boolean} True if expired
 */
export const isCodeExpired = (expiration) => {
    return new Date() > expiration;
};

/**
 * Validate verification code
 * @param {string} inputCode - User input code
 * @param {string} storedCode - Stored verification code
 * @param {Date} expiration - Code expiration timestamp
 * @returns {Object} Validation result
 */
export const validateVerificationCode = (inputCode, storedCode, expiration) => {
    if (!inputCode || !storedCode) {
        return { valid: false, reason: 'Missing verification code' };
    }

    if (inputCode !== storedCode) {
        return { valid: false, reason: 'Invalid verification code' };
    }

    if (isCodeExpired(expiration)) {
        return { valid: false, reason: 'Verification code has expired' };
    }

    return { valid: true };
};

/**
 * Clear verification code from user
 * @param {Object} user - User object
 */
export const clearVerificationCode = (user) => {
    user.twoStepVerificationCode = undefined;
    user.twoStepVerificationExpire = undefined;
};

/**
 * Set verification code for user
 * @param {Object} user - User object
 * @returns {string} Generated verification code
 */
export const setVerificationCode = (user) => {
    const code = generateVerificationCode();
    user.twoStepVerificationCode = code;
    user.twoStepVerificationExpire = generateCodeExpiration();
    return code;
};