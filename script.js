document.addEventListener("DOMContentLoaded", () => {
  // --- Global --- //
  updateProfileSection();

  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  const sidebar = document.querySelector(".sidebar");
  const mobileMenuBackdrop = document.getElementById("mobile-menu-backdrop");

  if (menuToggleBtn && sidebar && mobileMenuBackdrop) {
    menuToggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-open");
      mobileMenuBackdrop.classList.toggle("active");
    });

    mobileMenuBackdrop.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open");
      mobileMenuBackdrop.classList.remove("active");
    });
  }

  const logoutButton = document.querySelector(".logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loggedInUser");
      updateProfileSection();
      window.location.href = "index.html";
    });
  }

  // --- Page Specific Logic --- //

  // Auth Page (auth.html)
  if (document.getElementById("auth-view")) {
    const showLoginBtn = document.getElementById("show-login-btn");
    const showSignupBtn = document.getElementById("show-signup-btn");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    showLoginBtn.addEventListener("click", () => {
      loginForm.classList.add("active");
      signupForm.classList.remove("active");
      showLoginBtn.classList.add("active");
      showSignupBtn.classList.remove("active");
    });

    showSignupBtn.addEventListener("click", () => {
      signupForm.classList.add("active");
      loginForm.classList.remove("active");
      showSignupBtn.classList.add("active");
      showLoginBtn.classList.remove("active");
    });

    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validateSignupForm()) return;

      const username = document.getElementById("signup-username").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;

      const user = { username, email, password };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loggedInUser", username);
      alert("Sign up successful!");
      window.location.href = "index.html";
    });

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validateLoginForm()) return;

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (
        storedUser &&
        storedUser.email === email &&
        storedUser.password === password
      ) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loggedInUser", storedUser.username);
        window.location.href = "index.html";
      } else {
        setError(document.getElementById("login-email"), "Invalid email or password.");
        setError(document.getElementById("login-password"), "");
      }
    });
  }

  // Contact Page (contact.html)
  if (document.getElementById("contact-view")) {
    const contactForm = document.getElementById("contact-form");
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (validateContactForm()) {
        const successMessage = document.getElementById("form-success-message");
        if (successMessage) {
          successMessage.style.display = "block";
        }
        const formContainer = document.querySelector(".contact-form-container");
        if (formContainer) formContainer.style.display = "none";

        setTimeout(() => {
          contactForm.reset();
          if (formContainer) formContainer.style.display = "block";
          if (successMessage) {
            successMessage.style.display = "none";
          }
        }, 5000);
      }
    });
  }

  // Chat Page (index.html)
  if (document.getElementById("chat-view")) {
    const messageForm = document.getElementById("message-form");
    const messageInput = document.getElementById("message-input");
    const messageArea = document.getElementById("message-area");
    const newChatBtn = document.getElementById("new-chat-btn");

    if (newChatBtn) {
      newChatBtn.addEventListener("click", () => {
        if (messageArea) {
          messageArea.innerHTML =
            '<div class="message bot-message"><p>Hello! I\'m ClementGPT. How can I help you today?</p></div>';
        }
      });
    }

    if (messageInput) {
      messageInput.addEventListener("input", () => {
        const textarea = messageInput;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      });
    }

    if (messageForm) {
      messageForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const userMessage = messageInput.value.trim();
        if (userMessage) {
          addMessage("user", userMessage);
          messageInput.value = "";
          messageInput.style.height = "auto";
          showTypingIndicator();
          setTimeout(() => {
            const botResponse = getBotResponse(userMessage);
            addMessage("bot", botResponse);
          }, 1500);
        }
      });
    }

    function addMessage(sender, text) {
      // Remove typing indicator before adding new message
      const typingIndicator = document.querySelector(".typing-indicator");
      if (typingIndicator) {
        typingIndicator.parentElement.remove();
      }

      const messageElement = document.createElement("div");
      messageElement.classList.add("message", `${sender}-message`);
      const p = document.createElement("p");
      p.textContent = text;
      messageElement.appendChild(p);
      messageArea.appendChild(messageElement);
      messageArea.scrollTop = messageArea.scrollHeight;
    }

    function showTypingIndicator() {
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", "bot-message");
      const typingIndicator = document.createElement("div");
      typingIndicator.classList.add("typing-indicator");
      typingIndicator.innerHTML = "<span></span><span></span><span></span>";
      messageElement.appendChild(typingIndicator);
      messageArea.appendChild(messageElement);
      messageArea.scrollTop = messageArea.scrollHeight;
    }

    function getBotResponse(userMessage) {
      userMessage = userMessage.toLowerCase();
      if (userMessage.includes("hello") || userMessage.includes("hi")) {
        return "Hello there! How can I assist you?";
      } else if (userMessage.includes("how are you")) {
        return "I'm just a bot, but I'm doing great! Thanks for asking.";
      } else if (userMessage.includes("help")) {
        return "You can ask me anything! Try asking about the weather, or just chat with me.";
      } else if (userMessage.includes("clement")) {
        return "Clement is the creator of this chatbot.";
      } else {
        return "I'm not sure how to respond to that. Can you try asking something else?";
      }
    }
  }

  // --- Improved Inline Error Handling ---

  // Show and clear errors as user types or changes any field (input or textarea)
  document.querySelectorAll('.input-group input, .input-group textarea').forEach((input) => {
    input.addEventListener('input', () => {
      clearError(input);
    });
    input.addEventListener('blur', () => {
      // Optionally re-validate on blur for instant feedback
      if (input.form && input.form.id === "login-form") {
        validateLoginForm();
      }
      if (input.form && input.form.id === "signup-form") {
        validateSignupForm();
      }
      if (input.form && input.form.id === "contact-form") {
        validateContactForm();
      }
    });
  });

  // --- Form Validation Helpers (used by multiple pages) ---
  function setError(element, message) {
    const inputGroup = element.closest('.input-group');
    if (!inputGroup) return;
    const errorDisplay = inputGroup.querySelector(".error-message");
    if (errorDisplay) {
      errorDisplay.innerText = message;
      errorDisplay.style.display = message ? "block" : "none";
    }
    element.classList.toggle("invalid", !!message);
  }

  function clearError(element) {
    const inputGroup = element.closest('.input-group');
    if (!inputGroup) return;
    const errorDisplay = inputGroup.querySelector(".error-message");
    if (errorDisplay) {
      errorDisplay.innerText = "";
      errorDisplay.style.display = "none";
    }
    element.classList.remove("invalid");
  }

  function validateLoginForm() {
    let isValid = true;
    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");

    clearError(email);
    clearError(password);

    if (!email.value) {
      setError(email, "Email is required.");
      isValid = false;
    }
    if (!password.value) {
      setError(password, "Password is required.");
      isValid = false;
    }
    return isValid;
  }

  function validateSignupForm() {
    let isValid = true;
    const username = document.getElementById("signup-username");
    const email = document.getElementById("signup-email");
    const password = document.getElementById("signup-password");

    clearError(username);
    clearError(email);
    clearError(password);

    if (!username.value) {
      setError(username, "Username is required.");
      isValid = false;
    }
    if (!email.value) {
      setError(email, "Email is required.");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      setError(email, "Please enter a valid email address.");
      isValid = false;
    }
    if (!password.value) {
      setError(password, "Password is required.");
      isValid = false;
    }
    return isValid;
  }

  function validateContactForm() {
    let isValid = true;
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const message = document.getElementById("message");

    clearError(name);
    clearError(email);
    clearError(message);

    // Name: only letters and spaces
    const namePattern = /^[A-Za-z\s]+$/;
    if (!name.value.trim()) {
      setError(name, "Name is required.");
      isValid = false;
    } else if (!namePattern.test(name.value.trim())) {
      setError(name, "Name must not contain numbers or special characters.");
      isValid = false;
    }

    // Email: must contain '@'
    if (!email.value.trim()) {
      setError(email, "Email is required.");
      isValid = false;
    } else if (!email.value.includes('@')) {
      setError(email, "Email must contain '@' to be valid.");
      isValid = false;
    } else {
      // Full pattern check for valid email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value.trim())) {
        setError(email, "Enter a valid email address.");
        isValid = false;
      }
    }

    if (!message.value.trim()) {
      setError(message, "Message is required.");
      isValid = false;
    }

    return isValid;
  }
});

// --- Global Functions ---
function updateProfileSection() {
  const profileSection = document.querySelector(
    ".sidebar-footer .profile-section"
  );
  const logoutButton = document.querySelector(".sidebar-footer .logout-button");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (isLoggedIn) {
    const username = localStorage.getItem("loggedInUser");
    if (profileSection) {
      profileSection.innerHTML = `
                <div class="profile-avatar">${username
                  .charAt(0)
                  .toUpperCase()}</div>
                <span class="profile-name">${username}</span>
            `;
    }
    if (logoutButton) logoutButton.style.display = "flex";
  } else {
    if (profileSection) {
      profileSection.innerHTML = `<a href="auth.html" class="login-prompt-btn">Login / Sign Up</a>`;
    }
    if (logoutButton) logoutButton.style.display = "none";
  }
}