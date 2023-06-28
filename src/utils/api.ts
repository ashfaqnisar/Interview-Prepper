import fs from "fs";
import { Client } from "@elastic/enterprise-search";

export const elasticClient = new Client({
  url: process.env.ELASTIC_APP_SEARCH_ENDPOINT as string,
  auth: {
    token: process.env.ELASTIC_PRIVATE_KEY as string,
  },
});

export const readFileAtPath = (fullPath: string): string => {
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  return fs.readFileSync(fullPath, "utf8");
};

export const splitToChunks = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  let i = 0;
  const n = array.length;

  while (i < n) {
    chunks.push(array.slice(i, (i += chunkSize)));
  }

  return chunks;
};

export const idGenerator = ((): {
  sortableId: () => string;
} => {
  let counter = 0;

  function sortableId(): string {
    const timestamp = new Date().getTime();
    const sequentialNumber = counter.toString().padStart(6, "0");
    const sortableId = `${timestamp}_${sequentialNumber}`;
    counter++;
    return sortableId;
  }

  return {
    sortableId,
  };
})();
