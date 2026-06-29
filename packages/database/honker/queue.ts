import { getClient } from "../client.ts";

type QueueOptions = {
  name: string,
  maxAttempts: number
}

type QueueItemOptions = {
  delay: number | undefined,
  priority: number | undefined
}

export const enqueue = async (
  queueOptions: QueueOptions,
  queueItemOptions: QueueItemOptions,
  payload: string
) => {
  const db = await getClient();

  const row = db?.run(`SELECT honker_enqueue(
    '${queueOptions.name}',
    '${payload}',
    NULL,
    NULL,
    ${queueItemOptions.delay ?? 0},
    ${queueOptions.maxAttempts},
    ${queueItemOptions.priority ?? 3}
  ) AS id`)

  return row;
}