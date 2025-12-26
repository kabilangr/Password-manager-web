"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import zxcvbn from "zxcvbn"

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, ...props }, ref) => {
        const [strength, setStrength] = React.useState(0)
        const [feedback, setFeedback] = React.useState("")

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value
            if (!val) {
                setStrength(0)
                setFeedback("")
            } else {
                const result = zxcvbn(val)
                setStrength(result.score) // 0-4
                setFeedback(result.feedback.warning || result.feedback.suggestions[0] || "")
            }
            props.onChange?.(e)
        }

        const getColor = (score: number) => {
            if (score === 0) return "bg-gray-200"
            if (score < 2) return "bg-red-500"
            if (score < 3) return "bg-yellow-500"
            if (score < 4) return "bg-blue-500"
            return "bg-green-500"
        }

        return (
            <div className="space-y-1">
                <Input
                    type="password"
                    className={cn(className)}
                    ref={ref}
                    {...props}
                    onChange={handleChange}
                />
                {props.value && (props.value as string).length > 0 && (
                    <div className="space-y-1">
                        <div className="flex h-1 gap-1 w-full mt-1">
                            {[0, 1, 2, 3].map((level) => (
                                <div
                                    key={level}
                                    className={cn(
                                        "h-full flex-1 rounded-full transition-all duration-300",
                                        strength > level ? getColor(strength) : "bg-gray-200"
                                    )}
                                />
                            ))}
                        </div>
                        {feedback && <p className="text-xs text-muted-foreground">{feedback}</p>}
                    </div>
                )}
            </div>
        )
    }
)
PasswordInput.displayName = "PasswordInput"
