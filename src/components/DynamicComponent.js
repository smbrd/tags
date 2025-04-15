import { LitElement, html, css } from 'lit';

export class DynamicComponent extends LitElement {
  static properties = {
    data: { type: Array },
    config: { type: Object },
    loading: { type: Boolean },
    error: { type: String },
    componentName: { type: String },
    dataEndpoint: { type: String },
    configEndpoint: { type: String },
    maxRetries: { type: Number }
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
    this.dataEndpoint = '/data';
    this.configEndpoint = '/config';
    this.maxRetries = 3;
    this.buttonListeners = new WeakMap(); // Track which buttons already have listeners
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadConfiguration().then(() => this.loadData());
    this.observeButton();
    
    // Add event listener for dynamic actions
    document.addEventListener('dynamic-action', (e) => {
      if (e.detail.componentName === this.componentName) {
        console.log('Action triggered for component:', this.componentName, e.detail);
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up event listeners
    this.buttonListeners.forEach((handler, button) => {
      button.removeEventListener('click', handler);
    });
    this.buttonListeners.clear();
    document.removeEventListener('dynamic-action', this.handleDynamicAction);
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
        // Only add listener if this button doesn't already have one
        if (!this.buttonListeners.has(button)) {
          const clickHandler = (event) => {
            console.log('click detected');
          };
          button.addEventListener('click', clickHandler);
          this.buttonListeners.set(button, clickHandler);
        }
      }
    });
  }

  async loadConfiguration(retryCount = 0) {
    try {
      const response = await fetch(this.configEndpoint);
      
      if (response.status === 504) {
        if (retryCount < this.maxRetries) {
          console.log(`Retrying config fetch (attempt ${retryCount + 1}/${this.maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.loadConfiguration(retryCount + 1);
        } else {
          throw new Error('Server timeout after multiple retries');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.config = await response.json();
      this.componentName = this.config.componentName || 'dynamic-component';
      this.error = '';
    } catch (error) {
      this.error = 'Failed to load configuration: ' + error.message;
      this.loading = false;
      
      if (retryCount < this.maxRetries) {
        console.log(`Retrying config fetch (attempt ${retryCount + 1}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.loadConfiguration(retryCount + 1);
      }
    }
  }

  async loadData(retryCount = 0) {
    try {
      const response = await fetch(this.dataEndpoint);
      
      if (response.status === 504) {
        if (retryCount < this.maxRetries) {
          console.log(`Retrying data fetch (attempt ${retryCount + 1}/${this.maxRetries})...`);
          // Wait for 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.loadData(retryCount + 1);
        } else {
          throw new Error('Server timeout after multiple retries');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.data = await response.json();
      this.loading = false;
      this.error = '';
    } catch (error) {
      this.error = 'Failed to load data: ' + error.message;
      this.loading = false;
      
      if (retryCount < this.maxRetries) {
        console.log(`Retrying data fetch (attempt ${retryCount + 1}/${this.maxRetries})...`);
        // Wait for 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.loadData(retryCount + 1);
      }
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
          detail: { 
            action, 
            item,
            componentName: this.componentName 
          },
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

// Initialize the component with event listener
document.addEventListener('DOMContentLoaded', () => {
  const component = document.querySelector('dynamic-component');
  if (component) {
    // The component name will be set after loading the config
    component.addEventListener('config-loaded', () => {
      if (component.componentName && component.componentName !== 'dynamic-component') {
        // Create a new custom element with the name from config
        customElements.define(component.componentName, DynamicComponent);
        // Replace the old element with the new one
        const newElement = document.createElement(component.componentName);
        component.parentNode.replaceChild(newElement, component);
      }
    });
  }
}); 
