# Cubos Backend Challenge

REST API developed using Node.js for the tech backend challenge from Cubos Tecnologia

## Dependencies Used

- "express": A minimal and flexible Node.js web application framework that provides a robust set of features
- "date-fns": A date utility library used handle dates and hours
- "yup": A JavaScript object schema validator and object parser

## Dev Dependencies Used

- "typescript": A strict syntactical superset of JavaScript
- "jest": A delightful JavaScript Testing Framework with a focus on simplicity
- "eslint": A pluggable and configurable linter tool
- "prettier": An opinionated code formatter
- "nodemon": A tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory
- "sucrase": Allows super-fast development builds

## Getting Started

1. Clone the project into your machine and install all dependencies inside the `cubos-desafio-backend` folder using:

```console
yarn install
```

2. Now, to run the server:

```console
yarn dev
```

3. Finally, to run the tests:

```console
yarn test
```

## Routes

#### Rules

- `GET /rules`:
  - Description: Returns all availability rules registered
  - Response:
    - Status 200 - JSON containing all rules
- `POST /rules`:

  - Description: Creates a new availability rule
  - Body Parameters:

  | Field       | Description                | Type   | Allow Null | Allowed Values              |
  | ----------- | -------------------------- | ------ | ---------- | --------------------------- |
  | periodicity | periodicity of rule        | STRING | False      | 'daily', 'weekly', 'unique' |
  | intervals   | interval of rule           | JSON   | False      | { "start": "", "end": ""}   |
  | date        | date of rule in ISO format | STRING | TRUE       | any date in ISO format      |
  | days        | days of week of rule       | ARRAY  | TRUE       | [0, 1, 2, 3, 4, 5, 6]       |

  - Example: Creates DAILY availability in the interval defined

  ```javascript
  {
    "periodicity": "daily",
    "intervals": {
      "start": "08:00",
      "end": "09:00"
    }
  }
  ```

  - Example: Creates WEEKLY availability in the interval defined. The days were maped as follow: 0 - Sunday, 1 - Monday, ..., 6 - Saturday

  ```javascript
  {
    "periodicity": "weekly",
    "intervals": {
      "start": "05:30",
      "end": "06:30"
    },
    "days": [1,3,5]
  }
  ```

  - Example: Creates UNIQUE availability in the interval and date defined

  ```javascript
  {
    "periodicity": "unique",
    "date": "2019-12-08T21:00:00-03:00",
    "intervals": {
      "start": "04:00",
      "end": "05:00"
    }
  }
  ```

  - Response:
    - Status 200 - Recently created rule
    - Status 400 - Bad Request
    - Status 409 - Conflict - Given interval conflicts with another interval already created
- `DELETE /rules/:id`:
  - Description: Deletes an availability rule based on the id passed via route parameter
  - Response:
    - Status 200 - List of all rules after deletion
    - Status 404 - Rule id not found

#### Available Hours

- `GET /avaiable-hours`:

  - Description: Returns all available hours based on specified range on body
  - Request example:

    ```javascript
    {
      "startDate": "2019-12-05T12:00:00-03:00",
      "endDate": "2019-12-15T20:00:00-03:00"
    }
    ```

  - Response:
    - Status 200 - List of all available hours based on rules

## Request examples

Postman collection containing the examples of the requests mentioned: https://www.getpostman.com/collections/a69835da12d45578120b

---

Made with ❤️ by Matheus Beck 👋 [Get in touch!](https://www.linkedin.com/in/matheus-beck/)
