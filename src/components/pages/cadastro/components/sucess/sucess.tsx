import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

function Sucess() {
    return (
        <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center">
            <main className="flex-1 flex items-center justify-center p-6">
                <div
                    className="w-full max-w-md bg-white rounded-md"
                >
                    <Card className="shadow-lg border border-green-500/20 bg-green-500/5">
                        <CardHeader className="text-center pb-2">
                            <div
                                className="mx-auto mb-4"
                            >
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                            </div>
                            <CardTitle className="text-2xl">Cadastro Concluído!</CardTitle>
                        </CardHeader>

                        <CardContent className="text-center">
                            <p className="text-muted-foreground">
                                Seu cadastro foi enviado com sucesso.
                            </p>
                        </CardContent>

                        <CardFooter className="flex justify-center pt-2">
                            <Link href="/">
                                <Button
                                    size="lg"
                                    className="w-full bg-gradient-to-b from-myBuyersButton-bgFrom to-myBuyersButton-bgTo text-myBuyersButton-textColor font-medium py-6"
                                >
                                    Finalizar
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    )
}

export default Sucess;
