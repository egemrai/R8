import { Container } from "@/components/egem-ui/Container"
import style from './admin.module.css'
import AdminLeftPanel from "@/app/admin/_components/admin-left-panel";

export async function AccountLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <>

            <Container >
                <div className={`${style.grid_div}`}>
                    <AdminLeftPanel />
                    <div>
                        {children}
                    </div>

                </div>



            </Container>


        </>
    )

}

export default AccountLayout