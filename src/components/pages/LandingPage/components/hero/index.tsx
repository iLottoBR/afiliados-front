import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import bgHero from '@/assets/bg-hero.jpg' // ajuste o caminho conforme seu projeto

function Hero() {
    return (
        <section className="w-full py-12 md:py-24 px-6 relative overflow-hidden">
            <div className=" inset-0 -z-10">
                <Image
                    src={bgHero}
                    alt="Hero"
                    className="object-cover md:object-fit object-[right] md:object-[center] opacity-60 min-h-[300px]"
                    fill
                    sizes="100vw"
                    quality={100}
                    priority
                />
                <div className="absolute inset-0 bg-black/10 md:hidden"></div>
            </div>

            <div className="max-w-3xl w-full mx-auto text-center space-y-8 text-primary relative z-10 min-h-[300px] flex flex-col justify-between">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    Programa de Afiliados
                </h1>

                {/* <p className="text-xl max-w-2xl mx-auto text-[#1A1A2E]">
                    Transforme seu alcance em resultados. Indique clientes, construa sua
                    rede e ganhe comissões em dois níveis com nosso programa exclusivo
                    de afiliados.
                </p> */}

                <div className="pt-6">
                    <Link href="/cadastro">
                        <Button
                            size="lg"
                            className="px-4 xl:px-4 bg-gradient-to-b from-myBuyersButton-bgFrom to-myBuyersButton-bgTo text-myBuyersButton-textColor"
                        >
                            Quero ser Afiliado
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default Hero
