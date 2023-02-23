export interface Feed {
  author: string;
  title: string;
  url: string;
}

export interface Entry {
  title: string;
  summaryType: string;
  summary: string;
  url: string;
  updated: string;
}

export function isFeed(arg: any): arg is Feed {
  return arg !== null &&
    typeof arg === "object" &&
    typeof arg.author === "string" &&
    typeof arg.title === "string" &&
    typeof arg.url === "string";
}

export function isEntry(arg: any): arg is Entry {
  return arg !== null &&
    typeof arg === "object" &&
    typeof arg.title === "string" &&
    typeof arg.summaryType === "string" &&
    typeof arg.summary === "string" &&
    typeof arg.url === "string" &&
    typeof arg.updated === "string";
}
