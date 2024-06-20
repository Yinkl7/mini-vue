const queue: any[] = []
let isFlashPending = false
let activePreFlushCbs: any[] = []

const p = Promise.resolve()
export function nextTick(fn?) {
  return fn ? p.then(fn) : p
}

export function queueJobs(job) {
  if(!queue.includes(job)) {
    queue.push(job)
  }

  queueFlush()
}

export function queuePreFlushCb(job) {
  activePreFlushCbs.push(job)

  queueFlush()
}

function queueFlush() {
  if(isFlashPending) return
  isFlashPending = true

  nextTick(flushJobs)
}

function flushJobs() {
  isFlashPending = false

  flushPreFlushCbs()

  // componet render
  let job
  while((job = queue.shift())) {
    job && job()
  }
}
function flushPreFlushCbs() {
  for(let i = 0; i < activePreFlushCbs.length; i++) {
    activePreFlushCbs[i]()
  }
}

