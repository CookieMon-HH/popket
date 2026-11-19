interface Task {
  frames: number;
  t: number;
  fn?: (p: number) => void;
  resolve: () => void;
}

const tasks: Task[] = [];

export const clock = { frame: 0 };

/** Run fn(progress 0..1) once per frame for `frames` frames. */
export function tween(frames: number, fn?: (p: number) => void): Promise<void> {
  return new Promise((resolve) => {
    if (frames <= 0) {
      fn?.(1);
      resolve();
      return;
    }
    tasks.push({ frames: Math.round(frames), t: 0, fn, resolve });
  });
}

export const wait = (frames: number) => tween(frames);

export function tickTasks() {
  clock.frame++;
  for (const task of [...tasks]) {
    task.t++;
    const p = Math.min(1, task.t / task.frames);
    task.fn?.(p);
    if (task.t >= task.frames) {
      tasks.splice(tasks.indexOf(task), 1);
      task.resolve();
    }
  }
}
