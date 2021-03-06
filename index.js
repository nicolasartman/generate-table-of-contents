(function (root, generateTableOfContents) {
  if(typeof module === "object" && module.exports) {
    module.exports = generateTableOfContents;
  } else {
    root.generateTableOfContents = generateTableOfContents;
  }
}(this, function generateTableOfContents(element, options) {
  if (!element || !element.nodeName || !element.querySelectorAll) {
    throw new Error(
      'First argument must be a DOM Element and browser must support querySelectorAll');
  }
  
  // Init parameters from options or defaults
  options = options || {};
  var startLevel = options.startLevel || 1;
  var endLevel = options.endLevel || 6;
  
  if (endLevel < startLevel) {
    throw new Error('Ending heading level must be greater than or equal to starting header level');
  }
  
  var maxHeaderNumber = Math.min(6, endLevel);
  var levels = [];
  for (var headerNumber = startLevel; headerNumber <= maxHeaderNumber; headerNumber += 1) {
    levels.push('h' + headerNumber);
  }
  
  var headers = element.querySelectorAll(levels.join(','));
  var toc = '';
  // Start before the initial level, because the first item transitions from no nesting to
  // that initial level of nesting (for h1's by default).
  var currentLevel = startLevel - 1;

  // Go through each header and build up a string of html for the table of contents
  for (var index = 0; index < headers.length; index++) {
    var header = headers[index];
    var headerLevel = parseInt(header.tagName.charAt(1), 10);

    // Increasing nesting (e.g. h1 -> h2)
    if (headerLevel > currentLevel) {
      while (headerLevel > currentLevel) {
        currentLevel += 1;
        toc += '<ul class="table-of-contents-list table-of-contents-list-depth-' +
          (currentLevel - startLevel + 1) + '"><li class="table-of-contents-item">';
      }
    }
    // Decreasing nesting (e.g. h2 -> h1)
    else if (headerLevel < currentLevel) {
      while (headerLevel < currentLevel) {
        currentLevel -= 1;
        toc += '</li></ul>';
      }
      toc += '</li><li class="table-of-contents-item">'
    }
    // Same level header as the last one
    else {
      toc += '</li><li class="table-of-contents-item">';
    }

    toc += '<a class="table-of-contents-item-link" href="#' +
      header.id + '">' + header.textContent + '</a>';
  }

  toc += '</li></ul>';

  var tocElement = document.createElement('div');
  tocElement.className = 'table-of-contents';
  tocElement.innerHTML = toc;

  return tocElement;
}));