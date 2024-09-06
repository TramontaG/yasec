type Executor = () => Promise<void>;

export const createTaskQueue = () => {
	let taskQueue: Executor[] = [];
	let empty = true;

	const startExecution = async () => {
		for await (const task of taskQueue) {
			await task();
		}

		empty = true;
		taskQueue = [];
	};

	const awaitExecution = <Ret>(task: () => Promise<Ret>): Promise<Ret> => {
		return new Promise((resolve, reject) => {
			let executor = () =>
				task()
					.then(result => {
						resolve(result);
					})
					.catch(err => reject(err));

			taskQueue.push(executor);

			if (empty) {
				empty = false;
				startExecution();
			}
		});
	};

	return {
		awaitExecution,
	};
};

module.exports = createTaskQueue;

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
console.log('NORMAL FLOW');
// task1().then(console.log);
// task2().then(console.log);

// With task queue
// console.log('QUEUED FLOW');
taskQueue.awaitExecution(task1).then(console.log);
taskQueue.awaitExecution(task2).then(console.log);
