import { getClient } from "kitsune-komix-database";

export const installHonkerExtension = async () => {
  const {client, db} = await getClient();

  await client.execute(`SELECT load_extension('/honker/libhonker_ext.so')`)
  await client.execute(`SELECT honker_bootstrap()`)
}