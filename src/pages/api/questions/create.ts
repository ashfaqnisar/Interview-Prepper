import { Client } from "@elastic/enterprise-search";
import { NextApiRequest, NextApiResponse } from "next";

const client = new Client({
  url: process.env.ELASTIC_APP_SEARCH_ENDPOINT as string,
  auth: {
    token: process.env.ELASTIC_PRIVATE_KEY as string
  }
});

let counter = 0;
function generateId() {
  const timestamp = new Date().getTime();
  const sequentialNumber = counter.toString().padStart(6, "0");
  const sortableId = `${timestamp}_${sequentialNumber}`;
  counter++;
  return sortableId;
}

// Create a next js request which takes in a post request and creates a question in elastic search
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const question: { [k: string]: unknown } = req.body;

      // Send the question to the App Search engine.
      const response = await client.app.indexDocuments({
        engine_name: process.env.ELASTIC_ENGINE_NAME as string,
        documents: [
          {
            sid: generateId(),
            date: new Date().toISOString(),
            ...question
          }
        ]
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (response.errors) {
        return res.status(500).json({ message: "Error inserting documents into Elasticsearch" });
      }

      res.status(200).json({ message: "Successfully inserted documents into the database." });
    } catch (err) {
      console.error(`Error inserting documents: ${err}`);
      res.status(500).json({ message: "Error inserting documents into database." });
    }
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}
