import type { GlossaryEntry } from "./types";

// Site-wide constants, carried over unchanged from the original
// single-file site.

export const SITE_TITLE = "The Warsaw High Financial Times";
export const SITE_TAGLINE = "Breaking down big economic ideas, one article at a time.";
export const FORM_RECIPIENT = "warsawhighfintimes@gmail.com";
export const INSTAGRAM_URL = "https://instagram.com/tbsmarketminds";
export const DEFAULT_AUTHOR = "The Editorial Team";

export const CATEGORIES = [
  "Markets",
  "Personal Finance & Investment",
  "Macroeconomics",
  "Polish Economy",
  "Global Trade & Geopolitics",
  "Behavioral Economics"
];

// Mirrors the "Our team" list on the About page, keyed by byline. Used
// to show a role (and short bio) under an author's name on their author
// page; a byline that isn't a listed team member (a guest contributor)
// just shows neither, rather than a wrong guess.
export const TEAM_ROLES: Record<string, { role: string; bio: string }> = {
  "Vladimir Bessonov": { role: "Founder, Site Developer & Contributing Writer", bio: "Builds and maintains the site, and writes some of its articles." },
  "Hee-Chan Rho": { role: "Founder & Managing Editor", bio: "Handles day-to-day editorial decisions." },
  "Keiden Yamamoto": { role: "Founder & Managing Editor", bio: "Handles day-to-day editorial decisions." }
};

// One-line description shown under the section title when a reader
// filters the homepage down to a single category.
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Markets": "Analysis of equities, bonds, commodities, and the forces driving their movement.",
  "Personal Finance & Investment": "Principles of budgeting, saving, and investing for practical application.",
  "Macroeconomics": "Examination of inflation, interest rates, and the broader mechanics of economic systems.",
  "Polish Economy": "Coverage and analysis of Poland's markets, policy, and business sector.",
  "Global Trade & Geopolitics": "Analysis of how politics, policy, and trade relations shape the global economy.",
  "Behavioral Economics": "Examination of the psychological factors underlying financial decision-making."
};

export const SNAPSHOT_SYMBOLS = ["SPY", "QQQ", "EPOL", "GLD", "BTC"];
export const AVATAR_COLORS = ["#1e2a5e", "#14161c", "#3a4a7a"];

// ---------- Glossary ----------
// A standing reference, independent of any one article — this is the
// dictionary a term-link on an article page opens into. Definitions are
// written for a first-time reader, not a finance textbook: plain
// English first, precision second.
export const GLOSSARY: GlossaryEntry[] = [
  // Markets
  { term: "Stock", category: "Markets", definition: "A unit of ownership in a company. Owning a stock (or “share”) makes you a small part-owner of that business." },
  { term: "Share", category: "Markets", definition: "Another word for a stock — one unit of ownership in a company." },
  { term: "Bond", category: "Markets", definition: "A loan you make to a government or company. In exchange, the borrower promises to pay you interest and return your money at a set date." },
  { term: "Index", category: "Markets", definition: "A basket of stocks (like the S&P 500) used to track how a market or sector is doing overall, instead of following one company." },
  { term: "Index fund", category: "Markets", definition: "A fund that buys every stock in an index, so its value moves with the whole market instead of betting on individual companies." },
  { term: "ETF", category: "Markets", definition: "Exchange-Traded Fund — a fund that holds a basket of investments (stocks, bonds, or commodities) but trades on an exchange throughout the day like a single stock." },
  { term: "Bull market", category: "Markets", definition: "A period when prices are broadly rising and investors are optimistic." },
  { term: "Bear market", category: "Markets", definition: "A period when prices have fallen sharply — usually 20% or more from a recent high — and investors are pessimistic." },
  { term: "Market correction", category: "Markets", definition: "A drop of roughly 10% or more in prices from a recent high; usually shorter and less severe than a bear market." },
  { term: "Volatility", category: "Markets", definition: "How much and how quickly a price moves up and down. High volatility means bigger, faster swings in either direction." },
  { term: "Market capitalization", category: "Markets", definition: "A company's total value on the stock market, calculated as its share price multiplied by the number of shares outstanding. Often shortened to “market cap.”" },
  { term: "Dividend", category: "Markets", definition: "A portion of a company's profit paid out directly to shareholders, usually on a quarterly schedule." },
  { term: "Yield", category: "Markets", definition: "The income an investment pays out, shown as a percentage of what you paid for it." },
  { term: "P/E ratio", category: "Markets", definition: "Price-to-earnings ratio — a company's share price divided by its profit per share. A quick way to gauge whether a stock looks expensive or cheap relative to its earnings." },
  { term: "IPO", category: "Markets", definition: "Initial Public Offering — the first time a company sells shares to the public, moving from privately owned to publicly traded." },
  { term: "Blue chip stock", category: "Markets", definition: "Shares in a large, well-established, financially stable company with a long track record." },
  { term: "Liquidity", category: "Markets", definition: "How quickly and easily something can be bought or sold without significantly changing its price. Cash is the most liquid asset; a house is much less liquid." },
  { term: "Short selling", category: "Markets", definition: "Betting that a stock's price will fall, by borrowing shares and selling them now with the plan to buy them back later at a lower price." },
  { term: "Stock split", category: "Markets", definition: "A company dividing each existing share into multiple new shares, lowering the price per share without changing the company's total value." },
  { term: "Buyback", category: "Markets", definition: "A company repurchasing its own shares from investors, which reduces the total number of shares in circulation." },
  { term: "Basis point", category: "Markets", definition: "One hundredth of one percent (0.01%) — the standard unit for describing small changes in interest rates. A move from 3.75% to 4.00% is 25 basis points." },
  { term: "Secondary market", category: "Markets", definition: "Where investors trade securities among themselves, like a stock exchange — as opposed to the primary market, where new securities are issued directly by the company or government." },
  { term: "Market order", category: "Markets", definition: "An order to buy or sell a stock immediately, at the best price currently available." },
  { term: "Limit order", category: "Markets", definition: "An order to buy or sell a stock only at a specific price or better, even if that means the trade doesn't happen right away." },
  // Personal Finance & Investment
  { term: "Compound interest", category: "Personal Finance & Investment", definition: "Interest earned on both your original money and on the interest it has already earned, so growth accelerates the longer it's left alone." },
  { term: "Diversification", category: "Personal Finance & Investment", definition: "Spreading your money across different investments so that one bad outcome doesn't wipe out your whole portfolio." },
  { term: "Portfolio", category: "Personal Finance & Investment", definition: "The full collection of investments — stocks, bonds, and other assets — that a person or fund holds." },
  { term: "Asset allocation", category: "Personal Finance & Investment", definition: "How an investor divides their money between different types of investments, such as stocks, bonds, and cash." },
  { term: "Risk tolerance", category: "Personal Finance & Investment", definition: "How much loss or uncertainty an investor is comfortable accepting in exchange for the chance of higher returns." },
  { term: "Emergency fund", category: "Personal Finance & Investment", definition: "Money set aside specifically to cover unexpected expenses, kept separate from everyday spending or long-term investments." },
  { term: "Credit score", category: "Personal Finance & Investment", definition: "A number that summarizes how reliably someone repays borrowed money, used by lenders to decide whether — and on what terms — to approve a loan." },
  { term: "APR", category: "Personal Finance & Investment", definition: "Annual Percentage Rate — the yearly cost of borrowing money, including interest and fees, expressed as a single percentage." },
  { term: "Principal", category: "Personal Finance & Investment", definition: "The original amount of money borrowed or invested, before any interest is added." },
  { term: "Mortgage", category: "Personal Finance & Investment", definition: "A loan used to buy property, where the property itself acts as collateral for the lender." },
  { term: "Amortization", category: "Personal Finance & Investment", definition: "Paying off a loan gradually through regular payments that cover both interest and principal, until the balance reaches zero." },
  { term: "Net worth", category: "Personal Finance & Investment", definition: "The total value of everything you own, minus everything you owe." },
  { term: "Mutual fund", category: "Personal Finance & Investment", definition: "A professionally managed fund that pools money from many investors to buy a mix of stocks, bonds, or other assets." },
  { term: "Capital gain", category: "Personal Finance & Investment", definition: "The profit made from selling an asset, like a stock or property, for more than you originally paid for it." },
  { term: "Collateral", category: "Personal Finance & Investment", definition: "An asset a borrower pledges to a lender as security for a loan, which the lender can seize if the loan isn't repaid." },
  { term: "Refinancing", category: "Personal Finance & Investment", definition: "Replacing an existing loan with a new one, usually to secure a better interest rate or different repayment terms." },
  { term: "Hedge fund", category: "Personal Finance & Investment", definition: "A lightly regulated investment fund, usually for wealthy or institutional investors, that uses more aggressive strategies to try to profit whether markets rise or fall." },
  { term: "Venture capital", category: "Personal Finance & Investment", definition: "Money invested in early-stage startups in exchange for equity, betting that some of them will grow into large, valuable companies." },
  // Macroeconomics
  { term: "GDP", category: "Macroeconomics", definition: "Gross Domestic Product — the total value of all goods and services a country produces in a given period. The main measure of the size of an economy." },
  { term: "GDP growth rate", category: "Macroeconomics", definition: "How much a country's GDP has increased or decreased compared to a previous period, usually shown as an annual percentage." },
  { term: "Inflation", category: "Macroeconomics", definition: "A general rise in prices over time, which reduces how much a given amount of money can buy." },
  { term: "Deflation", category: "Macroeconomics", definition: "A general fall in prices over time. It sounds good for shoppers, but it can also discourage spending and slow the whole economy down." },
  { term: "Stagflation", category: "Macroeconomics", definition: "The unusual and painful combination of high inflation and a stagnant — slow-growing or shrinking — economy at the same time." },
  { term: "CPI", category: "Macroeconomics", definition: "Consumer Price Index — a measure of the average change in prices for a basket of everyday goods and services, the most common way inflation is tracked." },
  { term: "Interest rate", category: "Macroeconomics", definition: "The cost of borrowing money — or the reward for saving it — expressed as a percentage." },
  { term: "Central bank", category: "Macroeconomics", definition: "A country's main monetary authority, such as the U.S. Federal Reserve, the European Central Bank, or Poland's NBP, responsible for setting interest rates and managing the money supply." },
  { term: "Monetary policy", category: "Macroeconomics", definition: "Actions a central bank takes — mainly through interest rates — to manage inflation and economic growth." },
  { term: "Fiscal policy", category: "Macroeconomics", definition: "Decisions a government makes about spending and taxation to influence the economy." },
  { term: "Recession", category: "Macroeconomics", definition: "A significant decline in economic activity lasting more than a few months, often defined as two straight quarters of shrinking GDP." },
  { term: "Unemployment rate", category: "Macroeconomics", definition: "The percentage of people who want a job and are actively looking for one, but don't currently have one." },
  { term: "Business cycle", category: "Macroeconomics", definition: "The natural rise and fall of economic activity over time, moving through expansion, peak, recession, and recovery." },
  { term: "Quantitative easing", category: "Macroeconomics", definition: "A central bank pumping money into the economy by buying large amounts of financial assets — used to push down long-term interest rates when normal tools aren't enough." },
  { term: "National debt", category: "Macroeconomics", definition: "The total amount of money a government owes to lenders, built up over years of spending more than it collects in taxes." },
  { term: "Budget deficit", category: "Macroeconomics", definition: "When a government spends more money in a year than it collects in revenue." },
  { term: "Yield curve", category: "Macroeconomics", definition: "A line plotting interest rates on government bonds of different lengths. When it inverts — short-term rates higher than long-term — it's historically been a warning sign of recession." },
  { term: "Purchasing power", category: "Macroeconomics", definition: "How much a given amount of money can actually buy. It falls as prices — inflation — rise." },
  { term: "Supply and demand", category: "Macroeconomics", definition: "The basic economic relationship where prices rise when demand outpaces supply, and fall when supply outpaces demand." },
  { term: "Opportunity cost", category: "Macroeconomics", definition: "The value of the next-best option you give up when you choose one option over another." },
  { term: "Leading indicator", category: "Macroeconomics", definition: "An economic measure that tends to change before the economy as a whole shifts direction, used to try to predict what's coming." },
  { term: "Lagging indicator", category: "Macroeconomics", definition: "An economic measure that changes only after the economy has already shifted, confirming a trend rather than predicting it." },
  { term: "Austerity", category: "Macroeconomics", definition: "Government policies that cut spending and/or raise taxes to reduce a budget deficit, often introduced during economic difficulty." },
  { term: "Currency devaluation", category: "Macroeconomics", definition: "A deliberate lowering of a currency's value, usually carried out by a government to make exports cheaper and more competitive abroad." },
  // Polish Economy
  { term: "NBP", category: "Polish Economy", definition: "Narodowy Bank Polski — Poland's central bank, responsible for setting Polish interest rates and issuing the zloty." },
  { term: "Zloty", category: "Polish Economy", definition: "Poland's national currency, abbreviated PLN." },
  { term: "WIG20", category: "Polish Economy", definition: "The main stock index of the Warsaw Stock Exchange, tracking the 20 largest and most liquid Polish companies." },
  { term: "Reference rate", category: "Polish Economy", definition: "The main interest rate set by the NBP's Monetary Policy Council, which influences borrowing costs across the whole Polish economy." },
  { term: "Eurozone", category: "Polish Economy", definition: "The group of European Union countries that use the euro as their currency. Poland is an EU member but still uses the zloty." },
  { term: "EU structural funds", category: "Polish Economy", definition: "Money the European Union provides to member states like Poland to support infrastructure, development, and reducing regional inequality." },
  { term: "Exchange rate", category: "Polish Economy", definition: "The value of one currency in terms of another — for example, how many zloty it takes to buy one euro." },
  { term: "Trade balance", category: "Polish Economy", definition: "The difference between the value of a country's exports and its imports." },
  // Global Trade & Geopolitics
  { term: "Tariff", category: "Global Trade & Geopolitics", definition: "A tax a government places on imported goods, usually to make them more expensive than domestically produced alternatives." },
  { term: "Trade deficit", category: "Global Trade & Geopolitics", definition: "When a country imports more goods and services, by value, than it exports." },
  { term: "Trade surplus", category: "Global Trade & Geopolitics", definition: "When a country exports more goods and services, by value, than it imports." },
  { term: "Free trade agreement", category: "Global Trade & Geopolitics", definition: "A deal between countries to reduce or remove tariffs and other trade barriers between them." },
  { term: "Protectionism", category: "Global Trade & Geopolitics", definition: "Government policies — like tariffs or import quotas — designed to shield domestic industries from foreign competition." },
  { term: "Globalization", category: "Global Trade & Geopolitics", definition: "The growing interconnection of economies, cultures, and populations worldwide, driven by trade, investment, and technology." },
  { term: "Supply chain", category: "Global Trade & Geopolitics", definition: "The full sequence of steps, companies, and countries involved in getting a product from raw materials to the final customer." },
  { term: "Sanctions", category: "Global Trade & Geopolitics", definition: "Economic penalties — such as trade or financial restrictions — imposed by one country or group of countries on another, usually for political reasons." },
  { term: "Embargo", category: "Global Trade & Geopolitics", definition: "A government order restricting or banning trade with a particular country, usually broader in scope than a targeted sanction." },
  { term: "Currency peg", category: "Global Trade & Geopolitics", definition: "When a country fixes its currency's value to another currency — often the U.S. dollar — instead of letting it float freely against the market." },
  { term: "Sovereign debt", category: "Global Trade & Geopolitics", definition: "Money borrowed by a national government, typically raised by selling bonds to investors." },
  { term: "WTO", category: "Global Trade & Geopolitics", definition: "World Trade Organization — the international body that sets rules for trade between countries and helps resolve trade disputes." },
  { term: "Foreign direct investment", category: "Global Trade & Geopolitics", definition: "When a company or investor from one country builds or buys lasting business operations in another country, rather than just buying its stocks or bonds." },
  // Behavioral Economics
  { term: "Sunk cost fallacy", category: "Behavioral Economics", definition: "The tendency to keep investing in something because of what you've already put in, even when it no longer makes sense to continue." },
  { term: "Loss aversion", category: "Behavioral Economics", definition: "The tendency to feel the pain of a loss more strongly than the pleasure of an equivalent gain, which can lead to overly cautious decisions." },
  { term: "Herd behavior", category: "Behavioral Economics", definition: "The tendency for people to follow what everyone else is doing — buying when others buy, selling when others sell — rather than their own independent analysis." },
  { term: "Moral hazard", category: "Behavioral Economics", definition: "When someone takes on more risk because they know they won't have to bear the full consequences if things go wrong." },
  { term: "Confirmation bias", category: "Behavioral Economics", definition: "The tendency to seek out and favor information that confirms what you already believe, while ignoring evidence that contradicts it." },
  { term: "Anchoring", category: "Behavioral Economics", definition: "Relying too heavily on the first piece of information encountered — an “anchor” — when making a decision, even if that information is irrelevant." },
  { term: "Overconfidence bias", category: "Behavioral Economics", definition: "The tendency to overestimate your own knowledge, skill, or ability to predict outcomes — common among individual investors." },
  { term: "Present bias", category: "Behavioral Economics", definition: "The tendency to prefer a smaller reward now over a larger reward later, even when waiting is the better long-term choice." },
  { term: "Framing effect", category: "Behavioral Economics", definition: "The tendency for people to react differently to the same information depending on how it's presented, or “framed.”" },
  { term: "Endowment effect", category: "Behavioral Economics", definition: "The tendency to value something more highly simply because you already own it." },
  // Modern finance
  { term: "Cryptocurrency", category: "Markets", definition: "A digital currency secured by cryptography and usually run on a decentralized network — a blockchain — rather than issued by a central bank." },
  { term: "Blockchain", category: "Markets", definition: "A shared, tamper-resistant digital ledger that records transactions across many computers at once. The technology underlying most cryptocurrencies." }
];
