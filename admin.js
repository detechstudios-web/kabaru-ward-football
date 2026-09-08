 // ========================================
// KABARU WARD FOOTBALL
// ADMIN DASHBOARD
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    // ========================================
    // GET HTML ELEMENTS
    // ========================================

    const pendingTeams =
        document.getElementById("pendingTeams");

    const statusMessage =
        document.getElementById("statusMessage");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const fixtureForm =
        document.getElementById("fixtureForm");

    const competitionSelect =
        document.getElementById("competitionSelect");

    const homeTeamSelect =
        document.getElementById("homeTeamSelect");

    const awayTeamSelect =
        document.getElementById("awayTeamSelect");

    const venueSelect =
        document.getElementById("venueSelect");

    const fixturesList =
        document.getElementById("fixturesList");

    const fixtureFormMessage =
        document.getElementById("fixtureFormMessage");

    const matchday =
        document.getElementById("matchday");

    const matchDate =
        document.getElementById("matchDate");

    const kickOff =
        document.getElementById("kickOff");

    const fixtureStatus =
        document.getElementById("fixtureStatus");


    // ========================================
    // GENERAL MESSAGE
    // ========================================

    function showMessage(text, type = "") {

        if (!statusMessage) return;

        statusMessage.textContent = text;
        statusMessage.style.display = "block";
        statusMessage.className =
            "status-message " + type;
    }


    // ========================================
    // FIXTURE MESSAGE
    // ========================================

    function showFixtureMessage(text, type = "") {

        if (!fixtureFormMessage) return;

        fixtureFormMessage.textContent = text;
        fixtureFormMessage.style.display = "block";
        fixtureFormMessage.className =
            "fixture-form-message " + type;
    }


    // ========================================
    // CHECK SUPABASE
    // ========================================

    function checkSupabase() {

        if (typeof window.supabase === "undefined") {

            showMessage(
                "❌ Supabase library failed to load.",
                "error"
            );

            console.error(
                "Supabase CDN library is not available."
            );

            return false;
        }


        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {

            showMessage(
                "❌ Supabase connection is not available.",
                "error"
            );

            console.error(
                "supabaseClient is not defined. Check supabase.js."
            );

            return false;
        }


        return true;
    }


    // ========================================
    // LOGOUT
    // ========================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async function () {

                try {

                    if (!checkSupabase()) {
                        return;
                    }

                    logoutBtn.disabled = true;
                    logoutBtn.textContent =
                        "Logging out...";

                    const {
                        error
                    } =
                        await supabaseClient.auth.signOut();

                    if (error) {
                        throw error;
                    }

                    window.location.href =
                        "admin-login.html";

                } catch (error) {

                    console.error(
                        "LOGOUT ERROR:",
                        error
                    );

                    logoutBtn.disabled = false;
                    logoutBtn.textContent =
                        "Logout";

                    showMessage(
                        "Unable to logout: " +
                        (
                            error.message ||
                            "Unknown error"
                        ),
                        "error"
                    );
                }

            }
        );

    }


    // ========================================
    // CHECK ADMIN
    // ========================================

    async function checkAdmin() {

        try {

            if (!checkSupabase()) {
                return false;
            }


            const {
                data: {
                    user
                },
                error: userError
            } =
                await supabaseClient.auth.getUser();


            if (userError) {
                throw userError;
            }


            if (!user) {

                showMessage(
                    "You must be logged in as an administrator.",
                    "error"
                );

                if (pendingTeams) {

                    pendingTeams.innerHTML = `
                        <div class="empty-message">
                            Please log in to access the admin dashboard.
                        </div>
                    `;
                }

                return false;
            }


            console.log(
                "Logged in user:",
                user.email
            );


            const {
                data: admin,
                error: adminError
            } =
                await supabaseClient
                    .from("admin_users")
                    .select("user_id, role")
                    .eq("user_id", user.id)
                    .in("role", [
                        "admin",
                        "super_admin"
                    ])
                    .maybeSingle();


            if (adminError) {
                throw adminError;
            }


            if (!admin) {

                showMessage(
                    "Access denied. This account is not an administrator.",
                    "error"
                );

                if (pendingTeams) {

                    pendingTeams.innerHTML = `
                        <div class="empty-message">
                            You do not have permission to access this dashboard.
                        </div>
                    `;
                }

                return false;
            }


            showMessage(
                "Administrator access granted: " +
                user.email,
                "success"
            );


            return true;

        } catch (error) {

            console.error(
                "ADMIN CHECK ERROR:",
                error
            );

            showMessage(
                "Admin check failed: " +
                (
                    error.message ||
                    "Unable to verify administrator access."
                ),
                "error"
            );

            return false;
        }
    }


    // ========================================
    // LOAD COMPETITIONS
    // ========================================

    async function loadCompetitions() {

        if (!competitionSelect) {
            return;
        }


        competitionSelect.innerHTML = `
            <option value="">
                Loading competitions...
            </option>
        `;


        try {

            const {
                data: competitions,
                error
            } =
                await supabaseClient
                    .from("competitions")
                    .select(`
                        id,
                        name,
                        competition_type,
                        season,
                        status
                    `)
                    .order("name", {
                        ascending: true
                    });


            if (error) {
                throw error;
            }


            competitionSelect.innerHTML = `
                <option value="">
                    Select competition
                </option>
            `;


            (competitions || []).forEach(
                function (competition) {

                    const option =
                        document.createElement("option");

                    option.value =
                        competition.id;

                    option.textContent =
                        competition.name +
                        (
                            competition.season
                                ? " - " +
                                  competition.season
                                : ""
                        );

                    competitionSelect.appendChild(
                        option
                    );
                }
            );


            if (
                !competitions ||
                competitions.length === 0
            ) {

                competitionSelect.innerHTML = `
                    <option value="">
                        No competitions found
                    </option>
                `;
            }

        } catch (error) {

            console.error(
                "LOAD COMPETITIONS ERROR:",
                error
            );

            competitionSelect.innerHTML = `
                <option value="">
                    Unable to load competitions
                </option>
            `;
        }
    }


    // ========================================
    // LOAD APPROVED TEAMS
    // ========================================

    async function loadApprovedTeams() {

        if (
            !homeTeamSelect ||
            !awayTeamSelect
        ) {
            return;
        }


        try {

            const {
                data: teams,
                error
            } =
                await supabaseClient
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


            if (error) {
                throw error;
            }


            homeTeamSelect.innerHTML = `
                <option value="">
                    Select home team
                </option>
            `;

            awayTeamSelect.innerHTML = `
                <option value="">
                    Select away team
                </option>
            `;


            (teams || []).forEach(
                function (team) {

                    const label =
                        team.name +
                        (
                            team.short_name
                                ? " (" +
                                  team.short_name +
                                  ")"
                                : ""
                        );


                    const homeOption =
                        document.createElement(
                            "option"
                        );

                    homeOption.value =
                        team.id;

                    homeOption.textContent =
                        label;

                    homeTeamSelect.appendChild(
                        homeOption
                    );


                    const awayOption =
                        document.createElement(
                            "option"
                        );

                    awayOption.value =
                        team.id;

                    awayOption.textContent =
                        label;

                    awayTeamSelect.appendChild(
                        awayOption
                    );
                }
            );


            if (
                !teams ||
                teams.length === 0
            ) {

                homeTeamSelect.innerHTML = `
                    <option value="">
                        No approved teams
                    </option>
                `;

                awayTeamSelect.innerHTML = `
                    <option value="">
                        No approved teams
                    </option>
                `;
            }

        } catch (error) {

            console.error(
                "LOAD TEAMS ERROR:",
                error
            );

            homeTeamSelect.innerHTML = `
                <option value="">
                    Unable to load teams
                </option>
            `;

            awayTeamSelect.innerHTML = `
                <option value="">
                    Unable to load teams
                </option>
            `;
        }
    }


    // ========================================
    // LOAD VENUES
    // ========================================

    async function loadVenues() {

        if (!venueSelect) {
            return;
        }


        venueSelect.innerHTML = `
            <option value="">
                Loading venues...
            </option>
        `;


        try {

            const {
                data: venues,
                error
            } =
                await supabaseClient
                    .from("venues")
                    .select(`
                        id,
                        name,
                        location
                    `)
                    .order("name", {
                        ascending: true
                    });


            if (error) {
                throw error;
            }


            venueSelect.innerHTML = `
                <option value="">
                    Select venue
                </option>
            `;


            (venues || []).forEach(
                function (venue) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        venue.name;

                    option.textContent =
                        venue.name +
                        (
                            venue.location
                                ? " - " +
                                  venue.location
                                : ""
                        );

                    venueSelect.appendChild(
                        option
                    );
                }
            );


            if (
                !venues ||
                venues.length === 0
            ) {

                venueSelect.innerHTML = `
                    <option value="">
                        No venues found
                    </option>
                `;
            }

        } catch (error) {

            console.error(
                "LOAD VENUES ERROR:",
                error
            );

            venueSelect.innerHTML = `
                <option value="">
                    Unable to load venues
                </option>
            `;
        }
    }


    // ========================================
    // CREATE FIXTURE
    // ========================================

    if (fixtureForm) {

        fixtureForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                showFixtureMessage(
                    "Creating fixture...",
                    ""
                );


                const competitionId =
                    competitionSelect.value;

                const homeTeamId =
                    homeTeamSelect.value;

                const awayTeamId =
                    awayTeamSelect.value;

                const venue =
                    venueSelect.value;

                const matchdayValue =
                    matchday.value.trim();

                const matchDateValue =
                    matchDate.value;

                const kickOffValue =
                    kickOff.value;

                const statusValue =
                    fixtureStatus.value;


                // ========================================
                // VALIDATION
                // ========================================

                if (!competitionId) {

                    showFixtureMessage(
                        "Please select a competition.",
                        "error"
                    );

                    return;
                }


                if (!homeTeamId) {

                    showFixtureMessage(
                        "Please select the home team.",
                        "error"
                    );

                    return;
                }


                if (!awayTeamId) {

                    showFixtureMessage(
                        "Please select the away team.",
                        "error"
                    );

                    return;
                }


                if (
                    homeTeamId ===
                    awayTeamId
                ) {

                    showFixtureMessage(
                        "Home team and away team must be different.",
                        "error"
                    );

                    return;
                }


                if (!matchDateValue) {

                    showFixtureMessage(
                        "Please select the match date.",
                        "error"
                    );

                    return;
                }


                if (!kickOffValue) {

                    showFixtureMessage(
                        "Please select the kick-off time.",
                        "error"
                    );

                    return;
                }


                if (!venue) {

                    showFixtureMessage(
                        "Please select a venue.",
                        "error"
                    );

                    return;
                }


                try {

                    const {
                        error
                    } =
                        await supabaseClient
                            .from("fixtures")
                            .insert({
                                competition_id:
                                    Number(
                                        competitionId
                                    ),

                                home_team_id:
                                    Number(
                                        homeTeamId
                                    ),

                                away_team_id:
                                    Number(
                                        awayTeamId
                                    ),

                                match_date:
                                    matchDateValue,

                                kick_off:
                                    kickOffValue,

                                venue:
                                    venue,

                                matchday:
                                    matchdayValue ||
                                    null,

                                status:
                                    statusValue ||
                                    "Scheduled"
                            });


                    if (error) {
                        throw error;
                    }


                    showFixtureMessage(
                        "✅ Fixture created successfully!",
                        "success"
                    );


                    fixtureForm.reset();


                    await loadFixtures();


                } catch (error) {

                    console.error(
                        "CREATE FIXTURE ERROR:",
                        error
                    );


                    showFixtureMessage(
                        "Unable to create fixture: " +
                        (
                            error.message ||
                            "Unknown error"
                        ),
                        "error"
                    );
                }

            }
        );

    }


    // ========================================
    // LOAD FIXTURES
    // ========================================

    async function loadFixtures() {

        if (!fixturesList) {
            return;
        }


        fixturesList.innerHTML = `
            <div class="empty-message">
                Loading fixtures...
            </div>
        `;


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

                fixturesList.innerHTML = `
                    <div class="empty-message">
                        No fixtures have been created yet.
                    </div>
                `;

                return;
            }


            // ========================================
            // GET TEAM NAMES
            // ========================================

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


            let teamsMap = {};


            if (teamIds.length > 0) {

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


                (teams || []).forEach(
                    function (team) {

                        teamsMap[team.id] =
                            team;
                    }
                );
            }


            // ========================================
            // GET COMPETITION NAMES
            // ========================================

            const competitionIds = [
                ...new Set(
                    fixtures.map(
                        function (fixture) {
                            return fixture.competition_id;
                        }
                    )
                )
            ];


            let competitionsMap = {};


            if (
                competitionIds.length > 0
            ) {

                const {
                    data: competitions,
                    error: competitionsError
                } =
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


                if (competitionsError) {
                    throw competitionsError;
                }


                (competitions || []).forEach(
                    function (competition) {

                        competitionsMap[
                            competition.id
                        ] = competition;
                    }
                );
            }


            // ========================================
            // DISPLAY FIXTURES
            // ========================================

            fixturesList.innerHTML = "";


            fixtures.forEach(
                function (fixture) {

                    const homeTeam =
                        teamsMap[
                            fixture.home_team_id
                        ];

                    const awayTeam =
                        teamsMap[
                            fixture.away_team_id
                        ];

                    const competition =
                        competitionsMap[
                            fixture.competition_id
                        ];


                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "admin-card";


                    card.innerHTML = `

                        <div style="
                            display:flex;
                            justify-content:space-between;
                            gap:15px;
                            flex-wrap:wrap;
                        ">

                            <div>

                                <h3>
                                    ⚽
                                    ${escapeHtml(
                                        homeTeam
                                            ? homeTeam.name
                                            : "Unknown Team"
                                    )}
                                    vs
                                    ${escapeHtml(
                                        awayTeam
                                            ? awayTeam.name
                                            : "Unknown Team"
                                    )}
                                </h3>

                                <p>
                                    🏆
                                    ${escapeHtml(
                                        competition
                                            ? competition.name
                                            : "Unknown Competition"
                                    )}
                                    ${
                                        competition &&
                                        competition.season
                                            ? " - " +
                                              escapeHtml(
                                                  competition.season
                                              )
                                            : ""
                                    }
                                </p>

                                <p>
                                    📅
                                    ${formatDate(
                                        fixture.match_date
                                    )}
                                    &nbsp;
                                    ⏰
                                    ${formatTime(
                                        fixture.kick_off
                                    )}
                                </p>

                                <p>
                                    📍
                                    ${escapeHtml(
                                        fixture.venue ||
                                        "-"
                                    )}
                                </p>

                                <p>
                                    🔢
                                    ${escapeHtml(
                                        fixture.matchday ||
                                        "Matchday not set"
                                    )}
                                </p>

                                <p>
                                    📢
                                    <strong>
                                        ${escapeHtml(
                                            fixture.status ||
                                            "-"
                                        )}
                                    </strong>
                                </p>

                            </div>


                            <div style="
                                display:flex;
                                align-items:center;
                            ">

                                <button
                                    class="admin-btn delete-fixture-btn"
                                    data-fixture-id="${fixture.id}">
                                    🗑️ Delete
                                </button>

                            </div>

                        </div>
                    `;


                    fixturesList.appendChild(
                        card
                    );


                    const deleteButton =
                        card.querySelector(
                            ".delete-fixture-btn"
                        );


                    if (deleteButton) {

                        deleteButton.addEventListener(
                            "click",
                            function () {

                                deleteFixture(
                                    fixture.id
                                );

                            }
                        );
                    }

                }
            );


        } catch (error) {

            console.error(
                "LOAD FIXTURES ERROR:",
                error
            );


            fixturesList.innerHTML = `
                <div class="admin-card">

                    <h3>
                        ❌ Unable to Load Fixtures
                    </h3>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Something went wrong."
                        )}
                    </p>

                </div>
            `;
        }
    }


    // ========================================
    // DELETE FIXTURE
    // ========================================

    async function deleteFixture(
        fixtureId
    ) {

        if (
            !confirm(
                "Are you sure you want to delete this fixture?"
            )
        ) {
            return;
        }


        try {

            const {
                error
            } =
                await supabaseClient
                    .from("fixtures")
                    .delete()
                    .eq(
                        "id",
                        fixtureId
                    );


            if (error) {
                throw error;
            }


            alert(
                "Fixture deleted successfully."
            );


            await loadFixtures();

        } catch (error) {

            console.error(
                "DELETE FIXTURE ERROR:",
                error
            );


            alert(
                "Unable to delete fixture: " +
                (
                    error.message ||
                    "Unknown error"
                )
            );
        }
    }


    // ========================================
    // LOAD PENDING TEAMS
    // ========================================

    async function loadPendingTeams() {

        if (!pendingTeams) {
            return;
        }


        pendingTeams.innerHTML = `
            <div class="empty-message">
                Loading registrations...
            </div>
        `;


        try {

            const {
                data: teams,
                error
            } =
                await supabaseClient
                    .from("teams")
                    .select(`
                        id,
                        name,
                        short_name,
                        logo_url,
                        location,
                        coach_name,
                        captain_name,
                        vice_captain_name,
                        discipline_master_name,
                        phone,
                        email,
                        registration_status,
                        created_at
                    `)
                    .eq(
                        "registration_status",
                        "Pending"
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            if (error) {
                throw error;
            }


            if (
                !teams ||
                teams.length === 0
            ) {

                pendingTeams.innerHTML = `
                    <div class="empty-message">
                        🎉 No pending team registrations.
                    </div>
                `;

                return;
            }


            pendingTeams.innerHTML = "";


            // ========================================
            // LOAD PLAYERS FOR ALL TEAMS
            // ========================================

            const teamIds =
                teams.map(
                    function (team) {
                        return team.id;
                    }
                );


            const {
                data: players,
                error: playersError
            } =
                await supabaseClient
                    .from("players")
                    .select(`
                        id,
                        team_id,
                        full_name,
                        jersey_number,
                        position,
                        photo_url,
                        registration_status
                    `)
                    .in(
                        "team_id",
                        teamIds
                    )
                    .order(
                        "jersey_number",
                        {
                            ascending: true
                        }
                    );


            if (playersError) {
                throw playersError;
            }


            // ========================================
            // GROUP PLAYERS BY TEAM
            // ========================================

            const playersByTeam = {};


            (players || []).forEach(
                function (player) {

                    if (
                        !playersByTeam[
                            player.team_id
                        ]
                    ) {

                        playersByTeam[
                            player.team_id
                        ] = [];
                    }


                    playersByTeam[
                        player.team_id
                    ].push(player);
                }
            );


            // ========================================
            // DISPLAY TEAMS
            // ========================================

            teams.forEach(
                function (team) {

                    const teamPlayers =
                        playersByTeam[
                            team.id
                        ] || [];


                    let playersHTML = "";


                    if (
                        teamPlayers.length === 0
                    ) {

                        playersHTML = `
                            <p>
                                No players registered.
                            </p>
                        `;

                    } else {

                        playersHTML = `
                            <div style="
                                overflow-x:auto;
                            ">

                                <table style="
                                    width:100%;
                                    border-collapse:collapse;
                                ">

                                    <thead>

                                        <tr>

                                            <th style="padding:8px;">
                                                #
                                            </th>

                                            <th style="padding:8px;">
                                                Player
                                            </th>

                                            <th style="padding:8px;">
                                                Position
                                            </th>

                                            <th style="padding:8px;">
                                                Status
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        ${teamPlayers.map(
                                            function (
                                                player
                                            ) {

                                                return `
                                                    <tr>

                                                        <td style="padding:8px;">
                                                            ${escapeHtml(
                                                                player.jersey_number
                                                            )}
                                                        </td>

                                                        <td style="padding:8px;">
                                                            ${escapeHtml(
                                                                player.full_name
                                                            )}
                                                        </td>

                                                        <td style="padding:8px;">
                                                            ${escapeHtml(
                                                                player.position ||
                                                                "-"
                                                            )}
                                                        </td>

                                                        <td style="padding:8px;">
                                                            ${escapeHtml(
                                                                player.registration_status ||
                                                                "-"
                                                            )}
                                                        </td>

                                                    </tr>
                                                `;
                                            }
                                        ).join("")}

                                    </tbody>

                                </table>

                            </div>
                        `;
                    }


                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "admin-card";


                    card.innerHTML = `

                        <div>

                            <h2>
                                ⚽
                                ${escapeHtml(
                                    team.name
                                )}
                            </h2>

                            <p>
                                <strong>
                                    Short Name:
                                </strong>
                                ${escapeHtml(
                                    team.short_name ||
                                    "-"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Location:
                                </strong>
                                ${escapeHtml(
                                    team.location ||
                                    "-"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Registration Status:
                                </strong>
                                ${escapeHtml(
                                    team.registration_status ||
                                    "-"
                                )}
                            </p>

                        </div>


                        <div style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(
                                        200px,
                                        1fr
                                    )
                                );
                            gap:15px;
                            margin-top:15px;
                        ">

                            <div class="detail">

                                <strong>
                                    Coach
                                </strong>

                                <br>

                                ${escapeHtml(
                                    team.coach_name ||
                                    "-"
                                )}

                            </div>


                            <div class="detail">

                                <strong>
                                    Captain
                                </strong>

                                <br>

                                ${escapeHtml(
                                    team.captain_name ||
                                    "-"
                                )}

                            </div>


                            <div class="detail">

                                <strong>
                                    Vice Captain
                                </strong>

                                <br>

                                ${escapeHtml(
                                    team.vice_captain_name ||
                                    "-"
                                )}

                            </div>


                            <div class="detail">

                                <strong>
                                    Discipline Master
                                </strong>

                                <br>

                                ${escapeHtml(
                                    team.discipline_master_name ||
                                    "-"
                                )}

                            </div>


                            <div class="detail">

                                <strong>
                                    Phone
                                </strong>

                                <br>

                                ${escapeHtml(
                                    team.phone ||
                                    "-"
                                )}

                            </div>


                            <div class="detail">

                                <strong>
                                    Email
                                </strong>

                                <br>

                                ${escapeHtml(
                                    team.email ||
                                    "-"
                                )}

                            </div>

                        </div>


                        <h3 style="margin-top:20px;">
                            👥 Players
                            (${teamPlayers.length}/20)
                        </h3>


                        ${playersHTML}


                        <div style="
                            margin-top:20px;
                            display:flex;
                            gap:10px;
                            flex-wrap:wrap;
                        ">

                            <button
                                class="admin-btn approve-btn"
                                data-team-id="${team.id}">
                                ✅ Approve Team
                            </button>


                            <button
                                class="admin-btn reject-btn"
                                data-team-id="${team.id}">
                                ❌ Reject Team
                            </button>

                        </div>

                    `;


                    pendingTeams.appendChild(
                        card
                    );


                    const approveButton =
                        card.querySelector(
                            ".approve-btn"
                        );


                    const rejectButton =
                        card.querySelector(
                            ".reject-btn"
                        );


                    if (approveButton) {

                        approveButton.addEventListener(
                            "click",
                            function () {

                                approveTeam(
                                    team.id
                                );

                            }
                        );
                    }


                    if (rejectButton) {

                        rejectButton.addEventListener(
                            "click",
                            function () {

                                rejectTeam(
                                    team.id
                                );

                            }
                        );
                    }

                }
            );


        } catch (error) {

            console.error(
                "LOAD PENDING TEAMS ERROR:",
                error
            );


            pendingTeams.innerHTML = `
                <div class="admin-card">

                    <h3>
                        ❌ Unable to Load Registrations
                    </h3>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Something went wrong."
                        )}
                    </p>

                </div>
            `;
        }
    }


    // ========================================
    // APPROVE TEAM
    // ========================================

    async function approveTeam(
        teamId
    ) {

        if (
            !confirm(
                "Approve this team and all its players?"
            )
        ) {
            return;
        }


        try {

            const {
                error: teamError
            } =
                await supabaseClient
                    .from("teams")
                    .update({
                        registration_status:
                            "Approved"
                    })
                    .eq(
                        "id",
                        teamId
                    );


            if (teamError) {
                throw teamError;
            }


            const {
                error: playersError
            } =
                await supabaseClient
                    .from("players")
                    .update({
                        registration_status:
                            "Approved"
                    })
                    .eq(
                        "team_id",
                        teamId
                    );


            if (playersError) {
                throw playersError;
            }


            alert(
                "Team approved successfully!"
            );


            await loadPendingTeams();
            await loadApprovedTeams();

        } catch (error) {

            console.error(
                "APPROVE ERROR:",
                error
            );


            alert(
                "Unable to approve team: " +
                (
                    error.message ||
                    "Unknown error"
                )
            );
        }
    }


    // ========================================
    // REJECT TEAM
    // ========================================

    async function rejectTeam(
        teamId
    ) {

        if (
            !confirm(
                "Reject this team registration?"
            )
        ) {
            return;
        }


        try {

            const {
                error: teamError
            } =
                await supabaseClient
                    .from("teams")
                    .update({
                        registration_status:
                            "Rejected"
                    })
                    .eq(
                        "id",
                        teamId
                    );


            if (teamError) {
                throw teamError;
            }


            const {
                error: playersError
            } =
                await supabaseClient
                    .from("players")
                    .update({
                        registration_status:
                            "Rejected"
                    })
                    .eq(
                        "team_id",
                        teamId
                    );


            if (playersError) {
                throw playersError;
            }


            alert(
                "Team registration rejected."
            );


            await loadPendingTeams();

        } catch (error) {

            console.error(
                "REJECT ERROR:",
                error
            );


            alert(
                "Unable to reject team: " +
                (
                    error.message ||
                    "Unknown error"
                )
            );
        }
    }


    // ========================================
    // FORMAT DATE
    // ========================================

    function formatDate(
        dateString
    ) {

        if (!dateString) {
            return "-";
        }


        const date =
            new Date(
                dateString +
                "T00:00:00"
            );


        return date.toLocaleDateString(
            "en-KE",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    // ========================================
    // FORMAT TIME
    // ========================================

    function formatTime(
        timeString
    ) {

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


    // ========================================
    // ESCAPE HTML
    // ========================================

    function escapeHtml(
        value
    ) {

        return String(value)
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


    // ========================================
    // START DASHBOARD
    // ========================================

    async function startDashboard() {

        console.log(
            "Kabaru Ward Football Admin JS started."
        );


        const isAdmin =
            await checkAdmin();


        if (!isAdmin) {
            return;
        }


        await loadCompetitions();

        await loadApprovedTeams();

        await loadVenues();

        await loadFixtures();

        await loadPendingTeams();


        console.log(
            "Kabaru Ward Football Admin Dashboard loaded."
        );
    }


    // ========================================
    // START
    // ========================================

    startDashboard();

});                                               <tr>

                                                    <td>
                                                        ${index + 1}
                                                    </td>

                                                    <td>
                                                        ${escapeHtml(
                                                            player.full_name
                                                        )}
                                                    </td>

                                                    <td>
                                                        ${player.jersey_number}
                                                    </td>

                                                    <td>
                                                        ${escapeHtml(
                                                            player.position
                                                        )}
                                                    </td>

                                                    <td>
                                                        ${escapeHtml(
                                                            player.registration_status
                                                        )}
                                                    </td>

                                                </tr>
                                            `;
                                        }
                                    ).join("")}

                                </tbody>

                            </table>
                        `;

                    } else {

                        playersHTML =
                            "<p>No players found.</p>";
                    }


                    card.innerHTML = `

                        <h2>
                            ⚽ ${escapeHtml(
                                team.name
                            )}
                        </h2>

                        <p>
                            <strong>Status:</strong>
                            ${escapeHtml(
                                team.registration_status
                            )}
                        </p>


                        <div class="team-details">

                            <div class="detail">
                                <strong>Short Name</strong><br>
                                ${escapeHtml(
                                    team.short_name ||
                                    "-"
                                )}
                            </div>

                            <div class="detail">
                                <strong>Location</strong><br>
                                ${escapeHtml(
                                    team.location ||
                                    "-"
                                )}
                            </div>

                            <div class="detail">
                                <strong>Coach</strong><br>
                                ${escapeHtml(
                                    team.coach_name ||
                                    "-"
                                )}
                            </div>

                            <div class="detail">
                                <strong>Captain</strong><br>
                                ${escapeHtml(
                                    team.captain_name ||
                                    "-"
                                )}
                            </div>

                            <div class="detail">
                                <strong>Vice Captain</strong><br>
                                ${escapeHtml(
                                    team.vice_captain_name ||
                                    "-"
                                )}
                            </div>

                            <div class="detail">
                                <strong>Discipline Master</strong><br>
                                ${escapeHtml(
                                    team.discipline_master_name ||
                                    "-"
                                )}
                            </div>

                            <div class="detail">
                                <strong>Phone</strong><br>
                                ${escapeHtml(
                                    team.phone ||
                                    "-"
                                )}
                            </div>

                            <div class="detail">
                                <strong>Email</strong><br>
                                ${escapeHtml(
                                    team.email ||
                                    "-"
                                )}
                            </div>

                        </div>


                        <h3>
                            👥 Players
                            (${players.length}/20)
                        </h3>

                        ${playersHTML}


                        <div style="margin-top:20px;">

                            <button
                                class="admin-btn approve-btn"
                                data-team-id="${team.id}">
                                ✅ Approve Team
                            </button>


                            <button
                                class="admin-btn reject-btn"
                                data-team-id="${team.id}">
                                ❌ Reject Team
                            </button>

                        </div>
                    `;


                    pendingTeams.appendChild(
                        card
                    );


                    card
                        .querySelector(
                            ".approve-btn"
                        )
                        .addEventListener(
                            "click",
                            function () {

                                approveTeam(
                                    team.id
                                );
                            }
                        );


                    card
                        .querySelector(
                            ".reject-btn"
                        )
                        .addEventListener(
                            "click",
                            function () {

                                rejectTeam(
                                    team.id
                                );
                            }
                        );
                }
            );


        } catch (error) {

            console.error(
                "LOAD TEAMS ERROR:",
                error
            );


            pendingTeams.innerHTML = `

                <div class="admin-card">

                    <h3>
                        ❌ Unable to Load Registrations
                    </h3>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Something went wrong."
                        )}
                    </p>

                </div>
            `;
        }
    }


    // ========================================
    // APPROVE TEAM
    // ========================================

    async function approveTeam(
        teamId
    ) {

        if (
            !confirm(
                "Approve this team and all its players?"
            )
        ) {
            return;
        }


        try {

            const {
                error: teamError
            } =
                await supabaseClient
                    .from("teams")
                    .update({
                        registration_status:
                            "Approved"
                    })
                    .eq(
                        "id",
                        teamId
                    );


            if (teamError) {
                throw teamError;
            }


            const {
                error: playersError
            } =
                await supabaseClient
                    .from("players")
                    .update({
                        registration_status:
                            "Approved"
                    })
                    .eq(
                        "team_id",
                        teamId
                    );


            if (playersError) {
                throw playersError;
            }


            alert(
                "Team approved successfully!"
            );


            await loadPendingTeams();
            await loadApprovedTeams();


        } catch (error) {

            console.error(
                "APPROVE ERROR:",
                error
            );


            alert(
                "Unable to approve team: " +
                error.message
            );
        }
    }


    // ========================================
    // REJECT TEAM
    // ========================================

    async function rejectTeam(
        teamId
    ) {

        if (
            !confirm(
                "Reject this team registration?"
            )
        ) {
            return;
        }


        try {

            const {
                error: teamError
            } =
                await supabaseClient
                    .from("teams")
                    .update({
                        registration_status:
                            "Rejected"
                    })
                    .eq(
                        "id",
                        teamId
                    );


            if (teamError) {
                throw teamError;
            }


            const {
                error: playersError
            } =
                await supabaseClient
                    .from("players")
                    .update({
                        registration_status:
                            "Rejected"
                    })
                    .eq(
                        "team_id",
                        teamId
                    );


            if (playersError) {
                throw playersError;
            }


            alert(
                "Team registration rejected."
            );


            await loadPendingTeams();


        } catch (error) {

            console.error(
                "REJECT ERROR:",
                error
            );


            alert(
                "Unable to reject team: " +
                error.message
            );
        }
    }


    // ========================================
    // FORMAT DATE
    // ========================================

    function formatDate(
        dateString
    ) {

        if (!dateString) {
            return "-";
        }


        const date =
            new Date(
                dateString +
                "T00:00:00"
            );


        return date.toLocaleDateString(
            "en-KE",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    // ========================================
    // FORMAT TIME
    // ========================================

    function formatTime(
        timeString
    ) {

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


    // ========================================
    // ESCAPE HTML
    // ========================================

    function escapeHtml(
        value
    ) {

        return String(value)
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


    // ========================================
    // START DASHBOARD
    // ========================================

    async function startDashboard() {

        console.log(
            "Kabaru Ward Football Admin JS started."
        );


        const isAdmin =
            await checkAdmin();


        if (!isAdmin) {
            return;
        }


        // Run each loader independently.
        // If one fails, the others can still work.

        await loadCompetitions();

        await loadApprovedTeams();

        await loadVenues();

        await loadFixtures();

        await loadPendingTeams();


        console.log(
            "Kabaru Ward Football Admin Dashboard loaded."
        );
    }


    // ========================================
    // START
    // ========================================

    startDashboard();

});
```
