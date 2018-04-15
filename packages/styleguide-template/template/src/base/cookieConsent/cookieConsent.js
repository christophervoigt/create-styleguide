
import 'cookieconsent';

export default function cookieConsent(selector = '#cookieConsent') {
  const element = document.querySelector(selector);
  const message = document.querySelector(`${selector} [data-cc-text]`);
  const button = document.querySelector(`${selector} [data-cc-button]`);

  if (element) {
    const options = {
      showLink: false,
      elements: {
        dismiss: '<a aria-label="dismiss cookie message" tabindex="0" class="cc-btn cc-dismiss">{{dismiss}}</a>',
      },
      content: {
        message: message.innerHTML,
        dismiss: button.innerText,
      },
    };

    element.remove();
    window.cookieconsent.initialise(options);
  }
}
