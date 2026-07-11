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
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {

    const [register, switchToRegister] = useState<Boolean>(false);

    function handleSwitchToRegister() {
        switchToRegister((e) => !e);
    }

    const registerForm = {
        title: "Register to Expense Split",
        subTitile: "Register with you Email and Password",
        submitButton: "Register",
        switch: {
            question: "Already have an account?",
            button: "Login",
        }
    }

    const loginForm = {
        title: "Welcome Back",
        subTitile: "Login with you Email and Password",
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
                    <form>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    {/* <a
                                        href="#"
                                        className="ml-auto text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a> */}
                                </div>
                                <Input id="password" type="password" required />
                            </Field>
                            <Field>
                                <Button type="submit">{currentForm.submitButton}</Button>
                                <FieldDescription className="text-center">
                                    {currentForm.switch.question} <span className="text-blue-400 underline" onClick={handleSwitchToRegister}>{currentForm.switch.button}</span>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
            {/* <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </FieldDescription> */}
        </div>
    )
}
