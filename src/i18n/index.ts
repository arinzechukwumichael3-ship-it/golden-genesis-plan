export type Locale = "en" | "es" | "fr" | "de" | "pt" | "ar" | "zh" | "ja";

export const LOCALES: { code: Locale; label: string; flag: string; rtl?: boolean }[] = [
  { code: "en", label: "English",   flag: "🇬🇧" },
  { code: "es", label: "Español",   flag: "🇪🇸" },
  { code: "fr", label: "Français",  flag: "🇫🇷" },
  { code: "de", label: "Deutsch",   flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "ar", label: "العربية",   flag: "🇸🇦", rtl: true },
  { code: "zh", label: "中文",      flag: "🇨🇳" },
  { code: "ja", label: "日本語",    flag: "🇯🇵" },
];

type Strings = {
  nav: { home: string; plans: string; about: string; faq: string; contact: string; dashboard: string };
  auth: { signIn: string; signOut: string; getStarted: string };
  hero: { badge: string; headline: string; headlineAccent: string; subtext: string; cta: string; ctaSecondary: string };
  stats: { countries: string; investors: string; assets: string };
  howItWorks: { title: string; sub: string };
  plans: { title: string; sub: string; start: string };
  cta: { title: string; titleAccent: string; sub: string; button: string; secondary: string };
};

export const translations: Record<Locale, Strings> = {
  en: {
    nav: { home: "Home", plans: "Plans", about: "About", faq: "FAQ", contact: "Contact", dashboard: "Dashboard" },
    auth: { signIn: "Sign in", signOut: "Sign out", getStarted: "Get Started" },
    hero: { badge: "Live · Trusted by 12,400+ investors worldwide", headline: "Turn your capital into", headlineAccent: "crypto income.", subtext: "Join the world's leading copy trading platform. Professional BTC & USDT plans with verified 72-hour payouts.", cta: "Start Earning", ctaSecondary: "View Plans" },
    stats: { countries: "Countries", investors: "Investors", assets: "Assets Managed" },
    howItWorks: { title: "How it works", sub: "No fluff, no fine print. Here's exactly how it works." },
    plans: { title: "Choose your plan", sub: "Three tiers of professionally managed copy trading. All plans pay out within 72 hours.", start: "Start this plan" },
    cta: { title: "Ready to grow your", titleAccent: "wealth?", sub: "Join 12,400+ investors already earning on YieldEmpireCapital. No experience required.", button: "Get Started Free", secondary: "Talk to us" },
  },
  es: {
    nav: { home: "Inicio", plans: "Planes", about: "Nosotros", faq: "Preguntas", contact: "Contacto", dashboard: "Panel" },
    auth: { signIn: "Iniciar sesión", signOut: "Cerrar sesión", getStarted: "Comenzar" },
    hero: { badge: "En vivo · Confiado por más de 12,400 inversores", headline: "Convierte tu capital en", headlineAccent: "ingresos cripto.", subtext: "Únete a la plataforma de copy trading líder mundial. Planes BTC y USDT con pagos verificados en 72 horas.", cta: "Empezar a ganar", ctaSecondary: "Ver planes" },
    stats: { countries: "Países", investors: "Inversores", assets: "Activos gestionados" },
    howItWorks: { title: "Cómo funciona", sub: "Sin complicaciones. Así es exactamente como funciona." },
    plans: { title: "Elige tu plan", sub: "Tres niveles de copy trading gestionado profesionalmente. Todos los planes pagan en 72 horas.", start: "Iniciar este plan" },
    cta: { title: "¿Listo para hacer crecer tu", titleAccent: "patrimonio?", sub: "Únete a más de 12,400 inversores que ya ganan en YieldEmpireCapital.", button: "Comenzar gratis", secondary: "Hablar con nosotros" },
  },
  fr: {
    nav: { home: "Accueil", plans: "Plans", about: "À propos", faq: "FAQ", contact: "Contact", dashboard: "Tableau de bord" },
    auth: { signIn: "Se connecter", signOut: "Se déconnecter", getStarted: "Commencer" },
    hero: { badge: "En direct · Approuvé par 12 400+ investisseurs", headline: "Transformez votre capital en", headlineAccent: "revenus crypto.", subtext: "Rejoignez la plateforme de copy trading mondiale. Plans BTC & USDT avec paiements vérifiés en 72 heures.", cta: "Commencer à gagner", ctaSecondary: "Voir les plans" },
    stats: { countries: "Pays", investors: "Investisseurs", assets: "Actifs gérés" },
    howItWorks: { title: "Comment ça marche", sub: "Sans fioritures. Voici exactement comment ça fonctionne." },
    plans: { title: "Choisissez votre plan", sub: "Trois niveaux de copy trading géré professionnellement. Tous les plans paient en 72 heures.", start: "Démarrer ce plan" },
    cta: { title: "Prêt à faire fructifier votre", titleAccent: "patrimoine?", sub: "Rejoignez 12 400+ investisseurs qui gagnent déjà sur YieldEmpireCapital.", button: "Commencer gratuitement", secondary: "Nous contacter" },
  },
  de: {
    nav: { home: "Startseite", plans: "Pläne", about: "Über uns", faq: "FAQ", contact: "Kontakt", dashboard: "Dashboard" },
    auth: { signIn: "Anmelden", signOut: "Abmelden", getStarted: "Loslegen" },
    hero: { badge: "Live · Vertraut von 12.400+ Investoren", headline: "Verwandeln Sie Ihr Kapital in", headlineAccent: "Krypto-Einnahmen.", subtext: "Treten Sie der weltweit führenden Copy-Trading-Plattform bei. Professionelle BTC- & USDT-Pläne mit verifizierten 72-Stunden-Auszahlungen.", cta: "Verdienen starten", ctaSecondary: "Pläne ansehen" },
    stats: { countries: "Länder", investors: "Investoren", assets: "Verwaltete Assets" },
    howItWorks: { title: "So funktioniert es", sub: "Kein Kleingedrucktes. Genau so funktioniert es." },
    plans: { title: "Plan wählen", sub: "Drei Stufen professionell verwaltetes Copy Trading. Alle Pläne zahlen innerhalb von 72 Stunden aus.", start: "Plan starten" },
    cta: { title: "Bereit, Ihr Vermögen zu", titleAccent: "vermehren?", sub: "Schließen Sie sich 12.400+ Investoren an, die bereits auf YieldEmpireCapital verdienen.", button: "Kostenlos starten", secondary: "Uns kontaktieren" },
  },
  pt: {
    nav: { home: "Início", plans: "Planos", about: "Sobre", faq: "FAQ", contact: "Contato", dashboard: "Painel" },
    auth: { signIn: "Entrar", signOut: "Sair", getStarted: "Começar" },
    hero: { badge: "Ao vivo · Confiado por 12.400+ investidores", headline: "Transforme seu capital em", headlineAccent: "renda cripto.", subtext: "Junte-se à principal plataforma de copy trading do mundo. Planos BTC e USDT com pagamentos verificados em 72 horas.", cta: "Começar a ganhar", ctaSecondary: "Ver planos" },
    stats: { countries: "Países", investors: "Investidores", assets: "Ativos geridos" },
    howItWorks: { title: "Como funciona", sub: "Sem complicações. É exatamente assim que funciona." },
    plans: { title: "Escolha seu plano", sub: "Três níveis de copy trading gerido profissionalmente. Todos os planos pagam em 72 horas.", start: "Iniciar este plano" },
    cta: { title: "Pronto para crescer seu", titleAccent: "patrimônio?", sub: "Junte-se a 12.400+ investidores ganhando no YieldEmpireCapital.", button: "Começar grátis", secondary: "Falar conosco" },
  },
  ar: {
    nav: { home: "الرئيسية", plans: "الخطط", about: "من نحن", faq: "الأسئلة الشائعة", contact: "تواصل معنا", dashboard: "لوحة التحكم" },
    auth: { signIn: "تسجيل الدخول", signOut: "تسجيل الخروج", getStarted: "ابدأ الآن" },
    hero: { badge: "مباشر · موثوق به من قبل أكثر من 12,400 مستثمر", headline: "حوّل رأس مالك إلى", headlineAccent: "دخل من العملات الرقمية.", subtext: "انضم إلى منصة نسخ التداول الرائدة عالمياً. خطط BTC و USDT المهنية مع مدفوعات مضمونة خلال 72 ساعة.", cta: "ابدأ الكسب", ctaSecondary: "عرض الخطط" },
    stats: { countries: "دولة", investors: "مستثمر", assets: "الأصول المدارة" },
    howItWorks: { title: "كيف يعمل", sub: "لا تعقيدات. إليك كيف يعمل بالضبط." },
    plans: { title: "اختر خطتك", sub: "ثلاثة مستويات من نسخ التداول المُدار باحتراف. جميع الخطط تدفع خلال 72 ساعة.", start: "ابدأ هذه الخطة" },
    cta: { title: "هل أنت مستعد لتنمية", titleAccent: "ثروتك؟", sub: "انضم إلى أكثر من 12,400 مستثمر يكسبون بالفعل على YieldEmpireCapital.", button: "ابدأ مجاناً", secondary: "تحدث إلينا" },
  },
  zh: {
    nav: { home: "首页", plans: "方案", about: "关于我们", faq: "常见问题", contact: "联系我们", dashboard: "控制台" },
    auth: { signIn: "登录", signOut: "退出登录", getStarted: "立即开始" },
    hero: { badge: "实时 · 受12,400+投资者信赖", headline: "将您的资金转化为", headlineAccent: "加密货币收益。", subtext: "加入全球领先的复制交易平台。专业的BTC和USDT计划，72小时内验证付款。", cta: "开始赚取", ctaSecondary: "查看方案" },
    stats: { countries: "个国家", investors: "位投资者", assets: "管理资产" },
    howItWorks: { title: "运作方式", sub: "简单透明，以下是具体运作方式。" },
    plans: { title: "选择您的方案", sub: "三个层级的专业管理复制交易。所有方案均在72小时内付款。", start: "开始此方案" },
    cta: { title: "准备好增加您的", titleAccent: "财富了吗？", sub: "加入12,400+名已在YieldEmpireCapital获益的投资者。", button: "免费开始", secondary: "联系我们" },
  },
  ja: {
    nav: { home: "ホーム", plans: "プラン", about: "会社情報", faq: "FAQ", contact: "お問い合わせ", dashboard: "ダッシュボード" },
    auth: { signIn: "サインイン", signOut: "サインアウト", getStarted: "始める" },
    hero: { badge: "ライブ · 12,400人以上の投資家に信頼されています", headline: "あなたの資金を", headlineAccent: "暗号資産収益に変えましょう。", subtext: "世界最大のコピートレードプラットフォームに参加。72時間以内の確認済み支払いでBTC・USDTプランを提供。", cta: "稼ぎ始める", ctaSecondary: "プランを見る" },
    stats: { countries: "カ国", investors: "人の投資家", assets: "運用資産" },
    howItWorks: { title: "仕組み", sub: "難しいことはありません。仕組みをご説明します。" },
    plans: { title: "プランを選択", sub: "プロが管理する3段階のコピートレード。全プランが72時間以内に支払われます。", start: "このプランを始める" },
    cta: { title: "資産を増やす準備は", titleAccent: "できていますか？", sub: "すでにYieldEmpireCapitalで稼いでいる12,400人以上の投資家に加わりましょう。", button: "無料で始める", secondary: "お問い合わせ" },
  },
};
