# Github User Seach

This project is a simple web application that allows users to search for GitHub profiles and view their basic information, including followers, following count, public repositories, and total stars received.

## Features

- Search for GitHub users by username.
- Display user information (username, name, bio, public repos, followers, following).
- Calculate and display total stargazers count across user repositories.
- Display a list of top 5 public repositories with hyperlinks to their GitHub pages.
- Basic error handling for empty username and API errors.

## Tech Stack

- HTML: Structure of the page
- CSS: Basic Styling { tbbh, used chatGPT }
- JavaScript: Fetches user data from the GitHub API and dynamically updates the page content.

## TODO

- [x] **lazy-loading**: fetch data only when the corrosponding tab is clicked.
- [x] **show loader until data is fetched**:
  - currently, there's a placeholder { replace with a loading indicator }
- [ ] **error handle**: display error message when api calls fails or something goes south.

- [ ] **Get followers details**
- [ ] **Get Followinf details**
- [ ] **unit test** _(Optional)_: dont know anything yet
- [ ] **Build a modern page**
  - [ ] - userDetailsPage
  - [ ] - userReposPage
  - [ ] - userIssuesPage
