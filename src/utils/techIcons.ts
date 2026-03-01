// src/utils/techIcons.ts
// Shared mapping of technology names to Iconify CSS/Astro-Icon names.
// Usage: <Icon name={getTechIcon('python')} />

const TECH_ICONS: Record<string, string> = {
    // ─── Languages ───
    python: 'devicon:python',
    typescript: 'devicon:typescript',
    javascript: 'devicon:javascript',
    java: 'devicon:java',
    rust: 'devicon:rust',
    go: 'devicon:go',
    html: 'devicon:html5',
    css: 'devicon:css3',
    sql: 'mdi:database',
    astro: 'devicon:astro',

    // ─── Frameworks & Libraries ───
    vue: 'devicon:vuejs',
    react: 'devicon:react',
    angular: 'devicon:angularjs',
    pytorch: 'devicon:pytorch',
    tensorflow: 'devicon:tensorflow',
    langchain: 'mdi:link-variant',
    nextjs: 'devicon:nextjs',

    // ─── Data & ML ───
    spark: 'mdi:lightning-bolt',
    airflow: 'mdi:weather-windy',
    etl: 'mdi:swap-horizontal',
    'delta-lake': 'mdi:diamond-stone',
    rag: 'mdi:book-open-variant',
    llm: 'mdi:head-cog',
    ml: 'mdi:robot',
    lora: 'mdi:target',

    // ─── Infrastructure & DevOps ───
    docker: 'devicon:docker',
    dockerfile: 'devicon:docker',
    kubernetes: 'devicon:kubernetes',
    cloudflare: 'devicon:cloudflare',
    aws: 'devicon:amazonwebservices-wordmark',
    edge: 'mdi:web',
    linux: 'devicon:linux',
    git: 'devicon:git',

    // ─── Tools ───
    automation: 'mdi:cog',
    vscode: 'mdi:microsoft-visual-studio-code',

    // ─── Fallback ───
    default: 'mdi:tag',
};

/**
 * Returns the Iconify string for a given tech name.
 * Matches case-insensitively.
 */
export function getTechIcon(tech: string): string {
    return TECH_ICONS[tech.toLowerCase()] || TECH_ICONS.default;
}

/**
 * Returns the Iconify string for a programming language.
 */
export function getLangIcon(lang: string): string {
    return TECH_ICONS[lang.toLowerCase()] || 'mdi:code-tags';
}

export default TECH_ICONS;
