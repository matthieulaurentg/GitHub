#!/bin/bash
set -e

# Set your Cloudflare Pages project name here
PROJECT_NAME="your-pages-project-name" # <-- CHANGE THIS TO YOUR PROJECT NAME

# Run tests for all games
cd "$(dirname "$0")"

echo "Running tests for all games..."
for game in maze_fp_indy/index.html street_fighter/index.html tea_sim_three/index.html tetris3d/index.html uno/uno.html tetris.html snake.html tictactoe.html blackjack.html clicker.html; do
  echo "Testing $game"
  npm test "$game"
done

echo "All tests passed!"

echo "Deploying to Cloudflare Pages with Wrangler..."
wrangler pages deploy . --project-name "$PROJECT_NAME"

echo "Deployment complete! Check your Cloudflare Pages dashboard for status." 