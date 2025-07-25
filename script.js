/**
 * CLEMENTGPT - SCRIPT.JS
 *
 * This script handles all client-side interactivity for the application.
 * It is structured into clear sections for maintainability.
 *
 * TABLE OF CONTENTS
 * 1. DOMContentLoaded Event Listener
 * 2. Global Logic (runs on all pages)
 * - Mobile Menu
 * - Logout
 * 3. Page-Specific Logic
 * - Auth Page
 * - Contact Page
 * - Chat Page
 * 4. Helper Functions
 * - Form Validation
 * - Global UI Updaters
 */
document.addEventListener("DOMContentLoaded", () => {
  // ===================================================================
  // 2. GLOBAL LOGIC (runs on all pages)
  // ===================================================================

  // Initialize the user profile display on every page load
  updateProfile();

  // --- Mobile Menu Functionality ---
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const menuOverlay = document.querySelector(".mobile-menu-overlay");

  if (menuToggle && sidebar && menuOverlay) {
    // Open sidebar when menu button is clicked
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      menuOverlay.classList.toggle("active");
    });
    // Close sidebar when the overlay is clicked
    menuOverlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      menuOverlay.classList.remove("active");
    });
  }

  // --- Logout Button Functionality ---
  const logoutButton = document.querySelector(".logout-btn");
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      // Clear user data from localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loggedInUser");
      // Redirect to login page
      window.location.href = "auth.html";
    });
  }

  // ===================================================================
  // 3. PAGE-SPECIFIC LOGIC
  // ===================================================================

  // --- Auth Page (auth.html) ---
  if (document.querySelector(".auth-page")) {
    const loginBtn = document.getElementById("show-login");
    const signupBtn = document.getElementById("show-signup");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    // Switch to Login view
    loginBtn.addEventListener("click", () => {
      loginForm.classList.add("active");
      signupForm.classList.remove("active");
      loginBtn.classList.add("active");
      signupBtn.classList.remove("active");
    });

    // Switch to Signup view
    signupBtn.addEventListener("click", () => {
      signupForm.classList.add("active");
      loginForm.classList.remove("active");
      signupBtn.classList.add("active");
      loginBtn.classList.remove("active");
    });

    // Handle Signup form submission
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Prevent default submission
      if (!validateSignup()) return; // Stop if validation fails

      const username = document.getElementById("signup-username").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;

      // Store user data in localStorage (for demo purposes)
      const user = { username, email, password };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loggedInUser", username);
      
      alert("Sign up successful!");
      window.location.href = "index.html"; // Redirect to home
    });

    // Handle Login form submission
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Prevent default submission
      if (!validateLogin()) return; // Stop if validation fails

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      const storedUser = JSON.parse(localStorage.getItem("user"));

      // Check credentials
      if (storedUser && storedUser.email === email && storedUser.password === password) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loggedInUser", storedUser.username);
        window.location.href = "index.html"; // Redirect to home
      } else {
        setError(document.getElementById("login-email"), "Invalid email or password.");
        setError(document.getElementById("login-password"), ""); // Clear password error
      }
    });
  }

  // --- Contact Page (contact.html) ---
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Prevent default submission
      if (validateContact()) {
        alert("Message sent successfully! (This is a demo)");
        contactForm.reset();
        // Clear any lingering error messages
        document.querySelectorAll('#contact-form .form-group input, #contact-form .form-group textarea').forEach(clearError);
      }
    });
  }

  // --- Chat Page (index.html) ---
  const chatForm = document.getElementById("chat-form");
  if (chatForm) {
    const messageInput = document.getElementById("message-input");
    const chatArea = document.getElementById("chat-area");
    const newChatBtn = document.querySelector(".new-chat");

    // "Restart Chat" button clears the chat area
    newChatBtn.addEventListener("click", () => {
        chatArea.innerHTML = '<div class="message bot-message"><p>Hello! I\'m ClementGPT. How can I help you today?</p></div>';
    });
    
    // Auto-resize textarea as user types
    messageInput.addEventListener("input", () => {
      messageInput.style.height = "auto"; // Reset height
      messageInput.style.height = `${messageInput.scrollHeight}px`; // Set to content height
    });

    // Handle sending a message
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Check if user is logged in before allowing chat
      if (localStorage.getItem("isLoggedIn") !== "true") {
        alert("Please log in to send a message.");
        window.location.href = "auth.html";
        return;
      }
      
      const userMessage = messageInput.value.trim();
      if (userMessage) {
        addMessage("user", userMessage);
        messageInput.value = "";
        messageInput.style.height = "auto"; // Reset textarea height
        showTypingIndicator();
        // Simulate bot response with a delay
        setTimeout(() => {
          addMessage("bot", getBotResponse(userMessage));
        }, 1500);
      }
    });

    /**
     * Adds a new message to the chat area.
     * @param {string} sender - 'user' or 'bot'.
     * @param {string} text - The message content.
     */
    function addMessage(sender, text) {
      const typingIndicator = document.querySelector(".typing-indicator");
      if (typingIndicator) typingIndicator.parentElement.remove();

      const messageEl = document.createElement("div");
      messageEl.classList.add("message", `${sender}-message`);
      messageEl.innerHTML = `<p>${text}</p>`; // Use innerHTML to render text
      chatArea.appendChild(messageEl);
      chatArea.scrollTop = chatArea.scrollHeight; // Scroll to bottom
    }

    /**
     * Displays a "bot is typing" animated indicator.
     */
    function showTypingIndicator() {
      const messageEl = document.createElement("div");
      messageEl.classList.add("message", "bot-message");
      messageEl.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
      chatArea.appendChild(messageEl);
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    /**
     * Generates a simple, rule-based bot response.
     * @param {string} userMessage - The user's input.
     * @returns {string} The bot's canned response.
     */
    function getBotResponse(userMessage) {
      userMessage = userMessage.toLowerCase();
      if (userMessage.includes("hello") || userMessage.includes("hi")) return "Hello there! How can I assist you?";
      if (userMessage.includes("how are you")) return "I'm just a bot, but I'm doing great! Thanks for asking.";
      if (userMessage.includes("help")) return "You can ask me anything! Try asking about the weather, or just chat with me.";
      if (userMessage.includes("clement")) return "Clement is the leader of the team that created this chatbot.";
      return "I'm not sure how to respond to that. Can you try asking something else?";
    }
  }

  // ===================================================================
  // 4. HELPER FUNCTIONS
  // ===================================================================

  // --- Form Validation Helpers ---

  /**
   * Displays an error message for a form field.
   * @param {HTMLElement} inputElement - The input or textarea element.
   * @param {string} message - The error message to display.
   */
  function setError(inputElement, message) {
    const formGroup = inputElement.parentElement;
    const errorDisplay = formGroup.querySelector(".error");
    errorDisplay.innerText = message;
    errorDisplay.style.display = message ? "block" : "none";
    inputElement.classList.toggle("invalid", !!message);
  }

  /**
   * Clears the error message for a form field.
   * @param {HTMLElement} inputElement - The input or textarea element.
   */
  function clearError(inputElement) {
    setError(inputElement, "");
  }

  // Add live event listeners to all form inputs to clear errors as the user types.
  document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
    input.addEventListener('input', () => clearError(input));
  });

  // --- Specific Form Validation Logic ---
  
  function validateLogin() {
    let isValid = true;
    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");
    if (!email.value.trim()) { isValid = false; setError(email, "Email is required."); }
    if (!password.value.trim()) { isValid = false; setError(password, "Password is required."); }
    return isValid;
  }

  function validateSignup() {
    let isValid = true;
    const username = document.getElementById("signup-username");
    const email = document.getElementById("signup-email");
    const password = document.getElementById("signup-password");
    if (!username.value.trim()) { isValid = false; setError(username, "Username is required."); }
    if (!email.value.trim()) { isValid = false; setError(email, "Email is required."); } 
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { isValid = false; setError(email, "Please enter a valid email address."); }
    if (!password.value.trim()) { isValid = false; setError(password, "Password is required."); }
    return isValid;
  }

  function validateContact() {
    let isValid = true;
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const message = document.getElementById("message");
    if (!name.value.trim()) { isValid = false; setError(name, "Name is required."); }
    if (!email.value.trim()) { isValid = false; setError(email, "Email is required."); } 
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { isValid = false; setError(email, "Enter a valid email address."); }
    if (!message.value.trim()) { isValid = false; setError(message, "Message is required."); }
    return isValid;
  }
});

/**
 * Updates the profile section in the sidebar based on login state.
 * This is a global function that can be called from anywhere.
 */
function updateProfile() {
  const profileSection = document.querySelector(".sidebar-footer .profile");
  const logoutButton = document.querySelector(".sidebar-footer .logout-btn");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (profileSection) {
    if (isLoggedIn) {
      const username = localStorage.getItem("loggedInUser") || "User";
      // Display user's avatar and name
      profileSection.innerHTML = `
        <div class="profile-avatar">${username.charAt(0).toUpperCase()}</div>
        <span class="profile-name">${username}</span>
      `;
      if (logoutButton) logoutButton.style.display = "block";
    } else {
      // Display a login button
      profileSection.innerHTML = `<a href="auth.html" class="login-btn">Login / Sign Up</a>`;
      if (logoutButton) logoutButton.style.display = "none";
    }
  }
}
