const queue: any[] = []
let isFlashPending = false

const p = Promise.resolve()
export function nextTick(fn) {
  return fn ? p.then(fn) : p
}

export function queueJobs(job) {
  if(!queue.includes(job)) {
    queue.push(job)
  }

  queueFlush()
}

function queueFlush() {
  if(isFlashPending) return
  isFlashPending = true

  nextTick(flushJobs)
}

function flushJobs() {
  isFlashPending = false
  let job
  while((job = queue.shift())) {
    job && job()
  }
}
