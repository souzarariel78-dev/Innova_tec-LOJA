# Entregas MercadoSpot

## Navegação e shell mobile
- [x] Header fixo com busca, localização, notificações e carrinho com contador.
- [x] Navegação inferior com Início, Pedidos, Vender, Favoritos e Perfil, adequada para uso com uma mão.
- [x] Compatibilidade de compilação Expo para Android e iOS, identificadores nativos e assets de launcher próprios.

## Home e descoberta
- [x] Banners promocionais, atalhos por categoria e vitrine de ofertas.
- [x] Grade de produtos com imagem, título, preço, parcelamento, Frete grátis, reputação e favoritar.
- [x] Busca com sugestões visuais, listagem, ordenação e filtros de relevância/preço/vendas.

## Catálogo MCK Ji-Paraná / Ariquemes
- [x] Importar os 400 itens identificados no catálogo PDF enviado, mantendo código, nome, descrição e classificação comercial.
- [x] Aplicar acréscimo de 30% sobre cada preço de catálogo e armazenar o preço-base para auditoria do valor exibido.
- [x] Adicionar 400 imagens locais recortadas do catálogo, vinculadas aos produtos por `require` para funcionar no Expo Go e no Preview web.
- [x] Reenquadrar e aprimorar as 400 imagens com centralização, remoção de margens, contraste, nitidez, fundo uniforme e compressão otimizada para mobile.
- [x] Associar os itens ao vendedor MercadoSpot e distribuir os produtos em 16 categorias de marketplace.
- [x] Remover valores de preço das 400 descrições e exibir MercadoSpot como o nome da loja/vendedor na vitrine e no painel.

## Detalhe do produto
- [x] Galeria de mídia, condição, vendas, avaliações, desconto e parcelamento.
- [x] Ao tocar em uma foto, abrir visualização ampliada com ações visíveis Comprar agora e Adicionar ao carrinho.
- [x] Variações, cálculo de frete por CEP representado na UI, reputação do vendedor, métricas e descrição.
- [ ] Zoom por gesto, vídeo demonstrativo, perguntas e respostas persistidas e avaliações com fotos dependem da camada de dados/media real.

## Compra e checkout
- [x] Carrinho agrupado por vendedor com quantidade, remoção visual e cupom.
- [x] Checkout com endereço, frete, seleção de pagamento, resumo Subtotal + Frete - Descontos = Total.
- [ ] PIX com QR/copia e cola, cartão tokenizado, carteira, boleto e confirmação real dependem de um processador e backend seguro.

## Vendas e conta
- [x] Fluxo de anúncio em cinco passos: mídia; dados/categoria; condição/estoque; preço/exposição; peso/dimensões.
- [x] Painel de pedidos do comprador, favoritos, perfil e atalhos de conta.
- [x] Página de vendedor com os 406 anúncios atuais, busca, filtros por categoria, quantidade de ativos, foto, classificação, preço e dimensão sugerida de embalagem.
- [x] Edição local de descrição e troca de foto via galeria do dispositivo para qualquer anúncio, com modal de edição, salvamento imediato na lista e persistência local entre sessões.
- [x] Cada anúncio aceita até 3 imagens: seleção múltipla da galeria, miniaturas com remoção, persistência local/na API e galeria navegável no detalhe do produto.
- [x] Administrador pode excluir anúncios pelo botão de lixeira, com confirmação, remoção imediata do inventário e sincronização persistente que oculta o produto da Home, busca e detalhe.
- [x] Sincronização com a loja via API `GET /api/seller/products/overrides` e `PUT /api/seller/products/:productId`, com tabela persistente no banco e fallback offline.
- [x] Home, busca e detalhe consomem a mesma fonte sincronizada, portanto foto e descrição alteradas no Vender aparecem para os demais usuários da vitrine.
- [x] Home, busca e detalhe consultam a loja automaticamente a cada 8 segundos quando o app está aberto, além de atualizar imediatamente ao voltar para a aba.
- [ ] Gestão real de pedidos do vendedor, perguntas em tempo real e etiqueta PDF dependem de API e armazenamento.

## Base técnica
- [x] Substituir a marca visual pelos assets da logo Innovatech Online Loja, com fundo transparente, texto grande e legível, ícone sem borda circular e formatos nativos para iOS/Android.
- [x] Aplicar fundo preto sólido ao ícone principal, favicon e fundo adaptativo Android, preservando a logo neon em destaque.
- [x] Adicionar tela de entrada animada com fade e escala suave da logo antes da Home.
- [x] Catálogo, vendedor, pedido, carrinho, frete e checkout tipados em dados mockados reutilizáveis.
- [x] Fronteiras de navegação preparadas para substituir mocks por API/tRPC sem refazer a UI.
- [ ] PostgreSQL, busca Elasticsearch, Redis, WebSockets, FCM, JWT/refresh, biometria e pagamentos reais ainda precisam de credenciais, contratos de API e configuração de produção.
- [x] TypeScript, lint, `pnpm db:push`, Metro 8081 e API 3000 validados; último checkpoint: `2628872`.
