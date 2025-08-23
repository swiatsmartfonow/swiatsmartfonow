import { Client } from "pg";

const connectionString = process.env.NEON_DATABASE_URL;

const getClient = () => new Client({ connectionString });

export default async function handler(req, res) {
  const client = getClient();
  await client.connect();

  try {
    const { method } = req;

    if (method === "POST") {
      const { url, author, width, height } = req.body;
      if (!url) return res.status(400).json({ error: "URL is required" });

      const result = await client.query(
        "INSERT INTO images (url, author, width, height) VALUES ($1, $2, $3, $4) RETURNING *",
        [url, author || "Custom Author", width || 5000, height || 3333]
      );

      return res.status(200).json({ message: "URL added", image: result.rows[0] });
    }

    if (method === "GET") {
      const result = await client.query("SELECT * FROM images ORDER BY id ASC");
      const images = result.rows.map((row) => ({
        id: row.id.toString(),
        author: row.author,
        width: row.width,
        height: row.height,
        url: row.url,
        download_url: row.url
      }));
      return res.status(200).json(images);
    }

    if (method === "DELETE") {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: "ID is required" });

      await client.query("DELETE FROM images WHERE id=$1", [id]);
      return res.status(200).json({ message: "URL deleted" });
    }

    if (method === "PUT") {
      const { id, author, width, height } = req.body;
      if (!id) return res.status(400).json({ error: "ID is required" });

      const result = await client.query(
        "UPDATE images SET author=$1, width=$2, height=$3 WHERE id=$4 RETURNING *",
        [author, width, height, id]
      );

      return res.status(200).json({ message: "URL updated", image: result.rows[0] });
    }

    res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  } finally {
    await client.end();
  }
}