import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"

export default async function VaultPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vault {id}</h1>
                    <p className="text-muted-foreground">Manage your secrets.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Secret
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">Google</TableCell>
                            <TableCell>me@example.com</TableCell>
                            <TableCell>google.com</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm">Copy</Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
