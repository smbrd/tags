import { LitElement, html, css } from 'lit';

export class DynamicComponent extends LitElement {
  static properties = {
    data: { type: Array },
    config: { type: Object },
    loading: { type: Boolean },
    error: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }

    .error {
      color: red;
      padding: 1rem;
      border: 1px solid red;
      border-radius: 4px;
      margin: 1rem 0;
    }

    .dynamic-element {
      margin: 0.5rem 0;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: #0066cc;
      color: white;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: #0052a3;
    }
  `;

  constructor() {
    super();
    this.data = [];
    this.config = {};
    this.loading = true;
    this.error = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadConfiguration().then(() => this.loadData());
    this.observeButton();
  }

  observeButton() {
    const observer = new MutationObserver((mutations) => {
      this.findAndAttachButtonListener();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.findAndAttachButtonListener();
  }

  findAndAttachButtonListener() {
    const buttons = document.querySelectorAll('button');
    const buttonTextPatterns = [
      'add to cart',
      'add to bag',
      'add to basket',
      'buy now',
      'add to cart now',
      'get yours',
      'drop into cart'
    ];
    
    buttons.forEach(button => {
      const buttonText = button.textContent.toLowerCase();
      if (buttonTextPatterns.some(pattern => buttonText.includes(pattern))) {
        // Add our new click handler that will run after the original one
        button.addEventListener('click', (event) => {
          console.log('click detected');
        });
      }
    });
  }

  async loadConfiguration() {
    try {
      const response = await fetch('/config');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.config = await response.json();
    } catch (error) {
      this.error = 'Failed to load configuration: ' + error.message;
      this.loading = false;
    }
  }

  async loadData() {
    try {
      const response = await fetch('/data');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.data = await response.json();
      this.loading = false;
    } catch (error) {
      this.error = 'Failed to load data: ' + error.message;
      this.loading = false;
    }
  }

  handleAction(action, item) {
    if (!action.type) return;

    switch (action.type) {
      case 'click':
        if (action.url) {
          window.location.href = this.interpolateValues(action.url, item);
        }
        break;
      case 'custom':
        const event = new CustomEvent('dynamic-action', {
          detail: { action, item },
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(event);
        break;
    }
  }

  interpolateValues(template, item) {
    return template.replace(/\${(\w+)}/g, (match, key) => item[key] || match);
  }

  renderElement(element, item) {
    switch (element.type) {
      case 'text':
        return html`<div class="dynamic-element">
          ${this.interpolateValues(element.content, item)}
        </div>`;
      case 'button':
        return html`<button
          @click=${() => this.handleAction(element.action, item)}
          class="dynamic-element">
          ${this.interpolateValues(element.label, item)}
        </button>`;
      case 'link':
        return html`<a
          href=${this.interpolateValues(element.href, item)}
          class="dynamic-element">
          ${this.interpolateValues(element.label, item)}
        </a>`;
      default:
        return html`<div class="dynamic-element">
          Unsupported element type: ${element.type}
        </div>`;
    }
  }

  render() {
    if (this.loading) {
      return html`<div class="loading">Loading...</div>`;
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }

    return html`
      ${this.data.map(item => html`
        <div class="item">
          ${this.config.elements?.map(element => 
            this.renderElement(element, item)
          )}
        </div>
      `)}
    `;
  }
}

// Only define the custom element if it hasn't been defined yet
if (!customElements.get('dynamic-component')) {
  customElements.define('dynamic-component', DynamicComponent);
}

document.querySelector('dynamic-component').addEventListener('dynamic-action', (e) => {
    console.log('Action triggered:', e.detail);
}); 
