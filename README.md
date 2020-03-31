<h3 align="center">
  <br>
  <a href="https://github.com/HR/ciphora"><img src="https://raw.githubusercontent.com/HR/ciphora/master/build/icon.png" alt="Ciphora" width="180" style= "margin-bottom: 1rem"></a>
  <br>
  Ciphora Server
  <br>
  <br>
</h3>
<br>
<br>

Simple discovery and signalling (websocket) server for the Ciphora (https://github.com/HR/ciphora), a P2P E2E encrypted messaging app.
Provides simple peer authentication through PGP. See `src/schema/message.json` for messaging format.


# Development
[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

## Setup
Clone the repo
```
$ git clone https://github.com/HR/ciphora-server.git
```

Install all libraries and tools
```
$ npm install
```

Create `.env.json` file with the required environmental variables
```json
{
  "NODE_ENV": "development",
  "REDIS_URI": "..."
}
```

## Run
To run it locally
```
$ gulp
```

The server should be running at `http://127.0.0.1:9000`
