'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState, FormEvent } from "react"
import { useApi } from "@/hooks/useApi"
import { API } from "@/utils/Api"
import { type formType, type form, registerForm, loginForm, verifyOtpForm, forgetPasswordForm } from "./util"
import { useRouter, useSearchParams } from "next/navigation"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {

    const router = useRouter();
    const searchParams = useSearchParams();


    const [formType, setFormType] = useState<formType>('login');
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [otp, setOtp] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");

    const formConfig: Record<formType, form> = {
        login: loginForm,
        register: registerForm,
        verifyOtp: verifyOtpForm,
        forgetPassword: forgetPasswordForm,
    }



    const loginApi = useApi(API.login);
    const registerApi = useApi(API.register);
    const otpVerificationAfterRegisterApi = useApi(API.otpVerificationAfterRegister);
    const forgetPasswordSendOtpApi = useApi(API.forgetPasswordSendOtp);
    const otpVerificationAfterForgetPasswordApi = useApi(API.otpVerificationAfterForgetPassword);

    const getActiveApi = () => {
        if (formType === 'register') return registerApi;
        if (formType === 'login') return loginApi;
        if (formType === 'forgetPassword') return forgetPasswordSendOtpApi;
        if (formType === 'verifyOtp') {
            const tab = searchParams.get('tab');
            if (tab === 'registerOtp') return otpVerificationAfterRegisterApi;
            if (tab === 'forgetPasswordOtp') return otpVerificationAfterForgetPasswordApi;
        }
        return loginApi;
    };

    const activeApi = getActiveApi();
    const isLoading = activeApi.loading;
    const apiError = activeApi.error;


    function handleFormChange(type: formType) {
        loginApi.reset();
        registerApi.reset();
        otpVerificationAfterRegisterApi.reset();
        forgetPasswordSendOtpApi.reset();
        otpVerificationAfterForgetPasswordApi.reset();
        setNewPassword("");
        if (formType == "register") {
            setNewPassword("");
        } else if (formType == "forgetPassword") {
            setNewPassword("");
            setPassword("");
        } else if (formType == "verifyOtp") {
            setNewPassword("");
            setPassword("");
            setName("");
            setOtp("");
        } else if (formType == "login") {
            setEmail("");
            setPassword("");
        }
        setFormType(type);
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            if (formType === 'register') {
                const response = await registerApi.execute({
                    method: "POST",
                    body: { email }
                });
                console.log("Register successful:", response);
                // localStorage.setItem('token', response.data.token);
                handleFormChange("verifyOtp" as formType)
                router.push("/login?tab=registerOtp")
            } else if (formType === 'forgetPassword') {
                const response = await forgetPasswordSendOtpApi.execute({
                    method: "POST",
                    body: { email }
                });
                console.log("forget password successful:", response);
                handleFormChange("verifyOtp" as formType)
                router.push('/login?tab=forgetPasswordOtp');
            } else if (formType === 'verifyOtp') {
                const typeOfOtp = searchParams.get('tab');
                if (typeOfOtp === 'registerOtp') {
                    const response = await otpVerificationAfterRegisterApi.execute({
                        method: "POST",
                        body: { name, email, password, otp }
                    });
                    localStorage.setItem('token', response.data.token);
                } else if (typeOfOtp === 'forgetPasswordOtp') {
                    const response = await otpVerificationAfterForgetPasswordApi.execute({
                        method: "POST",
                        body: { email, newPassword, otp }
                    });
                }
                handleFormChange("login" as formType)
                router.push('/login');
            }
            else {
                const response = await loginApi.execute({
                    method: "POST",
                    body: { email, password }
                });
                console.log("Login successful:", response);
                localStorage.setItem('token', response.data.token);
                router.push("/")
            }
        } catch (err) {
            console.error("Authentication error:", err);
        }
    };







    const currentForm: form = formConfig[formType];

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">{currentForm.title}</CardTitle>
                    <CardDescription>
                        {currentForm.subTitile}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            {formType === 'register' && (
                                <Field>
                                    <FieldLabel htmlFor="name">Name</FieldLabel>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter Your Name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </Field>
                            )}
                            {formType !== 'verifyOtp' && (
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </Field>
                            )}
                            {formType !== 'verifyOtp' && formType !== 'forgetPassword' && (
                                <Field>
                                    <div className="flex items-center">
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    {formType == "login" && <span
                                        className="text-blue-400 text-xs underline cursor-pointer hover:text-blue-500 transition-colors text-right"
                                        onClick={() => handleFormChange("forgetPassword" as formType)}
                                    >
                                        Forget Password
                                    </span>}
                                </Field>)}
                            {formType === 'verifyOtp' && (
                                <Field>
                                    <FieldLabel htmlFor="otp">OTP</FieldLabel>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="Enter OTP"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </Field>

                            )}
                            {searchParams.get("tab") == "forgetPasswordOtp" && (
                                <Field>
                                    <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        placeholder="Enter New Password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </Field>
                            )}

                            {apiError && (
                                <div className="text-sm text-red-500 font-medium text-center">
                                    {apiError.message}
                                </div>
                            )}

                            <Field>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Processing..." : currentForm.submitButton}
                                </Button>
                                <FieldDescription className="text-center">
                                    {currentForm.switch.question}{" "}
                                    <span
                                        className="text-blue-400 underline cursor-pointer hover:text-blue-500 transition-colors"
                                        onClick={() => handleFormChange(currentForm.switch.button.toLowerCase() as formType)}
                                    >
                                        {currentForm.switch.button}
                                    </span>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
