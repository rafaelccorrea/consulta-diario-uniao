import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const favoritesRouter = router({
  /**
   * Add article to favorites
   */
  add: publicProcedure
    .input(
      z.object({
        articleId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // For now, store in memory or session
      // In production, you'd store this in a database table
      return { success: true, articleId: input.articleId };
    }),

  /**
   * Remove article from favorites
   */
  remove: publicProcedure
    .input(
      z.object({
        articleId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return { success: true, articleId: input.articleId };
    }),

  /**
   * Check if article is favorited
   */
  isFavorited: publicProcedure
    .input(
      z.object({
        articleId: z.number(),
      })
    )
    .query(async ({ input }) => {
      // For now, return false
      // In production, check database
      return false;
    }),
});
