# YASEC - Yet Another Simple Execution Queue

## Why use this module?

Sometimes you need to be sure you awaited a promise before starting a new one. For example.

```typescript
router.get('/', async (req, res) => {
	await saveToDatabase(req.body);
	res.send();
});
```

If I send a second request before the first has returned me a response, there is a huge chance I would be trying to write to the database while the first transaction is still being written. This could result in a Disk I/O error since the database is not ready for another write.

This module solves this issue by creating a queue of tasks that are assured to be ran in order. The task in position `n` will only run when the task in position `n-1` is completed.

## How to use

```typescript
import { createTaskQueue } from 'yasec';

const taskQueue = createTaskQueue();

// simple tasks for demonstration
const task1 = () => {
	return new Promise(resolve => {
		console.log('started execution of task1');
		setTimeout(() => resolve('task1 completed'), 1500);
	});
};

const task2 = () => {
	return new Promise(resolve => {
		console.log('started execution of task2');

		setTimeout(() => resolve('task2 completed'), 1000);
	});
};

// Normal flow;
task1().then(console.log);
task2().then(console.log);

/**[OUTPUT IN THE CONSOLE]
 * started execution of task1
 * started execution of task2
 * task2 completed
 * task1 completed
 */

// Queued flow
taskQueue.awaitExecution(task1).then(console.log);
taskQueue.awaitExecution(task2).then(console.log);

/**[OUTPUT IN THE CONSOLE]
 * started execution of task1
 * task1 completed
 * started execution of task2
 * task2 completed
 */
```

## But isn't just like awaiting the promises?

If we are talking about a single function, yes. Writing this...

```typescript
taskQueue.awaitExecution(task1).then(console.log);
taskQueue.awaitExecution(task2).then(console.log);
```

is no different than writing this...

```typescript
await task1();
await task2();
```

However, as a system grows, there might be a lot of places in the code that might trigger those promises instead of a single function. This is specially true in an event driven architecture, since the events usually don't get ignored while a promise is being awaited. Is therefore useful to pipe all the sensitive promises to the queue in order for them to run one after another.
