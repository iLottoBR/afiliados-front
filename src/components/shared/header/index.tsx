"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "@/assets/orp-white.png"
import { usePathname } from "next/navigation";

function Header() {
    const pathname = usePathname();
    const isHome = pathname === '/';

    return (
        <header className="w-full py-4 px-6 md:px-20 flex items-center justify-between bg-gradient-to-b from-primary to-primary-600 border-b border-border">
            <div className="flex items-center gap-3 max-w-[150px]">
                <Link href="/" className="text-xl font-bold text-foreground">
                    <Image
                        src={logo}
                        alt="logo-wl"
                        className="object-fill max-w-full max-h-[40px]"
                    />
                </Link>
            </div>
            <div className="flex items-center gap-4">
                {/* <Link href="/login">
                    <Button variant="outline">Entrar</Button>
                </Link> */}
                {isHome && (
                    <Link href="/cadastro">
                        <Button className="px-4 xl:px-4 bg-gradient-to-b from-myBuyersButton-bgFrom to-myBuyersButton-bgTo text-myBuyersButton-textColor">
                            Quero ser Afiliado
                        </Button>
                    </Link>
                )}
            </div>
        </header>
    );
}

export default Header;
