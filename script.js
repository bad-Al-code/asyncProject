const usernameInput = document.getElementById("username");
const searchButton = document.getElementById("searchButton");
const userDetails = document.getElementById("user-details");
const repositoriesList = document.getElementById("repositories-list");
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

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

  if (!response.ok) {
    throw new ApiError(`API error: ${response.status}`);
  }

  return await response.json();
}

async function fetUserRepos(username) {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos`,
  );

  if (!response.ok) {
    throw new ApiError("Failed to fetch user repos");
  }

  return await response.json();
}

function displayUserDetails(userData) {
  userDetails.innerHTML = `
<p>Username: ${userData.login}</p>
    <p>Name: ${userData.name || "-"}</p>
    <p>Bio: ${userData.bio || "-"}</p>
    <p>Public Repos: ${userData.public_repos}</p>
    <p>Followers: ${formatNumber(userData.followers)}</p>
    <p>Following: ${formatNumber(userData.following)}</p>
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

  userDetails.innerHTML += `<p>Total Stars: ${formatNumber(totalStars)}</p>`;

  repositoriesList.innerHTML = "";
  topFiveRepos.forEach((repo) => {
    const listItem = document.createElement("li");
    // console.log(repo.html_url);
    listItem.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a>`;
    repositoriesList.appendChild(listItem);
  });
}

const fetchData = async () => {
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
    userDetails.textContent = "Failed to fetch user data or repos";
  }
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    tabContents.forEach((content) => {
      content.classList.remove("active");
    });
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

usernameInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchButton.click();
  }
});

searchButton.addEventListener("click", fetchData);
