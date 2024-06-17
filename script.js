const userNameInput = document.getElementById("username");
const searchButton = document.getElementById("searchButton");
const userInfo = document.getElementById("user-info");

searchButton.addEventListener("click", async () => {
  const username = userNameInput.value.trim();
  console.log(`User Entered username: ${username}`);

  if (!username) {
    userInfo.textContent = "Please enter a username";
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    console.log(`API response status: ${response.status}`); // get either response.status || response.ok

    if (response.status === 200) {
      const userData = await response.json();
      console.log("User Data: ", userData);

      userInfo.innerHTML = `
        Username: ${userData.login} <br>
        Name: ${userData.name} <br> 
        Bio: ${userData.bio}
      `;
    } else {
      userInfo.textContent = "User not found";
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
    userInfo.textContent = "Something went wrong. Please try again later";
  }
});
