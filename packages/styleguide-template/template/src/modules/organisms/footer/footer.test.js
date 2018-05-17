
const puppeteer = require('puppeteer');
const tape = require('tape');

async function mobileTest(page) {
  await page.setViewport({ width: 320, height: 568 });

  return page.evaluate(() => {
    // check element rules
    const footer = document.querySelector('.footer');
    const footerStyle = window.getComputedStyle(footer, null);
    const footerWidth = footerStyle.getPropertyValue('width');
    const footerPadding = footerStyle.getPropertyValue('padding');
    const footerBackgroundColor = footerStyle.getPropertyValue('background-color');

    const result = {
      footer: {
        width: footerWidth,
        padding: footerPadding,
        'background-color': footerBackgroundColor,
      },
    };

    return result;
  });
}

async function tabletTest(page) {
  await page.setViewport({ width: 768, height: 1024 });

  return page.evaluate(() => {
    // check element rules
    const footer = document.querySelector('.footer');
    const footerStyle = window.getComputedStyle(footer, null);
    const footerWidth = footerStyle.getPropertyValue('width');
    const footerPadding = footerStyle.getPropertyValue('padding');
    const footerBackgroundColor = footerStyle.getPropertyValue('background-color');

    const result = {
      footer: {
        width: footerWidth,
        padding: footerPadding,
        'background-color': footerBackgroundColor,
      },
    };

    return result;
  });
}

async function desktopTest(page) {
  await page.setViewport({ width: 1440, height: 840 });

  return page.evaluate(() => {
    // check element rules
    const footer = document.querySelector('.footer');
    const footerStyle = window.getComputedStyle(footer, null);
    const footerWidth = footerStyle.getPropertyValue('width');
    const footerPadding = footerStyle.getPropertyValue('padding');
    const footerBackgroundColor = footerStyle.getPropertyValue('background-color');

    const result = {
      footer: {
        width: footerWidth,
        padding: footerPadding,
        'background-color': footerBackgroundColor,
      },
    };

    return result;
  });
}

async function test() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/modules/organisms/footer/footer.html');

  const footerPropertiesMobile = await mobileTest(page);
  const footerPropertiesTablet = await tabletTest(page);
  const footerPropertiesDesktop = await desktopTest(page);

  await browser.close();

  return () => {
    tape('footer', (assert) => {
      assert.test('mobile tests:', (t) => {
        t.equal(footerPropertiesMobile.footer.width, '320px', 'footer width is 100%');
        t.equal(footerPropertiesMobile.footer.padding, '16px', 'footer padding is 1em (16px)');
        t.equal(footerPropertiesMobile.footer['background-color'], 'rgb(255, 0, 0)', 'footer background is red');
        t.end();
      });

      assert.test('tablet tests:', (t) => {
        t.equal(footerPropertiesTablet.footer.width, '768px', 'footer width is 100%');
        t.equal(footerPropertiesTablet.footer.padding, '16px', 'footer padding is 1em (16px)');
        t.equal(footerPropertiesTablet.footer['background-color'], 'rgb(255, 0, 0)', 'footer background is red');
        t.end();
      });

      assert.test('desktop tests:', (t) => {
        t.equal(footerPropertiesDesktop.footer.width, '1440px', 'footer width is 100%');
        t.equal(footerPropertiesDesktop.footer.padding, '16px', 'footer padding is 1em (16px)');
        t.equal(footerPropertiesDesktop.footer['background-color'], 'rgb(255, 0, 0)', 'footer background is red');
        t.end();
      });

      assert.end();
    });
  };
}

if (require.main === module) test();

exports.test = test;
