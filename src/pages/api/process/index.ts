import fs from "fs";
import path from "path";

import { Client } from "@elastic/enterprise-search";
import { ListDocumentsResponse } from "@elastic/enterprise-search/lib/api/app/types";
import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";
import { NextApiRequest, NextApiResponse } from "next";

import { readMarkdownFile } from "@/pages/utils";

const client = new Client({
  url: process.env.ELASTIC_APP_SEARCH_ENDPOINT as string,
  auth: {
    token: process.env.ELASTIC_PRIVATE_KEY as string
  }
});

const md = new MarkdownIt();

interface QuestionAndAnswer {
  id?: string;
  date?: string;
  language?: string;
  question?: string;
  question_type?: string;
  answer?: string[];
  tags?: string[];
}

let counter = 0;
function generateId() {
  const timestamp = Date.now();
  counter++;
  return `${timestamp}-${counter}`;
}

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
  parsedTokens.forEach((token) => {
    //  Check the token type is a required token type or not.
    if (requiredTokenTypes[token.type] === token.tag) {
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
            id: generateId(),
            date: new Date().toISOString(),
            ...singleQuestion,
            question_type: "",
            language: "react",
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
  parsedTokens.forEach((token) => {
    //  Check the token type is a required token type or not.
    if (requiredTokenTypes[token.type] === token.tag) {
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
            id: generateId(),
            date: new Date().toISOString(),
            ...singleQuestion,
            question_type: "",
            language: "javascript",
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { technology } = req.body;
      const fileName = technology.toLowerCase();
      const dataPath = path.join(process.cwd(), "data", fileName);

      // Check whether the technology is present in the file system or not.
      if (!fs.existsSync(dataPath)) {
        return res.status(404).json({ error: "Technology not found" });
      }

      // Provided all the paths for the processing and storing of the data.
      const processedFilePath = path.join(dataPath, `${fileName}-processed.json`);
      const markdown = readMarkdownFile(path.join(dataPath, `${fileName}.md`));

      const results = processReactMarkdown(md.parse(markdown, {}));

      console.log(`Processing ${results.length} documents...`);
      // Group the processed data into chunks of 100.
      for (let i = 0; i < results.length; i += 100) {
        // Index the processed data to Elastic App Search.
        await client.app.indexDocuments({
          engine_name: process.env.ELASTIC_ENGINE_NAME as string,
          documents: results.slice(i, i + 100) as { [k: string]: unknown }[]
        });
      }

      // Store the processed data in a file.
      fs.writeFileSync(processedFilePath, JSON.stringify(results, null, 2));

      return res.status(200).send({
        message: "Successfully processed the markdown file."
      });
    } catch (err) {
      console.error(`Error processing the documents: ${err}`);
      return res.status(500).send({ message: "Error processing the documents" });
    }
  }
  if (req.method === "POST") {
    try {
      let { technology } = req.body;
      technology = technology?.toLowerCase();

      //    Get all the documents from the Elastic App Search.
      const { results }: ListDocumentsResponse = await client.app.search({
        engine_name: process.env.ELASTIC_ENGINE_NAME as string,
        body: {
          query: "",
          page: {
            size: 500
          },
          ...(technology && {
            filters: {
              language: technology
            }
          })
        }
      });

      for (let i = 0; i < results.length; i += 100) {
        await client.app.deleteDocuments({
          engine_name: process.env.ELASTIC_ENGINE_NAME as string,
          documentIds: results.slice(i, i + 100).map((result: { id?: { raw?: string } }) => {
            return result.id?.raw as string;
          })
        });
      }

      return res.status(200).send("Successfully deleted all the documents.");
      // return res.status(200).send(results);
    } catch (err) {
      console.error(`Error processing the documents: ${err}`);
      return res.status(500).send({ message: "Error processing the documents" });
    }
  }
  return res.status(400).send({ message: "Bad Request" });
}
