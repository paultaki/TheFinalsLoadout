/* ========================================
   THE FINALS - AI CHAT WIDGET
   ======================================== */

(function () {
  "use strict";

  // Widget State
  const ChatWidget = {
    isOpen: false,
    isLoading: false,
    messages: [],
    elements: {},

    // API Configuration
    apiEndpoint: "/api/loadout-analysis",

    // Initialize the widget
    init() {
      this.createHTML();
      this.bindEvents();
      this.setupAccessibility();
      console.log("🤖 AI Chat Widget initialized");
    },

    // Create the widget HTML structure
    createHTML() {
      const widgetHTML = `
        <div class="chat-widget" role="complementary" aria-label="AI Chat Assistant">
          <button class="chat-launcher" 
                  aria-label="Open AI Chat Assistant" 
                  aria-expanded="false"
                  aria-controls="chat-box">
            🤖
          </button>
          
          <div class="chat-box" id="chat-box" aria-hidden="true">
            <div class="chat-header">
              <div class="chat-title" role="heading" aria-level="2">
                🤖 Finals AI Assistant
              </div>
              <button class="chat-close" 
                      aria-label="Close chat" 
                      title="Close chat">
                ×
              </button>
            </div>
            
            <div class="chat-messages" 
                 role="log" 
                 aria-live="polite" 
                 aria-label="Chat messages">
              <div class="chat-empty-state">
                <div class="chat-icon">🎮</div>
                <p>Ask me anything about The Finals!</p>
                <p>Weapons, gadgets, strategies, meta builds...</p>
              </div>
            </div>
            
            <div class="chat-input-container">
              <textarea class="chat-input" 
                       placeholder="Ask about weapons, gadgets, strategies..."
                       aria-label="Type your message"
                       rows="1"
                       maxlength="500"></textarea>
              <button class="chat-send" 
                      aria-label="Send message"
                      title="Send message"
                      disabled>
                ➤
              </button>
            </div>
            
            <div class="chat-ai-loader" aria-hidden="true">
              <div class="chat-loading-animation">
                <div class="chat-loading-shapes">
                  <div class="chat-loading-shape"></div>
                  <div class="chat-loading-shape"></div>
                  <div class="chat-loading-shape"></div>
                  <div class="chat-loading-shape"></div>
                  <div class="chat-loading-shape"></div>
                  <div class="chat-loading-shape"></div>
                  <div class="chat-loading-shape"></div>
                  <div class="chat-loading-shape"></div>
                </div>
                <div class="chat-loading-text">AI is thinking...</div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML("beforeend", widgetHTML);
      this.cacheElements();
    },

    // Cache DOM elements
    cacheElements() {
      this.elements = {
        widget: document.querySelector(".chat-widget"),
        launcher: document.querySelector(".chat-launcher"),
        chatBox: document.querySelector(".chat-box"),
        closeBtn: document.querySelector(".chat-close"),
        messages: document.querySelector(".chat-messages"),
        input: document.querySelector(".chat-input"),
        sendBtn: document.querySelector(".chat-send"),
        loader: document.querySelector(".chat-ai-loader"),
        emptyState: document.querySelector(".chat-empty-state"),
      };
    },

    // Bind event handlers
    bindEvents() {
      // Toggle chat
      this.elements.launcher.addEventListener("click", () => this.toggleChat());
      this.elements.closeBtn.addEventListener("click", () => this.closeChat());

      // Input handling
      this.elements.input.addEventListener("input", (e) => this.handleInput(e));
      this.elements.input.addEventListener("keydown", (e) =>
        this.handleKeydown(e)
      );

      // Send message
      this.elements.sendBtn.addEventListener("click", () => this.sendMessage());

      // Outside click to close
      document.addEventListener("click", (e) => this.handleOutsideClick(e));

      // Escape key to close
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.closeChat();
        }
      });
    },

    // Setup accessibility features
    setupAccessibility() {
      // Auto-resize textarea
      this.elements.input.addEventListener("input", () => {
        this.elements.input.style.height = "auto";
        this.elements.input.style.height =
          Math.min(this.elements.input.scrollHeight, 80) + "px";
      });

      // Focus management
      this.elements.chatBox.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          this.handleTabNavigation(e);
        }
      });
    },

    // Handle tab navigation within chat
    handleTabNavigation(e) {
      const focusableElements = this.elements.chatBox.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    },

    // Toggle chat open/closed
    toggleChat() {
      if (this.isOpen) {
        this.closeChat();
      } else {
        this.openChat();
      }
    },

    // Open chat
    openChat() {
      this.isOpen = true;
      this.elements.chatBox.classList.add("open");
      this.elements.launcher.setAttribute("aria-expanded", "true");
      this.elements.chatBox.setAttribute("aria-hidden", "false");

      // Focus input after animation
      setTimeout(() => {
        this.elements.input.focus();
      }, 300);

      console.log("🤖 Chat opened");
    },

    // Close chat
    closeChat() {
      this.isOpen = false;
      this.elements.chatBox.classList.remove("open");
      this.elements.launcher.setAttribute("aria-expanded", "false");
      this.elements.chatBox.setAttribute("aria-hidden", "true");

      // Return focus to launcher
      this.elements.launcher.focus();

      console.log("🤖 Chat closed");
    },

    // Handle outside click
    handleOutsideClick(e) {
      if (this.isOpen && !this.elements.widget.contains(e.target)) {
        this.closeChat();
      }
    },

    // Handle input changes
    handleInput(e) {
      const value = e.target.value.trim();
      this.elements.sendBtn.disabled = !value || this.isLoading;
    },

    // Handle keyboard shortcuts
    handleKeydown(e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!this.elements.sendBtn.disabled) {
          this.sendMessage();
        }
      }
    },

    // Send message
    async sendMessage() {
      const message = this.elements.input.value.trim();
      if (!message || this.isLoading) return;

      // Add user message
      this.addMessage("user", message);

      // Clear input
      this.elements.input.value = "";
      this.elements.input.style.height = "auto";
      this.elements.sendBtn.disabled = true;

      // Show loading
      this.setLoading(true);

      try {
        // Send to API
        const response = await this.sendPrompt(message);

        // Add AI response
        this.addMessage("ai", response);
      } catch (error) {
        console.error("🤖 Chat error:", error);
        this.addError("Sorry, I encountered an error. Please try again.");
      } finally {
        this.setLoading(false);
      }
    },

    // Add message to chat
    addMessage(type, content) {
      // Hide empty state
      if (this.elements.emptyState) {
        this.elements.emptyState.style.display = "none";
      }

      const messageHTML = `
        <div class="chat-message ${type}" role="article">
          <div class="message-bubble ${type}">
            ${this.escapeHtml(content)}
          </div>
        </div>
      `;

      this.elements.messages.insertAdjacentHTML("beforeend", messageHTML);
      this.scrollToBottom();

      // Store message
      this.messages.push({ type, content, timestamp: Date.now() });

      console.log(`🤖 Message added: ${type}`);
    },

    // Add error message
    addError(message) {
      const errorHTML = `
        <div class="chat-error" role="alert">
          ${this.escapeHtml(message)}
          <button class="chat-retry" onclick="window.chatWidget.retryLastMessage()">
            Retry
          </button>
        </div>
      `;

      this.elements.messages.insertAdjacentHTML("beforeend", errorHTML);
      this.scrollToBottom();
    },

    // Retry last message
    retryLastMessage() {
      const lastUserMessage = [...this.messages]
        .reverse()
        .find((msg) => msg.type === "user");
      if (lastUserMessage) {
        // Remove error message
        const errorElement =
          this.elements.messages.querySelector(".chat-error");
        if (errorElement) {
          errorElement.remove();
        }

        // Retry with last message
        this.setLoading(true);
        this.sendPrompt(lastUserMessage.content)
          .then((response) => {
            this.addMessage("ai", response);
          })
          .catch((error) => {
            console.error("🤖 Retry error:", error);
            this.addError("Sorry, I encountered an error. Please try again.");
          })
          .finally(() => {
            this.setLoading(false);
          });
      }
    },

    // Set loading state
    setLoading(loading) {
      this.isLoading = loading;
      this.elements.loader.classList.toggle("visible", loading);
      this.elements.loader.setAttribute("aria-hidden", !loading);
      this.elements.sendBtn.disabled =
        loading || !this.elements.input.value.trim();

      if (loading) {
        this.elements.input.setAttribute("aria-describedby", "loading-message");
      } else {
        this.elements.input.removeAttribute("aria-describedby");
      }
    },

    // Scroll to bottom
    scrollToBottom() {
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    },

    // Send prompt to API
    async sendPrompt(prompt) {
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "chat",
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return (
        data.response ||
        data.roast ||
        "I apologize, but I could not generate a response."
      );
    },

    // Escape HTML
    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => ChatWidget.init());
  } else {
    ChatWidget.init();
  }

  // Expose widget globally for debugging and retry functionality
  window.chatWidget = ChatWidget;
})();
