# instazz-back

This project is the backend of the InstaZZ app of the course ZZ3-javascript-ecosystems

Hello and welcome to the IntaZZ backend repository.

## Some useful commands

Launch server
```sh
npm run start
```

Test the API
```sh
# Create a user and a post
curl -d '{"name":"John Doe", "pseudo":"Deadman"}' -H 'Content-Type: application/json' localhost:5000/api/v1/users/
curl -d '{"description":"John says hello.", "author":"John Doe"}' -H 'Content-Type: application/json' localhost:5000/api/v1/posts/

# Get all users
curl localhost:5000/api/v1/users/
```

Launch a local Mongo database for the API to work
```sh
docker-compose -f docker-compose-mongo.yml up -d
```

## Content of the .env file

Required content of the ".env" file
```
# Database connection string
MONGO=mongodb://<user>:<passwd>@<host>

# API port
PORT=5000
```
