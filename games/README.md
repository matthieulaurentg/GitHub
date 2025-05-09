# Game Testing Suite

This testing suite helps detect JavaScript errors, resource loading issues, and other problems in the games.

## Prerequisites

- Node.js
- npm
- Live Server (running on port 5500)

## Installation

```bash
npm install
```

## Usage

To test a game, use one of the following commands:

```bash
# Using npm script
npm test [game-path]

# Example:
npm test tea_sim_kaboom/index.html
```

The test script will:
1. Launch a browser and load the game
2. Capture any JavaScript errors
3. Detect resource loading issues
4. Take screenshots if errors occur
5. Show a detailed test summary

## Test Results

- Screenshots of failed tests are saved in the `test-screenshots` directory
- The script will exit with code 1 if any errors are found
- A summary of errors and warnings will be displayed in the console

## Important Rules

1. Always run tests after making changes to any game
2. Fix any errors before committing changes
3. Keep the live server running on port 5500 while testing 

## Deploying to Cloudflare Pages

You can deploy all games to Cloudflare Pages using the provided script. This will:
- Run tests for all games
- Deploy the entire `games/` folder to your Cloudflare Pages project

### Prerequisites
- You have a Cloudflare account and a Pages project created
- You have a Cloudflare API token with "Edit Cloudflare Pages Projects" permissions
- You know your Cloudflare Account ID and Pages project name

### Environment Variables
Set these in your shell before running the script:

```
export CF_ACCOUNT_ID=your_account_id
export CF_PAGES_PROJECT=your_project_name
export CF_API_TOKEN=your_api_token
```

### Usage

From the `games/` directory, run:

```
./deploy-all-games.sh
```

The script will:
1. Run tests for all games (fails if any test fails)
2. Zip the `games/` folder
3. Upload it to Cloudflare Pages using the direct upload API

Check your Cloudflare Pages dashboard for deployment status and your live site URL. 