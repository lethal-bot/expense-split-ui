const baseURL = "https://expense-split-api-43zz.onrender.com";

export const API = {
    login: baseURL + "/api/v1/auth/login",
    register: baseURL + "/api/v1/auth/send-otp-for-registration",
    otpVerificationAfterRegister: baseURL + "/api/v1/auth/register",
    forgetPasswordSendOtp: baseURL + "/api/v1/auth/send-otp-for-verified-user",
    otpVerificationAfterForgetPassword: baseURL + "/api/v1/auth/forget-password",
    searchUser: baseURL + "/api/v1/user",
    createGroup: baseURL + "/api/v1/group/create-group"
}