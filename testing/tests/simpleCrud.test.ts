import { database } from "../database"
import Field from "../../src/field";
import ObjectModel from "../../src/objectModel"
import SimpleCrud from "../../src/simpleCrud"

interface User {

    id?: number;
    name: string;
    age: number;

    nameSplit: string[];
}

const model = new ObjectModel([
    new Field('id', 'INTEGER', ['PRIMARY KEY']),
    new Field('name', 'TEXT'),
    new Field('age', 'INTEGER')
]);

const crud = new SimpleCrud<User>(database, model, 'users',
    userBeforeInsert => {
        delete userBeforeInsert.nameSplit;
        return userBeforeInsert;
    },

    userAfterRead => {
        userAfterRead.nameSplit = userAfterRead.name.split(' ');
        return userAfterRead;
    }
);

const john: User = {
    name: 'John Test',
    age: 20,
    nameSplit: ['John', 'Test']
}

const mary: User = {
    name: 'Mary Test',
    age: 30,
    nameSplit: ['Mary', 'Test']
}

test('SimpleCrud', async () => {

    await crud.createTableIfNotExists();

    await crud.insert(john);

    let allData = await crud.getAll();
    
    expect(allData.length).toBe(1);
    expect(allData[0].nameSplit).toEqual(john.nameSplit);
    expect(allData[0].name).toEqual(john.name);
    expect(allData[0].age).toEqual(john.age);
    expect(allData[0].id).toBe(1)

    const newJohn = {
        name: 'John XYZ',
        age: 20,
        nameSplit: ['John', 'XYZ']
    }

    await crud.update({ name: 'John Test' }, {
        name: 'John XYZ'
    })

    allData = await crud.getAll();
    
    expect(allData.length).toBe(1);
    expect(allData[0].nameSplit).toEqual(newJohn.nameSplit);
    expect(allData[0].name).toEqual(newJohn.name);
    expect(allData[0].age).toEqual(newJohn.age);
    expect(allData[0].id).toBe(1)

    await crud.delete({ name: 'John XYZ' });

    allData = await crud.getAll();

    expect(allData.length).toBe(0);

    await crud.insertMultiple([
        mary,
        john
    ]);

    allData = await crud.getAll();

    expect(allData.length).toBe(2);

    const fetchJohn = await crud.get({ name: 'John Test' });
    const fetchMary = await crud.get({ name: 'Mary Test' });

    expect(fetchMary).toEqual(allData[0]);
    expect(fetchJohn).toEqual(allData[1]);

    await crud.update({ id: 1 }, { age: 20 })

    const search = await crud.getMultiple({ age: 20 })
    expect(search.length).toBe(2);

    await crud.update({ id: 1 }, { age: 45 })


    const deepSearch = await crud.deepSearch([
        {
            age: {
                value: 35,
                compare: '>'
            }
        },
        'AND', {
            name: {
                value: '%MARY%',
                compare: 'LIKE'
            }
        }
    ]);

    expect(deepSearch).toEqual([
        { id: 1, name: 'Mary Test', age: 45, nameSplit: [ 'Mary', 'Test' ] }
    ]);
    

    

});