import fs from "fs";
import path from "path";
import * as process from "process";
import type { NextApiRequest, NextApiResponse } from "next";
import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";
import { markdownTable } from "markdown-table";

import { QuestionAndAnswer } from "@/types/question";
import { elasticClient, idGenerator, readFileAtPath, splitToChunks } from "@/utils/api";

// This function will process the markdown file format by the sudheerj repo. - React, Javascript.
const processSudheerjQuestions = (parsedTokens: Token[], domain: string): QuestionAndAnswer[] => {
  // Heading tokens are used to identify the start of a new question.
  // Paragraph tokens are used to identify the start of a new answer.
  // Fence tokens are used to identify the start of a new code block.
  // Inline tokens are used to identify the start of a new paragraph.
  const tokenTypesForReactAndJS: Record<string, string> = {
    heading_open: "h3",
    heading_close: "h3",
    paragraph_open: "p",
    fence: "code",
    inline: "",
    table_open: "table",
    table_close: "table",
    tr_close: "tr",
  };

  const processedQuestions: QuestionAndAnswer[] = [];

  // Parsing and processing the markdown tokens.
  let processedQuestion: QuestionAndAnswer;
  let previousTokenTag: string;
  let tableData: string[][] = [],
    tableRowIndex: number = 0;

  parsedTokens.forEach((token) => {
    // Check the token type is present in the tokenTypesForReactAndJS object with the specified tag.
    if (tokenTypesForReactAndJS[token.type] === token.tag) {
      switch (token.type) {
        case "heading_open":
          processedQuestion = {
            question: "",
            answer: [],
          };
          break;
        case "heading_close":
          // Even if we push the question before the addition of the answer, it will not affect the result.
          // Because we are sending the reference of the object to the processedQuestions array.
          processedQuestions.push({
            id: idGenerator.sortableId(),
            date: new Date().toISOString(),
            ...processedQuestion,
            domain,
            question_type: "",
            tags: [],
          });
          break;
        case "inline":
          // If the previous token tag is h3 then it is a question.
          if (previousTokenTag === "h3") {
            processedQuestion.question = token.content.trim();
          } else if (tableData.length > 0) {
            // If the tableData array length is greater than 0 then push the content to the table data.
            tableData[tableRowIndex] = tableData[tableRowIndex] ?? [];
            tableData[tableRowIndex].push(token.content.trim());
          } else if (
            previousTokenTag === "p" &&
            processedQuestion?.answer &&
            token.content.trim() !== "**[⬆ Back to Top](#table-of-contents)**"
          ) {
            // If the previous token is a paragraph then it is an answer.
            processedQuestion.answer.push(token.content.trim());
          }
          break;
        case "fence":
          // Push the code block to the answer array.
          processedQuestion?.answer?.push("```" + token.info + "\n" + token.content + "\n```");
          break;
        case "table_open":
          tableData = [[]];
          break;
        case "tr_close":
          tableRowIndex++;
          break;
        case "table_close":
          const table = markdownTable(tableData);
          processedQuestion?.answer?.push(table);
          tableData.length = 0;
          tableRowIndex = 0;
          break;
      }
      previousTokenTag = token.tag;

      // console.log(`token.type: ${token.type}, token.tag: ${token.tag}, content: ${token.content}`);
    }
  });

  return processedQuestions;
};

const markdownProcessor: Record<
  string,
  (parsedTokens: Token[], domain: string) => QuestionAndAnswer[]
> = {
  react: processSudheerjQuestions,
  javascript: processSudheerjQuestions,
};

const md = new MarkdownIt();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Record<"message", string>>
) {
  if (req.method === "POST" && process.env.NODE_ENV !== "production") {
    let { domain, fileName } = req.body;
    if (!domain) {
      return res.status(400).send({ message: "Bad Request: No Domain Provided." });
    }
    domain = domain.toLowerCase();

    try {
      if (!markdownProcessor[domain]) {
        return res.status(400).send({ message: "Markdown processor not found for this domain." });
      }

      let filePath = path.join(process.cwd(), "data", domain, `${domain}.md`);
      if (fileName) {
        filePath = path.join(process.cwd(), "data", fileName);
      }
      const markdown = readFileAtPath(filePath);

      // Process the markdown and split the results into chunks of 100.
      const resultGroup: QuestionAndAnswer[][] = splitToChunks(
        markdownProcessor[domain](md.parse(markdown, {}), domain),
        100
      );

      // // Wait for all the chunks to be indexed.
      await Promise.all(
        resultGroup.map(async (results) => {
          return elasticClient.app.indexDocuments({
            engine_name: process.env.ELASTIC_ENGINE_NAME as string,
            documents: results as any,
          });
        })
      );

      console.log(`Processed ${domain} questions.`);

      // Store the processed data in a file.
      const processedFilePath = path.join(
        process.cwd(),
        "data",
        domain,
        `${domain}-processed.json`
      );
      fs.writeFileSync(processedFilePath, JSON.stringify(resultGroup.flat(), null, 2));

      return res.send({ message: `Successfully processed & indexed the ${domain} domain.` });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Unable to process the data." });
    }
  }
  return res.status(405).send({ message: "Method Not Allowed" });
}
