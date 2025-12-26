import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Vaults</h1>
                <Button className="bg-gradient-to-r from-primary to-secondary text-white border-none shadow-md shadow-primary/20 hover:scale-105 transition-transform">
                    <Plus className="mr-2 h-4 w-4" /> New Vault
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Placeholders */}
                {["Personal", "Work", "Family"].map((name, i) => (
                    <Link href={`/dashboard/vaults/${i}`} key={i}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                            <CardHeader>
                                <CardTitle>{name} Vault</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{(i + 1) * 5} Secrets</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
