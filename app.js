// ========================================
// KABARU WARD FOOTBALL
// MAIN WEBSITE APP
// ========================================

document.addEventListener("DOMContentLoaded", async function () {

    // ========================================
    // MAIN ELEMENTS
    // ========================================

    const competitionNameEl =
        document.getElementById("competitionName");

    const competitionSeasonEl =
        document.getElementById("competitionSeason");

    const competitionStatusEl =
        document.getElementById("competitionStatus");

    const tableBody =
        document.getElementById("leagueTableBody");

    const fixturesContainer =
        document.getElementById("fixturesContainer");

    const resultsContainer =
        document.getElementById("resultsContainer");

    const topScorersContainer =
        document.getElementById("topScorers");

    const assistLeadersContainer =
        document.getElementById("assistLeaders");

    const appearanceLeadersContainer =
        document.getElementById("appearanceLeaders");

    const yellowCardLeadersContainer =
        document.getElementById("yellowCardLeaders");

    const redCardLeadersContainer =
        document.getElementById("redCardLeaders");


    // ========================================
    // HELPER FUNCTIONS
    // ========================================

    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function formatDate(dateValue) {

        if (!dateValue) {
            return "";
        }

        const date =
            new Date(dateValue + "T00:00:00");

        if (isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    function formatTime(timeValue) {

        if (!timeValue) {
            return "";
        }

        const parts =
            String(timeValue).split(":");

        if (parts.length < 2) {
            return timeValue;
        }

        let hour =
            Number(parts[0]);

        const minute =
            parts[1];

        const ampm =
            hour >= 12
                ? "PM"
                : "AM";

        hour =
            hour % 12;

        if (hour === 0) {
            hour = 12;
        }

        return (
            hour +
            ":" +
            minute +
            " " +
            ampm
        );
    }


    function showError(container, message) {

        if (container) {

            container.innerHTML =
                `<p>${escapeHtml(message)}</p>`;
        }
    }


    // ========================================
    // CURRENT COMPETITION
    // ========================================

    let currentCompetition = null;


    async function loadCompetitionStatus() {

        if (
            !competitionNameEl &&
            !competitionSeasonEl &&
            !competitionStatusEl
        ) {
            return;
        }


        const {
            data,
            error
        } = await supabaseClient
            .from("competitions")
            .select("*")
            .eq("status", "Active")
            .order("created_at", {
                ascending: false
            })
            .limit(1)
            .maybeSingle();


        if (error) {

            console.error(
                "Competition error:",
                error
            );

            if (competitionStatusEl) {

                competitionStatusEl.textContent =
                    "Unable to load competition";
            }

            return;
        }


        currentCompetition = data;


        if (!data) {

            if (competitionNameEl) {

                competitionNameEl.textContent =
                    "No Active Competition";
            }

            if (competitionSeasonEl) {

                competitionSeasonEl.textContent =
                    "";
            }

            if (competitionStatusEl) {

                competitionStatusEl.textContent =
                    "Coming Soon";
            }

            return;
        }


        if (competitionNameEl) {

            competitionNameEl.textContent =
                data.name ||
                "Kabaru Ward Football";
        }


        if (competitionSeasonEl) {

            competitionSeasonEl.textContent =
                data.season
                    ? "Season " +
                      data.season +
                      " • Kabaru Ward"
                    : "Kabaru Ward";
        }


        if (competitionStatusEl) {

            competitionStatusEl.textContent =
                data.status ||
                "Active";
        }
    }


    // ========================================
    // LOAD ALL APPROVED TEAMS
    // ========================================

    async function getApprovedTeams() {

        const {
            data,
            error
        } = await supabaseClient
            .from("teams")
            .select(`
                id,
                name
            `)
            .eq(
                "registration_status",
                "Approved"
            )
            .order("name");


        if (error) {

            console.error(
                "Teams loading error:",
                error
            );

            return {
                teams: [],
                error: error
            };
        }


        return {
            teams: data || [],
            error: null
        };
    }


    // ========================================
    // LOAD FIXTURES
    // ========================================

    async function loadFixtures() {

        if (!fixturesContainer) {
            return;
        }


        fixturesContainer.innerHTML =
            "<p>Loading fixtures...</p>";


        let query =
            supabaseClient
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
                .order("match_date", {
                    ascending: true
                })
                .order("kick_off", {
                    ascending: true
                });


        if (currentCompetition) {

            query =
                query.eq(
                    "competition_id",
                    currentCompetition.id
                );
        }


        const {
            data: fixtures,
            error
        } = await query;


        if (error) {

            console.error(
                "Fixtures error:",
                error
            );

            showError(
                fixturesContainer,
                "Unable to load fixtures."
            );

            return;
        }


        const upcomingFixtures =
            (fixtures || []).filter(
                function (fixture) {

                    return (
                        fixture.status !==
                        "Completed" &&
                        fixture.status !==
                        "Cancelled"
                    );
                }
            );


        if (
            upcomingFixtures.length === 0
        ) {

            fixturesContainer.innerHTML =
                "<p>No upcoming fixtures.</p>";

            return;
        }


        const {
            teams
        } = await getApprovedTeams();


        const teamMap = {};


        teams.forEach(function (team) {

            teamMap[team.id] =
                team;
        });


        fixturesContainer.innerHTML =
            "";


        upcomingFixtures.forEach(
            function (fixture) {

                const homeTeam =
                    teamMap[
                        fixture.home_team_id
                    ];

                const awayTeam =
                    teamMap[
                        fixture.away_team_id
                    ];


                const homeName =
                    homeTeam?.name ||
                    "Home Team";

                const awayName =
                    awayTeam?.name ||
                    "Away Team";


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "fixture-card";


                card.innerHTML = `

                    <div class="fixture-date">
                        ${escapeHtml(
                            formatDate(
                                fixture.match_date
                            )
                        )}
                    </div>

                    <div class="fixture-match">

                        <div class="fixture-team">
                            ${escapeHtml(
                                homeName
                            )}
                        </div>

                        <div class="fixture-vs">
                            VS
                        </div>

                        <div class="fixture-team">
                            ${escapeHtml(
                                awayName
                            )}
                        </div>

                    </div>

                    <div class="fixture-details">

                        ${
                            fixture.kick_off
                                ? escapeHtml(
                                    formatTime(
                                        fixture.kick_off
                                    )
                                )
                                : ""
                        }

                        ${
                            fixture.venue
                                ? " • " +
                                  escapeHtml(
                                      fixture.venue
                                  )
                                : ""
                        }

                        ${
                            fixture.matchday
                                ? " • Matchday " +
                                  escapeHtml(
                                      fixture.matchday
                                  )
                                : ""
                        }

                    </div>

                `;


                fixturesContainer.appendChild(
                    card
                );
            }
        );
    }


    // ========================================
    // LOAD LEAGUE TABLE
    // ========================================

    async function loadLeagueTable() {

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML =
            `
            <tr>
                <td colspan="10">
                    Loading table...
                </td>
            </tr>
            `;


        const {
            teams,
            error: teamsError
        } = await getApprovedTeams();


        if (teamsError) {

            tableBody.innerHTML =
                `
                <tr>
                    <td colspan="10">
                        Unable to load teams.
                    </td>
                </tr>
                `;

            return;
        }


        if (!teams.length) {

            tableBody.innerHTML =
                `
                <tr>
                    <td colspan="10">
                        No approved teams.
                    </td>
                </tr>
                `;

            return;
        }


        let fixtureQuery =
            supabaseClient
                .from("fixtures")
                .select(`
                    id,
                    competition_id,
                    home_team_id,
                    away_team_id,
                    status
                `)
                .eq(
                    "status",
                    "Completed"
                );


        if (currentCompetition) {

            fixtureQuery =
                fixtureQuery.eq(
                    "competition_id",
                    currentCompetition.id
                );
        }


        const {
            data: fixtures,
            error: fixturesError
        } = await fixtureQuery;


        if (fixturesError) {

            console.error(
                "Table fixtures error:",
                fixturesError
            );

            tableBody.innerHTML =
                `
                <tr>
                    <td colspan="10">
                        Unable to load fixtures.
                    </td>
                </tr>
                `;

            return;
        }


        const fixtureIds =
            (fixtures || []).map(
                function (fixture) {

                    return fixture.id;
                }
            );


        let results = [];


        if (fixtureIds.length > 0) {

            const {
                data,
                error
            } = await supabaseClient
                .from("results")
                .select(`
                    id,
                    fixture_id,
                    home_score,
                    away_score
                `)
                .in(
                    "fixture_id",
                    fixtureIds
                );


            if (error) {

                console.error(
                    "Table results error:",
                    error
                );

                tableBody.innerHTML =
                    `
                    <tr>
                        <td colspan="10">
                            Unable to load results.
                        </td>
                    </tr>
                    `;

                return;
            }


            results =
                data || [];
        }


        const resultMap = {};


        results.forEach(
            function (result) {

                resultMap[
                    result.fixture_id
                ] = result;
            }
        );


        // ========================================
        // CREATE TEAM STATISTICS
        // ========================================

        const stats = {};


        teams.forEach(
            function (team) {

                stats[team.id] = {

                    id:
                        team.id,

                    name:
                        team.name,

                    played:
                        0,

                    won:
                        0,

                    drawn:
                        0,

                    lost:
                        0,

                    gf:
                        0,

                    ga:
                        0,

                    gd:
                        0,

                    points:
                        0
                };
            }
        );


        // ========================================
        // CALCULATE TABLE
        // ========================================

        (fixtures || []).forEach(
            function (fixture) {

                const result =
                    resultMap[
                        fixture.id
                    ];


                if (!result) {
                    return;
                }


                const home =
                    stats[
                        fixture.home_team_id
                    ];

                const away =
                    stats[
                        fixture.away_team_id
                    ];


                if (!home || !away) {
                    return;
                }


                const homeScore =
                    Number(
                        result.home_score
                    );


                const awayScore =
                    Number(
                        result.away_score
                    );


                home.played++;
                away.played++;


                home.gf +=
                    homeScore;

                home.ga +=
                    awayScore;


                away.gf +=
                    awayScore;

                away.ga +=
                    homeScore;


                if (
                    homeScore >
                    awayScore
                ) {

                    home.won++;

                    away.lost++;

                    home.points += 3;

                } else if (
                    awayScore >
                    homeScore
                ) {

                    away.won++;

                    home.lost++;

                    away.points += 3;

                } else {

                    home.drawn++;

                    away.drawn++;

                    home.points += 1;

                    away.points += 1;
                }
            }
        );


        // ========================================
        // CALCULATE GOAL DIFFERENCE
        // ========================================

        Object.values(stats).forEach(
            function (team) {

                team.gd =
                    team.gf -
                    team.ga;
            }
        );


        // ========================================
        // SORT TABLE
        // ========================================

        const sorted =
            Object.values(stats)
                .sort(
                    function (a, b) {

                        // Points
                        if (
                            b.points !==
                            a.points
                        ) {

                            return (
                                b.points -
                                a.points
                            );
                        }


                        // Goal Difference
                        if (
                            b.gd !==
                            a.gd
                        ) {

                            return (
                                b.gd -
                                a.gd
                            );
                        }


                        // Goals For
                        if (
                            b.gf !==
                            a.gf
                        ) {

                            return (
                                b.gf -
                                a.gf
                            );
                        }


                        // Alphabetical
                        return a.name.localeCompare(
                            b.name
                        );
                    }
                );


        tableBody.innerHTML =
            "";


        // ========================================
        // DISPLAY TABLE
        // ========================================

        sorted.forEach(
            function (team, index) {

                const row =
                    document.createElement(
                        "tr"
                    );


                const gdDisplay =
                    team.gd > 0
                        ? "+" + team.gd
                        : String(team.gd);


                row.innerHTML = `

                    <td class="position">
                        ${index + 1}
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
                        <strong>
                            ${gdDisplay}
                        </strong>
                    </td>

                    <td>
                        <strong>
                            ${team.points}
                        </strong>
                    </td>

                `;


                tableBody.appendChild(
                    row
                );
            }
        );
    }


    // ========================================
    // LOAD MATCH RESULTS
    // ========================================

    async function loadResults() {

        if (!resultsContainer) {
            return;
        }


        resultsContainer.innerHTML =
            "<p>Loading results...</p>";


        let fixtureQuery =
            supabaseClient
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
                    {
                        ascending: false
                    }
                )
                .order(
                    "kick_off",
                    {
                        ascending: false
                    }
                );


        if (currentCompetition) {

            fixtureQuery =
                fixtureQuery.eq(
                    "competition_id",
                    currentCompetition.id
                );
        }


        const {
            data: fixtures,
            error: fixtureError
        } = await fixtureQuery;


        if (fixtureError) {

            console.error(
                "Results fixtures error:",
                fixtureError
            );

            showError(
                resultsContainer,
                "Unable to load results."
            );

            return;
        }


        if (
            !fixtures ||
            fixtures.length === 0
        ) {

            resultsContainer.innerHTML =
                "<p>No match results yet.</p>";

            return;
        }


        const {
            teams,
            error: teamsError
        } = await getApprovedTeams();


        if (teamsError) {

            showError(
                resultsContainer,
                "Unable to load teams."
            );

            return;
        }


        const teamMap = {};


        teams.forEach(
            function (team) {

                teamMap[team.id] =
                    team;
            }
        );


        const fixtureIds =
            fixtures.map(
                function (fixture) {

                    return fixture.id;
                }
            );


        const {
            data: results,
            error: resultsError
        } = await supabaseClient
            .from("results")
            .select(`
                id,
                fixture_id,
                home_score,
                away_score,
                match_report,
                created_at
            `)
            .in(
                "fixture_id",
                fixtureIds
            );


        if (resultsError) {

            console.error(
                "Results error:",
                resultsError
            );

            showError(
                resultsContainer,
                "Unable to load match results."
            );

            return;
        }


        const resultMap = {};


        (results || []).forEach(
            function (result) {

                resultMap[
                    result.fixture_id
                ] = result;
            }
        );


        const resultIds =
            (results || []).map(
                function (result) {

                    return result.id;
                }
            );


        let goalRows = [];


        if (resultIds.length > 0) {

            const {
                data,
                error
            } = await supabaseClient
                .from("goal_scorers")
                .select(`
                    id,
                    result_id,
                    player_id,
                    minute,
                    assist_player_id,
                    is_penalty
                `)
                .in(
                    "result_id",
                    resultIds
                )
                .order(
                    "minute",
                    {
                        ascending: true
                    }
                );


            if (error) {

                console.error(
                    "Goal scorers error:",
                    error
                );

            } else {

                goalRows =
                    data || [];
            }
        }


        // ========================================
        // LOAD PLAYERS
        // ========================================

        const playerIds = [];


        goalRows.forEach(
            function (goal) {

                if (goal.player_id) {

                    playerIds.push(
                        goal.player_id
                    );
                }

                if (goal.assist_player_id) {

                    playerIds.push(
                        goal.assist_player_id
                    );
                }
            }
        );


        let players = [];


        if (playerIds.length > 0) {

            const uniquePlayerIds =
                [
                    ...new Set(
                        playerIds
                    )
                ];


            const {
                data,
                error
            } = await supabaseClient
                .from("players")
                .select(`
                    id,
                    team_id,
                    full_name,
                    jersey_number,
                    position
                `)
                .in(
                    "id",
                    uniquePlayerIds
                );


            if (error) {

                console.error(
                    "Players error:",
                    error
                );

            } else {

                players =
                    data || [];
            }
        }


        const playerMap = {};


        players.forEach(
            function (player) {

                playerMap[
                    player.id
                ] = player;
            }
        );


        resultsContainer.innerHTML =
            "";


        // ========================================
        // DISPLAY RESULTS
        // ========================================

        fixtures.forEach(
            function (fixture) {

                const result =
                    resultMap[
                        fixture.id
                    ];


                if (!result) {
                    return;
                }


                const homeTeam =
                    teamMap[
                        fixture.home_team_id
                    ];

                const awayTeam =
                    teamMap[
                        fixture.away_team_id
                    ];


                const homeName =
                    homeTeam?.name ||
                    "Home Team";

                const awayName =
                    awayTeam?.name ||
                    "Away Team";


                const goals =
                    goalRows.filter(
                        function (goal) {

                            return (
                                goal.result_id ===
                                result.id
                            );
                        }
                    );


                const homeGoals =
                    goals.filter(
                        function (goal) {

                            const player =
                                playerMap[
                                    goal.player_id
                                ];

                            return (
                                player &&
                                player.team_id ===
                                fixture.home_team_id
                            );
                        }
                    );


                const awayGoals =
                    goals.filter(
                        function (goal) {

                            const player =
                                playerMap[
                                    goal.player_id
                                ];

                            return (
                                player &&
                                player.team_id ===
                                fixture.away_team_id
                            );
                        }
                    );


                let scorerHtml =
                    "";


                if (goals.length > 0) {

                    scorerHtml = `

                        <div class="result-scorers">

                            <strong>
                                Goal Scorers
                            </strong>

                            <div class="scorers-columns">

                                <div class="home-scorers">

                                    <div class="scorer-team-title">
                                        ${escapeHtml(
                                            homeName
                                        )}
                                    </div>

                                    ${
                                        homeGoals.length
                                            ? homeGoals.map(
                                                function (goal) {

                                                    const player =
                                                        playerMap[
                                                            goal.player_id
                                                        ];

                                                    const playerName =
                                                        player?.full_name ||
                                                        "Unknown Player";

                                                    const minute =
                                                        goal.minute !== null &&
                                                        goal.minute !== undefined
                                                            ? goal.minute +
                                                              "'"
                                                            : "";

                                                    const penalty =
                                                        goal.is_penalty
                                                            ? " (P)"
                                                            : "";

                                                    return `

                                                        <div class="scorer">

                                                            ${escapeHtml(
                                                                playerName
                                                            )}

                                                            ${escapeHtml(
                                                                minute
                                                            )}

                                                            ${penalty}

                                                        </div>

                                                    `;

                                                }
                                            ).join("")
                                            : "<div>No goals</div>"
                                    }

                                </div>


                                <div class="away-scorers">

                                    <div class="scorer-team-title">
                                        ${escapeHtml(
                                            awayName
                                        )}
                                    </div>

                                    ${
                                        awayGoals.length
                                            ? awayGoals.map(
                                                function (goal) {

                                                    const player =
                                                        playerMap[
                                                            goal.player_id
                                                        ];

                                                    const playerName =
                                                        player?.full_name ||
                                                        "Unknown Player";

                                                    const minute =
                                                        goal.minute !== null &&
                                                        goal.minute !== undefined
                                                            ? goal.minute +
                                                              "'"
                                                            : "";

                                                    const penalty =
                                                        goal.is_penalty
                                                            ? " (P)"
                                                            : "";

                                                    return `

                                                        <div class="scorer">

                                                            ${escapeHtml(
                                                                playerName
                                                            )}

                                                            ${escapeHtml(
                                                                minute
                                                            )}

                                                            ${penalty}

                                                        </div>

                                                    `;

                                                }
                                            ).join("")
                                            : "<div>No goals</div>"
                                    }

                                </div>

                            </div>

                        </div>

                    `;
                }


                const report =
                    result.match_report
                        ? `

                            <div class="match-report">

                                <strong>
                                    Match Report
                                </strong>

                                <p>
                                    ${escapeHtml(
                                        result.match_report
                                    )}
                                </p>

                            </div>

                        `
                        : "";


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "result-card";


                card.innerHTML = `

                    <div class="result-date">

                        ${escapeHtml(
                            formatDate(
                                fixture.match_date
                            )
                        )}

                    </div>


                    <div class="result-match">

                        <div class="result-team">
                            ${escapeHtml(
                                homeName
                            )}
                        </div>


                        <div class="result-score">

                            <strong>
                                ${Number(
                                    result.home_score || 0
                                )}
                            </strong>

                            <span>
                                -
                            </span>

                            <strong>
                                ${Number(
                                    result.away_score || 0
                                )}
                            </strong>

                        </div>


                        <div class="result-team">
                            ${escapeHtml(
                                awayName
                            )}
                        </div>

                    </div>


                    <div class="result-details">

                        ${
                            fixture.kick_off
                                ? escapeHtml(
                                    formatTime(
                                        fixture.kick_off
                                    )
                                )
                                : ""
                        }

                        ${
                            fixture.venue
                                ? " • " +
                                  escapeHtml(
                                      fixture.venue
                                  )
                                : ""
                        }

                        ${
                            fixture.matchday
                                ? " • Matchday " +
                                  escapeHtml(
                                      fixture.matchday
                                  )
                                : ""
                        }

                    </div>


                    ${scorerHtml}


                    ${report}

                `;


                resultsContainer.appendChild(
                    card
                );
            }
        );


        if (
            resultsContainer.innerHTML.trim() ===
            ""
        ) {

            resultsContainer.innerHTML =
                "<p>No match results yet.</p>";
        }
    }


    // ========================================
    // PLAYER LEADERS
    // ========================================

    async function loadPlayerLeaders() {

        const containers = [

            topScorersContainer,

            assistLeadersContainer,

            appearanceLeadersContainer,

            yellowCardLeadersContainer,

            redCardLeadersContainer

        ];


        if (
            containers.every(
                function (container) {
                    return !container;
                }
            )
        ) {
            return;
        }


        containers.forEach(
            function (container) {

                if (container) {

                    container.innerHTML =
                        "<p>Loading...</p>";
                }
            }
        );


        // ========================================
        // GET CURRENT COMPETITION FIXTURES
        // ========================================

        let fixtureQuery =
            supabaseClient
                .from("fixtures")
                .select(`
                    id,
                    competition_id,
                    status
                `);


        if (currentCompetition) {

            fixtureQuery =
                fixtureQuery.eq(
                    "competition_id",
                    currentCompetition.id
                );
        }


        const {
            data: fixtures,
            error: fixtureError
        } = await fixtureQuery;


        if (fixtureError) {

            console.error(
                "Leader fixtures error:",
                fixtureError
            );

            containers.forEach(
                function (container) {

                    if (container) {

                        container.innerHTML =
                            "<p>Unable to load player statistics.</p>";
                    }
                }
            );

            return;
        }


        const completedFixtureIds =
            (fixtures || [])
                .filter(
                    function (fixture) {

                        return (
                            fixture.status ===
                            "Completed"
                        );
                    }
                )
                .map(
                    function (fixture) {

                        return fixture.id;
                    }
                );


        let resultIds = [];


        if (
            completedFixtureIds.length > 0
        ) {

            const {
                data: results,
                error: resultsError
            } = await supabaseClient
                .from("results")
                .select(`
                    id,
                    fixture_id
                `)
                .in(
                    "fixture_id",
                    completedFixtureIds
                );


            if (resultsError) {

                console.error(
                    "Leader results error:",
                    resultsError
                );

            } else {

                resultIds =
                    (results || []).map(
                        function (result) {

                            return result.id;
                        }
                    );
            }
        }


        let stats = [];


        if (resultIds.length > 0) {

            const {
                data,
                error
            } = await supabaseClient
                .from("player_match_stats")
                .select(`
                    id,
                    result_id,
                    player_id,
                    appearances,
                    goals,
                    assists,
                    yellow_cards,
                    red_cards
                `)
                .in(
                    "result_id",
                    resultIds
                );


            if (error) {

                console.error(
                    "Player stats error:",
                    error
                );

                containers.forEach(
                    function (container) {

                        if (container) {

                            container.innerHTML =
                                "<p>Unable to load player statistics.</p>";
                        }
                    }
                );

                return;
            }


            stats =
                data || [];
        }


        if (!stats.length) {

            containers.forEach(
                function (container) {

                    if (container) {

                        container.innerHTML =
                            "<p>No player statistics yet.</p>";
                    }
                }
            );

            return;
        }


        // ========================================
        // LOAD PLAYERS
        // ========================================

        const playerIds =
            [
                ...new Set(
                    stats.map(
                        function (stat) {
                            return stat.player_id;
                        }
                    )
                )
            ];


        const {
            data: players,
            error: playersError
        } = await supabaseClient
            .from("players")
            .select(`
                id,
                team_id,
                full_name,
                jersey_number,
                position
            `)
            .in(
                "id",
                playerIds
            );


        if (playersError) {

            console.error(
                "Leader players error:",
                playersError
            );

            containers.forEach(
                function (container) {

                    if (container) {

                        container.innerHTML =
                            "<p>Unable to load player names.</p>";
                    }
                }
            );

            return;
        }


        // ========================================
        // LOAD TEAMS
        // ========================================

        const teamIds =
            [
                ...new Set(
                    (players || []).map(
                        function (player) {
                            return player.team_id;
                        }
                    )
                )
            ];


        let teams = [];


        if (teamIds.length > 0) {

            const {
                data,
                error
            } = await supabaseClient
                .from("teams")
                .select(`
                    id,
                    name
                `)
                .in(
                    "id",
                    teamIds
                );


            if (!error) {

                teams =
                    data || [];
            }
        }


        const playerMap = {};
        const teamMap = {};


        (players || []).forEach(
            function (player) {

                playerMap[
                    player.id
                ] = player;
            }
        );


        teams.forEach(
            function (team) {

                teamMap[
                    team.id
                ] = team;
            }
        );


        // ========================================
        // TOTAL PLAYER STATISTICS
        // ========================================

        const totals = {};


        stats.forEach(
            function (stat) {

                const playerId =
                    stat.player_id;


                if (!totals[playerId]) {

                    totals[playerId] = {

                        player_id:
                            playerId,

                        appearances:
                            0,

                        goals:
                            0,

                        assists:
                            0,

                        yellow_cards:
                            0,

                        red_cards:
                            0
                    };
                }


                totals[playerId]
                    .appearances +=
                    Number(
                        stat.appearances || 0
                    );


                totals[playerId]
                    .goals +=
                    Number(
                        stat.goals || 0
                    );


                totals[playerId]
                    .assists +=
                    Number(
                        stat.assists || 0
                    );


                totals[playerId]
                    .yellow_cards +=
                    Number(
                        stat.yellow_cards || 0
                    );


                totals[playerId]
                    .red_cards +=
                    Number(
                        stat.red_cards || 0
                    );
            }
        );


        const leaderData =
            Object.values(totals)
                .map(
                    function (total) {

                        const player =
                            playerMap[
                                total.player_id
                            ];


                        const team =
                            player
                                ? teamMap[
                                    player.team_id
                                  ]
                                : null;


                        return {

                            ...total,

                            playerName:
                                player?.full_name ||
                                "Unknown Player",

                            teamName:
                                team?.name ||
                                "Unknown Team"
                        };
                    }
                );


        // ========================================
        // RENDER LEADER LIST
        // ========================================

        function renderLeaderList(
            container,
            data,
            valueKey,
            emptyText
        ) {

            if (!container) {
                return;
            }


            if (
                !data ||
                data.length === 0
            ) {

                container.innerHTML =
                    `<p>${escapeHtml(
                        emptyText
                    )}</p>`;

                return;
            }


            container.innerHTML =
                "";


            data.forEach(
                function (item, index) {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "leader-row";


                    row.innerHTML = `

                        <div class="leader-rank">
                            ${index + 1}
                        </div>


                        <div class="leader-info">

                            <strong>
                                ${escapeHtml(
                                    item.playerName
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    item.teamName
                                )}
                            </span>

                        </div>


                        <div class="leader-value">
                            ${item[valueKey]}
                        </div>

                    `;


                    container.appendChild(
                        row
                    );
                }
            );
        }


        // ========================================
        // TOP SCORERS
        // ========================================

        const topScorers =
            [...leaderData]
                .filter(
                    function (item) {

                        return item.goals > 0;
                    }
                )
                .sort(
                    function (a, b) {

                        if (
                            b.goals !==
                            a.goals
                        ) {

                            return (
                                b.goals -
                                a.goals
                            );
                        }

                        return a.playerName.localeCompare(
                            b.playerName
                        );
                    }
                )
                .slice(
                    0,
                    10
                );


        // ========================================
        // ASSISTS
        // ========================================

        const assistLeaders =
            [...leaderData]
                .filter(
                    function (item) {

                        return item.assists > 0;
                    }
                )
                .sort(
                    function (a, b) {

                        if (
                            b.assists !==
                            a.assists
                        ) {

                            return (
                                b.assists -
                                a.assists
                            );
                        }

                        return a.playerName.localeCompare(
                            b.playerName
                        );
                    }
                )
                .slice(
                    0,
                    10
                );


        // ========================================
        // APPEARANCES
        // ========================================

        const appearanceLeaders =
            [...leaderData]
                .filter(
                    function (item) {

                        return (
                            item.appearances >
                            0
                        );
                    }
                )
                .sort(
                    function (a, b) {

                        if (
                            b.appearances !==
                            a.appearances
                        ) {

                            return (
                                b.appearances -
                                a.appearances
                            );
                        }

                        return a.playerName.localeCompare(
                            b.playerName
                        );
                    }
                )
                .slice(
                    0,
                    10
                );


        // ========================================
        // YELLOW CARDS
        // ========================================

        const yellowCardLeaders =
            [...leaderData]
                .filter(
                    function (item) {

                        return (
                            item.yellow_cards >
                            0
                        );
                    }
                )
                .sort(
                    function (a, b) {

                        if (
                            b.yellow_cards !==
                            a.yellow_cards
                        ) {

                            return (
                                b.yellow_cards -
                                a.yellow_cards
                            );
                        }

                        return a.playerName.localeCompare(
                            b.playerName
                        );
                    }
                )
                .slice(
                    0,
                    10
                );


        // ========================================
        // RED CARDS
        // ========================================

        const redCardLeaders =
            [...leaderData]
                .filter(
                    function (item) {

                        return (
                            item.red_cards >
                            0
                        );
                    }
                )
                .sort(
                    function (a, b) {

                        if (
                            b.red_cards !==
                            a.red_cards
                        ) {

                            return (
                                b.red_cards -
                                a.red_cards
                            );
                        }

                        return a.playerName.localeCompare(
                            b.playerName
                        );
                    }
                )
                .slice(
                    0,
                    10
                );


        // ========================================
        // DISPLAY LEADERS
        // ========================================

        renderLeaderList(
            topScorersContainer,
            topScorers,
            "goals",
            "No goals yet."
        );


        renderLeaderList(
            assistLeadersContainer,
            assistLeaders,
            "assists",
            "No assists yet."
        );


        renderLeaderList(
            appearanceLeadersContainer,
            appearanceLeaders,
            "appearances",
            "No appearances yet."
        );


        renderLeaderList(
            yellowCardLeadersContainer,
            yellowCardLeaders,
            "yellow_cards",
            "No yellow cards yet."
        );


        renderLeaderList(
            redCardLeadersContainer,
            redCardLeaders,
            "red_cards",
            "No red cards yet."
        );
    }


    // ========================================
    // STYLING
    // ========================================

    const style =
        document.createElement("style");


    style.textContent = `

        .scorers-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 10px;
        }


        .home-scorers,
        .away-scorers {
            padding: 10px;
            border-radius: 8px;
            background: rgba(0,0,0,0.03);
        }


        .scorer-team-title {
            font-weight: bold;
            margin-bottom: 8px;
        }


        .scorer {
            margin: 5px 0;
        }


        .leader-row {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
        }


        .leader-rank {
            width: 28px;
            font-weight: bold;
        }


        .leader-info {
            flex: 1;
            display: flex;
            flex-direction: column;
        }


        .leader-info span {
            font-size: 0.85em;
            opacity: 0.7;
        }


        .leader-value {
            font-weight: bold;
            font-size: 1.1em;
        }


        @media (max-width: 600px) {

            .scorers-columns {
                grid-template-columns: 1fr;
                gap: 10px;
            }

        }

    `;


    document.head.appendChild(style);


    // ========================================
    // START APPLICATION
    // ========================================

    await loadCompetitionStatus();


    await Promise.allSettled([

        loadFixtures(),

        loadLeagueTable(),

        loadResults(),

        loadPlayerLeaders()

    ]);

});
