import CadastroLayout from "@/components/shared/layouts/CadastroLayout";

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <CadastroLayout>
            {children}
        </CadastroLayout>
    )
}

export default Layout;