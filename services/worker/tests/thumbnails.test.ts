import { expect, test } from "bun:test"

import sharp from "sharp"

import {
  createThumbnail,
  THUMBNAIL_MAX_DIMENSION,
} from "../utilities/thumbnails"

test("createThumbnail preserves landscape aspect ratio and outputs JPEG", async () => {
  const source = await sharp({
    create: {
      width: 1200,
      height: 800,
      channels: 3,
      background: "#ff0000",
    },
  }).png().toBuffer()

  const thumbnail = await createThumbnail(source.buffer)
  const metadata = await sharp(thumbnail).metadata()

  expect(metadata.format).toBe("jpeg")
  expect(metadata.width).toBe(THUMBNAIL_MAX_DIMENSION)
  expect(metadata.height).toBe(427)
})

test("createThumbnail constrains portrait images by height", async () => {
  const source = await sharp({
    create: {
      width: 800,
      height: 1200,
      channels: 3,
      background: "#00ff00",
    },
  }).png().toBuffer()

  const thumbnail = await createThumbnail(source.buffer)
  const metadata = await sharp(thumbnail).metadata()

  expect(metadata.format).toBe("jpeg")
  expect(metadata.width).toBe(427)
  expect(metadata.height).toBe(THUMBNAIL_MAX_DIMENSION)
})

test("createThumbnail does not enlarge smaller images", async () => {
  const source = await sharp({
    create: {
      width: 320,
      height: 200,
      channels: 3,
      background: "#0000ff",
    },
  }).png().toBuffer()

  const thumbnail = await createThumbnail(source.buffer)
  const metadata = await sharp(thumbnail).metadata()

  expect(metadata.width).toBe(320)
  expect(metadata.height).toBe(200)
})
