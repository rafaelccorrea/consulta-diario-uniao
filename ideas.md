# DOU Insights - Conceitos de Design

## Análise do Script
O `douScraper.js` coleta artigos do Diário Oficial da União (DOU) sobre "previdência social", extraindo:
- Título, URL, resumo, data de publicação
- Seção do diário
- Texto completo do artigo
- Armazenamento em Supabase

**Necessidade visual:** Dashboard moderno que exiba artigos em cards, com busca, filtros, e estatísticas de publicações.

---

## Resposta 1: Minimalismo Corporativo com Acentos Vibrantes

<response>
<text>
**Design Movement:** Minimalismo Corporativo + Accent Colors (inspirado em design de fintech moderno)

**Core Principles:**
- Hierarquia clara através de espaçamento e tipografia
- Paleta neutra (branco, cinza) com acentos em azul/verde vibrante
- Foco em legibilidade e funcionalidade
- Componentes simples e diretos

**Color Philosophy:**
- Fundo: Branco puro (#FFFFFF) com cinzas leves (#F8F9FA, #E9ECEF)
- Primário: Azul vibrante (#0066FF) para CTAs e destaques
- Secundário: Verde menta (#10B981) para sucesso/status positivo
- Texto: Cinza escuro (#1F2937) para máximo contraste
- Intenção: Transmitir confiança, profissionalismo e modernidade

**Layout Paradigm:**
- Grid assimétrico com seções de largura variável
- Sidebar esquerda com navegação fixa
- Conteúdo principal com cards em grid responsivo
- Uso de whitespace generoso entre elementos

**Signature Elements:**
- Cards com sombra suave (0 4px 12px rgba(0,0,0,0.08))
- Badges coloridas para categorias/status
- Ícones minimalistas em azul primário
- Linhas divisórias sutis em cinza claro

**Interaction Philosophy:**
- Transições suaves (0.2s) em hover
- Feedback visual imediato em cliques
- Animações de entrada para cards (fade + slide)
- Estados de carregamento com skeleton loaders

**Animation:**
- Fade-in suave (0.3s) para cards ao carregar
- Hover: elevação sutil (shadow increase) + mudança de cor do texto
- Transição de cor em botões (0.15s ease-in-out)
- Pulse suave em badges de "novo"

**Typography System:**
- Display: Poppins Bold 700 (24-32px) para títulos principais
- Heading: Poppins SemiBold 600 (16-20px) para subtítulos
- Body: Inter Regular 400 (14-16px) para texto
- Accent: Poppins Medium 500 para labels e badges
</text>
<probability>0.08</probability>
</response>

---

## Resposta 2: Design Moderno com Gradientes e Glassmorphism

<response>
<text>
**Design Movement:** Glassmorphism + Neumorphism Suave (inspirado em Apple/Microsoft design systems)

**Core Principles:**
- Efeito de vidro fosco (frosted glass) para containers principais
- Gradientes sutis como pano de fundo
- Profundidade através de blur e transparência
- Tipografia grande e confiante

**Color Philosophy:**
- Fundo: Gradiente suave de azul-índigo (#0F172A → #1E3A8A)
- Primário: Ciano/Azul claro (#06B6D4) para destaques
- Secundário: Roxo suave (#A78BFA) para elementos secundários
- Texto: Branco (#FFFFFF) em backgrounds escuros
- Intenção: Modernidade, sofisticação, tecnologia de ponta

**Layout Paradigm:**
- Hero section com gradiente full-width
- Cards com efeito glassmorphism (backdrop-filter: blur)
- Layout em cascata (cards em ângulo diagonal)
- Seções com espaçamento vertical generoso

**Signature Elements:**
- Cards com borda translúcida (border: 1px solid rgba(255,255,255,0.2))
- Ícones com gradiente interno
- Botões com efeito glow ao hover
- Separadores com gradiente linear

**Interaction Philosophy:**
- Animações fluidas com easing cubic-bezier
- Hover: aumento de blur + mudança de cor
- Clique: scale transform (0.95) + feedback de cor
- Scroll: parallax suave em backgrounds

**Animation:**
- Entrada: fade + scale (0 → 1) com 0.4s
- Hover: blur aumenta de 10px → 15px, cor muda com transição 0.2s
- Scroll: elementos entram com stagger (0.1s entre cada)
- Pulse em elementos destacados (2s loop)

**Typography System:**
- Display: Sora Bold 700 (28-40px) para títulos
- Heading: Sora SemiBold 600 (18-24px) para subtítulos
- Body: Sora Regular 400 (14-16px) para texto
- Monospace: JetBrains Mono para dados técnicos
</text>
<probability>0.07</probability>
</response>

---

## Resposta 3: Design Orgânico com Formas Arredondadas e Cores Quentes

<response>
<text>
**Design Movement:** Organic Design + Warm Minimalism (inspirado em Stripe, Notion)

**Core Principles:**
- Formas arredondadas e suaves (border-radius: 20-32px)
- Paleta de cores quentes e acessíveis
- Tipografia humanista e amigável
- Espaçamento orgânico (não-grid rígido)

**Color Philosophy:**
- Fundo: Creme/Bege (#FFFBF0) com texturas sutis
- Primário: Laranja quente (#F97316) para ações
- Secundário: Âmbar (#FBBF24) para destaques
- Terciário: Verde sálvia (#78716C) para elementos neutros
- Texto: Marrom escuro (#44403C) para máxima legibilidade
- Intenção: Acolhedor, moderno, acessível

**Layout Paradigm:**
- Seções com altura variável e formas assimétricas
- Cards com cantos arredondados generosos
- Uso de ilustrações abstratas como divisores
- Alinhamento não-centralizado (left-aligned em seções)

**Signature Elements:**
- Cards com fundo degradado suave (laranja → âmbar)
- Ilustrações abstratas em SVG (formas orgânicas)
- Badges com fundo colorido e ícone
- Linhas decorativas em laranja suave

**Interaction Philosophy:**
- Animações suaves e previsíveis
- Feedback visual em cores quentes
- Micro-interações em hover (mudança de cor + scale)
- Estados de loading com animação de pulso

**Animation:**
- Entrada: slide de baixo + fade (0.5s ease-out)
- Hover: scale (1 → 1.02) + mudança de cor (0.2s)
- Clique: scale (1.02 → 0.98) + feedback de cor
- Scroll: elementos entram com parallax suave

**Typography System:**
- Display: Outfit Bold 700 (32-48px) para títulos
- Heading: Outfit SemiBold 600 (20-28px) para subtítulos
- Body: Outfit Regular 400 (14-16px) para texto
- Accent: Outfit Medium 500 para labels
</text>
<probability>0.06</probability>
</response>

---

## Seleção: Resposta 1 - Minimalismo Corporativo com Acentos Vibrantes

**Decisão:** Escolho o **Minimalismo Corporativo** por ser mais apropriado para um dashboard de dados governamentais. A paleta neutra com acentos vibrantes transmite profissionalismo e confiança, enquanto mantém a legibilidade máxima para leitura de artigos e dados.

**Justificativa:**
- Dados legais/governamentais exigem clareza visual
- Azul primário é cor universal de confiança
- Espaçamento generoso melhora a experiência de leitura
- Componentes simples facilitam manutenção futura
- Fácil de expandir com novos dados/seções

---

## Estrutura da Landing Page

### Seções Planejadas:
1. **Header/Navbar** - Logo, navegação, busca global
2. **Hero Section** - Título, descrição, CTA
3. **Dashboard Preview** - Grid de artigos recentes
4. **Estatísticas** - Cards com métricas (total artigos, últimas 24h, etc)
5. **Features** - Como usar o dashboard (3-4 cards)
6. **CTA Section** - Chamada para ação final
7. **Footer** - Links, copyright

### Componentes Principais:
- ArticleCard: Exibe título, data, seção, resumo
- SearchBar: Busca global com filtros
- StatCard: Exibe métrica com ícone
- FeatureCard: Descreve funcionalidade
- Navbar: Navegação persistente

### Dados Mock:
Artigos de exemplo sobre "previdência social" com estrutura real do script.
