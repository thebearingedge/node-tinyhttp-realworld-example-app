# Contributing

Contributions are always welcome, here's an instruction of how to contribute.

## Local setup

### Install

- Clone the repo first:

```sh
# git
git clone https://github.com/thebearingedge/node-tinyhttp-realworld-example-app.git

# (or) hub
hub clone thebearingedge/node-tinyhttp-realworld-example-app
```

- Install Node.js (v14 is recommended because tests use `fs/promises`) and `pnpm`:

```sh
# Install fnm
curl -fsSL https://github.com/Schniz/fnm/raw/master/.ci/install.sh | bash

# Install v14 Node.js version
fnm install v14.17
fnm use v14.17

# or just simply this because there is an .nvmrc file
fnm use
```

- Install the dependencies at root and in the packages:
```sh
npm install
```

- Start the PostgreSQL docker container
```sh
npm run db:start
```

- Migrate Prisma schema to PostgreSQL
```sh
npm run db:push
```

- Run a local server
```sh
npm run dev
```

- Run a [test driven development](https://en.wikipedia.org/wiki/Test-driven_development) local server
```sh
npm run tdd
```

### Formatting

If you use VS Code, please install Prettier and ESLint plugins for proper linting and code formatting.

If you use a text editor that doesn't have Prettier integration, you can run `npm run lint`

## Submitting PRs

### General rules

Here's a small list of requirements for your PR:

- it should be linted and formatted properly using configurations in the root
- it should build without errors and warnings (except edge cases)
- it should have been tested
- PR must have a clear description of what it does, which part of the repo it affects
- if PR is adding a new middleware, it should have an example in the description.

If everything from the list is done right, feel free to submit a PR! I will look into it asap.

If some further assistance before making a PR is needed, please open an issue regarding your problem.