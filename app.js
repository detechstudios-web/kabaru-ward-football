// ========================================
// KABARU WARD FOOTBALL
// PUBLIC WEBSITE APP
// ========================================

// =====================================================
// DOM READY
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    loadFixtures();
    loadLeagueTable();
    loadResults();
    loadCompetitionStatus();
    loadPlayerLeaders();

});


// =====================================================
// COMPETITION STATUS
// =====================================================

async function loadCompetitionStatus() {

    const statusElement =
        document.getElementById("competitionStatus");

    if (!statusElement) {
        return;
    }

    try {

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
            .limit(1);

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {

            statusElement.textContent =
                "Competition status: No active competition";

            return;
        }

        statusElement.textContent =
            "Competition status: " + data[0].status;

    } catch (error) {

        console.error(
            "LOAD COMPETITION STATUS ERROR:",
            error
        );

        statusElement.textContent =
            "Competition status: Unable to load";

    }

}


// =====================================================
// UPCOMING FIXTURES
// =====================================================

async function loadFixtures() {

    const container =
        document.getElementById("upcomingFixtures");

    if (!container) {
        console.error(
            "Upcoming fixtures container not found."
        );
        return;
    }

    try {

        const {
            data: fixtures,
            error: fixturesError
        } = await supabaseClient
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
            .in("status", [
                "Scheduled",
                "Published"
            ])
            .order("match_date", {
                ascending: true
            })
            .order("kick_off", {
                ascending: true
            });

        if (fixturesError) {
            throw fixturesError;
        }

        if (!fixtures || fixtures.length === 0) {

            container.innerHTML = `
                <div
                    class="card"
                    style="text-align:center;"
                >
                    <h3>
                        📅 No Upcoming Fixtures
                    </h3>

                    <p>
                        New fixtures will appear here
                        once they are published.
                    </p>
                </div>
            `;

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


        const {
            data: teams,
            error: teamsError
        } = await supabaseClient
            .from("teams")
            .select(`
                id,
                name,
                short_name
            `)
            .in("id", teamIds);

        if (teamsError) {
            throw teamsError;
        }


        const {
            data: competitions,
            error: competitionsError
        } = await supabaseClient
            .from("competitions")
            .select(`
                id,
                name,
                competition_type,
                season
            `)
            .in("id", competitionIds);

        if (competitionsError) {
            throw competitionsError;
        }


        const teamMap = {};

        (teams || []).forEach(team => {

            teamMap[team.id] = team;

        });


        const competitionMap = {};

        (competitions || []).forEach(
            competition => {

                competitionMap[
                    competition.id
                ] = competition;

            }
        );


        container.innerHTML = "";


        fixtures.forEach(fixture => {

            const homeTeam =
                teamMap[fixture.home_team_id];

            const awayTeam =
                teamMap[fixture.away_team_id];

            const competition =
                competitionMap[
                    fixture.competition_id
                ];


            const homeName =
                homeTeam?.name ||
                "Home Team";

            const awayName =
                awayTeam?.name ||
                "Away Team";


            const date = formatDate(
                fixture.match_date
            );

            const time = formatTime(
                fixture.kick_off
            );


            const card =
                document.createElement("div");

            card.className =
                "fixture-card";


            card.innerHTML = `

                <h3>
                    ${escapeHtml(
                        competition?.name ||
                        "Football Competition"
                    )}
                </h3>

                <div class="match">

                    <div class="team">
                        ${escapeHtml(homeName)}
                    </div>

                    <div class="vs">
                        VS
                    </div>

                    <div class="team">
                        ${escapeHtml(awayName)}
                    </div>

                </div>

                <div class="match-info">

                    📅 ${date}

                    ${
                        fixture.kick_off
                        ? ` • ⏰ ${time}`
                        : ""
                    }

                    ${
                        fixture.venue
                        ? ` • 📍 ${escapeHtml(
                            fixture.venue
                        )}`
                        : ""
                    }

                </div>

                ${
                    fixture.matchday
                    ? `
                        <div
                            class="match-info"
                            style="margin-top:8px;"
                        >
                            ${escapeHtml(
                                fixture.matchday
                            )}
                        </div>
                    `
                    : ""
                }

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "LOAD FIXTURES ERROR:",
            error
        );

        container.innerHTML = `

            <div
                class="card"
                style="text-align:center;"
            >

                <h3>
                    ⚠️ Unable to Load Fixtures
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

    }

}


// =====================================================
// LEAGUE TABLE
// =====================================================

async function loadLeagueTable() {

    const tableBody =
        document.getElementById(
            "leagueTableBody"
        );

    if (!tableBody) {
        console.error(
            "League table body not found."
        );
        return;
    }

    try {

        const {
            data: teams,
            error: teamsError
        } = await supabaseClient
            .from("teams")
            .select(`
                id,
                name,
                short_name
            `)
            .eq(
                "registration_status",
                "Approved"
            )
            .order("name", {
                ascending: true
            });

        if (teamsError) {
            throw teamsError;
        }


        if (!teams || teams.length === 0) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="10"
                        style="text-align:center;"
                    >
                        No approved teams yet.
                    </td>

                </tr>

            `;

            return;
        }


        const {
            data: fixtures,
            error: fixturesError
        } = await supabaseClient
            .from("fixtures")
            .select(`
                id,
                home_team_id,
                away_team_id,
                status
            `)
            .in("status", [
                "Scheduled",
                "Published",
                "Completed"
            ]);

        if (fixturesError) {
            throw fixturesError;
        }


        const {
            data: results,
            error: resultsError
        } = await supabaseClient
            .from("results")
            .select(`
                id,
                fixture_id,
                home_score,
                away_score
            `);

        if (resultsError) {
            throw resultsError;
        }


        const resultMap = {};

        (results || []).forEach(result => {

            resultMap[result.fixture_id] =
                result;

        });


        const table = {};


        teams.forEach(team => {

            table[team.id] = {

                id: team.id,

                name: team.name,

                short_name:
                    team.short_name || "",

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

            if (
                fixture.status !==
                "Completed"
            ) {
                return;
            }


            const result =
                resultMap[fixture.id];

            if (!result) {
                return;
            }


            const home =
                table[fixture.home_team_id];

            const away =
                table[fixture.away_team_id];


            if (!home || !away) {
                return;
            }


            const homeScore =
                Number(result.home_score) || 0;

            const awayScore =
                Number(result.away_score) || 0;


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


        const sortedTeams =
            Object.values(table)
                .sort((a, b) => {

                    if (
                        b.points !==
                        a.points
                    ) {
                        return (
                            b.points -
                            a.points
                        );
                    }

                    if (
                        b.gd !==
                        a.gd
                    ) {
                        return (
                            b.gd -
                            a.gd
                        );
                    }

                    if (
                        b.gf !==
                        a.gf
                    ) {
                        return (
                            b.gf -
                            a.gf
                        );
                    }

                    return a.name.localeCompare(
                        b.name
                    );

                });


        tableBody.innerHTML = "";


        sortedTeams.forEach(
            (team, index) => {

                const row =
                    document.createElement("tr");


                const gd =
                    team.gd > 0
                    ? `+${team.gd}`
                    : team.gd;


                row.innerHTML = `

                    <td class="position">
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            team.name
                        )}

                        ${
                            team.short_name
                            ? `
                                <small>
                                    ${escapeHtml(
                                        team.short_name
                                    )}
                                </small>
                            `
                            : ""
                        }
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
                        ${gd}
                    </td>

                    <td>
                        <strong>
                            ${team.points}
                        </strong>
                    </td>

                `;


                tableBody.appendChild(row);

            }
        );


    } catch (error) {

        console.error(
            "LOAD LEAGUE TABLE ERROR:",
            error
        );

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    style="text-align:center;"
                >

                    ⚠️ Unable to Load League Table

                </td>

            </tr>

        `;

    }

}


// =====================================================
// MATCH RESULTS
// =====================================================

async function loadResults() {

    const container =
        document.getElementById(
            "resultsList"
        );

    if (!container) {
        console.error(
            "Results container not found."
        );
        return;
    }


    try {

        const {
            data: fixtures,
            error: fixturesError
        } = await supabaseClient
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
            .eq("status", "Completed")
            .order("match_date", {
                ascending: false
            })
            .order("kick_off", {
                ascending: false
            });

        if (fixturesError) {
            throw fixturesError;
        }


        if (!fixtures || fixtures.length === 0) {

            container.innerHTML = `

                <div
                    class="card"
                    style="text-align:center;"
                >

                    <h3>
                        🏁 No Match Results Yet
                    </h3>

                    <p>
                        Completed matches will
                        appear here.
                    </p>

                </div>

            `;

            return;
        }


        const fixtureIds =
            fixtures.map(
                fixture => fixture.id
            );


        const teamIds = [
            ...new Set(
                fixtures.flatMap(
                    fixture => [
                        fixture.home_team_id,
                        fixture.away_team_id
                    ]
                )
            )
        ];


        const competitionIds = [
            ...new Set(
                fixtures.map(
                    fixture =>
                        fixture.competition_id
                )
            )
        ];


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
                match_report
            `)
            .in(
                "fixture_id",
                fixtureIds
            );

        if (resultsError) {
            throw resultsError;
        }


        const {
            data: teams,
            error: teamsError
        } = await supabaseClient
            .from("teams")
            .select(`
                id,
                name,
                short_name
            `)
            .in("id", teamIds);

        if (teamsError) {
            throw teamsError;
        }


        const {
            data: competitions,
            error: competitionsError
        } = await supabaseClient
            .from("competitions")
            .select(`
                id,
                name,
                competition_type,
                season
            `)
            .in(
                "id",
                competitionIds
            );

        if (competitionsError) {
            throw competitionsError;
        }


        const {
            data: goalScorers,
            error: scorersError
        } = await supabaseClient
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
                (results || []).map(
                    result => result.id
                )
            );

        if (scorersError) {
            throw scorersError;
        }


        const playerIds = [
            ...new Set(
                (goalScorers || []).map(
                    scorer =>
                        scorer.player_id
                )
            )
        ];


        let players = [];


        if (playerIds.length > 0) {

            const {
                data,
                error
            } = await supabaseClient
                .from("players")
                .select(`
                    id,
                    name,
                    jersey_number,
                    team_id
                `)
                .in(
                    "id",
                    playerIds
                );

            if (error) {
                throw error;
            }

            players = data || [];

        }


        const teamMap = {};

        (teams || []).forEach(team => {

            teamMap[team.id] =
                team;

        });


        const competitionMap = {};

        (competitions || []).forEach(
            competition => {

                competitionMap[
                    competition.id
                ] = competition;

            }
        );


        const resultMap = {};

        (results || []).forEach(result => {

            resultMap[result.fixture_id] =
                result;

        });


        const playerMap = {};

        players.forEach(player => {

            playerMap[player.id] =
                player;

        });


        container.innerHTML = "";


        fixtures.forEach(fixture => {

            const result =
                resultMap[fixture.id];

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


            const competition =
                competitionMap[
                    fixture.competition_id
                ];


            const homeName =
                homeTeam?.name ||
                "Home Team";

            const awayName =
                awayTeam?.name ||
                "Away Team";


            const scorers =
                (goalScorers || []).filter(
                    scorer =>
                        scorer.result_id ===
                        result.id
                );


            const homeScorers =
                scorers.filter(
                    scorer => {

                        const player =
                            playerMap[
                                scorer.player_id
                            ];

                        return (
                            player &&
                            player.team_id ===
                            fixture.home_team_id
                        );

                    }
                );


            const awayScorers =
                scorers.filter(
                    scorer => {

                        const player =
                            playerMap[
                                scorer.player_id
                            ];

                        return (
                            player &&
                            player.team_id ===
                            fixture.away_team_id
                        );

                    }
                );


            const card =
                document.createElement("div");

            card.className =
                "result-card";


            card.innerHTML = `

                <div class="result-header">

                    <strong>
                        ${escapeHtml(
                            competition?.name ||
                            "Competition"
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            fixture.matchday ||
                            ""
                        )}
                    </span>

                </div>


                <div class="result-date">

                    📅 ${formatDate(
                        fixture.match_date
                    )}

                    ${
                        fixture.kick_off
                        ? ` • ⏰ ${formatTime(
                            fixture.kick_off
                        )}`
                        : ""
                    }

                </div>


                <div class="result-score">

                    <div class="result-team home-team">

                        <strong>
                            ${escapeHtml(
                                homeName
                            )}
                        </strong>

                        ${
                            homeTeam?.short_name
                            ? `
                                <small>
                                    ${escapeHtml(
                                        homeTeam.short_name
                                    )}
                                </small>
                            `
                            : ""
                        }

                    </div>


                    <div class="score-number">

                        <span>
                            ${Number(
                                result.home_score
                            ) || 0}
                        </span>

                        <span>
                            -
                        </span>

                        <span>
                            ${Number(
                                result.away_score
                            ) || 0}
                        </span>

                    </div>


                    <div class="result-team away-team">

                        <strong>
                            ${escapeHtml(
                                awayName
                            )}
                        </strong>

                        ${
                            awayTeam?.short_name
                            ? `
                                <small>
                                    ${escapeHtml(
                                        awayTeam.short_name
                                    )}
                                </small>
                            `
                            : ""
                        }

                    </div>

                </div>


                <div class="result-goals">

                    <div class="result-goal-column">

                        <h4>
                            ⚽ ${escapeHtml(
                                homeName
                            )} Goals
                        </h4>

                        ${
                            homeScorers.length
                            ? homeScorers
                                .sort(
                                    (
                                        a,
                                        b
                                    ) =>
                                        (
                                            Number(
                                                a.minute
                                            ) || 0
                                        ) -
                                        (
                                            Number(
                                                b.minute
                                            ) || 0
                                        )
                                )
                                .map(
                                    scorer => {

                                        const player =
                                            playerMap[
                                                scorer.player_id
                                            ];

                                        return `

                                            <div
                                                class="result-scorer"
                                            >

                                                <strong>
                                                    ${escapeHtml(
                                                        player?.name ||
                                                        "Player"
                                                    )}
                                                </strong>

                                                <span>

                                                    ${
                                                        scorer.minute !==
                                                        null &&
                                                        scorer.minute !==
                                                        undefined
                                                        ? `${scorer.minute}'`
                                                        : ""
                                                    }

                                                    ${
                                                        scorer.is_penalty
                                                        ? " • Penalty"
                                                        : ""
                                                    }

                                                </span>

                                            </div>

                                        `;

                                    }
                                )
                                .join("")
                            : `
                                <div
                                    class="no-scorers"
                                >
                                    No goals recorded.
                                </div>
                            `
                        }

                    </div>


                    <div class="result-goal-column">

                        <h4>
                            ⚽ ${escapeHtml(
                                awayName
                            )} Goals
                        </h4>

                        ${
                            awayScorers.length
                            ? awayScorers
                                .sort(
                                    (
                                        a,
                                        b
                                    ) =>
                                        (
                                            Number(
                                                a.minute
                                            ) || 0
                                        ) -
                                        (
                                            Number(
                                                b.minute
                                            ) || 0
                                        )
                                )
                                .map(
                                    scorer => {

                                        const player =
                                            playerMap[
                                                scorer.player_id
                                            ];

                                        return `

                                            <div
                                                class="result-scorer"
                                            >

                                                <strong>
                                                    ${escapeHtml(
                                                        player?.name ||
                                                        "Player"
                                                    )}
                                                </strong>

                                                <span>

                                                    ${
                                                        scorer.minute !==
                                                        null &&
                                                        scorer.minute !==
                                                        undefined
                                                        ? `${scorer.minute}'`
                                                        : ""
                                                    }

                                                    ${
                                                        scorer.is_penalty
                                                        ? " • Penalty"
                                                        : ""
                                                    }

                                                </span>

                                            </div>

                                        `;

                                    }
                                )
                                .join("")
                            : `
                                <div
                                    class="no-scorers"
                                >
                                    No goals recorded.
                                </div>
                            `
                        }

                    </div>

                </div>


                ${
                    result.match_report
                    ? `
                        <div
                            class="match-report"
                        >

                            <h4>
                                📝 Match Report
                            </h4>

                            <p>
                                ${escapeHtml(
                                    result.match_report
                                )}
                            </p>

                        </div>
                    `
                    : ""
                }


                ${
                    fixture.venue
                    ? `
                        <div
                            class="result-venue"
                        >
                            📍 ${escapeHtml(
                                fixture.venue
                            )}
                        </div>
                    `
                    : ""
                }

            `;


            container.appendChild(card);

        });


        if (
            container.children.length === 0
        ) {

            container.innerHTML = `

                <div
                    class="card"
                    style="text-align:center;"
                >

                    <h3>
                        🏁 No Match Results Yet
                    </h3>

                    <p>
                        Completed matches will
                        appear here.
                    </p>

                </div>

            `;

        }


    } catch (error) {

        console.error(
            "LOAD MATCH RESULTS ERROR:",
            error
        );

        container.innerHTML = `

            <div
                class="card"
                style="text-align:center;"
            >

                <h3>
                    ⚠️ Unable to Load Match Results
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

    }

}


// =====================================================
// PLAYER LEADERS
// =====================================================

async function loadPlayerLeaders() {

    const topScorersList =
        document.getElementById(
            "topScorersList"
        );

    const topAssistsList =
        document.getElementById(
            "topAssistsList"
        );

    const appearancesList =
        document.getElementById(
            "mostAppearancesList"
        );

    const yellowCardsList =
        document.getElementById(
            "yellowCardsList"
        );

    const redCardsList =
        document.getElementById(
            "redCardsList"
        );


    if (
        !topScorersList &&
        !topAssistsList &&
        !appearancesList &&
        !yellowCardsList &&
        !redCardsList
    ) {
        return;
    }


    try {

        const {
            data: stats,
            error: statsError
        } = await supabaseClient
            .from("player_match_stats")
            .select(`
                player_id,
                appearances,
                goals,
                assists,
                yellow_cards,
                red_cards
            `);

        if (statsError) {
            throw statsError;
        }


        const playerIds = [
            ...new Set(
                (stats || []).map(
                    stat => stat.player_id
                )
            )
        ];


        if (playerIds.length === 0) {

            showEmptyLeader(
                topScorersList,
                "No scorer data yet."
            );

            showEmptyLeader(
                topAssistsList,
                "No assist data yet."
            );

            showEmptyLeader(
                appearancesList,
                "No appearance data yet."
            );

            showEmptyLeader(
                yellowCardsList,
                "No yellow card data yet."
            );

            showEmptyLeader(
                redCardsList,
                "No red card data yet."
            );

            return;
        }


        const {
            data: players,
            error: playersError
        } = await supabaseClient
            .from("players")
            .select(`
                id,
                name,
                jersey_number,
                team_id
            `)
            .in("id", playerIds);

        if (playersError) {
            throw playersError;
        }


        const teamIds = [
            ...new Set(
                (players || []).map(
                    player =>
                        player.team_id
                )
            )
        ];


        const {
            data: teams,
            error: teamsError
        } = await supabaseClient
            .from("teams")
            .select(`
                id,
                name
            `)
            .in("id", teamIds);

        if (teamsError) {
            throw teamsError;
        }


        const playerMap = {};

        (players || []).forEach(player => {

            playerMap[player.id] =
                player;

        });


        const teamMap = {};

        (teams || []).forEach(team => {

            teamMap[team.id] =
                team;

        });


        const totals = {};


        (stats || []).forEach(stat => {

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


            totals[
                stat.player_id
            ].appearances +=
                Number(
                    stat.appearances
                ) || 0;


            totals[
                stat.player_id
            ].goals +=
                Number(
                    stat.goals
                ) || 0;


            totals[
                stat.player_id
            ].assists +=
                Number(
                    stat.assists
                ) || 0;


            totals[
                stat.player_id
            ].yellow_cards +=
                Number(
                    stat.yellow_cards
                ) || 0;


            totals[
                stat.player_id
            ].red_cards +=
                Number(
                    stat.red_cards
                ) || 0;

        });


        const allTotals =
            Object.values(totals);


        const scorerLeaders =
            [...allTotals]
                .filter(
                    item =>
                        item.goals > 0
                )
                .sort(
                    (a, b) =>
                        b.goals -
                        a.goals
                )
                .slice(0, 5);


        const assistLeaders =
            [...allTotals]
                .filter(
                    item =>
                        item.assists > 0
                )
                .sort(
                    (a, b) =>
                        b.assists -
                        a.assists
                )
                .slice(0, 5);


        const appearanceLeaders =
            [...allTotals]
                .filter(
                    item =>
                        item.appearances > 0
                )
                .sort(
                    (a, b) =>
                        b.appearances -
                        a.appearances
                )
                .slice(0, 5);


        const yellowLeaders =
            [...allTotals]
                .filter(
                    item =>
                        item.yellow_cards > 0
                )
                .sort(
                    (a, b) =>
                        b.yellow_cards -
                        a.yellow_cards
                )
                .slice(0, 5);


        const redLeaders =
            [...allTotals]
                .filter(
                    item =>
                        item.red_cards > 0
                )
                .sort(
                    (a, b) =>
                        b.red_cards -
                        a.red_cards
                )
                .slice(0, 5);


        renderLeaderList(
            topScorersList,
            scorerLeaders,
            playerMap,
            teamMap,
            "goals"
        );


        renderLeaderList(
            topAssistsList,
            assistLeaders,
            playerMap,
            teamMap,
            "assists"
        );


        renderLeaderList(
            appearancesList,
            appearanceLeaders,
            playerMap,
            teamMap,
            "appearances"
        );


        renderLeaderList(
            yellowCardsList,
            yellowLeaders,
            playerMap,
            teamMap,
            "yellow_cards"
        );


        renderLeaderList(
            redCardsList,
            redLeaders,
            playerMap,
            teamMap,
            "red_cards"
        );


    } catch (error) {

        console.error(
            "LOAD PLAYER LEADERS ERROR:",
            error
        );

        showLeaderError(
            topScorersList
        );

        showLeaderError(
            topAssistsList
        );

        showLeaderError(
            appearancesList
        );

        showLeaderError(
            yellowCardsList
        );

        showLeaderError(
            redCardsList
        );

    }

}


// =====================================================
// RENDER PLAYER LEADER
// =====================================================

function renderLeaderList(
    container,
    leaders,
    playerMap,
    teamMap,
    statName
) {

    if (!container) {
        return;
    }


    if (
        !leaders ||
        leaders.length === 0
    ) {

        container.innerHTML = `
            <p>
                No data yet.
            </p>
        `;

        return;
    }


    container.innerHTML = "";


    leaders.forEach(
        (leader, index) => {

            const player =
                playerMap[
                    leader.player_id
                ];

            const team =
                player
                ? teamMap[player.team_id]
                : null;


            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "leader-row";


            row.innerHTML = `

                <div class="leader-position">
                    ${index + 1}
                </div>

                <div class="leader-player">

                    <strong>
                        ${escapeHtml(
                            player?.name ||
                            "Unknown Player"
                        )}
                    </strong>

                    <small>
                        ${
                            team?.name
                            ? escapeHtml(
                                team.name
                            )
                            : "Unknown Team"
                        }
                    </small>

                </div>

                <div class="leader-stat">

                    ${Number(
                        leader[statName]
                    ) || 0}

                </div>

            `;


            container.appendChild(row);

        }
    );

}


// =====================================================
// HELPERS
// =====================================================

function showEmptyLeader(
    container,
    message
) {

    if (!container) {
        return;
    }

    container.innerHTML =
        `<p>${message}</p>`;

}


function showLeaderError(
    container
) {

    if (!container) {
        return;
    }

    container.innerHTML =
        `<p>Unable to load statistics.</p>`;

}


function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    if (Number.isNaN(
        date.getTime()
    )) {
        return dateString;
    }


    return date.toLocaleDateString(
        "en-KE",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


function formatTime(timeString) {

    if (!timeString) {
        return "";
    }


    const parts =
        timeString.split(":");


    if (parts.length < 2) {
        return timeString;
    }


    let hour =
        Number(parts[0]);

    const minute =
        parts[1];


    const suffix =
        hour >= 12
        ? "PM"
        : "AM";


    hour =
        hour % 12 || 12;


    return `${hour}:${minute} ${suffix}`;

}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
