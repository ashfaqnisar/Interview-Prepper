import { NextApiRequest, NextApiResponse } from "next";

import { elasticClient, idGenerator } from "@/utils/api";

// Create a next js request which takes in a post request and creates a question in elastic search
export default async function handler(req: NextApiRequest, res: NextApiResponse<Record<"message", string>>) {
  if (req.method === "POST") {
    try {
      const question: { [k: string]: unknown } = req.body;

      // Send the question to the App Search engine.
      const response = await elasticClient.app.indexDocuments({
        engine_name: process.env.ELASTIC_ENGINE_NAME as string,
        documents: [
          {
            id: idGenerator.sortableId(),
            date: new Date().toISOString(),
            ...question,
          },
        ],
      });

      // @ts-ignore
      if (response.errors) {
        return res.status(500).json({ message: "Unable to create the question." });
      }

      return res.status(200).json({ message: "Successfully created the question." });
    } catch (err) {
      console.error(`Error: ${err}`);
      res.status(500).json({ message: "Unable to create the document." });
    }
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}
