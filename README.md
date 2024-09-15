# Focus GA

## Development Setup

- Install [Node.js](https://nodejs.org/en/download/package-manager)
- Install and enable [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) in VSCode
- Install [MongoDB Community Server](https://www.mongodb.com/docs/manual/administration/install-community/) to host a local instance of MongoDB. It may also be helpful to download [MongoDB Compass](https://www.mongodb.com/try/download/compass#compass) to view the state of your database.
- Get a locally running MongoDB instance.
  
  Install [Docker](https://docs.docker.com/engine/install/).
  
  Then, to host the instance, you can use the command:
  ```sh
  docker-compose up -d
  ```

  To stop your Docker containers and remove their processes, run:

  ```sh
  docker-compose down
  ```

  Note: On linux-based operating systems, if you come across an entrypoint permission error (i.e. `process: exec: "./scripts/env-init.sh": permission denied: unknown` or `process: exec: "./scripts/rs-init.sh": permission denied: unknown`), run `chmod +x ./scripts/rs-init.sh` or `chmod +x ./web/scripts/env-init.sh` to make the shell files executables.

  Windows Users: If you come across this error `exec ./scripts/rs-init.sh: no such file or directory` or `exec ./scripts/env-init.sh: no such file or directory` when running the docker-compose command, please follow this [Stackoverflow thread](https://stackoverflow.com/questions/40452508/docker-error-on-an-entrypoint-script-no-such-file-or-directory) to fix it.



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
