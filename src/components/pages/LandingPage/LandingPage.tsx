import Header from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Head from "next/head";
import Hero from "./components/hero";

function LandingPage() {
    return (
        <>
            <Head>
                <title>Programa de Afiliados iLotto - Transforme seu alcance em resultados</title>
                <meta name="description" content="Seja um afiliado iLotto. Indique clientes, construa sua rede e ganhe comissões em dois níveis com nosso programa exclusivo de afiliados." />
                <meta name="keywords" content="afiliados, ilotto, programa de afiliados, comissões, marketing digital" />
            </Head>
            
            <div className="min-h-screen bg-background flex flex-col">
                <Header />

                <main className="flex-1 flex flex-col items-start justify-start">
                    <Hero />

                    <section className="w-full bg-secondary/10 py-16 px-6">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-3xl font-bold text-center mb-12">Benefícios do Programa</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-card p-6 rounded-lg shadow-lg">
                                    <h3 className="text-xl font-semibold mb-4">Comissões Atrativas</h3>
                                    <p className="text-muted-foreground">Ganhe comissões em dois níveis por cada cliente indicado e construa uma renda recorrente.</p>
                                </div>
                                <div className="bg-card p-6 rounded-lg shadow-lg">
                                    <h3 className="text-xl font-semibold mb-4">Suporte Dedicado</h3>
                                    <p className="text-muted-foreground">Conte com nossa equipe especializada para ajudar em todas as etapas do seu sucesso.</p>
                                </div>
                                <div className="bg-card p-6 rounded-lg shadow-lg">
                                    <h3 className="text-xl font-semibold mb-4">Materiais Exclusivos</h3>
                                    <p className="text-muted-foreground">Acesse materiais de marketing e ferramentas para impulsionar suas indicações.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="w-full py-6 border-t border-border">
                    <div className="container mx-auto text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Programa de Afiliados iLotto. Todos os direitos
                        reservados.
                        <p>Desenvolvido por iLotto.</p>
                    </div>
                </footer>
            </div>
        </>
    )
}

export default LandingPage;