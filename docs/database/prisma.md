# How use Prisma in code:
- configure the variable `DATABASE_URL` in `.env` to your local instance of postgresql 
  - see `.env` for how the url is to be structured
- import the prisma client from `server/src/db/prisma.ts`
- import any additional types (like prof_role or status)
- perform CRUD operations of this scheme: `await prisma.<table_name>.<CRUD_operation>(query_object)`
  - there are many operations for similar things
  - example can be found in: `server/src/models/example.prisma.ts` 
  - below is a minimal description of the `query_object` (of sorts)


## The object passed to prisma: i.e. the query
```
{//note these curly brackets
    data: {<new_Data} | [<list_of_new_data>] // data to be created/updated
    where: { <column> : <value> OR (<other_query>) } // condition that applies to certain rows
    select: { <column> : <boolean> } // return these columns
    include: { <other_query> } // join methdo --> look into it
    take: <number> // limit num of rows
}//note these curly brackets
``` 

## Issues I had when configuring, that might show up again
**Issue:**<br>
1. The `prisma.ts` file was loading and executing before the `example.prisma.ts` file (the latter was importing the former), which caused the `process.env.DATABASE_URL` to be undefined. This was due to the fact that imports are 'hoisted' and executed before the code in the importing file.
2. Additionally, I had issues with the current working directory & the execution file, this somehow messed up the injection of the `process.env` variables.

**Solutions:**<br>
1. using a `bootstrap.ts` file in the parent dir (in this case: `server/`) and imported that file first, this caused it to be executed before anything else.
2. defined the run config to run in the `server/` dir and the execution file to be: `src/models/example.prisma.ts`

# How to use Prisma not in code:
*general structure:*
```
model table{
  column datatype optional_tags(like @id @default(autoincrement()) --> pk w/ auto increase)
}
```
- change `schema.prisma`
- enter the cmd: `npx prisma migrate dev`
  - enter a name of the new DB version

# Populating/Seeding the DB for Development

for development the DB was populated with the help of chatgpt:<br>
[ChatGPT chat that generated the data](https://chatgpt.com/share/69ecf527-8d6c-83eb-b7a8-6e8d198dc166)

**The activities currently in the DB DO NOT REFLECT / ARE ACTUAL ACTIVITIES**
- look at the `seed.ts` file in the prisma folder (should be next to the `schema.prisma` file) 

## Outdate Column Names
*[fix found through chatgpt](https://chatgpt.com/share/69ecfc61-1864-83eb-8780-7710cd9c667f)*
If the IDE complains that you are using the incorrect name of a column:
1. check that your using the correct name according to `schema.prisma`
2. check that your using the correct name according to the actual DB, by checking for example in `pgAdmin`
3. if you are using the correct name run `npx prisma generate`

## incorrect ids
*also from chatgpt, see first link*
if a, for example foreign key restraint is thrown due to mismatching ids, reset the id count by entering:<br>
`npx prisma migrate reset`


# How to set up development database
**Checklist:**
- PostgreSQL installed?
- Prisma packages installed?
  - prisma
  - @types/pg
  - pg
  - @prisma/client
  - @prisma/adapter-pg <br>
    <br>
    (the prisma stuff should already be in the `package.json` of the backend, the IDE should recognize any uninstalled packages and suggest installing them)

## If not installed:
**Prisma Packages:**
```
npm install prisma @types/pg --save-dev
npm install pg @prisma/client @prisma/adapter-pg
```
pg --> postgres package <br>

**PostgreSQL:**<br>
[General Installation Instructions](https://www.postgresql.org/download/)<br>
[Windows Instructions](https://www.postgresql.org/download/windows/)<br>

Only really need the PostgreSQL Server to run DB. <br>
## Commands to run & other stuff to do:
**in the `server/.env` file**<br>
configure DB-URL to something like this: `DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/hkif_dev?schema=public"` <br>
the `schema=public` is not strictly necessary (as its the default schema)<br>
the user `johndoe:randompassword` was configured during the installation process of PostgreSQL (server) <br>

**prisma**
**VERY IMPORTANT: CHANGE INTO SERVER DIRECTORY ON THE COMMAND LINE BEFORE RUNNING THESE COMMANDS**

`npx prisma generate` --> generates boilerplate code (is added to `.gitignore` by default) <br>
`npx prisma db seed` --> populates the database with mock data (code found in `server/prisma/seed.ts`) <br>
## If something doesn't work, pls msg me


