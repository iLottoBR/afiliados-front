import { ReactNode } from "react";
import Header from "../header";
import Image from "next/image";
import bgHero from '@/assets/WhatsApp Image 2025-05-15 at 5.24.11 PM.jpeg'

function CadastroLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-hero-pattern flex flex-col">
            <Header />
            <div className="z-10 md:w-full md:h-full">
                <Image
                    src={bgHero}
                    alt="Hero"
                    className="object-cover object-[85%_center] md:object-fill md:object-[center] w-full h-full"
                    fill
                    quality={100}
                    priority
                />
            </div>
            <div className="z-20 bg-transparent">
                {children}
            </div>
        </div>
    )
}

export default CadastroLayout;