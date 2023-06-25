import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

import { elasticClient } from "@/utils/api";

function transformData<T extends Record<string, any>>(data: T[]): T[] {
  return data.map((item) => {
    const transformedItem: T = {} as T;

    for (const key in item) {
      if (Object.hasOwnProperty.call(item, key) && key !== "_meta") {
        const rawValue = item[key]?.raw;
        transformedItem[key] = rawValue !== undefined ? rawValue : item[key];
      }
    }

    return transformedItem;
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    let { query = "", domain } = req.body;
    if (domain) {
      domain = domain.toLowerCase();
    }
    try {
      const pageSize = 1000;

      const searchQuery = {
        query,
        ...(domain && {
          filters: {
            domain: [domain],
          },
        }),
      };

      // Create the backup folder with the current date and time.
      const backupPath = path.join(
        process.cwd(),
        "data",
        "backup",
        new Date().toISOString().replace(/:/g, "")
      );
      fs.mkdirSync(backupPath, { recursive: true }); // Create the folder

      const docs = await elasticClient.app.search({
        engine_name: process.env.ELASTIC_ENGINE_NAME as string,
        body: {
          ...searchQuery,
          page: {
            size: pageSize,
          },
        },
      });
      // Store the first 1000 documents in a file named doc_1.json
      fs.writeFileSync(`${backupPath}/doc_1.json`, JSON.stringify(transformData(docs.results)));

      // Store the rest of the documents in files named doc_2.json, doc_3.json, etc.
      const fetchAndWriteDocuments = async (page: number) => {
        const response = await elasticClient.app.search({
          engine_name: process.env.ELASTIC_ENGINE_NAME as string,
          body: {
            ...searchQuery,
            page: { size: pageSize, current: page },
          },
        });
        const jsonFileName = `${backupPath}/doc_${page}.json`;
        fs.writeFileSync(jsonFileName, JSON.stringify(transformData(response.results)));
      };

      await Promise.all(
        Array.from({ length: docs.meta.page.total_pages - 1 }, async (_, index) =>
          fetchAndWriteDocuments(index + 2)
        )
      );

      return res.status(200).send({ message: "Backup completed successfully." });
    } catch (err) {
      console.error(`Error: ${err}`);
      return res.status(500).send({ message: "Unable to backup the questions." });
    }
  }

  return res.status(405).send({ message: "Method Not Allowed." });
}
