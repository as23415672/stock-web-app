export class Profile {
  ticker: string = '';
  name: string = '';
  exchange: string = '';
  logo: string = '';
  ipo: string = '';
  finnhubIndustry: string = '';
  weburl: string = '';
}

export class Quote {
  c: number = 0;
  d: number = 0;
  dp: number = 0;
  t: number = 0;
  h: number = 0;
  l: number = 0;
  o: number = 0;
  pc: number = 0;
}

export class News {
  source: string = '';
  datetime: number = 0;
  headline: string = '';
  url: string = '';
  summary: string = '';
  image: string = '';
}

export class Insider {
  mspr: {
    total: number;
    positive: number;
    negative: number;
  } = { total: 0, positive: 0, negative: 0 };

  change: {
    total: number;
    positive: number;
    negative: number;
  } = { total: 0, positive: 0, negative: 0 };

  constructor() {}
}

export interface Option {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export function division(a: number, b: number) {
  return a / b;
}

export function round(a: number, precision: number) {
  return Math.round(a * Math.pow(10, precision)) / Math.pow(10, precision);
}
