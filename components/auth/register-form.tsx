"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SiteLogo } from "@/components/svg";
import { Icon } from "@iconify/react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { createAccount } from "@/actions/auth";

const schema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "Senha deve ter no mínimo 8 caracteres" }),
});

const RegisterForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const [passwordType, setPasswordType] = React.useState("password");
  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");

  const togglePasswordType = () => {
    setPasswordType((p) => (p === "password" ? "text" : "password"));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      nome: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: { nome: string; email: string; password: string }) => {
    startTransition(async () => {
      const result = await createAccount(data);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      const signed = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (signed?.ok) {
        toast.success("Conta criada com sucesso");
        window.location.assign("/");
      } else {
        toast.error("Conta criada — entre manualmente");
        window.location.assign("/login");
      }
    });
  };

  return (
    <div className="w-full py-10">
      <Link href="/" className="inline-block">
        <SiteLogo className="h-10 w-10 2xl:w-14 2xl:h-14 text-primary" />
      </Link>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900">
        Criar conta
      </div>
      <div className="2xl:text-lg text-base text-default-600 2xl:mt-2 leading-6">
        Comece a organizar suas turmas em minutos.
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 2xl:mt-7">
        <div>
          <Label htmlFor="nome" className="mb-2 font-medium text-default-600">
            Nome
          </Label>
          <Input
            disabled={isPending}
            {...register("nome")}
            type="text"
            id="nome"
            className={cn("", { "border-destructive": errors.nome })}
            size={!isDesktop2xl ? "xl" : "lg"}
          />
        </div>
        {errors.nome && (
          <div className="text-destructive mt-2">{errors.nome.message}</div>
        )}

        <div className="mt-3.5">
          <Label htmlFor="email" className="mb-2 font-medium text-default-600">
            Email
          </Label>
          <Input
            disabled={isPending}
            {...register("email")}
            type="email"
            id="email"
            className={cn("", { "border-destructive": errors.email })}
            size={!isDesktop2xl ? "xl" : "lg"}
          />
        </div>
        {errors.email && (
          <div className="text-destructive mt-2">{errors.email.message}</div>
        )}

        <div className="mt-3.5">
          <Label htmlFor="password" className="mb-2 font-medium text-default-600">
            Senha
          </Label>
          <div className="relative">
            <Input
              disabled={isPending}
              {...register("password")}
              type={passwordType}
              id="password"
              className="peer"
              size={!isDesktop2xl ? "xl" : "lg"}
              placeholder=" "
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer"
              onClick={togglePasswordType}
            >
              <Icon
                icon={passwordType === "password" ? "heroicons:eye" : "heroicons:eye-slash"}
                className="w-5 h-5 text-default-400"
              />
            </div>
          </div>
        </div>
        {errors.password && (
          <div className="text-destructive mt-2">{errors.password.message}</div>
        )}

        <Button
          className="w-full mt-8"
          disabled={isPending}
          size={!isDesktop2xl ? "lg" : "md"}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
      <div className="mt-5 2xl:mt-8 text-center text-base text-default-600">
        Já tem conta?{" "}
        <Link href="/login" className="text-primary">
          Entrar
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
