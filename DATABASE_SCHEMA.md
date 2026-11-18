# Esquema de Dados — VIDA REAL BR

## Estrutura de SaveGame (`GameSave`)
- `id`: Identificador único da partida.
- `createdAt`: Timestamp de criação.
- `updatedAt`: Timestamp da última atualização.
- `character`: Objeto contendo atributos vitais (nome, idade, dinheiro em centavos, saúde, felicidade, inteligência, carreira, status legal).
- `family`: Lista de familiares vinculados com afinidade e profissão.
- `assets`: Lista de bens adquiridos (imóveis, veículos).
- `events`: Histórico de eventos e escolhas da partida.
- `history`: Linha do tempo resumida de cada ano vivido.
