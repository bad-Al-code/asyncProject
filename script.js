const usernameInput = document.getElementById("username");
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
  const username = usernameInput.value.trim();
  console.log(`User Entered username: ${username}`);

  if (!username) {
    userDetails.textContent = "Please enter a username";
    return;
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    console.log(`API response status: ${response.status}`); // get either response.status || response.ok

    if (response.status !== 200) {
      userDetails.textContent = "API error.";
    }

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
        `https://api.github.com/users/${username}/repos`,
      );
      console.log(repoResponse);

      if (repoResponse.ok) {
        const userRepos = await repoResponse.json();
        console.log("User Repos: ", userRepos); // https://jsonformatter.org/json-pretty-print => see html_url is there

        // chatGPT: https://chatgpt.com/share/b74cccf3-1b7f-4b50-b7cd-dd267e1999be
        const topFiveRepos = userRepos.slice(0, 5);
        console.log(topFiveRepos);

        // chatgpt:https://chatgpt.com/share/b74cccf3-1b7f-4b50-b7cd-dd267e1999be
        let totalStars = 0;
        for (const repo of userRepos) {
          totalStars += repo.stargazers_count;
        }

        userDetails.innerHTML += `Total Stars: ${formatNumber(
          totalStars,
        )} <br>`;

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
      userDetails.textContent = "User not found";
    }
  } catch (error) {
    console.log(error);

    console.error("Error fetching user data: ", error);
    userDetails.textContent = "Something went wrong. Please try again later";
  }
});
