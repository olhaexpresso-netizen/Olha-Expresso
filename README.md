# VIDA REAL BR — Simulador de Vida Brasileiro

Simulador de vida brasileiro, sandbox narrativo e simulação social com inteligência artificial, árvores genealógicas, carreiras, economia e escolhas dinâmicas.

## 🚀 Funcionalidades Principais
- **Criação de Personagem**: Escolha nome, gênero, estado, cidade e condição socioeconômica inicial no Brasil.
- **Motor de Vida & Envelhecimento**: Avance ano a ano, acompanhando atributos (saúde, felicidade, inteligência, aparência, condicionamento físico, carisma, disciplina, reputação).
- **Eventos Dinâmicos com IA & Fallback**: Geração de acontecimentos contextuais brasileiros (churrasco em família, inflação, oportunidades de emprego, festas na laje) via Gemini API, com suporte a fallback determinístico robusto.
- **Carreiras & Finanças**: Empregos com progressão salarial, compra de imóveis e veículos, e sistema de criminalidade/jurídico.
- **Persistência Total**: Salvamento automático e gerenciamento de múltiplas partidas no servidor.

## 🛠️ Tecnologias
- Frontend: React, TypeScript, Tailwind CSS, Lucide Icons.
- Backend: Node.js, Express, TypeScript.
- IA: `@google/genai` (Gemini 2.5 Flash).
