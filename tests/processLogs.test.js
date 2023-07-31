// Import the processLog function from the parser file
const processLog = require("../parser");

// Import the constants related to means of death
const MeansOfDeath = require("../constants");

// Describe a test suite for the processLog function
describe("processLog function", () => {
  // Test case to ensure that a simple game log is processed correctly
  it("should process a simple game log correctly", () => {
    // Sample log text for the test case
    const logText = `
      InitGame:
      Kill: 0 1 2: Player1 killed Player2 by ${MeansOfDeath.MOD_SHOTGUN}
    `;

    // Run the function on the sample log
    const result = processLog(logText);

    // Expect the result to be as defined
    expect(result).toEqual({
      game_0: {
        total_kills: 1,
        players: ["Player1", "Player2"],
        kills: {
          Player1: 1,
          Player2: 0,
        },
        kills_by_means: {
          [MeansOfDeath.MOD_SHOTGUN]: 1,
        },
      },
      playerRanking: [
        { player: "Player1", kills: 1 },
        { player: "Player2", kills: 0 },
      ],
    });
  });

  // Test case to ensure that various means of death are handled correctly
  it("should handle various means of death", () => {
    // Sample log text for the test case
    const logText = `
    InitGame:
    Kill: 0 1 2: Player1 killed Player2 by ${MeansOfDeath.MOD_SHOTGUN}
    Kill: 1 0 3: Player2 killed Player1 by ${MeansOfDeath.MOD_ROCKET}
    Kill: 1 0 3: Player2 killed Player1 by BLABLALBA
    Kill: 1 0 3: Player2 killed Player1 by GGGGGGGGGGGGGGGGGG
    Kill: 1 0 3: Player2 killed Player1 by !"!"!"!"22222222
  `;

    // Run the function on the sample log
    const result = processLog(logText);

    // Expect the kills by means to be as defined
    expect(result.game_0.kills_by_means).toEqual({
      [MeansOfDeath.MOD_SHOTGUN]: 1,
      [MeansOfDeath.MOD_ROCKET]: 1,
      [MeansOfDeath.MOD_UNKNOWN]: 3,
    });

    // Expect the kills to be as defined
    expect(result.game_0.kills).toEqual({
      Player1: 1,
      Player2: 4,
    });
  });

  // Test case to ensure that a player killing themselves is not counted as a kill
  it("should handle Player1 killing Player1, not a killing", () => {
    // Sample log text for the test case
    const logText = `
    InitGame:
    Kill: 0 1 2: Player1 killed Player1 by ${MeansOfDeath.MOD_SHOTGUN}
    Kill: 1 0 3: Player1 killed Player1 by ${MeansOfDeath.MOD_ROCKET}
    Kill: 1 0 3: Player1 killed Player1 by BLABLALBA
    Kill: 1 0 3: Player1 killed Player1 by GGGGGGGGGGGGGGGGGG
    Kill: 1 0 3: Player1 killed Player1 by !"!"!"!"22222222
  `;

    // Run the function on the sample log
    const result = processLog(logText);

    // Expect the kills by means to be an empty object since no valid kills occurred
    expect(result.game_0.kills_by_means).toEqual({});

    // Expect the kills to show Player1 with zero kills
    expect(result.game_0.kills).toEqual({
      Player1: 0,
    });
  });
});
