"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "@/assets/orp-dark.png"
import { usePathname } from "next/navigation";

function Header() {
    const pathname = usePathname();
    const isHome = pathname === '/';

    return (
        <header className="w-full py-4 px-6 md:px-20 flex items-center justify-between bg-background border-b border-border">
            <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-foreground">
                    <Image
                        src={logo}
                        alt="logo-wl"
                        className="object-fill w-[150px]"
                    />
                </Link>
            </div>
            <div className="flex items-center gap-4">
                {/* <Link href="/login">
                    <Button variant="outline">Entrar</Button>
                </Link> */}
                {isHome && (
                    <Link href="/cadastro">
                        <Button className="md:text-lg text-sm px-3 py-1">
                            Quero ser Afiliado
                        </Button>
                    </Link>
                )}
            </div>
        </header>
    );
}

export default Header;
