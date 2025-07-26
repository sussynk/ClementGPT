// Executed when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Update profile section based on login status
  updateProfile();

  // Handle sidebar toggle for mobile view
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const menuOverlay = document.querySelector(".mobile-menu-overlay");

  // Check if all mobile menu elements exist
  if (menuToggle && sidebar && menuOverlay) {
    // Event listeners for the menu toggle button (hamburger icon)
    menuToggle.addEventListener("click", () => {
      // Show or hide the sidebar and overlay
      sidebar.classList.toggle("open");
      menuOverlay.classList.toggle("active");
    });

    // Event listener for the overlay to close the sidebar when clicked
    menuOverlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      menuOverlay.classList.remove("active");
    });
  }

  // Handle logout functionality
  const logoutButton = document.querySelector(".logout-btn");
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      // Prevent default action
      e.preventDefault();
      // Remove user session data from localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loggedInUser");
      // Redirect to the authentication page
      window.location.href = "auth.html";
    });
  }

  // Handle authentication page functionality
  // Check if we are on the authentication page
  if (document.querySelector(".auth-page")) {
    const loginBtn = document.getElementById("show-login");
    const signupBtn = document.getElementById("show-signup");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    // Event listeners to switch between login forms
    loginBtn.addEventListener("click", () => {
      loginForm.classList.add("active");
      signupForm.classList.remove("active");
      loginBtn.classList.add("active");
      signupBtn.classList.remove("active");
    });

    // Event listener to switch to the signup form
    signupBtn.addEventListener("click", () => {
      signupForm.classList.add("active");
      loginForm.classList.remove("active");
      signupBtn.classList.add("active");
      loginBtn.classList.remove("active");
    });

    // Event listeners for signup form submissions
    signupForm.addEventListener("submit", (e) => {
      // Prevent default form submission
      e.preventDefault();
      // Stop if validation fails
      if (!validateSignup()) return;

      // Get user input values from the form
      const username = document.getElementById("signup-username").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;

      // Create a user object and store it in localStorage
      const user = { username, email, password };
      localStorage.setItem("user", JSON.stringify(user));
      // Set login status in localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loggedInUser", username);

      alert("Sign up successful!");
      // Redirect to the main chat page
      window.location.href = "index.html";
    });

    // Event listeners for login form submissions
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Stop if validation fails
      if (!validateLogin()) return;

      // Get credentials from the form
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      // Retrieve stored user data from localStorage
      const storedUser = JSON.parse(localStorage.getItem("user"));

      // Check if the stored user matches the input credentials
      if (
        storedUser &&
        storedUser.email === email &&
        storedUser.password === password
      ) {
        // Set login status in localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loggedInUser", storedUser.username);
        window.location.href = "index.html";
      } else {
        // Show error message if credentials are invalid
        setError(
          document.getElementById("login-email"),
          "Invalid email or password."
        );
        setError(document.getElementById("login-password"), "");
      }
    });
  }

  // Handle contact form submission
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Check if the form is valid
      if (validateContact()) {
        // Show success message
        alert("Message sent successfully!");
        // Clear the form fields
        contactForm.reset();
        // Clear any existing error messages
        document
          .querySelectorAll(
            "#contact-form .form-group input, #contact-form .form-group textarea"
          )
          .forEach(clearError);
      }
    });
  }

  // Handle chat functionality
  const chatForm = document.getElementById("chat-form");
  if (chatForm) {
    const messageInput = document.getElementById("message-input");
    const chatArea = document.getElementById("chat-area");
    const newChatBtn = document.querySelector(".new-chat");

    // Event listener for the "Reset Chat" button
    newChatBtn.addEventListener("click", () => {
      // Reset the chat area to the initial state
      chatArea.innerHTML =
        '<div class="message bot-message"><p>Hello! I\'m ClementGPT. How can I help you today?</p></div>';
    });

    // Auto-resize the textarea as the user types
    messageInput.addEventListener("input", () => {
      messageInput.style.height = "auto";
      messageInput.style.height = `${messageInput.scrollHeight}px`;
    });

    // Event listener for the chat form submission
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Check if the user is logged in before sending a message
      if (localStorage.getItem("isLoggedIn") !== "true") {
        alert("Please log in to send a message.");
        window.location.href = "auth.html";
        return;
      }
      
      const userMessage = messageInput.value.trim();
      if (userMessage) {
        // Add the user's message to the chat area
        addMessage("user", userMessage);
        // Clear the input field
        messageInput.value = "";
        // Reset the height of the input field
        messageInput.style.height = "auto";
        // Show typing indicator and simulate bot response
        showTypingIndicator();
        setTimeout(() => {
          addMessage("bot", getBotResponse(userMessage));
        }, 1500);
      }
    });

    // Function to add a message to the chat area
    function addMessage(sender, text) {
      // Remove any existing typing indicator before adding a new message
      const typingIndicator = document.querySelector(".typing-indicator");
      if (typingIndicator) typingIndicator.parentElement.remove();

      const messageEl = document.createElement("div");
      messageEl.classList.add("message", `${sender}-message`);
      messageEl.innerHTML = `<p>${text}</p>`;
      chatArea.appendChild(messageEl);
      // Scroll to the bottom of the chat area
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    // Function to show a typing indicator in the chat area
    function showTypingIndicator() {
      const messageEl = document.createElement("div");
      messageEl.classList.add("message", "bot-message");
      messageEl.innerHTML =
        '<div class="typing-indicator"><span></span><span></span><span></span></div>';
      chatArea.appendChild(messageEl);
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    // Generates a bot response based on user input
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
        return `The current time is ${timeString}.`;
      }
      return "I'm not sure how to respond to that. Can you try asking something else?";
    }
  }

  // Form validation functions
  // Helper function to set or clear error messages
  function setError(inputElement, message) {
    const formGroup = inputElement.parentElement;
    const errorDisplay = formGroup.querySelector(".error");
    errorDisplay.innerText = message;
    errorDisplay.style.display = message ? "block" : "none";
    // Toggle the invalid class based on whether there is an error message
    inputElement.classList.toggle("invalid", !!message);
  }

  // Helper function to clear error messages
  function clearError(inputElement) {
    setError(inputElement, "");
  }

  // Attach input event listeners to clear error messages on user input
  document
    .querySelectorAll(".form-group input, .form-group textarea")
    .forEach((input) => {
      input.addEventListener("input", () => clearError(input));
    });

  // Validation functions for login form
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

  // Validation functions for signup form
  function validateSignup() {
    let isValid = true;
    const username = document.getElementById("signup-username");
    const email = document.getElementById("signup-email");
    const password = document.getElementById("signup-password");

    // Username validation
    if (!username.value.trim()) {
      isValid = false;
      setError(username, "Username is required.");
    }

    // Email validation
    if (!email.value.trim()) {
      isValid = false;
      setError(email, "Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      // Regex to check for valid email format
      isValid = false;
      setError(email, "Please enter a valid email address.");
    }

    // Password validation
    if (!password.value.trim()) {
      isValid = false;
      setError(password, "Password is required.");
    }
    return isValid;
  }

  // Validation function for contact form
  function validateContact() {
    let isValid = true;
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const message = document.getElementById("message");

    // Regex to validate name (only letters and spaces)
    const nameRegex = /^[a-zA-Z\s]+$/;

    // Name validation
    if (!name.value.trim()) {
      isValid = false;
      setError(name, "Name is required.");
    } else if (!nameRegex.test(name.value)) {
      isValid = false;
      setError(name, "Name can only contain letters and spaces.");
    }

    // Email validation
    if (!email.value.trim()) {
      isValid = false;
      setError(email, "Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      isValid = false;
      setError(email, "Enter a valid email address.");
    }

    // Message validation
    if (!message.value.trim()) {
      isValid = false;
      setError(message, "Message is required.");
    }

    return isValid;
  }
});

// Update the profile section in the sidebar based on login status
function updateProfile() {
  const profileSection = document.querySelector(".sidebar-footer .profile");
  const logoutButton = document.querySelector(".sidebar-footer .logout-btn");
  // Check login status from localStorage
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (profileSection) {
    if (isLoggedIn) {
      // If user is logged in, display their profile information
      const username = localStorage.getItem("loggedInUser") || "User";
      profileSection.innerHTML = `
        <div class="profile-avatar">${username.charAt(0).toUpperCase()}</div>
        <span class="profile-name">${username}</span>
      `;
      // Show the logout button if it exists
      if (logoutButton) logoutButton.style.display = "block";
    } else {
      // If user is not logged in, show login/signup link
      profileSection.innerHTML = `<a href="auth.html" class="login-btn">Login / Sign Up</a>`;
      // Hide the logout button if it exists
      if (logoutButton) logoutButton.style.display = "none";
    }
  }
}
