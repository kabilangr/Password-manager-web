"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { RefreshCw, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { GENERATOR_VALUES } from "@/values/constants"

export function PasswordGenerator() {
    const [password, setPassword] = useState("")
    const [length, setLength] = useState(GENERATOR_VALUES.LIMITS.DEFAULT_LENGTH)
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
    })
    const [copied, setCopied] = useState(false)

    const generatePassword = useCallback(() => {
        const { CHAR_SETS } = GENERATOR_VALUES

        let chars = ""
        if (options.uppercase) chars += CHAR_SETS.UPPERCASE
        if (options.lowercase) chars += CHAR_SETS.LOWERCASE
        if (options.numbers) chars += CHAR_SETS.NUMBERS
        if (options.symbols) chars += CHAR_SETS.SYMBOLS

        if (chars === "") return

        let generated = ""
        const cryptoObj = window.crypto;
        const randomValues = new Uint32Array(length);
        cryptoObj.getRandomValues(randomValues);

        for (let i = 0; i < length; i++) {
            generated += chars[randomValues[i] % chars.length];
        }

        setPassword(generated)
        setCopied(false)
    }, [length, options])

    // Initial generation
    useEffect(() => {
        generatePassword()
    }, [generatePassword])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password)
        setCopied(true)
        toast.success("Password copied to clipboard")
        setTimeout(() => setCopied(false), GENERATOR_VALUES.COPIED_TIMEOUT_MS)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Password Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-2">
                    <Input
                        value={password}
                        readOnly
                        className="font-mono text-lg tracking-wider"
                    />
                    <Button variant="outline" size="icon" onClick={generatePassword}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>Length: {length}</Label>
                        </div>
                        <Slider
                            value={[length]}
                            onValueChange={(vals) => setLength(vals[0])}
                            min={GENERATOR_VALUES.LIMITS.MIN_LENGTH}
                            max={GENERATOR_VALUES.LIMITS.MAX_LENGTH}
                            step={1}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="uppercase"
                                checked={options.uppercase}
                                onCheckedChange={(c) => setOptions({ ...options, uppercase: c })}
                            />
                            <Label htmlFor="uppercase">Uppercase</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="lowercase"
                                checked={options.lowercase}
                                onCheckedChange={(c) => setOptions({ ...options, lowercase: c })}
                            />
                            <Label htmlFor="lowercase">Lowercase</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="numbers"
                                checked={options.numbers}
                                onCheckedChange={(c) => setOptions({ ...options, numbers: c })}
                            />
                            <Label htmlFor="numbers">Numbers</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="symbols"
                                checked={options.symbols}
                                onCheckedChange={(c) => setOptions({ ...options, symbols: c })}
                            />
                            <Label htmlFor="symbols">Symbols</Label>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

declare global {
    interface Window {
        msCrypto?: any;
    }
}
