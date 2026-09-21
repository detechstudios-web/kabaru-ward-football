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
            return "\u{1F91D} Friendly";
        }

        if (type === "Cup") {
            return "\u{1F3C6} Cup";
        }

        if (type === "League") {
            return "\u26BD League";
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
                        \u{1F4C5}
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
                                \u26BD
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
                                \u26BD
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
                            \u{1F4CD} ${escapeHtml(
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
                    \u274C
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
                        \u{1F4CA}
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
                        \u{1F4CA}
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
                        \u{1F4CA}
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
                                ? " \u26BD Pen."
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
                            \u26BD
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
                            \u26BD
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
                                                \u26BD
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
                                                \u26BD
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
                                    \u{1F4CD}
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
                    \u{1F441}\uFE0F View Match Details
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
                    \u274C
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
                    seasonResults || [];
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

            // ========================================
            // BUILD FORM FROM LATEST COMPLETED MATCHES
            // ========================================

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

                    if (
                        table[homeId]
                            .form
                            .length < 5
                    ) {

                        if (
                            homeScore >
                            awayScore
                        ) {
                            table[homeId]
                                .form
                                .push("W");
                        }
                        else if (
                            homeScore <
                            awayScore
                        ) {
                            table[homeId]
                                .form
                                .push("L");
                        }
                        else {
                            table[homeId]
                                .form
                                .push("D");
                        }
                    }

                    if (
                        table[awayId]
                            .form
                            .length < 5
                    ) {

                        if (
                            awayScore >
                            homeScore
                        ) {
                            table[awayId]
                                .form
                                .push("W");
                        }
                        else if (
                            awayScore <
                            homeScore
                        ) {
                            table[awayId]
                                .form
                                .push("L");
                        }
                        else {
                            table[awayId]
                                .form
                                .push("D");
                        }
                    }
                }
            );
        }

        // ========================================
        // CONVERT TABLE TO ARRAY
        // ========================================

        const tableRows =
            Object.values(
                table
            );

        // ========================================
        // SORT LEAGUE TABLE
        // ========================================
        //
        // Order:
        //
        // 1. Points
        // 2. Goal Difference
        // 3. Goals For
        // 4. Team Name
        // ========================================

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

                return String(
                    a.name
                ).localeCompare(
                    String(
                        b.name
                    )
                );
            }
        );

        // ========================================
        // RENDER LEAGUE TABLE
        // ========================================

        if (
            tableRows.length === 0
        ) {

            leagueTableEl.innerHTML = `
                <tr>
                    <td
                        colspan="11"
                        class="empty-message"
                    >
                        No approved teams are
                        currently available.
                    </td>
                </tr>
            `;

            return;
        }

        leagueTableEl.innerHTML =
            tableRows
                .map(
                    function (
                        team,
                        index
                    ) {

                        const position =
                            index + 1;

                        const formHtml =
                            team.form.length >
                            0
                                ? team.form
                                    .map(
                                        function (
                                            item
                                        ) {

                                            let label =
                                                "";

                                            if (
                                                item ===
                                                "W"
                                            ) {
                                                label =
                                                    "Win";
                                            }
                                            else if (
                                                item ===
                                                "D"
                                            ) {
                                                label =
                                                    "Draw";
                                            }
                                            else if (
                                                item ===
                                                "L"
                                            ) {
                                                label =
                                                    "Loss";
                                            }

                                            return `
                                                <span
                                                    title="${label}"
                                                    style="
                                                        display:inline-flex;
                                                        align-items:center;
                                                        justify-content:center;
                                                        width:22px;
                                                        height:22px;
                                                        border-radius:50%;
                                                        margin-right:3px;
                                                        font-size:11px;
                                                        font-weight:800;
                                                        background:${
                                                            item ===
                                                            "W"
                                                                ? "#d4edda"
                                                                :
                                                            item ===
                                                            "D"
                                                                ? "#fff3cd"
                                                                :
                                                                "#f8d7da"
                                                        };
                                                        color:${
                                                            item ===
                                                            "W"
                                                                ? "#155724"
                                                                :
                                                            item ===
                                                            "D"
                                                                ? "#856404"
                                                                :
                                                                "#721c24"
                                                        };
                                                    "
                                                >
                                                    ${item}
                                                </span>
                                            `;
                                        }
                                    )
                                    .join("")
                                : `
                                    <span
                                        style="
                                            color:#aaa;
                                            font-size:12px;
                                        "
                                    >
                                        —
                                    </span>
                                `;

                        const logoHtml =
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
                                            margin-right:8px;
                                            vertical-align:middle;
                                        "
                                    >
                                `
                                : `
                                    <span
                                        style="
                                            display:inline-flex;
                                            width:32px;
                                            height:32px;
                                            align-items:center;
                                            justify-content:center;
                                            font-size:20px;
                                            margin-right:8px;
                                            vertical-align:middle;
                                        "
                                    >
                                        \u26BD
                                    </span>
                                `;

                        return `
                            <tr>
                                <td>
                                    ${position}
                                </td>

                                <td
                                    style="
                                        text-align:left;
                                    "
                                >
                                    <div
                                        style="
                                            display:flex;
                                            align-items:center;
                                        "
                                    >
                                        ${logoHtml}

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
                                    ${team.gd}
                                </td>

                                <td>
                                    <div>
                                        ${formHtml}
                                    </div>
                                </td>

                                <td
                                    style="
                                        font-weight:800;
                                    "
                                >
                                    ${team.points}
                                </td>
                            </tr>
                        `;
                    }
                )
                .join("");

    } catch (error) {

        console.error(
            "LOAD LEAGUE TABLE ERROR:",
            error
        );

        leagueTableEl.innerHTML = `
            <tr>
                <td
                    colspan="11"
                    class="empty-message"
                >
                    Unable to load league table.
                </td>
            </tr>
        `;
    }
}


    // ========================================
    // LOAD UPCOMING FIXTURES
    // ========================================

    async function loadFixtures(
        competition
    ) {

        if (!fixturesEl) {
            return;
        }

        fixturesEl.innerHTML = `
            <div class="loading">
                Loading fixtures...
            </div>
        `;

        try {

            // ========================================
            // LOAD FIXTURES
            // ========================================

            const {
                data: fixtures,
                error
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
                .eq(
                    "competition_id",
                    competition.id
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

            let fixtureRows =
                fixtures || [];

            // ========================================
            // ONLY UPCOMING / SCHEDULED FIXTURES
            // ========================================

            fixtureRows =
                fixtureRows.filter(
                    function (fixture) {

                        const status =
                            String(
                                fixture.status ||
                                ""
                            ).toLowerCase();

                        return (
                            status ===
                                "scheduled" ||
                            status ===
                                "upcoming" ||
                            status ===
                                "pending" ||
                            status ===
                                ""
                        );
                    }
                );

            // ========================================
            // NO FIXTURES
            // ========================================

            if (
                fixtureRows.length === 0
            ) {

                fixturesEl.innerHTML = `
                    <div class="empty-message">
                        <div
                            style="
                                font-size:40px;
                                margin-bottom:10px;
                            "
                        >
                            \u{1F4C5}
                        </div>

                        <h3>
                            No Upcoming Fixtures
                        </h3>

                        <p>
                            There are currently
                            no upcoming fixtures
                            for this competition.
                        </p>
                    </div>
                `;

                return;
            }

            // ========================================
            // RENDER FIXTURES
            // ========================================

            fixturesEl.innerHTML = "";

            fixtureRows.forEach(
                function (fixture) {

                    const homeTeam =
                        fixture.home_team ||
                        {};

                    const awayTeam =
                        fixture.away_team ||
                        {};

                    const matchDate =
                        formatDate(
                            fixture.match_date
                        );

                    const kickOff =
                        formatTime(
                            fixture.kick_off
                        );

                    const homeName =
                        getTeamName(
                            homeTeam
                        );

                    const awayName =
                        getTeamName(
                            awayTeam
                        );

                    const homeLogo =
                        homeTeam.logo_url
                            ? `
                                <img
                                    src="${escapeHtml(
                                        homeTeam.logo_url
                                    )}"
                                    alt="${escapeHtml(
                                        homeName
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
                                    \u26BD
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
                                        awayName
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
                                    \u26BD
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
                                margin-bottom:12px;
                            "
                        >

                            <div
                                style="
                                    font-size:13px;
                                    font-weight:700;
                                "
                            >
                                ${escapeHtml(
                                    matchDate
                                )}
                            </div>

                            <div
                                style="
                                    font-size:12px;
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
                                            \u{1F4CD}
                                            ${escapeHtml(
                                                fixture.venue
                                            )}
                                        </div>
                                    `
                                    : ""
                            }

                            ${
                                fixture.matchday !==
                                    null &&
                                fixture.matchday !==
                                    undefined &&
                                fixture.matchday !==
                                    ""
                                    ? `
                                        <div
                                            style="
                                                font-size:11px;
                                                color:#999;
                                                margin-top:3px;
                                            "
                                        >
                                            Matchday
                                            ${escapeHtml(
                                                fixture.matchday
                                            )}
                                        </div>
                                    `
                                    : ""
                            }

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
                                        homeName
                                    )}
                                </div>
                            </div>

                            <div
                                style="
                                    font-size:18px;
                                    font-weight:900;
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
                                        awayName
                                    )}
                                </div>
                            </div>

                        </div>
                    `;

                    fixturesEl.appendChild(
                        card
                    );
                }
            );

        } catch (error) {

            console.error(
                "LOAD FIXTURES ERROR:",
                error
            );

            fixturesEl.innerHTML = `
                <div class="empty-message">

                    <div
                        style="
                            font-size:40px;
                            margin-bottom:10px;
                        "
                    >
                        \u274C
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
    // LOAD TEAMS
    // ========================================

    async function loadTeams() {

        if (!teamsGridEl) {
            return;
        }

        teamsGridEl.innerHTML = `
            <div class="loading">
                Loading teams...
            </div>
        `;

        try {

            const {
                data: teams,
                error
            } = await supabaseClient
                .from("teams")
                .select(`
                    id,
                    name,
                    short_name,
                    logo_url,
                    registration_status,
                    coach_name,
                    captain_name,
                    vice_captain_name,
                    discipline_master_name
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

            if (error) {
                throw error;
            }

            const teamRows =
                teams || [];

            if (
                teamRows.length === 0
            ) {

                teamsGridEl.innerHTML = `
                    <div class="empty-message">
                        <div
                            style="
                                font-size:40px;
                                margin-bottom:10px;
                            "
                        >
                            \u{1F465}
                        </div>

                        <h3>
                            No Approved Teams
                        </h3>

                        <p>
                            No teams are currently
                            registered and approved.
                        </p>
                    </div>
                `;

                return;
            }

            teamsGridEl.innerHTML = "";

            teamRows.forEach(
                function (team) {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "team-card";

                    const teamName =
                        team.name ||
                        "Unknown Team";

                    const shortName =
                        team.short_name ||
                        teamName;

                    const logo =
                        team.logo_url
                            ? `
                                <img
                                    src="${escapeHtml(
                                        team.logo_url
                                    )}"
                                    alt="${escapeHtml(
                                        teamName
                                    )} logo"
                                    style="
                                        width:90px;
                                        height:90px;
                                        object-fit:contain;
                                    "
                                >
                            `
                            : `
                                <div
                                    style="
                                        width:90px;
                                        height:90px;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        font-size:48px;
                                    "
                                >
                                    \u26BD
                                </div>
                            `;

                    card.innerHTML = `
                        <div
                            style="
                                text-align:center;
                            "
                        >

                            <div
                                style="
                                    margin-bottom:12px;
                                "
                            >
                                ${logo}
                            </div>

                            <h3
                                style="
                                    margin:0;
                                "
                            >
                                ${escapeHtml(
                                    teamName
                                )}
                            </h3>

                            ${
                                shortName !==
                                teamName
                                    ? `
                                        <div
                                            style="
                                                font-size:12px;
                                                color:#777;
                                                margin-top:3px;
                                            "
                                        >
                                            ${escapeHtml(
                                                shortName
                                            )}
                                        </div>
                                    `
                                    : ""
                            }

                            <div
                                style="
                                    margin-top:12px;
                                    font-size:12px;
                                    color:#075b35;
                                    font-weight:700;
                                "
                            >
                                \u{1F6E1}\uFE0F
                                Officially Registered
                            </div>

                        </div>
                    `;

                    teamsGridEl.appendChild(
                        card
                    );
                }
            );

        } catch (error) {

            console.error(
                "LOAD TEAMS ERROR:",
                error
            );

            teamsGridEl.innerHTML = `
                <div class="empty-message">

                    <div
                        style="
                            font-size:40px;
                            margin-bottom:10px;
                        "
                    >
                        \u274C
                    </div>

                    <h3>
                        Unable to Load Teams
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
    // LOAD TEAM STATISTICS
    // ========================================

    async function loadTeamStatistics() {

        if (!teamStatisticsEl) {
            return;
        }

        teamStatisticsEl.innerHTML = `
            <div class="loading">
                Loading team statistics...
            </div>
        `;

        try {

            const {
                data: teams,
                error: teamsError
            } = await supabaseClient
                .from("teams")
                .select(`
                    id,
                    name,
                    short_name,
                    logo_url
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

            const teamRows =
                teams || [];

            if (
                teamRows.length === 0
            ) {

                teamStatisticsEl.innerHTML = `
                    <div class="empty-message">

                        <div
                            style="
                                font-size:40px;
                                margin-bottom:10px;
                            "
                        >
                            \u{1F4CA}
                        </div>

                        <h3>
                            No Team Statistics
                        </h3>

                        <p>
                            No approved teams
                            are currently available.
                        </p>

                    </div>
                `;

                return;
            }

            // ========================================
            // LOAD CURRENT SEASON COMPETITIONS
            // ========================================

            const currentSeason =
                new Date().getFullYear();

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
                .eq(
                    "season",
                    currentSeason
                );

            if (competitionsError) {
                throw competitionsError;
            }

            const competitionRows =
                competitions || [];

            const competitionIds =
                competitionRows
                    .map(function (
                        competition
                    ) {
                        return competition.id;
                    })
                    .filter(function (
                        id
                    ) {
                        return id !== null &&
                               id !== undefined;
                    });

            let fixtureRows = [];

            if (
                competitionIds.length > 0
            ) {

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
                        status
                    `)
                    .in(
                        "competition_id",
                        competitionIds
                    )
                    .eq(
                        "status",
                        "Completed"
                    );

                if (fixturesError) {
                    throw fixturesError;
                }

                fixtureRows =
                    fixtures || [];
            }

            const fixtureIds =
                fixtureRows
                    .map(function (
                        fixture
                    ) {
                        return fixture.id;
                    })
                    .filter(function (
                        id
                    ) {
                        return id !== null &&
                               id !== undefined;
                    });

            let resultRows = [];

            if (
                fixtureIds.length > 0
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
                        away_score
                    `)
                    .in(
                        "fixture_id",
                        fixtureIds
                    );

                if (resultsError) {
                    throw resultsError;
                }

                resultRows =
                    results || [];
            }

            const resultMap =
                {};

            resultRows.forEach(
                function (
                    result
                ) {
                    resultMap[
                        String(
                            result.fixture_id
                        )
                    ] = result;
                }
            );

            // ========================================
            // BUILD STATISTICS
            // ========================================

            const statistics =
                {};

            teamRows.forEach(
                function (
                    team
                ) {

                    statistics[
                        String(
                            team.id
                        )
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
                        goalsFor: 0,
                        goalsAgainst: 0,
                        cleanSheets: 0,
                        points: 0
                    };
                }
            );

            fixtureRows.forEach(
                function (
                    fixture
                ) {

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
                        !statistics[
                            homeId
                        ] ||
                        !statistics[
                            awayId
                        ]
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

                    statistics[
                        homeId
                    ].played += 1;

                    statistics[
                        awayId
                    ].played += 1;

                    statistics[
                        homeId
                    ].goalsFor +=
                        homeScore;

                    statistics[
                        homeId
                    ].goalsAgainst +=
                        awayScore;

                    statistics[
                        awayId
                    ].goalsFor +=
                        awayScore;

                    statistics[
                        awayId
                    ].goalsAgainst +=
                        homeScore;

                    if (
                        awayScore === 0
                    ) {
                        statistics[
                            homeId
                        ].cleanSheets += 1;
                    }

                    if (
                        homeScore === 0
                    ) {
                        statistics[
                            awayId
                        ].cleanSheets += 1;
                    }

                    if (
                        homeScore >
                        awayScore
                    ) {

                        statistics[
                            homeId
                        ].won += 1;

                        statistics[
                            awayId
                        ].lost += 1;

                        statistics[
                            homeId
                        ].points += 3;

                    }
                    else if (
                        homeScore <
                        awayScore
                    ) {

                        statistics[
                            awayId
                        ].won += 1;

                        statistics[
                            homeId
                        ].lost += 1;

                        statistics[
                            awayId
                        ].points += 3;

                    }
                    else {

                        statistics[
                            homeId
                        ].drawn += 1;

                        statistics[
                            awayId
                        ].drawn += 1;

                        statistics[
                            homeId
                        ].points += 1;

                        statistics[
                            awayId
                        ].points += 1;
                    }
                }
            );

            // ========================================
            // RENDER STATISTICS
            // ========================================

            teamStatisticsEl.innerHTML = "";

            teamRows.forEach(
                function (
                    team
                ) {

                    const stat =
                        statistics[
                            String(
                                team.id
                            )
                        ];

                    if (!stat) {
                        return;
                    }

                    const logo =
                        stat.logo_url
                            ? `
                                <img
                                    src="${escapeHtml(
                                        stat.logo_url
                                    )}"
                                    alt="${escapeHtml(
                                        stat.name
                                    )} logo"
                                    style="
                                        width:55px;
                                        height:55px;
                                        object-fit:contain;
                                    "
                                >
                            `
                            : `
                                <div
                                    style="
                                        width:55px;
                                        height:55px;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        font-size:32px;
                                    "
                                >
                                    \u26BD
                                </div>
                            `;

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "stat-card";

                    card.innerHTML = `
                        <div
                            style="
                                display:flex;
                                align-items:center;
                                gap:12px;
                                margin-bottom:15px;
                            "
                        >
                            ${logo}

                            <div>
                                <div
                                    style="
                                        font-size:17px;
                                        font-weight:800;
                                    "
                                >
                                    ${escapeHtml(
                                        stat.name
                                    )}
                                </div>

                                <div
                                    style="
                                        font-size:12px;
                                        color:#777;
                                    "
                                >
                                    ${escapeHtml(
                                        stat.short_name
                                    )}
                                </div>
                            </div>
                        </div>

                        <div
                            style="
                                display:grid;
                                grid-template-columns:
                                    repeat(2,1fr);
                                gap:8px;
                            "
                        >

                            <div>
                                <strong>
                                    ${stat.played}
                                </strong>
                                <span>
                                    Played
                                </span>
                            </div>

                            <div>
                                <strong>
                                    ${stat.points}
                                </strong>
                                <span>
                                    Points
                                </span>
                            </div>

                            <div>
                                <strong>
                                    ${stat.won}
                                </strong>
                                <span>
                                    Wins
                                </span>
                            </div>

                            <div>
                                <strong>
                                    ${stat.drawn}
                                </strong>
                                <span>
                                    Draws
                                </span>
                            </div>

                            <div>
                                <strong>
                                    ${stat.lost}
                                </strong>
                                <span>
                                    Losses
                                </span>
                            </div>

                            <div>
                                <strong>
                                    ${stat.goalsFor}
                                </strong>
                                <span>
                                    Goals For
                                </span>
                            </div>

                            <div>
                                <strong>
                                    ${stat.goalsAgainst}
                                </strong>
                                <span>
                                    Goals Against
                                </span>
                            </div>

                            <div>
                                <strong>
                                    ${stat.cleanSheets}
                                </strong>
                                <span>
                                    Clean Sheets
                                </span>
                            </div>

                        </div>
                    `;

                    teamStatisticsEl.appendChild(
                        card
                    );
                }
            );

        } catch (error) {

            console.error(
                "LOAD TEAM STATISTICS ERROR:",
                error
            );

            teamStatisticsEl.innerHTML = `
                <div class="empty-message">

                    <div
                        style="
                            font-size:40px;
                            margin-bottom:10px;
                        "
                    >
                        \u274C
                    </div>

                    <h3>
                        Unable to Load Statistics
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
    // LOAD TOP SCORERS
    // ========================================

    async function loadTopScorers() {

        if (!topScorersEl) {
            return;
        }

        topScorersEl.innerHTML = `
            <div class="loading">
                Loading top scorers...
            </div>
        `;

        try {

            // ========================================
            // LOAD CURRENT SEASON COMPETITIONS
            // ========================================

            const season =
                new Date().getFullYear();

            const {
                data: competitions,
                error: competitionsError
            } = await supabaseClient
                .from("competitions")
                .select(`
                    id,
                    name,
                    season
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

            const competitionIds =
                competitionRows
                    .map(function (
                        item
                    ) {
                        return item.id;
                    })
                    .filter(function (
                        id
                    ) {
                        return id !== null &&
                               id !== undefined;
                    });

            if (
                competitionIds.length === 0
            ) {

                topScorersEl.innerHTML = `
                    <div class="empty-message">

                        <div
                            style="
                                font-size:40px;
                                margin-bottom:10px;
                            "
                        >
                            \u26BD
                        </div>

                        <h3>
                            No Scoring Data
                        </h3>

                        <p>
                            No current-season
                            competitions are
                            available.
                        </p>

                    </div>
                `;

                return;
            }

            // ========================================
            // LOAD COMPLETED FIXTURES
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
                )
                .eq(
                    "status",
                    "Completed"
                );

            if (fixturesError) {
                throw fixturesError;
            }

            const fixtureRows =
                fixtures || [];

            const fixtureIds =
                fixtureRows
                    .map(function (
                        fixture
                    ) {
                        return fixture.id;
                    })
                    .filter(function (
                        id
                    ) {
                        return id !== null &&
                               id !== undefined;
                    });

            if (
                fixtureIds.length === 0
            ) {

                topScorersEl.innerHTML = `
                    <div class="empty-message">

                        <div
                            style="
                                font-size:40px;
                                margin-bottom:10px;
                            "
                        >
                            \u26BD
                        </div>

                        <h3>
                            No Goals Yet
                        </h3>

                        <p>
                            No completed matches
                            are currently available.
                        </p>

                    </div>
                `;

                return;
            }

            // ========================================
            // LOAD GOAL SCORERS
            // ========================================

            const {
                data: goals,
                error: goalsError
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
                        team_id,
                        teams:team_id (
                            id,
                            name,
                            short_name,
                            logo_url
                        )
                    )
                `)
                .in(
                    "fixture_id",
                    fixtureIds
                )
                .order(
                    "minute",
                    {
                        ascending: true
                    }
                );

            if (goalsError) {
                throw goalsError;
            }

            const goalRows =
                goals || [];

            if (
                goalRows.length === 0
            ) {

                topScorersEl.innerHTML = `
                    <div class="empty-message">

                        <div
                            style="
                                font-size:40px;
                                margin-bottom:10px;
                            "
                        >
                            \u26BD
                        </div>

                        <h3>
                            No Goals Yet
                        </h3>

                        <p>
                            No goals have been
                            recorded in completed
                            matches.
                        </p>

                    </div>
                `;

                return;
            }

            // ========================================
            // GROUP GOALS BY PLAYER
            // ========================================

            const scorerMap =
                {};

            goalRows.forEach(
                function (
                    goal
                ) {

                    const player =
                        goal.players ||
                        {};

                    const playerId =
                        String(
                            goal.player_id
                        );

                    if (
                        !playerId ||
                        playerId ===
                            "undefined" ||
                        playerId ===
                            "null"
                    ) {
                        return;
                    }

                    if (
                        !scorerMap[
                            playerId
                        ]
                    ) {

                        scorerMap[
                            playerId
                        ] = {
                            player_id:
                                goal.player_id,
                            name:
                                player.full_name ||
                                "Unknown Player",
                            team:
                                player.teams ||
                                {},
                            goals: 0,
                            penalties: 0
                        };
                    }

                    scorerMap[
                        playerId
                    ].goals += 1;

                    if (
                        goal.is_penalty
                    ) {
                        scorerMap[
                            playerId
                        ].penalties += 1;
                    }
                }
            );

            const scorerRows =
                Object.values(
                    scorerMap
                );

            scorerRows.sort(
                function (
                    a,
                    b
                ) {

                    if (
                        b.goals !==
                        a.goals
                    ) {
                        return (
                            b.goals -
                            a.goals
                        );
                    }

                    return String(
                        a.name
                    ).localeCompare(
                        String(
                            b.name
                        )
                    );
                }
            );

            const topRows =
                scorerRows.slice(
                    0,
                    10
                );

            // ========================================
            // RENDER TOP SCORERS
            // ========================================

            topScorersEl.innerHTML = "";

            topRows.forEach(
                function (
                    scorer,
                    index
                ) {

                    const team =
                        scorer.team ||
                        {};

                    const logo =
                        team.logo_url
                            ? `
                                <img
                                    src="${escapeHtml(
                                        team.logo_url
                                    )}"
                                    alt="${escapeHtml(
                                        team.name ||
                                        "Team"
                                    )} logo"
                                    style="
                                        width:45px;
                                        height:45px;
                                        object-fit:contain;
                                    "
                                >
                            `
                            : `
                                <div
                                    style="
                                        width:45px;
                                        height:45px;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        font-size:26px;
                                    "
                                >
                                    \u26BD
                                </div>
                            `;

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "scorer-card";

                    card.innerHTML = `
                        <div
                            style="
                                display:flex;
                                align-items:center;
                                gap:12px;
                            "
                        >

                            <div
                                style="
                                    width:30px;
                                    height:30px;
                                    border-radius:50%;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    background:#075b35;
                                    color:#fff;
                                    font-weight:800;
                                    font-size:13px;
                                "
                            >
                                ${index + 1}
                            </div>

                            ${logo}

                            <div
                                style="
                                    flex:1;
                                "
                            >
                                <div
                                    style="
                                        font-weight:800;
                                    "
                                >
                                    ${escapeHtml(
                                        scorer.name
                                    )}
                                </div>

                                <div
                                    style="
                                        font-size:12px;
                                        color:#777;
                                        margin-top:2px;
                                    "
                                >
                                    ${escapeHtml(
                                        team.name ||
                                        "Unknown Team"
                                    )}
                                </div>
                            </div>

                            <div
                                style="
                                    text-align:center;
                                "
                            >
                                <div
                                    style="
                                        font-size:22px;
                                        font-weight:900;
                                        color:#075b35;
                                    "
                                >
                                    ${scorer.goals}
                                </div>

                                <div
                                    style="
                                        font-size:10px;
                                        color:#777;
                                    "
                                >
                                    Goal${
                                        scorer.goals === 1
                                            ? ""
                                            : "s"
                                    }
                                </div>
                            </div>

                        </div>
                    `;

                    topScorersEl.appendChild(
                        card
                    );
                }
            );

        } catch (error) {

            console.error(
                "LOAD TOP SCORERS ERROR:",
                error
            );

            topScorersEl.innerHTML = `
                <div class="empty-message">

                    <div
                        style="
                            font-size:40px;
                            margin-bottom:10px;
                        "
                    >
                        \u274C
                    </div>

                    <h3>
                        Unable to Load Top Scorers
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
    // LOAD PLAYER STATISTICS
    // ========================================

    async function loadPlayerStatistics() {

        if (!playerStatisticsEl) {
            return;
        }

        playerStatisticsEl.innerHTML = `
            <div class="loading">
                Loading player statistics...
            </div>
        `;

        try {

            // ========================================
            // LOAD APPROVED TEAMS
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
                    logo_url
                `)
                .eq(
                    "registration_status",
                    "Approved"
                );

            if (teamsError) {
                throw teamsError;
            }

            const teamRows =
                teams || [];

            const teamMap =
                {};

            teamRows.forEach(
                function (
                    team
                ) {
                    teamMap[
                        String(
                            team.id
                        )
                    ] = team;
                }
            );

            // ========================================
            // LOAD PLAYERS
            // ========================================

            const {
                data: players,
                error: playersError
            } = await supabaseClient
                .from("players")
                .select(`
                    id,
                    full_name,
                    team_id,
                    jersey_number,
                    position,
                    player_photo_url
                `)
                .order(
                    "full_name",
                    {
                        ascending: true
                    }
                );

            if (playersError) {
                throw playersError;
            }

            const playerRows =
                players || [];

            if (
                playerRows.length === 0
            ) {

                playerStatisticsEl.innerHTML = `
                    <div class="empty-message">

                        <div
                            style="
                                font-size:40px;
                                margin-bottom:10px;
                            "
                        >
                            \u{1F465}
                        </div>

                        <h3>
                            No Players Available
                        </h3>

                        <p>
                            No player records
                            are currently
                            available.
                        </p>

                    </div>
                `;

                return;
            }

            // ========================================
            // LOAD CURRENT-SEASON COMPETITIONS
            // ========================================

            const season =
                new Date().getFullYear();

            const {
                data: competitions,
                error: competitionsError
            } = await supabaseClient
                .from("competitions")
                .select(`
                    id,
                    season
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

            const competitionIds =
                competitionRows
                    .map(function (
                        competition
                    ) {
                        return competition.id;
                    })
                    .filter(function (
                        id
                    ) {
                        return id !== null &&
                               id !== undefined;
                    });

            let fixtureRows = [];

            if (
                competitionIds.length > 0
            ) {

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
                        status
                    `)
                    .in(
                        "competition_id",
                        competitionIds
                    )
                    .eq(
                        "status",
                        "Completed"
                    );

                if (fixturesError) {
                    throw fixturesError;
                }

                fixtureRows =
                    fixtures || [];
            }

            const fixtureIds =
                fixtureRows
                    .map(function (
                        fixture
                    ) {
                        return fixture.id;
                    })
                    .filter(function (
                        id
                    ) {
                        return id !== null &&
                               id !== undefined;
                    });

            // ========================================
            // LOAD APPEARANCES
            // ========================================

            let appearanceRows = [];

            if (
                fixtureIds.length > 0
            ) {

                const {
                    data: appearances,
                    error: appearancesError
                } = await supabaseClient
                    .from("player_appearances")
                    .select(`
                        id,
                        fixture_id,
                        player_id,
                        started,
                        minutes_played
                    `)
                    .in(
                        "fixture_id",
                        fixtureIds
                    );

                if (
                    appearancesError
                ) {
                    console.warn(
                        "Appearance load error:",
                        appearancesError
                    );
                } else {
                    appearanceRows =
                        appearances ||
                        [];
                }
            }

            // ========================================
            // LOAD GOALS
            // ========================================

            let goalRows = [];

            if (
                fixtureIds.length > 0
            ) {

                const {
                    data: goals,
                    error: goalsError
                } = await supabaseClient
                    .from("goal_scorers")
                    .select(`
                        id,
                        fixture_id,
                        player_id,
                        is_penalty
                    `)
                    .in(
                        "fixture_id",
                        fixtureIds
                    );

                if (goalsError) {
                    console.warn(
                        "Goal load error:",
                        goalsError
                    );
                } else {
                    goalRows =
                        goals || [];
                }
            }

            // ========================================
            // LOAD CARDS
            // ========================================

            let cardRows = [];

            if (
                fixtureIds.length > 0
            ) {

                const {
                    data: cards,
                    error: cardsError
                } = await supabaseClient
                    .from("player_cards")
                    .select(`
                        id,
                        fixture_id,
                        player_id,
                        card_type
                    `)
                    .in(
                        "fixture_id",
                        fixtureIds
                    );

                if (cardsError) {
                    console.warn(
                        "Card load error:",
                        cardsError
                    );
                } else {
                    cardRows =
                        cards || [];
                }
            }

            // ========================================
            // BUILD PLAYER STATISTICS
            // ========================================

            const statsMap =
                {};

            playerRows.forEach(
                function (
                    player
                ) {

                    const team =
                        teamMap[
                            String(
                                player.team_id
                            )
                        ] || {};

                    statsMap[
                        String(
                            player.id
                        )
                    ] = {
                        id: player.id,
                        name:
                            player.full_name ||
                            "Unknown Player",
                        team_id:
                            player.team_id,
                        team_name:
                            team.name ||
                            "Unknown Team",
                        team_logo:
                            team.logo_url ||
                            "",
                        jersey_number:
                            player.jersey_number,
                        position:
                            player.position ||
                            "",
                        photo:
                            player.player_photo_url ||
                            "",
                        appearances: 0,
                        starts: 0,
                        minutes: 0,
                        goals: 0,
                        assists: 0,
                        yellow: 0,
                        red: 0
                    };
                }
            );

            appearanceRows.forEach(
                function (
                    appearance
                ) {

                    const player =
                        statsMap[
                            String(
                                appearance.player_id
                            )
                        ];

                    if (!player) {
                        return;
                    }

                    player.appearances +=
                        1;

                    if (
                        appearance.started
                    ) {
                        player.starts +=
                            1;
                    }

                    const minutes =
                        Number(
                            appearance.minutes_played
                        );

                    if (
                        Number.isFinite(
                            minutes
                        )
                    ) {
                        player.minutes +=
                            minutes;
                    }
                }
            );

            goalRows.forEach(
                function (
                    goal
                ) {

                    const player =
                        statsMap[
                            String(
                                goal.player_id
                            )
                        ];

                    if (!player) {
                        return;
                    }

                    player.goals +=
                        1;
                }
            );

            cardRows.forEach(
                function (
                    card
                ) {

                    const player =
                        statsMap[
                            String(
                                card.player_id
                            )
                        ];

                    if (!player) {
                        return;
                    }

                    const cardType =
                        String(
                            card.card_type ||
                            ""
                        ).toLowerCase();

                    if (
                        cardType ===
                            "yellow"
                    ) {
                        player.yellow +=
                            1;
                    }
                    else if (
                        cardType ===
                            "red"
                    ) {
                        player.red +=
                            1;
                    }
                }
            );

            const statsRows =
                Object.values(
                    statsMap
                );

            // ========================================
            // SORT PLAYERS
            // ========================================

            statsRows.sort(
                function (
                    a,
                    b
                ) {

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
                        b.appearances !==
                        a.appearances
                    ) {
                        return (
                            b.appearances -
                            a.appearances
                        );
                    }

                    return String(
                        a.name
                    ).localeCompare(
                        String(
                            b.name
                        )
                    );
                }
            );

            // ========================================
            // RENDER PLAYER STATISTICS
            // ========================================

            playerStatisticsEl.innerHTML =
                "";

            statsRows.forEach(
                function (
                    player
                ) {

                    const photo =
                        player.photo
                            ? `
                                <img
                                    src="${escapeHtml(
                                        player.photo
                                    )}"
                                    alt="${escapeHtml(
                                        player.name
                                    )}"
                                    style="
                                        width:60px;
                                        height:60px;
                                        border-radius:50%;
                                        object-fit:cover;
                                    "
                                >
                            `
                            : `
                                <div
                                    style="
                                        width:60px;
                                        height:60px;
                                        border-radius:50%;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        background:#f1f1f1;
                                        font-size:28px;
                                    "
                                >
                                    \u{1F464}
                                </div>
                            `;

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "player-stat-card";

                    card.innerHTML = `
                        <div
                            style="
                                display:flex;
                                align-items:center;
                                gap:12px;
                            "
                        >

                            ${photo}

                            <div
                                style="
                                    flex:1;
                                "
                            >
                                <div
                                    style="
                                        font-weight:800;
                                        font-size:15px;
                                    "
                                >
                                    ${escapeHtml(
                                        player.name
                                    )}
                                </div>

                                <div
                                    style="
                                        font-size:12px;
                                        color:#777;
                                        margin-top:2px;
                                    "
                                >
                                    ${escapeHtml(
                                        player.team_name
                                    )}
                                </div>

                                ${
                                    player.position
                                        ? `
                                            <div
                                                style="
                                                    font-size:11px;
                                                    color:#999;
                                                    margin-top:2px;
                                                "
                                            >
                                                ${escapeHtml(
                                                    player.position
                                                )}
                                            </div>
                                        `
                                        : ""
                                }
                            </div>

                            <div
                                style="
                                    text-align:center;
                                "
                            >
                                <div
                                    style="
                                        font-size:20px;
                                        font-weight:900;
                                        color:#075b35;
                                    "
                                >
                                    ${player.goals}
                                </div>

                                <div
                                    style="
                                        font-size:10px;
                                        color:#777;
                                    "
                                >
                                    Goals
                                </div>
                            </div>

                        </div>

                        <div
                            style="
                                display:grid;
                                grid-template-columns:
                                    repeat(4,1fr);
                                gap:6px;
                                margin-top:12px;
                            "
                        >

                            <div>
                                <strong>
                                    ${player.appearances}
                                </strong>
                                <span>
                                    Apps
                                </span>
                            </div>

                            <div>
                                <strong>
                                    ${player.starts}
                                </strong>
                                <span>
                                    Starts
                                </span>
                            </div>

                            <div>
                                <strong>
                                    ${player.yellow}
                                </strong>
                                <span>
                                    Yellow
                                </span>
                            </div>

                            <div>
                                <strong>
                                    ${player.red}
                                </strong>
                                <span>
                                    Red
                                </span>
                            </div>

                        </div>
                    `;

                    playerStatisticsEl
                        .appendChild(
                            card
                        );
                }
            );

        } catch (error) {

            console.error(
                "LOAD PLAYER STATISTICS ERROR:",
                error
            );

            playerStatisticsEl.innerHTML = `
                <div class="empty-message">

                    <div
                        style="
                            font-size:40px;
                            margin-bottom:10px;
                        "
                    >
                        \u274C
                    </div>

                    <h3>
                        Unable to Load Player Statistics
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
    // LOAD COMPETITION INFORMATION
    // ========================================

    async function loadCompetitionInformation() {

        if (!competitionInfoEl) {
            return;
        }

        competitionInfoEl.innerHTML = `
            <div class="loading">
                Loading competition information...
            </div>
        `;

        try {

            const {
                data: competitions,
                error
            } = await supabaseClient
                .from("competitions")
                .select(`
                    id,
                    name,
                    description,
                    competition_type,
                    season,
                    status,
                    start_date,
                    end_date,
                    created_at
                `)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

            if (error) {
                throw error;
            }

            const rows =
                competitions || [];

            if (
                rows.length === 0
            ) {

                competitionInfoEl.innerHTML = `
                    <div class="empty-message">

                        <div
                            style="
                                font-size:40px;
                                margin-bottom:10px;
                            "
                        >
                            \u{1F3C6}
                        </div>

                        <h3>
                            No Competition Available
                        </h3>

                        <p>
                            Competition information
                            has not yet been added.
                        </p>

                    </div>
                `;

                return;
            }

            const competition =
                rows.find(
                    function (
                        item
                    ) {

                        return String(
                            item.status ||
                            ""
                        ).toLowerCase() ===
                            "active";
                    }
                ) ||
                rows[0];

            const type =
                getCompetitionType(
                    competition
                );

            const label =
                getCompetitionLabel(
                    competition
                );

            competitionInfoEl.innerHTML = `
                <div
                    class="competition-info-card"
                >

                    <div
                        style="
                            text-align:center;
                            margin-bottom:15px;
                        "
                    >
                        <div
                            style="
                                display:inline-block;
                                font-size:36px;
                                margin-bottom:8px;
                            "
                        >
                            \u{1F3C6}
                        </div>

                        <h3
                            style="
                                margin:0;
                            "
                        >
                            ${escapeHtml(
                                label
                            )}
                        </h3>

                        ${
                            type
                                ? `
                                    <div
                                        style="
                                            margin-top:4px;
                                            font-size:12px;
                                            color:#777;
                                        "
                                    >
                                        ${escapeHtml(
                                            type
                                        )}
                                    </div>
                                `
                                : ""
                        }
                    </div>

                    ${
                        competition.description
                            ? `
                                <p
                                    style="
                                        line-height:1.6;
                                        color:#555;
                                    "
                                >
                                    ${escapeHtml(
                                        competition.description
                                    )}
                                </p>
                            `
                            : ""
                    }

                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(2,1fr);
                            gap:10px;
                            margin-top:15px;
                        "
                    >

                        <div>
                            <strong>
                                Season
                            </strong>
                            <span>
                                ${escapeHtml(
                                    competition.season
                                )}
                            </span>
                        </div>

                        <div>
                            <strong>
                                Status
                            </strong>
                            <span>
                                ${escapeHtml(
                                    competition.status ||
                                    "Active"
                                )}
                            </span>
                        </div>

                        ${
                            competition.start_date
                                ? `
                                    <div>
                                        <strong>
                                            Start Date
                                        </strong>
                                        <span>
                                            ${escapeHtml(
                                                formatDate(
                                                    competition.start_date
                                                )
                                            )}
                                        </span>
                                    </div>
                                `
                                : ""
                        }

                        ${
                            competition.end_date
                                ? `
                                    <div>
                                        <strong>
                                            End Date
                                        </strong>
                                        <span>
                                            ${escapeHtml(
                                                formatDate(
                                                    competition.end_date
                                                )
                                            )}
                                        </span>
                                    </div>
                                `
                                : ""
                        }

                    </div>

                </div>
            `;

        } catch (error) {

            console.error(
                "LOAD COMPETITION INFORMATION ERROR:",
                error
            );

            competitionInfoEl.innerHTML = `
                <div class="empty-message">

                    <div
                        style="
                            font-size:40px;
                            margin-bottom:10px;
                        "
                    >
                        \u274C
                    </div>

                    <h3>
                        Unable to Load Competition
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
    // LOAD RECENT ACTIVITY
    // ========================================

    async function loadRecentActivity() {

        if (!recentActivityEl) {
            return;
        }

        recentActivityEl.innerHTML = `
            <div class="loading">
                Loading recent activity...
            </div>
        `;

        try {

            const {
                data: fixtures,
                error
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
                )
                .limit(
                    5
                );

            if (error) {
                throw error;
            }

            const fixtureRows =
                fixtures || [];

            if (
                fixtureRows.length === 0
            ) {

                recentActivityEl.innerHTML = `
                    <div class="empty-message">

                        <div
                            style="
                                font-size:40px;
                                margin-bottom:10px;
                            "
                        >
                            \u{1F4C5}
                        </div>

                        <h3>
                            No Recent Results
                        </h3>

                        <p>
                            Completed matches
                            will appear here.
                        </p>

                    </div>
                `;

                return;
            }

            const fixtureIds =
                fixtureRows
                    .map(function (
                        fixture
                    ) {
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
                    away_score
                `)
                .in(
                    "fixture_id",
                    fixtureIds
                );

            if (resultsError) {
                throw resultsError;
            }

            const resultMap =
                {};

            (
                results || []
            ).forEach(
                function (
                    result
                ) {

                    resultMap[
                        String(
                            result.fixture_id
                        )
                    ] = result;
                }
            );

            recentActivityEl.innerHTML =
                "";

            fixtureRows.forEach(
                function (
                    fixture
                ) {

                    const result =
                        resultMap[
                            String(
                                fixture.id
                            )
                        ];

                    if (!result) {
                        return;
                    }

                    const homeTeam =
                        fixture.home_team ||
                        {};

                    const awayTeam =
                        fixture.away_team ||
                        {};

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "recent-result-card";

                    card.innerHTML = `
                        <div
                            style="
                                font-size:12px;
                                color:#777;
                                margin-bottom:8px;
                            "
                        >
                            ${escapeHtml(
                                formatDate(
                                    fixture.match_date
                                )
                            )}
                        </div>

                        <div
                            style="
                                display:grid;
                                grid-template-columns:
                                    1fr auto 1fr;
                                align-items:center;
                                gap:10px;
                            "
                        >

                            <div
                                style="
                                    text-align:center;
                                "
                            >
                                <div
                                    style="
                                        font-weight:700;
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
                                    font-size:20px;
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
                                    text-align:center;
                                "
                            >
                                <div
                                    style="
                                        font-weight:700;
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

                    recentActivityEl
                        .appendChild(
                            card
                        );
                }
            );

        } catch (error) {

            console.error(
                "LOAD RECENT ACTIVITY ERROR:",
                error
            );

            recentActivityEl.innerHTML = `
                <div class="empty-message">

                    <div
                        style="
                            font-size:40px;
                            margin-bottom:10px;
                        "
                    >
                        \u274C
                    </div>

                    <h3>
                        Unable to Load Recent Activity
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
    // INITIAL PAGE LOAD
    // ========================================

    try {

        // ========================================
        // LOAD ACTIVE COMPETITION
        // ========================================

        const {
            data: competitions,
            error
        } = await supabaseClient
            .from("competitions")
            .select(`
                id,
                name,
                description,
                competition_type,
                season,
                status,
                start_date,
                end_date,
                created_at
            `)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

        if (error) {
            throw error;
        }

        const competitionRows =
            competitions || [];

        let activeCompetition =
            competitionRows.find(
                function (
                    competition
                ) {

                    return String(
                        competition.status ||
                        ""
                    ).toLowerCase() ===
                        "active";
                }
            );

        if (!activeCompetition) {
            activeCompetition =
                competitionRows[0] ||
                null;
        }

        if (
            activeCompetition
        ) {

            if (
                competitionNameEl
            ) {
                competitionNameEl.textContent =
                    getCompetitionLabel(
                        activeCompetition
                    );
            }

            if (
                competitionSeasonEl
            ) {
                competitionSeasonEl.textContent =
                    activeCompetition.season ||
                    "";
            }

            await loadFixtures(
                activeCompetition
            );

            await loadLeagueTable(
                activeCompetition
            );

        }
        else {

            if (
                competitionNameEl
            ) {
                competitionNameEl.textContent =
                    "No Competition";
            }

            if (
                competitionSeasonEl
            ) {
                competitionSeasonEl.textContent =
                    "";
            }

            if (
                fixturesEl
            ) {
                fixturesEl.innerHTML = `
                    <div class="empty-message">

                        <div
                            style="
                                font-size:40px;
                                margin-bottom:10px;
                            "
                        >
                            \u{1F3C6}
                        </div>

                        <h3>
                            No Competition Available
                        </h3>

                        <p>
                            Competition information
                            will appear here once
                            the administrator creates
                            a competition.
                        </p>

                    </div>
                `;
            }

            if (
                leagueTableEl
            ) {
                leagueTableEl.innerHTML = `
                    <tr>
                        <td
                            colspan="11"
                            class="empty-message"
                        >
                            No active league is
                            currently available.
                        </td>
                    </tr>
                `;
            }
        }

        // ========================================
        // LOAD OTHER SECTIONS
        // ========================================

        await Promise.allSettled([
            loadTeams(),
            loadTopScorers(),
            loadPlayerStatistics(),
            loadTeamStatistics(),
            loadCompetitionInformation(),
            loadRecentActivity()
        ]);

    } catch (error) {

        console.error(
            "INITIAL PAGE LOAD ERROR:",
            error
        );

        if (
            competitionNameEl
        ) {
            competitionNameEl.textContent =
                "Unable to Load";
        }

        if (
            fixturesEl
        ) {
            fixturesEl.innerHTML = `
                <div class="empty-message">

                    <div
                        style="
                            font-size:40px;
                            margin-bottom:10px;
                        "
                    >
                        \u274C
                    </div>

                    <h3>
                        Unable to Load Website Data
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

});
