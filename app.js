// ======================================================
// KABARU WARD FOOTBALL
// app.js
// ======================================================

// ------------------------------------------------------
// SUPABASE
// ------------------------------------------------------

const supabaseClient = window.supabaseClient;


// ------------------------------------------------------
// GENERAL HELPERS
// ------------------------------------------------------

function escapeHtml(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// 1. TEAM REGISTRATION
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const teamRegistrationForm =
        document.getElementById("teamRegistrationForm");

    const playersContainer =
        document.getElementById("playersContainer");

    const addPlayerBtn =
        document.getElementById("addPlayerBtn");

    const playerCount =
        document.getElementById("playerCount");

    const registrationMessage =
        document.getElementById("registrationMessage");

    if (
        !teamRegistrationForm ||
        !playersContainer ||
        !addPlayerBtn
    ) {
        return;
    }

    let players = 0;
    const MAX_PLAYERS = 20;


    function updatePlayerCount() {
        if (playerCount) {
            playerCount.textContent =
                `${players}/${MAX_PLAYERS}`;
        }
    }


    function createPlayerRow() {

        if (players >= MAX_PLAYERS) {
            alert("Maximum of 20 players allowed.");
            return;
        }

        players++;

        const row = document.createElement("div");

        row.className = "player-row";

        row.innerHTML = `
            <div class="player-number">
                <strong>Player ${players}</strong>
            </div>

            <input
                type="text"
                name="player_name"
                placeholder="Player full name"
                required
            >

            <input
                type="number"
                name="jersey_number"
                placeholder="Jersey number"
                min="1"
                max="99"
                required
            >

            <select name="position" required>
                <option value="">Select position</option>
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Defender">Defender</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Forward">Forward</option>
            </select>

            <button
                type="button"
                class="remove-player-btn"
            >
                Remove
            </button>
        `;


        const removeBtn =
            row.querySelector(".remove-player-btn");


        removeBtn.addEventListener("click", () => {

            row.remove();

            players--;

            updatePlayerNumbers();

            updatePlayerCount();
        });


        playersContainer.appendChild(row);

        updatePlayerCount();
    }


    function updatePlayerNumbers() {

        const rows =
            playersContainer.querySelectorAll(".player-row");

        rows.forEach((row, index) => {

            const number =
                row.querySelector(".player-number");

            if (number) {
                number.innerHTML =
                    `<strong>Player ${index + 1}</strong>`;
            }

        });
    }


    addPlayerBtn.addEventListener(
        "click",
        createPlayerRow
    );


    // Start with one player
    createPlayerRow();


    teamRegistrationForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            if (players < 1) {
                alert("Please add at least one player.");
                return;
            }


            const formData =
                new FormData(teamRegistrationForm);


            const playerRows =
                playersContainer.querySelectorAll(".player-row");


            const playerData = [];


            playerRows.forEach(row => {

                const name =
                    row.querySelector(
                        '[name="player_name"]'
                    ).value.trim();

                const jersey =
                    row.querySelector(
                        '[name="jersey_number"]'
                    ).value;

                const position =
                    row.querySelector(
                        '[name="position"]'
                    ).value;


                playerData.push({
                    player_name: name,
                    jersey_number: Number(jersey),
                    position: position
                });

            });


            const teamName =
                formData.get("teamName")?.trim();

            const shortName =
                formData.get("shortName")?.trim();

            const teamLocation =
                formData.get("teamLocation")?.trim();

            const coachName =
                formData.get("coachName")?.trim();

            const captainName =
                formData.get("captainName")?.trim();

            const viceCaptainName =
                formData.get("viceCaptainName")?.trim();

            const disciplineMasterName =
                formData.get("disciplineMasterName")?.trim();

            const teamPhone =
                formData.get("teamPhone")?.trim();

            const teamEmail =
                formData.get("teamEmail")?.trim();


            if (registrationMessage) {
                registrationMessage.textContent =
                    "Submitting registration...";
            }


            try {

                const { data, error } =
                    await supabaseClient.rpc(
                        "submit_team_registration",
                        {
                            p_name: teamName,
                            p_short_name: shortName,
                            p_location: teamLocation,
                            p_coach_name: coachName,
                            p_captain_name: captainName,
                            p_vice_captain_name:
                                viceCaptainName,
                            p_discipline_master_name:
                                disciplineMasterName,
                            p_phone: teamPhone,
                            p_email: teamEmail,
                            p_players: playerData
                        }
                    );


                if (error) {
                    throw error;
                }


                if (registrationMessage) {

                    registrationMessage.innerHTML =
                        `
                        <strong>
                            Registration submitted successfully.
                        </strong>
                        <br>
                        Your team is now awaiting approval.
                        `;
                }


                teamRegistrationForm.reset();

                playersContainer.innerHTML = "";

                players = 0;

                createPlayerRow();


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                if (registrationMessage) {

                    registrationMessage.innerHTML =
                        `
                        <strong>
                            Registration failed.
                        </strong>
                        <br>
                        ${escapeHtml(error.message)}
                        `;
                }

            }

        }
    );

});


// ======================================================
// 2. PUBLIC FIXTURES
// ======================================================

async function loadFixtures() {

    const container =
        document.getElementById("fixturesContainer");

    if (!container) return;


    container.innerHTML =
        "<p>Loading fixtures...</p>";


    try {

        const { data: fixtures, error } =
            await supabaseClient
                .from("fixtures")
                .select(`
                    id,
                    competition_id,
                    home_team_id,
                    away_team_id,
                    match_date,
                    kick_off,
                    venue,
                    matchday,
                    status
                `)
                .in(
                    "status",
                    ["Scheduled", "Published"]
                )
                .order(
                    "match_date",
                    { ascending: true }
                )
                .order(
                    "kick_off",
                    { ascending: true }
                );


        if (error) throw error;


        if (!fixtures || fixtures.length === 0) {

            container.innerHTML =
                "<p>No fixtures available yet.</p>";

            return;
        }


        const teamIds = [
            ...new Set(
                fixtures.flatMap(f => [
                    f.home_team_id,
                    f.away_team_id
                ])
            )
        ];


        const competitionIds = [
            ...new Set(
                fixtures.map(
                    f => f.competition_id
                )
            )
        ];


        const { data: teams, error: teamError } =
            await supabaseClient
                .from("teams")
                .select(`
                    id,
                    name,
                    short_name,
                    logo_url,
                    registration_status
                `)
                .in("id", teamIds)
                .eq(
                    "registration_status",
                    "Approved"
                );


        if (teamError) throw teamError;


        const { data: competitions, error: competitionError } =
            await supabaseClient
                .from("competitions")
                .select(`
                    id,
                    name,
                    season,
                    status
                `)
                .in("id", competitionIds);


        if (competitionError) throw competitionError;


        const teamMap = {};

        (teams || []).forEach(team => {
            teamMap[team.id] = team;
        });


        const competitionMap = {};

        (competitions || []).forEach(competition => {
            competitionMap[competition.id] =
                competition;
        });


        container.innerHTML =
            fixtures.map(fixture => {

                const home =
                    teamMap[fixture.home_team_id];

                const away =
                    teamMap[fixture.away_team_id];

                const competition =
                    competitionMap[
                        fixture.competition_id
                    ];


                return `
                    <div class="fixture-card">

                        <div class="fixture-competition">
                            ${escapeHtml(
                                competition?.name || ""
                            )}
                        </div>

                        <div class="fixture-matchday">
                            ${escapeHtml(
                                fixture.matchday || ""
                            )}
                        </div>

                        <div class="fixture-teams">

                            <span>
                                ${escapeHtml(
                                    home?.name || "Home Team"
                                )}
                            </span>

                            <strong>VS</strong>

                            <span>
                                ${escapeHtml(
                                    away?.name || "Away Team"
                                )}
                            </span>

                        </div>

                        <div class="fixture-details">

                            <span>
                                📅
                                ${escapeHtml(
                                    fixture.match_date || ""
                                )}
                            </span>

                            <span>
                                ⏰
                                ${escapeHtml(
                                    fixture.kick_off || ""
                                )}
                            </span>

                            <span>
                                📍
                                ${escapeHtml(
                                    fixture.venue || ""
                                )}
                            </span>

                        </div>

                    </div>
                `;

            }).join("");


    } catch (error) {

        console.error(
            "Error loading fixtures:",
            error
        );


        container.innerHTML =
            "<p>Unable to load fixtures.</p>";
    }

}


// ======================================================
// 3. AUTOMATIC LEAGUE TABLE
// ======================================================

async function loadLeagueTable() {

    const container =
        document.getElementById("leagueTable");

    if (!container) return;


    container.innerHTML =
        "<p>Loading league table...</p>";


    try {

        const { data: teams, error: teamError } =
            await supabaseClient
                .from("teams")
                .select(`
                    id,
                    name,
                    short_name,
                    registration_status
                `)
                .eq(
                    "registration_status",
                    "Approved"
                );


        if (teamError) throw teamError;


        const { data: fixtures, error: fixtureError } =
            await supabaseClient
                .from("fixtures")
                .select(`
                    id,
                    home_team_id,
                    away_team_id,
                    status
                `)
                .in(
                    "status",
                    [
                        "Scheduled",
                        "Published",
                        "Completed"
                    ]
                );


        if (fixtureError) throw fixtureError;


        const { data: results, error: resultError } =
            await supabaseClient
                .from("results")
                .select(`
                    id,
                    fixture_id,
                    home_score,
                    away_score
                `);


        if (resultError) throw resultError;


        const resultMap = {};

        (results || []).forEach(result => {

            resultMap[result.fixture_id] =
                result;

        });


        const table = {};


        (teams || []).forEach(team => {

            table[team.id] = {

                id: team.id,

                name: team.name,

                short_name:
                    team.short_name,

                played: 0,

                won: 0,

                drawn: 0,

                lost: 0,

                gf: 0,

                ga: 0,

                gd: 0,

                points: 0

            };

        });


        (fixtures || []).forEach(fixture => {

            if (fixture.status !== "Completed") {
                return;
            }


            const result =
                resultMap[fixture.id];


            if (!result) return;


            const home =
                table[fixture.home_team_id];

            const away =
                table[fixture.away_team_id];


            if (!home || !away) return;


            const homeScore =
                Number(result.home_score);

            const awayScore =
                Number(result.away_score);


            home.played++;

            away.played++;


            home.gf += homeScore;

            home.ga += awayScore;


            away.gf += awayScore;

            away.ga += homeScore;


            if (homeScore > awayScore) {

                home.won++;

                home.points += 3;

                away.lost++;

            } else if (
                homeScore < awayScore
            ) {

                away.won++;

                away.points += 3;

                home.lost++;

            } else {

                home.drawn++;

                away.drawn++;

                home.points++;

                away.points++;

            }

        });


        Object.values(table).forEach(team => {

            team.gd =
                team.gf - team.ga;

        });


        const sortedTable =
            Object.values(table)
                .sort((a, b) => {

                    if (
                        b.points !== a.points
                    ) {
                        return b.points -
                            a.points;
                    }

                    if (
                        b.gd !== a.gd
                    ) {
                        return b.gd -
                            a.gd;
                    }

                    if (
                        b.gf !== a.gf
                    ) {
                        return b.gf -
                            a.gf;
                    }

                    return a.name.localeCompare(
                        b.name
                    );

                });


        container.innerHTML = `

            <div class="table-wrapper">

                <table>

                    <thead>

                        <tr>

                            <th>Pos</th>
                            <th>Team</th>
                            <th>P</th>
                            <th>W</th>
                            <th>D</th>
                            <th>L</th>
                            <th>GF</th>
                            <th>GA</th>
                            <th>GD</th>
                            <th>Pts</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${
                            sortedTable.map(
                                (team, index) => `
                                    <tr>

                                        <td>
                                            ${
                                                index + 1
                                            }
                                        </td>

                                        <td>
                                            <strong>
                                                ${escapeHtml(
                                                    team.name
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            ${team.played}
                                        </td>

                                        <td>
                                            ${team.won}
                                        </td>

                                        <td>
                                            ${team.drawn}
                                        </td>

                                        <td>
                                            ${team.lost}
                                        </td>

                                        <td>
                                            ${team.gf}
                                        </td>

                                        <td>
                                            ${team.ga}
                                        </td>

                                        <td>
                                            ${team.gd}
                                        </td>

                                        <td>
                                            <strong>
                                                ${team.points}
                                            </strong>
                                        </td>

                                    </tr>
                                `
                            ).join("")
                        }

                    </tbody>

                </table>

            </div>

        `;


    } catch (error) {

        console.error(
            "Error loading league table:",
            error
        );


        container.innerHTML =
            "<p>Unable to load league table.</p>";
    }

}


// ======================================================
// 4. PUBLIC MATCH RESULTS
// ======================================================

async function loadResults() {

    const container =
        document.getElementById("resultsContainer");

    if (!container) return;


    container.innerHTML =
        "<p>Loading results...</p>";


    try {

        const { data: fixtures, error: fixtureError } =
            await supabaseClient
                .from("fixtures")
                .select(`
                    id,
                    competition_id,
                    home_team_id,
                    away_team_id,
                    match_date,
                    kick_off,
                    venue,
                    matchday,
                    status
                `)
                .eq(
                    "status",
                    "Completed"
                )
                .order(
                    "match_date",
                    { ascending: false }
                )
                .order(
                    "kick_off",
                    { ascending: false }
                );


        if (fixtureError) throw fixtureError;


        if (!fixtures || fixtures.length === 0) {

            container.innerHTML =
                "<p>No completed matches yet.</p>";

            return;
        }


        const fixtureIds =
            fixtures.map(
                fixture => fixture.id
            );


        const teamIds = [
            ...new Set(
                fixtures.flatMap(f => [
                    f.home_team_id,
                    f.away_team_id
                ])
            )
        ];


        const competitionIds = [
            ...new Set(
                fixtures.map(
                    f => f.competition_id
                )
            )
        ];


        const { data: results, error: resultError } =
            await supabaseClient
                .from("results")
                .select(`
                    id,
                    fixture_id,
                    home_score,
                    away_score,
                    match_report
                `)
                .in(
                    "fixture_id",
                    fixtureIds
                );


        if (resultError) throw resultError;


        const { data: teams, error: teamError } =
            await supabaseClient
                .from("teams")
                .select(`
                    id,
                    name,
                    short_name,
                    logo_url
                `)
                .in("id", teamIds)
                .eq(
                    "registration_status",
                    "Approved"
                );


        if (teamError) throw teamError;


        const { data: competitions, error: competitionError } =
            await supabaseClient
                .from("competitions")
                .select(`
                    id,
                    name,
                    season
                `)
                .in(
                    "id",
                    competitionIds
                );


        if (competitionError) throw competitionError;


        const resultMap = {};

        (results || []).forEach(result => {

            resultMap[result.fixture_id] =
                result;

        });


        const teamMap = {};

        (teams || []).forEach(team => {

            teamMap[team.id] =
                team;

        });


        const competitionMap = {};

        (competitions || []).forEach(competition => {

            competitionMap[competition.id] =
                competition;

        });


        // ----------------------------------------------
        // GOAL SCORERS
        // ----------------------------------------------

        const resultIds =
            (results || []).map(
                result => result.id
            );


        let goalScorers = [];


        if (resultIds.length > 0) {

            const { data, error } =
                await supabaseClient
                    .from("goal_scorers")
                    .select(`
                        id,
                        result_id,
                        player_id,
                        minute,
                        is_penalty
                    `)
                    .in(
                        "result_id",
                        resultIds
                    );


            if (error) throw error;

            goalScorers = data || [];
        }


        const playerIds = [
            ...new Set(
                goalScorers
                    .map(goal => goal.player_id)
                    .filter(Boolean)
            )
        ];


        let players = [];


        if (playerIds.length > 0) {

            const { data, error } =
                await supabaseClient
                    .from("players")
                    .select(`
                        id,
                        full_name,
                        jersey_number,
                        team_id
                    `)
                    .in(
                        "id",
                        playerIds
                    );


            if (error) throw error;

            players = data || [];
        }


        const playerMap = {};

        players.forEach(player => {

            playerMap[player.id] =
                player;

        });


        const goalsByResult = {};


        goalScorers.forEach(goal => {

            if (!goalsByResult[goal.result_id]) {

                goalsByResult[goal.result_id] = [];

            }


            goalsByResult[goal.result_id].push({

                player:
                    playerMap[goal.player_id],

                minute:
                    goal.minute,

                is_penalty:
                    goal.is_penalty

            });

        });


        // ----------------------------------------------
        // RENDER RESULTS
        // ----------------------------------------------

        container.innerHTML =
            fixtures.map(fixture => {

                const result =
                    resultMap[fixture.id];

                if (!result) return "";


                const home =
                    teamMap[fixture.home_team_id];

                const away =
                    teamMap[fixture.away_team_id];


                const competition =
                    competitionMap[
                        fixture.competition_id
                    ];


                const goals =
                    goalsByResult[result.id] || [];


                const goalText =
                    goals.length > 0
                        ? `
                            <div class="result-goals">

                                ${goals.map(goal => {

                                    if (!goal.player) {
                                        return "";
                                    }


                                    let minuteText = "";


                                    if (
                                        goal.minute !== null &&
                                        goal.minute !== undefined &&
                                        goal.minute !== ""
                                    ) {

                                        minuteText =
                                            ` ${escapeHtml(
                                                goal.minute
                                            )}'`;

                                    }


                                    const penaltyText =
                                        goal.is_penalty
                                            ? " (P)"
                                            : "";


                                    return `
                                        <div>
                                            ⚽
                                            ${escapeHtml(
                                                goal.player.full_name
                                            )}
                                            ${minuteText}
                                            ${penaltyText}
                                        </div>
                                    `;

                                }).join("")}

                            </div>
                        `
                        : "";


                return `
                    <div class="result-card">

                        <div class="result-competition">

                            ${escapeHtml(
                                competition?.name || ""
                            )}

                            ${
                                competition?.season
                                    ? ` • ${escapeHtml(
                                        competition.season
                                      )}`
                                    : ""
                            }

                        </div>


                        <div class="result-matchday">
                            ${escapeHtml(
                                fixture.matchday || ""
                            )}
                        </div>


                        <div class="result-teams">

                            <span>
                                ${escapeHtml(
                                    home?.name ||
                                    "Home Team"
                                )}
                            </span>


                            <strong class="result-score">

                                ${result.home_score}

                                -

                                ${result.away_score}

                            </strong>


                            <span>
                                ${escapeHtml(
                                    away?.name ||
                                    "Away Team"
                                )}
                            </span>

                        </div>


                        ${goalText}


                        ${
                            result.match_report
                                ? `
                                    <div class="match-report">
                                        ${escapeHtml(
                                            result.match_report
                                        )}
                                    </div>
                                  `
                                : ""
                        }


                        <div class="result-details">

                            📅
                            ${escapeHtml(
                                fixture.match_date || ""
                            )}

                            &nbsp;&nbsp;

                            ⏰
                            ${escapeHtml(
                                fixture.kick_off || ""
                            )}

                            &nbsp;&nbsp;

                            📍
                            ${escapeHtml(
                                fixture.venue || ""
                            )}

                        </div>

                    </div>
                `;

            }).join("");


    } catch (error) {

        console.error(
            "Error loading results:",
            error
        );


        container.innerHTML =
            "<p>Unable to load match results.</p>";
    }

}


// ======================================================
// 5. COMPETITION STATUS
// ======================================================

async function loadCompetitionStatus() {

    const container =
        document.getElementById(
            "competitionStatus"
        );

    if (!container) return;


    try {

        const { data, error } =
            await supabaseClient
                .from("competitions")
                .select(`
                    name,
                    season,
                    status
                `)
                .eq(
                    "name",
                    "Kabaru Ward Football League"
                )
                .eq(
                    "season",
                    "2026"
                )
                .maybeSingle();


        if (error) throw error;


        if (!data) {

            container.textContent =
                "Competition status: Coming Soon";

            return;
        }


        container.textContent =
            `Competition status: ${data.status}`;


    } catch (error) {

        console.error(
            "Error loading competition status:",
            error
        );


        container.textContent =
            "Competition status: Coming Soon";
    }

}


// ======================================================
// 6. PLAYER LEADERS
// ======================================================
//
// Shows:
// - Top Scorers
// - Top Assist Leaders
// - Most Appearances
// - Most Yellow Cards
// - Most Red Cards
//
// Uses player_match_stats.
// No new database column is required.
// ======================================================

async function loadPlayerLeaders() {

    const scorerContainer =
        document.getElementById("topScorersList") ||
        document.getElementById("topScorers") ||
        document.getElementById("topScorersContainer");


    const assistContainer =
        document.getElementById("topAssistsList") ||
        document.getElementById("topAssists") ||
        document.getElementById("topAssistsContainer");


    const appearanceContainer =
        document.getElementById("mostAppearancesList") ||
        document.getElementById("appearancesList") ||
        document.getElementById("appearancesContainer");


    const yellowContainer =
        document.getElementById("yellowCardsList") ||
        document.getElementById("yellowCards") ||
        document.getElementById("yellowCardsContainer");


    const redContainer =
        document.getElementById("redCardsList") ||
        document.getElementById("redCards") ||
        document.getElementById("redCardsContainer");


    // If the HTML sections have not been added yet,
    // do nothing. This keeps all current pages working.
    if (
        !scorerContainer &&
        !assistContainer &&
        !appearanceContainer &&
        !yellowContainer &&
        !redContainer
    ) {
        return;
    }


    try {

        const { data: stats, error: statsError } =
            await supabaseClient
                .from("player_match_stats")
                .select(`
                    player_id,
                    appearances,
                    goals,
                    assists,
                    yellow_cards,
                    red_cards
                `);


        if (statsError) throw statsError;


        const { data: players, error: playersError } =
            await supabaseClient
                .from("players")
                .select(`
                    id,
                    full_name,
                    jersey_number,
                    team_id,
                    registration_status
                `)
                .eq(
                    "registration_status",
                    "Approved"
                );


        if (playersError) throw playersError;


        const { data: teams, error: teamsError } =
            await supabaseClient
                .from("teams")
                .select(`
                    id,
                    name,
                    short_name,
                    registration_status
                `)
                .eq(
                    "registration_status",
                    "Approved"
                );


        if (teamsError) throw teamsError;


        const teamMap = {};

        (teams || []).forEach(team => {

            teamMap[team.id] =
                team;

        });


        const playerMap = {};

        (players || []).forEach(player => {

            playerMap[player.id] =
                player;

        });


        // ----------------------------------------------
        // Combine all stats for each player
        // ----------------------------------------------

        const totals = {};


        (stats || []).forEach(row => {

            if (!playerMap[row.player_id]) {
                return;
            }


            if (!totals[row.player_id]) {

                totals[row.player_id] = {

                    player_id:
                        row.player_id,

                    appearances: 0,

                    goals: 0,

                    assists: 0,

                    yellow_cards: 0,

                    red_cards: 0

                };

            }


            totals[row.player_id].appearances +=
                Number(row.appearances || 0);


            totals[row.player_id].goals +=
                Number(row.goals || 0);


            totals[row.player_id].assists +=
                Number(row.assists || 0);


            totals[row.player_id].yellow_cards +=
                Number(row.yellow_cards || 0);


            totals[row.player_id].red_cards +=
                Number(row.red_cards || 0);

        });


        const leaders =
            Object.values(totals).map(stat => {

                const player =
                    playerMap[stat.player_id];


                const team =
                    teamMap[player.team_id];


                return {

                    ...stat,

                    player,

                    team

                };

            });


        // ----------------------------------------------
        // Sort the different leader lists
        // ----------------------------------------------

        const topScorers =
            [...leaders]
                .filter(player =>
                    player.goals > 0
                )
                .sort((a, b) => {

                    if (
                        b.goals !== a.goals
                    ) {
                        return b.goals -
                            a.goals;
                    }

                    if (
                        b.assists !== a.assists
                    ) {
                        return b.assists -
                            a.assists;
                    }

                    return a.player.full_name
                        .localeCompare(
                            b.player.full_name
                        );

                })
                .slice(0, 10);


        const topAssists =
            [...leaders]
                .filter(player =>
                    player.assists > 0
                )
                .sort((a, b) => {

                    if (
                        b.assists !== a.assists
                    ) {
                        return b.assists -
                            a.assists;
                    }

                    if (
                        b.goals !== a.goals
                    ) {
                        return b.goals -
                            a.goals;
                    }

                    return a.player.full_name
                        .localeCompare(
                            b.player.full_name
                        );

                })
                .slice(0, 10);


        const mostAppearances =
            [...leaders]
                .filter(player =>
                    player.appearances > 0
                )
                .sort((a, b) => {

                    if (
                        b.appearances !==
                        a.appearances
                    ) {
                        return b.appearances -
                            a.appearances;
                    }

                    return a.player.full_name
                        .localeCompare(
                            b.player.full_name
                        );

                })
                .slice(0, 10);


        const yellowCards =
            [...leaders]
                .filter(player =>
                    player.yellow_cards > 0
                )
                .sort((a, b) => {

                    if (
                        b.yellow_cards !==
                        a.yellow_cards
                    ) {
                        return b.yellow_cards -
                            a.yellow_cards;
                    }

                    return a.player.full_name
                        .localeCompare(
                            b.player.full_name
                        );

                })
                .slice(0, 10);


        const redCards =
            [...leaders]
                .filter(player =>
                    player.red_cards > 0
                )
                .sort((a, b) => {

                    if (
                        b.red_cards !==
                        a.red_cards
                    ) {
                        return b.red_cards -
                            a.red_cards;
                    }

                    return a.player.full_name
                        .localeCompare(
                            b.player.full_name
                        );

                })
                .slice(0, 10);


        // ----------------------------------------------
        // Render helper
        // ----------------------------------------------

        function renderLeaderList(
            container,
            list,
            statName,
            emptyText
        ) {

            if (!container) return;


            if (!list.length) {

                container.innerHTML =
                    `<p>${emptyText}</p>`;

                return;
            }


            container.innerHTML =
                list.map(
                    (item, index) => {

                        const player =
                            item.player;


                        const team =
                            item.team;


                        let value = 0;


                        if (
                            statName ===
                            "goals"
                        ) {
                            value =
                                item.goals;
                        }


                        if (
                            statName ===
                            "assists"
                        ) {
                            value =
                                item.assists;
                        }


                        if (
                            statName ===
                            "appearances"
                        ) {
                            value =
                                item.appearances;
                        }


                        if (
                            statName ===
                            "yellow_cards"
                        ) {
                            value =
                                item.yellow_cards;
                        }


                        if (
                            statName ===
                            "red_cards"
                        ) {
                            value =
                                item.red_cards;
                        }


                        return `
                            <div class="leader-row">

                                <div class="leader-position">
                                    ${index + 1}
                                </div>


                                <div class="leader-player">

                                    <strong>
                                        ${escapeHtml(
                                            player.full_name
                                        )}
                                    </strong>


                                    <small>

                                        ${
                                            team
                                                ? escapeHtml(
                                                    team.name
                                                  )
                                                : "Team"
                                        }

                                        ${
                                            player.jersey_number
                                                ? ` • #${escapeHtml(
                                                    player.jersey_number
                                                  )}`
                                                : ""
                                        }

                                    </small>

                                </div>


                                <div class="leader-stat">

                                    <strong>
                                        ${value}
                                    </strong>

                                </div>

                            </div>
                        `;

                    }
                ).join("");

        }


        // ----------------------------------------------
        // Display all leader sections
        // ----------------------------------------------

        renderLeaderList(
            scorerContainer,
            topScorers,
            "goals",
            "No goalscorers yet."
        );


        renderLeaderList(
            assistContainer,
            topAssists,
            "assists",
            "No assist leaders yet."
        );


        renderLeaderList(
            appearanceContainer,
            mostAppearances,
            "appearances",
            "No appearances yet."
        );


        renderLeaderList(
            yellowContainer,
            yellowCards,
            "yellow_cards",
            "No yellow cards yet."
        );


        renderLeaderList(
            redContainer,
            redCards,
            "red_cards",
            "No red cards yet."
        );


    } catch (error) {

        console.error(
            "Error loading player leaders:",
            error
        );


        const containers = [
            scorerContainer,
            assistContainer,
            appearanceContainer,
            yellowContainer,
            redContainer
        ];


        containers.forEach(container => {

            if (container) {

                container.innerHTML =
                    "<p>Unable to load player statistics.</p>";

            }

        });

    }

}


// ======================================================
// 7. LOAD PUBLIC DATA
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadFixtures();

        loadLeagueTable();

        loadResults();

        loadCompetitionStatus();

        loadPlayerLeaders();

    }
);


// Also keep competition status available
// if this script is loaded after the page has
// already started loading.

loadCompetitionStatus();
