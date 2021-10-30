import { database } from "../database"
import Field from "../../src/field";
import ObjectModel from "../../src/objectModel"
import SimpleCrud from "../../src/simpleCrud"
import VirtualTypes from '../../src/virtualTypes';

interface User {

    id?: number;
    name: string;
    age: number;
    children?: User[];
}

const model = new ObjectModel([
    new Field('id', 'INTEGER', ['PRIMARY KEY']),
    new Field('name', 'TEXT'),
    new Field('age', 'INTEGER'),
    new Field('children', new VirtualTypes.Object<User[]>())
]);

const crud = new SimpleCrud<User>(database, model, 'users');

const john: User = {
    name: 'John Test',
    age: 20,
}

const matt: User = {
    name: 'Matt Test',
    age: 17,
}

const mary: User = {
    name: 'Mary Test',
    age: 40,
    children: [
        john,
        matt
    ]
}

test('SimpleCrud', async () => {

    await crud.createTableIfNotExists();

    // Mary is mom of John and Matt
    await crud.insert(mary);
    
    const dbMary = await crud.get({ name: 'Mary Test' });
    
    expect(dbMary.name).toEqual(mary.name);
    expect(dbMary.age).toEqual(mary.age);
    expect(dbMary.children).toEqual(mary.children);

});