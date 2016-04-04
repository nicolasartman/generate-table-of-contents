var test = require('tape');
var jsdom = require('jsdom').jsdom;
var rewire = require('rewire');
var emmet = require('emmet');
var pretty = require('pretty');

var generateTableOfContents = rewire('./index.js');

// Monkey patch jsdom's document into the file so it can pretend it's running in a browser
generateTableOfContents.__set__('document', jsdom());

test('The table of contents generator', function (assert) {
  
  function generate(abbreviationExpression, options) {
    var element = jsdom(emmet.expandAbbreviation(abbreviationExpression, {})).body;
    return generateTableOfContents(element, options).outerHTML;
  }
  
  function createExpected(abbreviationExpression) {
    return emmet.expandAbbreviation(abbreviationExpression, {});
  }

  assert.throws(generateTableOfContents, new Error(), 'Throws if a non-element is passed in');
  
  var input = generate('span.fakeheader1{Head}+{content}+p{content}+.message-box');
  var expected = createExpected('.table-of-contents')
  assert.equal(input, expected, 'makes an empty TOC from a page with no headers');

  var input = generate('h1#header1{Head}');
  var expected = createExpected(
    '.table-of-contents>ul.table-of-contents-list.table-of-contents-list-depth-1>' +
    'li.table-of-contents-item>a.table-of-contents-item-link[href=#header1]{Head}')
  assert.equal(input, expected, 'makes a one element TOC from a single h1');

  var input = generate('(h1#header${Head$}+{Some text})*3');
  var expected = createExpected(
    '.table-of-contents>ul.table-of-contents-list.table-of-contents-list-depth-1>' +
    '(li.table-of-contents-item>a.table-of-contents-item-link[href=#header$]{Head$})*3')
  assert.equal(input, expected, 'makes a one level TOC from a few h1s with content after each');

  var input = generate('h1#hd1{Head}+{Some text}+h2#hd2{Hat}');
  var expected = createExpected(
    '.table-of-contents>' +
      'ul.table-of-contents-list.table-of-contents-list-depth-1>' +
        'li.table-of-contents-item>a.table-of-contents-item-link[href=#hd1]{Head}+' +
        'ul.table-of-contents-list.table-of-contents-list-depth-2>' +
          'li.table-of-contents-item>a.table-of-contents-item-link[href=#hd2]{Hat}');
  assert.equal(input, expected, 'makes a multi-level TOC from h1s and h2s');

  var input = generate('h1#hd1{Head}+{Some text}+h4#hd4{Sock}+h2#hd2{Hat}+h2#hd2b{Hato}');
  var expected = createExpected(
    '.table-of-contents>' +
      'ul.table-of-contents-list.table-of-contents-list-depth-1>' +
        'li.table-of-contents-item>a.table-of-contents-item-link[href=#hd1]{Head}+' +
        'ul.table-of-contents-list.table-of-contents-list-depth-2>' +
          '(li.table-of-contents-item>' + 
            'ul.table-of-contents-list.table-of-contents-list-depth-3>' +
              'li.table-of-contents-item>' + 
                'ul.table-of-contents-list.table-of-contents-list-depth-4>' +
                  'li.table-of-contents-item>a.table-of-contents-item-link[href=#hd4]{Sock})+' +        
            '(li.table-of-contents-item>a.table-of-contents-item-link[href=#hd2]{Hat})+' +
            '(li.table-of-contents-item>a.table-of-contents-item-link[href=#hd2b]{Hato})');
  assert.equal(input, expected, 'makes a proper TOC from headers that jump multiple levels');
  
  var input = generate('h3#header{Head}+{Some text}');
  var expected = createExpected(
    '.table-of-contents>' + 
      'ul.table-of-contents-list.table-of-contents-list-depth-1>' +
        'li.table-of-contents-item>' +
          'ul.table-of-contents-list.table-of-contents-list-depth-2>' +
            'li.table-of-contents-item>' +
              'ul.table-of-contents-list.table-of-contents-list-depth-3>' +
                'li.table-of-contents-item>' +
                  'a.table-of-contents-item-link[href=#header]{Head}')
  assert.equal(
    input, expected, 'makes a properly nested TOC from a single h3 (since toc start is h1s)');
  
  var input = generate('h3#header{Head}', {startLevel: 3});
  var expected = createExpected(
    '.table-of-contents>ul.table-of-contents-list.table-of-contents-list-depth-1>' +
    'li.table-of-contents-item>a.table-of-contents-item-link[href=#header]{Head}')
  assert.equal(input, expected, 'makes a one level TOC from a single h3 if starting level is 3');

  var input = generate('h2#bad+h3#header{Head}+h4#also-bad', {startLevel: 3, endLevel: 3});
  var expected = createExpected(
    '.table-of-contents>ul.table-of-contents-list.table-of-contents-list-depth-1>' +
    'li.table-of-contents-item>a.table-of-contents-item-link[href=#header]{Head}')
  assert.equal(input, expected, 'supports equal start and end level to get just one header level');
  
  var input = generate('h4#hd1{Head}+{Some text}+h5#hd2{Hat}', {startLevel: 4, endLevel: 5});
  var expected = createExpected(
    '.table-of-contents>' +
      'ul.table-of-contents-list.table-of-contents-list-depth-1>' +
        'li.table-of-contents-item>a.table-of-contents-item-link[href=#hd1]{Head}+' +
        'ul.table-of-contents-list.table-of-contents-list-depth-2>' +
          'li.table-of-contents-item>a.table-of-contents-item-link[href=#hd2]{Hat}');
  assert.equal(input, expected, 'makes a multi-level TOC with custom start and end header levels');
  
  assert.throws(function () {
      return generate('h3#header{Head}', {startLevel: 3, endLevel: 1});
    }, new Error(), 'throws if end level is below start level');
  
  assert.end();
})