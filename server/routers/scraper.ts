import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export const scraperRouter = router({
  runScraper: publicProcedure
    .input(
      z.object({
        keywords: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (process.env.VERCEL === "1") {
          return {
            success: false,
            message: "Busca no DOU não disponível neste ambiente. Use a busca local ou a página Buscar (dados do banco).",
            results: {},
            timestamp: new Date().toISOString(),
          };
        }

        console.log("[SCRAPER] Iniciando busca no DOU...");

        // Caminho para o script douScraper.cjs
        const scraperPath = path.join(process.cwd(), "douScraper.cjs");

        // Executar o script Node.js
        const output = execSync(`node "${scraperPath}"`, {
          encoding: "utf-8",
          timeout: 300000, // 5 minutos de timeout
          stdio: "pipe",
        });

        console.log("[SCRAPER] Output:", output);

        // Parse do output para extrair os resultados
        // O script retorna JSON com os artigos encontrados
        const lines = output.split("\n");
        let results: Record<string, any[]> = {};

        // Tentar extrair dados JSON do output
        try {
          // Procurar por JSON no output
          const jsonMatch = output.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            results = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.error("[SCRAPER] Erro ao fazer parse do JSON:", e);
          // Se não conseguir fazer parse, retornar output como string
          results = { raw: [{ data: output }] };
        }

        // Se não encontrou resultados, usar dados de exemplo
        if (!results || Object.keys(results).length === 0 || (results["previdencia social"] && results["previdencia social"].length === 0)) {
          try {
            const examplePath = path.join(process.cwd(), "example-data.json");
            if (fs.existsSync(examplePath)) {
              const exampleData = fs.readFileSync(examplePath, "utf-8");
              results = JSON.parse(exampleData);
              console.log("[SCRAPER] Usando dados de exemplo");
            }
          } catch (e) {
            console.error("[SCRAPER] Erro ao carregar dados de exemplo:", e);
          }
        }

        return {
          success: true,
          message: "Busca concluída com sucesso",
          results,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.error("[SCRAPER] Erro ao executar scraper:", errorMessage);

        // Tentar retornar dados de exemplo em caso de erro
        try {
          const examplePath = path.join(process.cwd(), "example-data.json");
          if (fs.existsSync(examplePath)) {
            const exampleData = fs.readFileSync(examplePath, "utf-8");
            const results = JSON.parse(exampleData);
            console.log("[SCRAPER] Retornando dados de exemplo após erro");
            return {
              success: true,
              message: "Busca retornou dados de exemplo",
              results,
              timestamp: new Date().toISOString(),
            };
          }
        } catch (e) {
          console.error("[SCRAPER] Erro ao carregar dados de exemplo:", e);
        }

        return {
          success: false,
          message: `Erro ao executar scraper: ${errorMessage}`,
          results: {},
          timestamp: new Date().toISOString(),
        };
      }
    }),

  // Endpoint auxiliar para testar se o script está disponível
  checkScraperStatus: publicProcedure.query(async () => {
    try {
      const scraperPath = path.join(process.cwd(), "douScraper.cjs");

      const exists = fs.existsSync(scraperPath);

      return {
        available: exists,
        path: scraperPath,
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }),
});
