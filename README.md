# instazz-back

[![Build Status](https://travis-ci.org/ThomasCluzel/instazz-back.svg?branch=master)](https://travis-ci.org/ThomasCluzel/instazz-back)

This project is the backend of the InstaZZ app of the course ZZ3-javascript-ecosystems

Throughout this course, we will build a social-network with a
principle similar to Instagram.

_Disclaimer_: this is not a copy of Instagram, this project is made by students
for learning purpose only.

## Launching MongoDB
Launch a local Mongo database for the API to work
```sh
docker-compose -f docker-compose-mongo.yml up -d
```

## Content of the .env file

Required content of the ".env" file
```
# Database connection string
MONGO=mongodb://<user>:<passwd>@<host>

#Database connection string for tests
MONGO_TEST=mongodb://<user>:<passwd>@<host>

# API port
PORT=5000

# Seed used to hash the JWT token
JWT_SECRET=xxx

# Path where images should be uploaded (must exists)
UPLOAD_PATH=/path
```

## Some useful commands

Launch server
```sh
npm run start
```

## API documentation

If a request fails, it returns an HTTP status of value 500 with an error message (status will be replaced by more adapted ones in the future).

### Users

#### Create a user

Post request on localhost:5000/api/v1/users/, with Content-Type=application/json and with the body as follow:
```json
{
	"name": "myName",
	"pseudo": "myPseudo",
	"password": "myPassword"
}
```

If the username is already taken, you get an error: "Username is already taken"

Otherwise, you are signed in and connected. The returned value is:
```json
{
    "succes": true,
    "token": "xxx",
    "_id": "xxx",
    "pseudo": "myPseudo",
    "name": "myName",
    "role": "myRole"
}
```

#### Sign in

Post request on localhost:5000/api/v1/users/signin with Content-Type=application/json and with the body as follow:
```json
{
	"pseudo": "myPseudo",
	"password": "myPassword"
}
```

The returned value is:
```json
{
    "succes": true,
    "token": "xxx",
    "pseudo": "myPseudo",
    "name": "myName",
    "role": "myRole"
}
```

#### Get all users (accessible for admin only!)

Get request on localhost:5000/api/v1/users

The returned value is:
```json
{
    "users": [
        {
            "role": "roleUser1",
            "_id": "xxx",
            "name": "nameUSer1",
            "pseudo": "pseudoUser1",
            //Hashed password
            "password": "xxx",
            "__v": 0
        },
        {
            "role": "roleUser2",
            //...
        },
        //...
    ]
}
```

### Posts

#### Create a post (you must be connected)

Post request on localhost:5000/api/v1/posts with Content-Type=multipart/form-data, Authorization=yourToken and with the body as follow:
```json
{
	"imageData": "/path/to/file",
	"description": "myDescription"
}
```

The returned value is:
```json
{
    "_id": "xxx",
    "description": "myDescription",
    //image id
    "image": "xxx",
    "publication_date": "2020-03-02T17:20:33.011Z",
    //author id
    "author": "xxx",
    "__v": 0
}
```

#### Get all posts

Get request on localhost:5000/api/v1/posts

The returned value is:
```json
{
    "posts": [
        {
            "_id": "xxx",
            "publication_date": "2020-02-12T18:24:50.890Z",
            "description": "myDescription1",
            "image": {
                "_id": "xxx",
                "filename": "filename1.png"
            },
            "author": {
                "_id": "xxx",
                "pseudo": "pseudo1"
            },
            "__v": 0,
            //Image converted in base64
            "imageData": "xxx"
        },
        {
            "_id": "xxx",
            //...
        },
        //...
    ]
}
```

#### Get my posts (you must be connected)

Get request on localhost:5000/api/v1/posts with Authorization=yourToken

The returned value is:
```json
{
    "posts": [
        {
            "_id": "xxx",
            "description": "myPost1",
            "image": {
                "_id": "xxx",
                "filename": "myFilename1.png"
            },
            "publication_date": "2020-03-02T17:20:33.011Z",
            "author": {
                "_id": "xxx",
                "pseudo": "myPseudo"
            },
            "__v": 0,
            //Image converted in base64
            "imageData": "xxx"
        },
        {
            "_id": "xxx",
            //...
        }
        //...
    ]
}
```
