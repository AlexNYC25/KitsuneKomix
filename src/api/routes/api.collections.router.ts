import { Context, Hono } from "hono";
import { z } from "zod";

const app = new Hono();

app.get("/", async (c: Context) => {
	//TODO: implement collections retrieval logic
	const collections = [{ id: 1, name: "Default Collection" }];
	return c.json(collections);
});

app.get("/:id", async (c: Context) => {
	const id = c.req.param("id");
	//TODO: implement collection retrieval logic
	const collection = { id, name: "Default Collection" };
	return c.json(collection);
});

app.delete("/:id", async (c: Context) => {
	const id = c.req.param("id");
	//TODO: implement collection deletion logic
	return c.json({ message: "Collection deletion not implemented yet" }, 501);
});

app.get("/:id/series", async (c: Context) => {
	const id = c.req.param("id");
	//TODO: implement collection series retrieval logic
	const series = [{ id: 1, title: "Default Series" }];
	return c.json(series);
});

app.get("/:id/thumbnails", async (c: Context) => {
	const id = c.req.param("id");
	//TODO: implement collection thumbnails retrieval logic
	const thumbnails = [{ id: 1, url: "http://example.com/thumb1.jpg" }];
	return c.json(thumbnails);
});

app.get("/:id/thumbnails/:thumbId", async (c: Context) => {
	const id = c.req.param("id");
	const thumbId = c.req.param("thumbId");
	//TODO: implement collection thumbnail retrieval logic
	const thumbnail = { id: thumbId, url: "http://example.com/thumb1.jpg" };
	return c.json(thumbnail);
});

app.put("/:id/thumbnail/:thumbId/selected", async (c: Context) => {
	const id = c.req.param("id");
	const thumbId = c.req.param("thumbId");
	//TODO: implement collection thumbnail update logic
	return c.json({ message: "Collection thumbnail update not implemented yet" }, 501);
});

app.post("/add-collection", async (c: Context) => {
	const body = await c.req.json();
	const schema = z.object({
		name: z.string().min(2).max(100),
	});
	const result = schema.safeParse(body);
	if (!result.success) {
		return c.json({ message: "Invalid request body", errors: result.error }, 400);
	}
	const { name } = result.data;
	//TODO: implement collection addition logic
	return c.json({ message: "Collection addition not implemented yet" }, 501);
});

app.put("/:id/update", async (c: Context) => {
	//TODO: implement collection update logic
	return c.json({ message: "Collection update not implemented yet" }, 501);
});

app.post("/:id/add-comics", async (c: Context) => {
	// TODO: implement add comics to collection logic
	return c.json({ message: "Add comics to collection not implemented yet" }, 501);
});

app.post("/:id/remove-comics", async (c: Context) => {
	// TODO: implement remove comics from collection logic
	return c.json({ message: "Remove comics from collection not implemented yet" }, 501);
});
