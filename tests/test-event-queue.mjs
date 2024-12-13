import sinon from 'sinon';
import {setupTestContext} from "../test/setupTestContext.mjs";
import {EventQueue} from "../utils/EventQueue.mjs";

const {
    expect,
    it,
    describe,
    beforeEach
} = setupTestContext();


describe('EventQueue', () => {
    let emitter;
    let eventQueue;

    beforeEach(() => {
        emitter = {
            onAny: sinon.spy(),
            on: sinon.spy(),
            waitOn: sinon.stub()
        };
        eventQueue = new EventQueue(emitter);
    });

    describe('initialize()', () => {
        it('should attach onAny listener to emitter', () => {
            eventQueue.all();
            expect(emitter.onAny.calledOnce).to.be.true;
            expect(emitter.onAny.firstCall.args[0]).to.be.a('function');
        });

        it('should push events to #events when an event is emitted', () => {
            eventQueue.all();
            const [listener] = emitter.onAny.firstCall.args;

            // Simulate an event emission
            listener('testEvent', 'data1', 'data2');
            const dequeuedData = eventQueue.dequeue('testEvent');
            expect(dequeuedData).to.deep.equal(['data1', 'data2']);
        });
    });

    describe('clear()', () => {
        beforeEach(() => {
            eventQueue.all();
            const [listener] = emitter.onAny.firstCall.args;
            listener('event1', 'data1');
            listener('event2', 'data2');
        });

        it('should clear specific event', () => {
            eventQueue.clear('event1');
            expect(eventQueue.dequeue('event1')).to.be.undefined;
            expect(eventQueue.dequeue('event2')).to.deep.equal(['data2']);
        });

        it('should clear all events when no event name is provided', () => {
            eventQueue.clear();
            expect(eventQueue.dequeue('event1')).to.be.undefined;
            expect(eventQueue.dequeue('event2')).to.be.undefined;
        });
    });

    describe('dequeue()', () => {
        it('should return undefined if the event queue is empty', () => {
            const result = eventQueue.dequeue('nonexistentEvent');
            expect(result).to.be.undefined;
        });

        it('should return the first event data for a specific event', () => {
            eventQueue.all();
            const [listener] = emitter.onAny.firstCall.args;
            listener('testEvent', 'data1');
            listener('testEvent', 'data2');

            const result = eventQueue.dequeue('testEvent');
            expect(result).to.deep.equal(['data1']);
        });
    });

    describe('waitDequeue()', () => {
        it('should return data immediately if it exists in the queue', async () => {
            eventQueue.all();
            const [listener] = emitter.onAny.firstCall.args;
            listener('testEvent', 'data1');

            const result = await eventQueue.waitDequeue('testEvent');
            expect(result).to.deep.equal(['data1']);
        });

        it('should wait for data if it does not exist in the queue', async () => {
            const deferred = new Promise((resolve) => {
                emitter.waitOn.withArgs('testEvent').returns(Promise.resolve(['data2']));
                resolve();
            });

            const result = await eventQueue.waitDequeue('testEvent');
            expect(result).to.deep.equal(['data2']);
            await deferred;
        });
    });

    describe('integration tests', () => {
        it('should handle multiple events and clear appropriately', async () => {
            eventQueue.all();
            const [listener] = emitter.onAny.firstCall.args;

            // Emit events
            listener('event1', 'data1');
            listener('event1', 'data2');
            listener('event2', 'data3');

            expect(eventQueue.dequeue('event1')).to.deep.equal(['data1']);
            expect(eventQueue.dequeue('event1')).to.deep.equal(['data2']);
            expect(eventQueue.dequeue('event2')).to.deep.equal(['data3']);
            expect(eventQueue.dequeue('event1')).to.be.undefined;

            // Clear all
            eventQueue.clear();
            expect(eventQueue.dequeue('event1')).to.be.undefined;
            expect(eventQueue.dequeue('event2')).to.be.undefined;
        });
    });

    describe('Specific event', ()=>{
        it('should push specific event to #events when an event is emitted', () => {
            eventQueue.listen('testEvent');
            const [event, listener] = emitter.on.firstCall.args;

            // Simulate an event emission
            listener('data1', 'data2');
            const dequeuedData = eventQueue.dequeue('testEvent');
            expect(dequeuedData).to.deep.equal(['data1', 'data2']);
        });
    })
});
