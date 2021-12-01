import { database } from "../database"
import Field from "../../src/field";
import ObjectModel from "../../src/objectModel"
import SimpleCrud from "../../src/simpleCrud"

interface User {

    id?: number;
    name: string;
    age: number;
}

const model = new ObjectModel([
    new Field('id', 'INTEGER', ['PRIMARY KEY']),
    new Field('name', 'TEXT'),
    new Field('age', 'INTEGER')
]);

const crud = new SimpleCrud<User>(database, model, 'users');

describe('Test name filtering', () => {

    beforeAll(async () => {
        await crud.createTableIfNotExists();
    });

    test('Bad SQL identifier name filtering', () => {

        expect(() => {
            new Field('" or 1 = 1 --"', 'TEXT');
        }).toThrowError('Invalid field name!');

        expect(() => {
            new SimpleCrud(database, model, 'invalid table name');
        }).toThrowError('Invalid table name');

    });

    test('Column name filtering', async () => {

        const badUser: User & any = {
            name: 'John "this is a valid name as it is a parameter and will be escaped by the database library";',
            age: 18,
            '); DROP TABLE users; --': true
        }

        const badUserProto = {
            age: 20,
        }

        badUserProto['__proto__'] = {
            name: 'This name should not be considered, as it is not an object own property'
        }        

        const queries = []

        const oldPromise = database.promise;
        database.promise = (sql, params) => {
            queries.push(sql);
            return oldPromise(sql, params);
        };

        await crud.insert(badUser);
        await crud.insert(badUserProto as any);

        expect(queries[0]).toEqual('INSERT INTO users (name, age) VALUES (?, ?);');
        expect(queries[1]).toEqual('INSERT INTO users (age) VALUES (?);');

    });
})

