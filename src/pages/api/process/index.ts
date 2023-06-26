import fs from "fs";
import path from "path";

import { Client } from "@elastic/enterprise-search";
import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";
import { markdownTable } from "markdown-table";
import { NextApiRequest, NextApiResponse } from "next";

const client = new Client({
  url: process.env.ELASTIC_APP_SEARCH_ENDPOINT as string,
  auth: {
    token: process.env.ELASTIC_PRIVATE_KEY as string
  }
});

const readMarkdownFile = (fullPath: string): string => {
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  return fs.readFileSync(fullPath, "utf8");
};

const md = new MarkdownIt();

interface QuestionAndAnswer {
  id?: string;
  sid?: string;
  date?: string;
  domain?: string;
  question?: string;
  question_type?: string;
  answer?: string[];
  tags?: string[];
}

let counter = 0;
function generateId() {
  const timestamp = new Date().getTime();
  const sequentialNumber = counter.toString().padStart(6, "0");
  const sortableId = `${timestamp}_${sequentialNumber}`;
  counter++;
  return sortableId;
}

// TODO: Update this function to process the react markdown files.
// eslint-disable-next-line no-unused-vars
const processReactMarkdown = (parsedTokens: Token[]): QuestionAndAnswer[] => {
  // For storing the processed data we will use an array.
  const results: QuestionAndAnswer[] = [];
  let singleQuestion: QuestionAndAnswer;

  // Parsing and processing the markdown file.
  const requiredTokenTypes: Record<string, string> = {
    heading_open: "h3",
    heading_close: "h3",
    paragraph_open: "p",
    paragraph_close: "p",
    fence: "code",
    inline: ""
  };
  let previousTokenType: { type: string; tag: string };
  const tableData: string[][] = [];
  let currentTableIndex = 0;
  let isTable = false;
  parsedTokens.forEach((token) => {
    if (token.type === "table_open") {
      isTable = true;
    }
    if (token.type === "table_close") {
      const table = markdownTable(tableData);
      singleQuestion?.answer?.push(table);
      tableData.length = 0;
      currentTableIndex = 0;
      isTable = false;
    }

    if (isTable) {
      if (token.type === "tr_close") {
        currentTableIndex++;
      } else if (token.type === "inline") {
        tableData[currentTableIndex] = tableData[currentTableIndex] ?? [];
        tableData[currentTableIndex].push(token.content);
      }
    }
    //  Check the token type is a required token type or not.
    else if (requiredTokenTypes[token.type] === token.tag) {
      switch (token.type) {
        case "heading_open":
          // If the token type is a heading_open then start the question.
          singleQuestion = {
            question: "",
            answer: []
          };
          break;
        case "heading_close":
          // If the token type is a heading_close then end the question.
          results.push({
            sid: generateId(),
            date: new Date().toISOString(),
            ...singleQuestion,
            question_type: "",
            domain: "react",
            tags: []
          });
          break;
        case "fence":
          // If the token type is a fence then add the code to the answer.
          singleQuestion?.answer?.push("```" + token.info + "\n" + token.content + "\n```");
          break;
        case "inline":
          // If the token type is a inline then add the text to the question or answer.
          // Check the previous token type to determine if the text is a question or answer.
          if (previousTokenType?.type === "heading" && previousTokenType?.tag === "h3") {
            singleQuestion.question = token.content.trim();
          } else if (previousTokenType?.type === "paragraph") {
            if (token.content.trim() !== "**[⬆ Back to Top](#table-of-contents)**") {
              singleQuestion?.answer?.push(token.content.trim());
            }
          }
          break;
      }
      previousTokenType = { type: token?.type?.split("_")[0] ?? "", tag: token.tag };
    } else return;
  });
  return results;
};
const processJSMarkdown = (parsedTokens: Token[]): QuestionAndAnswer[] => {
  // For storing the processed data we will use an array.
  const results: QuestionAndAnswer[] = [];
  let singleQuestion: QuestionAndAnswer;

  // Parsing and processing the markdown file.
  const requiredTokenTypes: Record<string, string> = {
    heading_open: "h3",
    heading_close: "h3",
    paragraph_open: "p",
    paragraph_close: "p",
    fence: "code",
    inline: ""
  };
  let previousTokenType: { type: string; tag: string };
  const tableData: string[][] = [];
  let currentTableIndex = 0;
  let isTable = false;
  parsedTokens.forEach((token) => {
    if (token.type === "table_open") {
      isTable = true;
    }
    if (token.type === "table_close") {
      const table = markdownTable(tableData);
      singleQuestion?.answer?.push(table);
      tableData.length = 0;
      currentTableIndex = 0;
      isTable = false;
    }

    if (isTable) {
      if (token.type === "tr_close") {
        currentTableIndex++;
      } else if (token.type === "inline") {
        tableData[currentTableIndex] = tableData[currentTableIndex] ?? [];
        tableData[currentTableIndex].push(token.content);
      }
    }
    //  Check the token type is a required token type or not.
    else if (requiredTokenTypes[token.type] === token.tag) {
      switch (token.type) {
        case "heading_open":
          // If the token type is a heading_open then start the question.
          singleQuestion = {
            question: "",
            answer: []
          };
          break;
        case "heading_close":
          // If the token type is a heading_close then end the question.
          results.push({
            sid: generateId(),
            date: new Date().toISOString(),
            ...singleQuestion,
            question_type: "",
            domain: "javascript",
            tags: []
          });
          break;
        case "fence":
          // If the token type is a fence then add the code to the answer.
          singleQuestion?.answer?.push("```" + token.info + "\n" + token.content + "\n```");
          break;
        case "inline":
          // If the token type is an inline then add the text to the question or answer.
          // Check the previous token type to determine if the text is a question or answer.
          if (previousTokenType?.type === "heading" && previousTokenType?.tag === "h3") {
            singleQuestion.question = token.content.trim();
          } else if (previousTokenType?.type === "paragraph") {
            if (token.content.trim() !== "**[⬆ Back to Top](#table-of-contents)**") {
              singleQuestion?.answer?.push(token.content.trim());
            }
          }
          break;
      }
      previousTokenType = { type: token?.type?.split("_")[0] ?? "", tag: token.tag };
    } else return;
  });
  return results;
};

const markdownProcessor: Record<string, (parsedTokens: Token[]) => QuestionAndAnswer[]> = {
  react: processReactMarkdown,
  javascript: processJSMarkdown
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { test } = req.query;
    if (test) {
      try {
        const markdown = readMarkdownFile(path.join(process.cwd(), "data", "test.md"));

        const results = markdownProcessor["javascript"](md.parse(markdown, {}));

        return res.status(200).json(results);
      } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
    try {
      const { domain } = req.body;
      const fileName = domain.toLowerCase();
      const dataPath = path.join(process.cwd(), "data", fileName);

      // Check whether the domain is present in the file system or not.
      if (!fs.existsSync(dataPath)) {
        return res.status(404).json({ error: "domain not found" });
      }

      // If there is no Markdown processor present for the domain then return an error.
      if (!markdownProcessor[domain]) {
        return res.status(404).json({ error: "Markdown processor not found" });
      }

      const markdown = readMarkdownFile(path.join(dataPath, `${fileName}.md`));

      const results = markdownProcessor[domain](md.parse(markdown, {}));

      console.log(`Processing ${results.length} documents...`);
      // Group the processed data into chunks of 100.
      for (let i = 0; i < results.length; i += 100) {
        // Index the processed data to Elastic App Search.
        await client.app.indexDocuments({
          engine_name: process.env.ELASTIC_ENGINE_NAME as string,
          documents: results.slice(i, i + 100) as { [k: string]: unknown }[]
        });
      }

      // Provided all the paths for the processing and storing of the data.
      // Store the processed data in a file.
      // const processedFilePath = path.join(dataPath, `${fileName}-processed.json`);
      // fs.writeFileSync(processedFilePath, JSON.stringify(results, null, 2));

      return res.status(200).send({
        message: "Successfully processed the markdown file."
      });
    } catch (err) {
      console.error(`Error processing the documents: ${err}`);
      return res.status(500).send({ message: "Error processing the documents" });
    }
  }

  return res.status(400).send({ message: "Bad Request" });
}
