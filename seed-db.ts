import { drizzle } from "drizzle-orm/mysql2";
import { articles } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const testArticles = [
  {
    classPK: "1",
    title: "Portaria sobre diretrizes de previdência social",
    url: "https://www.in.gov.br/consulta/-/detalhe/1",
    section: "Seção 1",
    date: "2026-02-26",
    summary: "Portaria que estabelece novas diretrizes para o sistema de previdência social",
    fullText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    fetchedAt: new Date(),
  },
  {
    classPK: "2",
    title: "Resolução sobre contribuições previdenciárias",
    url: "https://www.in.gov.br/consulta/-/detalhe/2",
    section: "Seção 2",
    date: "2026-02-25",
    summary: "Resolução que altera as alíquotas de contribuição para o INSS",
    fullText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    fetchedAt: new Date(),
  },
  {
    classPK: "3",
    title: "Edital de benefícios previdenciários",
    url: "https://www.in.gov.br/consulta/-/detalhe/3",
    section: "Seção 1",
    date: "2026-02-24",
    summary: "Edital publicando lista de beneficiários de auxílio-doença",
    fullText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    fetchedAt: new Date(),
  },
  {
    classPK: "4",
    title: "Comunicado sobre reforma da previdência",
    url: "https://www.in.gov.br/consulta/-/detalhe/4",
    section: "Seção 3",
    date: "2026-02-23",
    summary: "Comunicado do Ministério da Previdência sobre reforma estrutural",
    fullText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    fetchedAt: new Date(),
  },
  {
    classPK: "5",
    title: "Decreto de regulamentação de benefícios",
    url: "https://www.in.gov.br/consulta/-/detalhe/5",
    section: "Seção 1",
    date: "2026-02-22",
    summary: "Decreto que regulamenta a concessão de benefícios previdenciários",
    fullText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    fetchedAt: new Date(),
  },
  {
    classPK: "6",
    title: "Portaria sobre revisão de aposentadorias",
    url: "https://www.in.gov.br/consulta/-/detalhe/6",
    section: "Seção 2",
    date: "2026-02-21",
    summary: "Portaria estabelecendo procedimentos para revisão de aposentadorias",
    fullText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    fetchedAt: new Date(),
  },
  {
    classPK: "7",
    title: "Aviso de suspensão de benefícios",
    url: "https://www.in.gov.br/consulta/-/detalhe/7",
    section: "Seção 3",
    date: "2026-02-20",
    summary: "Aviso de suspensão de benefícios por falta de comprovação de vida",
    fullText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    fetchedAt: new Date(),
  },
  {
    classPK: "8",
    title: "Instrução normativa sobre contribuições",
    url: "https://www.in.gov.br/consulta/-/detalhe/8",
    section: "Seção 1",
    date: "2026-02-19",
    summary: "Instrução normativa sobre cálculo de contribuições previdenciárias",
    fullText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    fetchedAt: new Date(),
  },
];

async function seed() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");

    for (const article of testArticles) {
      await db.insert(articles).values(article).onDuplicateKeyUpdate({
        set: {
          title: article.title,
          url: article.url,
          section: article.section,
          date: article.date,
          summary: article.summary,
          fullText: article.fullText,
          fetchedAt: article.fetchedAt,
        },
      });
      console.log(`✓ Artigo adicionado: ${article.title}`);
    }

    console.log("\n✅ Seed concluído com sucesso!");
    console.log(`Total de artigos adicionados: ${testArticles.length}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    process.exit(1);
  }
}

seed();
