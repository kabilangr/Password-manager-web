import { TwoFactorSettings } from "@/components/user/two-factor-settings"
import { SessionsList } from "@/components/user/sessions-list"
import { PasswordGenerator } from "@/components/tools/password-generator"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings & Tools</h1>
                <p className="text-muted-foreground">Manage your account security and access utilities.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <TwoFactorSettings />
                    <SessionsList />
                </div>
                <div>
                    <PasswordGenerator />
                </div>
            </div>
        </div>
    )
}
