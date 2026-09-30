import test from 'node:test'
import assert from 'node:assert/strict'
import { createNumberTasks, createRandomTasks, createTask } from './game.js'

test('creates multiplication and exact division tasks', () => {
  assert.deepEqual(createTask(7, 6, 'multiply'), {
    left: 7, right: 6, answer: 42, operation: 'multiply',
  })
  assert.deepEqual(createTask(7, 6, 'divide'), {
    left: 42, right: 7, answer: 6, operation: 'divide',
  })
})

test('number sessions contain all factors from 1 to 10', () => {
  const tasks = createNumberTasks(4, 'multiply', () => 0.5)
  assert.equal(tasks.length, 10)
  assert.deepEqual(tasks.map((task) => task.right).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
})

test('random sessions keep all values within the selected tables', () => {
  const tasks = createRandomTasks('divide', 10, () => 0.999)
  assert.equal(tasks.length, 10)
  assert.ok(tasks.every((task) => task.right === 10 && task.answer === 10 && task.left === 100))
})
