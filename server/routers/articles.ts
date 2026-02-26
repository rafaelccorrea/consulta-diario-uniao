import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getArticles, getArticlesCount, getUniqueSections, upsertArticle } from "../db";

export const articlesRouter = router({
  /**
   * Get articles with filters
   */
  list: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        section: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input }) => {
      const articles = await getArticles({
        query: input.query,
        section: input.section,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        limit: input.limit,
        offset: input.offset,
      });

      const total = await getArticlesCount({
        query: input.query,
        section: input.section,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
      });

      return {
        data: articles,
        total,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get unique sections
   */
  sections: publicProcedure.query(async () => {
    const sections = await getUniqueSections();
    return sections;
  }),

  /**
   * Create or update an article
   */
  upsert: publicProcedure
    .input(
      z.object({
        classPK: z.string(),
        title: z.string(),
        url: z.string(),
        section: z.string().optional(),
        date: z.string().optional(),
        summary: z.string().optional(),
        fullText: z.string().optional(),
        fetchedAt: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await upsertArticle({
        classPK: input.classPK,
        title: input.title,
        url: input.url,
        section: input.section,
        date: input.date,
        summary: input.summary,
        fullText: input.fullText,
        fetchedAt: input.fetchedAt || new Date(),
      });

      return { success: true };
    }),
});
