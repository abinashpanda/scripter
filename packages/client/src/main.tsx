import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.less'
import App from './app'

const ws = new WebSocket('ws://localhost:3002/socket')
ws.onmessage = (message) => {
  const event = JSON.parse(message.data)
  if (event.event === 'RELOAD') {
    // eslint-disable-next-line no-console
    console.log('Reloading window ...')
    window.location.reload()
  }
}
ws.onerror = (error) => {
  // eslint-disable-next-line no-console
  console.error(error)
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)
