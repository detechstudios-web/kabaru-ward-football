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
    // HELPER
    // ========================================

    function escapeHtml(value) {
        if (value === null || value === undefined) {
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

        const date = new Date(dateValue + "T00:00:00");

        if (isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }


    function formatTime(timeValue) {

        if (!timeValue) {
            return "";
        }

        const parts = timeValue.split(":");

        if (parts.length < 2) {
            return timeValue;
        }

        let hour = Number(parts[0]);
        const minute = parts[1];

        const ampm = hour >= 12 ? "PM" : "AM";

        hour = hour % 12;

        if (hour === 0) {
            hour = 12;
        }

        return hour + ":" + minute + " " + ampm;
    }


    // ========================================
    // CURRENT COMPETITION
    // ========================================

    let currentCompetition = null;


    async function loadCompetitionStatus() {

        if (!competitionNameEl &&
            !competitionSeasonEl &&
            !competitionStatusEl) {
            return;
        }

        const { data, error } = await supabaseClient
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
                competitionSeasonEl.textContent = "";
            }

            if (competitionStatusEl) {
                competitionStatusEl.textContent =
                    "Coming Soon";
            }

            return;
        }


        if (competitionNameEl) {
            competitionNameEl.textContent =
                data.name || "Kabaru Ward Football";
        }


        if (competitionSeasonEl) {
            competitionSeasonEl.textContent =
                data.season
                    ? "Season " + data.season
                    : "";
        }


        if (competitionStatusEl) {
            competitionStatusEl.textContent =
                data.status || "Active";
        }
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


        let query = supabaseClient
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
                status,
                home_team:teams!fixtures_home_team_id_fkey(
                    id,
                    name
                ),
                away_team:teams!fixtures_away_team_id_fkey(
                    id,
                    name
                ),
                competition:competitions(
                    id,
                    name,
                    season
                )
            `)
            .order("match_date", {
                ascending: true
            })
            .order("kick_off", {
                ascending: true
            });


        if (currentCompetition) {

            query = query.eq(
                "competition_id",
                currentCompetition.id
            );
        }


        const { data, error } = await query;


        if (error) {

            console.error(
                "Fixtures error:",
                error
            );

            fixturesContainer.innerHTML =
                "<p>Unable to load fixtures.</p>";

            return;
        }


        const fixtures = (data || []).filter(function (fixture) {

            return fixture.status !== "Completed" &&
                   fixture.status !== "Cancelled";
        });


        if (fixtures.length === 0) {

            fixturesContainer.innerHTML =
                "<p>No upcoming fixtures.</p>";

            return;
        }


        fixturesContainer.innerHTML = "";


        fixtures.forEach(function (fixture) {

            const homeName =
                fixture.home_team?.name ||
                "Home Team";

            const awayName =
                fixture.away_team?.name ||
                "Away Team";


            const card =
                document.createElement("div");

            card.className = "fixture-card";


            card.innerHTML = `

                <div class="fixture-date">
                    ${escapeHtml(formatDate(fixture.match_date))}
                </div>

                <div class="fixture-match">

                    <div class="fixture-team">
                        ${escapeHtml(homeName)}
                    </div>

                    <div class="fixture-vs">
                        VS
                    </div>

                    <div class="fixture-team">
                        ${escapeHtml(awayName)}
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


            fixturesContainer.appendChild(card);
        });
    }


    // ========================================
    // LOAD LEAGUE TABLE
    // ========================================

    async function loadLeagueTable() {

        if (!tableBody) {
            return;
        }

        tableBody.innerHTML =
            "<tr><td colspan='9'>Loading table...</td></tr>";


        const { data: teams, error: teamsError } =
            await supabaseClient
                .from("teams")
                .select("id,name")
                .eq("registration_status", "Approved")
                .order("name");


        if (teamsError) {

            console.error(
                "Teams error:",
                teamsError
            );

            tableBody.innerHTML =
                "<tr><td colspan='9'>Unable to load table.</td></tr>";

            return;
        }


        if (!teams || teams.length === 0) {

            tableBody.innerHTML =
                "<tr><td colspan='9'>No approved teams.</td></tr>";

            return;
        }


        let fixtureQuery =
            supabaseClient
                .from("fixtures")
                .select(`
                    id,
                    home_team_id,
                    away_team_id,
                    status,
                    competition_id
                `)
                .eq("status", "Completed");


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
                "<tr><td colspan='9'>Unable to load table.</td></tr>";

            return;
        }


        const fixtureIds =
            (fixtures || []).map(function (f) {
                return f.id;
            });


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
                .in("fixture_id", fixtureIds);


            if (error) {

                console.error(
                    "Results error:",
                    error
                );

                tableBody.innerHTML =
                    "<tr><td colspan='9'>Unable to load results.</td></tr>";

                return;
            }

            results = data || [];
        }


        const resultMap = {};


        results.forEach(function (result) {

            resultMap[result.fixture_id] =
                result;
        });


        const stats = {};


        teams.forEach(function (team) {

            stats[team.id] = {

                id: team.id,
                name: team.name,

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


        (fixtures || []).forEach(function (fixture) {

            const result =
                resultMap[fixture.id];


            if (!result) {
                return;
            }


            const home =
                stats[fixture.home_team_id];

            const away =
                stats[fixture.away_team_id];


            if (!home || !away) {
                return;
            }


            const homeScore =
                Number(result.home_score || 0);

            const awayScore =
                Number(result.away_score || 0);


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

            } else if (homeScore < awayScore) {

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


        Object.values(stats).forEach(function (team) {

            team.gd =
                team.gf - team.ga;
        });


        const sorted =
            Object.values(stats).sort(function (a, b) {

                if (b.points !== a.points) {
                    return b.points - a.points;
                }

                if (b.gd !== a.gd) {
                    return b.gd - a.gd;
                }

                if (b.gf !== a.gf) {
                    return b.gf - a.gf;
                }

                return a.name.localeCompare(b.name);
            });


        tableBody.innerHTML = "";


        sorted.forEach(function (team, index) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td class="position">
                    ${index + 1}
                </td>

                <td>
                    ${escapeHtml(team.name)}
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
                        ${team.points}
                    </strong>
                </td>

            `;


            tableBody.appendChild(row);
        });
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
                    status,

                    home_team:teams!fixtures_home_team_id_fkey(
                        id,
                        name
                    ),

                    away_team:teams!fixtures_away_team_id_fkey(
                        id,
                        name
                    ),

                    competition:competitions(
                        id,
                        name,
                        season
                    )
                `)
                .eq("status", "Completed")
                .order("match_date", {
                    ascending: false
                })
                .order("kick_off", {
                    ascending: false
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
            error: fixtureError
        } = await query;


        if (fixtureError) {

            console.error(
                "Result fixtures error:",
                fixtureError
            );

            resultsContainer.innerHTML =
                "<p>Unable to load results.</p>";

            return;
        }


        if (!fixtures || fixtures.length === 0) {

            resultsContainer.innerHTML =
                "<p>No match results yet.</p>";

            return;
        }


        const fixtureIds =
            fixtures.map(function (fixture) {
                return fixture.id;
            });


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
            .in("fixture_id", fixtureIds);


        if (resultsError) {

            console.error(
                "Results loading error:",
                resultsError
            );

            resultsContainer.innerHTML =
                "<p>Unable to load match results.</p>";

            return;
        }


        const resultMap = {};


        (results || []).forEach(function (result) {

            resultMap[result.fixture_id] =
                result;
        });


        const resultIds =
            (results || []).map(function (result) {
                return result.id;
            });


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
                .in("result_id", resultIds)
                .order("minute", {
                    ascending: true
                });


            if (error) {

                console.error(
                    "Goal scorers error:",
                    error
                );

            } else {

                goalRows = data || [];
            }
        }


        const playerIds = [];


        goalRows.forEach(function (goal) {

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
        });


        let players = [];


        if (playerIds.length > 0) {

            const uniquePlayerIds =
                [...new Set(playerIds)];


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
                .in("id", uniquePlayerIds);


            if (error) {

                console.error(
                    "Players error:",
                    error
                );

            } else {

                players = data || [];
            }
        }


        const playerMap = {};


        players.forEach(function (player) {

            playerMap[player.id] =
                player;
        });


        resultsContainer.innerHTML = "";


        fixtures.forEach(function (fixture) {

            const result =
                resultMap[fixture.id];


            if (!result) {
                return;
            }


            const homeName =
                fixture.home_team?.name ||
                "Home Team";

            const awayName =
                fixture.away_team?.name ||
                "Away Team";


            const goals =
                goalRows.filter(function (goal) {

                    return goal.result_id === result.id;
                });


            const homeGoals =
                goals.filter(function (goal) {

                    return goal.player_id &&
                        playerMap[goal.player_id] &&
                        playerMap[goal.player_id].team_id ===
                            fixture.home_team_id;

                });


            const awayGoals =
                goals.filter(function (goal) {

                    return goal.player_id &&
                        playerMap[goal.player_id] &&
                        playerMap[goal.player_id].team_id ===
                            fixture.away_team_id;

                });


            const card =
                document.createElement("div");

            card.className =
                "result-card";


            let scorerHtml = "";


            if (goals.length > 0) {

                scorerHtml = `

                    <div class="result-scorers">

                        <strong>
                            Goal Scorers
                        </strong>

                        <div class="scorers-columns">

                            <div class="home-scorers">

                                <div class="scorer-team-title">
                                    ${escapeHtml(homeName)}
                                </div>

                                ${
                                    homeGoals.length
                                        ? homeGoals.map(function (goal) {

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
                                                    ? goal.minute + "'"
                                                    : "";

                                            const penalty =
                                                goal.is_penalty
                                                    ? " (P)"
                                                    : "";

                                            return `
                                                <div class="scorer">
                                                    ${escapeHtml(playerName)}
                                                    ${escapeHtml(minute)}
                                                    ${penalty}
                                                </div>
                                            `;

                                        }).join("")
                                        : "<div>No goals</div>"
                                }

                            </div>


                            <div class="away-scorers">

                                <div class="scorer-team-title">
                                    ${escapeHtml(awayName)}
                                </div>

                                ${
                                    awayGoals.length
                                        ? awayGoals.map(function (goal) {

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
                                                    ? goal.minute + "'"
                                                    : "";

                                            const penalty =
                                                goal.is_penalty
                                                    ? " (P)"
                                                    : "";

                                            return `
                                                <div class="scorer">
                                                    ${escapeHtml(playerName)}
                                                    ${escapeHtml(minute)}
                                                    ${penalty}
                                                </div>
                                            `;

                                        }).join("")
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
                        ${escapeHtml(homeName)}
                    </div>

                    <div class="result-score">

                        <strong>
                            ${Number(result.home_score || 0)}
                        </strong>

                        <span>
                            -
                        </span>

                        <strong>
                            ${Number(result.away_score || 0)}
                        </strong>

                    </div>

                    <div class="result-team">
                        ${escapeHtml(awayName)}
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

                </div>

                ${scorerHtml}

                ${report}

            `;


            resultsContainer.appendChild(card);
        });


        if (resultsContainer.innerHTML.trim() === "") {

            resultsContainer.innerHTML =
                "<p>No match results yet.</p>";
        }
    }


    // ========================================
    // PLAYER LEADERS
    // ========================================

    async function loadPlayerLeaders() {

        const leaderContainers = [

            topScorersContainer,
            assistLeadersContainer,
            appearanceLeadersContainer,
            yellowCardLeadersContainer,
            redCardLeadersContainer

        ];


        if (
            leaderContainers.every(function (element) {
                return !element;
            })
        ) {
            return;
        }


        leaderContainers.forEach(function (element) {

            if (element) {
                element.innerHTML =
                    "<p>Loading...</p>";
            }
        });


        const {
            data: stats,
            error: statsError
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
            `);


        if (statsError) {

            console.error(
                "Player stats error:",
                statsError
            );

            leaderContainers.forEach(function (element) {

                if (element) {
                    element.innerHTML =
                        "<p>Unable to load player statistics.</p>";
                }
            });

            return;
        }


        const allStats =
            stats || [];


        const playerIds =
            [...new Set(
                allStats.map(function (stat) {
                    return stat.player_id;
                })
            )];


        let players = [];


        if (playerIds.length > 0) {

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
                .in("id", playerIds);


            if (error) {

                console.error(
                    "Leader players error:",
                    error
                );

            } else {

                players = data || [];
            }
        }


        const teamIds =
            [...new Set(
                players.map(function (player) {
                    return player.team_id;
                })
            )];


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
                .in("id", teamIds);


            if (error) {

                console.error(
                    "Leader teams error:",
                    error
                );

            } else {

                teams = data || [];
            }
        }


        const playerMap = {};
        const teamMap = {};


        players.forEach(function (player) {

            playerMap[player.id] =
                player;
        });


        teams.forEach(function (team) {

            teamMap[team.id] =
                team;
        });


        const totals = {};


        allStats.forEach(function (stat) {

            if (!totals[stat.player_id]) {

                totals[stat.player_id] = {

                    player_id:
                        stat.player_id,

                    appearances: 0,
                    goals: 0,
                    assists: 0,
                    yellow_cards: 0,
                    red_cards: 0
                };
            }


            totals[stat.player_id].appearances +=
                Number(stat.appearances || 0);

            totals[stat.player_id].goals +=
                Number(stat.goals || 0);

            totals[stat.player_id].assists +=
                Number(stat.assists || 0);

            totals[stat.player_id].yellow_cards +=
                Number(stat.yellow_cards || 0);

            totals[stat.player_id].red_cards +=
                Number(stat.red_cards || 0);
        });


        const leaderData =
            Object.values(totals).map(function (total) {

                const player =
                    playerMap[total.player_id];

                const team =
                    player
                        ? teamMap[player.team_id]
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

            });


        function renderLeaderList(
            container,
            data,
            valueKey,
            emptyText
        ) {

            if (!container) {
                return;
            }


            if (!data || data.length === 0) {

                container.innerHTML =
                    "<p>" + emptyText + "</p>";

                return;
            }


            container.innerHTML = "";


            data.forEach(function (item, index) {

                const row =
                    document.createElement("div");

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


                container.appendChild(row);
            });
        }


        const topScorers =
            [...leaderData]
                .filter(function (item) {
                    return item.goals > 0;
                })
                .sort(function (a, b) {

                    if (b.goals !== a.goals) {
                        return b.goals - a.goals;
                    }

                    return a.playerName.localeCompare(
                        b.playerName
                    );
                })
                .slice(0, 10);


        const assistLeaders =
            [...leaderData]
                .filter(function (item) {
                    return item.assists > 0;
                })
                .sort(function (a, b) {

                    if (b.assists !== a.assists) {
                        return b.assists - a.assists;
                    }

                    return a.playerName.localeCompare(
                        b.playerName
                    );
                })
                .slice(0, 10);


        const appearanceLeaders =
            [...leaderData]
                .filter(function (item) {
                    return item.appearances > 0;
                })
                .sort(function (a, b) {

                    if (b.appearances !== a.appearances) {
                        return b.appearances - a.appearances;
                    }

                    return a.playerName.localeCompare(
                        b.playerName
                    );
                })
                .slice(0, 10);


        const yellowCardLeaders =
            [...leaderData]
                .filter(function (item) {
                    return item.yellow_cards > 0;
                })
                .sort(function (a, b) {

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
                })
                .slice(0, 10);


        const redCardLeaders =
            [...leaderData]
                .filter(function (item) {
                    return item.red_cards > 0;
                })
                .sort(function (a, b) {

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
                })
                .slice(0, 10);


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
    // SCORER COLUMN STYLING
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
    // INITIAL LOAD
    // ========================================

    await loadCompetitionStatus();

    await Promise.all([

        loadFixtures(),

        loadLeagueTable(),

        loadResults(),

        loadPlayerLeaders()

    ]);


});
