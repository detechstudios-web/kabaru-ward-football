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

    const fixturesContainer =
        document.getElementById("upcomingFixtures");

    const resultsContainer =
        document.getElementById("resultsList");

    const leagueTableBody =
        document.getElementById("leagueTableBody");

    const scorerContainer =
        document.getElementById("topScorersList");

    const assistContainer =
        document.getElementById("topAssistsList");

    const appearanceContainer =
        document.getElementById("mostAppearancesList");

    const yellowContainer =
        document.getElementById("yellowCardsList");

    const redContainer =
        document.getElementById("redCardsList");


    // ========================================
    // HELPER: ESCAPE HTML
    // ========================================

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // ========================================
    // HELPER: FORMAT DATE
    // ========================================

    function formatDate(dateValue) {

        if (!dateValue) {
            return "Date not set";
        }

        const date =
            new Date(dateValue + "T00:00:00");

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    }


    // ========================================
    // HELPER: FORMAT TIME
    // ========================================

    function formatTime(timeValue) {

        if (!timeValue) {
            return "Kick-off TBC";
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

        const suffix =
            hour >= 12 ? "PM" : "AM";

        hour =
            hour % 12 || 12;

        return `${hour}:${minute} ${suffix}`;
    }


    // ========================================
    // HELPER: GET TEAM NAME
    // ========================================

    function getTeamName(team) {

        return (
            team?.name ||
            "Unknown Team"
        );
    }


    // ========================================
    // HELPER: UPLOAD IMAGE
    // ========================================

    async function uploadImage(
        file,
        bucketName,
        folderName
    ) {

        if (!file) {
            return null;
        }

        if (!file.type.startsWith("image/")) {
            throw new Error(
                "Please select an image file."
            );
        }

        const MAX_FILE_SIZE =
            5 * 1024 * 1024;

        if (file.size > MAX_FILE_SIZE) {
            throw new Error(
                "Each image must be 5MB or smaller."
            );
        }

        const originalName =
            file.name || "image";

        const extension =
            originalName
                .split(".")
                .pop()
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");

        const safeExtension =
            extension || "jpg";

        const randomPart =
            Math.random()
                .toString(36)
                .substring(2, 10);

        const fileName =
            `${folderName}/${Date.now()}-${randomPart}.${safeExtension}`;


        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from(bucketName)
                .upload(
                    fileName,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false,
                        contentType:
                            file.type
                    }
                );

        if (uploadError) {
            throw uploadError;
        }


        const {
            data: publicUrlData
        } =
            supabaseClient
                .storage
                .from(bucketName)
                .getPublicUrl(fileName);


        if (
            !publicUrlData ||
            !publicUrlData.publicUrl
        ) {
            throw new Error(
                "Image uploaded but public URL could not be created."
            );
        }

        return publicUrlData.publicUrl;
    }


    // ========================================
    // LOAD ACTIVE COMPETITION
    // ========================================

    async function loadCompetition() {

        if (
            !competitionNameEl &&
            !competitionSeasonEl &&
            !competitionStatusEl
        ) {
            return null;
        }

        const {
            data,
            error
        } =
            await supabaseClient
                .from("competitions")
                .select("*")
                .eq("status", "Active")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(1)
                .maybeSingle();

        if (error) {

            console.error(
                "COMPETITION ERROR:",
                error
            );

            if (competitionNameEl) {
                competitionNameEl.textContent =
                    "Competition unavailable";
            }

            return null;
        }

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

            return null;
        }


        if (competitionNameEl) {
            competitionNameEl.textContent =
                data.name || "Competition";
        }

        if (competitionSeasonEl) {
            competitionSeasonEl.textContent =
                data.season
                    ? `Season ${data.season}`
                    : "";
        }

        if (competitionStatusEl) {
            competitionStatusEl.textContent =
                data.status || "Active";
        }

        return data;
    }


    // ========================================
    // LOAD UPCOMING FIXTURES
    // ========================================

    async function loadFixtures(
        competition
    ) {

        if (!fixturesContainer) {
            return;
        }

        if (!competition) {

            fixturesContainer.innerHTML = `
                <div class="card" style="text-align:center;">
                    <h3>⚽ No Upcoming Fixtures</h3>
                    <p>
                        Fixtures will appear here once
                        they are published.
                    </p>
                </div>
            `;

            return;
        }


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
                    status,
                    home_team:teams!fixtures_home_team_id_fkey (
                        id,
                        name,
                        short_name,
                        logo_url
                    ),
                    away_team:teams!fixtures_away_team_id_fkey (
                        id,
                        name,
                        short_name,
                        logo_url
                    )
                `)
                .eq(
                    "competition_id",
                    competition.id
                )
                .not(
                    "status",
                    "in",
                    "(Completed,Cancelled)"
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

            console.error(
                "FIXTURES ERROR:",
                error
            );

            fixturesContainer.innerHTML = `
                <div class="card" style="text-align:center;">
                    <h3>⚠️ Unable to Load Fixtures</h3>
                    <p>
                        Please try again later.
                    </p>
                </div>
            `;

            return;
        }


        if (
            !fixtures ||
            fixtures.length === 0
        ) {

            fixturesContainer.innerHTML = `
                <div class="card" style="text-align:center;">
                    <h3>⚽ No Upcoming Fixtures</h3>
                    <p>
                        There are currently no upcoming
                        fixtures for this competition.
                    </p>
                </div>
            `;

            return;
        }


        fixturesContainer.innerHTML = "";


        fixtures.forEach(
            function (fixture) {

                const home =
                    fixture.home_team;

                const away =
                    fixture.away_team;


                const card =
                    document.createElement("div");

                card.className =
                    "fixture-card";


                card.innerHTML = `

                    <div class="fixture-top">
                        <span>
                            ${escapeHtml(
                                fixture.matchday ||
                                "Match"
                            )}
                        </span>

                        <span>
                            ${escapeHtml(
                                fixture.status ||
                                "Scheduled"
                            )}
                        </span>
                    </div>


                    <div class="fixture-date">
                        📅 ${formatDate(
                            fixture.match_date
                        )}

                        &nbsp; • &nbsp;

                        🕐 ${formatTime(
                            fixture.kick_off
                        )}
                    </div>


                    <div class="fixture-teams">

                        <div class="fixture-team">

                            ${
                                home?.logo_url
                                ? `
                                    <img
                                        src="${escapeHtml(
                                            home.logo_url
                                        )}"
                                        alt="${escapeHtml(
                                            getTeamName(home)
                                        )}"
                                        style="
                                            width:55px;
                                            height:55px;
                                            object-fit:contain;
                                            display:block;
                                            margin:0 auto 8px;
                                        "
                                    >
                                `
                                : `
                                    <div
                                        style="
                                            font-size:42px;
                                            margin-bottom:8px;
                                        "
                                    >
                                        ⚽
                                    </div>
                                `
                            }

                            <strong>
                                ${escapeHtml(
                                    getTeamName(home)
                                )}
                            </strong>

                        </div>


                        <div class="fixture-vs">
                            VS
                        </div>


                        <div class="fixture-team">

                            ${
                                away?.logo_url
                                ? `
                                    <img
                                        src="${escapeHtml(
                                            away.logo_url
                                        )}"
                                        alt="${escapeHtml(
                                            getTeamName(away)
                                        )}"
                                        style="
                                            width:55px;
                                            height:55px;
                                            object-fit:contain;
                                            display:block;
                                            margin:0 auto 8px;
                                        "
                                    >
                                `
                                : `
                                    <div
                                        style="
                                            font-size:42px;
                                            margin-bottom:8px;
                                        "
                                    >
                                        ⚽
                                    </div>
                                `
                            }

                            <strong>
                                ${escapeHtml(
                                    getTeamName(away)
                                )}
                            </strong>

                        </div>

                    </div>


                    <div
                        style="
                            text-align:center;
                            margin-top:12px;
                            color:#666;
                        "
                    >
                        📍 ${escapeHtml(
                            fixture.venue ||
                            "Venue TBC"
                        )}
                    </div>
                `;


                fixturesContainer.appendChild(card);
            }
        );
    }


    // ========================================
    // LOAD RESULTS
    // ========================================

    async function loadResults(
        competition
    ) {

        if (!resultsContainer) {
            return;
        }

        if (!competition) {

            resultsContainer.innerHTML = `
                <div class="card" style="text-align:center;">
                    <h3>📋 No Results Yet</h3>
                    <p>
                        Completed match results will appear here.
                    </p>
                </div>
            `;

            return;
        }


        const {
            data: results,
            error
        } =
            await supabaseClient
                .from("results")
                .select(`
                    id,
                    fixture_id,
                    home_score,
                    away_score,
                    match_report,
                    created_at,

                    fixture:fixtures (
                        id,
                        competition_id,
                        home_team_id,
                        away_team_id,
                        match_date,
                        kick_off,
                        venue,
                        matchday,

                        home_team:teams!fixtures_home_team_id_fkey (
                            id,
                            name,
                            short_name,
                            logo_url
                        ),

                        away_team:teams!fixtures_away_team_id_fkey (
                            id,
                            name,
                            short_name,
                            logo_url
                        )
                    )
                `)
                .eq(
                    "fixture.competition_id",
                    competition.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "RESULTS ERROR:",
                error
            );

            resultsContainer.innerHTML = `
                <div class="card" style="text-align:center;">
                    <h3>⚠️ Unable to Load Results</h3>
                    <p>
                        Please try again later.
                    </p>
                </div>
            `;

            return;
        }


        if (
            !results ||
            results.length === 0
        ) {

            resultsContainer.innerHTML = `
                <div class="card" style="text-align:center;">
                    <h3>📋 No Results Yet</h3>
                    <p>
                        Completed match results will appear here.
                    </p>
                </div>
            `;

            return;
        }


        resultsContainer.innerHTML = "";


        for (
            const result of results
        ) {

            const fixture =
                result.fixture;

            if (!fixture) {
                continue;
            }


            const {
                data: goals,
                error: goalsError
            } =
                await supabaseClient
                    .from("goal_scorers")
                    .select(`
                        id,
                        player_id,
                        minute,
                        is_penalty,
                        players (
                            id,
                            full_name,
                            team_id
                        )
                    `)
                    .eq(
                        "result_id",
                        result.id
                    )
                    .order(
                        "minute",
                        {
                            ascending: true,
                            nullsFirst: false
                        }
                    );


            if (goalsError) {

                console.error(
                    "GOALS ERROR:",
                    goalsError
                );
            }


            const groupedGoals = {};


            (goals || []).forEach(
                function (goal) {

                    const player =
                        goal.players;

                    if (!player) {
                        return;
                    }


                    const key =
                        player.id;


                    if (
                        !groupedGoals[key]
                    ) {

                        groupedGoals[key] = {

                            name:
                                player.full_name,

                            team_id:
                                player.team_id,

                            minutes: []
                        };
                    }


                    let minuteText =
                        goal.minute !== null &&
                        goal.minute !== undefined
                            ? `${goal.minute}'`
                            : "";


                    if (goal.is_penalty) {
                        minuteText += " (P)";
                    }


                    if (minuteText) {

                        groupedGoals[key]
                            .minutes
                            .push(minuteText);
                    }
                }
            );


            let goalHtml = "";


            Object.values(
                groupedGoals
            ).forEach(
                function (player) {

                    const minutes =
                        player.minutes.join(", ");


                    goalHtml += `
                        <div
                            style="
                                margin:4px 0;
                                font-size:14px;
                            "
                        >
                            ⚽
                            <strong>
                                ${escapeHtml(
                                    player.name
                                )}
                            </strong>

                            ${
                                minutes
                                ? `
                                    <span>
                                        ${escapeHtml(
                                            minutes
                                        )}
                                    </span>
                                `
                                : ""
                            }
                        </div>
                    `;
                }
            );


            if (!goalHtml) {

                goalHtml = `
                    <div
                        style="
                            color:#777;
                            font-size:14px;
                        "
                    >
                        No goal scorers recorded.
                    </div>
                `;
            }


            const resultCard =
                document.createElement("div");

            resultCard.className =
                "result-card";

            resultCard.style.cursor =
                "pointer";

            resultCard.style.transition =
                "transform 0.2s ease, box-shadow 0.2s ease";


            resultCard.onclick =
                function () {

                    window.location.href =
                        "match-details.html?id=" +
                        encodeURIComponent(
                            result.id
                        );
                };


            resultCard.innerHTML = `

                <div class="result-top">
                    <span>
                        ${escapeHtml(
                            fixture.matchday ||
                            "Match"
                        )}
                    </span>

                    <span>
                        ${formatDate(
                            fixture.match_date
                        )}
                    </span>
                </div>


                <div
                    style="
                        display:grid;
                        grid-template-columns:
                            1fr auto 1fr;
                        align-items:center;
                        gap:15px;
                        text-align:center;
                        padding:20px 10px;
                    "
                >

                    <div>

                        ${
                            fixture.home_team?.logo_url
                            ? `
                                <img
                                    src="${escapeHtml(
                                        fixture.home_team.logo_url
                                    )}"
                                    alt="${escapeHtml(
                                        getTeamName(
                                            fixture.home_team
                                        )
                                    )}"
                                    style="
                                        width:55px;
                                        height:55px;
                                        object-fit:contain;
                                        display:block;
                                        margin:0 auto 8px;
                                    "
                                >
                            `
                            : `
                                <div
                                    style="
                                        font-size:40px;
                                        margin-bottom:8px;
                                    "
                                >
                                    ⚽
                                </div>
                            `
                        }

                        <strong>
                            ${escapeHtml(
                                getTeamName(
                                    fixture.home_team
                                )
                            )}
                        </strong>

                    </div>


                    <div>

                        <div
                            style="
                                font-size:30px;
                                font-weight:900;
                                color:#04351f;
                            "
                        >
                            ${result.home_score}
                            -
                            ${result.away_score}
                        </div>

                    </div>


                    <div>

                        ${
                            fixture.away_team?.logo_url
                            ? `
                                <img
                                    src="${escapeHtml(
                                        fixture.away_team.logo_url
                                    )}"
                                    alt="${escapeHtml(
                                        getTeamName(
                                            fixture.away_team
                                        )
                                    )}"
                                    style="
                                        width:55px;
                                        height:55px;
                                        object-fit:contain;
                                        display:block;
                                        margin:0 auto 8px;
                                    "
                                >
                            `
                            : `
                                <div
                                    style="
                                        font-size:40px;
                                        margin-bottom:8px;
                                    "
                                >
                                    ⚽
                                </div>
                            `
                        }

                        <strong>
                            ${escapeHtml(
                                getTeamName(
                                    fixture.away_team
                                )
                            )}
                        </strong>

                    </div>

                </div>


                <div
                    style="
                        padding:0 15px 15px;
                    "
                >

                    <div
                        style="
                            font-weight:900;
                            color:#075b35;
                            margin-bottom:7px;
                        "
                    >
                        ⚽ Goals
                    </div>

                    ${goalHtml}

                </div>


                ${
                    result.match_report
                    ? `
                        <div
                            style="
                                padding:0 15px 15px;
                                color:#666;
                                font-size:14px;
                            "
                        >
                            📝
                            ${escapeHtml(
                                result.match_report
                            )}
                        </div>
                    `
                    : ""
                }


                <div
                    style="
                        margin-top:15px;
                        padding:12px;
                        text-align:center;
                        font-weight:900;
                        color:#075b35;
                        font-size:13px;
                    "
                >
                    📋 Tap to view full match details →
                </div>
            `;


            resultsContainer.appendChild(
                resultCard
            );
        }
    }


    // ========================================
    // LOAD LEAGUE TABLE
    // ========================================

    async function loadLeagueTable(
        competition
    ) {

        if (!leagueTableBody) {
            return;
        }


        if (!competition) {

            leagueTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="11"
                        style="text-align:center;"
                    >
                        No active competition.
                    </td>
                </tr>
            `;

            return;
        }


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
                    status,

                    home_team:teams!fixtures_home_team_id_fkey (
                        id,
                        name,
                        short_name
                    ),

                    away_team:teams!fixtures_away_team_id_fkey (
                        id,
                        name,
                        short_name
                    ),

                    results (
                        id,
                        home_score,
                        away_score
                    )
                `)
                .eq(
                    "competition_id",
                    competition.id
                )
                .eq(
                    "status",
                    "Completed"
                );


        if (error) {

            console.error(
                "TABLE FIXTURES ERROR:",
                error
            );

            leagueTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="11"
                        style="text-align:center;"
                    >
                        Unable to load table.
                    </td>
                </tr>
            `;

            return;
        }


        const teams = {};


        (fixtures || []).forEach(
            function (fixture) {

                const home =
                    fixture.home_team;

                const away =
                    fixture.away_team;


                // ========================================
                // CREATE HOME TEAM
                // ========================================

                if (
                    home &&
                    !teams[home.id]
                ) {

                    teams[home.id] = {

                        id:
                            home.id,

                        name:
                            home.name,

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
                            0,

                        // Last five completed matches
                        form:
                            []
                    };
                }


                // ========================================
                // CREATE AWAY TEAM
                // ========================================

                if (
                    away &&
                    !teams[away.id]
                ) {

                    teams[away.id] = {

                        id:
                            away.id,

                        name:
                            away.name,

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
                            0,

                        // Last five completed matches
                        form:
                            []
                    };
                }


                const result =
                    Array.isArray(
                        fixture.results
                    )
                        ? fixture.results[0]
                        : fixture.results;


                if (
                    !result ||
                    !home ||
                    !away
                ) {
                    return;
                }


                const homeScore =
                    Number(
                        result.home_score || 0
                    );

                const awayScore =
                    Number(
                        result.away_score || 0
                    );


                // ========================================
                // BASIC TABLE STATISTICS
                // ========================================

                teams[home.id].played++;

                teams[away.id].played++;


                teams[home.id].gf +=
                    homeScore;

                teams[home.id].ga +=
                    awayScore;


                teams[away.id].gf +=
                    awayScore;

                teams[away.id].ga +=
                    homeScore;


                // ========================================
                // WIN / DRAW / LOSS
                // ========================================

                if (
                    homeScore >
                    awayScore
                ) {

                    // HOME WIN

                    teams[home.id].won++;

                    teams[home.id].points +=
                        3;

                    teams[away.id].lost++;


                    // HOME FORM = WIN

                    teams[home.id].form.push({

                        result:
                            "W",

                        date:
                            fixture.match_date,

                        time:
                            fixture.kick_off
                    });


                    // AWAY FORM = LOSS

                    teams[away.id].form.push({

                        result:
                            "L",

                        date:
                            fixture.match_date,

                        time:
                            fixture.kick_off
                    });


                } else if (
                    homeScore <
                    awayScore
                ) {

                    // AWAY WIN

                    teams[away.id].won++;

                    teams[away.id].points +=
                        3;

                    teams[home.id].lost++;


                    // HOME FORM = LOSS

                    teams[home.id].form.push({

                        result:
                            "L",

                        date:
                            fixture.match_date,

                        time:
                            fixture.kick_off
                    });


                    // AWAY FORM = WIN

                    teams[away.id].form.push({

                        result:
                            "W",

                        date:
                            fixture.match_date,

                        time:
                            fixture.kick_off
                    });


                } else {

                    // DRAW

                    teams[home.id].drawn++;

                    teams[away.id].drawn++;


                    teams[home.id].points++;

                    teams[away.id].points++;


                    // HOME FORM = DRAW

                    teams[home.id].form.push({

                        result:
                            "D",

                        date:
                            fixture.match_date,

                        time:
                            fixture.kick_off
                    });


                    // AWAY FORM = DRAW

                    teams[away.id].form.push({

                        result:
                            "D",

                        date:
                            fixture.match_date,

                        time:
                            fixture.kick_off
                    });
                }
            }
        );


        // ========================================
        // CALCULATE GD + LAST 5 FORM
        // ========================================

        Object.values(
            teams
        ).forEach(
            function (team) {

                // ========================================
                // GOAL DIFFERENCE
                // ========================================

                team.gd =
                    team.gf -
                    team.ga;


                // ========================================
                // LAST 5 MATCH FORM
                // Latest match first
                // ========================================

                team.form =
                    (team.form || [])
                        .sort(
                            function (a, b) {

                                const dateCompare =
                                    String(
                                        b.date || ""
                                    ).localeCompare(
                                        String(
                                            a.date || ""
                                        )
                                    );


                                if (
                                    dateCompare !== 0
                                ) {

                                    return dateCompare;
                                }


                                return String(
                                    b.time || ""
                                ).localeCompare(
                                    String(
                                        a.time || ""
                                    )
                                );
                            }
                        )
                        .slice(
                            0,
                            5
                        );
            }
        );


        // ========================================
        // SORT LEAGUE TABLE
        // ========================================

        const sortedTeams =
            Object.values(teams)
                .sort(
                    function (a, b) {

                        // 1. POINTS

                        if (
                            b.points !==
                            a.points
                        ) {

                            return (
                                b.points -
                                a.points
                            );
                        }


                        // 2. GOAL DIFFERENCE

                        if (
                            b.gd !==
                            a.gd
                        ) {

                            return (
                                b.gd -
                                a.gd
                            );
                        }


                        // 3. GOALS SCORED

                        if (
                            b.gf !==
                            a.gf
                        ) {

                            return (
                                b.gf -
                                a.gf
                            );
                        }


                        // 4. TEAM NAME

                        return a.name.localeCompare(
                            b.name
                        );
                    }
                );


        // ========================================
        // NO TEAMS / NO MATCHES
        // ========================================

        if (
            sortedTeams.length === 0
        ) {

            leagueTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="11"
                        style="text-align:center;"
                    >
                        No completed matches yet.
                    </td>
                </tr>
            `;

            return;
        }


        // ========================================
        // CLEAR TABLE
        // ========================================

        leagueTableBody.innerHTML = "";


        // ========================================
        // RENDER TABLE
        // ========================================

        sortedTeams.forEach(
            function (
                team,
                index
            ) {

                const row =
                    document.createElement(
                        "tr"
                    );


                // ========================================
                // FORM HTML
                // ========================================

                let formHtml = "—";


                if (
                    team.form &&
                    team.form.length > 0
                ) {

                    formHtml =
                        team.form
                            .map(
                                function (item) {

                                    let background =
                                        "#e9f7ee";

                                    let color =
                                        "#075b35";


                                    // DRAW

                                    if (
                                        item.result ===
                                        "D"
                                    ) {

                                        background =
                                            "#fff6d8";

                                        color =
                                            "#8a6800";
                                    }


                                    // LOSS

                                    if (
                                        item.result ===
                                        "L"
                                    ) {

                                        background =
                                            "#fdeaea";

                                        color =
                                            "#a40000";
                                    }


                                    let title =
                                        "Win";


                                    if (
                                        item.result ===
                                        "D"
                                    ) {

                                        title =
                                            "Draw";
                                    }


                                    if (
                                        item.result ===
                                        "L"
                                    ) {

                                        title =
                                            "Loss";
                                    }


                                    return `
                                        <span
                                            title="${title}"
                                            style="
                                                display:inline-flex;
                                                align-items:center;
                                                justify-content:center;
                                                width:28px;
                                                height:28px;
                                                border-radius:50%;
                                                background:${background};
                                                color:${color};
                                                font-size:11px;
                                                font-weight:900;
                                                border:1px solid rgba(0,0,0,.08);
                                                flex-shrink:0;
                                            "
                                        >
                                            ${item.result}
                                        </span>
                                    `;
                                }
                            )
                            .join("");
                }


                row.innerHTML = `

                    <!-- POSITION -->

                    <td>
                        <strong>
                            ${index + 1}
                        </strong>
                    </td>


                    <!-- TEAM -->

                    <td>
                        <strong>
                            ${escapeHtml(
                                team.name
                            )}
                        </strong>
                    </td>


                    <!-- PLAYED -->

                    <td>
                        ${team.played}
                    </td>


                    <!-- WON -->

                    <td>
                        ${team.won}
                    </td>


                    <!-- DRAWN -->

                    <td>
                        ${team.drawn}
                    </td>


                    <!-- LOST -->

                    <td>
                        ${team.lost}
                    </td>


                    <!-- GOALS FOR -->

                    <td>
                        ${team.gf}
                    </td>


                    <!-- GOALS AGAINST -->

                    <td>
                        ${team.ga}
                    </td>


                    <!-- GOAL DIFFERENCE -->

                    <td>
                        <strong>
                            ${
                                team.gd > 0
                                    ? "+" +
                                      team.gd
                                    : team.gd
                            }
                        </strong>
                    </td>


                    <!-- POINTS -->

                    <td>
                        <strong>
                            ${team.points}
                        </strong>
                    </td>


                    <!-- FORM -->

                    <td>

                        <div
                            style="
                                display:flex;
                                justify-content:center;
                                align-items:center;
                                gap:4px;
                                flex-wrap:nowrap;
                                min-width:150px;
                            "
                        >

                            ${formHtml}

                        </div>

                    </td>

                `;


                leagueTableBody.appendChild(
                    row
                );
            }
        );
    }


    // ========================================
    // LOAD PLAYER STATISTICS
    // ========================================

    async function loadPlayerLeaders() {

        if (
            !scorerContainer &&
            !assistContainer &&
            !appearanceContainer &&
            !yellowContainer &&
            !redContainer
        ) {
            return;
        }


        const {
            data: stats,
            error
        } =
            await supabaseClient
                .from("player_match_stats")
                .select(`
                    player_id,
                    appearances,
                    goals,
                    assists,
                    yellow_cards,
                    red_cards,

                    players (
                        id,
                        full_name,
                        jersey_number,
                        team_id,
                        teams (
                            id,
                            name
                        )
                    )
                `);


        if (error) {

            console.error(
                "PLAYER STATS ERROR:",
                error
            );

            return;
        }


        const players = {};


        (stats || []).forEach(
            function (stat) {

                const player =
                    stat.players;

                if (!player) {
                    return;
                }


                if (
                    !players[player.id]
                ) {

                    players[player.id] = {

                        id:
                            player.id,

                        name:
                            player.full_name,

                        jersey:
                            player.jersey_number,

                        team:
                            player.teams?.name ||
                            "Unknown Team",

                        appearances:
                            0,

                        goals:
                            0,

                        assists:
                            0,

                        yellow:
                            0,

                        red:
                            0
                    };
                }


                players[player.id]
                    .appearances +=
                    Number(
                        stat.appearances || 0
                    );

                players[player.id]
                    .goals +=
                    Number(
                        stat.goals || 0
                    );

                players[player.id]
                    .assists +=
                    Number(
                        stat.assists || 0
                    );

                players[player.id]
                    .yellow +=
                    Number(
                        stat.yellow_cards || 0
                    );

                players[player.id]
                    .red +=
                    Number(
                        stat.red_cards || 0
                    );
            }
        );


        const playerList =
            Object.values(players);


        // ========================================
        // RENDER LEADER LIST
        // ========================================

        function renderLeaderList(
            container,
            list,
            valueKey,
            emptyText
        ) {

            if (!container) {
                return;
            }


            if (
                list.length === 0 ||
                list[0][valueKey] <= 0
            ) {

                container.innerHTML = `
                    <div
                        style="
                            text-align:center;
                            color:#777;
                            padding:15px;
                        "
                    >
                        ${emptyText}
                    </div>
                `;

                return;
            }


            container.innerHTML = "";


            list.slice(0, 10)
                .forEach(
                    function (
                        player,
                        index
                    ) {

                        const item =
                            document.createElement(
                                "div"
                            );


                        item.style.cssText = `
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            gap:10px;
                            padding:10px 0;
                            border-bottom:1px solid #eee;
                        `;


                        item.innerHTML = `

                            <div>

                                <strong>
                                    ${index + 1}.
                                    ${escapeHtml(
                                        player.name
                                    )}
                                </strong>

                                <div
                                    style="
                                        font-size:12px;
                                        color:#777;
                                        margin-top:3px;
                                    "
                                >
                                    ${escapeHtml(
                                        player.team
                                    )}
                                </div>

                            </div>


                            <strong
                                style="
                                    color:#075b35;
                                    font-size:18px;
                                "
                            >
                                ${player[valueKey]}
                            </strong>

                        `;


                        item.style.cursor =
                            "pointer";


                        item.onclick =
                            function () {

                                window.location.href =
                                    "player-profile.html?id=" +
                                    encodeURIComponent(
                                        player.id
                                    );
                            };


                        container.appendChild(
                            item
                        );
                    }
                );
        }


        // ========================================
        // SORT SCORERS
        // ========================================

        const scorers =
            [...playerList]
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


                        if (
                            b.assists !==
                            a.assists
                        ) {

                            return (
                                b.assists -
                                a.assists
                            );
                        }


                        return a.name.localeCompare(
                            b.name
                        );
                    }
                );


        // ========================================
        // SORT ASSISTS
        // ========================================

        const assists =
            [...playerList]
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


                        if (
                            b.goals !==
                            a.goals
                        ) {

                            return (
                                b.goals -
                                a.goals
                            );
                        }


                        return a.name.localeCompare(
                            b.name
                        );
                    }
                );


        // ========================================
        // SORT APPEARANCES
        // ========================================

        const appearances =
            [...playerList]
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


                        return a.name.localeCompare(
                            b.name
                        );
                    }
                );


        // ========================================
        // SORT YELLOW CARDS
        // ========================================

        const yellow =
            [...playerList]
                .sort(
                    function (a, b) {

                        if (
                            b.yellow !==
                            a.yellow
                        ) {

                            return (
                                b.yellow -
                                a.yellow
                            );
                        }


                        return a.name.localeCompare(
                            b.name
                        );
                    }
                );


        // ========================================
        // SORT RED CARDS
        // ========================================

        const red =
            [...playerList]
                .sort(
                    function (a, b) {

                        if (
                            b.red !==
                            a.red
                        ) {

                            return (
                                b.red -
                                a.red
                            );
                        }


                        return a.name.localeCompare(
                            b.name
                        );
                    }
                );


        // ========================================
        // DISPLAY LEADERS
        // ========================================

        renderLeaderList(
            scorerContainer,
            scorers,
            "goals",
            "No goals recorded yet."
        );


        renderLeaderList(
            assistContainer,
            assists,
            "assists",
            "No assists recorded yet."
        );


        renderLeaderList(
            appearanceContainer,
            appearances,
            "appearances",
            "No appearances recorded yet."
        );


        renderLeaderList(
            yellowContainer,
            yellow,
            "yellow",
            "No yellow cards yet."
        );


        renderLeaderList(
            redContainer,
            red,
            "red",
            "No red cards yet."
        );
    }


    // ========================================
    // TEAM REGISTRATION + IMAGE UPLOADS
    // ========================================

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
        teamRegistrationForm &&
        playersContainer &&
        addPlayerBtn
    ) {

        let players = 0;

        const MAX_PLAYERS = 20;


        // ========================================
        // TEAM LOGO INPUT
        // ========================================

        let teamLogoInput =
            document.getElementById(
                "teamLogo"
            );


        if (!teamLogoInput) {

            const logoWrapper =
                document.createElement("div");

            logoWrapper.style.cssText = `
                margin-bottom:18px;
            `;


            logoWrapper.innerHTML = `
                <label
                    for="teamLogo"
                    style="
                        display:block;
                        font-weight:700;
                        margin-bottom:7px;
                    "
                >
                    🛡️ Team Logo
                    <span
                        style="
                            font-weight:400;
                            color:#777;
                        "
                    >
                        (optional)
                    </span>
                </label>

                <input
                    type="file"
                    id="teamLogo"
                    name="teamLogo"
                    accept="image/*"
                >

                <small
                    style="
                        display:block;
                        margin-top:5px;
                        color:#777;
                    "
                >
                    Upload a clear team logo.
                    Maximum 5MB.
                </small>
            `;


            const firstInput =
                teamRegistrationForm.querySelector(
                    "input"
                );


            if (firstInput) {

                firstInput.parentNode.insertBefore(
                    logoWrapper,
                    firstInput
                );

            } else {

                teamRegistrationForm.prepend(
                    logoWrapper
                );
            }


            teamLogoInput =
                document.getElementById(
                    "teamLogo"
                );
        }


        // ========================================
        // PLAYER COUNT
        // ========================================

        function updatePlayerCount() {

            if (!playerCount) {
                return;
            }

            playerCount.textContent =
                `${players}/${MAX_PLAYERS} players`;
        }


        // ========================================
        // UPDATE PLAYER NUMBERS
        // ========================================

        function updatePlayerNumbers() {

            const rows =
                playersContainer.querySelectorAll(
                    ".player-row"
                );


            rows.forEach(
                function (
                    row,
                    index
                ) {

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


        // ========================================
        // CREATE PLAYER ROW
        // ========================================

        function createPlayerRow() {

            if (
                players >=
                MAX_PLAYERS
            ) {

                alert(
                    "Maximum of 20 players allowed."
                );

                return;
            }


            players++;


            const row =
                document.createElement(
                    "div"
                );


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


                <div
                    style="
                        margin-top:8px;
                        margin-bottom:8px;
                    "
                >

                    <label
                        style="
                            display:block;
                            font-size:13px;
                            font-weight:700;
                            margin-bottom:5px;
                        "
                    >
                        📷 Player Photo

                        <span
                            style="
                                font-weight:400;
                                color:#777;
                            "
                        >
                            (optional)
                        </span>

                    </label>


                    <input
                        type="file"
                        name="player_photo"
                        accept="image/*"
                    >


                    <small
                        style="
                            display:block;
                            margin-top:4px;
                            color:#777;
                        "
                    >
                        Maximum 5MB.
                    </small>

                </div>


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


            playersContainer.appendChild(
                row
            );


            updatePlayerCount();
        }


        // ========================================
        // ADD PLAYER BUTTON
        // ========================================

        addPlayerBtn.addEventListener(
            "click",
            createPlayerRow
        );


        // ========================================
        // CREATE FIRST PLAYER
        // ========================================

        createPlayerRow();


        // ========================================
        // TEAM REGISTRATION SUBMIT
        // ========================================

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


                const imageFiles = [];


                playerRows.forEach(
                    function (row) {

                        const nameInput =
                            row.querySelector(
                                '[name="player_name"]'
                            );

                        const jerseyInput =
                            row.querySelector(
                                '[name="jersey_number"]'
                            );

                        const positionInput =
                            row.querySelector(
                                '[name="position"]'
                            );

                        const photoInput =
                            row.querySelector(
                                '[name="player_photo"]'
                            );


                        const name =
                            nameInput?.value
                                ?.trim() || "";


                        const jersey =
                            jerseyInput?.value || "";


                        const position =
                            positionInput?.value || "";


                        const photoFile =
                            photoInput?.files?.[0] ||
                            null;


                        // IMPORTANT:
                        // The RPC expects "full_name",
                        // NOT "player_name".

                        playerData.push({

                            full_name:
                                name,

                            jersey_number:
                                Number(jersey),

                            position:
                                position
                        });


                        imageFiles.push({

                            name:
                                name,

                            jersey:
                                Number(jersey),

                            photo:
                                photoFile
                        });
                    }
                );


                // ========================================
                // VALIDATE PLAYER DATA
                // ========================================

                for (
                    const player of playerData
                ) {

                    if (
                        !player.full_name
                    ) {

                        alert(
                            "Please enter the full name for every player."
                        );

                        return;
                    }


                    if (
                        !player.jersey_number ||
                        player.jersey_number < 1
                    ) {

                        alert(
                            "Please enter a valid jersey number for every player."
                        );

                        return;
                    }


                    if (
                        !player.position
                    ) {

                        alert(
                            "Please select a position for every player."
                        );

                        return;
                    }
                }


                // ========================================
                // GET FORM VALUES
                // ========================================

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


                const teamLogoFile =
                    teamLogoInput?.files?.[0] ||
                    null;


                // ========================================
                // VALIDATE TEAM LOGO
                // ========================================

                if (teamLogoFile) {

                    if (
                        !teamLogoFile.type
                            .startsWith("image/")
                    ) {

                        alert(
                            "Team logo must be an image file."
                        );

                        return;
                    }


                    if (
                        teamLogoFile.size >
                        5 * 1024 * 1024
                    ) {

                        alert(
                            "Team logo must be 5MB or smaller."
                        );

                        return;
                    }
                }


                // ========================================
                // VALIDATE PLAYER PHOTOS
                // ========================================

                for (
                    const image of imageFiles
                ) {

                    if (!image.photo) {
                        continue;
                    }


                    if (
                        !image.photo.type
                            .startsWith("image/")
                    ) {

                        alert(
                            `Photo for ${image.name} must be an image file.`
                        );

                        return;
                    }


                    if (
                        image.photo.size >
                        5 * 1024 * 1024
                    ) {

                        alert(
                            `Photo for ${image.name} must be 5MB or smaller.`
                        );

                        return;
                    }
                }


                // ========================================
                // SUBMITTING MESSAGE
                // ========================================

                if (registrationMessage) {

                    registrationMessage.innerHTML =
                        `
                        <strong>
                            Submitting registration...
                        </strong>
                        <br>
                        Please wait.
                        `;
                }


                const submitButtons =
                    teamRegistrationForm.querySelectorAll(
                        'button[type="submit"]'
                    );


                submitButtons.forEach(
                    function (button) {

                        button.disabled =
                            true;
                    }
                );


                try {

                    // ========================================
                    // SUBMIT TEAM + PLAYERS
                    // ========================================

                    const {
                        data: rpcData,
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


                    // ========================================
                    // FIND NEWLY REGISTERED TEAM
                    // ========================================

                    let newTeam = null;


                    if (
                        rpcData &&
                        typeof rpcData === "number"
                    ) {

                        const {
                            data
                        } =
                            await supabaseClient
                                .from("teams")
                                .select(`
                                    id,
                                    name,
                                    registration_status
                                `)
                                .eq(
                                    "id",
                                    rpcData
                                )
                                .maybeSingle();


                        newTeam = data;
                    }


                    if (
                        !newTeam &&
                        rpcData &&
                        typeof rpcData === "object"
                    ) {

                        const possibleId =
                            rpcData.id ||
                            rpcData.team_id ||
                            rpcData.teamId;


                        if (possibleId) {

                            const {
                                data
                            } =
                                await supabaseClient
                                    .from("teams")
                                    .select(`
                                        id,
                                        name,
                                        registration_status
                                    `)
                                    .eq(
                                        "id",
                                        possibleId
                                    )
                                    .maybeSingle();


                            newTeam = data;
                        }
                    }


                    // ========================================
                    // FALLBACK: FIND TEAM BY NAME
                    // ========================================

                    if (!newTeam) {

                        const {
                            data,
                            error:
                                findTeamError
                        } =
                            await supabaseClient
                                .from("teams")
                                .select(`
                                    id,
                                    name,
                                    registration_status,
                                    created_at
                                `)
                                .eq(
                                    "name",
                                    teamName
                                )
                                .eq(
                                    "registration_status",
                                    "Pending"
                                )
                                .order(
                                    "created_at",
                                    {
                                        ascending: false
                                    }
                                )
                                .limit(1)
                                .maybeSingle();


                        if (
                            findTeamError
                        ) {

                            console.error(
                                "FIND TEAM ERROR:",
                                findTeamError
                            );

                        } else {

                            newTeam = data;
                        }
                    }


                    // ========================================
                    // UPLOAD TEAM LOGO
                    // ========================================

                    let teamLogoUrl =
                        null;


                    if (
                        teamLogoFile &&
                        newTeam
                    ) {

                        if (registrationMessage) {

                            registrationMessage.innerHTML =
                                `
                                <strong>
                                    Uploading team logo...
                                </strong>
                                <br>
                                Please wait.
                                `;
                        }


                        teamLogoUrl =
                            await uploadImage(
                                teamLogoFile,
                                "team-logos",
                                `team-${newTeam.id}`
                            );


                        const {
                            error:
                                teamUpdateError
                        } =
                            await supabaseClient
                                .from("teams")
                                .update({
                                    logo_url:
                                        teamLogoUrl
                                })
                                .eq(
                                    "id",
                                    newTeam.id
                                );


                        if (
                            teamUpdateError
                        ) {

                            throw new Error(
                                "Team was registered, but the team logo could not be saved: " +
                                teamUpdateError.message
                            );
                        }
                    }


                    // ========================================
                    // UPLOAD PLAYER PHOTOS
                    // ========================================

                    if (
                        newTeam &&
                        imageFiles.some(
                            item =>
                                item.photo
                        )
                    ) {

                        if (registrationMessage) {

                            registrationMessage.innerHTML =
                                `
                                <strong>
                                    Uploading player photos...
                                </strong>
                                <br>
                                Please wait.
                                `;
                        }


                        const {
                            data: registeredPlayers,
                            error:
                                playersError
                        } =
                            await supabaseClient
                                .from("players")
                                .select(`
                                    id,
                                    full_name,
                                    jersey_number
                                `)
                                .eq(
                                    "team_id",
                                    newTeam.id
                                );


                        if (playersError) {
                            throw playersError;
                        }


                        for (
                            const image of imageFiles
                        ) {

                            if (!image.photo) {
                                continue;
                            }


                            const matchingPlayer =
                                (
                                    registeredPlayers ||
                                    []
                                ).find(
                                    function (
                                        player
                                    ) {

                                        return (

                                            Number(
                                                player.jersey_number
                                            ) ===
                                            Number(
                                                image.jersey
                                            )

                                            &&

                                            String(
                                                player.full_name
                                            )
                                                .trim()
                                                .toLowerCase() ===

                                            String(
                                                image.name
                                            )
                                                .trim()
                                                .toLowerCase()
                                        );
                                    }
                                );


                            if (
                                !matchingPlayer
                            ) {

                                console.warn(
                                    "Could not find registered player for photo:",
                                    image.name
                                );

                                continue;
                            }


                            const playerPhotoUrl =
                                await uploadImage(
                                    image.photo,
                                    "player-photos",
                                    `team-${newTeam.id}/player-${matchingPlayer.id}`
                                );


                            const {
                                error:
                                    playerUpdateError
                            } =
                                await supabaseClient
                                    .from("players")
                                    .update({
                                        photo_url:
                                            playerPhotoUrl
                                    })
                                    .eq(
                                        "id",
                                        matchingPlayer.id
                                    );


                            if (
                                playerUpdateError
                            ) {

                                throw new Error(
                                    `Photo for ${image.name} uploaded, but could not be saved: ` +
                                    playerUpdateError.message
                                );
                            }
                        }
                    }


                    // ========================================
                    // SUCCESS
                    // ========================================

                    if (registrationMessage) {

                        registrationMessage.innerHTML =
                            `
                            <strong>
                                ✅ Registration submitted successfully!
                            </strong>
                            <br>
                            Your team is now awaiting approval.

                            ${
                                teamLogoFile ||
                                imageFiles.some(
                                    item =>
                                        item.photo
                                )
                                ? `
                                    <br>
                                    Your uploaded images have also been saved.
                                `
                                : ""
                            }
                            `;
                    }


                    // ========================================
                    // RESET FORM
                    // ========================================

                    teamRegistrationForm.reset();


                    // ========================================
                    // RESET PLAYERS
                    // ========================================

                    playersContainer.innerHTML =
                        "";

                    players = 0;


                    createPlayerRow();

                    updatePlayerCount();


                } catch (error) {

                    console.error(
                        "REGISTRATION ERROR:",
                        error
                    );


                    if (registrationMessage) {

                        registrationMessage.innerHTML =
                            `
                            <strong>
                                ❌ Registration failed.
                            </strong>
                            <br>
                            ${escapeHtml(
                                error.message ||
                                "Unknown error"
                            )}
                            `;
                    }


                } finally {

                    submitButtons.forEach(
                        function (button) {

                            button.disabled =
                                false;
                        }
                    );
                }
            }
        );
    }


    // ========================================
    // START APPLICATION
    // ========================================

    try {

        const competition =
            await loadCompetition();


        await Promise.allSettled([

            loadFixtures(
                competition
            ),

            loadResults(
                competition
            ),

            loadLeagueTable(
                competition
            ),

            loadPlayerLeaders()
        ]);

    } catch (error) {

        console.error(
            "APPLICATION START ERROR:",
            error
        );
    }

});
