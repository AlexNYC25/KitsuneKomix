
import app from './api/app.ts'

const port = parseInt(Deno.env.get("PORT") ?? "3000", 10);

app.addEventListener("listen", () => {
  console.log(`Server is running on http://localhost:${port}`);
});

await app.listen({ port });