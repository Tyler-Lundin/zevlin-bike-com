#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const oldWebsiteRoot = path.join(repoRoot, "apps", "old_website");
const landingRoot = path.join(repoRoot, "apps", "landing");

const jsonOutputPath = path.join(landingRoot, "lib", "legacy-inventory.json");
const markdownOutputPath = path.join(
  repoRoot,
  "docs",
  "operations",
  "legacy-website-inventory.md",
);

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readFileOrThrow(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function walkFiles(dirPath, files = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".turbo") {
        continue;
      }
      walkFiles(fullPath, files);
      continue;
    }
    files.push(fullPath);
  }
  return files;
}

function toRoute(baseDir, filePath) {
  const rel = normalizePath(path.relative(baseDir, filePath));
  if (rel === "page.tsx" || rel === "route.ts") {
    return "/";
  }
  return (
    "/" +
    rel
      .replace(/\/page\.tsx$/, "")
      .replace(/\/route\.ts$/, "")
      .replace(/\/layout\.tsx$/, "")
  );
}

function uniqueBy(arr, keyFn) {
  const out = [];
  const seen = new Set();
  for (const item of arr) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function classifyPageRoute(route) {
  if (route.startsWith("/admin")) return "admin";
  if (route.startsWith("/auth")) return "auth";
  if (
    route === "/cart" ||
    route === "/checkout" ||
    route === "/orders" ||
    route.startsWith("/order/")
  ) {
    return "commerce";
  }
  return "marketing";
}

function parseMetadata(layoutSource) {
  const titleMatch = layoutSource.match(/title:\s*"([^"]+)"/);
  const descriptionMatch = layoutSource.match(/description:\s*"([^"]+)"/);
  return {
    title: titleMatch?.[1] ?? null,
    description: descriptionMatch?.[1] ?? null,
  };
}

function parseProducts(seedSql) {
  const products = [];
  const regex =
    /\('([^']+)',\s*'((?:''|[^'])*)',\s*'((?:''|[^'])*)',\s*(\d+),\s*'((?:''|[^'])*)'\)/g;

  for (const match of seedSql.matchAll(regex)) {
    products.push({
      id: match[1],
      name: match[2].replace(/''/g, "'"),
      description: match[3].replace(/''/g, "'"),
      priceCents: Number.parseInt(match[4], 10),
      slug: match[5].replace(/''/g, "'"),
    });
  }

  return products;
}

function parseTestimonials(reviewsSource) {
  const testimonials = [];
  const regex =
    /\{\s*name:\s*"([^"]+)",[\s\S]*?title:\s*"([^"]+)",[\s\S]*?initials:\s*"([^"]+)",[\s\S]*?quote:\s*"([^"]+)",[\s\S]*?rating:\s*(\d+),[\s\S]*?bgColor:\s*"([^"]+)"[\s\S]*?\}/g;

  for (const match of reviewsSource.matchAll(regex)) {
    testimonials.push({
      name: match[1],
      title: match[2],
      initials: match[3],
      quote: match[4],
      rating: Number.parseInt(match[5], 10),
      bgColor: match[6],
    });
  }

  return testimonials;
}

function parseDesktopNavLinks(navSource) {
  const links = [];
  const regex = /<Link href="([^"]+)"[^>]*>\s*([^<\n]+)\s*<\/Link>/g;
  for (const match of navSource.matchAll(regex)) {
    links.push({ href: match[1], label: match[2].trim() });
  }
  return links;
}

function parseFooterColumns(footerSource) {
  const arrayStart = footerSource.indexOf("const columns = [");
  if (arrayStart < 0) return [];

  const bracketStart = footerSource.indexOf("[", arrayStart);
  if (bracketStart < 0) return [];

  let depth = 0;
  let bracketEnd = -1;
  for (let i = bracketStart; i < footerSource.length; i += 1) {
    const ch = footerSource[i];
    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        bracketEnd = i;
        break;
      }
    }
  }

  if (bracketEnd < 0) return [];

  const columnsBlock = footerSource.slice(bracketStart, bracketEnd + 1);
  try {
    const parsed = Function(`"use strict"; return (${columnsBlock});`)();
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((column) => ({
      title: column.title,
      links: Array.isArray(column.links)
        ? column.links.map((link) => ({ label: link.name, href: link.href }))
        : [],
    }));
  } catch {
    return [];
  }
}

function parseFormFields(sourceText) {
  return uniqueBy(
    [...sourceText.matchAll(/name="([^"]+)"/g)].map((match) => match[1]),
    (value) => value,
  );
}

function relativeFromRepo(filePath) {
  return normalizePath(path.relative(repoRoot, filePath));
}

function findReferencedImagePaths(filePath) {
  const source = readFileOrThrow(filePath);
  const results = [];
  const regex = /["'`]\/images\/([^"'`]+)["'`]/g;
  for (const match of source.matchAll(regex)) {
    results.push(`/images/${match[1]}`);
  }
  return uniqueBy(results, (value) => value);
}

const oldAppDir = path.join(oldWebsiteRoot, "app");
const oldPublicDir = path.join(oldWebsiteRoot, "public");
const landingAppDir = path.join(landingRoot, "app");
const landingPublicDir = path.join(landingRoot, "public");

const oldWebsiteFiles = walkFiles(oldWebsiteRoot);
const oldPageFiles = oldWebsiteFiles.filter((file) => normalizePath(file).endsWith("/page.tsx"));
const oldApiRouteFiles = oldWebsiteFiles.filter((file) =>
  normalizePath(file).endsWith("/route.ts"),
);

const oldPages = oldPageFiles
  .map((file) => {
    const route = toRoute(oldAppDir, file);
    return {
      route,
      category: classifyPageRoute(route),
      file: relativeFromRepo(file),
    };
  })
  .sort((a, b) => a.route.localeCompare(b.route));

const oldApiRoutes = oldApiRouteFiles
  .filter((file) => normalizePath(file).includes("/app/api/"))
  .map((file) => ({
    route: toRoute(oldAppDir, file),
    file: relativeFromRepo(file),
  }))
  .sort((a, b) => a.route.localeCompare(b.route));

const oldMarketingRoutes = oldPages
  .filter((page) => page.category === "marketing")
  .map((page) => page.route);

const landingFiles = walkFiles(landingRoot);
const landingPageFiles = landingFiles.filter((file) => normalizePath(file).endsWith("/page.tsx"));
const landingRouteFiles = landingFiles.filter((file) => normalizePath(file).endsWith("/route.ts"));

const landingRoutes = [
  ...landingPageFiles.map((file) => toRoute(landingAppDir, file)),
  ...landingRouteFiles.map((file) => toRoute(landingAppDir, file)),
].sort((a, b) => a.localeCompare(b));

const layoutSource = readFileOrThrow(path.join(oldAppDir, "layout.tsx"));
const metadata = parseMetadata(layoutSource);

const seedSource = readFileOrThrow(path.join(oldWebsiteRoot, "db", "seed.sql"));
const products = parseProducts(seedSource);

const testimonialsSource = readFileOrThrow(path.join(oldWebsiteRoot, "store", "reviews.ts"));
const testimonials = parseTestimonials(testimonialsSource);

const desktopNavSource = readFileOrThrow(
  path.join(oldWebsiteRoot, "components", "Navigation", "DesktopNav.tsx"),
);
const footerSource = readFileOrThrow(path.join(oldWebsiteRoot, "app", "components", "Footer.tsx"));
const navLinks = parseDesktopNavLinks(desktopNavSource);
const footerColumns = parseFooterColumns(footerSource);

const oldPublicFiles = walkFiles(oldPublicDir).map((file) => ({
  path: "/" + normalizePath(path.relative(oldPublicDir, file)),
  sourceFile: relativeFromRepo(file),
}));
const landingPublicFiles = walkFiles(landingPublicDir).map((file) =>
  "/" + normalizePath(path.relative(landingPublicDir, file)),
);

const missingLandingAssets = oldPublicFiles
  .map((file) => file.path)
  .filter((assetPath) => !landingPublicFiles.includes(assetPath))
  .sort((a, b) => a.localeCompare(b));

const imageRefSourceFiles = [
  path.join(oldWebsiteRoot, "app", "about", "page.tsx"),
  path.join(oldWebsiteRoot, "app", "mission", "page.tsx"),
  path.join(oldWebsiteRoot, "app", "components", "CTA.tsx"),
  path.join(oldWebsiteRoot, "app", "components", "hero", "HeroBackground.tsx"),
];

const referencedImages = uniqueBy(
  imageRefSourceFiles.flatMap((file) => findReferencedImagePaths(file)),
  (value) => value,
);

const missingSourceImageFiles = referencedImages.filter((imgPath) => {
  const candidate = path.join(oldPublicDir, imgPath.replace(/^\//, ""));
  return !fs.existsSync(candidate);
});

const formCatalog = [
  {
    formId: "newsletter-signup",
    routeContext: "/ (home sections)",
    sourceFile: "apps/old_website/app/components/Newsletter.tsx",
    fields: parseFormFields(
      readFileOrThrow(path.join(oldWebsiteRoot, "app", "components", "Newsletter.tsx")),
    ),
    submissionPath: "server action signUp -> table newsletter_signups",
  },
  {
    formId: "contact-form",
    routeContext: "/contact",
    sourceFile: "apps/old_website/app/contact/page.tsx",
    fields: parseFormFields(readFileOrThrow(path.join(oldWebsiteRoot, "app", "contact", "page.tsx"))),
    submissionPath: "client-only alert flow (no backend persistence)",
  },
  {
    formId: "returns-form",
    routeContext: "/returns",
    sourceFile: "apps/old_website/app/returns/page.tsx",
    fields: parseFormFields(readFileOrThrow(path.join(oldWebsiteRoot, "app", "returns", "page.tsx"))),
    submissionPath: "client-only alert flow (no backend persistence)",
  },
];

const integrationCandidates = [
  { name: "Supabase", regex: /\bsupabase\b/i },
  { name: "Shippo", regex: /\bshippo\b/i },
  { name: "Newsletter Signups", regex: /newsletter_signups/i },
  { name: "Brevo Email", regex: /\bbrevo\b|sendTransactionalEmail/i },
];

const sourceFilesForSignal = oldWebsiteFiles.filter((file) =>
  /\.(ts|tsx|sql|md)$/i.test(file),
);

const integrations = integrationCandidates
  .map((candidate) => {
    const files = sourceFilesForSignal
      .filter((file) => candidate.regex.test(readFileOrThrow(file)))
      .map((file) => relativeFromRepo(file));
    return { name: candidate.name, files };
  })
  .filter((candidate) => candidate.files.length > 0)
  .map((candidate) => ({
    ...candidate,
    fileCount: candidate.files.length,
    files: candidate.files.slice(0, 20),
  }));

const inventory = {
  generatedAt: new Date().toISOString(),
  sourceRoot: "apps/old_website",
  routeInventory: {
    pages: oldPages,
    apiRoutes: oldApiRoutes,
    counts: {
      totalPages: oldPages.length,
      marketingPages: oldPages.filter((page) => page.category === "marketing").length,
      commercePages: oldPages.filter((page) => page.category === "commerce").length,
      authPages: oldPages.filter((page) => page.category === "auth").length,
      adminPages: oldPages.filter((page) => page.category === "admin").length,
      apiRoutes: oldApiRoutes.length,
    },
  },
  metadata,
  navigation: {
    desktop: navLinks,
    footerColumns,
  },
  data: {
    products,
    testimonials,
    forms: formCatalog,
  },
  assets: {
    oldWebsitePublicFiles: oldPublicFiles,
    landingPublicFiles,
    missingInLanding: missingLandingAssets,
    referencedImages,
    missingSourceImageFiles,
  },
  integrations,
  parity: {
    landingRoutes,
    marketingRoutesFromOldWebsite: oldMarketingRoutes,
    marketingRoutesCollapsedIntoLandingHome: oldMarketingRoutes,
    marketingRoutesNotRepresentedInLanding: oldMarketingRoutes.filter(
      (route) =>
        !(
          route === "/" ||
          [
            "/about",
            "/blog",
            "/contact",
            "/events",
            "/faq",
            "/mission",
            "/privacy",
            "/products",
            "/returns",
            "/shipping",
          ].includes(route)
        ),
    ),
  },
};

const marketingRouteRows = oldPages
  .filter((page) => page.category === "marketing")
  .map((page) => `| \`${page.route}\` | ${page.file} |`)
  .join("\n");

const assetRows = missingLandingAssets
  .map((assetPath) => `- \`${assetPath}\``)
  .join("\n");

const integrationRows = integrations
  .map((integration) => `- ${integration.name}: ${integration.fileCount} source files`)
  .join("\n");

const markdown = `# Legacy Website Inventory (Marketing Migration)

Generated: ${inventory.generatedAt}
Source: \`apps/old_website\`

## Route inventory

- Total pages: ${inventory.routeInventory.counts.totalPages}
- Marketing pages: ${inventory.routeInventory.counts.marketingPages}
- Commerce pages: ${inventory.routeInventory.counts.commercePages}
- Auth pages: ${inventory.routeInventory.counts.authPages}
- Admin pages: ${inventory.routeInventory.counts.adminPages}
- API routes: ${inventory.routeInventory.counts.apiRoutes}

### Marketing route map

| Route | Source file |
| --- | --- |
${marketingRouteRows}

## SEO metadata (legacy root layout)

- Title: ${metadata.title ?? "(missing)"}
- Description: ${metadata.description ?? "(missing)"}

## Extracted data sets

- Products seeded: ${products.length}
- Testimonials in source store: ${testimonials.length}
- Forms cataloged: ${formCatalog.length}

## Form + submission inventory

${formCatalog
  .map(
    (form) =>
      `- ${form.formId} (${form.routeContext}) -> fields: ${form.fields.join(", ")} -> ${form.submissionPath}`,
  )
  .join("\n")}

## Integration signals

${integrationRows || "- None detected"}

## Asset parity against landing

- Old website public files: ${oldPublicFiles.length}
- Landing public files: ${landingPublicFiles.length}
- Missing from landing public: ${missingLandingAssets.length}

${assetRows || "- None"}

## Known source integrity issues

${missingSourceImageFiles.length > 0 ? missingSourceImageFiles.map((p) => `- Missing in old source: \`${p}\``).join("\n") : "- None"}

## Landing parity summary

- Landing route files currently expose: ${landingRoutes.map((route) => `\`${route}\``).join(", ")}
- Marketing routes collapsed into landing home sections: ${oldMarketingRoutes
  .map((route) => `\`${route}\``)
  .join(", ")}

For machine-readable inventory, see \`${relativeFromRepo(jsonOutputPath)}\`.
`;

ensureDir(jsonOutputPath);
ensureDir(markdownOutputPath);
fs.writeFileSync(jsonOutputPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
fs.writeFileSync(markdownOutputPath, markdown, "utf8");

console.log(`[extract-old-website-inventory] wrote ${relativeFromRepo(jsonOutputPath)}`);
console.log(`[extract-old-website-inventory] wrote ${relativeFromRepo(markdownOutputPath)}`);
