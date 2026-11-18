# Sistema de Inteligência Artificial — VIDA REAL BR

## 1. Integração com Gemini API
VIDA REAL BR utiliza o pacote oficial `@google/genai` (modelo `gemini-2.5-flash`) para gerar eventos narrativos altamente imersivos e contextualizados na realidade brasileira.

## 2. Validação e Segurança
- A IA gera exclusivamente títulos, descrições e opções textuais.
- As consequências numéricas (dinheiro, atributos, saúde) são calculadas rigidamente pelo motor determinístico no servidor para impedir manipulações arbitrárias de saldo ou status.
- **Fallback Automático**: Se a chave de API não estiver configurada ou ocorrer falha de rede, o sistema recorre imediatamente a um rico pool de eventos determinísticos brasileiros.
