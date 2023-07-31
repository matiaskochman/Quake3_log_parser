const MeansOfDeath = require("./constants");
module.exports = function processLog(logText) {
  const lines = logText.split("\n"); // Split the log text into individual lines
  const games = {}; // Object to store the data of the games
  let currentGame = null; // Variable to store the current game being processed
  let gameCounter = 0; // Counter for the processed games
  // Create an object to store the player ranking
  const playerRanking = {};

  lines.forEach((line) => {
    if (line.includes("InitGame:")) {
      // Check if the line initializes a game
      if (currentGame) {
        // If there's an existing current game, add it to the games object
        games[`game_${gameCounter}`] = currentGame;
        currentGame = null; // Clear the current game
        gameCounter++; // Increment the game counter
      }

      currentGame = {
        // Initialize the current game with the default structure
        total_kills: 0,
        players: new Set(),
        kills: {},
        kills_by_means: {},
      };
    }
    if (currentGame && line.includes("Kill:")) {
      // If there's a current game and the line includes a kill
      const parts = line.match(/Kill: \d+ \d+ \d+: (.+?) killed (.+?) by (.+)/); // Extract details of the kill from the line
      if (parts) {
        // If the kill details were extracted successfully
        const [_, killer, killed, meansOfDeathStr] = parts; // Extract the killer, killed, and means of death
        currentGame.total_kills += 1; // Increment the total kills

        if (killer !== "<world>" && killer !== killed) {
          // If the killer is not the world and the killer is not the same as the killed
          currentGame.players.add(killer); // Add the killer to the players set
          currentGame.kills[killer] = (currentGame.kills[killer] || 0) + 1; // Increment the kills for the killer
        }

        if (killed !== "<world>") {
          // If the killed is not the world
          currentGame.players.add(killed); // Add the killed to the players set
          if (killer === "<world>") {
            // If the killer is the world
            currentGame.kills[killed] = (currentGame.kills[killed] || 0) - 1; // Decrement the kills for the killed
          } else {
            currentGame.kills[killed] = currentGame.kills[killed] || 0; // Initialize the kills for the killed if not already done
          }
        }

        if (killer !== killed) {
          // Determine the means of death
          let meansOfDeath = MeansOfDeath[meansOfDeathStr.toUpperCase()];
          if (meansOfDeath === undefined) {
            meansOfDeath = MeansOfDeath.MOD_UNKNOWN; // Default to unknown if not recognized
          }

          // Increment the total kills for the specific means of death
          currentGame.kills_by_means[meansOfDeath] =
            (currentGame.kills_by_means[meansOfDeath] || 0) + 1;
        }
      }
    }
  });
  if (currentGame) {
    // If there's an unclosed game
    games[`game_${gameCounter}`] = currentGame; // Add the last game if it hasn't been closed yet
  }

  for (const game in games) {
    // Convert the sets of players into arrays and print the game data
    games[game].players = Array.from(games[game].players);
  }

  // Iterate through each game to calculate the total ranking
  for (const game in games) {
    for (const player in games[game].kills) {
      // Increment the kill count for each player in the global ranking
      playerRanking[player] =
        (playerRanking[player] || 0) + games[game].kills[player];
    }
  }

  // Convert the ranking object into an array and sort it by the number of kills
  const sortedRanking = Object.entries(playerRanking)
    .map(([player, kills]) => ({ player, kills }))
    .sort((a, b) => b.kills - a.kills);

  // Attach the sorted ranking to the games object before returning it
  games.playerRanking = sortedRanking;

  return games; // Return the games object
};
