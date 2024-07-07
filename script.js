const perPage = 10;
let currentPage = 1;

// DOM elements
const usernameInput = document.getElementById("username");
const searchButton = document.getElementById("searchButton");
const userDetails = document.getElementById("user-details");
const repositoriesList = document.getElementById("repositories-list-content");
const issuesList = document.getElementById("issues-list-content");
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");
const loadingIndicatorUserDetails = document.getElementById(
  "loadingIndicatorUserDetails",
);
const loadingIndicatorRepositories = document.getElementById(
  "loadingIndicatorRepositories",
);
const loadingIndicatorIssues = document.getElementById(
  "loadingIndicatorIssues",
);

/**
 * Utility function to format large numbers with suffixes (k, M)
 * @param {number} num - The number to format
 * @returns {string} The formatted number with suffix
 */
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  } else {
    return num.toString();
  }
};

/**
 * Custom Error class for API-related errors
 */
class ApiError extends Error {
  /**
   * @param {string} message - The error message
   */
  constructor(message) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch user data from GitHub API
 * @param {string} username - The GitHub username
 * @returns {Promise<Object>} A promise resolving to the user data object
 * @throws {ApiError} Throws error if API response is not successful
 */
async function fetchUserData(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);

    if (!response.ok) {
      throw new ApiError(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user data: ", error);
    throw new ApiError("Failed to fetch user data");
  }
}

/**
 * Fetch user repositories from GitHub API
 * @param {string} username - The GitHub username
 * @returns {Promise<Array<Object>>} A promise resolving to an array of user repository objects
 * @throws {ApiError} Throws error if API response is not successful
 */
async function fetchUserRepos(username) {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos`,
    );

    if (!response.ok) {
      throw new ApiError("Failed to fetch user repos");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user repositories: ", error);
    throw new ApiError("Failed to fetch user repositories");
  }
}

/**
 * Fetch issues for a specific repository from GitHub API
 * @param {string} username - The GitHub username
 * @param {string} repo - The repository name
 * @returns {Promise<Array<Object>>} A promise resolving to an array of issues objects
 * @throws {ApiError} Throws error if API response is not successful
 */
async function fetchUserIssues(username, repo) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${username}/${repo}/issues`,
    );

    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch issues for ${repo}: ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching issues for ${repo}: `, error);
    throw new ApiError(`Failed to fetch issues for ${repo}`);
  }
}

/**
 * Display user details in the UI
 * @param {Object} userData - The user data object fetched from GitHub API
 */
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

/**
 * Display user repositories in the UI
 * @param {Array<Object>} userRepos - An array of user repository objects
 */
function displayUserRepos(userRepos) {
  try {
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
  } catch (error) {
    console.error("Error displaying user repositories: ", error);
    repositoriesList.textContent = "Failed to display user repositories";
  }
}

/**
 * Update pagination controls based on total repositories
 * @param {number} totalRepos - Total number of user repositories
 */
function updatePaginationControls(totalRepos) {
  try {
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
  } catch (error) {
    console.error("Error updating pagination controls: ", error);
    // Handle error (if needed) for pagination controls
  }
}

/**
 * Display user issues for all repositories in the UI
 * @param {string} username - The GitHub username
 * @param {Array<Object>} userRepos - An array of user repository objects
 */
async function displayUserIssues(username, userRepos) {
  try {
    issuesList.innerHTML = ""; // Clear previous content

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

    loadingIndicatorIssues.style.display = "none"; // Hide loading indicator
  } catch (error) {
    console.error("Error displaying user issues: ", error);
    issuesList.textContent = "Failed to display user issues"; // Display error message
    loadingIndicatorIssues.style.display = "none"; // Hide loading indicator on error
  }
}

/**
 * Fetch and display user repositories
 * @param {string} username - The GitHub username
 */
async function fetchAndDisplayRepos(username) {
  loadingIndicatorRepositories.style.display = "block"; // Display loading indicator

  try {
    const userRepos = await fetchUserRepos(username);
    displayUserRepos(userRepos); // Display repositories
  } catch (error) {
    console.error("Error fetching user repos: ", error);
    repositoriesList.textContent = "Failed to fetch user repos"; // Display error message
  } finally {
    loadingIndicatorRepositories.style.display = "none"; // Hide loading indicator
  }
}

/**
 * Fetch user data, repositories, and issues based on input username
 */
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

    const userRepos = await fetchUserRepos(username);
    await displayUserIssues(username, userRepos);
  } catch (error) {
    console.error("Error fetching user data: ", error);
    userDetails.textContent = "Failed to fetch user data";
    repositoriesList.textContent = "Failed to fetch user repos";
    issuesList.textContent = "Failed to fetch user issues";
  } finally {
    loadingIndicatorUserDetails.style.display = "none";
  }
};

/**
 * Initialize tab click listeners to fetch and display data accordingly
 */
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
        const username = usernameInput.value.trim();
        if (username) {
          currentPage = 1;
          await fetchAndDisplayRepos(username);
        }
        break;
      case "issues-list":
        const usernameIssues = usernameInput.value.trim();
        if (usernameIssues) {
          loadingIndicatorIssues.style.display = "block";
          const userReposIssues = await fetchUserRepos(usernameIssues);
          await displayUserIssues(usernameIssues, userReposIssues);
          loadingIndicatorIssues.style.display = "none";
        }
        break;
    }
  });
});

/**
 * Handle Enter key press in username input for initiating search
 */
usernameInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchButton.click();
  }
});

/**
 * Handle click on search button to fetch user data, repositories, and issues
 */
searchButton.addEventListener("click", fetchData);
