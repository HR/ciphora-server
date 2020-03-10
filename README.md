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

# Docs
All responses and requests should be of content type `application/json`.
A standard response has the following **response schema**:
```js
{
    status: {
        error: Boolean,
        message: String
    },
    data: Object || Array
}
```

### Common errors
- `401` - Unauthorized. (`User ID` not supplied in the format required or invalid)
- `401` - Access token has expired.
- `400` - Incorrect or missing params.
- `409` - Already exists.
- `500` - Unexpected error occured (most likely a MongoDB error e.g. duplicate key).


# Development
[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

## Setup
Clone the repo
```
$ git clone https://github.com/HR/ciphora-server/
```

Install all libraries and tools
```
$ npm install
```

Create `.env.json` file with the required environmental variables
```json
{
  "NODE_ENV": "development",
  "REDIS_URI": "...",
  "MONGODB_URI": "..."
}
```

## Run
To run it locally
```
$ gulp
```

The server should be running at `http://127.0.0.1:9000`
