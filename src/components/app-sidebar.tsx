import { Home, Settings, Lock, Users, Key } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter, // Added import
} from "@/components/ui/sidebar"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"

const items = [
    {
        title: "All Vaults",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "My Secrets",
        url: "/dashboard/secrets",
        icon: Key,
    },
    {
        title: "Organization",
        url: "/dashboard/organization",
        icon: Users,
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 p-4 text-primary">
                    <Lock className="h-6 w-6" />
                    <span className="font-bold text-xl">CipherVault</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="p-2">
                    <ModeToggle />
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
