# Project Structure

> `public` folder:
contains the static files such as images, fonts, i18n, etc.

---

> `src` folder:

`api`: base api used across the entire application

`components`: shared components used across the entire application

`layouts`: Next's layout components

`config`: all the global configuration, constants env variables,...

`features`: read more below

`hooks`: shared hooks used across the entire application

`lib`  : re-exporting different libraries preconfigured for the application

`context`: shared context used across the entire application

`pages`: pages

`stores`: global state stores

`test`: test utilities and mock server, __mocks__ folders and pages's tests could be put here

`types`: base types used across the application

`utils`: shared utility functions

---

> `features` folder allow you to keep functionalities scoped to a feature and not mix its declarations with shared things. For example, `features/auth` could contains:


`api`: extends the base api, scoped to a specific feature

`components`: components scoped to a specific feature

`hooks`: hooks scoped to a specific feature

`pages`: page components for a specific feature pages

`stores`: state stores for a specific feature

`types`: typescript types for TS specific feature

`utils`: utility functions for a specific feature

`index.ts`: entry point for the feature and exports everything that should be used outside the feature.


---

> Import from features folder by using:

`import {LoginRoute} from "@/features/auth"`

> NOT:

`import {LoginRoute} from "@/features/auth/routes/LoginRoute`
