const usernameInput = document.getElementById("username");
const searchButton = document.getElementById("searchButton");
const userDetails = document.getElementById("user-details");
const repositoriesList = document.getElementById("repositories-list");
const issuesList = document.getElementById("issues-list");
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

async function fetchUserRepos(username) {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos`,
  );

  if (!response.ok) {
    throw new ApiError("Failed to fetch user repos");
  }

  return await response.json();
}

async function fetchUserIssues(username, repo) {
  const response = await fetch(
    `https://api.github.com/repos/${username}/${repo}/issues`,
  );
  // console.log(response);

  if (!response.ok) {
    throw new ApiError("Failed to fetch user repo issues");
  }

  return await response.json();
}

function displayUserDetails(userData) {
  userDetails.innerHTML = `     <p>Username: ${userData.login}</p>
    <p>Name: ${userData.name || "-"}</p>
    <p>Bio: ${userData.bio || "-"}</p>
    <p>Public Repos: ${userData.public_repos}</p>
    <p>Followers: ${formatNumber(userData.followers)}</p>
    <p>Following: ${formatNumber(userData.following)}</p>
  `;
}

function displayUserRepos(userRepos) {
  // const topFiveRepos = userRepos.slice(0, 5);

  let totalStars = 0;
  for (const repo of userRepos) {
    totalStars += repo.stargazers_count;
  }

  userDetails.innerHTML += `<p>Total Stars: ${formatNumber(totalStars)}</p>`;

  repositoriesList.innerHTML = "";
  userRepos.forEach((repo) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a>`;
    repositoriesList.appendChild(listItem);
  });
}

async function displayUserIssues(username, userRepos) {
  issuesList.innerHTML = "";
  for (const repo of userRepos) {
    const issues = await fetchUserIssues(username, repo.name);

    if (issues.length > 0) {
      const repoHeading = document.createElement("h3");
      repoHeading.textContent = repo.name;
      issuesList.appendChild(repoHeading);

      issues.forEach((issue) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a href="${issue.html_url}" target="_blank">${issue.title}</a>`;
        issuesList.appendChild(listItem);
      });
    }
  }
}

const fetchData = async () => {
  const username = usernameInput.value.trim();

  if (!username) {
    userDetails.textContent = "Please enter a username";
    repositoriesList.textContent = "Please enter a username";
    issuesList.textContent = "Please enter a username";
    return;
  }

  try {
    const userData = await fetchUserData(username);
    displayUserDetails(userData);

    // const userRepos = await fetchUserRepos(username);
    // displayUserRepos(userRepos);

    // await displayUserIssues(username, userRepos);
    repoFetched = false;
    issueFetched = false;
    userRepos = [];
  } catch (error) {
    console.error("Error fetching user data: ", error);
    userDetails.textContent = "Failed to fetch user data";
    repositoriesList.textContent = "Failed to fetch user repos";
    issuesList.textContent = "Failed to fetch user issues";
  }
};

let repoFetched = false;
let issueFetched = false;
let userRepos = [];

tabs.forEach((tab) => {
  tab.addEventListener("click", async () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    tabContents.forEach((content) => {
      content.classList.remove("active");
    });
    document.getElementById(tab.dataset.tab).classList.add("active");

    if (tab.dataset.tab === "repositories-list" && !repoFetched) {
      const username = usernameInput.value.trim();
      if (username) {
        try {
          userRepos = await fetchUserRepos(username);
          displayUserRepos(userRepos);
          repoFetched = true;
        } catch (error) {
          console.error("Error fetching user repos: ", error);
          repositoriesList.textContent = "Failed to fetch user repos";
        }
      }
    }
    if (tab.dataset.tab === "issues-list" && !issueFetched) {
      const username = usernameInput.value.trim();
      if (username && userRepos.length > 0) {
        try {
          await displayUserIssues(username, userRepos);
          issueFetched = true;
        } catch (error) {
          console.error("Error fetching user issues: ", error);
          repositoriesList.textContent = "Failed to fetch user issues";
        }
      }
    }
  });
});

usernameInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchButton.click();
  }
});

searchButton.addEventListener("click", fetchData);
