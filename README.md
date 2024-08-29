# Focus GA

## Development Setup

- Install [Node.js](https://nodejs.org/en/download/package-manager)
- Install and enable [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) in VSCode
- Install [MongoDB Community Server](https://www.mongodb.com/docs/manual/administration/install-community/) to host a local instance of MongoDB. It may also be helpful to download [MongoDB Compass](https://www.mongodb.com/try/download/compass#compass) to view the state of your database.
- Get a locally running MongoDB instance.
  You can use the command:
  ```sh
  docker run --name mongodb -d -p 27017:27017 mongo
  ```
- In the root directory of the project, run:

  ```sh
  npm install
  ```

- In the root directory, run one of these commands based on your OS:

  ```sh
  npm run secrets:linux # mac / linux
  npm run secrets:windows # windows
  ```

  You should be prompted for a master password. Ask your Engineering leadership to continue. Once the password has been verified, your `.env` file should have been created automatically for you.

  If you are unable to use the commands to retrieve the `.env` file, you can download or visit [Bitwarden](https://bitwarden.com/) and login using `product@bitsofgood.org` and the master password. The `.env` file will be available within the vault.

- To start the Next.js dev server, run:

  ```sh
  npm run dev
  ```

- Navigate to http://localhost:3000/ to view the application.

## Tech Stack

- Next.js (frontend + backend)
- Tailwind CSS (styling)
- MongoDB (database)
- Zod (type validation)
- Salesforce (auth + account integration)
