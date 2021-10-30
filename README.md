# GenericCrud
## Boilerplate and simple ORM for SQL databases.

* For setting up a new CRUD, instantiate the `SimpleCrud` class (or create your own class from `Crud` base):
	* First, the model object needs to be defined:
	*   ```ts 
        const userModel = new ObjectModel([
            new Field('id', 'INTEGER', ['PRIMARY KEY']),
            new Field('name', 'TEXT', ['NOT NULL']),
            new Field('email', 'TEXT'),
        ]);
        ```
	* Secondly, the Crud object needs to be created:
	*   ```ts
        const userCrud = new SimpleCrud<User>(database,  userModel,  'userTableName');
        ```
	* Documentation in progress... Check tests and `SimpleCrud` methods.
    * Note: If using JavaScript, create an instance of `SimpleCrud` without generics `<T>`, as it is only allowed in TypeScript.
