const userNameInput = document.getElementById("username");
const searchButton = document.getElementById("searchButton");
const userDetails = document.getElementById("user-details");
const repositoriesList = document.getElementById("repositories-list");

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  } else {
    return num.toString();
  }
};

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

      userDetails.innerHTML = `
        Username: ${userData.login} <br>
        Name: ${userData.name} <br> 
        Bio: ${userData.bio} <br>
        Public Repos: ${userData.public_repos} <br>
        Followers: ${formatNumber(userData.followers)} <br>
        Following: ${formatNumber(userData.following)} <br>
      `;

      const repoResponse = await fetch(
        `https://api.github.com/users/${username}/repos`
      );
      console.log(repoResponse);

      if (repoResponse.ok) {
        const userRepos = await repoResponse.json();
        console.log("User Repos: ", userRepos); // https://jsonformatter.org/json-pretty-print => see html_url is there

        // chatGPT: https://chatgpt.com/share/b74cccf3-1b7f-4b50-b7cd-dd267e1999be
        const topFiveRepos = userRepos.slice(0, 5);
        console.log(topFiveRepos);

        repositoriesList.innerHTML = "";
        topFiveRepos.forEach((repo) => {
          const listItem = document.createElement("li");
          console.log(repo.html_url);
          listItem.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a>`;
          repositoriesList.appendChild(listItem);
        });
      } else {
        console.error("Can't get the repos");
      }
    } else {
      userInfo.textContent = "User not found";
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
    userInfo.textContent = "Something went wrong. Please try again later";
  }
});
