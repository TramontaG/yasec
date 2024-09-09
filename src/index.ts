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
