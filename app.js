// ======================================================
// KABARU WARD FOOTBALL
// app.js
// ======================================================


// ======================================================
// GENERAL HELPERS
// ======================================================

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


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-KE",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function formatTime(timeString) {

    if (!timeString) {
        return "-";
    }

    const parts =
        timeString.split(":");

    const hour =
        Number(parts[0]);

    const minute =
        parts[1] || "00";

    const period =
        hour >= 12
            ? "PM"
            : "AM";

    const displayHour =
        hour % 12 || 12;

    return (
        displayHour +
        ":" +
        minute +
        " " +
        period
    );
}


// ======================================================
// 1. TEAM REGISTRATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const teamRegistrationForm =
            document.getElementById(
                "teamRegistrationForm"
            );

        const playersContainer =
            document.getElementById(
                "playersContainer"
            );

        const addPlayerBtn =
            document.getElementById(
                "addPlayerBtn"
            );

        const playerCount =
            document.getElementById(
                "playerCount"
            );

        const registrationMessage =
            document.getElementById(
                "registrationMessage"
            );


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

            if (!playerCount) {
                return;
            }

            playerCount.textContent =
                `${players}/${MAX_PLAYERS} players`;
        }


        function updatePlayerNumbers() {

            const rows =
                playersContainer.querySelectorAll(
                    ".player-row"
                );

            rows.forEach(
                function (row, index) {

                    const number =
                        row.querySelector(
                            ".player-number"
                        );

                    if (number) {

                        number.innerHTML =
                            `<strong>
                                Player ${index + 1}
                            </strong>`;
                    }
                }
            );
        }


        function createPlayerRow() {

            if (players >= MAX_PLAYERS) {

                alert(
                    "Maximum of 20 players allowed."
                );

                return;
            }


            players++;


            const row =
                document.createElement("div");

            row.className =
                "player-row";


            row.innerHTML = `

                <div class="player-number">

                    <strong>
                        Player ${players}
                    </strong>

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


                <select
                    name="position"
                    required
                >

                    <option value="">
                        Select position
                    </option>

                    <option value="Goalkeeper">
                        Goalkeeper
                    </option>

                    <option value="Defender">
                        Defender
                    </option>

                    <option value="Midfielder">
                        Midfielder
                    </option>

                    <option value="Forward">
                        Forward
                    </option>

                </select>


                <button
                    type="button"
                    class="remove-player-btn"
                >
                    Remove
                </button>

            `;


            const removeBtn =
                row.querySelector(
                    ".remove-player-btn"
                );


            removeBtn.addEventListener(
                "click",
                function () {

                    row.remove();

                    players--;

                    updatePlayerNumbers();

                    updatePlayerCount();
                }
            );


            playersContainer.appendChild(row);

            updatePlayerCount();
        }


        addPlayerBtn.addEventListener(
            "click",
            createPlayerRow
        );


        createPlayerRow();


        teamRegistrationForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                if (players < 1) {

                    alert(
                        "Please add at least one player."
                    );

                    return;
                }


                const formData =
                    new FormData(
                        teamRegistrationForm
                    );


                const playerRows =
                    playersContainer.querySelectorAll(
                        ".player-row"
                    );


                const playerData = [];


                playerRows.forEach(
                    function (row) {

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

                            player_name:
                                name,

                            jersey_number:
                                Number(jersey),

                            position:
                                position
                        });
                    }
                );


                const teamName =
                    formData
                        .get("teamName")
                        ?.trim();


                const shortName =
                    formData
                        .get("shortName")
                        ?.trim();


                const teamLocation =
                    formData
                        .get("teamLocation")
                        ?.trim();


                const coachName =
                    formData
                        .get("coachName")
                        ?.trim();


                const captainName =
                    formData
                        .get("captainName")
                        ?.trim();


                const viceCaptainName =
                    formData
                        .get("viceCaptainName")
                        ?.trim();


                const disciplineMasterName =
                    formData
                        .get("disciplineMasterName")
                        ?.trim();


                const teamPhone =
                    formData
                        .get("teamPhone")
                        ?.trim();


                const teamEmail =
                    formData
                        .get("teamEmail")
                        ?.trim();


                if (registrationMessage) {

                    registrationMessage.textContent =
                        "Submitting registration...";
                }


                try {

                    const {
                        error
                    } =
                        await supabaseClient.rpc(
                            "submit_team_registration",
                            {

                                p_name:
                                    teamName,

                                p_short_name:
                                    shortName,

                                p_location:
                                    teamLocation,

                                p_coach_name:
                                    coachName,

                                p_captain_name:
                                    captainName,

                                p_vice_captain_name:
                                    viceCaptainName,

                                p_discipline_master_name:
                                    disciplineMasterName,

                                p_phone:
                                    teamPhone,

                                p_email:
                                    teamEmail,

                                p_players:
                                    playerData
                            }
                        );


                    if (error) {
                        throw error;
                    }


                    if (registrationMessage) {

                        registrationMessage.innerHTML = `

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

                        registrationMessage.innerHTML = `

                            <strong>
                                Registration failed.
                            </strong>

                            <br>

                            ${escapeHtml(
                                error.message ||
                                "Unknown error"
                            )}

                        `;
                    }
                }
            }
        );
    }
);


// ======================================================
// 2. LOAD UPCOMING FIXTURES
// ======================================================

async function loadFixtures() {

    const container =
        document.getElementById(
            "upcomingFixtures"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<p>Loading fixtures...</p>";


    try {

        const {
            data: fixtures,
            error
        } =
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
                    [
                        "Scheduled",
                        "Published"
                    ]
                )
                .order(
                    "match_date",
                    {
                        ascending: true
                    }
                )
                .order(
                    "kick_off",
                    {
                        ascending: true
                    }
                );


        if (error) {
            throw error;
        }


        if (
            !fixtures ||
            fixtures.length === 0
        ) {

            container.innerHTML = `

                <div
                    class="card"
                    style="text-align:center;"
                >

                    <h3>
                        ⚽ No Upcoming Fixtures
                    </h3>

                    <p>
                        No upcoming fixtures have
                        been published yet.
                    </p>

                </div>

            `;

            return;
        }


        const teamIds = [
            ...new Set(
                fixtures.flatMap(
                    function (fixture) {

                        return [
                            fixture.home_team_id,
                            fixture.away_team_id
                        ];
                    }
                )
            )
        ];


        const competitionIds = [
            ...new Set(
                fixtures.map(
                    function (fixture) {

                        return fixture.competition_id;
                    }
                )
            )
        ];


        const {
            data: teams,
            error: teamError
        } =
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


        if (teamError) {
            throw teamError;
        }


        const {
            data: competitions,
            error: competitionError
        } =
            await supabaseClient
                .from("competitions")
                .select(`
                    id,
                    name,
                    season,
                    status
                `)
                .in(
                    "id",
                    competitionIds
                );


        if (competitionError) {
            throw competitionError;
        }


        const teamMap = {};

        (teams || []).forEach(
            function (team) {

                teamMap[team.id] =
                    team;
            }
        );


        const competitionMap = {};

        (competitions || []).forEach(
            function (competition) {

                competitionMap[
                    competition.id
                ] = competition;
            }
        );


        container.innerHTML =
            fixtures.map(
                function (fixture) {

                    const home =
                        teamMap[
                            fixture.home_team_id
                        ];


                    const away =
                        teamMap[
                            fixture.away_team_id
                        ];


                    const competition =
                        competitionMap[
                            fixture.competition_id
                        ];


                    return `

                        <div class="fixture-card">

                            <div class="fixture-competition">

                                ${escapeHtml(
                                    competition?.name ||
                                    ""
                                )}

                            </div>


                            <div class="fixture-matchday">

                                ${escapeHtml(
                                    fixture.matchday ||
                                    ""
                                )}

                            </div>


                            <div class="fixture-teams">

                                <span>
                                    ${escapeHtml(
                                        home?.name ||
                                        "Home Team"
                                    )}
                                </span>


                                <strong>
                                    VS
                                </strong>


                                <span>
                                    ${escapeHtml(
                                        away?.name ||
                                        "Away Team"
                                    )}
                                </span>

                            </div>


                            <div class="fixture-details">

                                <span>
                                    📅
                                    ${escapeHtml(
                                        formatDate(
                                            fixture.match_date
                                        )
                                    )}
                                </span>


                                <span>
                                    ⏰
                                    ${escapeHtml(
                                        formatTime(
                                            fixture.kick_off
                                        )
                                    )}
                                </span>


                                <span>
                                    📍
                                    ${escapeHtml(
                                        fixture.venue ||
                                        "-"
                                    )}
                                </span>

                            </div>

                        </div>

                    `;
                }
            ).join("");


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
        document.getElementById(
            "leagueTableBody"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        `
        <tr>
            <td colspan="10">
                Loading league table...
            </td>
        </tr>
        `;


    try {

        const {
            data: competition,
            error: competitionError
        } =
            await supabaseClient
                .from("competitions")
                .select(`
                    id
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


        if (competitionError) {
            throw competitionError;
        }


        if (!competition) {

            container.innerHTML = `
                <tr>
                    <td colspan="10">
                        Competition not found.
                    </td>
                </tr>
            `;

            return;
        }


        const {
            data: teams,
            error: teamError
        } =
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


        if (teamError) {
            throw teamError;
        }


        const {
            data: fixtures,
            error: fixtureError
        } =
            await supabaseClient
                .from("fixtures")
                .select(`
                    id,
                    competition_id,
                    home_team_id,
                    away_team_id,
                    status
                `)
                .eq(
                    "competition_id",
                    competition.id
                )
                .eq(
                    "status",
                    "Completed"
                );


        if (fixtureError) {
            throw fixtureError;
        }


        if (
            !fixtures ||
            fixtures.length === 0
        ) {

            container.innerHTML =
                (teams || []).map(
                    function (team, index) {

                        return `

                            <tr>

                                <td>
                                    ${index + 1}
                                </td>

                                <td>
                                    <strong>
                                        ${escapeHtml(
                                            team.name
                                        )}
                                    </strong>
                                </td>

                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>

                                <td>
                                    <strong>
                                        0
                                    </strong>
                                </td>

                            </tr>

                        `;
                    }
                ).join("");

            return;
        }


        const fixtureIds =
            fixtures.map(
                function (fixture) {
                    return fixture.id;
                }
            );


        const {
            data: results,
            error: resultError
        } =
            await supabaseClient
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


        if (resultError) {
            throw resultError;
        }


        const resultMap = {};


        (results || []).forEach(
            function (result) {

                resultMap[
                    result.fixture_id
                ] = result;
            }
        );


        const table = {};


        (teams || []).forEach(
            function (team) {

                table[team.id] = {

                    id:
                        team.id,

                    name:
                        team.name,

                    short_name:
                        team.short_name,

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


        fixtures.forEach(
            function (fixture) {

                const result =
                    resultMap[
                        fixture.id
                    ];


                if (!result) {
                    return;
                }


                const home =
                    table[
                        fixture.home_team_id
                    ];


                const away =
                    table[
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

                    home.points += 3;

                    away.lost++;

                }

                else if (
                    homeScore <
                    awayScore
                ) {

                    away.won++;

                    away.points += 3;

                    home.lost++;

                }

                else {

                    home.drawn++;

                    away.drawn++;

                    home.points++;

                    away.points++;
                }
            }
        );


        Object.values(table).forEach(
            function (team) {

                team.gd =
                    team.gf -
                    team.ga;
            }
        );


        const sortedTable =
            Object.values(table)
                .sort(
                    function (a, b) {

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
                    }
                );


        container.innerHTML =
            sortedTable.map(
                function (team, index) {

                    return `

                        <tr>

                            <td>
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
                                ${team.gd}
                            </td>


                            <td>

                                <strong>
                                    ${team.points}
                                </strong>

                            </td>

                        </tr>

                    `;
                }
            ).join("");


    } catch (error) {

        console.error(
            "Error loading league table:",
            error
        );


        container.innerHTML = `

            <tr>

                <td colspan="10">
                    Unable to load league table.
                </td>

            </tr>

        `;
    }
}


// ======================================================
// 4. PUBLIC MATCH RESULTS
// ======================================================

async function loadResults() {

    const container =
        document.getElementById(
            "resultsList"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<p>Loading results...</p>";


    try {

        const {
            data: competition,
            error: competitionError
        } =
            await supabaseClient
                .from("competitions")
                .select(`
                    id,
                    name,
                    season
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


        if (competitionError) {
            throw competitionError;
        }


        if (!competition) {

            container.innerHTML =
                "<p>Competition not found.</p>";

            return;
        }


        const {
            data: fixtures,
            error: fixtureError
        } =
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
                    "competition_id",
                    competition.id
                )
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


        if (fixtureError) {
            throw fixtureError;
        }


        if (
            !fixtures ||
            fixtures.length === 0
        ) {

            container.innerHTML =
                "<p>No completed matches yet.</p>";

            return;
        }


        const fixtureIds =
            fixtures.map(
                function (fixture) {
                    return fixture.id;
                }
            );


        const teamIds = [
            ...new Set(
                fixtures.flatMap(
                    function (fixture) {

                        return [
                            fixture.home_team_id,
                            fixture.away_team_id
                        ];
                    }
                )
            )
        ];


        const {
            data: teams,
            error: teamError
        } =
            await supabaseClient
                .from("teams")
                .select(`
                    id,
                    name,
                    short_name,
                    logo_url,
                    registration_status
                `)
                .in(
                    "id",
                    teamIds
                )
                .eq(
                    "registration_status",
                    "Approved"
                );


        if (teamError) {
            throw teamError;
        }


        const {
            data: results,
            error: resultError
        } =
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


        if (resultError) {
            throw resultError;
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


        // ----------------------------------------------
        // LOAD GOAL SCORERS
        // ----------------------------------------------

        let goalScorers = [];


        if (resultIds.length > 0) {

            const {
                data,
                error
            } =
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


            if (error) {
                throw error;
            }


            goalScorers =
                data || [];
        }


        // ----------------------------------------------
        // LOAD PLAYERS
        // ----------------------------------------------

        const playerIds = [
            ...new Set(
                goalScorers
                    .map(
                        function (goal) {
                            return goal.player_id;
                        }
                    )
                    .filter(
                        function (id) {

                            return (
                                id !== null &&
                                id !== undefined
                            );
                        }
                    )
            )
        ];


        let scorerPlayers = [];


        if (playerIds.length > 0) {

            const {
                data,
                error
            } =
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


            if (error) {
                throw error;
            }


            scorerPlayers =
                data || [];
        }


        const playerMap = {};


        scorerPlayers.forEach(
            function (player) {

                playerMap[
                    player.id
                ] = player;
            }
        );


        // ----------------------------------------------
        // GROUP GOALS BY RESULT
        // ----------------------------------------------

        const goalsByResult = {};


        goalScorers.forEach(
            function (goal) {

                if (
                    !goalsByResult[
                        goal.result_id
                    ]
                ) {

                    goalsByResult[
                        goal.result_id
                    ] = [];
                }


                goalsByResult[
                    goal.result_id
                ].push({

                    player:
                        playerMap[
                            goal.player_id
                        ],

                    player_id:
                        goal.player_id,

                    minute:
                        goal.minute,

                    is_penalty:
                        goal.is_penalty
                });
            }
        );


        // ----------------------------------------------
        // ADD SCORER CSS
        // ----------------------------------------------

        if (
            !document.getElementById(
                "kabaru-scorer-layout-style"
            )
        ) {

            const style =
                document.createElement(
                    "style"
                );


            style.id =
                "kabaru-scorer-layout-style";


            style.textContent = `

                .scorers-columns {

                    display: grid;

                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );

                    gap: 15px;

                    margin-top: 15px;
                }


                .scorer-side {

                    padding: 12px;

                    border-radius: 10px;

                    background:
                        rgba(
                            0,
                            0,
                            0,
                            0.03
                        );
                }


                .scorer-side h5 {

                    margin:
                        0 0 10px 0;

                    font-size: 15px;
                }


                .scorer-row {

                    padding:
                        6px 0;

                    line-height:
                        1.5;
                }


                .no-scorers {

                    opacity: 0.7;

                    font-size: 14px;
                }


                @media (max-width: 600px) {

                    .scorers-columns {

                        grid-template-columns:
                            1fr;
                    }
                }

            `;


            document.head.appendChild(
                style
            );
        }


        // ----------------------------------------------
        // RENDER RESULTS
        // ----------------------------------------------

        container.innerHTML =
            fixtures.map(
                function (fixture) {

                    const result =
                        resultMap[
                            fixture.id
                        ];


                    if (!result) {
                        return "";
                    }


                    const home =
                        teams.find(
                            function (team) {

                                return (
                                    team.id ===
                                    fixture.home_team_id
                                );
                            }
                        );


                    const away =
                        teams.find(
                            function (team) {

                                return (
                                    team.id ===
                                    fixture.away_team_id
                                );
                            }
                        );


                    const goals =
                        goalsByResult[
                            result.id
                        ] || [];


                    const homeGoals =
                        goals.filter(
                            function (goal) {

                                if (!goal.player) {
                                    return false;
                                }


                                return (
                                    String(
                                        goal.player.team_id
                                    ) ===
                                    String(
                                        fixture.home_team_id
                                    )
                                );
                            }
                        );


                    const awayGoals =
                        goals.filter(
                            function (goal) {

                                if (!goal.player) {
                                    return false;
                                }


                                return (
                                    String(
                                        goal.player.team_id
                                    ) ===
                                    String(
                                        fixture.away_team_id
                                    )
                                );
                            }
                        );


                    // ----------------------------------
                    // GROUP SAME PLAYER'S GOALS
                    // ----------------------------------

                    function groupGoalsByPlayer(
                        goalList
                    ) {

                        const grouped = {};


                        goalList.forEach(
                            function (goal) {

                                if (
                                    !goal.player
                                ) {
                                    return;
                                }


                                const playerId =
                                    goal.player_id;


                                if (
                                    !grouped[
                                        playerId
                                    ]
                                ) {

                                    grouped[
                                        playerId
                                    ] = {

                                        player:
                                            goal.player,

                                        goals:
                                            []
                                    };
                                }


                                grouped[
                                    playerId
                                ].goals.push(
                                    goal
                                );
                            }
                        );


                        return Object.values(
                            grouped
                        );
                    }


                    const groupedHomeGoals =
                        groupGoalsByPlayer(
                            homeGoals
                        );


                    const groupedAwayGoals =
                        groupGoalsByPlayer(
                            awayGoals
                        );


                    // ----------------------------------
                    // RENDER GROUPED SCORERS
                    // ----------------------------------

                    function renderGroupedScorers(
                        groupedGoals
                    ) {

                        if (
                            !groupedGoals.length
                        ) {

                            return `
                                <div class="no-scorers">
                                    No goals
                                </div>
                            `;
                        }


                        return groupedGoals
                            .map(
                                function (group) {

                                    const player =
                                        group.player;


                                    const minutes =
                                        group.goals
                                            .map(
                                                function (goal) {

                                                    let text =
                                                        "";


                                                    if (
                                                        goal.minute !==
                                                            null &&
                                                        goal.minute !==
                                                            undefined &&
                                                        goal.minute !==
                                                            ""
                                                    ) {

                                                        text +=
                                                            goal.minute +
                                                            "'";
                                                    }


                                                    if (
                                                        goal.is_penalty
                                                    ) {

                                                        text +=
                                                            " (P)";
                                                    }


                                                    return text;
                                                }
                                            )
                                            .join(", ");


                                    return `

                                        <div class="scorer-row">

                                            ⚽

                                            <strong>
                                                ${escapeHtml(
                                                    player.full_name
                                                )}
                                            </strong>

                                            ${
                                                minutes
                                                    ? " " +
                                                      escapeHtml(
                                                          minutes
                                                      )
                                                    : ""
                                            }

                                        </div>

                                    `;
                                }
                            )
                            .join("");
                    }


                    const goalText =
                        goals.length > 0
                            ? `

                                <div class="scorers-columns">

                                    <div class="scorer-side home-scorers">

                                        <h5>
                                            ${escapeHtml(
                                                home?.name ||
                                                "Home Team"
                                            )}
                                        </h5>

                                        ${renderGroupedScorers(
                                            groupedHomeGoals
                                        )}

                                    </div>


                                    <div class="scorer-side away-scorers">

                                        <h5>
                                            ${escapeHtml(
                                                away?.name ||
                                                "Away Team"
                                            )}
                                        </h5>

                                        ${renderGroupedScorers(
                                            groupedAwayGoals
                                        )}

                                    </div>

                                </div>

                            `
                            : "";


                    return `

                        <div class="result-card">


                            <div class="result-competition">

                                ${escapeHtml(
                                    competition.name
                                )}

                                ${
                                    competition.season
                                        ? ` • ${escapeHtml(
                                            competition.season
                                        )}`
                                        : ""
                                }

                            </div>


                            <div class="result-matchday">

                                ${escapeHtml(
                                    fixture.matchday ||
                                    ""
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

                                    ${escapeHtml(
                                        result.home_score
                                    )}

                                    -

                                    ${escapeHtml(
                                        result.away_score
                                    )}

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
                                    formatDate(
                                        fixture.match_date
                                    )
                                )}


                                &nbsp;&nbsp;


                                ⏰

                                ${escapeHtml(
                                    formatTime(
                                        fixture.kick_off
                                    )
                                )}


                                &nbsp;&nbsp;


                                📍

                                ${escapeHtml(
                                    fixture.venue ||
                                    "-"
                                )}

                            </div>


                        </div>

                    `;
                }
            ).join("");


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


    if (!container) {
        return;
    }


    try {

        const {
            data,
            error
        } =
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


        if (error) {
            throw error;
        }


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

async function loadPlayerLeaders() {

    const scorerContainer =
        document.getElementById(
            "topScorersList"
        );


    const assistContainer =
        document.getElementById(
            "topAssistsList"
        );


    const appearanceContainer =
        document.getElementById(
            "mostAppearancesList"
        );


    const yellowContainer =
        document.getElementById(
            "yellowCardsList"
        );


    const redContainer =
        document.getElementById(
            "redCardsList"
        );


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

        // ----------------------------------------------
        // FIND CURRENT COMPETITION
        // ----------------------------------------------

        const {
            data: competition,
            error: competitionError
        } =
            await supabaseClient
                .from("competitions")
                .select("id")
                .eq(
                    "name",
                    "Kabaru Ward Football League"
                )
                .eq(
                    "season",
                    "2026"
                )
                .maybeSingle();


        if (competitionError) {
            throw competitionError;
        }


        if (!competition) {

            throw new Error(
                "Current competition not found."
            );
        }


        // ----------------------------------------------
        // FIND COMPLETED FIXTURES
        // ----------------------------------------------

        const {
            data: fixtures,
            error: fixtureError
        } =
            await supabaseClient
                .from("fixtures")
                .select(`
                    id
                `)
                .eq(
                    "competition_id",
                    competition.id
                )
                .eq(
                    "status",
                    "Completed"
                );


        if (fixtureError) {
            throw fixtureError;
        }


        if (
            !fixtures ||
            fixtures.length === 0
        ) {

            renderEmptyLeaders();

            return;
        }


        const fixtureIds =
            fixtures.map(
                function (fixture) {
                    return fixture.id;
                }
            );


        // ----------------------------------------------
        // LOAD RESULTS
        // ----------------------------------------------

        const {
            data: results,
            error: resultError
        } =
            await supabaseClient
                .from("results")
                .select(`
                    id,
                    fixture_id
                `)
                .in(
                    "fixture_id",
                    fixtureIds
                );


        if (resultError) {
            throw resultError;
        }


        const resultIds =
            (results || []).map(
                function (result) {
                    return result.id;
                }
            );


        if (!resultIds.length) {

            renderEmptyLeaders();

            return;
        }


        // ----------------------------------------------
        // LOAD PLAYER MATCH STATS
        // ----------------------------------------------

        const {
            data: stats,
            error: statsError
        } =
            await supabaseClient
                .from("player_match_stats")
                .select(`
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


        if (statsError) {
            throw statsError;
        }


        // ----------------------------------------------
        // LOAD PLAYERS
        // ----------------------------------------------

        const playerIds = [
            ...new Set(
                (stats || []).map(
                    function (row) {
                        return row.player_id;
                    }
                )
            )
        ];


        if (!playerIds.length) {

            renderEmptyLeaders();

            return;
        }


        const {
            data: players,
            error: playersError
        } =
            await supabaseClient
                .from("players")
                .select(`
                    id,
                    full_name,
                    jersey_number,
                    team_id,
                    registration_status
                `)
                .in(
                    "id",
                    playerIds
                );


        if (playersError) {
            throw playersError;
        }


        // ----------------------------------------------
        // LOAD TEAMS
        // ----------------------------------------------

        const teamIds = [
            ...new Set(
                (players || []).map(
                    function (player) {
                        return player.team_id;
                    }
                )
            )
        ];


        const {
            data: teams,
            error: teamsError
        } =
            await supabaseClient
                .from("teams")
                .select(`
                    id,
                    name,
                    short_name
                `)
                .in(
                    "id",
                    teamIds
                );


        if (teamsError) {
            throw teamsError;
        }


        const playerMap = {};


        (players || []).forEach(
            function (player) {

                playerMap[
                    player.id
                ] = player;
            }
        );


        const teamMap = {};


        (teams || []).forEach(
            function (team) {

                teamMap[
                    team.id
                ] = team;
            }
        );


        // ----------------------------------------------
        // COMBINE STATS
        // ----------------------------------------------

        const totals = {};


        (stats || []).forEach(
            function (row) {

                if (
                    !playerMap[
                        row.player_id
                    ]
                ) {
                    return;
                }


                if (
                    !totals[
                        row.player_id
                    ]
                ) {

                    totals[
                        row.player_id
                    ] = {

                        player_id:
                            row.player_id,

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


                totals[
                    row.player_id
                ].appearances +=
                    Number(
                        row.appearances ||
                        0
                    );


                totals[
                    row.player_id
                ].goals +=
                    Number(
                        row.goals ||
                        0
                    );


                totals[
                    row.player_id
                ].assists +=
                    Number(
                        row.assists ||
                        0
                    );


                totals[
                    row.player_id
                ].yellow_cards +=
                    Number(
                        row.yellow_cards ||
                        0
                    );


                totals[
                    row.player_id
                ].red_cards +=
                    Number(
                        row.red_cards ||
                        0
                    );
            }
        );


        const leaders =
            Object.values(
                totals
            ).map(
                function (stat) {

                    const player =
                        playerMap[
                            stat.player_id
                        ];


                    return {

                        ...stat,

                        player:
                            player,

                        team:
                            teamMap[
                                player.team_id
                            ]
                    };
                }
            );


        // ----------------------------------------------
        // TOP SCORERS
        // ----------------------------------------------

        const topScorers =
            [...leaders]
                .filter(
                    function (player) {

                        return (
                            player.goals >
                            0
                        );
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


                        return a.player.full_name
                            .localeCompare(
                                b.player.full_name
                            );
                    }
                )
                .slice(0, 10);


        // ----------------------------------------------
        // TOP ASSISTS
        // ----------------------------------------------

        const topAssists =
            [...leaders]
                .filter(
                    function (player) {

                        return (
                            player.assists >
                            0
                        );
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


                        return a.player.full_name
                            .localeCompare(
                                b.player.full_name
                            );
                    }
                )
                .slice(0, 10);


        // ----------------------------------------------
        // MOST APPEARANCES
        // ----------------------------------------------

        const mostAppearances =
            [...leaders]
                .filter(
                    function (player) {

                        return (
                            player.appearances >
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


                        return a.player.full_name
                            .localeCompare(
                                b.player.full_name
                            );
                    }
                )
                .slice(0, 10);


        // ----------------------------------------------
        // YELLOW CARDS
        // ----------------------------------------------

        const yellowCards =
            [...leaders]
                .filter(
                    function (player) {

                        return (
                            player.yellow_cards >
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


                        return a.player.full_name
                            .localeCompare(
                                b.player.full_name
                            );
                    }
                )
                .slice(0, 10);


        // ----------------------------------------------
        // RED CARDS
        // ----------------------------------------------

        const redCards =
            [...leaders]
                .filter(
                    function (player) {

                        return (
                            player.red_cards >
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


                        return a.player.full_name
                            .localeCompare(
                                b.player.full_name
                            );
                    }
                )
                .slice(0, 10);


        // ----------------------------------------------
        // RENDER LEADER LIST
        // ----------------------------------------------

        function renderLeaderList(
            container,
            list,
            statName,
            emptyText
        ) {

            if (!container) {
                return;
            }


            if (!list.length) {

                container.innerHTML =
                    `<p>${emptyText}</p>`;

                return;
            }


            container.innerHTML =
                list.map(
                    function (item, index) {

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


        containers.forEach(
            function (container) {

                if (container) {

                    container.innerHTML =
                        "<p>Unable to load player statistics.</p>";
                }
            }
        );
    }
}


// ======================================================
// EMPTY LEADER DISPLAY
// ======================================================

function renderEmptyLeaders() {

    const scorerContainer =
        document.getElementById(
            "topScorersList"
        );


    const assistContainer =
        document.getElementById(
            "topAssistsList"
        );


    const appearanceContainer =
        document.getElementById(
            "mostAppearancesList"
        );


    const yellowContainer =
        document.getElementById(
            "yellowCardsList"
        );


    const redContainer =
        document.getElementById(
            "redCardsList"
        );


    if (scorerContainer) {

        scorerContainer.innerHTML =
            "<p>No goalscorers yet.</p>";
    }


    if (assistContainer) {

        assistContainer.innerHTML =
            "<p>No assist leaders yet.</p>";
    }


    if (appearanceContainer) {

        appearanceContainer.innerHTML =
            "<p>No appearances yet.</p>";
    }


    if (yellowContainer) {

        yellowContainer.innerHTML =
            "<p>No yellow cards yet.</p>";
    }


    if (redContainer) {

        redContainer.innerHTML =
            "<p>No red cards yet.</p>";
    }
}


// ======================================================
// 7. START WEBSITE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Kabaru Ward Football website started."
        );


        await loadCompetitionStatus();


        await Promise.allSettled([

            loadFixtures(),

            loadLeagueTable(),

            loadResults(),

            loadPlayerLeaders()

        ]);


        console.log(
            "Kabaru Ward Football website loaded."
        );
    }
);
