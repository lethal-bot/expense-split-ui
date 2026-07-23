export type formType = 'login' | 'register' | 'verifyOtp' | 'forgetPassword';

export interface form {
    title: string,
    subTitile: string,
    submitButton: string,
    switch: {
        question: string,
        button: string,
    }
}
export const verifyOtpForm: form = {
    title: "Verify OTP",
    subTitile: "Enter Otp sent to your email",
    submitButton: "Verify",
    switch: {
        question: "Don't have an account?",
        button: "Register",
    }
}

export const registerForm: form = {
    title: "Register to Expense Split",
    subTitile: "Register with your Email and Password",
    submitButton: "Register",
    switch: {
        question: "Already have an account?",
        button: "Login",
    }
}

export const loginForm: form = {
    title: "Welcome Back",
    subTitile: "Login with your Email and Password",
    submitButton: "Login",
    switch: {
        question: "Don't have an account?",
        button: "Register",
    }
}

export const forgetPasswordForm: form = {
    title: "Forget Password",
    subTitile: "Enter your email address to reset your password",
    submitButton: "Send OTP",
    switch: {
        question: "Already have an account?",
        button: "Login",
    }
}