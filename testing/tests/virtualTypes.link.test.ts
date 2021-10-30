import { database } from "../database"
import Field from "../../src/field";
import ObjectModel from "../../src/objectModel"
import SimpleCrud from "../../src/simpleCrud"
import VirtualTypes from '../../src/virtualTypes';

interface School {
    id?: number;
    name: string;
}
const schoolModel = new ObjectModel([
    new Field('id', 'INTEGER', ['PRIMARY KEY']),
    new Field('name', 'TEXT')
]);
const schoolCrud = new SimpleCrud<School>(database, schoolModel, 'schools');


interface Student {

    id?: number;
    name: string;
    age: number;
    school: School;
}
const studentModel = new ObjectModel([
    new Field('id', 'INTEGER', ['PRIMARY KEY']),
    new Field('name', 'TEXT'),
    new Field('age', 'INTEGER'),
    new Field('school', new VirtualTypes.Link('name', 'TEXT', 'string', schoolCrud))
]);
const studentCrud = new SimpleCrud<Student>(database, studentModel, 'students');


const schoolA: School = {
    name: 'School A'
}

const schoolB: School = {
    name: 'School B'
}

const john: Student = {
    name: 'John Student',
    age: 15,
    school: schoolA
}

const matt: Student = {
    name: 'Matt Student',
    age: 16,
    school: schoolA
}

const edward: Student = {
    name: 'Edward Student',
    age: 18,
    school: schoolB
}

test('SimpleCrud', async () => {

    await schoolCrud.createTableIfNotExists();
    await studentCrud.createTableIfNotExists();

    await schoolCrud.insertMultiple([
        schoolA,
        schoolB
    ]);

    await studentCrud.insertMultiple([
        john,
        matt,
        edward
    ]);


    const dbJohn = await studentCrud.get({ name: john.name });
    const dbMatt = await studentCrud.get({ name: matt.name });
    const dbEdward = await studentCrud.get({ name: edward.name });

    function compareStudent(dbStudent: Student, refStudent: Student) {
        expect(dbStudent.age).toEqual(refStudent.age);
        expect(dbStudent.name).toEqual(refStudent.name);
        expect(dbStudent.school.name).toEqual(refStudent.school.name);
    }

    compareStudent(dbJohn, john);
    compareStudent(dbMatt, matt);
    compareStudent(dbEdward, edward);

});