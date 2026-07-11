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
export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {

    const [register, switchToRegister] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const loginApi = useApi(API.login);
    const registerApi = useApi(API.register);

    const isLoading = register ? registerApi.loading : loginApi.loading;
    const apiError = register ? registerApi.error : loginApi.error;

    function handleSwitchToRegister() {
        switchToRegister((e) => !e);
        loginApi.reset();
        registerApi.reset();
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (register) {
                const data = await registerApi.execute({
                    method: "POST",
                    body: { email, password }
                });
                console.log("Register successful:", data);
            } else {
                const data = await loginApi.execute({
                    method: "POST",
                    body: { email, password }
                });
                console.log("Login successful:", data);
            }
        } catch (err) {
            console.error("Authentication error:", err);
        }
    };

    const registerForm = {
        title: "Register to Expense Split",
        subTitile: "Register with your Email and Password",
        submitButton: "Register",
        switch: {
            question: "Already have an account?",
            button: "Login",
        }
    }

    const loginForm = {
        title: "Welcome Back",
        subTitile: "Login with your Email and Password",
        submitButton: "Login",
        switch: {
            question: "Don't have an account?",
            button: "Register",
        }
    }

    const currentForm = register ? registerForm : loginForm;

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
                            </Field>

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
                                        onClick={handleSwitchToRegister}
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
