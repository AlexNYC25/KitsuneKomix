# Architecture

The app itself relies on separate services each responsible for their own task, that are started up on the initial start up command,
all of these services and the related internal packages are part of this monorepo.

## REST API

This is a hono based typescript API, that is responsible for returning the response data to the client, at this moment it is just the
Vue client that is part of this monorepo, with OPDS support in the future.

As well as handling image process actions on request such as extracting images from the comic archive and if needed converting them to a compatible format
for the browser client.

## Client

A Vue.js based client that is used to navigate the comic files, including the defined libraries and parsed comic series. As well as provide an in browser reader to
read the selected comics in the browser without the need for an additional stand alone reader.

## Worker

As new libraries are defined using the Client + API, the comic files need to go through the pipeline. This pipeline process handles everything from recording the comic book's existence, creating the comic book's thumbnail, and if available parse the metadata for user convenience. These files are routinely checked at a set interval
