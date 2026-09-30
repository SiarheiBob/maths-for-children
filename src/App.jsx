import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { TASKS_PER_SESSION, TRAINING_TIME_SECONDS } from './config.js'
import { createNumberTasks, createRandomTasks } from './game.js'

const translations = {
  ru: {
    appName: 'Математика — это весело!', subtitle: 'Учись, играй и становись увереннее', learn: 'Учить', learnHint: 'Посмотри таблицу, затем проверь себя', train: 'Тренироваться', trainHint: 'Реши 10 примеров на время', chooseNumber: 'Выбери число', chooseOperation: 'Выбери действие', multiply: 'Умножение', divide: 'Деление', next: 'Дальше', back: 'Назад', tableTitle: 'Таблица числа', ready: 'Готов проверить себя?', startTest: 'Начать тест', task: 'Задание', of: 'из', answerPlaceholder: 'Твой ответ', check: 'Проверить', correct: 'Правильно!', incorrect: 'Почти! Правильный ответ:', continue: 'Продолжить', result: 'Результат', excellent: 'Отличная работа!', practice: 'Давай разберём ошибки', noErrors: 'Ни одной ошибки. Так держать!', yourAnswer: 'Твой ответ', noAnswer: 'нет ответа', again: 'Ещё раз', home: 'На главную', random: 'Случайные', seconds: 'сек', timeIsUp: 'Время вышло!', finishCurrent: 'Реши текущий пример — после него тренировка завершится.', timeResult: 'Время', selectMode: 'Что будем делать?', learnLabel: 'Режим обучения', trainLabel: 'Режим тренировки', score: 'верных ответов', timedOut: 'Время закончилось', language: 'Язык', russian: 'Русский', english: 'English', operationSignMultiply: '×', operationSignDivide: '÷',
  },
  en: {
    appName: 'Math is fun!', subtitle: 'Learn, play, and grow confident', learn: 'Learn', learnHint: 'Study the table, then test yourself', train: 'Train', trainHint: 'Solve 10 tasks against the clock', chooseNumber: 'Choose a number', chooseOperation: 'Choose an operation', multiply: 'Multiplication', divide: 'Division', next: 'Next', back: 'Back', tableTitle: 'Table for', ready: 'Ready to test yourself?', startTest: 'Start test', task: 'Task', of: 'of', answerPlaceholder: 'Your answer', check: 'Check', correct: 'Correct!', incorrect: 'Almost! The correct answer is:', continue: 'Continue', result: 'Result', excellent: 'Great work!', practice: 'Let’s review the mistakes', noErrors: 'No mistakes. Keep it up!', yourAnswer: 'Your answer', noAnswer: 'no answer', again: 'Try again', home: 'Home', random: 'Random', seconds: 'sec', timeIsUp: 'Time is up!', finishCurrent: 'Finish the current task, then training will end.', timeResult: 'Time', selectMode: 'What shall we do?', learnLabel: 'Learning mode', trainLabel: 'Training mode', score: 'correct answers', timedOut: 'Time expired', language: 'Language', russian: 'Русский', english: 'English', operationSignMultiply: '×', operationSignDivide: '÷',
  },
}

const numbers = Array.from({ length: 10 }, (_, index) => index + 1)

function App() {
  const [language, setLanguage] = useState('ru')
  const [screen, setScreen] = useState('home')
  const [mode, setMode] = useState(null)
  const [number, setNumber] = useState(1)
  const [randomNumber, setRandomNumber] = useState(false)
  const [operation, setOperation] = useState('multiply')
  const [tasks, setTasks] = useState([])
  const [taskIndex, setTaskIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [answers, setAnswers] = useState([])
  const [secondsLeft, setSecondsLeft] = useState(TRAINING_TIME_SECONDS)
  const [timeExpired, setTimeExpired] = useState(false)
  const inputRef = useRef(null)
  const t = translations[language]

  const sign = operation === 'multiply' ? t.operationSignMultiply : t.operationSignDivide
  const currentTask = tasks[taskIndex]
  const elapsed = TRAINING_TIME_SECONDS - secondsLeft

  useEffect(() => {
    if (screen !== 'quiz' || mode !== 'train' || feedback || timeExpired) return undefined
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer)
          setTimeExpired(true)
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [screen, mode, feedback, timeExpired])

  useEffect(() => {
    if (screen === 'quiz' && !feedback) inputRef.current?.focus()
  }, [screen, taskIndex, feedback])

  const tableRows = useMemo(() => numbers.map((factor) => (
    operation === 'multiply'
      ? { expression: `${number} × ${factor}`, result: number * factor }
      : { expression: `${number * factor} ÷ ${number}`, result: factor }
  )), [number, operation])

  function openSetup(selectedMode) {
    setMode(selectedMode)
    setRandomNumber(false)
    setScreen('setup')
  }

  function prepareTasks() {
    const nextTasks = randomNumber
      ? createRandomTasks(operation, TASKS_PER_SESSION)
      : createNumberTasks(number, operation)
    setTasks(nextTasks)
    setTaskIndex(0)
    setAnswers([])
    setAnswer('')
    setFeedback(null)
    setSecondsLeft(TRAINING_TIME_SECONDS)
    setTimeExpired(false)
    setScreen('quiz')
  }

  function submitAnswer(event) {
    event.preventDefault()
    if (answer === '' || feedback) return
    const numericAnswer = Number(answer)
    const result = { ...currentTask, given: numericAnswer, correct: numericAnswer === currentTask.answer }
    setAnswers((value) => [...value, result])
    setFeedback(result)
  }

  function advance() {
    if (timeExpired || taskIndex === tasks.length - 1) {
      setScreen('result')
      return
    }
    setTaskIndex((value) => value + 1)
    setAnswer('')
    setFeedback(null)
  }

  function goHome() {
    setScreen('home')
    setMode(null)
  }

  function restart() {
    if (mode === 'learn') setScreen('table')
    else prepareTasks()
  }

  const errors = answers.filter((item) => !item.correct)
  const score = answers.filter((item) => item.correct).length

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={goHome} aria-label={t.home}><span>10</span><strong>{t.appName}</strong></button>
        <label className="language-picker">
          <span>{t.language}</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="ru">{t.russian}</option><option value="en">{t.english}</option>
          </select>
        </label>
      </header>

      {screen === 'home' && <section className="hero page">
        <div className="hero-copy"><p className="eyebrow">1 — 10</p><h1>{t.appName}</h1><p>{t.subtitle}</p></div>
        <h2>{t.selectMode}</h2>
        <div className="mode-grid">
          <button className="mode-card learn-card" onClick={() => openSetup('learn')}><span className="mode-icon">×</span><span><strong>{t.learn}</strong><small>{t.learnHint}</small></span><b>→</b></button>
          <button className="mode-card train-card" onClick={() => openSetup('train')}><span className="mode-icon">⏱</span><span><strong>{t.train}</strong><small>{t.trainHint}</small></span><b>→</b></button>
        </div>
      </section>}

      {screen === 'setup' && <section className="page panel">
        <button className="text-button" onClick={goHome}>← {t.back}</button>
        <p className="eyebrow">{mode === 'learn' ? t.learnLabel : t.trainLabel}</p>
        <h1>{t.chooseNumber}</h1>
        <div className="number-grid">
          {numbers.map((item) => <button key={item} className={!randomNumber && number === item ? 'selected' : ''} onClick={() => { setNumber(item); setRandomNumber(false) }}>{item}</button>)}
          {mode === 'train' && <button className={`random-button ${randomNumber ? 'selected' : ''}`} onClick={() => setRandomNumber(true)}>{t.random}</button>}
        </div>
        <h2>{t.chooseOperation}</h2>
        <div className="operation-grid">
          <button className={operation === 'multiply' ? 'selected' : ''} onClick={() => setOperation('multiply')}><span>×</span>{t.multiply}</button>
          <button className={operation === 'divide' ? 'selected' : ''} onClick={() => setOperation('divide')}><span>÷</span>{t.divide}</button>
        </div>
        <button className="primary-button" onClick={() => mode === 'learn' ? setScreen('table') : prepareTasks()}>{t.next} →</button>
      </section>}

      {screen === 'table' && <section className="page panel table-page">
        <button className="text-button" onClick={() => setScreen('setup')}>← {t.back}</button>
        <p className="eyebrow">{t.learnLabel}</p><h1>{t.tableTitle} {number}</h1>
        <div className="table-grid">{tableRows.map((row) => <div key={row.expression}><span>{row.expression}</span><b>= {row.result}</b></div>)}</div>
        <div className="ready"><div><strong>{t.ready}</strong><span>10 {t.task.toLowerCase()}</span></div><button className="primary-button" onClick={prepareTasks}>{t.startTest} →</button></div>
      </section>}

      {screen === 'quiz' && currentTask && <section className="page quiz-page">
        <div className="quiz-meta"><span>{t.task} {taskIndex + 1} {t.of} {tasks.length}</span>{mode === 'train' && <span className={`timer ${secondsLeft <= 10 ? 'urgent' : ''}`}>⏱ {secondsLeft} {t.seconds}</span>}</div>
        <div className="progress"><span style={{ width: `${((taskIndex + 1) / tasks.length) * 100}%` }} /></div>
        {timeExpired && <div className="timeout-banner"><strong>{t.timeIsUp}</strong><span>{t.finishCurrent}</span></div>}
        <div className="question-card">
          <div className="equation"><span>{currentTask.left}</span><i>{sign}</i><span>{currentTask.right}</span><i>=</i><b>?</b></div>
          {!feedback ? <form onSubmit={submitAnswer}><input ref={inputRef} type="number" inputMode="numeric" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={t.answerPlaceholder} aria-label={t.answerPlaceholder} /><button className="primary-button" disabled={answer === ''}>{t.check}</button></form>
            : <div className={`feedback ${feedback.correct ? 'success' : 'error'}`}><strong>{feedback.correct ? t.correct : t.incorrect}</strong>{!feedback.correct && <span>{feedback.answer}</span>}<button className="primary-button" onClick={advance}>{timeExpired || taskIndex === tasks.length - 1 ? t.result : t.continue} →</button></div>}
        </div>
      </section>}

      {screen === 'result' && <section className="page panel result-page">
        <p className="eyebrow">{t.result}</p><h1>{errors.length === 0 ? t.excellent : t.practice}</h1>
        <div className="score-ring"><strong>{score}</strong><span>/ {tasks.length}</span></div><p>{score} {t.score}</p>
        {mode === 'train' && <div className="time-result"><span>{t.timeResult}</span><strong>{timeExpired ? t.timedOut : `${elapsed} ${t.seconds}`}</strong></div>}
        {errors.length ? <div className="mistakes">{errors.map((item, index) => <div key={`${item.left}-${item.right}-${index}`}><strong>{item.left} {item.operation === 'multiply' ? '×' : '÷'} {item.right} = {item.answer}</strong><span>{t.yourAnswer}: {item.given ?? t.noAnswer}</span></div>)}</div> : <p className="no-errors">{t.noErrors}</p>}
        <div className="result-actions"><button className="secondary-button" onClick={goHome}>{t.home}</button><button className="primary-button" onClick={restart}>{t.again}</button></div>
      </section>}
    </main>
  )
}

export default App
