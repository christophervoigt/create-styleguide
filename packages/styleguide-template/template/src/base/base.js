
import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap.bundle';
import collapsable from './collapsable/collapsable';
import cookieConsent from './cookieConsent/cookieConsent';

export default function base() {
  collapsable();
  cookieConsent();

  window.$ = $;
}
