(function () {
  const messages = document.querySelector('#messages');
  const wsButton = document.querySelector('#wsButton');
  const wsSendButton = document.querySelector('#wsSendButton');
  const logout = document.querySelector('#logout');
  const login = document.querySelector('#login');

  function showMessage(message) {
    messages.textContent += `\n${message}`;
    messages.scrollTop = messages.scrollHeight;
  }

  function handleResponse(response) {
    return response.ok
      ? response.json().then((data) => JSON.stringify(data, null, 2))
      : Promise.reject(new Error('Unexpected response'));
  }

  login.onclick = function () {
    fetch('/login', { method: 'POST', credentials: 'same-origin' })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  logout.onclick = function () {
    fetch('/logout', { method: 'DELETE', credentials: 'same-origin' })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  let ws;

  wsButton.onclick = function () {
    if (ws) {
      ws.onerror = ws.onopen = ws.onclose = null;
      ws.close();
    }

    ws = new WebSocket(`wss://${location.host}`);
    ws.onerror = function () {
      showMessage('WebSocket erro');
    };
    ws.onopen = function () {
      showMessage('WebSocket conexão estabilizada');
    };
    ws.onclose = function () {
      showMessage('WebSocket conexão fechada');
      ws = null;
    };
  };

  wsSendButton.onclick = function () {
    if (!ws) {
      showMessage('Sem conexão com WebSocket');
      return;
    }

    ws.send('Hello World!');
    showMessage('Sent "Hello World!"');
  };
})();