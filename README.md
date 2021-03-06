![CI](https://github.com/isaqueks/liteORM/actions/workflows/integrate.yml/badge.svg)

# LiteORM
LiteORM is a simple, but powerful and fast Object-Relational-Mapper for NodeJS.

## LiteORM features:
 - Fast, simple and eazy to use/setup
 - Virtual types and data processing (E.g: `VirtualTypes.Object` will convert objects to plain text JSON before sending to database and will parse the JSON when reading from database)
 - Support for extensions: LiteORM is very eazy to extend and customize
 - Data linking: `VirtualTypes.Link` can link objects between tables
 - Customized search queries: You can search for data in a object-oriented form
 - Custom I/O handlers: You can define input and output handlers, which are functions that will be called for objects before inserting/reading from the database

## Installing:
 I will publish it to NPM soon, but for now, install it from GitHub:   
 `npm i https://github.com/isaqueks/liteORM.git#release`    
 ⚠️ Be sure to use version `2.2.0` or higher, as an SQL Injection vulnerability was fixed in this version.

## Example usage
 For this example, I'll demonstrate how to create a simple User crud:

 1. Define the `User` type: (You can skip this step if not using TypeScript):

    ```ts
    interface User {
        id?: number;
        name: string;
        age: number;
    }
    ```  
2. Create the model:  
    The model is the schema that will instruct LiteORM how to map a object to a SQL table:

    ```ts
    const model = new ObjectModel([
        new Field('id', 'INTEGER', ['PRIMARY KEY']),
        new Field('name', 'TEXT'),
        new Field('age', 'INTEGER')
    ]);
    ```
    In this step, you should specify the Fields types and attributes according to the database you are using. Each `Field` is like a column, and it's name (the first constructor argument) should be the same as the corresponding object property. 

 3. Create the CRUD:  
 The `Crud` object is like a repository and will contain all the ORM logic. You can extend the ORM logic by creating a custom crud class, which should inherit the `Crud` class. By default, LiteORM provides the `SimpleCrud` class, which I am going to use here:

    ```ts
    const userCrud = new SimpleCrud<User>(<database connection here>, model, 'userTable');
    ```
    The **first argument** is the database connection. It should provide a `promise(sql: string, params: any[])` method. If yout database connection doesn't provide a `promise` method (which is very likely to happen), continue reading that I will show how to create a wrapper object in the next steps.
    The **second argument** is the model, which we created in the step 2. The **third argument** is the table name, exactly how it is going to be created.

4. Use LiteORM  
All the required setup is done, now I will show how to use `LiteORM` for inserting/fetching data from the database.

## Using LiteORM
 In this section, I will show some basic functionality with examples. I will use the `userCrud` as example, which I showed in the previous section. This is not the technical documentation.

 1. Creating the table:

    ```ts
    userCrud.setup();
    ```

2. Inserting data:

    ```ts
    const demoUser = {
        name: 'John',
        age: 30
        // id, which is the primary key, will be automatically defined
    }

    userCrud.insert(demoUser);
    ```

    For inserting an array of users:  
    ```ts
    userCrud.insertMultiple(arrayOfUsers);
    ```
    ⚠️ `insertMultiple` will create a query for every array item!

 3. Fetching data:

    ```ts
    const john = await userCrud.get({ name: 'John' });
    ```
    The first param is the data to search for. We want to search for data `where name = 'John'`.

 4. Updating data:

    ```ts
    userCrud.update({ name: 'John' }, { age: 25 });
    ```
    The first param is the data used to determine which rows should be updated (`Where name = 'John'`), and the second is the data to update (`Set age = 25`).

 5. Deleting data:
 
    ```ts
    userCrud.delete({ name: 'John' });
    ```

 6. Searching for data:

    Let's suppose we want to fetch users whose name is like `John` and age is higher than 18:

    ```ts
    const searchResult = await userCrud.search([
        {
            name: {
                value: '%John%',
                compare: 'LIKE'
            }
        },
        'AND', {
            age: {
                value: 18,
                compare: '>'
            }
        }
    ]);
    ```
    I will provide more details about it in the technical documentation.  
    ⚠️ Parameter binding is used with `value`, however `compare` values 
    will be directly concatenated into the query.

 7. Creating a database wrapper:
    As I mentioned before, the first argument `SimpleCrud` constructor requires is a database connection object. This object needs to have a specific `promise` method, which is very likely to not match the connection object you are using. In this case, you need to create a database conection wrapper object, like this:

    ```ts
    const dbConnection = {
        promise: (query: string, params: any[]) => {
            return new Promise((resolve, reject) => {
                // Most databases connection have an "all" method, 
                // but if yours don't, change it according to your database

			    yourActualDatabase.all(query, params, (err, data) => {
					if (err) {
                        reject(err);
                    }
					else {
                        resolve(data);
                    }
				});
			});
        }

    }
    ```
    The `promise` method must:   
        1. Return a `Promise<any[]>`  
        2. Accept a SQL string as first argument  
        3. Accept an array contaning the parameters as second argument.

    Done, now you can use this `dbConnection` object.


## Should I use LiteORM?
 LiteORM was created by me for me. I created LiteORM because I didn't want to manually type the SQL queries and mix SQL with TypeScript. Idk why I didn't used an existing ORM, but here it is.
 It doesn't mean you can't use. It means it solves my problems.   
 LiteORM isn't very mature, however it's faster and simpler than most ORMs.  
 **But should I used it or not?**  
 I encourage you to test it and compare with other ORMs. If it fit's and solve your
 project's needs, off course, use it.


## Which databases works with LiteORM?
 It is primarily created for `SQLite`, but should work with most SQL databases, as long as you define the correct types and attributes when creating the fields. LiteORM uses [PowerSQL](https://github.com/isaqueks/powersql) (A SQL query builder I made) for creating the queries. PowerSQL was primarily designed for SQLite too, but the final queries it generates really depends on how it's used, as it's simply a query builder. However, a compatibillity issue with other databases can exist, and if it does, report it here on GitHub issues.

## Security notes:
 1. LiteORM itself does not do any parameter binding. It builds a query with placeholders and passes the parameters to your database library, so how the parameter binding is made, really depends on the database library you are using (which is great on most cases). This is not a problem for most databses libraries as most of them supports parameter binding very well.
 2. SQL identifiers (table, column names) are validated, however these values are directly concatenated to the query. If you attempt to name a table `I AM A "COOL" TABLE;`, an error will be thrown due to the bad name. 
 3. The `SimpleCrud` class will ignore the object `__proto__` when using methods like `insert` or `update`, so be sure to have the relevant properties defined as the object own properties. Also, properties that are not defined in the model will be ignored and not added to the query. A past (already fixed) SQL injection vulnerability was possible due to this feature bug.
 4. It is **always** a good practice to validate user input. So, be sure to validate all user input before doing anythin with it. You can use a JSON validator for validating objects.
 5. LiteORM, as any other library or system, shouldn't but MAY contain security vulnerabilities and bugs. If you find any, please report it immediately and I will fix it ASAP.