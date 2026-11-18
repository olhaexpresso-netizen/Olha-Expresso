# Arquitetura do Sistema — VIDA REAL BR

## 1. Visão Geral
VIDA REAL BR é uma aplicação web full-stack desenvolvida em React (TypeScript + Tailwind CSS) no frontend e Node.js (Express) no backend.

## 2. Camadas da Aplicação
- **Frontend SPA (`/src`)**: Gerencia a interface de usuário, navegação entre abas (Perfil, Família, Carreira, Finanças, Histórico, Ajustes) e modais de eventos.
- **Backend API (`/server.ts`)**: Gerencia o motor de simulação (LifeEngine), processamento de tempo, regras determinísticas, persistência em arquivo JSON e integração com o SDK `@google/genai`.
- **Orquestração de IA**: O backend consome a API do Gemini para gerar eventos narrativos contextuais quando a chave de API está configurada. Caso contrário, utiliza um pool determinístico de eventos da realidade brasileira.
