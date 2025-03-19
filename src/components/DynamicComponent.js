import { LitElement, html, css } from 'lit';

export class DynamicComponent extends LitElement {
  static properties = {
    endpoint: { type: String },
    configEndpoint: { type: String, attribute: 'config-endpoint' },
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
    console.log('Connected callback - endpoints:', {
      endpoint: this.endpoint,
      configEndpoint: this.configEndpoint
    });
    
    if (this.endpoint && this.configEndpoint) {
      this.loadConfiguration().then(() => this.loadData());
    } else {
      this.error = `Endpoint or configEndpoint not provided. Endpoint: ${this.endpoint}, ConfigEndpoint: ${this.configEndpoint}`;
      this.loading = false;
    }
  }

  async loadConfiguration() {
    try {
      console.log('Loading configuration from:', this.configEndpoint);
      const response = await fetch(this.configEndpoint);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.config = await response.json();
      console.log('Configuration loaded:', this.config);
    } catch (error) {
      console.error('Failed to load configuration:', error);
      this.error = 'Failed to load configuration: ' + error.message;
      this.loading = false;
    }
  }

  async loadData() {
    try {
      console.log('Loading data from:', this.endpoint);
      const response = await fetch(this.endpoint);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.data = await response.json();
      console.log('Data loaded:', this.data);
      this.loading = false;
    } catch (error) {
      console.error('Failed to load data:', error);
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