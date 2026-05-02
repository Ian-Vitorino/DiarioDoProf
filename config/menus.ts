import {
  DashBoard,
} from "@/components/svg";


export interface MenuItemProps {
  title: string;
  icon?: any;
  href?: string;
  child?: MenuItemProps[];
  megaMenu?: MenuItemProps[];
  multi_menu?: MenuItemProps[];
  nested?: MenuItemProps[];
  onClick?: () => void;
  isHeader?: boolean;
}

export const menusConfig = {
  mainNav: [
    { title: "Turmas", icon: DashBoard, href: "/turmas" },
    { title: "Notas", icon: DashBoard, href: "/notas" },
    { title: "Análise da turma", icon: DashBoard, href: "/analise-turma" },
    { title: "Dashboard aluno", icon: DashBoard, href: "/dashboard-aluno" },
  ] as MenuItemProps[],
  sidebarNav: {
    modern: [
      { title: "Turmas", icon: DashBoard, href: "/turmas" },
      { title: "Notas", icon: DashBoard, href: "/notas" },
      { title: "Análise da turma", icon: DashBoard, href: "/analise-turma" },
      { title: "Dashboard aluno", icon: DashBoard, href: "/dashboard-aluno" },
    ] as MenuItemProps[],
    classic: [
      { isHeader: true, title: "Cadastros" },
      { title: "Turmas", icon: DashBoard, href: "/turmas" },
      { isHeader: true, title: "Dados" },
      { title: "Notas", icon: DashBoard, href: "/notas" },
      { title: "Análise da turma", icon: DashBoard, href: "/analise-turma" },
      { title: "Dashboard aluno", icon: DashBoard, href: "/dashboard-aluno" },
    ] as MenuItemProps[],
  },
};


export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number]
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number]
export type MainNavType = (typeof menusConfig.mainNav)[number]
