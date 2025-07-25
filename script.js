document.addEventListener("DOMContentLoaded", () => {
  updateProfile();

  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const menuOverlay = document.querySelector(".mobile-menu-overlay");

  if (menuToggle && sidebar && menuOverlay) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      menuOverlay.classList.toggle("active");
    });
    menuOverlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      menuOverlay.classList.remove("active");
    });
  }

  const logoutButton = document.querySelector(".logout-btn");
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loggedInUser");
      window.location.href = "auth.html";
    });
  }

  if (document.querySelector(".auth-page")) {
    const loginBtn = document.getElementById("show-login");
    const signupBtn = document.getElementById("show-signup");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    loginBtn.addEventListener("click", () => {
      loginForm.classList.add("active");
      signupForm.classList.remove("active");
      loginBtn.classList.add("active");
      signupBtn.classList.remove("active");
    });

    signupBtn.addEventListener("click", () => {
      signupForm.classList.add("active");
      loginForm.classList.remove("active");
      signupBtn.classList.add("active");
      loginBtn.classList.remove("active");
    });

    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateSignup()) return;

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

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateLogin()) return;

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
        setError(
          document.getElementById("login-email"),
          "Invalid email or password."
        );
        setError(document.getElementById("login-password"), "");
      }
    });
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (validateContact()) {
        alert("Message sent successfully! (This is a demo)");
        contactForm.reset();
        document
          .querySelectorAll(
            "#contact-form .form-group input, #contact-form .form-group textarea"
          )
          .forEach(clearError);
      }
    });
  }

  const chatForm = document.getElementById("chat-form");
  if (chatForm) {
    const messageInput = document.getElementById("message-input");
    const chatArea = document.getElementById("chat-area");
    const newChatBtn = document.querySelector(".new-chat");

    newChatBtn.addEventListener("click", () => {
      chatArea.innerHTML =
        '<div class="message bot-message"><p>Hello! I\'m ClementGPT. How can I help you today?</p></div>';
    });

    messageInput.addEventListener("input", () => {
      messageInput.style.height = "auto";
      messageInput.style.height = `${messageInput.scrollHeight}px`;
    });

    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (localStorage.getItem("isLoggedIn") !== "true") {
        alert("Please log in to send a message.");
        window.location.href = "auth.html";
        return;
      }

      const userMessage = messageInput.value.trim();
      if (userMessage) {
        addMessage("user", userMessage);
        messageInput.value = "";
        messageInput.style.height = "auto";
        showTypingIndicator();
        setTimeout(() => {
          addMessage("bot", getBotResponse(userMessage));
        }, 1500);
      }
    });

    function addMessage(sender, text) {
      const typingIndicator = document.querySelector(".typing-indicator");
      if (typingIndicator) typingIndicator.parentElement.remove();

      const messageEl = document.createElement("div");
      messageEl.classList.add("message", `${sender}-message`);
      messageEl.innerHTML = `<p>${text}</p>`;
      chatArea.appendChild(messageEl);
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    function showTypingIndicator() {
      const messageEl = document.createElement("div");
      messageEl.classList.add("message", "bot-message");
      messageEl.innerHTML =
        '<div class="typing-indicator"><span></span><span></span><span></span></div>';
      chatArea.appendChild(messageEl);
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    function getBotResponse(userMessage) {
      userMessage = userMessage.toLowerCase();
      if (userMessage.includes("hello") || userMessage.includes("hi"))
        return "Hello there! How can I assist you?";
      if (userMessage.includes("how are you"))
        return "I'm just a bot, but I'm doing great! Thanks for asking.";
      if (userMessage.includes("help"))
        return "You can ask me anything! Try asking about the weather, or just chat with me.";
      if (userMessage.includes("clement"))
        return "Clement is the leader of the team that created this chatbot.";
      if (userMessage.includes("time")) {
        const now = new Date();
        const timeString = now.toLocaleTimeString("en-MY", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        return `The current time in Subang Jaya is ${timeString}.`;
      }
      return "I'm not sure how to respond to that. Can you try asking something else?";
    }
  }

  function setError(inputElement, message) {
    const formGroup = inputElement.parentElement;
    const errorDisplay = formGroup.querySelector(".error");
    errorDisplay.innerText = message;
    errorDisplay.style.display = message ? "block" : "none";
    inputElement.classList.toggle("invalid", !!message);
  }

  function clearError(inputElement) {
    setError(inputElement, "");
  }

  document
    .querySelectorAll(".form-group input, .form-group textarea")
    .forEach((input) => {
      input.addEventListener("input", () => clearError(input));
    });

  function validateLogin() {
    let isValid = true;
    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");
    if (!email.value.trim()) {
      isValid = false;
      setError(email, "Email is required.");
    }
    if (!password.value.trim()) {
      isValid = false;
      setError(password, "Password is required.");
    }
    return isValid;
  }

  function validateSignup() {
    let isValid = true;
    const username = document.getElementById("signup-username");
    const email = document.getElementById("signup-email");
    const password = document.getElementById("signup-password");
    if (!username.value.trim()) {
      isValid = false;
      setError(username, "Username is required.");
    }
    if (!email.value.trim()) {
      isValid = false;
      setError(email, "Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      isValid = false;
      setError(email, "Please enter a valid email address.");
    }
    if (!password.value.trim()) {
      isValid = false;
      setError(password, "Password is required.");
    }
    return isValid;
  }

  function validateContact() {
    let isValid = true;
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const message = document.getElementById("message");

    const nameRegex = /^[a-zA-Z\s]+$/;

    if (!name.value.trim()) {
      isValid = false;
      setError(name, "Name is required.");
    } else if (!nameRegex.test(name.value)) {
      isValid = false;
      setError(name, "Name can only contain letters and spaces.");
    }

    if (!email.value.trim()) {
      isValid = false;
      setError(email, "Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      isValid = false;
      setError(email, "Enter a valid email address.");
    }

    if (!message.value.trim()) {
      isValid = false;
      setError(message, "Message is required.");
    }

    return isValid;
  }
});

function updateProfile() {
  const profileSection = document.querySelector(".sidebar-footer .profile");
  const logoutButton = document.querySelector(".sidebar-footer .logout-btn");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (profileSection) {
    if (isLoggedIn) {
      const username = localStorage.getItem("loggedInUser") || "User";
      profileSection.innerHTML = `
        <div class="profile-avatar">${username.charAt(0).toUpperCase()}</div>
        <span class="profile-name">${username}</span>
      `;
      if (logoutButton) logoutButton.style.display = "block";
    } else {
      profileSection.innerHTML = `<a href="auth.html" class="login-btn">Login / Sign Up</a>`;
      if (logoutButton) logoutButton.style.display = "none";
    }
  }
}
