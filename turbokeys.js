(function() {
  const navigable_selectors = ['a', 'button', 'input'];
  const triggerKey = 'Alt';
  const resetKey = 'Escape';
  const hintClassName = 'turbo-keys_hint';
  let hintInput = [];
  let active = false;
  let usedHints = [];


  function reset() {
    const hints = document.querySelectorAll('.' + hintClassName);

    hints.forEach(node => {
      const parent = node.parentNode;
      parent.removeChild(node);
    })

    usedHints = [];
    active = false;
  }

  function generateHintText() {
    const possibleChars = 'abcdefghijklmnopqrstuvwxyz';
    const hintChars = [];

    for (let i = 0; i < 2; i++) {
      const char = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
      hintChars.push(char);
    }

    const hint = hintChars.join('');

    if (usedHints.includes(hint)) {
      return generateHintText();
    } else {
      usedHints.push(hint);
      return hint;
    }
  }

  function appendHint(node) {
    const hintText = generateHintText();
    if (!hintText) return;

    const hintNode = document.createElement('span');
    hintNode.className = hintClassName;
    hintNode.style.position = 'relative';
    hintNode.style.padding = '1px';
    hintNode.style.backgroundColor = 'yellow';
    hintNode.style.border = '1px solid orange';
    hintNode.style.color = 'black';
    hintNode.innerText = hintText.toUpperCase();

    node.appendChild(hintNode);
  }

  function handleTriggerKey() {
    if (active) {
      reset();
    } else {
      active = true;
      const targetNodes = document.querySelectorAll(navigable_selectors);
      targetNodes.forEach(node => {
        appendHint(node)
      })
    }
  }

  function findByHintText() {
    const hintText = hintInput.join('');
    const hints = document.querySelectorAll('.' + hintClassName);

    for (let i = 0; i < hints.length; i++) {
      if (hints[i].innerText.toLowerCase() === hintText) {
        return hints[i].parentNode;
      }
    }
  }

  function handleHintInput(e) {
    hintInput.push(e.key)
    if (hintInput.length === 2) {
      const node = findByHintText();
      node.click()
      hintInput = [];
      reset();
    }
  }

  document.addEventListener('keydown', e => {
    if (e.key === triggerKey) return handleTriggerKey();
    if (e.key === resetKey) return reset();
    handleHintInput(e);
  })
})();
