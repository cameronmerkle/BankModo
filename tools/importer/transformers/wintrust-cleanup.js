/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Wintrust cleanup.
 * Selectors from captured DOM of wintrust.com/personal-solutions/bank-with-us/checking/better-checking.html
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie/consent overlays and modals that may block parsing
    WebImporter.DOMUtils.remove(element, [
      '.ot-form-consent',
      '#speedbumpModal',
      '#trusteerdialog',
      '#token-view-popup',
      '#modified-references-banner',
      '#enter-location-modal',
      '#recaptchaV3',
      '#experienceCloudOrgId',
      '.terafinaOff',
      '#disableMarketingPixel',
      '#pagePropsLanguage',
    ]);
  }
  if (hookName === H.after) {
    // Remove non-authorable site chrome
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      '.static-mobile',
      '#location-new-search-winui',
      'iframe',
      'link',
      'noscript',
      'input',
    ]);
    // Remove tracking attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
      el.removeAttribute('data-cmp-data-layer');
    });
  }
}
