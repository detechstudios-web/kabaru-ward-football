// ========================================
// KABARU WARD FOOTBALL
// MAIN WEBSITE APP
// ========================================

document.addEventListener("DOMContentLoaded", async function () {
let currentMainCompetition = null;
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
    const playerCompetitionFilter =
    document.getElementById("playerCompetitionFilter");
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
    // They are sorted newest first.
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
            // GET CURRENT SEASON
            // ========================================

            const season =
                competition &&
                competition.season !== undefined &&
                competition.season !== null
                    ? competition.season
                    : new Date().getFullYear();

            // ========================================
            // LOAD ALL COMPETITIONS
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
                .eq(
                    "season",
                    season
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

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
                            No Results Yet
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

            const completedFixtures =
                (fixtures || []).filter(
                    function (fixture) {
                        return isCompletedStatus(
                            fixture.status
                        );
                    }
                );

// ========================================
// LOAD RESULTS
// ========================================

const fixtureIds =
    completedFixtures
        .map(function (fixture) {
            return fixture.id;
        })
        .filter(function (id) {
            return id !== null &&
                   id !== undefined;
        });

let resultRows = [];

if (fixtureIds.length > 0) {

    const {
        data: results,
        error: resultsError
    } = await supabaseClient
        .from("results")
        .select("*")
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
            // KEEP ONLY FIXTURES WITH RESULTS
            // ========================================

            const validResults =
                completedFixtures.filter(
                    function (fixture) {
                        return !!resultMap[
                            String(fixture.id)
                        ];
                    }
                );

            // ========================================
            // NO COMPLETED RESULTS
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
                            No Results Yet
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
            // CLEAR RESULTS CONTAINER
            // ========================================

            resultsEl.innerHTML = "";

            // ========================================
            // RENDER EACH RESULT
            // ========================================

            for (
                const result of validResults
            ) {

                const homeTeam =
                    result.home_team ||
                    {};

                const awayTeam =
                    result.away_team ||
                    {};

                const matchResult =
                    resultMap[
                        String(result.id)
                    ] || {};

                const fixtureCompetition =
                    competitionMap[
                        String(
                            result.competition_id
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

                const homeScore =
                    matchResult.home_score !== null &&
                    matchResult.home_score !== undefined
                        ? matchResult.home_score
                        : "-";

                const awayScore =
                    matchResult.away_score !== null &&
                    matchResult.away_score !== undefined
                        ? matchResult.away_score
                        : "-";

                const matchDate =
                    formatDate(
                        result.match_date
                    );

                const kickOff =
                    formatTime(
                        result.kick_off
                    );

                const venue =
                    result.venue ||
                    "Venue TBC";

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

                const resultCard =
                    document.createElement(
                        "div"
                    );

                resultCard.className =
                    "result-card";
                resultCard.style.cursor = "pointer";

resultCard.addEventListener(
    "click",
    function () {
        window.location.href =
            "match-details.html?id=" +
            encodeURIComponent(
                matchResult.id
            );
    }
);

                resultCard.innerHTML = `
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
                                font-weight:900;
                                font-size:26px;
                                color:#075b35;
                                white-space:nowrap;
                            "
                        >
                            ${escapeHtml(
                                homeScore
                            )}
                            -
                            ${escapeHtml(
                                awayScore
                            )}
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

                resultsEl.appendChild(
                    resultCard
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

    async function loadLeagueTable(
        competition
    ) {

        if (!leagueTableEl) {
            return;
        }

        leagueTableEl.innerHTML = `
            <tr>
                <td
                    colspan="11"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >
                    Loading league table...
                </td>
            </tr>
        `;

        try {

            // ========================================
            // GET SEASON
            // ========================================

            const season =
                competition &&
                competition.season !== undefined &&
                competition.season !== null
                    ? competition.season
                    : new Date().getFullYear();

            // ========================================
            // LOAD ACTIVE LEAGUE
            // ========================================

            const {
                data: leagueCompetition,
                error: competitionError
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
                    "competition_type",
                    "League"
                )
                .eq(
                    "season",
                    season
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(1)
                .maybeSingle();

            if (competitionError) {
                throw competitionError;
            }

            if (!leagueCompetition) {

                leagueTableEl.innerHTML = `
                    <tr>
                        <td
                            colspan="11"
                            style="
                                text-align:center;
                                padding:30px;
                            "
                        >
                            No league competition available.
                        </td>
                    </tr>
                `;

                return;
            }

// ========================================
// LOAD APPROVED TEAMS
// ========================================

const {
    data: approvedTeams,
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
            // LOAD LEAGUE FIXTURES
            // ========================================

            const {
                data: fixtureRows,
                error: fixtureError
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
                .eq(
                    "competition_id",
                    leagueCompetition.id
                )
                .order(
                    "match_date",
                    {
                        ascending: true
                    }
                );

            if (fixtureError) {
                throw fixtureError;
            }

            const fixtureIds =
                (fixtureRows || [])
                    .map(
                        function (fixture) {
                            return fixture.id;
                        }
                    )
                    .filter(
                        function (id) {
                            return id !== null &&
                                   id !== undefined;
                        }
                    );

// ========================================
// LOAD RESULTS
// ========================================

let resultRows = [];

if (fixtureIds.length > 0) {

    const {
        data: results,
        error: resultError
    } = await supabaseClient
        .from("results")
        .select("*")
        .in(
            "fixture_id",
            fixtureIds
        );

    if (resultError) {
        throw resultError;
    }

    resultRows =
        results || [];
}

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
                            String(fixture.id)
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

                    table[homeId].played += 1;
                    table[awayId].played += 1;

                    table[homeId].gf +=
                        homeScore;

                    table[homeId].ga +=
                        awayScore;

                    table[awayId].gf +=
                        awayScore;

                    table[awayId].ga +=
                        homeScore;

                    table[homeId].gd =
                        table[homeId].gf -
                        table[homeId].ga;

                    table[awayId].gd =
                        table[awayId].gf -
                        table[awayId].ga;

                    if (
                        homeScore >
                        awayScore
                    ) {

                        table[homeId].won += 1;
                        table[awayId].lost += 1;

                        table[homeId].points += 3;

                        table[homeId].form.push("W");
                        table[awayId].form.push("L");

                    } else if (
                        homeScore <
                        awayScore
                    ) {

                        table[awayId].won += 1;
                        table[homeId].lost += 1;

                        table[awayId].points += 3;

                        table[awayId].form.push("W");
                        table[homeId].form.push("L");

                    } else {

                        table[homeId].drawn += 1;
                        table[awayId].drawn += 1;

                        table[homeId].points += 1;
                        table[awayId].points += 1;

                        table[homeId].form.push("D");
                        table[awayId].form.push("D");
                    }
                }
            );
        
        // ========================================
        // FORM FROM ALL CURRENT-SEASON
        // COMPETITIONS
        // ========================================
        //
        // IMPORTANT:
        //
        // League table statistics remain based
        // ONLY on League matches.
        //
        // Form is based on ALL completed matches
        // in ALL competitions for the current
        // season.
        //
        // The five MOST RECENT matches are used.
        //
        // Display order:
        // OLDEST of the five -> NEWEST of the five
        //
        // Therefore the newest result is always
        // displayed at the FAR RIGHT.
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
                allSeasonFixtureIds.length > 0
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

            // ========================================
            // CREATE RESULT LOOKUP
            // ========================================

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

            // ========================================
            // RESET FORM
            // ========================================

            Object.keys(table).forEach(
                function (teamId) {

                    table[teamId].form = [];
                }
            );

            // ========================================
            // BUILD COMPLETE FORM HISTORY
            // ========================================
            //
            // Fixtures are currently loaded
            // NEWEST -> OLDEST.
            //
            // We therefore collect ALL results
            // first, then select the latest five,
            // then reverse those five so they are
            // displayed OLDEST -> NEWEST.
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

                    // ========================================
                    // HOME TEAM RESULT
                    // ========================================

                    if (home) {

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

                    // ========================================
                    // AWAY TEAM RESULT
                    // ========================================

                    if (away) {

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

            // ========================================
            // KEEP ONLY THE LATEST FIVE
            // AND DISPLAY OLDEST -> NEWEST
            // ========================================

            Object.keys(table).forEach(
                function (teamId) {

                    const form =
                        table[teamId].form || [];

                    // Because the fixture list is
                    // NEWEST -> OLDEST:
                    //
                    // slice(0, 5) gives the latest
                    // five results in reverse order.
                    //
                    // reverse() changes them to:
                    // OLDEST -> NEWEST.
                    //
                    // This guarantees that the newest
                    // result appears at the FAR RIGHT.

                    table[teamId].form =
                        form
                            .slice(0, 5)
                            .reverse();
                }
            );
        }


            // ========================================
            // SORT TABLE
            // ========================================

            const sortedTeams =
                Object.values(
                    table
                ).sort(
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

            // ========================================
            // CLEAR TABLE
            // ========================================

            leagueTableEl.innerHTML = "";

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
                                        width:35px;
                                        height:35px;
                                        object-fit:contain;
                                        vertical-align:middle;
                                        margin-right:7px;
                                    "
                                >
                            `
                            : `
                                <span
                                    style="
                                        font-size:24px;
                                        margin-right:7px;
                                    "
                                >
                                    \u26BD
                                </span>
                            `;

                    const gdText =
                        team.gd > 0
                            ? `+${team.gd}`
                            : String(
                                team.gd
                            );

                    const formHtml =
                        team.form
                            .slice(-5)
                            .map(
                                function (value) {

                                    let symbol =
                                        value;

                                    if (
                                        value ===
                                        "W"
                                    ) {
                                        symbol =
                                            "W";
                                    }

                                    if (
                                        value ===
                                        "D"
                                    ) {
                                        symbol =
                                            "D";
                                    }

                                    if (
                                        value ===
                                        "L"
                                    ) {
                                        symbol =
                                            "L";
                                    }

                                    return `
                                        <span
                                            style="
                                                display:inline-flex;
                                                width:22px;
                                                height:22px;
                                                align-items:center;
                                                justify-content:center;
                                                border-radius:50%;
                                                margin-right:2px;
                                                font-size:10px;
                                                font-weight:700;
                                                background:${
                                                    value === "W"
                                                        ? "#d4edda"
                                                        : value === "D"
                                                            ? "#fff3cd"
                                                            : "#f8d7da"
                                                };
                                                color:${
                                                    value === "W"
                                                        ? "#155724"
                                                        : value === "D"
                                                            ? "#856404"
                                                            : "#721c24"
                                                };
                                            "
                                        >
                                            ${symbol}
                                        </span>
                                    `;
                                }
                            )
                            .join("");

                    row.innerHTML = `
                        <td
                            style="
                                font-weight:700;
                            "
                        >
                            ${index + 1}
                        </td>

                        <td>
                            <div
                                style="
                                    display:flex;
                                    align-items:center;
                                "
                            >
                                ${logo}

                                <span
                                    style="
                                        font-weight:700;
                                    "
                                >
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
                            ${gdText}
                        </td>

                        <td
    style="
        font-weight:800;
    "
>
    ${team.points}
</td>

<td>
    ${
        formHtml ||
        `
            <span
                style="
                    color:#999;
                    font-size:12px;
                "
            >
                —
            </span>
        `
    }
</td>
`;

                    leagueTableEl.appendChild(
                        row
                    );
                }
            );

        } catch (error) {

            console.error(
                "LOAD LEAGUE TABLE ERROR:",
                error
            );

            leagueTableEl.innerHTML = `
                <tr>
                    <td
                        colspan="11"
                        style="
                            text-align:center;
                            padding:30px;
                        "
                    >
                        <div
                            style="
                                font-size:38px;
                                margin-bottom:10px;
                            "
                        >
                            \u274C
                        </div>

                        <strong>
                            Unable to Load League Table
                        </strong>

                        <div
                            style="
                                margin-top:8px;
                                color:#777;
                            "
                        >
                            ${escapeHtml(
                                error.message ||
                                "Unknown error"
                            )}
                        </div>
                    </td>
                </tr>
            `;
        }
    }


    // ========================================
    // LOAD PLAYER STATISTICS
    // ========================================

    async function loadPlayerStatistics(
        competition
    ) {

        // ========================================
        // INITIALIZE CONTAINERS
        // ========================================

        if (topScorersEl) {
            topScorersEl.innerHTML = `
                <div class="loading">
                    Loading top scorers...
                </div>
            `;
        }

        if (topAssistsEl) {
            topAssistsEl.innerHTML = `
                <div class="loading">
                    Loading top assists...
                </div>
            `;
        }

        if (topAppearancesEl) {
            topAppearancesEl.innerHTML = `
                <div class="loading">
                    Loading appearances...
                </div>
            `;
        }

        if (yellowCardsEl) {
            yellowCardsEl.innerHTML = `
                <div class="loading">
                    Loading yellow cards...
                </div>
            `;
        }

        if (redCardsEl) {
            redCardsEl.innerHTML = `
                <div class="loading">
                    Loading red cards...
                </div>
            `;
        }

        try {

            // ========================================
            // GET SEASON
            // ========================================

            const season =
                competition &&
                competition.season !== undefined &&
                competition.season !== null
                    ? competition.season
                    : new Date().getFullYear();

            // ========================================
            // LOAD ALL COMPETITIONS
            // ========================================

            const {
                data: competitionRows,
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
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

            if (competitionsError) {
                throw competitionsError;
            }
/* ========================================
   PLAYER LEADERS COMPETITION FILTER
======================================== */

if (
    playerCompetitionFilter &&
    competitionRows &&
    competitionRows.length > 0
) {

    const currentValue =
        playerCompetitionFilter.value || "all";

    playerCompetitionFilter.innerHTML = `
        <option value="all">
            All Competitions
        </option>
    `;

    competitionRows.forEach(function (comp) {

        const option =
            document.createElement("option");

        option.value = comp.id;

        option.textContent =
            comp.name ||
            getCompetitionLabel(comp);

        playerCompetitionFilter.appendChild(
            option
        );

    });

    const valueStillExists =
        Array.from(
            playerCompetitionFilter.options
        ).some(function (option) {

            return option.value === currentValue;

        });

    playerCompetitionFilter.value =
        valueStillExists
            ? currentValue
            : "all";
}
            const competitions =
    competitionRows || [];


/* ========================================
   SELECTED PLAYER LEADERS COMPETITION
======================================== */

const selectedCompetitionId =
    playerCompetitionFilter
        ? playerCompetitionFilter.value
        : "all";


let competitionIds;


if (
    selectedCompetitionId &&
    selectedCompetitionId !== "all"
) {

    competitionIds = [
        selectedCompetitionId
    ];

} else {

    competitionIds =
        competitions
            .map(function (item) {
                return item.id;
            })
            .filter(function (id) {
                return id !== null &&
                       id !== undefined;
            });
}


if (
    competitionIds.length === 0
) {
    renderEmptyStatistics();
    return;
}

            // ========================================
            // LOAD FIXTURES
            // ========================================

            const {
                data: fixtureRows,
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

            const fixtures =
                fixtureRows || [];

            const completedFixtureIds =
                fixtures
                    .filter(
                        function (fixture) {
                            return isCompletedStatus(
                                fixture.status
                            );
                        }
                    )
                    .map(
                        function (fixture) {
                            return fixture.id;
                        }
                    )
                    .filter(
                        function (id) {
                            return id !== null &&
                                   id !== undefined;
                        }
                    );

            // ========================================
            // NO COMPLETED MATCHES
            // ========================================

            if (
                completedFixtureIds.length === 0
            ) {
                renderEmptyStatistics();
                return;
            }

            
// LOAD RESULTS FOR COMPLETED FIXTURES
// ========================================
const {
    data: resultRows,
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
    throw resultsError;
}

const results =
    resultRows || [];

const resultIds =
    results
        .map(function (result) {
            return result.id;
        })
        .filter(function (id) {
            return id !== null &&
                   id !== undefined;
        });

// ========================================
// NO RESULTS
// ========================================
if (resultIds.length === 0) {
    renderEmptyStatistics();
    return;
}

// ========================================
// LOAD PLAYER MATCH STATISTICS
// ========================================
const {
    data: playerStatistics,
    error: playerStatsError
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

if (playerStatsError) {
    throw playerStatsError;
}

            if (playerStatsError) {
                throw playerStatsError;
            }

            const stats =
                playerStatistics || [];

            // ========================================
            // LOAD PLAYERS
            // ========================================

            const playerIds =
                stats
                    .map(
                        function (item) {
                            return item.player_id;
                        }
                    )
                    .filter(
                        function (id) {
                            return id !== null &&
                                   id !== undefined;
                        }
                    );

            let playerRows = [];

            if (playerIds.length > 0) {

                const uniquePlayerIds =
                    [
                        ...new Set(
                            playerIds.map(
                                function (id) {
                                    return String(id);
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
        full_name,
        position,
        photo_url,
        team_id
    `)
    .in(
        "id",
        uniquePlayerIds
    );

                if (playersError) {
                    throw playersError;
                }

                playerRows =
                    players || [];
            }

            const playerMap = {};

            playerRows.forEach(
                function (player) {

                    playerMap[
                        String(player.id)
                    ] = player;
                }
            );

            // ========================================
            // BUILD AGGREGATED STATISTICS
            // ========================================

            const aggregate = {};

            stats.forEach(
                function (stat) {

                    const playerId =
                        String(
                            stat.player_id
                        );

                    if (
                        !playerMap[playerId]
                    ) {
                        return;
                    }

                    if (
                        !aggregate[playerId]
                    ) {

                        aggregate[playerId] = {
                            player:
                                playerMap[playerId],
                            goals: 0,
                            assists: 0,
                            appearances: 0,
                            yellow_cards: 0,
                            red_cards: 0
                        };
                    }

                    aggregate[playerId].goals +=
                        Number(
                            stat.goals || 0
                        );

                    aggregate[playerId].assists +=
                        Number(
                            stat.assists || 0
                        );

                    aggregate[playerId].appearances +=
    Number(
        stat.appearances || 0
    );

                    aggregate[playerId].yellow_cards +=
                        Number(
                            stat.yellow_cards ||
                            stat.yellow_card ||
                            0
                        );

                    aggregate[playerId].red_cards +=
                        Number(
                            stat.red_cards ||
                            stat.red_card ||
                            0
                        );
                }
            );

            const allStats =
                Object.values(
                    aggregate
                );

            // ========================================
            // TOP SCORERS
            // ========================================

            const topScorers =
                allStats
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

                            return getPlayerDisplayName(
                                a.player
                            ).localeCompare(
                                getPlayerDisplayName(
                                    b.player
                                )
                            );
                        }
                    )
                    .slice(
                        0,
                        10
                    );

            // ========================================
            // TOP ASSISTS
            // ========================================

            const topAssists =
                allStats
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

                            return getPlayerDisplayName(
                                a.player
                            ).localeCompare(
                                getPlayerDisplayName(
                                    b.player
                                )
                            );
                        }
                    )
                    .slice(
                        0,
                        10
                    );

            // ========================================
            // MOST APPEARANCES
            // ========================================

            const mostAppearances =
                allStats
                    .filter(
                        function (item) {
                            return item.appearances > 0;
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

                            return getPlayerDisplayName(
                                a.player
                            ).localeCompare(
                                getPlayerDisplayName(
                                    b.player
                                )
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

            const yellowCards =
                allStats
                    .filter(
                        function (item) {
                            return item.yellow_cards > 0;
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

                            return getPlayerDisplayName(
                                a.player
                            ).localeCompare(
                                getPlayerDisplayName(
                                    b.player
                                )
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

            const redCards =
                allStats
                    .filter(
                        function (item) {
                            return item.red_cards > 0;
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

                            return getPlayerDisplayName(
                                a.player
                            ).localeCompare(
                                getPlayerDisplayName(
                                    b.player
                                )
                            );
                        }
                    )
                    .slice(
                        0,
                        10
                    );

            // ========================================
            // RENDER STATISTICS
            // ========================================

            renderPlayerList(
                topScorersEl,
                topScorers,
                "goals",
                "\u26BD"
            );

            renderPlayerList(
                topAssistsEl,
                topAssists,
                "assists",
                "\u{1F3AF}"
            );

            renderPlayerList(
                topAppearancesEl,
                mostAppearances,
                "appearances",
                "\u{1F441}\uFE0F"
            );

            renderPlayerList(
                yellowCardsEl,
                yellowCards,
                "yellow_cards",
                "\u{1F7E8}"
            );

            renderPlayerList(
                redCardsEl,
                redCards,
                "red_cards",
                "\u{1F7E5}"
            );

        } catch (error) {

            console.error(
                "LOAD PLAYER STATISTICS ERROR:",
                error
            );

            renderStatisticsError(
                error
            );
        }
    }


    // ========================================
    // PLAYER DISPLAY NAME
    // ========================================

    function getPlayerDisplayName(
        player
    ) {

        if (!player) {
            return "Unknown Player";
        }

        if (
    player.full_name &&
    String(player.full_name).trim()
) {
    return String(
        player.full_name
    ).trim();
}

return "Unknown Player";
    }


    // ========================================
    // RENDER EMPTY STATISTICS
    // ========================================

    function renderEmptyStatistics() {

        const emptyMessage = `
            <div
                class="empty-message"
                style="
                    padding:20px;
                    text-align:center;
                "
            >
                <div
                    style="
                        font-size:38px;
                        margin-bottom:8px;
                    "
                >
                    \u{1F4CA}
                </div>

                <p>
                    Statistics will appear
                    after completed matches.
                </p>
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
    }


    // ========================================
    // RENDER STATISTICS ERROR
    // ========================================

    function renderStatisticsError(
        error
    ) {

        const errorMessage = `
            <div
                class="empty-message"
                style="
                    padding:20px;
                    text-align:center;
                "
            >
                <div
                    style="
                        font-size:38px;
                        margin-bottom:8px;
                    "
                >
                    \u274C
                </div>

                <p>
                    Unable to load statistics.
                </p>

                <small>
                    ${escapeHtml(
                        error?.message ||
                        "Unknown error"
                    )}
                </small>
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


    // ========================================
    // RENDER PLAYER LIST
    // ========================================

    function renderPlayerList(
        container,
        items,
        statKey,
        icon
    ) {

        if (!container) {
            return;
        }

        if (
            !items ||
            items.length === 0
        ) {

            container.innerHTML = `
                <div
                    class="empty-message"
                    style="
                        padding:20px;
                        text-align:center;
                    "
                >
                    <div
                        style="
                            font-size:32px;
                            margin-bottom:8px;
                        "
                    >
                        ${icon}
                    </div>

                    <p>
                        No statistics available yet.
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML = "";

        items.forEach(
            function (
                item,
                index
            ) {

                const player =
                    item.player ||
                    {};

                const playerName =
                    getPlayerDisplayName(
                        player
                    );

                const value =
                    Number(
                        item[statKey] || 0
                    );

                const photo =
                    player.photo_url
                        ? `
                            <img
                                src="${escapeHtml(
                                    player.photo_url
                                )}"
                                alt="${escapeHtml(
                                    playerName
                                )}"
                                style="
                                    width:48px;
                                    height:48px;
                                    border-radius:50%;
                                    object-fit:cover;
                                    border:2px solid #eee;
                                "
                            >
                        `
                        : `
                            <div
                                style="
                                    width:48px;
                                    height:48px;
                                    border-radius:50%;
                                    background:#f1f1f1;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    font-size:22px;
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

                card.style.cssText = `
                    display:flex;
                    align-items:center;
                    gap:12px;
                    padding:10px;
                    margin-bottom:8px;
                    border:1px solid #eee;
                    border-radius:10px;
                    background:#fff;
                `;

                card.innerHTML = `
                    <div
                        style="
                            width:26px;
                            text-align:center;
                            font-weight:800;
                            color:#075b35;
                        "
                    >
                        ${index + 1}
                    </div>

                    ${photo}

                    <div
                        style="
                            flex:1;
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
                                playerName
                            )}
                        </div>

                        ${
                            player.position
                                ? `
                                    <div
                                        style="
                                            font-size:12px;
                                            color:#777;
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
                            min-width:55px;
                            text-align:center;
                        "
                    >
                        <div
                            style="
                                font-size:20px;
                                font-weight:900;
                            "
                        >
                            ${escapeHtml(
                                value
                            )}
                        </div>

                        <div
                            style="
                                font-size:11px;
                                color:#777;
                            "
                        >
                            ${statKey
                                .replace(
                                    "_",
                                    " "
                                )}
                        </div>
                    </div>
                `;

                container.appendChild(
                    card
                );
            }
        );
    }


    // ========================================
    // LOAD TEAM DIRECTORY
    // ========================================

    async function loadTeams() {

        const teamContainer =
            document.getElementById(
                "teamsList"
            );

        if (!teamContainer) {
            return;
        }

        teamContainer.innerHTML = `
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
    created_at
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

            const approvedTeams =
                teams || [];

            if (
                approvedTeams.length === 0
            ) {

                teamContainer.innerHTML = `
                    <div
                        class="empty-message"
                        style="
                            padding:25px;
                            text-align:center;
                        "
                    >
                        <div
                            style="
                                font-size:38px;
                                margin-bottom:8px;
                            "
                        >
                            \u{1F465}
                        </div>

                        <h3>
                            No Teams Registered
                        </h3>

                        <p>
                            Approved teams will
                            appear here.
                        </p>
                    </div>
                `;

                return;
            }

            teamContainer.innerHTML = "";

            approvedTeams.forEach(
                function (team) {

                    const teamCard =
                        document.createElement(
                            "div"
                        );

                    teamCard.className =
                        "team-card";

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
                                        width:75px;
                                        height:75px;
                                        object-fit:contain;
                                    "
                                >
                            `
                            : `
                                <div
                                    style="
                                        width:75px;
                                        height:75px;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        font-size:40px;
                                    "
                                >
                                    \u26BD
                                </div>
                            `;

                    teamCard.innerHTML = `
                        <div
                            style="
                                text-align:center;
                            "
                        >
                            ${logo}

                            <h3
                                style="
                                    margin:10px 0 4px;
                                "
                            >
                                ${escapeHtml(
                                    team.name ||
                                    "Unknown Team"
                                )}
                            </h3>

                            ${
                                team.short_name
                                    ? `
                                        <div
                                            style="
                                                font-size:13px;
                                                color:#777;
                                            "
                                        >
                                            ${escapeHtml(
                                                team.short_name
                                            )}
                                        </div>
                                    `
                                    : ""
                            }
                        </div>
                    `;

                    teamContainer.appendChild(
                        teamCard
                    );
                }
            );

        } catch (error) {

            console.error(
                "LOAD TEAMS ERROR:",
                error
            );

            teamContainer.innerHTML = `
                <div
                    class="empty-message"
                    style="
                        padding:25px;
                        text-align:center;
                    "
                >
                    <div
                        style="
                            font-size:38px;
                            margin-bottom:8px;
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
    // TEAM REGISTRATION FORM
    // ========================================

    function setupTeamRegistration() {

        const form =
            document.getElementById(
                "teamRegistrationForm"
            );

        if (!form) {
            return;
        }

        const messageEl =
            document.getElementById(
                "registrationMessage"
            );

        const submitButton =
            form.querySelector(
                "button[type='submit']"
            );

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                if (submitButton) {
                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Submitting...";
                }

                if (messageEl) {
                    messageEl.innerHTML =
                        "";
                }

                try {

                    const formData =
                        new FormData(
                            form
                        );

                    const teamName =
                        String(
                            formData.get(
                                "team_name"
                            ) || ""
                        ).trim();

                    const shortName =
                        String(
                            formData.get(
                                "short_name"
                            ) || ""
                        ).trim();

                    const coachName =
                        String(
                            formData.get(
                                "coach_name"
                            ) || ""
                        ).trim();

                    const captainName =
                        String(
                            formData.get(
                                "captain_name"
                            ) || ""
                        ).trim();

                    const viceCaptainName =
                        String(
                            formData.get(
                                "vice_captain_name"
                            ) || ""
                        ).trim();

                    const disciplineMasterName =
                        String(
                            formData.get(
                                "discipline_master_name"
                            ) || ""
                        ).trim();

                    if (!teamName) {
                        throw new Error(
                            "Please enter the team name."
                        );
                    }

                    // ========================================
                    // CHECK DUPLICATE TEAM
                    // ========================================

                    const {
                        data: existingTeams,
                        error: existingError
                    } = await supabaseClient
                        .from("teams")
                        .select("id,name")
                        .ilike(
                            "name",
                            teamName
                        )
                        .limit(1);

                    if (existingError) {
                        throw existingError;
                    }

                    if (
                        existingTeams &&
                        existingTeams.length > 0
                    ) {
                        throw new Error(
                            "A team with this name already exists."
                        );
                    }

                    // ========================================
                    // TEAM LOGO
                    // ========================================

                    let logoUrl = "";

                    const logoFile =
                        formData.get(
                            "logo"
                        );

                    if (
                        logoFile &&
                        logoFile instanceof File &&
                        logoFile.size > 0
                    ) {

                        logoUrl =
                            await uploadImage(
                                logoFile,
                                "team-logos",
                                "teams"
                            );
                    }

                    // ========================================
                    // INSERT TEAM
                    // ========================================

                    const {
                        data: insertedTeam,
                        error: insertError
                    } = await supabaseClient
                        .from("teams")
                        .insert([
                            {
                                name:
                                    teamName,
                                short_name:
                                    shortName ||
                                    teamName,
                                coach_name:
                                    coachName,
                                captain_name:
                                    captainName,
                                vice_captain_name:
                                    viceCaptainName,
                                discipline_master_name:
                                    disciplineMasterName,
                                logo_url:
                                    logoUrl,
                                registration_status:
    "Pending"
                            }
                        ])
                        .select()
                        .single();

                    if (insertError) {
                        throw insertError;
                    }

                    // ========================================
                    // SUCCESS
                    // ========================================

                    if (messageEl) {

                        messageEl.innerHTML = `
                            <div
                                style="
                                    padding:15px;
                                    border-radius:8px;
                                    background:#d4edda;
                                    color:#155724;
                                    margin-top:15px;
                                "
                            >
                                <strong>
                                    \u2705 Registration submitted successfully!
                                </strong>

                                <div
                                    style="
                                        margin-top:6px;
                                    "
                                >
                                    Your team is now
                                    awaiting approval.
                                </div>
                            </div>
                        `;
                    }

                    form.reset();

                    console.log(
                        "TEAM REGISTERED:",
                        insertedTeam
                    );

                } catch (error) {

                    console.error(
                        "TEAM REGISTRATION ERROR:",
                        error
                    );

                    if (messageEl) {

                        messageEl.innerHTML = `
                            <div
                                style="
                                    padding:15px;
                                    border-radius:8px;
                                    background:#f8d7da;
                                    color:#721c24;
                                    margin-top:15px;
                                "
                            >
                                <strong>
                                    \u274C Registration failed
                                </strong>

                                <div
                                    style="
                                        margin-top:6px;
                                    "
                                >
                                    ${escapeHtml(
                                        error.message ||
                                        "Unknown error"
                                    )}
                                </div>
                            </div>
                        `;
                    }

                } finally {

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "Register Team";
                    }
                }
            }
        );
    }


    // ========================================
    // TEAM PROFILE MODAL
    // ========================================

    async function loadTeamProfile(
        teamId
    ) {

        if (!teamId) {
            return;
        }

        try {

            const {
                data: team,
                error
            } = await supabaseClient
                .from("teams")
                .select(`
                    *,
                    players (
                        id,
                        first_name,
                        last_name,
                        name,
                        position,
                        jersey_number,
                        photo_url,
                        registration_status
                    )
                `)
                .eq(
                    "id",
                    teamId
                )
                .eq(
                    "registration_status",
                    "Approved"
                )
                .maybeSingle();

            if (error) {
                throw error;
            }

            if (!team) {
                alert(
                    "Team information could not be found."
                );
                return;
            }

            showTeamProfile(
                team
            );

        } catch (error) {

            console.error(
                "LOAD TEAM PROFILE ERROR:",
                error
            );

            alert(
                error.message ||
                "Unable to load team profile."
            );
        }
    }


    // ========================================
    // SHOW TEAM PROFILE
    // ========================================

    function showTeamProfile(
        team
    ) {

        let modal =
            document.getElementById(
                "teamProfileModal"
            );

        if (!modal) {

            modal =
                document.createElement(
                    "div"
                );

            modal.id =
                "teamProfileModal";

            modal.style.cssText = `
                position:fixed;
                inset:0;
                background:rgba(0,0,0,.75);
                display:flex;
                align-items:center;
                justify-content:center;
                z-index:9999;
                padding:20px;
                overflow-y:auto;
            `;

            document.body.appendChild(
                modal
            );
        }

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
                            width:110px;
                            height:110px;
                            object-fit:contain;
                            margin:auto;
                            display:block;
                        "
                    >
                `
                : `
                    <div
                        style="
                            width:110px;
                            height:110px;
                            margin:auto;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:60px;
                        "
                    >
                        \u26BD
                    </div>
                `;

        const players =
            Array.isArray(
                team.players
            )
                ? team.players.filter(
                    function (player) {
                        return (
                            String(
    player.registration_status ||
    ""
).toLowerCase() !==
                            "inactive"
                        );
                    }
                )
                : [];

        const playersHtml =
            players.length > 0
                ? players
                    .map(
                        function (player) {

                            const playerName =
                                getPlayerDisplayName(
                                    player
                                );

                            const photo =
                                player.photo_url
                                    ? `
                                        <img
                                            src="${escapeHtml(
                                                player.photo_url
                                            )}"
                                            alt="${escapeHtml(
                                                playerName
                                            )}"
                                            style="
                                                width:45px;
                                                height:45px;
                                                border-radius:50%;
                                                object-fit:cover;
                                            "
                                        >
                                    `
                                    : `
                                        <div
                                            style="
                                                width:45px;
                                                height:45px;
                                                border-radius:50%;
                                                background:#eee;
                                                display:flex;
                                                align-items:center;
                                                justify-content:center;
                                                font-size:20px;
                                            "
                                        >
                                            \u{1F464}
                                        </div>
                                    `;

                            return `
                                <div
                                    style="
                                        display:flex;
                                        align-items:center;
                                        gap:10px;
                                        padding:8px;
                                        border-bottom:1px solid #eee;
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
                                                font-weight:700;
                                            "
                                        >
                                            ${escapeHtml(
                                                playerName
                                            )}
                                        </div>

                                        <div
                                            style="
                                                font-size:12px;
                                                color:#777;
                                            "
                                        >
                                            ${
                                                player.position
                                                    ? escapeHtml(
                                                        player.position
                                                    )
                                                    : "Player"
                                            }

                                            ${
                                                player.jersey_number !== null &&
                                                player.jersey_number !== undefined &&
                                                player.jersey_number !== ""
                                                    ? ` • #${escapeHtml(
                                                        player.jersey_number
                                                    )}`
                                                    : ""
                                            }
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                    )
                    .join("")
                : `
                    <div
                        style="
                            padding:20px;
                            text-align:center;
                            color:#777;
                        "
                    >
                        No players registered yet.
                    </div>
                `;

        modal.innerHTML = `
            <div
                style="
                    width:100%;
                    max-width:650px;
                    max-height:90vh;
                    overflow-y:auto;
                    background:#fff;
                    border-radius:14px;
                    padding:25px;
                    position:relative;
                "
            >

                <button
                    type="button"
                    id="closeTeamProfileModal"
                    style="
                        position:absolute;
                        top:12px;
                        right:12px;
                        width:36px;
                        height:36px;
                        border:none;
                        border-radius:50%;
                        background:#f1f1f1;
                        font-size:20px;
                        cursor:pointer;
                    "
                >
                    ×
                </button>

                ${logo}

                <h2
                    style="
                        text-align:center;
                        margin:15px 0 5px;
                    "
                >
                    ${escapeHtml(
                        team.name ||
                        "Unknown Team"
                    )}
                </h2>

                ${
                    team.short_name
                        ? `
                            <div
                                style="
                                    text-align:center;
                                    color:#777;
                                    margin-bottom:15px;
                                "
                            >
                                ${escapeHtml(
                                    team.short_name
                                )}
                            </div>
                        `
                        : ""
                }

                <div
                    style="
                        display:grid;
                        grid-template-columns:repeat(
                            auto-fit,
                            minmax(180px,1fr)
                        );
                        gap:10px;
                        margin-bottom:20px;
                    "
                >

                    ${
                        team.coach_name
                            ? `
                                <div
                                    style="
                                        padding:12px;
                                        background:#f7f7f7;
                                        border-radius:8px;
                                    "
                                >
                                    <strong>
                                        Coach
                                    </strong>

                                    <div>
                                        ${escapeHtml(
                                            team.coach_name
                                        )}
                                    </div>
                                </div>
                            `
                            : ""
                    }

                    ${
                        team.captain_name
                            ? `
                                <div
                                    style="
                                        padding:12px;
                                        background:#f7f7f7;
                                        border-radius:8px;
                                    "
                                >
                                    <strong>
                                        Captain
                                    </strong>

                                    <div>
                                        ${escapeHtml(
                                            team.captain_name
                                        )}
                                    </div>
                                </div>
                            `
                            : ""
                    }

                    ${
                        team.vice_captain_name
                            ? `
                                <div
                                    style="
                                        padding:12px;
                                        background:#f7f7f7;
                                        border-radius:8px;
                                    "
                                >
                                    <strong>
                                        Vice Captain
                                    </strong>

                                    <div>
                                        ${escapeHtml(
                                            team.vice_captain_name
                                        )}
                                    </div>
                                </div>
                            `
                            : ""
                    }

                    ${
                        team.discipline_master_name
                            ? `
                                <div
                                    style="
                                        padding:12px;
                                        background:#f7f7f7;
                                        border-radius:8px;
                                    "
                                >
                                    <strong>
                                        Discipline Master
                                    </strong>

                                    <div>
                                        ${escapeHtml(
                                            team.discipline_master_name
                                        )}
                                    </div>
                                </div>
                            `
                            : ""
                    }

                </div>

                <h3
                    style="
                        margin-bottom:10px;
                    "
                >
                    \u{1F465} Squad
                </h3>

                <div>
                    ${playersHtml}
                </div>

            </div>
        `;

        const closeButton =
            document.getElementById(
                "closeTeamProfileModal"
            );

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                function () {
                    modal.remove();
                }
            );
        }

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    modal
                ) {
                    modal.remove();
                }
            }
        );
    }


    // ========================================
    // TEAM CARD CLICK HANDLER
    // ========================================

    function setupTeamCardHandlers() {

        document.addEventListener(
            "click",
            function (event) {

                const card =
                    event.target.closest(
                        "[data-team-id]"
                    );

                if (!card) {
                    return;
                }

                const teamId =
                    card.getAttribute(
                        "data-team-id"
                    );

                if (teamId) {
                    loadTeamProfile(
                        teamId
                    );
                }
            }
        );
    }


    // ========================================
    // LOAD NAVIGATION
    // ========================================

    function setupNavigation() {

        const navLinks =
            document.querySelectorAll(
                "a[href^='#']"
            );

        navLinks.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function (event) {

                        const targetId =
                            link.getAttribute(
                                "href"
                            );

                        if (
                            !targetId ||
                            targetId === "#"
                        ) {
                            return;
                        }

                        const target =
                            document.querySelector(
                                targetId
                            );

                        if (!target) {
                            return;
                        }

                        event.preventDefault();

                        target.scrollIntoView({
                            behavior:
                                "smooth",
                            block:
                                "start"
                        });
                    }
                );
            }
        );
    }


    // ========================================
    // MOBILE MENU
    // ========================================

    function setupMobileMenu() {

        const menuButton =
            document.getElementById(
                "menuToggle"
            );

        const navigation =
            document.getElementById(
                "mainNavigation"
            );

        if (
            !menuButton ||
            !navigation
        ) {
            return;
        }

        menuButton.addEventListener(
            "click",
            function () {

                navigation.classList.toggle(
                    "active"
                );

                const expanded =
                    navigation.classList.contains(
                        "active"
                    );

                menuButton.setAttribute(
                    "aria-expanded",
                    expanded
                        ? "true"
                        : "false"
                );
            }
        );
    }

// ========================================
// LOAD COMPETITION SUPPORT / SPONSORS
// ========================================
async function loadCompetitionSupport(
    competition
) {
    const supportContainer =
        document.getElementById(
            "competitionSupportList"
        );

    if (!supportContainer) {
        return;
    }

    supportContainer.innerHTML = `
        <div
            class="sponsor-box"
            style="
                grid-column:1/-1;
                min-height:120px;
                flex-direction:column;
            "
        >
            <div
                style="
                    font-size:32px;
                    margin-bottom:8px;
                "
            >
                🤝
            </div>

            <div>
                Loading sponsors and partners...
            </div>
        </div>
    `;

    try {
        if (!competition || !competition.id) {
            supportContainer.innerHTML = `
                <div
                    class="sponsor-box"
                    style="
                        grid-column:1/-1;
                        min-height:120px;
                        flex-direction:column;
                    "
                >
                    <div
                        style="
                            font-size:32px;
                            margin-bottom:8px;
                        "
                    >
                        🤝
                    </div>

                    <div>
                        No sponsors or partners
                        listed yet.
                    </div>
                </div>
            `;

            return;
        }

        // ========================================
        // LOAD ACTIVE SUPPORT RECORDS
        // ========================================
        const {
            data: supportRows,
            error: supportError
        } = await supabaseClient
            .from("competition_support")
            .select(`
                id,
                competition_id,
                support_type,
                title,
                description,
                amount,
                is_amount_public,
                featured,
                display_order,
                status,
                created_at,
                supporter:supporters (
                    id,
                    name,
                    supporter_type,
                    website_url,
                    facebook_url,
                    instagram_url,
                    x_url,
                    youtube_url,
                    photo_url,
                    logo_url,
                    is_active
                )
            `)
            .eq(
                "competition_id",
                competition.id
            )
            .eq(
                "status",
                "Active"
            )
            .order(
                "featured",
                {
                    ascending:false
                }
            )
            .order(
                "display_order",
                {
                    ascending:true
                }
            )
            .order(
                "created_at",
                {
                    ascending:false
                }
            );

        if (supportError) {
            throw supportError;
        }

        // ========================================
        // ONLY SHOW ACTIVE SUPPORTERS
        // ========================================
        const activeSupport =
            (supportRows || [])
                .filter(
                    function (record) {
                        return (
                            record.supporter &&
                            record.supporter.is_active === true
                        );
                    }
                );

        // ========================================
        // NOTHING TO DISPLAY
        // ========================================
        if (
            activeSupport.length === 0
        ) {
            supportContainer.innerHTML = `
                <div
                    class="sponsor-box"
                    style="
                        grid-column:1/-1;
                        min-height:120px;
                        flex-direction:column;
                    "
                >
                    <div
                        style="
                            font-size:32px;
                            margin-bottom:8px;
                        "
                    >
                        🤝
                    </div>

                    <div>
                        No sponsors or partners
                        listed yet.
                    </div>
                </div>
            `;

            return;
        }

        // ========================================
        // SAFE URL HELPER
        // ========================================
        function getSafeUrl(
            value
        ) {
            if (
                !value ||
                typeof value !== "string"
            ) {
                return "";
            }

            const url =
                value.trim();

            if (
                url.startsWith(
                    "https://"
                ) ||
                url.startsWith(
                    "http://"
                )
            ) {
                return url;
            }

            return "";
        }

        // ========================================
        // RENDER SUPPORTERS
        // ========================================
        supportContainer.innerHTML = "";

        activeSupport.forEach(
            function (record) {
                const supporter =
                    record.supporter || {};

                const supporterName =
                    supporter.name ||
                    "Kabaru Football Supporter";

                const supportTitle =
                    record.title ||
                    "";

                const supportType =
                    record.support_type ||
                    supporter.supporter_type ||
                    "";

                const description =
                    record.description ||
                    "";

                // ========================================
                // LOGO / PHOTO
                // ========================================
                let visual = "";

                if (
                    supporter.logo_url
                ) {
                    visual = `
                        <img
                            src="${escapeHtml(
                                supporter.logo_url
                            )}"
                            alt="${escapeHtml(
                                supporterName
                            )} logo"
                            style="
                                width:90px;
                                height:90px;
                                object-fit:contain;
                                border-radius:12px;
                                background:#fff;
                                padding:8px;
                                margin-bottom:12px;
                            "
                        >
                    `;
                } else if (
                    supporter.photo_url
                ) {
                    visual = `
                        <img
                            src="${escapeHtml(
                                supporter.photo_url
                            )}"
                            alt="${escapeHtml(
                                supporterName
                            )}"
                            style="
                                width:90px;
                                height:90px;
                                object-fit:cover;
                                border-radius:12px;
                                margin-bottom:12px;
                            "
                        >
                    `;
                } else {
                    visual = `
                        <div
                            style="
                                width:90px;
                                height:90px;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                border-radius:12px;
                                background:rgba(
                                    255,
                                    255,
                                    255,
                                    .12
                                );
                                font-size:42px;
                                margin-bottom:12px;
                            "
                        >
                            🤝
                        </div>
                    `;
                }

                // ========================================
                // FEATURED BADGE
                // ========================================
                const featuredBadge =
                    record.featured === true
                        ? `
                            <div
                                style="
                                    display:inline-block;
                                    padding:4px 9px;
                                    border-radius:20px;
                                    background:#f5c542;
                                    color:#17351f;
                                    font-size:10px;
                                    font-weight:900;
                                    margin-bottom:8px;
                                    text-transform:uppercase;
                                "
                            >
                                ⭐ Featured Supporter
                            </div>
                        `
                        : "";

                // ========================================
                // SUPPORT TYPE
                // ========================================
                const typeHtml =
                    supportType
                        ? `
                            <div
                                style="
                                    font-size:12px;
                                    font-weight:800;
                                    color:#f5c542;
                                    margin-bottom:7px;
                                    text-transform:uppercase;
                                    letter-spacing:.4px;
                                "
                            >
                                ${escapeHtml(
                                    supportType
                                )}
                            </div>
                        `
                        : "";

                // ========================================
                // SUPPORT TITLE
                // ========================================
                const titleHtml =
                    supportTitle
                        ? `
                            <div
                                style="
                                    font-size:15px;
                                    font-weight:800;
                                    margin-bottom:8px;
                                "
                            >
                                ${escapeHtml(
                                    supportTitle
                                )}
                            </div>
                        `
                        : "";

                // ========================================
                // DESCRIPTION
                // ========================================
                const descriptionHtml =
                    description
                        ? `
                            <div
                                style="
                                    font-size:13px;
                                    line-height:1.5;
                                    color:rgba(
                                        255,
                                        255,
                                        255,
                                        .75
                                    );
                                    margin-bottom:10px;
                                "
                            >
                                ${escapeHtml(
                                    description
                                )}
                            </div>
                        `
                        : "";

                // ========================================
                // PUBLIC AMOUNT
                // ========================================
                const amountValue =
                    Number(
                        record.amount
                    );

                const showAmount =
                    record.is_amount_public === true &&
                    record.amount !== null &&
                    record.amount !== undefined &&
                    record.amount !== "" &&
                    Number.isFinite(
                        amountValue
                    );

                const amountHtml =
                    showAmount
                        ? `
                            <div
                                style="
                                    font-size:13px;
                                    font-weight:800;
                                    margin-bottom:10px;
                                "
                            >
                                Support Amount:
                                KSh ${amountValue.toLocaleString(
                                    "en-KE"
                                )}
                            </div>
                        `
                        : "";

                // ========================================
                // SOCIAL / WEBSITE LINKS
                // ========================================
                const links = [];

                const website =
                    getSafeUrl(
                        supporter.website_url
                    );

                const facebook =
                    getSafeUrl(
                        supporter.facebook_url
                    );

                const instagram =
                    getSafeUrl(
                        supporter.instagram_url
                    );

                const xUrl =
                    getSafeUrl(
                        supporter.x_url
                    );

                const youtube =
                    getSafeUrl(
                        supporter.youtube_url
                    );

                if (website) {
                    links.push(`
                        <a
                            href="${escapeHtml(
                                website
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="
                                color:#fff;
                                text-decoration:none;
                                font-size:12px;
                                font-weight:800;
                            "
                        >
                            🌐 Website
                        </a>
                    `);
                }

                if (facebook) {
                    links.push(`
                        <a
                            href="${escapeHtml(
                                facebook
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="
                                color:#fff;
                                text-decoration:none;
                                font-size:12px;
                                font-weight:800;
                            "
                        >
                            📘 Facebook
                        </a>
                    `);
                }

                if (instagram) {
                    links.push(`
                        <a
                            href="${escapeHtml(
                                instagram
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="
                                color:#fff;
                                text-decoration:none;
                                font-size:12px;
                                font-weight:800;
                            "
                        >
                            📷 Instagram
                        </a>
                    `);
                }

                if (xUrl) {
                    links.push(`
                        <a
                            href="${escapeHtml(
                                xUrl
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="
                                color:#fff;
                                text-decoration:none;
                                font-size:12px;
                                font-weight:800;
                            "
                        >
                            𝕏 X
                        </a>
                    `);
                }

                if (youtube) {
                    links.push(`
                        <a
                            href="${escapeHtml(
                                youtube
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="
                                color:#fff;
                                text-decoration:none;
                                font-size:12px;
                                font-weight:800;
                            "
                        >
                            ▶ YouTube
                        </a>
                    `);
                }

                const linksHtml =
                    links.length > 0
                        ? `
                            <div
                                style="
                                    display:flex;
                                    flex-wrap:wrap;
                                    justify-content:center;
                                    gap:8px 12px;
                                    margin-top:8px;
                                "
                            >
                                ${links.join("")}
                            </div>
                        `
                        : "";

                // ========================================
                // CARD
                // ========================================
                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "sponsor-box";

                card.style.cssText = `
                    min-height:240px;
                    flex-direction:column;
                    justify-content:flex-start;
                    align-items:center;
                    text-align:center;
                `;

                card.innerHTML = `
                    ${visual}

                    ${featuredBadge}

                    <div
                        style="
                            font-size:18px;
                            font-weight:900;
                            margin-bottom:6px;
                        "
                    >
                        ${escapeHtml(
                            supporterName
                        )}
                    </div>

                    ${typeHtml}

                    ${titleHtml}

                    ${descriptionHtml}

                    ${amountHtml}

                    ${linksHtml}
                `;

                supportContainer.appendChild(
                    card
                );
            }
        );

    } catch (error) {
        console.error(
            "LOAD COMPETITION SUPPORT ERROR:",
            error
        );

        supportContainer.innerHTML = `
            <div
                class="sponsor-box"
                style="
                    grid-column:1/-1;
                    min-height:120px;
                    flex-direction:column;
                "
            >
                <div
                    style="
                        font-size:32px;
                        margin-bottom:8px;
                    "
                >
                    ❌
                </div>

                <div
                    style="
                        font-weight:800;
                    "
                >
                    Unable to load sponsors
                    and partners.
                </div>

                <div
                    style="
                        margin-top:7px;
                        font-size:12px;
                        color:rgba(
                            255,
                            255,
                            255,
                            .65
                        );
                    "
                >
                    ${escapeHtml(
                        error.message ||
                        "Unknown error"
                    )}
                </div>
            </div>
        `;
    }
}
    // ========================================
    // INITIAL LOAD
    // ========================================

    try {

        // ========================================
        // LOAD MAIN COMPETITION
        // ========================================

        const competition =
            await loadCompetition();
        currentMainCompetition = competition;
if (playerCompetitionFilter) {

    playerCompetitionFilter.addEventListener(
        "change",
        async function () {

            await loadPlayerStatistics(
                competition
            );

        }
    );

}
        // ========================================
        // LOAD MAIN WEBSITE DATA
        // ========================================

        await Promise.all([
    loadFixtures(
        competition
    ),
    loadResults(
        competition
    ),
    loadLeagueTable(
        competition
    ),
    loadPlayerStatistics(
        competition
    ),
    loadTeams(),
    loadCompetitionSupport(
        competition
    )
]);

        // ========================================
        // SETUP INTERACTIONS
        // ========================================

        setupTeamRegistration();

        setupTeamCardHandlers();

        setupNavigation();

        setupMobileMenu();

        console.log(
            "KABARU WARD FOOTBALL WEBSITE LOADED SUCCESSFULLY"
        );

    } catch (error) {

        console.error(
            "WEBSITE INITIALIZATION ERROR:",
            error
        );

    }

});
