import { auth } from "@/lib/auth"
import { adminCheck } from "@/utils/adminCheck"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { toast } from "sonner"

async function AdminPage() {
    const res = await adminCheck()
    if (res) {
        redirect("/admin/server-buttons")
    }
    else {
        redirect("/")
    }
}

export default AdminPage