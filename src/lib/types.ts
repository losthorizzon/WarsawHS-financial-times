export interface Reference {
  label: string;
  url: string;
}

export interface Correction {
  date: string;
  text: string;
}

export interface Article {
  title: string;
  category: string;
  date: string;
  summary: string;
  body: string[];
  author?: string;
  pullQuote?: string;
  /** A path under /public (e.g. /images/articles/x.jpg) or a data: URI from Editor Tools. */
  image?: string;
  imageAlt?: string;
  references?: Reference[];
  corrections?: Correction[];
  status?: "draft";
  trending?: boolean;
}

export interface Instrument {
  symbol: string;
  tickerLabel: string;
  name: string;
  group: string;
  price: number;
  change1Y: number;
  spark: number[];
}

export interface MarketData {
  period: string;
  from: string;
  asOf: string;
  instruments: Instrument[];
}

export interface GlossaryEntry {
  term: string;
  category: string;
  definition: string;
}
