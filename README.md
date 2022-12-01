<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">Nest.js, A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Configuration

Create a .env file and add the following env variables

```.env
SECRET=`<ANY_STRING_RANDOMIZE_FOR_SECURITY_PURPOSE>`
AUTH_APP_NAME=`<NAME_OF_THIS_APP>`
MONGODB_URI='<MONGO_DB_URI>'
```

## Routes

- `GET /` - Index page
- `GET /users` - Retrieves users. Guarded for login. Has been used to test logins
- `POST /auth/register` - create new users

request body

```
{
    "email": <EMAIL_ADDRESS>,
    "password": <YOUR_PASSWORD>,
    "acceptedTerms": <ACCEPT_TERMS_BOOLEAN>,
    "subscribedToNewsLetters": <BOOLEAN>
}
```

result on success

```
{
    "code": 564929
}
```

Usually the code is sent via email. Fails with error if exists or invalid data.

- `POST /auth/verify` - Using code from previous step pass the request body as follows

```
{
    "email": <EMAIL_USED_TO_REGISTER>,
    "verificationCode": <THE_CODE_FROM_PREV_STEP>
}
```

on success

```
{
    "success": true
}
```

Fails if invalid user, or code, or verified

- `POST /auth/login` - Handle user login with the following request body.

```
{
    "email": <YOUR_EMAIL>,
    "password": <YOUR_PASSWORD>
}
```

Returns JWT token on success or fails with error

```
{
    "token": <JWT_TOKEN>
}
```

- `POST /auth/2fa/generate` - Generates a 2FA token with a QR code that you can scan and authenticate to any auth app

Request body - None

Authorization header

```
Authorization: Bearer <JWT_TOKEN_GENERATED_PREVIOUSLY>
```

Response

```
<QR CODE IMAGE DATA GENERATED. PASTE ON WEB BROWSER TO SHOW IMAGE. AND SCAN WITH A  2FA APP LIKE GOOGLE AUTHENTICATE OR ANY OTHER>
```

- `POST /auth/2fa/turn-on` - Turns on two factor authentication for an added layer of security

Request body

```
{
    "twoFactorAuthenticationCode": <CODE_FROM_YOUR_2FA_APP>
}
```

Authorization header

```
Authorization: Bearer <JWT_TOKEN_GENERATED_PREVIOUSLY>
```

Response success or error on failure.

```
{ success: true }
```

- `POST /auth/2fa/authenticate` - authenticate using 2FA 

Request body

```
{
    "twoFactorAuthenticationCode": <CODE_FROM_YOUR_2FA_APP>
}
```

Authorization header

```
Authorization: Bearer <JWT_TOKEN_GENERATED_PREVIOUSLY>
```

on success returns generted JWT_TOKEN

```
{
    "email": <YOUR_EMAIL_ADDRESS>,
    "token": <JWT_TOKEN>
}
```

Fails on error

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Stay in touch

- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
