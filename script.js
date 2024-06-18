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

class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchUserData(username) {
  const response = await fetch(`https://api.github.com/users/${username}`);

  if (response.status !== 200) {
    throw new ApiError(`API error: ${response.status}`);
  }

  return await response.json();
}

async function fetUserRepos(username) {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos`,
  );

  if (response.status !== 200) {
    throw new ApiError("Failed to fetch user repos");
  }

  return await response.json();
}

function displayUserDetails(userData) {
  userDetails.innerHTML = `
        Username: ${userData.login} <br>
        Name: ${userData.name} <br> 
        Bio: ${userData.bio} <br>
        Public Repos: ${userData.public_repos} <br>
        Followers: ${formatNumber(userData.followers)} <br>
        Following: ${formatNumber(userData.following)} <br>
      `;
}

function displayUserRepos(userRepos) {
  const topFiveRepos = userRepos.slice(0, 5);
  // console.log(topFiveRepos);

  // chatgpt:https://chatgpt.com/share/b74cccf3-1b7f-4b50-b7cd-dd267e1999be
  let totalStars = 0;
  for (const repo of userRepos) {
    totalStars += repo.stargazers_count;
  }

  userDetails.innerHTML += `Total Stars: ${formatNumber(totalStars)} <br>`;

  repositoriesList.innerHTML = "";
  topFiveRepos.forEach((repo) => {
    const listItem = document.createElement("li");
    // console.log(repo.html_url);
    listItem.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a>`;
    repositoriesList.appendChild(listItem);
  });
}

searchButton.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  console.log(`User Entered username: ${username}`);

  if (!username) {
    userDetails.textContent = "Please enter a username";
    return;
  }

  try {
    const userData = await fetchUserData(username);
    displayUserDetails(userData);

    const userRepos = await fetUserRepos(username);
    displayUserRepos(userRepos);
  } catch (error) {
    console.error("Error fetching user data: ", error);
    userDetails.textContent = "Something  went wrong.";
  }
});
