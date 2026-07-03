/**
 * Validates whether the given string is a properly formatted email address.
 * @param email - The email string to validate
 * @returns `true` if it IS a valid email, `false` if it is NOT
 * Usage: if (isValidEmail(email)) { proceed }
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
