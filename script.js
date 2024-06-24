const perPage = 10;
let currentPage = 1;

const usernameInput = document.getElementById("username");
const searchButton = document.getElementById("searchButton");
const userDetails = document.getElementById("user-details");
const repositoriesList = document.getElementById("repositories-list-content");
const issuesList = document.getElementById("issues-list-content");
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");
const loadingIndicatorUserDetails = document.getElementById(
  "loadingIndicatorUserDetails"
);
const loadingIndicatorRepositories = document.getElementById(
  "loadingIndicatorRepositories"
);
const loadingIndicatorIssues = document.getElementById(
  "loadingIndicatorIssues"
);

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
    `https://api.github.com/users/${username}/repos`
  );

  if (!response.ok) {
    throw new ApiError("Failed to fetch user repos");
  }

  return await response.json();
}

async function fetchUserIssues(username, repo) {
  const response = await fetch(
    `https://api.github.com/repos/${username}/${repo}/issues`
  );

  if (!response.ok) {
    throw new ApiError("Failed to fetch user repo issues");
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
  repositoriesList.innerHTML = "";

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedRepos = userRepos.slice(startIndex, endIndex);

  paginatedRepos.forEach((repo) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a>`;
    repositoriesList.appendChild(listItem);
  });

  updatePaginationControls(userRepos.length);
}

function updatePaginationControls(totalRepos) {
  const totalPages = Math.ceil(totalRepos / perPage);

  const paginationControls = document.getElementById("pagination-controls");
  paginationControls.innerHTML = "";

  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.disabled = currentPage === 1;
  prevButton.classList.add("pagination-button");
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchAndDisplayRepos(usernameInput.value.trim());
    }
  });
  paginationControls.appendChild(prevButton);

  const pageNumber = document.createElement("span");
  pageNumber.textContent = `Page ${currentPage} of ${totalPages}`;
  paginationControls.appendChild(pageNumber);

  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.disabled = currentPage === totalPages;
  nextButton.classList.add("pagination-button");
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchAndDisplayRepos(usernameInput.value.trim());
    }
  });
  paginationControls.appendChild(nextButton);
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

  loadingIndicatorIssues.style.display = "none";
}

async function fetchAndDisplayRepos(username) {
  loadingIndicatorRepositories.style.display = "block";

  try {
    const userRepos = await fetchUserRepos(username);
    displayUserRepos(userRepos);
  } catch (error) {
    console.error("Error fetching user repos: ", error);
    repositoriesList.textContent = "Failed to fetch user repos";
  } finally {
    loadingIndicatorRepositories.style.display = "none";
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

  loadingIndicatorUserDetails.style.display = "block";

  try {
    const userData = await fetchUserData(username);
    displayUserDetails(userData);

    repoFetched = false;
    issueFetched = false;
    userRepos = [];
  } catch (error) {
    console.error("Error fetching user data: ", error);
    userDetails.textContent = "Failed to fetch user data";
    repositoriesList.textContent = "Failed to fetch user repos";
    issuesList.textContent = "Failed to fetch user issues";
  } finally {
    loadingIndicatorUserDetails.style.display = "none";
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

    switch (tab.dataset.tab) {
      case "repositories-list":
        if (!repoFetched) {
          const username = usernameInput.value.trim();
          if (username) {
            currentPage = 1; // Reset current page when switching to repositories tab
            await fetchAndDisplayRepos(username);
            repoFetched = true;
          }
        }
        break;
      case "issues-list":
        if (!issueFetched) {
          const username = usernameInput.value.trim();
          if (username && userRepos.length > 0) {
            loadingIndicatorIssues.style.display = "block";
            await displayUserIssues(username, userRepos);
            issueFetched = true;
          }
        }
        break;
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
