const usernameInput = document.getElementById("username");
const searchButton = document.getElementById("searchButton");

searchButton.addEventListener("click", async function () {
  const username = usernameInput.value.trim();

  if (!username) {
    console.error("Please enter a username.");
    return;
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}`);

    if (response.ok) {
      const userData = await response.json();
      console.log("User Data:", userData);
    } else {
      console.error("User not found.");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
});
