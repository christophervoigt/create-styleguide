
const puppeteer = require('puppeteer');
const tape = require('tape');

async function mobileTest(page) {
  await page.setViewport({ width: 320, height: 568 });

  return page.evaluate(() => {
    // check element rules
    const header = document.querySelector('.header');
    const headerStyle = window.getComputedStyle(header, null);
    const headerWidth = headerStyle.getPropertyValue('width');
    const headerPadding = headerStyle.getPropertyValue('padding');
    const headerBackgroundColor = headerStyle.getPropertyValue('background-color');

    // check searchbar rules
    const headerSearchbar = document.querySelector('.header > .header_searchbar');
    const headerSearchbarStyle = window.getComputedStyle(headerSearchbar, null);
    const headerSearchbarWidth = headerSearchbarStyle.getPropertyValue('width');

    const result = {
      header: {
        width: headerWidth,
        padding: headerPadding,
        'background-color': headerBackgroundColor,
      },
      header_searchbar: {
        width: headerSearchbarWidth,
      },
    };

    return result;
  });
}

async function tabletTest(page) {
  await page.setViewport({ width: 768, height: 1024 });

  return page.evaluate(() => {
    // check element rules
    const header = document.querySelector('.header');
    const headerStyle = window.getComputedStyle(header, null);
    const headerWidth = headerStyle.getPropertyValue('width');
    const headerPadding = headerStyle.getPropertyValue('padding');
    const headerBackgroundColor = headerStyle.getPropertyValue('background-color');

    // check searchbar rules
    const headerSearchbar = document.querySelector('.header > .header_searchbar');
    const headerSearchbarStyle = window.getComputedStyle(headerSearchbar, null);
    const headerSearchbarWidth = headerSearchbarStyle.getPropertyValue('width');

    const result = {
      header: {
        width: headerWidth,
        padding: headerPadding,
        'background-color': headerBackgroundColor,
      },
      header_searchbar: {
        width: headerSearchbarWidth,
      },
    };

    return result;
  });
}

async function desktopTest(page) {
  await page.setViewport({ width: 1440, height: 840 });

  return page.evaluate(() => {
    // check element rules
    const header = document.querySelector('.header');
    const headerStyle = window.getComputedStyle(header, null);
    const headerWidth = headerStyle.getPropertyValue('width');
    const headerPadding = headerStyle.getPropertyValue('padding');
    const headerBackgroundColor = headerStyle.getPropertyValue('background-color');

    // check searchbar rules
    const headerSearchbar = document.querySelector('.header > .header_searchbar');
    const headerSearchbarStyle = window.getComputedStyle(headerSearchbar, null);
    const headerSearchbarWidth = headerSearchbarStyle.getPropertyValue('width');

    const result = {
      header: {
        width: headerWidth,
        padding: headerPadding,
        'background-color': headerBackgroundColor,
      },
      header_searchbar: {
        width: headerSearchbarWidth,
      },
    };

    return result;
  });
}

async function test() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/modules/organisms/header/header.html');

  const headerPropertiesMobile = await mobileTest(page);
  const headerPropertiesTablet = await tabletTest(page);
  const headerPropertiesDesktop = await desktopTest(page);

  await browser.close();

  return () => {
    tape('header', (assert) => {
      assert.test('mobile tests:', (t) => {
        t.equal(headerPropertiesMobile.header.width, '320px', 'header width is 100%');
        t.equal(headerPropertiesMobile.header.padding, '16px', 'header padding is 1em (16px)');
        t.equal(headerPropertiesMobile.header['background-color'], 'rgb(255, 0, 0)', 'header background is red');
        t.equal(headerPropertiesMobile.header_searchbar.width, '288px', 'header_searchbar width is 100%');
        t.end();
      });

      assert.test('tablet tests:', (t) => {
        t.equal(headerPropertiesTablet.header.width, '768px', 'header width is 100%');
        t.equal(headerPropertiesTablet.header.padding, '16px', 'header padding is 1em (16px)');
        t.equal(headerPropertiesTablet.header['background-color'], 'rgb(255, 0, 0)', 'header background is red');
        t.equal(headerPropertiesTablet.header_searchbar.width, '736px', 'header_searchbar width is 100%');
        t.end();
      });

      assert.test('desktop tests:', (t) => {
        t.equal(headerPropertiesDesktop.header.width, '1440px', 'header width is 100%');
        t.equal(headerPropertiesDesktop.header.padding, '16px', 'header padding is 1em (16px)');
        t.equal(headerPropertiesDesktop.header['background-color'], 'rgb(255, 0, 0)', 'header background is red');
        t.equal(headerPropertiesDesktop.header_searchbar.width, '1408px', 'header_searchbar width is 100%');
        t.end();
      });

      assert.end();
    });
  };
}

if (require.main === module) test();

exports.test = test;
