const chai = require('chai');

const DoubleLinkedList = artifacts.require('./DoubleLinkedList.sol');
const { itShouldThrow } = require('./utils');
chai.should();

const emptyData = '0x0000000000000000000000000000000000000000'
const headData = '0x0000000000000000000000000000000000000001'
const middleData = '0x0000000000000000000000000000000000000002'
const tailData = '0x0000000000000000000000000000000000000003'

/** @test {DoubleLinkedList} contract */
contract('DoubleLinkedList - add', (accounts) => {

    let doubleLinkedList;

    beforeEach(async () => {
        doubleLinkedList = await DoubleLinkedList.new();
    });

    /**
     * Test the two contract methods
     * @test {DoubleLinkedList#set} and {DoubleLinkedList#get}
     */
    it('Constructor variables.', async () => {
        ((await doubleLinkedList.idCounter.call()).toNumber()).should.be.equal(1);
    });

    it('get on a non existing object returns (0,0,0,0).', async () => {
        const result = (await doubleLinkedList.get(0));
        result[0].toNumber().should.be.equal(0);
        result[1].toNumber().should.be.equal(0);
        result[2].toNumber().should.be.equal(0);
        result[3].should.be.equal(emptyData);
    });

    it('adds an object at the head - event emission.', async () => {
        const objectEvent = (
            await doubleLinkedList.addHead(headData)
        ).logs[0];
        objectEvent.args.id.toNumber().should.be.equal(1);
        objectEvent.args.data.should.be.equal(headData);
    });

    it('adds an object at the head - data storage.', async () => {
        const objectId = (
            await doubleLinkedList.addHead(headData)
        ).logs[0].args.id.toNumber();
        
        const result = (await doubleLinkedList.get(objectId));
        result[0].toNumber().should.be.equal(objectId);
        result[1].toNumber().should.be.equal(0);
        result[2].toNumber().should.be.equal(0);
        result[3].should.be.equal(headData);
    });

    it('adds two objects from the head.', async () => {
        const objectOneId = (
            await doubleLinkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const objectTwoId = (
            await doubleLinkedList.addHead(headData)
        ).logs[0].args.id.toNumber();

        const objectOne = (await doubleLinkedList.get(objectOneId));
        objectOne[0].toNumber().should.be.equal(objectOneId);
        objectOne[1].toNumber().should.be.equal(0);
        objectOne[2].toNumber().should.be.equal(objectTwoId);
        objectOne[3].should.be.equal(middleData);

        const objectTwo = (await doubleLinkedList.get(objectTwoId));
        objectTwo[0].toNumber().should.be.equal(objectTwoId);
        objectTwo[1].toNumber().should.be.equal(objectOneId);
        objectTwo[2].toNumber().should.be.equal(0);
        objectTwo[3].should.be.equal(headData);

        ((await doubleLinkedList.head.call()).toNumber()).should.be.equal(objectTwoId);
    });

    it('adds an object at the tail - event emission.', async () => {
        const objectEvent = (
            await doubleLinkedList.addTail(headData)
        ).logs[0];
        objectEvent.args.id.toNumber().should.be.equal(1);
        objectEvent.args.data.should.be.equal(headData);
    });

    it('adds an object at the tail - data storage.', async () => {
        const objectId = (
            await doubleLinkedList.addTail(headData)
        ).logs[0].args.id.toNumber();
        
        const result = (await doubleLinkedList.get(objectId));
        result[0].toNumber().should.be.equal(objectId);
        result[1].toNumber().should.be.equal(0);
        result[2].toNumber().should.be.equal(0);
        result[3].should.be.equal(headData);
    });

    it('adds two objects from the tail.', async () => {
        const objectOneId = (
            await doubleLinkedList.addTail(middleData)
        ).logs[0].args.id.toNumber();
        const objectTwoId = (
            await doubleLinkedList.addTail(headData)
        ).logs[0].args.id.toNumber();

        const objectOne = (await doubleLinkedList.get(objectOneId));
        objectOne[0].toNumber().should.be.equal(objectOneId);
        objectOne[1].toNumber().should.be.equal(objectTwoId);
        objectOne[2].toNumber().should.be.equal(0);
        objectOne[3].should.be.equal(middleData);

        const objectTwo = (await doubleLinkedList.get(objectTwoId));
        objectTwo[0].toNumber().should.be.equal(objectTwoId);
        objectTwo[1].toNumber().should.be.equal(0);
        objectTwo[2].toNumber().should.be.equal(objectOneId);
        objectTwo[3].should.be.equal(headData);

        ((await doubleLinkedList.head.call()).toNumber()).should.be.equal(objectOneId);
    });
});

contract('doubleLinkedList - find', (accounts) => {

    let doubleLinkedList;
    let headId;
    let middleId;
    let tailId;

    beforeEach(async () => {
        doubleLinkedList = await DoubleLinkedList.new();
        tailId = (
            await doubleLinkedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        middleId = (
            await doubleLinkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        headId = (
            await doubleLinkedList.addHead(headData)
        ).logs[0].args.id.toNumber();
    });

    it('finds an id for given data.', async () => {
        let resultId = (await doubleLinkedList.findIdForData(headData));
        resultId.toNumber().should.be.equal(headId);
        resultId = (await doubleLinkedList.findIdForData(middleData));
        resultId.toNumber().should.be.equal(middleId);
        resultId = (await doubleLinkedList.findIdForData(tailData));
        resultId.toNumber().should.be.equal(tailId);
    });
});

/** @test {doubleLinkedList} contract */
contract('doubleLinkedList - remove', (accounts) => {

    let doubleLinkedList;
    let headId;
    let middleId;
    let tailId;

    beforeEach(async () => {
        doubleLinkedList = await DoubleLinkedList.new();
        tailId = (
            await doubleLinkedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        middleId = (
            await doubleLinkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        headId = (
            await doubleLinkedList.addHead(headData)
        ).logs[0].args.id.toNumber();

    });

    it('removes the head.', async () => {
        const removedId = (
            await doubleLinkedList.remove(headId)
        ).logs[1].args.id.toNumber();
        ((await doubleLinkedList.head.call()).toNumber()).should.be.equal(middleId);

        const middleObject = (await doubleLinkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].toNumber().should.be.equal(0);
        middleObject[3].should.be.equal(middleData);

        const tailObject = (await doubleLinkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].toNumber().should.be.equal(middleId);
        tailObject[3].should.be.equal(tailData);
    });

    it('removes the tail.', async () => {
        const removedId = (
            await doubleLinkedList.remove(tailId)
        ).logs[1].args.id.toNumber();
        ((await doubleLinkedList.head.call()).toNumber()).should.be.equal(headId);

        const headObject = (await doubleLinkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].toNumber().should.be.equal(0);
        headObject[3].should.be.equal(headData);

        const middleObject = (await doubleLinkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(0);
        middleObject[2].toNumber().should.be.equal(headId);
        middleObject[3].should.be.equal(middleData);
    });

    it('removes the middle.', async () => {
        const removedId = (
            await doubleLinkedList.remove(middleId)
        ).logs[1].args.id.toNumber();
        ((await doubleLinkedList.head.call()).toNumber()).should.be.equal(headId);

        const headObject = (await doubleLinkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(tailId);
        headObject[2].toNumber().should.be.equal(0);
        headObject[3].should.be.equal(headData);

        const tailObject = (await doubleLinkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].toNumber().should.be.equal(headId);
        tailObject[3].should.be.equal(tailData);
    });
});

/** @test {doubleLinkedList} contract */
contract('doubleLinkedList - insert', (accounts) => {

    const insertedData = '0x0000000000000000000000000000000000000004'

    let doubleLinkedList;
    let headId;
    let middleId;
    let tailId;

    beforeEach(async () => {
        doubleLinkedList = await DoubleLinkedList.new();
        tailId = (
            await doubleLinkedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        middleId = (
            await doubleLinkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        headId = (
            await doubleLinkedList.addHead(headData)
        ).logs[0].args.id.toNumber();

    });

    it('inserts after the head.', async () => {
        const insertedId = (
            await doubleLinkedList.insertAfter(headId, insertedData)
        ).logs[0].args.id.toNumber();
        ((await doubleLinkedList.head.call()).toNumber()).should.be.equal(headId);

        const headObject = (await doubleLinkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(insertedId);
        headObject[2].toNumber().should.be.equal(0);
        headObject[3].should.be.equal(headData);

        const insertedObject = (await doubleLinkedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(middleId);
        insertedObject[2].toNumber().should.be.equal(headId);
        insertedObject[3].should.be.equal(insertedData);

        const middleObject = (await doubleLinkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].toNumber().should.be.equal(insertedId);
        middleObject[3].should.be.equal(middleData);

        const tailObject = (await doubleLinkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].toNumber().should.be.equal(middleId);
        tailObject[3].should.be.equal(tailData);
    });

    it('inserts after the tail.', async () => {
        const insertedId = (
            await doubleLinkedList.insertAfter(tailId, insertedData)
        ).logs[0].args.id.toNumber();
        ((await doubleLinkedList.head.call()).toNumber()).should.be.equal(headId);

        const headObject = (await doubleLinkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].toNumber().should.be.equal(0);
        headObject[3].should.be.equal(headData);

        const middleObject = (await doubleLinkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].toNumber().should.be.equal(headId);
        middleObject[3].should.be.equal(middleData);

        const tailObject = (await doubleLinkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(insertedId);
        tailObject[2].toNumber().should.be.equal(middleId);
        tailObject[3].should.be.equal(tailData);

        const insertedObject = (await doubleLinkedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(0);
        insertedObject[2].toNumber().should.be.equal(tailId);
        insertedObject[3].should.be.equal(insertedData);
    });

    it('inserts after the middle.', async () => {
        const insertedId = (
            await doubleLinkedList.insertAfter(middleId, insertedData)
        ).logs[0].args.id.toNumber();
        ((await doubleLinkedList.head.call()).toNumber()).should.be.equal(headId);

        const headObject = (await doubleLinkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].toNumber().should.be.equal(0);
        headObject[3].should.be.equal(headData);

        const middleObject = (await doubleLinkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(insertedId);
        middleObject[2].toNumber().should.be.equal(headId);
        middleObject[3].should.be.equal(middleData);

        const insertedObject = (await doubleLinkedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(tailId);
        insertedObject[2].toNumber().should.be.equal(middleId);
        insertedObject[3].should.be.equal(insertedData);

        const tailObject = (await doubleLinkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].toNumber().should.be.equal(insertedId);
        tailObject[3].should.be.equal(tailData);
    });

    it('inserts before the head.', async () => {
        const insertedId = (
            await doubleLinkedList.insertBefore(headId, insertedData)
        ).logs[0].args.id.toNumber();
        ((await doubleLinkedList.head.call()).toNumber()).should.be.equal(insertedId);

        const insertedObject = (await doubleLinkedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(headId);
        insertedObject[2].toNumber().should.be.equal(0);
        insertedObject[3].should.be.equal(insertedData);

        const headObject = (await doubleLinkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].toNumber().should.be.equal(insertedId);
        headObject[3].should.be.equal(headData);

        const middleObject = (await doubleLinkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].toNumber().should.be.equal(headId);
        middleObject[3].should.be.equal(middleData);

        const tailObject = (await doubleLinkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].toNumber().should.be.equal(middleId);
        tailObject[3].should.be.equal(tailData);
    });

    it('inserts before the tail.', async () => {
        const insertedId = (
            await doubleLinkedList.insertBefore(tailId, insertedData)
        ).logs[0].args.id.toNumber();
        ((await doubleLinkedList.head.call()).toNumber()).should.be.equal(headId);

        const headObject = (await doubleLinkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].toNumber().should.be.equal(0);
        headObject[3].should.be.equal(headData);

        const middleObject = (await doubleLinkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(insertedId);
        middleObject[2].toNumber().should.be.equal(headId);
        middleObject[3].should.be.equal(middleData);

        const insertedObject = (await doubleLinkedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(tailId);
        insertedObject[2].toNumber().should.be.equal(middleId);
        insertedObject[3].should.be.equal(insertedData);

        const tailObject = (await doubleLinkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].toNumber().should.be.equal(insertedId);
        tailObject[3].should.be.equal(tailData);
    });

    it('inserts before the middle.', async () => {
        const insertedId = (
            await doubleLinkedList.insertBefore(middleId, insertedData)
        ).logs[0].args.id.toNumber();
        ((await doubleLinkedList.head.call()).toNumber()).should.be.equal(headId);

        const headObject = (await doubleLinkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(insertedId);
        headObject[2].toNumber().should.be.equal(0);
        headObject[3].should.be.equal(headData);

        const insertedObject = (await doubleLinkedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(middleId);
        insertedObject[2].toNumber().should.be.equal(headId);
        insertedObject[3].should.be.equal(insertedData);

        const middleObject = (await doubleLinkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].toNumber().should.be.equal(insertedId);
        middleObject[3].should.be.equal(middleData);

        const tailObject = (await doubleLinkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].toNumber().should.be.equal(middleId);
        tailObject[3].should.be.equal(tailData);
    });
});