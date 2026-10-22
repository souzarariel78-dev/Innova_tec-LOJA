# Plano de implementação — MercadoSpot

## Escopo da primeira entrega
Construir uma experiência mobile multiplataforma em React Native/Expo Router, com interface navegável e acabamento de produto para marketplace C2C/B2C. A primeira entrega terá dados mockados e contratos de integração claros, sem fingir pagamentos, câmera, backend ou notificações reais. O foco é entregar o núcleo de descoberta, compra, venda e conta em uma base que possa ser compilada no Android/iOS e evoluída para API, PostgreSQL, busca, Redis, FCM, WebSockets, JWT/refresh, biometria e pagamentos tokenizados.

## Arquitetura
- `app/(tabs)/`: cinco áreas principais: início, pedidos, vender, favoritos e perfil.
- `app/product/[id].tsx`: detalhe de produto com galeria, preço, variações, frete, reputação, perguntas e avaliações.
- `app/search.tsx`: busca e listagem com filtros e ordenação.
- `app/cart.tsx`: carrinho agrupado por vendedor e resumo financeiro.
- `app/checkout.tsx`: checkout por etapas com endereço, frete e forma de pagamento.
- `app/sell.tsx`: fluxo de anúncio em cinco etapas.
- `components/`: cartões, badges, header, bottom navigation e primitives visuais.
- `constants/`: catálogo mockado, categorias, cores e tokens de layout.
- `server/` e `drizzle/`: permanecem como fronteira para API e persistência reais.

## Direção visual
Três opções consideradas: **Mercado editorial vibrante** (0,06), **Neutro técnico utilitário** (0,08), **Clube solar de descobertas** (0,04). Escolha: **Mercado editorial vibrante**.

- **Movimento:** editorial commerce com blocos assimétricos, ritmo de vitrine e sensação de descoberta.
- **Princípios:** clareza antes da conversão; cor para orientar; densidade confortável; confiança explícita.
- **Cor:** azul-marinho quase preto `#061A2A` como base tecnológica, superfícies azul-petróleo `#0A2B3D`, ciano neon `#00D9FF` como assinatura e turquesa `#2AF2BE` para estados positivos.
- **Layout:** header fixo, prateleiras horizontais e cards em duas colunas; seções com títulos fortes alinhados à esquerda e respiros generosos.
- **Assinaturas:** contornos ciano, pílulas de benefício, bordas suaves de 18–24px, brilho tecnológico nos CTAs, marcador “Oferta do dia” e badges de reputação.
- **Interação:** ações primárias grandes e alcançáveis com uma mão; favoritar é imediato; filtros e carrinho usam feedback háptico onde disponível.
- **Animação:** microescala em press, transições rápidas de 160–220ms e carrossel sem depender de animação para comunicar conteúdo.
- **Tipografia:** sistema nativo SF Pro/Roboto via fontes do sistema; títulos 24–30px semibold, preço 20–24px bold, corpo 13–15px.
- **Essência:** um marketplace brasileiro para comprar melhor e vender com mais confiança; próximo, esperto, vibrante.
- **Voz:** direta, humana e útil. Exemplos: “Achados que valem o clique” e “Venda o que está parado.”
- **Marca:** wordmark MercadoSpot com símbolo inclinado de dois cartões e um ponto luminoso, inspirado na linguagem de soluções tecnológicas da referência enviada.
- **Cor proprietária:** ciano neon `#00D9FF`, com turquesa `#2AF2BE` como cor de apoio.

## Dados e integrações
Os dados de catálogo, pedidos e vendedor serão mocks tipados em `constants/mock-data.ts`. Componentes usarão callbacks locais para simular favoritos, carrinho, busca e seleção. A camada futura deve substituir esses callbacks por tRPC/REST sem alterar a composição visual. Pagamento, câmera/QR, push, upload, etiqueta PDF e autenticação biométrica ficam explicitamente marcados como pontos de integração.

## Fluxo de build
Usar o starter Expo fixo, manter os identificadores gerados em `app.config.ts`, rodar `pnpm db:push` quando necessário, iniciar Metro/API nas portas 8081/3000, executar `pnpm check`, registrar checkpoint com os arquivos do produto e usar o Dashboard para gerar APK/AAB Android ou build iOS/TestFlight. A validação visual será feita no Preview e a validação nativa de câmera, push e biometria dependerá de dispositivo/build nativo.
