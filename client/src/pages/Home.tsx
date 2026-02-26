import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ArticleCard from "@/components/ArticleCard";
import StatCard from "@/components/StatCard";
import FeatureCard from "@/components/FeatureCard";
import {
  FileText,
  Calendar,
  TrendingUp,
  Search,
  Zap,
  BarChart3,
  Shield,
  Clock,
  ChevronRight,
  Github,
  Mail,
} from "lucide-react";
import { useState } from "react";

/**
 * Home Page - DOU Insights Landing Page
 * Design: Minimalist Corporate with Blue/Green Accents
 * - Clean white background
 * - Blue (#0066FF) primary color
 * - Green (#10B981) secondary accents
 * - Poppins for headings, Inter for body
 */
export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for articles
  const mockArticles = [
    {
      id: 1,
      title: "Portaria sobre diretrizes de previdência social 2024",
      date: "26 de fevereiro de 2024",
      section: "Seção 1",
      summary:
        "Novas diretrizes para a administração de benefícios previdenciários, com foco em modernização dos processos e melhor atendimento ao cidadão.",
      url: "https://www.in.gov.br",
    },
    {
      id: 2,
      title: "Resolução sobre contribuições previdenciárias",
      date: "25 de fevereiro de 2024",
      section: "Seção 1",
      summary:
        "Estabelece novos critérios para cálculo e arrecadação de contribuições ao sistema de previdência social.",
      url: "https://www.in.gov.br",
    },
    {
      id: 3,
      title: "Comunicado sobre beneficiários de aposentadoria",
      date: "24 de fevereiro de 2024",
      section: "Seção 2",
      summary:
        "Informações importantes para beneficiários sobre prazos de renovação de cadastro e documentação necessária.",
      url: "https://www.in.gov.br",
    },
    {
      id: 4,
      title: "Edital de concessão de auxílio previdenciário",
      date: "23 de fevereiro de 2024",
      section: "Seção 1",
      summary:
        "Abertura de processo para análise e concessão de auxílios previdenciários extraordinários.",
      url: "https://www.in.gov.br",
    },
  ];

  const stats = [
    {
      icon: FileText,
      value: "1,247",
      label: "Total de Artigos",
      color: "blue" as const,
    },
    {
      icon: Calendar,
      value: "156",
      label: "Artigos Hoje",
      color: "green" as const,
    },
    {
      icon: TrendingUp,
      value: "892",
      label: "Esta Semana",
      color: "cyan" as const,
    },
    {
      icon: Search,
      value: "8",
      label: "Palavras-chave Ativas",
      color: "purple" as const,
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Monitoramento em Tempo Real",
      description:
        "Receba atualizações instantâneas sobre novos artigos publicados no DOU relacionados às suas palavras-chave.",
    },
    {
      icon: BarChart3,
      title: "Análise de Dados",
      description:
        "Visualize estatísticas detalhadas sobre publicações, tendências e padrões de conteúdo.",
    },
    {
      icon: Shield,
      title: "Segurança Garantida",
      description:
        "Seus dados são protegidos com criptografia de ponta a ponta e conformidade com regulamentações.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://private-us-east-1.manuscdn.com/sessionFile/8n3CekvAHkJ3an3EiYMtMw/sandbox/Xx5GyFbOVJpO0AkweAkhEx-img-3_1772136969000_na1fn_bGVnYWxpeC1sb2dvLWljb24.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvOG4zQ2VrdkFIa0ozYW4zRWlZTXRNdy9zYW5kYm94L1h4NUd5RmJPVkpwTzBBa3dlQWtoRXgtaW1nLTNfMTc3MjEzNjk2OTAwMF9uYTFmbl9iR1ZuWVd4cGVDMXNiMmR2TFdsamIyNC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=hV5YOHIrM2KdoJh9S6G8i9tgB2~6Tr7L-NWgAOTEe3uAn7H76w0taJCQ57PLXG4Bmh4FkbOX2UcTcszKdi3XpuT23XBb17DDwZ-kZtRXozF0a9lwiBOIdmuIrqfhXhqIPIzGfAVVmPzGe7svh69PkIwd-zr8V8baEs~1HVzd1XMDyN51nfZ4pltxPCq57W2ZPoOHwEqp99zz4LuYnCVJVrvI4i4tXrE3N--Tzv7hTqagCoNF9YsTNAjbMZATMNUrahajUoqLClsyRdKE~9PHDIsyhaCbwJPZMWskZ3nPH6dYn3La0PKJPAS9tm6RzrSJcCzHgdKiyh-INIboIUwTVw__" alt="LEGALIX" className="w-10 h-10" />
            <h1 className="text-xl font-bold text-gray-900">LEGALIX</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#dashboard"
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              Dashboard
            </a>
            <a
              href="#features"
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              Funcionalidades
            </a>
            <a
              href="#contact"
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              Contato
            </a>
          </nav>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        {/* Background image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url('https://private-us-east-1.manuscdn.com/sessionFile/8n3CekvAHkJ3an3EiYMtMw/sandbox/yEA43SGyV3iPKNukcHcgTS-img-1_1772136392000_na1fn_aGVyby1iYWNrZ3JvdW5k.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvOG4zQ2VrdkFIa0ozYW4zRWlZTXRNdy9zYW5kYm94L3lFQTQzU0d5VjNpUEtOdWtjSGNnVFMtaW1nLTFfMTc3MjEzNjM5MjAwMF9uYTFmbl9hR1Z5YnkxaVlXTnJaM0p2ZFc1ay5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=HEWQKQsyHPjeKFWM-eXua4Xfol4DitoIgF0xgv-LnRWtIvnOMoPo6SjlU7SoFW-znhEOTOt4r88HPOQUmaoFF-Cr2rb~oo8GVm63-NkCN15cUKTyeFEOO1eqcm-OGOiu-6g4nNhBjuoDOuHIOrD7XovroDaapeCG2uYEJj8vU7-dkKPh~b0TzxP8iI7RC2d3rd1xn7z9zB5hlViLOrOd2oeTpohjDpVpBYEAz7aPcnscLs5WsAAsNF1-8aXOJYPSwNQMz~EWaB0cBgE-ho5Cc1flBlyCy~LHwscUZqQ9Zfn89Qk5yaSjOzYdlGcfq~RH00l2V0EzsJ0HPUKBgzLODg__')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-white/85 z-10" />

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Inteligência nos Dados do DOU
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Monitore publicações do Diário Oficial da União em tempo real.
              Organize, analise e tome decisões baseadas em dados precisos com LEGALIX.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Começar Agora
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Documentação
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATISTICS SECTION ===== */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Estatísticas do Dashboard
            </h3>
            <p className="text-gray-600 text-lg">
              Dados atualizados em tempo real sobre publicações do DOU
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== DASHBOARD PREVIEW SECTION ===== */}
      <section id="dashboard" className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Artigos Recentes
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              Últimas publicações sobre previdência social
            </p>

            {/* Search bar */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 text-base border-gray-200 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Articles grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockArticles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                date={article.date}
                section={article.section}
                summary={article.summary}
                url={article.url}
              />
            ))}
          </div>

          {/* Load more button */}
          <div className="mt-12 text-center">
            <Button
              size="lg"
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Carregar Mais Artigos
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Principais
            </h3>
            <p className="text-gray-600 text-lg">
              Tudo que você precisa para monitorar o DOU eficientemente
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="bg-blue-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para começar?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Acesse o dashboard completo e comece a monitorar publicações do DOU
            em tempo real.
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
          >
            Acessar Dashboard
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer id="contact" className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="https://private-us-east-1.manuscdn.com/sessionFile/8n3CekvAHkJ3an3EiYMtMw/sandbox/Xx5GyFbOVJpO0AkweAkhEx-img-3_1772136969000_na1fn_bGVnYWxpeC1sb2dvLWljb24.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvOG4zQ2VrdkFIa0ozYW4zRWlZTXRNdy9zYW5kYm94L1h4NUd5RmJPVkpwTzBBa3dlQWtoRXgtaW1nLTNfMTc3MjEzNjk2OTAwMF9uYTFmbl9iR1ZuWVd4cGVDMXNiMmR2TFdsamIyNC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=hV5YOHIrM2KdoJh9S6G8i9tgB2~6Tr7L-NWgAOTEe3uAn7H76w0taJCQ57PLXG4Bmh4FkbOX2UcTcszKdi3XpuT23XBb17DDwZ-kZtRXozF0a9lwiBOIdmuIrqfhXhqIPIzGfAVVmPzGe7svh69PkIwd-zr8V8baEs~1HVzd1XMDyN51nfZ4pltxPCq57W2ZPoOHwEqp99zz4LuYnCVJVrvI4i4tXrE3N--Tzv7hTqagCoNF9YsTNAjbMZATMNUrahajUoqLClsyRdKE~9PHDIsyhaCbwJPZMWskZ3nPH6dYn3La0PKJPAS9tm6RzrSJcCzHgdKiyh-INIboIUwTVw__" alt="LEGALIX" className="w-8 h-8" />
                <span className="font-bold text-white">LEGALIX</span>
              </div>
              <p className="text-sm">
                Monitoramento inteligente do Diário Oficial da União
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentação
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold text-white mb-4">Conecte-se</h4>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-sm">
                © 2024 LEGALIX. Todos os direitos reservados.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0 text-sm">
                <a href="#" className="hover:text-white transition-colors">
                  Privacidade
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Termos
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
