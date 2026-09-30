export function shuffle(items, random = Math.random) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

export function createTask(number, factor, operation) {
  if (operation === 'divide') {
    return { left: number * factor, right: number, answer: factor, operation }
  }
  return { left: number, right: factor, answer: number * factor, operation }
}

export function createNumberTasks(number, operation, random = Math.random) {
  return shuffle(
    Array.from({ length: 10 }, (_, index) => createTask(number, index + 1, operation)),
    random,
  )
}

export function createRandomTasks(operation, count = 10, random = Math.random) {
  return Array.from({ length: count }, () => {
    const number = Math.floor(random() * 10) + 1
    const factor = Math.floor(random() * 10) + 1
    return createTask(number, factor, operation)
  })
}
