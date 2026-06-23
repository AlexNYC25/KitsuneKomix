# App Auth 

## Overview

For the api we have a dual setup for authentication system.
- **Token-based authentication**: This is used for API clients, such as the web frontend or mobile apps. It allows users to authenticate using tokens, which can be generated upon login and used for subsequent requests.
- **Cookie-based authentication**: This is used for web clients, allowing access to certain resources that require authentication, but be more browser-friendly, particularly for images.

## Token-based Authentication
- Users can log in using their credentials (username and password) to receive a token.
- The token is then included in the Authorization header of subsequent API requests to access protected resources.
- Tokens have an expiration time and can be refreshed using a refresh token.
- This token is generated using JWT (JSON Web Tokens) and is signed with a secret key to ensure its integrity and authenticity.

## Cookie-based Authentication
- When a user logs in through the web interface, a session cookie is created and stored in the user's browser.
- This cookie is sent with each request to the server, allowing the server to identify the user and grant access to protected resources.
- This method is particularly useful for accessing images (maybe other resources in the future) that require authentication, for a browser client not needing to send a token request header for basic resources.

