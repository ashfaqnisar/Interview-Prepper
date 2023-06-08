import fs from "fs";

export const readMarkdownFile = (fullPath: string): string => {
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  return fs.readFileSync(fullPath, "utf8");
};
