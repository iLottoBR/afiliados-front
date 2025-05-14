import { ReactNode } from "react";
import Header from "../header";

function CadastroLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <>
                {children}
            </>
        </div>
    )
}

export default CadastroLayout;