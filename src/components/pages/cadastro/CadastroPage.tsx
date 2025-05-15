"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateCNPJ, validateCPF } from "@/lib/validate-document";

// Definindo o schema de validação para o passo 1
const step1Schema = z
  .object({
    email: z.string().email({ message: "Email inválido" }),
    senha: z
      .string()
      .min(8, { message: "Senha deve ter pelo menos 8 caracteres" })
      .regex(/[A-Z]/, {
        message: "Senha deve conter pelo menos uma letra maiúscula",
      })
      .regex(/[a-z]/, {
        message: "Senha deve conter pelo menos uma letra minúscula",
      })
      .regex(/[0-9]/, { message: "Senha deve conter pelo menos um número" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Senha deve conter pelo menos um caractere especial",
      }),
    confirmarSenha: z.string().min(8, { message: "Confirme sua senha" }),
    termos: z.boolean().refine((val) => val === true, {
      message: "Você precisa aceitar os termos e condições",
    }),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

// Definindo o schema de validação para o passo 2
const step2Schema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  sobrenome: z
    .string()
    .min(2, { message: "Sobrenome deve ter pelo menos 2 caracteres" }),
  ddi: z.string().min(1, { message: "DDI é obrigatório" }),
  telefone: z.string().min(10, { message: "Telefone inválido" }),
  tipoDocumento: z.enum(["cpf", "cnpj"]),
  documento: z.string().refine(
    (val) => {
      const cleanVal = val.replace(/\D/g, "");
      if (cleanVal.length === 11) {
        return validateCPF(cleanVal);
      } else if (cleanVal.length === 14) {
        return validateCNPJ(cleanVal);
      }
      return false;
    },
    { message: "Documento inválido" },
  ),
  afiliado_id: z.string().optional(),
});

// Definindo o schema de validação para o passo 3 (Endereço)
const step3Schema = z.object({
  cep: z.string().min(8, { message: "CEP inválido" }),
  logradouro: z.string().min(3, { message: "Logradouro é obrigatório" }),
  numero: z.string().min(1, { message: "Número é obrigatório" }),
  complemento: z.string().optional(),
  bairro: z.string().min(2, { message: "Bairro é obrigatório" }),
  cidade: z.string().min(2, { message: "Cidade é obrigatória" }),
  estado: z.string().length(2, { message: "Estado inválido" }),
});

// Definindo o schema de validação para o passo 4 (Dados Bancários)
const step4Schema = z.object({
  banco: z.string().min(1, { message: "Banco é obrigatório" }),
  tipoConta: z.enum(["corrente", "poupanca"], {
    errorMap: () => ({ message: "Tipo de conta inválido" }),
  }),
  agencia: z.string().min(4, { message: "Agência inválida" }),
  conta: z.string().min(5, { message: "Conta inválida" }),
  digitoConta: z.string().length(1, { message: "Dígito inválido" }),
  chavePix: z.string().min(1, { message: "Chave PIX é obrigatória" }),
  tipoChavePix: z.enum(["cpf", "cnpj", "email", "telefone", "aleatoria"], {
    errorMap: () => ({ message: "Tipo de chave PIX inválido" }),
  }),
});

// Definindo o schema de validação para o passo 5 (Upload de Arquivos)
const step5Schema = z.object({
  documentoFrente: z.any(),
  documentoVerso: z.any(),
  selfie: z.any()
});

// Lista de DDIs populares
const ddiOptions = [
  { value: "55", label: "Brasil (+55)" },
  { value: "1", label: "EUA/Canadá (+1)" },
  { value: "351", label: "Portugal (+351)" },
  { value: "34", label: "Espanha (+34)" },
  { value: "44", label: "Reino Unido (+44)" },
  { value: "49", label: "Alemanha (+49)" },
  { value: "33", label: "França (+33)" },
  { value: "39", label: "Itália (+39)" },
  { value: "81", label: "Japão (+81)" },
  { value: "86", label: "China (+86)" },
];

// Lista de afiliados mock
const afiliados = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao@exemplo.com",
    // foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=joao",
    tipo: "Influencer",
  },
  {
    id: "2",
    nome: "Maria Souza",
    email: "maria@exemplo.com",
    // foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    tipo: "Gestor de Tráfego",
  },
  {
    id: "3",
    nome: "Carlos Oliveira",
    email: "carlos@exemplo.com",
    // foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
    tipo: "Gestor de Influencers",
  },
  {
    id: "4",
    nome: "Ana Pereira",
    email: "ana@exemplo.com",
    // foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
    tipo: "Afiliado",
  },
];

// Função para obter a cor de fundo baseada no tipo de afiliado
const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case "Influencer":
      return "bg-purple-100 text-purple-800";
    case "Gestor de Tráfego":
      return "bg-blue-100 text-blue-800";
    case "Gestor de Influencers":
      return "bg-green-100 text-green-800";
    case "Afiliado":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Melhorar a tipagem dos estados
interface UploadedFiles {
  documentoFrente?: File;
  documentoVerso?: File;
  selfie?: File;
}

interface FormData {
  email?: string;
  senha?: string;
  nome?: string;
  sobrenome?: string;
  telefone?: string;
  documento?: string;
  tipoDocumento?: "cpf" | "cnpj";
  afiliado_id?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  banco?: string;
  tipoConta?: "corrente" | "poupanca";
  agencia?: string;
  conta?: string;
  digitoConta?: string;
  chavePix?: string;
  tipoChavePix?: "cpf" | "cnpj" | "email" | "telefone" | "aleatoria";
}

// Estilo padrão para os botões principais
const buttonPrimaryClass = "w-full bg-gradient-to-b from-myBuyersButton-bgFrom to-myBuyersButton-bgTo text-myBuyersButton-textColor font-medium py-6";
const buttonSecondaryClass = "w-1/3 border-2 border-primary/20 hover:border-primary/40 text-primary font-medium";
const buttonNextClass = "w-2/3 bg-gradient-to-b from-myBuyersButton-bgFrom to-myBuyersButton-bgTo text-myBuyersButton-textColor font-medium py-6";

export default function CadastroUnificado() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const [currentStep, setCurrentStep] = useState(1);
  const [referrer, setReferrer] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [tipoDocumento, setTipoDocumento] = useState<"cpf" | "cnpj">("cpf");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({});

  // Buscar informações do afiliado que indicou (se houver)
  useEffect(() => {
    if (refCode) {
      // Em um cenário real, isso seria uma chamada à API
      const afiliadoEncontrado = afiliados.find((a) => a.id === refCode);
      if (afiliadoEncontrado) {
        setReferrer(afiliadoEncontrado);
      }
    }
  }, [refCode]);

  // Form para o passo 1
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    watch: watchStep1,
    setValue: setValueStep1,
    formState: { errors: errorsStep1, isValid: isValidStep1 },
  } = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    mode: "onChange",
    defaultValues: {
      email: "",
      senha: "",
      confirmarSenha: "",
      termos: false,
    },
  });

  // Observar o checkbox de termos para habilitar o botão
  const termosAceitos = watchStep1("termos");

  // Form para o passo 2
  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    setValue: setValueStep2,
    watch,
    formState: { errors: errorsStep2, isValid: isValidStep2 },
  } = useForm({
    resolver: zodResolver(step2Schema),
    mode: "onChange",
    defaultValues: {
      afiliado_id: refCode || "",
      tipoDocumento: "cpf",
      ddi: "55",
    },
  });

  // Form para o passo 3
  const {
    register: registerStep3,
    handleSubmit: handleSubmitStep3,
    setValue: setValueStep3,
    formState: { errors: errorsStep3, isValid: isValidStep3 },
  } = useForm({
    resolver: zodResolver(step3Schema),
    mode: "onChange",
  });

  // Form para o passo 4
  const {
    register: registerStep4,
    handleSubmit: handleSubmitStep4,
    setValue: setValueStep4,
    formState: { errors: errorsStep4, isValid: isValidStep4 },
  } = useForm({
    resolver: zodResolver(step4Schema),
    mode: "onChange",
  });

  // Form para o passo 5
  const {
    handleSubmit: handleSubmitStep5,
    formState: { errors: errorsStep5 },
    setValue: setValueStep5
  } = useForm({
    resolver: zodResolver(step5Schema),
    mode: "onChange"
  });

  const selectedAfiliadoId = watch("afiliado_id");
  const watchedTipoDocumento = watch("tipoDocumento");

  // Atualizar o tipo de documento quando mudar no select
  useEffect(() => {
    if (watchedTipoDocumento) {
      setTipoDocumento(watchedTipoDocumento);
      // Limpar o campo de documento quando mudar o tipo
      setValueStep2("documento", "");
    }
  }, [watchedTipoDocumento, setValueStep2]);

  // Atualizar o afiliado selecionado quando mudar no select
  useEffect(() => {
    if (selectedAfiliadoId && !refCode) {
      const afiliadoEncontrado = afiliados.find(
        (a) => a.id === selectedAfiliadoId,
      );
      if (afiliadoEncontrado) {
        setReferrer(afiliadoEncontrado);
      }
    }
  }, [selectedAfiliadoId, refCode]);

  const onSubmitStep1 = (data: any) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(2);
  };

  const onSubmitStep2 = async (data: any) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(3);
  };

  const onSubmitStep3 = async (data: any) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(4);
  };

  const onSubmitStep4 = async (data: any) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(5);
  };

  const onSubmitStep5 = async (data: any) => {
    try {
      // Validar se todos os arquivos foram enviados
      if (!uploadedFiles.documentoFrente || !uploadedFiles.documentoVerso || !uploadedFiles.selfie) {
        throw new Error("Por favor, envie todos os documentos necessários");
      }

      setIsSubmitting(true);

      // Criar FormData para envio dos arquivos
      const formDataToSend = new FormData();
      formDataToSend.append('documentoFrente', uploadedFiles.documentoFrente);
      formDataToSend.append('documentoVerso', uploadedFiles.documentoVerso);
      formDataToSend.append('selfie', uploadedFiles.selfie);

      // Adicionar outros dados do formulário
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value.toString());
        }
      });

      // Aqui você faria o envio dos dados para o servidor
      console.log("Dados do cadastro:", {
        ...formData,
        documentos: {
          frente: uploadedFiles.documentoFrente.name,
          verso: uploadedFiles.documentoVerso.name,
          selfie: uploadedFiles.selfie.name
        }
      });

      // Salvar no localStorage apenas os metadados
      localStorage.setItem("cadastroData", JSON.stringify({
        ...formData,
        documentos: {
          frente: uploadedFiles.documentoFrente.name,
          verso: uploadedFiles.documentoVerso.name,
          selfie: uploadedFiles.selfie.name
        }
      }));

      // Simular um tempo de processamento
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirecionar para a página de contrato
      router.push("/contrato");
    } catch (error) {
      console.error("Erro ao finalizar cadastro:", error);
      // Aqui você pode adicionar uma notificação de erro para o usuário
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estado para controlar o loading durante o envio do formulário
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para formatar CPF enquanto digita
  const formatCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, ""); // Remove tudo que não é dígito
    value = value.replace(/^(\d{3})(\d)/g, "$1.$2"); // Coloca ponto após o terceiro dígito
    value = value.replace(/(\d{3})(\d)/g, "$1.$2"); // Coloca ponto após o sexto dígito
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Coloca hífen entre o nono e o décimo dígito
    e.target.value = value;
  };

  // Função para formatar CNPJ enquanto digita
  const formatCNPJ = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, ""); // Remove tudo que não é dígito
    value = value.replace(/^(\d{2})(\d)/g, "$1.$2"); // Coloca ponto após o segundo dígito
    value = value.replace(/(\d{3})(\d)/g, "$1.$2"); // Coloca ponto após o quinto dígito
    value = value.replace(/(\d{3})(\d)/g, "$1/$2"); // Coloca barra após o oitavo dígito
    value = value.replace(/(\d{4})(\d{1,2})$/, "$1-$2"); // Coloca hífen após o décimo segundo dígito
    e.target.value = value;
  };

  // Função para formatar telefone enquanto digita
  const formatTelefone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, ""); // Remove tudo que não é dígito
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2"); // Coloca parênteses em volta dos dois primeiros dígitos
    value = value.replace(/(\d)(\d{4})$/, "$1-$2"); // Coloca hífen entre o quinto e o sexto dígito
    e.target.value = value;
  };

  // Função para lidar com a mudança no tipo de documento
  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (tipoDocumento === "cpf") {
      formatCPF(e);
    } else {
      formatCNPJ(e);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background flex flex-col bg-red-500">
      <main className="flex-1 flex items-center justify-end p-6 bg-gradient-to-br from-background to-background/90">
        <div className="w-full flex rounded-3xl overflow-hidden shadow-2xl md:w-4/5 lg:w-3/5 xl:w-2/5">
          {/* Lado direito - Formulário */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white dark:bg-background p-8"
          >
            <Card className="shadow-none border-none">
              <CardHeader className="space-y-1 px-0">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {currentStep === 1
                    ? "Crie sua conta"
                    : currentStep === 2
                    ? "Complete seu cadastro"
                    : currentStep === 3
                    ? "Endereço"
                    : currentStep === 4
                    ? "Dados Bancários"
                    : "Upload de Documentos"}
                </CardTitle>
                <CardDescription className="text-base">
                  {currentStep === 1
                    ? "Preencha os dados abaixo para começar"
                    : currentStep === 2
                    ? "Estamos quase lá! Precisamos de mais algumas informações"
                    : currentStep === 3
                    ? "Informe seu endereço completo"
                    : currentStep === 4
                    ? "Para finalizar, informe seus dados bancários"
                    : "Envie os documentos necessários para validação"}
                </CardDescription>

                <div className="flex items-center justify-between mt-4">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step === currentStep
                            ? "bg-primary text-white"
                            : step < currentStep
                            ? "bg-primary/20 text-primary"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {step}
                      </div>
                      {step < 5 && (
                        <div
                          className={`w-12 h-1 mx-2 rounded ${
                            step < currentStep
                              ? "bg-primary/20"
                              : "bg-gray-100"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardHeader>

              <AnimatePresence mode="wait">
                {currentStep === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form
                      onSubmit={handleSubmitStep1(onSubmitStep1)}
                      noValidate
                    >
                      <CardContent className="space-y-4 px-0">
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            className="border-input/60 focus:border-primary"
                            {...registerStep1("email")}
                          />
                          {errorsStep1.email && (
                            <p className="text-sm text-destructive">
                              {errorsStep1.email.message as string}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="senha">Senha</Label>
                          <Input
                            id="senha"
                            type="password"
                            placeholder="********"
                            className="border-input/60 focus:border-primary"
                            {...registerStep1("senha")}
                          />
                          {errorsStep1.senha && (
                            <p className="text-sm text-destructive">
                              {errorsStep1.senha.message as string}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            A senha deve conter pelo menos 8 caracteres,
                            incluindo letras maiúsculas, minúsculas, números e
                            caracteres especiais.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmarSenha">
                            Confirme a senha
                          </Label>
                          <Input
                            id="confirmarSenha"
                            type="password"
                            placeholder="******"
                            className="border-input/60 focus:border-primary"
                            {...registerStep1("confirmarSenha")}
                          />
                          {errorsStep1.confirmarSenha && (
                            <p className="text-sm text-destructive">
                              {errorsStep1.confirmarSenha.message as string}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="termos"
                            {...registerStep1("termos")}
                            onCheckedChange={(checked) => {
                              setValueStep1("termos", checked as boolean);
                            }}
                          />
                          <label
                            htmlFor="termos"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Eu aceito os{" "}
                            <Link
                              href="#"
                              className="text-primary hover:underline"
                            >
                              termos e condições
                            </Link>
                          </label>
                        </div>
                        {errorsStep1.termos && (
                          <p className="text-sm text-destructive">
                            {errorsStep1.termos.message as string}
                          </p>
                        )}
                      </CardContent>

                      <CardFooter className="px-0 pt-4">
                        <Button
                          type="submit"
                          className={buttonPrimaryClass}
                          disabled={!isValidStep1}
                        >
                          Continuar
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-2"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </Button>
                      </CardFooter>
                    </form>
                  </motion.div>
                ) : currentStep === 2 ? (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={handleSubmitStep2(onSubmitStep2)}>
                      <CardContent className="space-y-4 px-0">
                        {/* Exibição do afiliado que indicou (se houver) */}
                        <AnimatePresence>
                          {referrer && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="bg-gradient-to-r from-primary/10 to-accent/20 p-5 rounded-xl flex items-center space-x-4 mb-6 shadow-sm border border-primary/20"
                            >
                              <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary shadow-md">
                                <Image
                                  src={referrer.foto}
                                  alt={referrer.nome}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-primary">
                                  {referrer.nome}
                                </h3>
                                <div className="flex items-center mt-1">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTipoColor(referrer.tipo)}`}
                                  >
                                    {referrer.tipo}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {referrer.email}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nome">Nome</Label>
                            <Input
                              id="nome"
                              placeholder="Seu nome"
                              className="border-input/60 focus:border-primary"
                              {...registerStep2("nome")}
                            />
                            {errorsStep2.nome && (
                              <p className="text-sm text-destructive">
                                {errorsStep2.nome.message as string}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="sobrenome">Sobrenome</Label>
                            <Input
                              id="sobrenome"
                              placeholder="Seu sobrenome"
                              className="border-input/60 focus:border-primary"
                              {...registerStep2("sobrenome")}
                            />
                            {errorsStep2.sobrenome && (
                              <p className="text-sm text-destructive">
                                {errorsStep2.sobrenome.message as string}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Telefone</Label>
                          <div className="flex space-x-2">
                            <div className="w-1/3">
                              <Select
                                defaultValue="55"
                                onValueChange={(value) =>
                                  setValueStep2("ddi", value)
                                }
                              >
                                <SelectTrigger className="border-input/60 focus:border-primary">
                                  <SelectValue placeholder="DDI" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ddiOptions.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errorsStep2.ddi && (
                                <p className="text-sm text-destructive">
                                  {errorsStep2.ddi.message as string}
                                </p>
                              )}
                            </div>
                            <div className="w-2/3">
                              <Input
                                id="telefone"
                                placeholder="(00) 00000-0000"
                                maxLength={15}
                                className="border-input/60 focus:border-primary"
                                {...registerStep2("telefone")}
                                onChange={formatTelefone}
                              />
                              {errorsStep2.telefone && (
                                <p className="text-sm text-destructive">
                                  {errorsStep2.telefone.message as string}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Documento</Label>
                          <div className="flex space-x-2">
                            <div className="w-1/3">
                              <Select
                                defaultValue="cpf"
                                onValueChange={(value) => {
                                  setValueStep2(
                                    "tipoDocumento",
                                    value as "cpf" | "cnpj",
                                  );
                                  setValueStep2("documento", ""); // Limpa o campo ao trocar o tipo
                                }}
                              >
                                <SelectTrigger className="border-input/60 focus:border-primary">
                                  <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cpf">CPF</SelectItem>
                                  <SelectItem value="cnpj">CNPJ</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="w-2/3">
                              <Input
                                id="documento"
                                placeholder={
                                  tipoDocumento === "cpf"
                                    ? "000.000.000-00"
                                    : "00.000.000/0000-00"
                                }
                                maxLength={tipoDocumento === "cpf" ? 14 : 18}
                                className="border-input/60 focus:border-primary"
                                {...registerStep2("documento")}
                                onChange={handleDocumentoChange}
                              />
                              {errorsStep2.documento && (
                                <p className="text-sm text-destructive">
                                  {errorsStep2.documento.message as string}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Seleção de afiliado (apenas se não veio por link de indicação) */}
                        {!refCode && (
                          <div className="space-y-4 mt-6">
                            <Label
                              htmlFor="afiliado"
                              className="text-lg font-medium"
                            >
                              Selecione um Afiliado (opcional)
                            </Label>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 rounded-lg border border-input/40 p-2">
                              {afiliados.map((afiliado) => (
                                <div
                                  key={afiliado.id}
                                  className={`relative p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${selectedAfiliadoId === afiliado.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                                  onClick={() =>
                                    setValueStep2("afiliado_id", afiliado.id)
                                  }
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-primary/50">
                                      {/* <Image
                                        src={afiliado.foto}
                                        alt={afiliado.nome}
                                        width={40}
                                        height={40}
                                        className="object-cover"
                                      /> */}
                                      A
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-medium text-sm">
                                        {afiliado.nome}
                                      </h3>
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTipoColor(afiliado.tipo)}`}
                                      >
                                        {afiliado.tipo}
                                      </span>
                                    </div>
                                    {selectedAfiliadoId === afiliado.id && (
                                      <div className="bg-primary text-white rounded-full p-1">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="flex justify-between pt-6 px-0">
                        <Button
                          variant="outline"
                          type="button"
                          className={buttonSecondaryClass}
                          onClick={() => setCurrentStep(1)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <path d="m15 18-6-6 6-6" />
                          </svg>
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          className={buttonNextClass}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Criando cadastro...
                            </>
                          ) : (
                            <>
                              Continuar
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="ml-2"
                              >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 1 0 7.75" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </motion.div>
                ) : currentStep === 3 ? (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={handleSubmitStep3(onSubmitStep3)}>
                      <CardContent className="space-y-4 px-0">
                        <div className="space-y-2">
                          <Label htmlFor="cep">CEP</Label>
                          <Input
                            id="cep"
                            placeholder="00000-000"
                            className="border-input/60 focus:border-primary"
                            {...registerStep3("cep")}
                          />
                          {errorsStep3.cep && (
                            <p className="text-sm text-destructive">
                              {errorsStep3.cep.message as string}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2 space-y-2">
                            <Label htmlFor="logradouro">Logradouro</Label>
                            <Input
                              id="logradouro"
                              placeholder="Rua, Avenida, etc"
                              className="border-input/60 focus:border-primary"
                              {...registerStep3("logradouro")}
                            />
                            {errorsStep3.logradouro && (
                              <p className="text-sm text-destructive">
                                {errorsStep3.logradouro.message as string}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="numero">Número</Label>
                            <Input
                              id="numero"
                              placeholder="123"
                              className="border-input/60 focus:border-primary"
                              {...registerStep3("numero")}
                            />
                            {errorsStep3.numero && (
                              <p className="text-sm text-destructive">
                                {errorsStep3.numero.message as string}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="complemento">Complemento (opcional)</Label>
                          <Input
                            id="complemento"
                            placeholder="Apto, Sala, etc"
                            className="border-input/60 focus:border-primary"
                            {...registerStep3("complemento")}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bairro">Bairro</Label>
                            <Input
                              id="bairro"
                              placeholder="Seu bairro"
                              className="border-input/60 focus:border-primary"
                              {...registerStep3("bairro")}
                            />
                            {errorsStep3.bairro && (
                              <p className="text-sm text-destructive">
                                {errorsStep3.bairro.message as string}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cidade">Cidade</Label>
                            <Input
                              id="cidade"
                              placeholder="Sua cidade"
                              className="border-input/60 focus:border-primary"
                              {...registerStep3("cidade")}
                            />
                            {errorsStep3.cidade && (
                              <p className="text-sm text-destructive">
                                {errorsStep3.cidade.message as string}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="estado">Estado</Label>
                          <Select
                            onValueChange={(value) => setValueStep3("estado", value)}
                          >
                            <SelectTrigger className="border-input/60 focus:border-primary">
                              <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SP">São Paulo</SelectItem>
                              <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                              <SelectItem value="MG">Minas Gerais</SelectItem>
                              {/* Adicionar outros estados */}
                            </SelectContent>
                          </Select>
                          {errorsStep3.estado && (
                            <p className="text-sm text-destructive">
                              {errorsStep3.estado.message as string}
                            </p>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="flex justify-between pt-6 px-0">
                        <Button
                          variant="outline"
                          type="button"
                          className={buttonSecondaryClass}
                          onClick={() => setCurrentStep(2)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <path d="m15 18-6-6 6-6" />
                          </svg>
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          className={buttonNextClass}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Finalizando cadastro...
                            </>
                          ) : (
                            <>
                              Continuar
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="ml-2"
                              >
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </motion.div>
                ) : currentStep === 4 ? (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={handleSubmitStep4(onSubmitStep4)}>
                      <CardContent className="space-y-4 px-0">
                        <div className="space-y-2">
                          <Label htmlFor="banco">Banco</Label>
                          <Select onValueChange={(value) => setValueStep4("banco", value)}>
                            <SelectTrigger className="border-input/60 focus:border-primary">
                              <SelectValue placeholder="Selecione o banco" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="001">Banco do Brasil</SelectItem>
                              <SelectItem value="341">Itaú</SelectItem>
                              <SelectItem value="033">Santander</SelectItem>
                              <SelectItem value="104">Caixa Econômica</SelectItem>
                              <SelectItem value="237">Bradesco</SelectItem>
                              {/* Adicionar outros bancos */}
                            </SelectContent>
                          </Select>
                          {errorsStep4.banco && (
                            <p className="text-sm text-destructive">
                              {errorsStep4.banco.message as string}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tipoConta">Tipo de Conta</Label>
                          <Select onValueChange={(value) => setValueStep4("tipoConta", value as "corrente" | "poupanca")}>
                            <SelectTrigger className="border-input/60 focus:border-primary">
                              <SelectValue placeholder="Selecione o tipo de conta" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="corrente">Conta Corrente</SelectItem>
                              <SelectItem value="poupanca">Conta Poupança</SelectItem>
                            </SelectContent>
                          </Select>
                          {errorsStep4.tipoConta && (
                            <p className="text-sm text-destructive">
                              {errorsStep4.tipoConta.message as string}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="agencia">Agência</Label>
                            <Input
                              id="agencia"
                              placeholder="0000"
                              className="border-input/60 focus:border-primary"
                              {...registerStep4("agencia")}
                            />
                            {errorsStep4.agencia && (
                              <p className="text-sm text-destructive">
                                {errorsStep4.agencia.message as string}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="conta">Conta</Label>
                            <div className="flex space-x-2">
                              <Input
                                id="conta"
                                placeholder="00000"
                                className="border-input/60 focus:border-primary"
                                {...registerStep4("conta")}
                              />
                              <Input
                                id="digitoConta"
                                placeholder="0"
                                className="border-input/60 focus:border-primary w-16"
                                {...registerStep4("digitoConta")}
                              />
                            </div>
                            {(errorsStep4.conta || errorsStep4.digitoConta) && (
                              <p className="text-sm text-destructive">
                                {(errorsStep4.conta?.message as string) ||
                                  (errorsStep4.digitoConta?.message as string)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tipoChavePix">Tipo de Chave PIX</Label>
                          <Select onValueChange={(value) => setValueStep4("tipoChavePix", value as "cpf" | "cnpj" | "email" | "telefone" | "aleatoria")}>
                            <SelectTrigger className="border-input/60 focus:border-primary">
                              <SelectValue placeholder="Selecione o tipo de chave" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cpf">CPF</SelectItem>
                              <SelectItem value="cnpj">CNPJ</SelectItem>
                              <SelectItem value="email">E-mail</SelectItem>
                              <SelectItem value="telefone">Telefone</SelectItem>
                              <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                            </SelectContent>
                          </Select>
                          {errorsStep4.tipoChavePix && (
                            <p className="text-sm text-destructive">
                              {errorsStep4.tipoChavePix.message as string}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="chavePix">Chave PIX</Label>
                          <Input
                            id="chavePix"
                            placeholder="Digite sua chave PIX"
                            className="border-input/60 focus:border-primary"
                            {...registerStep4("chavePix")}
                          />
                          {errorsStep4.chavePix && (
                            <p className="text-sm text-destructive">
                              {errorsStep4.chavePix.message as string}
                            </p>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="flex justify-between pt-6 px-0">
                        <Button
                          variant="outline"
                          type="button"
                          className={buttonSecondaryClass}
                          onClick={() => setCurrentStep(3)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <path d="m15 18-6-6 6-6" />
                          </svg>
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          className={buttonNextClass}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Finalizando cadastro...
                            </>
                          ) : (
                            <>
                              Continuar
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="ml-2"
                              >
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={handleSubmitStep5(onSubmitStep5)}>
                      <CardContent className="space-y-4 px-0">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="documentoFrente">Documento Frente</Label>
                            <Input
                              id="documentoFrente"
                              type="file"
                              accept="image/*"
                              className="border-input/60 focus:border-primary"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setUploadedFiles((prev) => ({
                                    ...prev,
                                    documentoFrente: file,
                                  }));
                                  setValueStep5("documentoFrente", file);
                                }
                              }}
                            />
                            {!uploadedFiles.documentoFrente && (
                              <p className="text-sm text-destructive">
                                Documento frente é obrigatório
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="documentoVerso">Documento Verso</Label>
                            <Input
                              id="documentoVerso"
                              type="file"
                              accept="image/*"
                              className="border-input/60 focus:border-primary"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setUploadedFiles((prev) => ({
                                    ...prev,
                                    documentoVerso: file,
                                  }));
                                  setValueStep5("documentoVerso", file);
                                }
                              }}
                            />
                            {!uploadedFiles.documentoVerso && (
                              <p className="text-sm text-destructive">
                                Documento verso é obrigatório
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="selfie">Selfie com Documento</Label>
                            <Input
                              id="selfie"
                              type="file"
                              accept="image/*"
                              className="border-input/60 focus:border-primary"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setUploadedFiles((prev) => ({
                                    ...prev,
                                    selfie: file,
                                  }));
                                  setValueStep5("selfie", file);
                                }
                              }}
                            />
                            {!uploadedFiles.selfie && (
                              <p className="text-sm text-destructive">
                                Selfie é obrigatória
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="flex justify-between pt-6 px-0">
                        <Button
                          variant="outline"
                          type="button"
                          className={buttonSecondaryClass}
                          onClick={() => setCurrentStep(4)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <path d="m15 18-6-6 6-6" />
                          </svg>
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          className={buttonNextClass}
                          disabled={isSubmitting || !uploadedFiles.documentoFrente || !uploadedFiles.documentoVerso || !uploadedFiles.selfie}
                        >
                          {isSubmitting ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Finalizando cadastro...
                            </>
                          ) : (
                            <>
                              Finalizar Cadastro
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="ml-2"
                              >
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                              </svg>
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
