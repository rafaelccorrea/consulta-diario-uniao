import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock context for testing
function createMockContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Articles Router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("articles.list", () => {
    it("should return articles list structure", async () => {
      const result = await caller.articles.list({
        limit: 10,
        offset: 0,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeDefined();
      expect(typeof result.total).toBe("number");
    });

    it("should support filtering by query", async () => {
      const result = await caller.articles.list({
        query: "test",
        limit: 10,
        offset: 0,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should support filtering by section", async () => {
      const result = await caller.articles.list({
        section: "Test Section",
        limit: 10,
        offset: 0,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should respect pagination parameters", async () => {
      const result1 = await caller.articles.list({
        limit: 5,
        offset: 0,
      });

      const result2 = await caller.articles.list({
        limit: 5,
        offset: 5,
      });

      expect(result1.data.length).toBeLessThanOrEqual(5);
      expect(result2.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe("articles.sections", () => {
    it("should return list of sections", async () => {
      const sections = await caller.articles.sections();

      expect(sections).toBeDefined();
      expect(Array.isArray(sections)).toBe(true);
      // Pode estar vazio se nao ha artigos
    });
  });

  describe("articles.upsert", () => {
    it("should create an article", async () => {
      const result = await caller.articles.upsert({
        classPK: "test-article-123",
        title: "Test Article Title",
        url: "https://example.com/test",
        section: "Test Section",
        date: "2026-02-26",
        summary: "This is a test article summary",
        fullText: "This is the full text of the test article",
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should update existing article", async () => {
      const classPK = "test-article-update-123";

      // Create first
      await caller.articles.upsert({
        classPK,
        title: "Original Title",
        url: "https://example.com/test",
        section: "Test Section",
        date: "2026-02-26",
        summary: "Original summary",
      });

      // Update
      const result = await caller.articles.upsert({
        classPK,
        title: "Updated Title",
        url: "https://example.com/test-updated",
        section: "Updated Section",
        date: "2026-02-27",
        summary: "Updated summary",
      });

      expect(result.success).toBe(true);
    });
  });
});
