const fetch = require('node-fetch');
const cheerio = require('cheerio');
const moment = require('moment');
const { createClient } = require('@supabase/supabase-js');

const SCRAPPING_INTERVAL = 5; // segundos entre chamadas
const DEFAULT_HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"};
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 segundos

// Função com retry automático
async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
            if (i < retries - 1) {
                console.log(`[RETRY] Tentativa ${i + 1}/${retries} falhou, aguardando ${RETRY_DELAY}ms...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
        } catch (error) {
            if (i < retries - 1) {
                console.log(`[RETRY] Erro: ${error.message}. Tentativa ${i + 1}/${retries}, aguardando ${RETRY_DELAY}ms...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            } else {
                throw error;
            }
        }
    }
}

async function getResultsFromDou() {
    const keywords = [
        "previdencia social",
    ];

    const results = {};

    for (const keyword of keywords) {
        results[keyword] = [];
        
        // Alterado para buscar por "dia" conforme solicitado
        let payload = {
            "q": `"${keyword}"`, 
            "s": "todos",
            "exactDate": "dia", // Busca apenas o dia atual
            "sortType": "1",
        };

        let numberPages = 1;
        let lastItem = null;

        try {
            const url = new URL("https://www.in.gov.br/consulta/-/buscar/dou");
            Object.keys(payload).forEach(key => url.searchParams.append(key, payload[key]));
            
            console.log(`[INFO] Buscando keyword: '${keyword}' para o dia de hoje...`);
            const initialPageResponse = await fetchWithRetry(
                url.toString(),
                { method: 'GET', headers: DEFAULT_HEADERS }
            );
            
            if (!initialPageResponse.ok) {
                throw new Error(`Request failed with status ${initialPageResponse.status}`);
            }
            const initialPageText = await initialPageResponse.text();
            const $ = cheerio.load(initialPageText);

            // Detecta o número total de páginas
            const paginationTag = $('#lastPage');
            if (paginationTag.length) {
                numberPages = parseInt(paginationTag.text().trim());
            } else {
                // Verifica se existe pelo menos o botão da página 2
                numberPages = $('#2btn').length ? 2 : 1;
            }
            
            console.log(`[INFO] Total de páginas encontradas: ${numberPages}`);

            // Processa a primeira página
            const scriptTag = $('script#_br_com_seatecnologia_in_buscadou_BuscaDouPortlet_params');
            if (scriptTag.length && scriptTag.html()) {
                const data = JSON.parse(scriptTag.html());
                const searchResults = data.jsonArray || [];
                if (searchResults.length) {
                    for (const content of searchResults) {
                        const item = {
                            secao: content.pubName || content.secao,
                            title: content.title,
                            url: content.urlTitle,
                            abstract: content.content,
                            date: content.pubDate,
                            classPK: content.classPK,
                            displayDateSortable: content.displayDateSortable,
                        };
                        results[keyword].push(item);
                    }
                    lastItem = searchResults[searchResults.length - 1];
                    console.log(`[OK] Página 1 processada. Itens coletados: ${searchResults.length}`);
                }
            }

        } catch (e) {
            console.error(`[ERRO] Falha na busca inicial para '${keyword}': ${e.message}`);
            continue;
        }

        // Paginação até o final
        for (let pageNum = 1; pageNum < numberPages; pageNum++) {
            console.log(`[INFO] Navegando para a página ${pageNum + 1} de ${numberPages}...`);
            
            if (lastItem) {
                // Atualiza o payload com os dados do último item para carregar a próxima página corretamente
                payload = {
                    ...payload,
                    "id": lastItem.classPK,
                    "displayDate": lastItem.displayDateSortable,
                    "newPage": pageNum + 1,
                    "currentPage": pageNum,
                };
            }

            try {
                const url = new URL("https://www.in.gov.br/consulta/-/buscar/dou");
                Object.keys(payload).forEach(key => url.searchParams.append(key, payload[key]));

                const pageResponse = await fetch(
                    url.toString(),
                    { method: 'GET', headers: DEFAULT_HEADERS }
                );
                
                if (!pageResponse.ok) {
                    throw new Error(`Request failed on page ${pageNum + 1} with status ${pageResponse.status}`);
                }
                
                const pageText = await pageResponse.text();
                const $page = cheerio.load(pageText);

                const scriptTag = $page('script#_br_com_seatecnologia_in_buscadou_BuscaDouPortlet_params');
                if (!scriptTag.length || !scriptTag.html()) {
                    console.log(`[AVISO] Script tag não encontrada na página ${pageNum + 1}`);
                    break;
                }

                const data = JSON.parse(scriptTag.html());
                const searchResults = data.jsonArray || [];
                if (!searchResults.length) {
                    console.log(`[INFO] Nenhum resultado adicional na página ${pageNum + 1}`);
                    break;
                }

                for (const content of searchResults) {
                    const item = {
                        secao: content.pubName || content.secao,
                        title: content.title,
                        url: content.urlTitle,
                        abstract: content.content,
                        date: content.pubDate,
                        classPK: content.classPK,
                        displayDateSortable: content.displayDateSortable,
                    };
                    results[keyword].push(item);
                }

                lastItem = searchResults[searchResults.length - 1];
                console.log(`[OK] Página ${pageNum + 1} processada. Itens totais: ${results[keyword].length}`);

            } catch (e) {
                console.error(`[ERRO] Falha na página ${pageNum + 1} para '${keyword}': ${e.message}`);
                break;
            }
            
            // Intervalo para evitar bloqueio
            await new Promise(resolve => setTimeout(resolve, SCRAPPING_INTERVAL * 1000));
        }
    }
    return results;
}

async function fetchArticleText(url) {
    try {
        const response = await fetch(url, { headers: DEFAULT_HEADERS, timeout: 10000 });
        if (!response.ok) {
            throw new Error(`Falha ao buscar artigo: ${response.status}`);
        }
        const text = await response.text();
        const $ = cheerio.load(text);

        const selectors = ["article", "div.conteudo", "div#texto", "div.content", "div.conteudo-noticia"];
        for (const sel of selectors) {
            const node = $(sel);
            if (node.length) {
                const paragraphs = [];
                node.find('p, span').each((i, el) => {
                    const paragraphText = $(el).text().trim();
                    if (paragraphText) {
                        paragraphs.push(paragraphText);
                    }
                });
                const fullText = paragraphs.join(' ').trim();
                if (fullText.length > 50) {
                    return fullText;
                }
            }
        }
        return $('body').text().trim(); 
    } catch (e) {
        console.error(`[ERRO] Falha ao extrair texto da URL ${url}: ${e.message}`);
        return "";
    }
}

function parseDate(dateStr) {
    if (!dateStr) return null;

    let s = dateStr.trim().replace(/\u00a0/g, " ").replace(/\s\s+/g, " ");

    const formats = ["DD/MM/YYYY", "DD/MM/YYYY HH:mm:ss", "DD/MM/YYYY HH:mm", "YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DD"];

    for (const fmt of formats) {
        const mDate = moment(s, fmt, true);
        if (mDate.isValid()) {
            return (fmt === "DD/MM/YYYY" || fmt === "YYYY-MM-DD") ? mDate.format("YYYY-MM-DD") : mDate.toISOString();
        }
    }

    const match = s.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;

    return null;
}

function _supabaseClient() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_KEY não configuradas");
    return createClient(url, key);
}

async function upsertArticleSupabase(sb, record) {
    try {
        const payload = {
            classpk: record.classPK,
            title: record.title,
            url: record.url,
            date: record.date,
            summary: record.summary,
            full_text: record.full_text,
            fetched_at: record.fetched_at,
        };
        const { error } = await sb.from("articles").upsert(payload, { onConflict: "classpk" });
        if (error) throw error;
    } catch (e) {
        console.error(`[ERRO] Supabase Upsert (classPK: ${record.classPK}):`, e.message);
    }
}

function buildFullUrl(urlPart, classpk = null) {
    if (!urlPart && classpk) return `https://www.in.gov.br/consulta/-/detalhe/${classpk}`;
    const up = urlPart.trim();
    if (up.startsWith("http")) return up;
    if (up.startsWith("/web/dou/-/")) return "https://www.in.gov.br" + up;
    if (up.startsWith("/")) return "https://www.in.gov.br" + up;
    if (up.startsWith("web/dou/-/")) return "https://www.in.gov.br/" + up;
    if (up.startsWith("web/") || up.startsWith("consulta/")) return "https://www.in.gov.br/" + up;
    if (up.includes("-") && !isNaN(up.slice(-1))) return `https://www.in.gov.br/web/dou/-/${up}`;
    return classpk ? `https://www.in.gov.br/consulta/-/detalhe/${classpk}` : "https://www.in.gov.br";
}

async function processAndUpsert(results) {
    const sb = _supabaseClient();
    for (const keyword in results) {
        for (const item of results[keyword]) {
            const urlPart = item.url || item.urlTitle || "";
            const fullUrl = buildFullUrl(urlPart, item.classPK);
            console.log(`[INFO] Processando: ${fullUrl}`);
            
            const fullText = await fetchArticleText(fullUrl) || (item.abstract || "");
            const parsedDate = parseDate(item.date);

            const rec = {
                classPK: item.classPK,
                title: item.title,
                url: fullUrl,
                date: parsedDate,
                summary: null,
                full_text: fullText,
                fetched_at: new Date().toISOString(),
            };
            
            await upsertArticleSupabase(sb, rec);
            console.log(`[OK] Salvo no banco: ${item.classPK}`);
            await new Promise(resolve => setTimeout(resolve, SCRAPPING_INTERVAL * 1000));
        }
    }
}

(async () => {
    console.log("=== INICIANDO SCRAPER DOU (MODO DIÁRIO) ===");
    const results = await getResultsFromDou();
    const count = results["previdencia social"].length;
    console.log(`\n=== BUSCA CONCLUÍDA ===`);
    console.log(`Total de itens encontrados hoje para 'previdencia social': ${count}`);
    
    console.log(JSON.stringify(results));
    if (count > 0) {
    }
})();
