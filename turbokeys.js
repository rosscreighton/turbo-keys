(function() {
  const navigable_selectors = ['a', 'button', 'input'];
  const triggerKey = 'Alt';
  const resetKey = 'Escape';
  const hintClassName = 'turbo-keys__hint';
  const maxPermutations = 676;
  let hintInput = [];
  let active = false;
  let usedHints = [];
  let hintPermuations = 0;

  function getHintElements() {
    return document.querySelectorAll('.' + hintClassName);
  }

  function removeHints() {
    const hints = getHintElements();

    hints.forEach(node => {
      const parent = node.parentNode;
      parent.removeChild(node);
    })
  }

  function reset() {
    removeHints();
    usedHints = [];
    active = false;
  }

  function generateRandomHintText() {
    const possibleChars = 'abcdefghijklmnopqrstuvwxyz';
    const hintChars = [];

    for (let i = 0; i < 2; i++) {
      const char = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
      hintChars.push(char);
    }

    hintPermuations++

    return hintChars.join('');
  }

  function generateUniqueHintText() {
    const hint = generateRandomHintText();

    if (usedHints.includes(hint)) {
      if (hintPermuations > maxPermutations) {
        return false;
      } else {
        return generateUniqueHintText();
      }
    } else {
      usedHints.push(hint);
      return hint;
    }
  }

  function createHintNode() {
    const hintText = generateUniqueHintText() || '';

    const hintNode = document.createElement('span');
    hintNode.className = hintClassName;
    hintNode.style.position = 'relative';
    hintNode.style.padding = '1px';
    hintNode.style.backgroundColor = 'yellow';
    hintNode.style.border = '1px solid orange';
    hintNode.style.color = 'black';
    hintNode.innerText = hintText.toUpperCase();

    return hintNode;
  }

  function appendHint(node) {
    const hintNode = createHintNode();
    node.appendChild(hintNode);
  }

  function isVisibleNode(node) {
    const bodyPosition = document.body.getBoundingClientRect();
    const nodePosition = node.getBoundingClientRect();

    return (
      nodePosition.top > bodyPosition.top &&
      nodePosition.bottom < bodyPosition.bottom
    );
  }

  function handleTriggerKey() {
    if (active) {
      reset();
    } else {
      active = true;
      const targetNodes = document.querySelectorAll(navigable_selectors);
      const visibleTargetNodes = Array.prototype.filter.call(targetNodes, node => isVisibleNode(node))

      visibleTargetNodes.forEach(node => {
        appendHint(node)
      })
    }
  }

  function findByHintText() {
    const hintText = hintInput.join('');
    const hints = getHintElements();

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
