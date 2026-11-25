// The same password rules as the sign-up form ("Strong") and the Data Service:
// 8+ characters, an upper-case letter, a lower-case letter and a special character.

export const PASSWORD_RULES: { label: string; test: (p: string) => boolean }[] = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "An upper-case letter", test: (p) => /[A-Z]/.test(p) },
    { label: "A lower-case letter", test: (p) => /[a-z]/.test(p) },
    { label: "A special character, like ! @ # $ %", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export const isStrongPassword = (p: string) => PASSWORD_RULES.every((r) => r.test(p)) && p.length <= 72;
