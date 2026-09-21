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
// ELEMENT VARIABLE ALIASES
// ========================================

const upcomingFixturesEl =
    fixturesContainer;

const resultsEl =
    resultsContainer;

const leagueTableEl =
    leagueTableBody;

const topScorersEl =
    scorerContainer;

const topAssistsEl =
    assistContainer;

const topAppearancesEl =
    appearanceContainer;

const yellowCardsEl =
    yellowContainer;

const redCardsEl =
    redContainer;

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
    // HELPER: GET COMPETITION TYPE
    // ========================================

    function getCompetitionType(
        competition
    ) {

        return String(
            competition?.competition_type || ""
        ).trim();
    }


    // ========================================
    // HELPER: GET COMPETITION LABEL
    // ========================================

    function getCompetitionLabel(
        competition
    ) {

        const type =
            getCompetitionType(
                competition
            );

        if (type === "Friendly") {
            return "\u00F0\u0178\u00A4\u009D Friendly";
        }

        if (type === "Cup") {
            return "\u00F0\u0178\u008F\u2020 Cup";
        }

        if (type === "League") {
            return "\u00E2\u0161\u00BD League";
        }

        return (
            competition?.name ||
            "Competition"
        );
    }


    // ========================================
    // HELPER: NORMALIZE FIXTURE STATUS
    // ========================================

    function normalizeStatus(status) {
        return String(status || "").trim().toLowerCase();
    }

    function isCompletedStatus(status) {
        return normalizeStatus(status) === "completed";
    }

    function isCancelledStatus(status) {
        const normalized = normalizeStatus(status);
        return normalized === "cancelled" || normalized === "canceled";
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
    // LOAD MAIN LEAGUE COMPETITION
    // ========================================
    //
    // IMPORTANT:
    // We deliberately prefer an ACTIVE LEAGUE.
    //
    // This prevents the newly-created Friendly
    // competition from replacing the League
    // as the main competition on the homepage.
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
            data: leagueCompetition,
            error: leagueError
        } =
            await supabaseClient
                .from("competitions")
                .select("*")
                .eq(
                    "competition_type",
                    "League"
                )
                .eq(
                    "status",
                    "Active"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(1)
                .maybeSingle();


        if (leagueError) {

            console.error(
                "LEAGUE COMPETITION ERROR:",
                leagueError
            );

            if (competitionNameEl) {
                competitionNameEl.textContent =
                    "Competition unavailable";
            }

            return null;
        }


        if (!leagueCompetition) {

            if (competitionNameEl) {
                competitionNameEl.textContent =
                    "No Active League";
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
                leagueCompetition.name ||
                "Competition";
        }

        if (competitionSeasonEl) {
            competitionSeasonEl.textContent =
                leagueCompetition.season
                    ? `Season ${leagueCompetition.season}`
                    : "";
        }

        if (competitionStatusEl) {
            competitionStatusEl.textContent =
                leagueCompetition.status ||
                "Active";
        }

        return leagueCompetition;
    }


    // ========================================
    // LOAD ALL CURRENT-SEASON COMPETITIONS
    // ========================================

    async function loadAllCompetitions(season) {
    try {
        let query = supabaseClient
            .from("competitions")
            .select(`
                id,
                name,
                competition_type,
                season,
                status,
                created_at
            `)
            .order("created_at", {
                ascending: false
            });

        if (season !== undefined && season !== null && season !== "") {
            query = query.eq("season", season);
        }

        const {
            data,
            error
        } = await query;

        if (error) {
            throw error;
        }

        return data || [];

    } catch (error) {
        console.error(
            "LOAD ALL COMPETITIONS ERROR:",
            error
        );

        return [];
    }
}

    // ========================================
    // LOAD UPCOMING FIXTURES
    // ========================================
    //
    // Shows upcoming fixtures from ALL
    // current-season competitions:
    //
    // League
    // Cup
    // Friendly
    // ========================================

    async function loadFixtures(competition) {
    if (!upcomingFixturesEl) {
        return;
    }

    upcomingFixturesEl.innerHTML = `
        <div class="loading">
            Loading fixtures...
        </div>
    `;

    try {
        // ========================================
        // GET CURRENT SEASON
        // ========================================

        const season =
            competition &&
            competition.season !== undefined &&
            competition.season !== null
                ? competition.season
                : new Date().getFullYear();

        // ========================================
        // LOAD ALL COMPETITIONS FOR THIS SEASON
        // ========================================

        const {
            data: competitions,
            error: competitionsError
        } = await supabaseClient
            .from("competitions")
            .select(`
                id,
                name,
                competition_type,
                season,
                status,
                created_at
            `)
            .eq("season", season)
            .order("created_at", {
                ascending: false
            });

        if (competitionsError) {
            throw competitionsError;
        }

        const competitionRows =
            competitions || [];

        const competitionIds =
            competitionRows
                .map(function (item) {
                    return item.id;
                })
                .filter(function (id) {
                    return id !== null &&
                           id !== undefined;
                });

        // ========================================
        // NO COMPETITIONS
        // ========================================

        if (competitionIds.length === 0) {
            upcomingFixturesEl.innerHTML = `
                <div class="empty-message">
                    No upcoming fixtures available.
                </div>
            `;
            return;
        }

        // ========================================
        // LOAD FIXTURES
        // ========================================

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
                status,
                home_team:home_team_id (
                    id,
                    name,
                    short_name,
                    logo_url
                ),
                away_team:away_team_id (
                    id,
                    name,
                    short_name,
                    logo_url
                )
            `)
            .in(
                "competition_id",
                competitionIds
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

        if (fixturesError) {
            throw fixturesError;
        }

        const upcomingFixtures =
            (fixtures || []).filter(
                function (fixture) {
                    return !isCompletedStatus(fixture.status) &&
                           !isCancelledStatus(fixture.status);
                }
            );

        // ========================================
        // NO UPCOMING FIXTURES
        // ========================================

        if (
            upcomingFixtures.length === 0
        ) {
            upcomingFixturesEl.innerHTML = `
                <div class="empty-message">
                    <div
                        style="
                            font-size:42px;
                            margin-bottom:10px;
                        "
                    >
                        \u00F0\u0178\u201C\u2026
                    </div>
                    <h3>
                        No Upcoming Fixtures
                    </h3>
                    <p>
                        There are currently no upcoming
                        matches scheduled.
                    </p>
                </div>
            `;
            return;
        }

        // ========================================
        // COMPETITION LOOKUP
        // ========================================

        const competitionMap = {};

        competitionRows.forEach(
            function (item) {
                competitionMap[
                    String(item.id)
                ] = item;
            }
        );

        // ========================================
        // RENDER FIXTURES
        // ========================================

        upcomingFixturesEl.innerHTML = "";

        upcomingFixtures.forEach(
            function (fixture) {

                const homeTeam =
                    fixture.home_team ||
                    {};

                const awayTeam =
                    fixture.away_team ||
                    {};

                const fixtureCompetition =
                    competitionMap[
                        String(
                            fixture.competition_id
                        )
                    ] || {};

                const competitionType =
                    getCompetitionType(
                        fixtureCompetition
                    );

                const competitionLabel =
                    getCompetitionLabel(
                        fixtureCompetition
                    );

                const matchDate =
                    formatDate(
                        fixture.match_date
                    );

                const kickOff =
                    formatTime(
                        fixture.kick_off
                    );

                const venue =
                    fixture.venue ||
                    "Venue TBC";

                const matchday =
                    fixture.matchday !== null &&
                    fixture.matchday !== undefined &&
                    fixture.matchday !== ""
                        ? `
                            <div
                                style="
                                    font-size:13px;
                                    color:#666;
                                    margin-top:4px;
                                "
                            >
                                Matchday
                                ${escapeHtml(
                                    fixture.matchday
                                )}
                            </div>
                        `
                        : "";

                const homeLogo =
                    homeTeam.logo_url
                        ? `
                            <img
                                src="${escapeHtml(
                                    homeTeam.logo_url
                                )}"
                                alt="${escapeHtml(
                                    homeTeam.name ||
                                    "Home Team"
                                )} logo"
                                style="
                                    width:60px;
                                    height:60px;
                                    object-fit:contain;
                                "
                            >
                        `
                        : `
                            <div
                                style="
                                    width:60px;
                                    height:60px;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    font-size:34px;
                                "
                            >
                                \u00E2\u0161\u00BD
                            </div>
                        `;

                const awayLogo =
                    awayTeam.logo_url
                        ? `
                            <img
                                src="${escapeHtml(
                                    awayTeam.logo_url
                                )}"
                                alt="${escapeHtml(
                                    awayTeam.name ||
                                    "Away Team"
                                )} logo"
                                style="
                                    width:60px;
                                    height:60px;
                                    object-fit:contain;
                                "
                            >
                        `
                        : `
                            <div
                                style="
                                    width:60px;
                                    height:60px;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    font-size:34px;
                                "
                            >
                                \u00E2\u0161\u00BD
                            </div>
                        `;

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "fixture-card";

                card.innerHTML = `
                    <div
                        style="
                            text-align:center;
                            margin-bottom:15px;
                        "
                    >
                        <div
                            style="
                                display:inline-block;
                                padding:5px 12px;
                                border-radius:20px;
                                background:#e8f5e9;
                                color:#075b35;
                                font-size:12px;
                                font-weight:700;
                            "
                        >
                            ${escapeHtml(
                                competitionLabel
                            )}
                        </div>

                        ${
                            competitionType
                                ? `
                                    <div
                                        style="
                                            font-size:12px;
                                            color:#777;
                                            margin-top:4px;
                                        "
                                    >
                                        ${escapeHtml(
                                            competitionType
                                        )}
                                    </div>
                                `
                                : ""
                        }
                    </div>

                    <div
                        style="
                            text-align:center;
                            margin-bottom:15px;
                        "
                    >
                        <div
                            style="
                                font-weight:700;
                                font-size:16px;
                            "
                        >
                            ${escapeHtml(
                                matchDate
                            )}
                        </div>

                        <div
                            style="
                                font-size:14px;
                                color:#666;
                                margin-top:4px;
                            "
                        >
                            ${escapeHtml(
                                kickOff
                            )}
                        </div>

                        <div
                            style="
                                font-size:13px;
                                color:#777;
                                margin-top:4px;
                            "
                        >
                            \u00F0\u0178\u201C\u008D ${escapeHtml(
                                venue
                            )}
                        </div>

                        ${matchday}
                    </div>

                    <div
                        style="
                            display:grid;
                            grid-template-columns:1fr auto 1fr;
                            align-items:center;
                            gap:12px;
                        "
                    >

                        <div
                            style="
                                text-align:center;
                            "
                        >
                            ${homeLogo}

                            <div
                                style="
                                    font-weight:700;
                                    margin-top:7px;
                                "
                            >
                                ${escapeHtml(
                                    getTeamName(
                                        homeTeam
                                    )
                                )}
                            </div>
                        </div>

                        <div
                            style="
                                font-weight:800;
                                font-size:18px;
                                color:#075b35;
                            "
                        >
                            VS
                        </div>

                        <div
                            style="
                                text-align:center;
                            "
                        >
                            ${awayLogo}

                            <div
                                style="
                                    font-weight:700;
                                    margin-top:7px;
                                "
                            >
                                ${escapeHtml(
                                    getTeamName(
                                        awayTeam
                                    )
                                )}
                            </div>
                        </div>

                    </div>
                `;

                upcomingFixturesEl.appendChild(
                    card
                );
            }
        );

    } catch (error) {

        console.error(
            "LOAD FIXTURES ERROR:",
            error
        );

        upcomingFixturesEl.innerHTML = `
            <div class="empty-message">
                <div
                    style="
                        font-size:40px;
                        margin-bottom:10px;
                    "
                >
                    \u00E2\u009D\u0152
                </div>

                <h3>
                    Unable to Load Fixtures
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Unknown error"
                    )}
                </p>
            </div>
        `;
    }
}
    // ========================================
    // LOAD RESULTS
    // ========================================
    //
    // Results are displayed from:
    //
    // League
    // Cup
    // Friendly
    //
    // Newest match first.
    // ========================================

            async function loadResults(competition) {
    if (!resultsEl) {
        return;
    }

    resultsEl.innerHTML = `
        <div class="loading">
            Loading results...
        </div>
    `;

    try {
        // ========================================
        // DETERMINE CURRENT SEASON
        // ========================================

        const season =
            competition &&
            competition.season !== undefined &&
            competition.season !== null
                ? competition.season
                : new Date().getFullYear();

        // ========================================
        // LOAD ALL COMPETITIONS FOR THIS SEASON
        // ========================================

        const {
            data: competitions,
            error: competitionsError
        } = await supabaseClient
            .from("competitions")
            .select(`
                id,
                name,
                competition_type,
                season,
                status,
                created_at
            `)
            .eq("season", season)
            .order("created_at", {
                ascending: false
            });

        if (competitionsError) {
            throw competitionsError;
        }

        const competitionRows =
            competitions || [];

        const competitionIds =
            competitionRows
                .map(function (item) {
                    return item.id;
                })
                .filter(function (id) {
                    return id !== null &&
                           id !== undefined;
                });

        if (
            competitionIds.length === 0
        ) {
            resultsEl.innerHTML = `
                <div class="empty-message">
                    <div
                        style="
                            font-size:42px;
                            margin-bottom:10px;
                        "
                    >
                        \u00F0\u0178\u201C\u0160
                    </div>
                    <h3>
                        No Results
                    </h3>
                    <p>
                        No competitions are available
                        for this season.
                    </p>
                </div>
            `;
            return;
        }

        // ========================================
        // LOAD COMPLETED FIXTURES FIRST
        // ========================================
        //
        // We deliberately obtain the fixture IDs
        // separately instead of using:
        //
        // .in("fixture.competition_id", ...)
        //
        // on the results query.
        // ========================================

        const {
            data: completedFixtures,
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
                status,
                home_team:home_team_id (
                    id,
                    name,
                    short_name,
                    logo_url
                ),
                away_team:away_team_id (
                    id,
                    name,
                    short_name,
                    logo_url
                )
            `)
            .in(
                "competition_id",
                competitionIds
            )

        if (fixturesError) {
            throw fixturesError;
        }

        const fixtureRows =
            completedFixtures || [];

        if (
            fixtureRows.length === 0
        ) {
            resultsEl.innerHTML = `
                <div class="empty-message">
                    <div
                        style="
                            font-size:42px;
                            margin-bottom:10px;
                        "
                    >
                        \u00F0\u0178\u201C\u0160
                    </div>
                    <h3>
                        No Completed Results
                    </h3>
                    <p>
                        No completed matches are
                        currently available.
                    </p>
                </div>
            `;
            return;
        }

        // ========================================
        // CREATE FIXTURE LOOKUP
        // ========================================

        const fixtureMap = {};

        fixtureRows.forEach(
            function (fixture) {
                fixtureMap[
                    String(fixture.id)
                ] = fixture;
            }
        );

        const fixtureIds =
            fixtureRows
                .map(function (fixture) {
                    return fixture.id;
                })
                .filter(function (id) {
                    return id !== null &&
                           id !== undefined;
                });

        // ========================================
        // LOAD RESULTS USING FIXTURE IDS
        // ========================================

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
            throw resultsError;
        }

        const resultRows =
            results || [];

        // ========================================
        // KEEP ONLY RESULTS WITH VALID FIXTURES
        // ========================================

        const validResults =
            resultRows.filter(
                function (result) {
                    return Boolean(
                        fixtureMap[
                            String(
                                result.fixture_id
                            )
                        ]
                    );
                }
            );

        // ========================================
        // SORT BY ACTUAL MATCH DATE
        // LATEST MATCH FIRST
        // ========================================

        validResults.sort(
            function (a, b) {

                const fixtureA =
                    fixtureMap[
                        String(
                            a.fixture_id
                        )
                    ];

                const fixtureB =
                    fixtureMap[
                        String(
                            b.fixture_id
                        )
                    ];

                const dateA =
                    new Date(
                        String(
                            fixtureA.match_date
                        ) +
                        "T" +
                        (
                            fixtureA.kick_off ||
                            "00:00:00"
                        )
                    ).getTime();

                const dateB =
                    new Date(
                        String(
                            fixtureB.match_date
                        ) +
                        "T" +
                        (
                            fixtureB.kick_off ||
                            "00:00:00"
                        )
                    ).getTime();

                if (
                    !Number.isNaN(dateA) &&
                    !Number.isNaN(dateB)
                ) {
                    return dateB - dateA;
                }

                return 0;
            }
        );

        // ========================================
        // NO VALID RESULTS
        // ========================================

        if (
            validResults.length === 0
        ) {
            resultsEl.innerHTML = `
                <div class="empty-message">
                    <div
                        style="
                            font-size:42px;
                            margin-bottom:10px;
                        "
                    >
                        \u00F0\u0178\u201C\u0160
                    </div>
                    <h3>
                        No Completed Results
                    </h3>
                    <p>
                        No completed match results
                        are currently available.
                    </p>
                </div>
            `;
            return;
        }

        // ========================================
        // COMPETITION LOOKUP
        // ========================================

        const competitionMap = {};

        competitionRows.forEach(
            function (item) {
                competitionMap[
                    String(item.id)
                ] = item;
            }
        );

        // ========================================
        // CLEAR RESULTS CONTAINER
        // ========================================

        resultsEl.innerHTML = "";

        // ========================================
        // RENDER EACH RESULT
        // ========================================

        for (
            const result of validResults
        ) {

            const fixture =
                fixtureMap[
                    String(
                        result.fixture_id
                    )
                ];

            if (!fixture) {
                continue;
            }

            const homeTeam =
                fixture.home_team ||
                {};

            const awayTeam =
                fixture.away_team ||
                {};

            const fixtureCompetition =
                competitionMap[
                    String(
                        fixture.competition_id
                    )
                ] || {};

            const competitionLabel =
                getCompetitionLabel(
                    fixtureCompetition
                );

            const competitionType =
                getCompetitionType(
                    fixtureCompetition
                );

            // ========================================
            // LOAD GOAL SCORERS
            // ========================================

            let goalScorers = [];

            try {

                const {
                    data: scorerRows,
                    error: scorerError
                } = await supabaseClient
                    .from("goal_scorers")
                    .select(`
                        id,
                        fixture_id,
                        player_id,
                        minute,
                        is_penalty,
                        players:player_id (
                            id,
                            full_name,
                            team_id
                        )
                    `)
                    .eq(
                        "fixture_id",
                        result.fixture_id
                    )
                    .order(
                        "minute",
                        {
                            ascending: true
                        }
                    );

                if (scorerError) {
                    console.warn(
                        "Goal scorer load error:",
                        scorerError
                    );
                } else {
                    goalScorers =
                        scorerRows || [];
                }

            } catch (scorerError) {

                console.warn(
                    "Goal scorer query failed:",
                    scorerError
                );

                goalScorers = [];
            }

            // ========================================
            // GROUP GOALS BY TEAM
            // ========================================

            const homeGoals =
                [];

            const awayGoals =
                [];

            goalScorers.forEach(
                function (goal) {

                    const player =
                        goal.players ||
                        {};

                    const goalText =
                        (
                            player.full_name ||
                            "Unknown scorer"
                        ) +
                        (
                            goal.minute !== null &&
                            goal.minute !== undefined
                                ? " " +
                                  "(" +
                                  goal.minute +
                                  "')" 
                                : ""
                        ) +
                        (
                            goal.is_penalty
                                ? " \u00E2\u0161\u00BD Pen."
                                : ""
                        );

                    if (
                        String(
                            player.team_id
                        ) ===
                        String(
                            fixture.home_team_id
                        )
                    ) {
                        homeGoals.push(
                            goalText
                        );
                    }
                    else if (
                        String(
                            player.team_id
                        ) ===
                        String(
                            fixture.away_team_id
                        )
                    ) {
                        awayGoals.push(
                            goalText
                        );
                    }
                }
            );

            // ========================================
            // FORMAT DATE AND TIME
            // ========================================

            const matchDate =
                formatDate(
                    fixture.match_date
                );

            const kickOff =
                formatTime(
                    fixture.kick_off
                );

            // ========================================
            // TEAM LOGOS
            // ========================================

            const homeLogo =
                homeTeam.logo_url
                    ? `
                        <img
                            src="${escapeHtml(
                                homeTeam.logo_url
                            )}"
                            alt="${escapeHtml(
                                homeTeam.name ||
                                "Home Team"
                            )} logo"
                            style="
                                width:60px;
                                height:60px;
                                object-fit:contain;
                            "
                        >
                    `
                    : `
                        <div
                            style="
                                width:60px;
                                height:60px;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:34px;
                            "
                        >
                            \u00E2\u0161\u00BD
                        </div>
                    `;

            const awayLogo =
                awayTeam.logo_url
                    ? `
                        <img
                            src="${escapeHtml(
                                awayTeam.logo_url
                            )}"
                            alt="${escapeHtml(
                                awayTeam.name ||
                                "Away Team"
                            )} logo"
                            style="
                                width:60px;
                                height:60px;
                                object-fit:contain;
                            "
                        >
                    `
                    : `
                        <div
                            style="
                                width:60px;
                                height:60px;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:34px;
                            "
                        >
                            \u00E2\u0161\u00BD
                        </div>
                    `;

            // ========================================
            // GOAL LISTS
            // ========================================

            const homeGoalsHtml =
                homeGoals.length > 0
                    ? `
                        <div
                            style="
                                margin-top:10px;
                                font-size:13px;
                                color:#555;
                            "
                        >
                            ${homeGoals
                                .map(
                                    function (
                                        goal
                                    ) {
                                        return `
                                            <div>
                                                \u00E2\u0161\u00BD
                                                ${escapeHtml(
                                                    goal
                                                )}
                                            </div>
                                        `;
                                    }
                                )
                                .join("")}
                        </div>
                    `
                    : "";

            const awayGoalsHtml =
                awayGoals.length > 0
                    ? `
                        <div
                            style="
                                margin-top:10px;
                                font-size:13px;
                                color:#555;
                            "
                        >
                            ${awayGoals
                                .map(
                                    function (
                                        goal
                                    ) {
                                        return `
                                            <div>
                                                \u00E2\u0161\u00BD
                                                ${escapeHtml(
                                                    goal
                                                )}
                                            </div>
                                        `;
                                    }
                                )
                                .join("")}
                        </div>
                    `
                    : "";

            // ========================================
            // MATCHDAY
            // ========================================

            const matchday =
                fixture.matchday !== null &&
                fixture.matchday !== undefined &&
                fixture.matchday !== ""
                    ? `
                        <div
                            style="
                                font-size:12px;
                                color:#777;
                                margin-top:4px;
                            "
                        >
                            Matchday
                            ${escapeHtml(
                                fixture.matchday
                            )}
                        </div>
                    `
                    : "";

            // ========================================
            // RESULT CARD
            // ========================================

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "result-card";

            card.style.cursor =
                "pointer";

            card.addEventListener(
                "click",
                function () {
                    window.location.href =
                        "match-details.html?id=" +
                        encodeURIComponent(
                            result.id
                        );
                }
            );

            card.innerHTML = `
                <div
                    style="
                        text-align:center;
                        margin-bottom:12px;
                    "
                >
                    <div
                        style="
                            display:inline-block;
                            padding:5px 12px;
                            border-radius:20px;
                            background:#e8f5e9;
                            color:#075b35;
                            font-size:12px;
                            font-weight:700;
                        "
                    >
                        ${escapeHtml(
                            competitionLabel
                        )}
                    </div>

                    ${
                        competitionType
                            ? `
                                <div
                                    style="
                                        font-size:12px;
                                        color:#777;
                                        margin-top:4px;
                                    "
                                >
                                    ${escapeHtml(
                                        competitionType
                                    )}
                                </div>
                            `
                            : ""
                    }
                </div>

                <div
                    style="
                        text-align:center;
                        margin-bottom:15px;
                    "
                >
                    <div
                        style="
                            font-size:14px;
                            font-weight:700;
                        "
                    >
                        ${escapeHtml(
                            matchDate
                        )}
                    </div>

                    <div
                        style="
                            font-size:13px;
                            color:#777;
                            margin-top:3px;
                        "
                    >
                        ${escapeHtml(
                            kickOff
                        )}
                    </div>

                    ${
                        fixture.venue
                            ? `
                                <div
                                    style="
                                        font-size:12px;
                                        color:#777;
                                        margin-top:4px;
                                    "
                                >
                                    \u00F0\u0178\u201C\u008D
                                    ${escapeHtml(
                                        fixture.venue
                                    )}
                                </div>
                            `
                            : ""
                    }

                    ${matchday}
                </div>

                <div
                    style="
                        display:grid;
                        grid-template-columns:1fr auto 1fr;
                        align-items:center;
                        gap:12px;
                    "
                >

                    <div
                        style="
                            text-align:center;
                        "
                    >
                        ${homeLogo}

                        <div
                            style="
                                font-weight:700;
                                margin-top:7px;
                            "
                        >
                            ${escapeHtml(
                                getTeamName(
                                    homeTeam
                                )
                            )}
                        </div>

                        ${
                            homeGoalsHtml
                        }
                    </div>

                    <div
                        style="
                            text-align:center;
                        "
                    >
                        <div
                            style="
                                font-size:28px;
                                font-weight:900;
                                color:#075b35;
                            "
                        >
                            ${escapeHtml(
                                result.home_score
                            )}
                            -
                            ${escapeHtml(
                                result.away_score
                            )}
                        </div>

                        <div
                            style="
                                font-size:11px;
                                color:#777;
                                margin-top:3px;
                            "
                        >
                            FT
                        </div>
                    </div>

                    <div
                        style="
                            text-align:center;
                        "
                    >
                        ${awayLogo}

                        <div
                            style="
                                font-weight:700;
                                margin-top:7px;
                            "
                        >
                            ${escapeHtml(
                                getTeamName(
                                    awayTeam
                                )
                            )}
                        </div>

                        ${
                            awayGoalsHtml
                        }
                    </div>

                </div>

                ${
                    result.match_report
                        ? `
                            <div
                                style="
                                    margin-top:18px;
                                    padding-top:14px;
                                    border-top:1px solid #eee;
                                "
                            >
                                <div
                                    style="
                                        font-size:12px;
                                        font-weight:700;
                                        color:#075b35;
                                        margin-bottom:5px;
                                    "
                                >
                                    Match Report
                                </div>

                                <div
                                    style="
                                        font-size:13px;
                                        line-height:1.5;
                                        color:#555;
                                    "
                                >
                                    ${escapeHtml(
                                        result.match_report
                                    )}
                                </div>
                            </div>
                        `
                        : ""
                }

                <div
                    style="
                        text-align:center;
                        margin-top:15px;
                        font-size:12px;
                        color:#075b35;
                        font-weight:700;
                    "
                >
                    \u00F0\u0178\u2018\u0081\u00EF\u00B8\u008F View Match Details
                </div>
            `;

            resultsEl.appendChild(
                card
            );
        }

    } catch (error) {

        console.error(
            "LOAD RESULTS ERROR:",
            error
        );

        resultsEl.innerHTML = `
            <div class="empty-message">
                <div
                    style="
                        font-size:40px;
                        margin-bottom:10px;
                    "
                >
                    \u00E2\u009D\u0152
                </div>

                <h3>
                    Unable to Load Results
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Unknown error"
                    )}
                </p>
            </div>
        `;
    }
}                                    
                                


    // ========================================
    // LOAD LEAGUE TABLE
    // ========================================
    //
    // VERY IMPORTANT:
    //
    // ONLY League competition fixtures enter
    // the league table.
    //
    // Cup and Friendly matches are excluded.
    //
    // BUT Form is calculated separately from
    // ALL competitions.
    // ========================================

    
        // ========================================
        // BUILD LEAGUE TABLE TEAMS
        // ========================================

          async function loadLeagueTable(competition) {
    if (!leagueTableEl) {
        return;
    }

    leagueTableEl.innerHTML = `
        <tr>
            <td colspan="11" class="loading">
                Loading league table...
            </td>
        </tr>
    `;

    try {
        // ========================================
        // DETERMINE CURRENT SEASON
        // ========================================

        const season =
            competition &&
            competition.season !== undefined &&
            competition.season !== null
                ? competition.season
                : new Date().getFullYear();

        // ========================================
        // FIND ACTIVE LEAGUE
        // ========================================

        let leagueCompetition =
            null;

        const {
            data: leagueCompetitions,
            error: leagueCompetitionError
        } = await supabaseClient
            .from("competitions")
            .select(`
                id,
                name,
                competition_type,
                season,
                status,
                created_at
            `)
            .eq(
                "season",
                season
            )
            .ilike(
                "competition_type",
                "league"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

        if (leagueCompetitionError) {
            throw leagueCompetitionError;
        }

        const leagueRows =
            leagueCompetitions || [];

        if (
            leagueRows.length > 0
        ) {
            leagueCompetition =
                leagueRows.find(
                    function (item) {
                        return (
                            String(
                                item.status ||
                                ""
                            ).toLowerCase() ===
                            "active"
                        );
                    }
                ) ||
                leagueRows[0];
        }

        // ========================================
        // NO LEAGUE
        // ========================================

        if (!leagueCompetition) {
            leagueTableEl.innerHTML = `
                <tr>
                    <td colspan="11" class="empty-message">
                        No active league is available for this season.
                    </td>
                </tr>
            `;

            return;
        }

        // ========================================
        // LOAD ALL APPROVED TEAMS
        // ========================================
        //
        // This is important.
        //
        // We don't create the table only from
        // completed matches. Teams with zero
        // completed matches must also appear.
        // ========================================

        const {
            data: teams,
            error: teamsError
        } = await supabaseClient
            .from("teams")
            .select(`
                id,
                name,
                short_name,
                logo_url,
                registration_status
            `)
            .eq(
                "registration_status",
                "Approved"
            )
            .order(
                "name",
                {
                    ascending: true
                }
            );

        if (teamsError) {
            throw teamsError;
        }

        const approvedTeams =
            teams || [];

        // ========================================
        // LOAD ALL FIXTURES FOR THIS LEAGUE
        // ========================================

        const {
            data: leagueFixtures,
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
                status,
                home_team:home_team_id (
                    id,
                    name,
                    short_name,
                    logo_url
                ),
                away_team:away_team_id (
                    id,
                    name,
                    short_name,
                    logo_url
                )
            `)
            .eq(
                "competition_id",
                leagueCompetition.id
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

        if (fixturesError) {
            throw fixturesError;
        }

        const fixtureRows =
            leagueFixtures || [];

        // ========================================
        // LOAD RESULTS FOR LEAGUE FIXTURES
        // ========================================

        const leagueFixtureIds =
            fixtureRows
                .map(function (fixture) {
                    return fixture.id;
                })
                .filter(function (id) {
                    return id !== null &&
                           id !== undefined;
                });

        let resultRows = [];

        if (
            leagueFixtureIds.length > 0
        ) {

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
                    leagueFixtureIds
                );

            if (resultsError) {
                throw resultsError;
            }

            resultRows =
                results || [];
        }

        // ========================================
        // RESULT LOOKUP
        // ========================================

        const resultMap = {};

        resultRows.forEach(
            function (result) {
                resultMap[
                    String(
                        result.fixture_id
                    )
                ] = result;
            }
        );

        // ========================================
        // CREATE TABLE DATA FOR ALL TEAMS
        // ========================================

        const table = {};

        approvedTeams.forEach(
            function (team) {

                table[
                    String(team.id)
                ] = {
                    id: team.id,
                    name:
                        team.name ||
                        "Unknown Team",
                    short_name:
                        team.short_name ||
                        team.name ||
                        "Unknown",
                    logo_url:
                        team.logo_url ||
                        "",
                    played: 0,
                    won: 0,
                    drawn: 0,
                    lost: 0,
                    gf: 0,
                    ga: 0,
                    gd: 0,
                    points: 0,
                    form: []
                };
            }
        );

        // ========================================
        // PROCESS COMPLETED LEAGUE MATCHES
        // ========================================

        fixtureRows.forEach(
            function (fixture) {

                if (
                    String(
                        fixture.status ||
                        ""
                    ).toLowerCase() !==
                    "completed"
                ) {
                    return;
                }

                const result =
                    resultMap[
                        String(
                            fixture.id
                        )
                    ];

                if (!result) {
                    return;
                }

                const homeId =
                    String(
                        fixture.home_team_id
                    );

                const awayId =
                    String(
                        fixture.away_team_id
                    );

                if (
                    !table[homeId] ||
                    !table[awayId]
                ) {
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

                if (
                    !Number.isFinite(
                        homeScore
                    ) ||
                    !Number.isFinite(
                        awayScore
                    )
                ) {
                    return;
                }

                // ========================================
                // HOME TEAM
                // ========================================

                table[homeId].played += 1;

                table[homeId].gf +=
                    homeScore;

                table[homeId].ga +=
                    awayScore;

                // ========================================
                // AWAY TEAM
                // ========================================

                table[awayId].played += 1;

                table[awayId].gf +=
                    awayScore;

                table[awayId].ga +=
                    homeScore;

                // ========================================
                // RESULT
                // ========================================

                if (
                    homeScore >
                    awayScore
                ) {

                    table[homeId].won += 1;
                    table[homeId].points += 3;

                    table[awayId].lost += 1;

                    table[homeId].form.push(
                        "W"
                    );

                    table[awayId].form.push(
                        "L"
                    );

                }
                else if (
                    homeScore <
                    awayScore
                ) {

                    table[awayId].won += 1;
                    table[awayId].points += 3;

                    table[homeId].lost += 1;

                    table[homeId].form.push(
                        "L"
                    );

                    table[awayId].form.push(
                        "W"
                    );

                }
                else {

                    table[homeId].drawn += 1;
                    table[awayId].drawn += 1;

                    table[homeId].points += 1;
                    table[awayId].points += 1;

                    table[homeId].form.push(
                        "D"
                    );

                    table[awayId].form.push(
                        "D"
                    );
                }
            }
        );

        // ========================================
        // CALCULATE GOAL DIFFERENCE
        // ========================================

        Object.keys(table).forEach(
            function (teamId) {

                table[teamId].gd =
                    table[teamId].gf -
                    table[teamId].ga;

                // Keep only the latest
                // five league results.
                table[teamId].form =
                    table[teamId]
                        .form
                        .slice(0, 5);
            }
        );

        // ========================================
        // FORM FROM ALL CURRENT-SEASON
        // COMPETITIONS
        // ========================================
        //
        // The League table itself remains based
        // ONLY on League matches.
        //
        // Form, however, shows the team's latest
        // completed matches across the current
        // season.
        // ========================================

        const {
            data: currentSeasonCompetitions,
            error: seasonCompetitionsError
        } = await supabaseClient
            .from("competitions")
            .select(`
                id,
                name,
                competition_type,
                season
            `)
            .eq(
                "season",
                season
            );

        if (
            seasonCompetitionsError
        ) {
            throw seasonCompetitionsError;
        }

        const seasonCompetitionRows =
            currentSeasonCompetitions ||
            [];

        const seasonCompetitionIds =
            seasonCompetitionRows
                .map(function (item) {
                    return item.id;
                })
                .filter(function (id) {
                    return id !== null &&
                           id !== undefined;
                });

        if (
            seasonCompetitionIds.length > 0
        ) {

            const {
                data: allSeasonFixtures,
                error: allSeasonFixturesError
            } = await supabaseClient
                .from("fixtures")
                .select(`
                    id,
                    competition_id,
                    home_team_id,
                    away_team_id,
                    match_date,
                    kick_off,
                    status
                `)
                .in(
                    "competition_id",
                    seasonCompetitionIds
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

            if (
                allSeasonFixturesError
            ) {
                throw allSeasonFixturesError;
            }

            const allSeasonFixtureRows =
                allSeasonFixtures ||
                [];

            const allSeasonFixtureIds =
                allSeasonFixtureRows
                    .map(function (fixture) {
                        return fixture.id;
                    })
                    .filter(function (id) {
                        return id !== null &&
                               id !== undefined;
                    });

            let allSeasonResults =
                [];

            if (
                allSeasonFixtureIds.length >
                0
            ) {

                const {
                    data: seasonResults,
                    error: seasonResultsError
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
                        allSeasonFixtureIds
                    );

                if (
                    seasonResultsError
                ) {
                    throw seasonResultsError;
                }

                allSeasonResults =
                    seasonResults ||
                    [];
            }

            const allSeasonResultMap =
                {};

            allSeasonResults.forEach(
                function (result) {

                    allSeasonResultMap[
                        String(
                            result.fixture_id
                        )
                    ] = result;
                }
            );

            // Reset form before rebuilding
            Object.keys(table).forEach(
                function (teamId) {
                    table[teamId].form = [];
                }
            );

            allSeasonFixtureRows.forEach(
                function (fixture) {

                    const result =
                        allSeasonResultMap[
                            String(
                                fixture.id
                            )
                        ];

                    if (!result) {
                        return;
                    }

                    const homeId =
                        String(
                            fixture.home_team_id
                        );

                    const awayId =
                        String(
                            fixture.away_team_id
                        );

                    const home =
                        table[homeId];

                    const away =
                        table[awayId];

                    if (
                        !home &&
                        !away
                    ) {
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

                    if (
                        !Number.isFinite(
                            homeScore
                        ) ||
                        !Number.isFinite(
                            awayScore
                        )
                    ) {
                        return;
                    }

                    if (
                        home &&
                        home.form.length < 5
                    ) {

                        if (
                            homeScore >
                            awayScore
                        ) {
                            home.form.push(
                                "W"
                            );
                        }
                        else if (
                            homeScore <
                            awayScore
                        ) {
                            home.form.push(
                                "L"
                            );
                        }
                        else {
                            home.form.push(
                                "D"
                            );
                        }
                    }

                    if (
                        away &&
                        away.form.length < 5
                    ) {

                        if (
                            awayScore >
                            homeScore
                        ) {
                            away.form.push(
                                "W"
                            );
                        }
                        else if (
                            awayScore <
                            homeScore
                        ) {
                            away.form.push(
                                "L"
                            );
                        }
                        else {
                            away.form.push(
                                "D"
                            );
                        }
                    }
                }
            );
        }

        // ========================================
        // SORT LEAGUE TABLE
        // ========================================
        //
        // 1. Points
        // 2. Goal Difference
        // 3. Goals Scored
        // 4. Team Name
        // ========================================

        const tableRows =
            Object.values(table);

        tableRows.sort(
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

                return (
                    a.name ||
                    ""
                ).localeCompare(
                    b.name ||
                    ""
                );
            }
        );

        // ========================================
        // NO TEAMS
        // ========================================

        if (
            tableRows.length === 0
        ) {
            leagueTableEl.innerHTML = `
                <tr>
                    <td colspan="11" class="empty-message">
                        No approved teams are currently available for the league.
                    </td>
                </tr>
            `;
            return;
        }

        // ========================================
        // RENDER TABLE
        // ========================================

        leagueTableEl.innerHTML = `
            ${tableRows
                            .map(
                                function (
                                    team,
                                    index
                                ) {

                                    const logo =
                                        team.logo_url
                                            ? `
                                                <img
                                                    src="${escapeHtml(
                                                        team.logo_url
                                                    )}"
                                                    alt="${escapeHtml(
                                                        team.name
                                                    )} logo"
                                                    style="
                                                        width:32px;
                                                        height:32px;
                                                        object-fit:contain;
                                                        vertical-align:middle;
                                                        margin-right:7px;
                                                    "
                                                >
                                            `
                                            : "";

                                    const formHtml =
                                        team.form.length >
                                        0
                                            ? team.form
                                                .map(
                                                    function (
                                                        result
                                                    ) {

                                                        let className =
                                                            "form-d";

                                                        if (
                                                            result ===
                                                            "W"
                                                        ) {
                                                            className =
                                                                "form-w";
                                                        }

                                                        if (
                                                            result ===
                                                            "L"
                                                        ) {
                                                            className =
                                                                "form-l";
                                                        }

                                                        return `
                                                            <span
                                                                class="${className}"
                                                                style="
                                                                    display:inline-flex;
                                                                    width:24px;
                                                                    height:24px;
                                                                    align-items:center;
                                                                    justify-content:center;
                                                                    border-radius:50%;
                                                                    margin-right:3px;
                                                                    font-size:11px;
                                                                    font-weight:700;
                                                                "
                                                            >
                                                                ${result}
                                                            </span>
                                                        `;
                                                    }
                                                )
                                                .join("")
                                            : `
                                                <span
                                                    style="
                                                        color:#999;
                                                        font-size:12px;
                                                    "
                                                >
                                                    \u00E2\u20AC\u201D
                                                </span>
                                            `;

                                    return `
                                        <tr>

                                            <td>
                                                ${
                                                    index +
                                                    1
                                                }
                                            </td>

                                            <td>
                                                <div
                                                    style="
                                                        display:flex;
                                                        align-items:center;
                                                        min-width:170px;
                                                    "
                                                >
                                                    ${logo}

                                                    <span>
                                                        ${escapeHtml(
                                                            team.name
                                                        )}
                                                    </span>
                                                </div>
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
                                                ${
                                                    team.gd >
                                                    0
                                                        ? "+"
                                                        : ""
                                                }${team.gd}
                                            </td>

                                            <td>
                                                <strong>
                                                    ${team.points}
                                                </strong>
                                            </td>

                                            <td>
                                                ${formHtml}
                                            </td>

                                        </tr>
                                    `;
                                }
                            )
                            .join("")}
        `;

    } catch (error) {

        console.error(
            "LOAD LEAGUE TABLE ERROR:",
            error
        );

        leagueTableEl.innerHTML = `
            <tr>
                <td colspan="11" class="empty-message">
                    Unable to load the league table.
                </td>
            </tr>
        `;
    }
}              

    // ========================================
    // LOAD PLAYER STATISTICS
    // ========================================
    //
    // Player statistics continue to work across
    // League, Cup and Friendly matches because
    // player_match_stats is not restricted to
    // one competition.
    // ========================================

    // ========================================
// LOAD PLAYER LEADERS
// ========================================

async function loadPlayerLeaders(competition) {

    if (
        !topScorersEl &&
        !topAssistsEl &&
        !topAppearancesEl &&
        !yellowCardsEl &&
        !redCardsEl
    ) {
        return;
    }

    try {

        // ========================================
        // DETERMINE CURRENT SEASON
        // ========================================

        const season =
            competition &&
            competition.season !== undefined &&
            competition.season !== null
                ? competition.season
                : new Date().getFullYear();


        // ========================================
        // LOAD COMPETITIONS FOR CURRENT SEASON
        // ========================================

        const {
            data: competitions,
            error: competitionsError
        } = await supabaseClient
            .from("competitions")
            .select(`
                id,
                name,
                competition_type,
                season,
                status
            `)
            .eq(
                "season",
                season
            );

        if (competitionsError) {
            throw competitionsError;
        }

        const competitionRows =
            competitions || [];


        // ========================================
        // GET COMPETITION IDS
        // ========================================

        const competitionIds =
            competitionRows
                .map(function (competition) {
                    return competition.id;
                })
                .filter(function (id) {
                    return (
                        id !== null &&
                        id !== undefined
                    );
                });


        if (
            competitionIds.length === 0
        ) {

            if (topScorersEl) {
                topScorersEl.innerHTML =
                    `<div class="empty-message">
                        No player statistics available.
                    </div>`;
            }

            if (topAssistsEl) {
                topAssistsEl.innerHTML =
                    `<div class="empty-message">
                        No player statistics available.
                    </div>`;
            }

            if (topAppearancesEl) {
                topAppearancesEl.innerHTML =
                    `<div class="empty-message">
                        No player statistics available.
                    </div>`;
            }

            if (yellowCardsEl) {
                yellowCardsEl.innerHTML =
                    `<div class="empty-message">
                        No player statistics available.
                    </div>`;
            }

            if (redCardsEl) {
                redCardsEl.innerHTML =
                    `<div class="empty-message">
                        No player statistics available.
                    </div>`;
            }

            return;
        }


        // ========================================
        // LOAD CURRENT-SEASON FIXTURES
        // ========================================

        const {
            data: fixtures,
            error: fixturesError
        } = await supabaseClient
            .from("fixtures")
            .select(`
                id,
                competition_id,
                status
            `)
            .in(
                "competition_id",
                competitionIds
            );

        if (fixturesError) {
            throw fixturesError;
        }

        const fixtureRows =
            fixtures || [];


        const fixtureIds =
            fixtureRows
                .map(function (fixture) {
                    return fixture.id;
                })
                .filter(function (id) {
                    return (
                        id !== null &&
                        id !== undefined
                    );
                });


        if (
            fixtureIds.length === 0
        ) {

            if (topScorersEl) {
                topScorersEl.innerHTML =
                    `<div class="empty-message">
                        No player statistics available.
                    </div>`;
            }

            if (topAssistsEl) {
                topAssistsEl.innerHTML =
                    `<div class="empty-message">
                        No player statistics available.
                    </div>`;
            }

            if (topAppearancesEl) {
                topAppearancesEl.innerHTML =
                    `<div class="empty-message">
                        No player statistics available.
                    </div>`;
            }

            if (yellowCardsEl) {
                yellowCardsEl.innerHTML =
                    `<div class="empty-message">
                        No player statistics available.
                    </div>`;
            }

            if (redCardsEl) {
                redCardsEl.innerHTML =
                    `<div class="empty-message">
                        No player statistics available.
                    </div>`;
            }

            return;
        }


        // ========================================
        // LOAD PLAYER MATCH STATISTICS
        // ========================================

        const {
            data: stats,
            error: statsError
        } = await supabaseClient
            .from("player_match_stats")
            .select(`
                id,
                fixture_id,
                player_id,
                appearances,
                goals,
                assists,
                yellow_cards,
                red_cards
            `)
            .in(
                "fixture_id",
                fixtureIds
            );

        if (statsError) {
            throw statsError;
        }

        const statRows =
            stats || [];


        // ========================================
        // NO STATISTICS
        // ========================================

        if (
            statRows.length === 0
        ) {

            const emptyMessage = `
                <div class="empty-message">
                    No player statistics available yet.
                </div>
            `;

            if (topScorersEl) {
                topScorersEl.innerHTML =
                    emptyMessage;
            }

            if (topAssistsEl) {
                topAssistsEl.innerHTML =
                    emptyMessage;
            }

            if (topAppearancesEl) {
                topAppearancesEl.innerHTML =
                    emptyMessage;
            }

            if (yellowCardsEl) {
                yellowCardsEl.innerHTML =
                    emptyMessage;
            }

            if (redCardsEl) {
                redCardsEl.innerHTML =
                    emptyMessage;
            }

            return;
        }


        // ========================================
        // AGGREGATE PLAYER STATISTICS
        // ========================================

        const playerStats = {};


        statRows.forEach(
            function (stat) {

                if (
                    stat.player_id === null ||
                    stat.player_id === undefined
                ) {
                    return;
                }

                const playerId =
                    String(
                        stat.player_id
                    );


                if (
                    !playerStats[playerId]
                ) {

                    playerStats[playerId] = {

                        player_id:
                            stat.player_id,

                        appearances: 0,

                        goals: 0,

                        assists: 0,

                        yellow_cards: 0,

                        red_cards: 0
                    };
                }


                playerStats[playerId]
                    .appearances +=
                    Number(
                        stat.appearances || 0
                    );


                playerStats[playerId]
                    .goals +=
                    Number(
                        stat.goals || 0
                    );


                playerStats[playerId]
                    .assists +=
                    Number(
                        stat.assists || 0
                    );


                playerStats[playerId]
                    .yellow_cards +=
                    Number(
                        stat.yellow_cards || 0
                    );


                playerStats[playerId]
                    .red_cards +=
                    Number(
                        stat.red_cards || 0
                    );
            }
        );


        // ========================================
        // LOAD PLAYER INFORMATION
        // ========================================

        const playerIds =
            Object.values(
                playerStats
            )
                .map(function (item) {
                    return item.player_id;
                })
                .filter(function (id) {
                    return (
                        id !== null &&
                        id !== undefined
                    );
                });


        if (
            playerIds.length === 0
        ) {
            return;
        }


        const {
            data: players,
            error: playersError
        } = await supabaseClient
            .from("players")
            .select(`
                id,
                full_name,
                photo_url,
                team_id,
                teams:team_id (
                    id,
                    name,
                    short_name,
                    logo_url
                )
            `)
            .in(
                "id",
                playerIds
            );

        if (playersError) {
            throw playersError;
        }


        const playerRows =
            players || [];


        const playerMap = {};


        playerRows.forEach(
            function (player) {

                playerMap[
                    String(player.id)
                ] = player;
            }
        );


        // ========================================
        // COMBINE PLAYER + STATISTICS
        // ========================================

        const leaders =
            Object.values(
                playerStats
            )
                .map(function (statsItem) {

                    const player =
                        playerMap[
                            String(
                                statsItem.player_id
                            )
                        ];

                    if (!player) {
                        return null;
                    }

                    return {

                        ...statsItem,

                        id:
                            player.id,

                        full_name:
                            player.full_name ||
                            "Unknown Player",

                        photo_url:
                            player.photo_url ||
                            "",

                        team_id:
                            player.team_id,

                        team:
                            player.teams ||
                            null
                    };
                })
                .filter(function (player) {
                    return player !== null;
                });


        // ========================================
        // SORT LEADERS
        // ========================================

        const topScorers =
            [...leaders]
                .sort(function (a, b) {

                    if (
                        b.goals !==
                        a.goals
                    ) {
                        return (
                            b.goals -
                            a.goals
                        );
                    }

                    return (
                        b.appearances -
                        a.appearances
                    );
                });


        const topAssists =
            [...leaders]
                .sort(function (a, b) {

                    if (
                        b.assists !==
                        a.assists
                    ) {
                        return (
                            b.assists -
                            a.assists
                        );
                    }

                    return (
                        b.appearances -
                        a.appearances
                    );
                });


        const topAppearances =
            [...leaders]
                .sort(function (a, b) {

                    if (
                        b.appearances !==
                        a.appearances
                    ) {
                        return (
                            b.appearances -
                            a.appearances
                        );
                    }

                    return (
                        b.goals -
                        a.goals
                    );
                });


        const topYellowCards =
            [...leaders]
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

                    return (
                        b.appearances -
                        a.appearances
                    );
                });


        const topRedCards =
            [...leaders]
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

                    return (
                        b.appearances -
                        a.appearances
                    );
                });


        // ========================================
        // RENDER PLAYER LEADER
        // ========================================

        function renderLeader(
            player,
            value,
            label
        ) {

            const photo =
                player.photo_url
                    ? `
                        <img
                            src="${escapeHtml(
                                player.photo_url
                            )}"
                            alt="${escapeHtml(
                                player.full_name
                            )}"
                            style="
                                width:42px;
                                height:42px;
                                border-radius:50%;
                                object-fit:cover;
                                margin-right:10px;
                            "
                        >
                    `
                    : `
                        <div
                            style="
                                width:42px;
                                height:42px;
                                border-radius:50%;
                                margin-right:10px;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                background:#e8e8e8;
                                font-size:20px;
                            "
                        >
                            \u00E2\u0161\u00BD
                        </div>
                    `;


            const teamName =
                player.team &&
                player.team.name
                    ? player.team.name
                    : "";


            return `
                <div
                    class="leader-player"
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:10px;
                        padding:10px 0;
                        border-bottom:1px solid #eee;
                        cursor:pointer;
                    "
                    onclick="
                        window.location.href=
                        'player-profile.html?id=${encodeURIComponent(
                            player.id
                        )}'
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            min-width:0;
                            flex:1;
                        "
                    >

                        ${photo}

                        <div
                            style="
                                min-width:0;
                            "
                        >

                            <div
                                style="
                                    font-weight:700;
                                    white-space:nowrap;
                                    overflow:hidden;
                                    text-overflow:ellipsis;
                                "
                            >
                                ${escapeHtml(
                                    player.full_name
                                )}
                            </div>

                            ${
                                teamName
                                    ? `
                                        <div
                                            style="
                                                font-size:12px;
                                                color:#777;
                                                margin-top:2px;
                                            "
                                        >
                                            ${escapeHtml(
                                                teamName
                                            )}
                                        </div>
                                    `
                                    : ""
                            }

                        </div>

                    </div>


                    <div
                        style="
                            text-align:center;
                            min-width:48px;
                        "
                    >

                        <strong
                            style="
                                display:block;
                                font-size:20px;
                            "
                        >
                            ${value}
                        </strong>

                        <span
                            style="
                                font-size:10px;
                                color:#777;
                            "
                        >
                            ${label}
                        </span>

                    </div>

                </div>
            `;
        }


        // ========================================
        // RENDER TOP SCORERS
        // ========================================

        if (topScorersEl) {

            const scorers =
                topScorers
                    .filter(function (player) {
                        return (
                            player.goals > 0
                        );
                    })
                    .slice(0, 5);


            if (
                scorers.length === 0
            ) {

                topScorersEl.innerHTML = `
                    <div class="empty-message">
                        No goals recorded yet.
                    </div>
                `;

            }
            else {

                topScorersEl.innerHTML =
                    scorers
                        .map(
                            function (player) {
                                return renderLeader(
                                    player,
                                    player.goals,
                                    "Goals"
                                );
                            }
                        )
                        .join("");
            }
        }


        // ========================================
        // RENDER TOP ASSISTS
        // ========================================

        if (topAssistsEl) {

            const assists =
                topAssists
                    .filter(function (player) {
                        return (
                            player.assists > 0
                        );
                    })
                    .slice(0, 5);


            if (
                assists.length === 0
            ) {

                topAssistsEl.innerHTML = `
                    <div class="empty-message">
                        No assists recorded yet.
                    </div>
                `;

            }
            else {

                topAssistsEl.innerHTML =
                    assists
                        .map(
                            function (player) {
                                return renderLeader(
                                    player,
                                    player.assists,
                                    "Assists"
                                );
                            }
                        )
                        .join("");
            }
        }


        // ========================================
        // RENDER APPEARANCES
        // ========================================

        if (topAppearancesEl) {

            const appearances =
                topAppearances
                    .filter(function (player) {
                        return (
                            player.appearances > 0
                        );
                    })
                    .slice(0, 5);


            if (
                appearances.length === 0
            ) {

                topAppearancesEl.innerHTML = `
                    <div class="empty-message">
                        No appearances recorded yet.
                    </div>
                `;

            }
            else {

                topAppearancesEl.innerHTML =
                    appearances
                        .map(
                            function (player) {
                                return renderLeader(
                                    player,
                                    player.appearances,
                                    "Apps"
                                );
                            }
                        )
                        .join("");
            }
        }


        // ========================================
        // RENDER YELLOW CARDS
        // ========================================

        if (yellowCardsEl) {

            const yellowCards =
                topYellowCards
                    .filter(function (player) {
                        return (
                            player.yellow_cards > 0
                        );
                    })
                    .slice(0, 5);


            if (
                yellowCards.length === 0
            ) {

                yellowCardsEl.innerHTML = `
                    <div class="empty-message">
                        No yellow cards recorded yet.
                    </div>
                `;

            }
            else {

                yellowCardsEl.innerHTML =
                    yellowCards
                        .map(
                            function (player) {
                                return renderLeader(
                                    player,
                                    player.yellow_cards,
                                    "Yellow"
                                );
                            }
                        )
                        .join("");
            }
        }


        // ========================================
        // RENDER RED CARDS
        // ========================================

        if (redCardsEl) {

            const redCards =
                topRedCards
                    .filter(function (player) {
                        return (
                            player.red_cards > 0
                        );
                    })
                    .slice(0, 5);


            if (
                redCards.length === 0
            ) {

                redCardsEl.innerHTML = `
                    <div class="empty-message">
                        No red cards recorded yet.
                    </div>
                `;

            }
            else {

                redCardsEl.innerHTML =
                    redCards
                        .map(
                            function (player) {
                                return renderLeader(
                                    player,
                                    player.red_cards,
                                    "Red"
                                );
                            }
                        )
                        .join("");
            }
        }


    } catch (error) {

        console.error(
            "LOAD PLAYER LEADERS ERROR:",
            error
        );


        const errorMessage = `
            <div class="empty-message">
                Unable to load player statistics.
            </div>
        `;


        if (topScorersEl) {
            topScorersEl.innerHTML =
                errorMessage;
        }

        if (topAssistsEl) {
            topAssistsEl.innerHTML =
                errorMessage;
        }

        if (topAppearancesEl) {
            topAppearancesEl.innerHTML =
                errorMessage;
        }

        if (yellowCardsEl) {
            yellowCardsEl.innerHTML =
                errorMessage;
        }

        if (redCardsEl) {
            redCardsEl.innerHTML =
                errorMessage;
        }
    }
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
                    \u00F0\u0178\u203A\u00A1\u00EF\u00B8\u008F Team Logo

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
                        \u00F0\u0178\u201C\u00B7 Player Photo

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
                        // The RPC expects "full_name".
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
                                \u00E2\u0153\u2026 Registration submitted successfully!
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
                                \u00E2\u009D\u0152 Registration failed.
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

        // ========================================
        // MAIN COMPETITION = ACTIVE LEAGUE
        // ========================================

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

            loadPlayerLeaders(competition)
        ]);

    } catch (error) {

        console.error(
            "APPLICATION START ERROR:",
            error
        );
    }

});
