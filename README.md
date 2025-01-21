# Focus GA

## Development Setup

- Install [Node.js](https://nodejs.org/en/download/package-manager)
- Install and enable [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) in VSCode
- Install [MongoDB Community Server](https://www.mongodb.com/docs/manual/administration/install-community/) to host a local instance of MongoDB. 
- Download the [MongoDB Compass](https://www.mongodb.com/try/download/compass#compass) UI to view the state of your database as well.
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
- Within your local deployment, you can login with credentials formatted like so:
  - Username: \[string]@\[string].\[string]
  - Password: \[string]

- For Salesforce authentication, we have a FOCUS account so please reach out to the EM if that is needed

## Tech Stack

- Next.js (frontend + backend)
- Tailwind CSS (styling)
- MongoDB (database)
- Zod (type validation)
- Salesforce (auth + account integration)

## Troubleshooting

This section is meant for resolving issues that have previously been encountered and fixed. If you encounter an issue that isn't on this list, please inform your EM.

<br>

### Issue: `MongoServerError[NotPrimaryOrSecondary]: node is not in primary or recovering state`

**Resolution:**

Run the following command in your MongoDB shell:

```sh
rs.initiate()
```
<br>

### Issue: No content in the website

**Resolution:**

Run the following POST command in Postman after connecting to the database:

```sh
http://localhost:3000/api/seeder
```
<br>

### Issue: `Error: iron-session: Bad usage. Missing password.`

**Resolution:**

Verify your .env file contains the correct MONGO_URI connection string, found in the product@bitsofgood.org [Bitwarden](https://bitwarden.com/), under the FOCUS tab .env file.

<br>

### Issue: `Error: Module not found: Can't resolve '...'`
**Resolution:**

cd to the the directory where you have cloned the FOCUS repository, and run `npm i`

