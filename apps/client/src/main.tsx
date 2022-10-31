import React from 'react'
import ReactDOM from 'react-dom'
import { QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom'
import './styles/index.less'
import App from './app'
import { queryClient } from './utils/client'

const ws = new WebSocket('ws://localhost:3002/socket')
ws.onmessage = (message) => {
  const event = JSON.parse(message.data)
  if (event.type === 'RELOAD') {
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
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
)
