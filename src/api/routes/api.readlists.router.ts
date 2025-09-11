import { Context, Hono } from "hono";
import { z } from "zod";

const app = new Hono();

app.get("/", async (c: Context) => {
	//TODO: implement readlist retrieval logic
	const readlists = [{ id: 1, name: "Default Readlist" }];
	return c.json(readlists);
});

app.get("/:id", async (c: Context) => {
    const id = c.req.param("id");
	//TODO: implement readlist retrieval logic
	const readlist = { id, name: "Default Readlist" };
	return c.json(readlist);
});

app.delete("/:id", async (c: Context) => {
		const id = c.req.param("id");
		//TODO: implement readlist deletion logic
		return c.json({ message: "Readlist deletion not implemented yet" }, 501);
});

app.get("/:id/download", async (c: Context) => {
	const id = c.req.param("id");
	//TODO: implement readlist download logic
	return c.json({ message: "Readlist download not implemented yet" }, 501);
});

app.post("/add-readlist", async (c: Context) => {
	const body = await c.req.json();
	const schema = z.object({
		name: z.string().min(2).max(100),
	});
	const result = schema.safeParse(body);
	if (!result.success) {
		return c.json({ message: "Invalid request body", errors: result.error }, 400);
	}
	const { name } = result.data;
	//TODO: implement readlist addition logic
	return c.json({ message: "Readlist addition not implemented yet" }, 501);
});


