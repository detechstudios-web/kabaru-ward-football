// ========================================
// KABARU WARD FOOTBALL
// ADMIN DASHBOARD
// ========================================

document.addEventListener("DOMContentLoaded", async function () {

    // ========================================
    // MAIN ELEMENTS
    // ========================================

    const pendingTeams =
        document.getElementById("pendingTeams");

    const approvedTeams =
        document.getElementById("approvedTeams");

    const competitionSelect =
        document.getElementById("competitionSelect");

    const homeTeamSelect =
        document.getElementById("homeTeamSelect");

    const awayTeamSelect =
        document.getElementById("awayTeamSelect");

    const fixtureDate =
        document.getElementById("fixtureDate");

    const kickOff =
        document.getElementById("kickOff");

    const venueSelect =
        document.getElementById("venueSelect");

    const matchday =
        document.getElementById("matchday");

    const fixtureStatus =
        document.getElementById("fixtureStatus");

    const createFixtureBtn =
        document.getElementById("createFixtureBtn");

    const fixturesList =
        document.getElementById("fixturesList");

    const resultFixtureSelect =
        document.getElementById("resultFixtureSelect");

    const homeScore =
        document.getElementById("homeScore");

    const awayScore =
        document.getElementById("awayScore");

    const matchReport =
        document.getElementById("matchReport");

    const saveResultBtn =
        document.getElementById("saveResultBtn");

    const resultScoreSection =
        document.getElementById("resultScoreSection");

    const selectedFixtureInfo =
        document.getElementById("selectedFixtureInfo");

    const homeGoalsContainer =
        document.getElementById("homeGoalsContainer");

    const awayGoalsContainer =
        document.getElementById("awayGoalsContainer");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const competitionForm =
        document.getElementById("competitionForm");

    const competitionName =
        document.getElementById("competitionName");

    const competitionType =
        document.getElementById("competitionType");

    const competitionSeason =
        document.getElementById("competitionSeason");

    const competitionStartDate =
        document.getElementById("competitionStartDate");

    const competitionEndDate =
        document.getElementById("competitionEndDate");

    const competitionStatus =
        document.getElementById("competitionStatus");

    const competitionDescription =
        document.getElementById("competitionDescription");

    const competitionsList =
        document.getElementById("competitionsList");

    const venueForm =
        document.getElementById("venueForm");

    const venueName =
        document.getElementById("venueName");

    const venuesList =
        document.getElementById("venuesList");

    // ========================================
    // GLOBAL DATA
    // ========================================

    let competitions = [];
    let teams = [];
    let venues = [];
    let fixtures = [];

    let currentFixture = null;

    let homePlayers = [];
    let awayPlayers = [];

    // ========================================
    // SUPABASE CHECK
    // ========================================

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        console.error(
            "Supabase client is not available."
        );

        alert(
            "Supabase connection is not available."
        );

        return;
    }

    // ========================================
    // ADMIN CHECK
    // ========================================

    async function checkAdmin() {

        try {

            const {
                data: {
                    user
                },
                error
            } =
                await supabaseClient
                    .auth
                    .getUser();

            if (error) {
                throw error;
            }

            if (!user) {

                console.warn(
                    "No authenticated user."
                );

                window.location.href =
                    "admin-login.html";

                return false;
            }

            // ========================================
            // CHECK ADMIN ROLE
            // ========================================

            const {
                data: profile,
                error: profileError
            } =
                await supabaseClient
                    .from("profiles")
                    .select(
                        "id, email, role"
                    )
                    .eq(
                        "id",
                        user.id
                    )
                    .single();

            if (profileError) {

                console.error(
                    "Profile check error:",
                    profileError
                );

                alert(
                    "Unable to verify administrator access."
                );

                return false;
            }

            if (
                !profile ||
                profile.role !== "admin"
            ) {

                console.warn(
                    "User is not an administrator."
                );

                alert(
                    "Administrator access required."
                );

                await supabaseClient
                    .auth
                    .signOut();

                window.location.href =
                    "admin-login.html";

                return false;
            }

            console.log(
                "Admin check passed. Loading dashboard data."
            );

            return true;

        } catch (error) {

            console.error(
                "Admin check error:",
                error
            );

            alert(
                "Unable to verify administrator access."
            );

            return false;
        }
    }

    // ========================================
    // LOGOUT
    // ========================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async function () {

                try {

                    await supabaseClient
                        .auth
                        .signOut();

                    window.location.href =
                        "admin-login.html";

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    alert(
                        "Unable to logout."
                    );
                }

            }
        );
    }

    // ========================================
    // LOAD COMPETITIONS
    // ========================================

    async function loadCompetitions() {

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("competitions")
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );

            if (error) {
                throw error;
            }

            competitions =
                data || [];

            // ========================================
            // COMPETITION SELECT
            // ========================================

            if (competitionSelect) {

                competitionSelect.innerHTML =
                    "<option value=''>" +
                    "Select competition" +
                    "</option>";

                competitions.forEach(
                    function (competition) {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            competition.id;

                        option.textContent =
                            competition.name +
                            " — " +
                            competition.season;

                        competitionSelect
                            .appendChild(
                                option
                            );
                    }
                );
            }

            // ========================================
            // COMPETITION LIST
            // ========================================

            if (competitionsList) {

                competitionsList.innerHTML =
                    "";

                if (
                    competitions.length ===
                    0
                ) {

                    competitionsList.innerHTML =
                        "<div class='empty-message'>" +
                        "No competitions found." +
                        "</div>";

                } else {

                    competitions.forEach(
                        function (competition) {

                            const card =
                                document.createElement(
                                    "div"
                                );

                            card.className =
                                "admin-card";

                            card.innerHTML = `

                                <h3>
                                    🏆
                                    ${escapeHtml(
                                        competition.name
                                    )}
                                </h3>

                                <p>
                                    <strong>Type:</strong>
                                    ${escapeHtml(
                                        competition.competition_type ||
                                        "-"
                                    )}
                                </p>

                                <p>
                                    <strong>Season:</strong>
                                    ${escapeHtml(
                                        competition.season ||
                                        "-"
                                    )}
                                </p>

                                <p>
                                    <strong>Start:</strong>
                                    ${formatDate(
                                        competition.start_date
                                    )}
                                </p>

                                <p>
                                    <strong>End:</strong>
                                    ${formatDate(
                                        competition.end_date
                                    )}
                                </p>

                                <p>
                                    <strong>Status:</strong>
                                    ${escapeHtml(
                                        competition.status ||
                                        "-"
                                    )}
                                </p>

                                <p>
                                    <strong>Description:</strong>
                                    ${escapeHtml(
                                        competition.description ||
                                        "-"
                                    )}
                                </p>

                            `;

                            competitionsList
                                .appendChild(
                                    card
                                );
                        }
                    );
                }
            }

        } catch (error) {

            console.error(
                "Competition loading error:",
                error
            );

            if (competitionsList) {

                competitionsList.innerHTML =
                    "<div class='empty-message'>" +
                    "Unable to load competitions." +
                    "</div>";
            }
        }
    }

    // ========================================
    // CREATE COMPETITION
    // ========================================

    if (competitionForm) {

        competitionForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                try {

                    const name =
                        competitionName
                            ? competitionName.value.trim()
                            : "";

                    const type =
                        competitionType
                            ? competitionType.value
                            : "";

                    const season =
                        competitionSeason
                            ? competitionSeason.value.trim()
                            : "";

                    const startDate =
                        competitionStartDate
                            ? competitionStartDate.value
                            : null;

                    const endDate =
                        competitionEndDate
                            ? competitionEndDate.value
                            : null;

                    const status =
                        competitionStatus
                            ? competitionStatus.value
                            : "Upcoming";

                    const description =
                        competitionDescription
                            ? competitionDescription.value.trim()
                            : "";

                    if (!name) {

                        alert(
                            "Please enter competition name."
                        );

                        return;
                    }

                    if (!type) {

                        alert(
                            "Please select competition type."
                        );

                        return;
                    }

                    if (!season) {

                        alert(
                            "Please enter season."
                        );

                        return;
                    }

                    const {
                        error
                    } =
                        await supabaseClient
                            .from("competitions")
                            .insert([
                                {
                                    name:
                                        name,

                                    competition_type:
                                        type,

                                    season:
                                        season,

                                    start_date:
                                        startDate,

                                    end_date:
                                        endDate,

                                    status:
                                        status,

                                    description:
                                        description
                                }
                            ]);

                    if (error) {
                        throw error;
                    }

                    alert(
                        "✅ Competition created successfully!"
                    );

                    competitionForm.reset();

                    await loadCompetitions();

                } catch (error) {

                    console.error(
                        "Create competition error:",
                        error
                    );

                    alert(
                        "Unable to create competition: " +
                        (
                            error.message ||
                            "Unknown error"
                        )
                    );
                }

            }
        );
    }

    // ========================================
    // LOAD APPROVED TEAMS
    // ========================================

    async function loadApprovedTeams() {

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("teams")
                    .select(
                        `
                        id,
                        name,
                        short_name,
                        logo_url,
                        location,
                        coach_name,
                        captain_name,
                        vice_captain_name,
                        discipline_master_name,
                        registration_status
                        `
                    )
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

            teams =
                data || [];

            // ========================================
            // HOME TEAM SELECT
            // ========================================

            if (homeTeamSelect) {

                homeTeamSelect.innerHTML =
                    "<option value=''>" +
                    "Select home team" +
                    "</option>";

                teams.forEach(
                    function (team) {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            team.id;

                        option.textContent =
                            team.name;

                        homeTeamSelect
                            .appendChild(
                                option
                            );
                    }
                );
            }

            // ========================================
            // AWAY TEAM SELECT
            // ========================================

            if (awayTeamSelect) {

                awayTeamSelect.innerHTML =
                    "<option value=''>" +
                    "Select away team" +
                    "</option>";

                teams.forEach(
                    function (team) {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            team.id;

                        option.textContent =
                            team.name;

                        awayTeamSelect
                            .appendChild(
                                option
                            );
                    }
                );
            }

            // ========================================
            // APPROVED TEAMS LIST
            // ========================================

            if (approvedTeams) {

                approvedTeams.innerHTML =
                    "";

                if (
                    teams.length ===
                    0
                ) {

                    approvedTeams.innerHTML =
                        "<div class='empty-message'>" +
                        "No approved teams found." +
                        "</div>";

                } else {

                    teams.forEach(
                        function (team) {

                            const card =
                                document.createElement(
                                    "div"
                                );

                            card.className =
                                "admin-card";

                            card.innerHTML = `

                                <div
                                    style="
                                        display:flex;
                                        align-items:center;
                                        gap:15px;
                                        margin-bottom:15px;
                                    "
                                >

                                    ${
                                        team.logo_url
                                            ? `
                                                <img
                                                    src="${escapeHtml(
                                                        team.logo_url
                                                    )}"
                                                    alt="Team logo"
                                                    style="
                                                        width:70px;
                                                        height:70px;
                                                        object-fit:cover;
                                                        border-radius:50%;
                                                        border:3px solid #f5c542;
                                                    "
                                                >
                                              `
                                            : `
                                                <div
                                                    style="
                                                        width:70px;
                                                        height:70px;
                                                        border-radius:50%;
                                                        display:flex;
                                                        align-items:center;
                                                        justify-content:center;
                                                        background:#075b35;
                                                        color:white;
                                                        font-size:30px;
                                                        border:3px solid #f5c542;
                                                    "
                                                >
                                                    ⚽
                                                </div>
                                              `
                                    }

                                    <div>

                                        <h3>
                                            ${escapeHtml(
                                                team.name
                                            )}
                                        </h3>

                                        <p>
                                            ${escapeHtml(
                                                team.short_name ||
                                                "-"
                                            )}
                                        </p>

                                    </div>

                                </div>

                                <p>
                                    📍
                                    ${escapeHtml(
                                        team.location ||
                                        "-"
                                    )}
                                </p>

                                <p>
                                    👨‍🏫 Coach:
                                    ${escapeHtml(
                                        team.coach_name ||
                                        "-"
                                    )}
                                </p>

                                <p>
                                    🧑‍✈️ Captain:
                                    ${escapeHtml(
                                        team.captain_name ||
                                        "-"
                                    )}
                                </p>

                                <p>
                                    🔰 Vice Captain:
                                    ${escapeHtml(
                                        team.vice_captain_name ||
                                        "-"
                                    )}
                                </p>

                                <p>
                                    🛡️ Discipline Master:
                                    ${escapeHtml(
                                        team.discipline_master_name ||
                                        "-"
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Status:
                                    </strong>
                                    Approved
                                </p>

                            `;

                            approvedTeams
                                .appendChild(
                                    card
                                );
                        }
                    );
                }
            }

        } catch (error) {

            console.error(
                "Approved teams loading error:",
                error
            );

            if (approvedTeams) {

                approvedTeams.innerHTML =
                    "<div class='empty-message'>" +
                    "Unable to load approved teams." +
                    "</div>";
            }
        }
    }

    // ========================================
    // LOAD VENUES
    // ========================================

    async function loadVenues() {

        if (!venueSelect) {
            return;
        }

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("venues")
                    .select("*")
                    .order(
                        "name",
                        {
                            ascending: true
                        }
                    );

            if (error) {
                throw error;
            }

            venues =
                data || [];

            venueSelect.innerHTML =
                "<option value=''>" +
                "Select venue" +
                "</option>";

            venues.forEach(
                function (venue) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        venue.name;

                    option.textContent =
                        venue.name;

                    venueSelect
                        .appendChild(
                            option
                        );
                });

        } catch (error) {

            console.error(
                "Venue loading error:",
                error
            );

            venueSelect.innerHTML =
                "<option value=''>" +
                "Unable to load venues" +
                "</option>";
        }
    }

    // ========================================
    // CREATE VENUE
    // ========================================

    if (venueForm) {

        venueForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                try {

                    const name =
                        venueName
                            ? venueName.value.trim()
                            : "";

                    if (!name) {

                        alert(
                            "Please enter venue name."
                        );

                        return;
                    }

                    const {
                        error
                    } =
                        await supabaseClient
                            .from("venues")
                            .insert([
                                {
                                    name:
                                        name
                                }
                            ]);

                    if (error) {
                        throw error;
                    }

                    alert(
                        "✅ Venue created successfully!"
                    );

                    venueForm.reset();

                    await loadVenues();

                } catch (error) {

                    console.error(
                        "Create venue error:",
                        error
                    );

                    alert(
                        "Unable to create venue: " +
                        (
                            error.message ||
                            "Unknown error"
                        )
                    );
                }

            }
        );
    }
                            document.createElement(
                            "option"
                        );


                    homeOption.value =
                        team.id;


                    homeOption.textContent =
                        name;


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
                        name;


                    awayTeamSelect.appendChild(
                        awayOption
                    );

                }
            );


        } catch (error) {

            console.error(
                "Team loading error:",
                error
            );


            homeTeamSelect.innerHTML =
                "<option value=''>Unable to load teams</option>";

            awayTeamSelect.innerHTML =
                "<option value=''>Unable to load teams</option>";
        }
    }


    // ========================================
    // LOAD VENUES
    // ========================================

    async function loadVenues() {

        if (!venueSelect) {
            return;
        }


        venueSelect.innerHTML =
            "<option value=''>Loading venues...</option>";


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("venues")
                    .select(
                        "id, name, location"
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


            venueSelect.innerHTML =
                "<option value=''>Select venue</option>";


            if (
                !data ||
                data.length === 0
            ) {

                venueSelect.innerHTML =
                    "<option value=''>No venues found</option>";

                return;
            }


            data.forEach(
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


        } catch (error) {

            console.error(
                "Venue loading error:",
                error
            );


            venueSelect.innerHTML =
                "<option value=''>Unable to load venues</option>";
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


                const competitionId =
                    competitionSelect
                        ? competitionSelect.value
                        : "";


                const homeTeamId =
                    homeTeamSelect
                        ? homeTeamSelect.value
                        : "";


                const awayTeamId =
                    awayTeamSelect
                        ? awayTeamSelect.value
                        : "";


                const venue =
                    venueSelect
                        ? venueSelect.value
                        : "";


                const matchdayValue =
                    matchday
                        ? matchday.value.trim()
                        : "";


                const matchDateValue =
                    matchDate
                        ? matchDate.value
                        : "";


                const kickOffValue =
                    kickOff
                        ? kickOff.value
                        : "";


                const statusValue =
                    fixtureStatus
                        ? fixtureStatus.value
                        : "Scheduled";


                if (!competitionId) {

                    showFixtureMessage(
                        "Please select a competition.",
                        "error"
                    );

                    return;
                }


                if (!homeTeamId) {

                    showFixtureMessage(
                        "Please select a home team.",
                        "error"
                    );

                    return;
                }


                if (!awayTeamId) {

                    showFixtureMessage(
                        "Please select an away team.",
                        "error"
                    );

                    return;
                }


                if (
                    homeTeamId ===
                    awayTeamId
                ) {

                    showFixtureMessage(
                        "Home and away teams must be different.",
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

                    showFixtureMessage(
                        "Creating fixture...",
                        ""
                    );


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

                    await loadResultFixtures();


                } catch (error) {

                    console.error(
                        "Create fixture error:",
                        error
                    );


                    showFixtureMessage(
                        "❌ Unable to create fixture: " +
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


        fixturesList.innerHTML =
            "<div class='empty-message'>" +
            "Loading fixtures..." +
            "</div>";


        try {

            const {
                data: fixtures,
                error
            } =
                await supabaseClient
                    .from("fixtures")
                    .select(
                        "id, competition_id, home_team_id, away_team_id, match_date, kick_off, venue, matchday, status"
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

                fixturesList.innerHTML =
                    "<div class='empty-message'>" +
                    "No fixtures have been created yet." +
                    "</div>";

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
                error: teamsError
            } =
                await supabaseClient
                    .from("teams")
                    .select(
                        "id, name, short_name"
                    )
                    .in(
                        "id",
                        teamIds
                    );


            if (teamsError) {
                throw teamsError;
            }


            const {
                data: competitions,
                error: competitionsError
            } =
                await supabaseClient
                    .from("competitions")
                    .select(
                        "id, name, season"
                    )
                    .in(
                        "id",
                        competitionIds
                    );


            if (competitionsError) {
                throw competitionsError;
            }


            fixturesList.innerHTML =
                "";


            fixtures.forEach(
                function (fixture) {

                    const home =
                        (teams || []).find(
                            function (team) {

                                return Number(
                                    team.id
                                ) ===
                                Number(
                                    fixture.home_team_id
                                );

                            }
                        );


                    const away =
                        (teams || []).find(
                            function (team) {

                                return Number(
                                    team.id
                                ) ===
                                Number(
                                    fixture.away_team_id
                                );

                            }
                        );


                    const competition =
                        (competitions || []).find(
                            function (item) {

                                return Number(
                                    item.id
                                ) ===
                                Number(
                                    fixture.competition_id
                                );

                            }
                        );


                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "admin-card";


                    card.innerHTML = `

                        <h3>
                            ⚽
                            ${escapeHtml(
                                home
                                    ? home.name
                                    : "Unknown Team"
                            )}
                            vs
                            ${escapeHtml(
                                away
                                    ? away.name
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
                        </p>

                        <p>
                            📅
                            ${formatDate(
                                fixture.match_date
                            )}
                        </p>

                        <p>
                            ⏰
                            ${formatTime(
                                fixture.kick_off
                            )}
                        </p>

                        <p>
                            📍
                            ${escapeHtml(
                                fixture.venue || "-"
                            )}
                        </p>

                        <p>
                            🔢
                            ${escapeHtml(
                                fixture.matchday ||
                                "-"
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

                        <button
                            type="button"
                            class="admin-btn delete-fixture-btn"
                            data-id="${fixture.id}"
                        >
                            🗑️ Delete Fixture
                        </button>

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
                "Fixture loading error:",
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
                            "Unknown error"
                        )}
                    </p>

                </div>

            `;
        }
    }


    // ========================================
    // DELETE FIXTURE
    // ========================================

    async function deleteFixture(id) {

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
                        id
                    );


            if (error) {
                throw error;
            }


            alert(
                "Fixture deleted successfully."
            );


            await loadFixtures();

            await loadResultFixtures();


        } catch (error) {

            console.error(
                "Delete fixture error:",
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
    // RESULT MANAGER
    // ========================================

    async function loadResultFixtures() {

        if (!resultFixtureSelect) {
            return;
        }


        resultFixtureSelect.innerHTML =
            "<option value=''>Loading fixtures...</option>";


        try {

            const {
                data: fixtures,
                error: fixturesError
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


            if (fixturesError) {
                throw fixturesError;
            }


            if (
                !fixtures ||
                fixtures.length === 0
            ) {

                resultFixtureSelect.innerHTML =
                    "<option value=''>" +
                    "No available fixtures" +
                    "</option>";

                resultFixtures = [];

                return;
            }


            const {
                data: existingResults,
                error: resultsError
            } =
                await supabaseClient
                    .from("results")
                    .select(
                        "fixture_id"
                    );


            if (resultsError) {
                throw resultsError;
            }


            const completedFixtureIds =
                new Set(
                    (existingResults || []).map(
                        function (result) {

                            return Number(
                                result.fixture_id
                            );

                        }
                    )
                );


            const availableFixtures =
                fixtures.filter(
                    function (fixture) {

                        return !completedFixtureIds.has(
                            Number(
                                fixture.id
                            )
                        );

                    }
                );


            resultFixtures =
                availableFixtures;


            if (
                availableFixtures.length === 0
            ) {

                resultFixtureSelect.innerHTML =
                    "<option value=''>" +
                    "All fixtures already have results" +
                    "</option>";

                return;
            }


            const teamIds = [
                ...new Set(
                    availableFixtures.flatMap(
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
                    availableFixtures.map(
                        function (fixture) {

                            return fixture.competition_id;

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
                    .select(
                        "id, name, short_name"
                    )
                    .in(
                        "id",
                        teamIds
                    );


            if (teamsError) {
                throw teamsError;
            }


            const {
                data: competitions,
                error: competitionsError
            } =
                await supabaseClient
                    .from("competitions")
                    .select(
                        "id, name, season"
                    )
                    .in(
                        "id",
                        competitionIds
                    );


            if (competitionsError) {
                throw competitionsError;
            }


            resultFixtureSelect.innerHTML =
                "<option value=''>" +
                "Select fixture" +
                "</option>";


            availableFixtures.forEach(
                function (fixture) {

                    const home =
                        (teams || []).find(
                            function (team) {

                                return Number(
                                    team.id
                                ) ===
                                Number(
                                    fixture.home_team_id
                                );

                            }
                        );


                    const away =
                        (teams || []).find(
                            function (team) {

                                return Number(
                                    team.id
                                ) ===
                                Number(
                                    fixture.away_team_id
                                );

                            }
                        );


                    const competition =
                        (competitions || []).find(
                            function (item) {

                                return Number(
                                    item.id
                                ) ===
                                Number(
                                    fixture.competition_id
                                );

                            }
                        );


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        fixture.id;


                    option.textContent =
                        (
                            competition
                                ? competition.name +
                                  " - "
                                : ""
                        ) +
                        (
                            home
                                ? home.name
                                : "Unknown Home Team"
                        ) +
                        " vs " +
                        (
                            away
                                ? away.name
                                : "Unknown Away Team"
                        ) +
                        " - " +
                        formatDate(
                            fixture.match_date
                        ) +
                        " " +
                        formatTime(
                            fixture.kick_off
                        );


                    resultFixtureSelect.appendChild(
                        option
                    );

                }
            );


        } catch (error) {

            console.error(
                "Result fixture loading error:",
                error
            );


            resultFixtureSelect.innerHTML =
                "<option value=''>" +
                "Unable to load fixtures" +
                "</option>";
        }
    }
// ========================================
// SAVE MATCH RESULT
// ========================================

if (resultForm) {

    resultForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const fixtureId =
                resultFixtureSelect
                    ? resultFixtureSelect.value
                    : "";


            const homeScoreValue =
                homeScoreInput
                    ? homeScoreInput.value
                    : "";


            const awayScoreValue =
                awayScoreInput
                    ? awayScoreInput.value
                    : "";


            const matchReportValue =
                matchReportInput
                    ? matchReportInput.value.trim()
                    : "";


            if (!fixtureId) {

                showResultMessage(
                    "Please select a fixture.",
                    "error"
                );

                return;
            }


            if (
                homeScoreValue === "" ||
                awayScoreValue === ""
            ) {

                showResultMessage(
                    "Please enter both scores.",
                    "error"
                );

                return;
            }


            const homeScore =
                Number(homeScoreValue);


            const awayScore =
                Number(awayScoreValue);


            if (
                !Number.isInteger(homeScore) ||
                !Number.isInteger(awayScore) ||
                homeScore < 0 ||
                awayScore < 0
            ) {

                showResultMessage(
                    "Scores must be whole numbers of 0 or more.",
                    "error"
                );

                return;
            }


            try {

                showResultMessage(
                    "Saving match result...",
                    ""
                );


                // --------------------------------
                // CHECK FOR EXISTING RESULT
                // --------------------------------

                const {
                    data: existingResult,
                    error: existingResultError
                } =
                    await supabaseClient
                        .from("results")
                        .select(
                            "id"
                        )
                        .eq(
                            "fixture_id",
                            Number(fixtureId)
                        )
                        .maybeSingle();


                if (existingResultError) {
                    throw existingResultError;
                }


                if (existingResult) {

                    showResultMessage(
                        "This fixture already has a result.",
                        "error"
                    );

                    return;
                }


                // --------------------------------
                // INSERT RESULT
                // --------------------------------

                const {
                    data: newResult,
                    error: resultError
                } =
                    await supabaseClient
                        .from("results")
                        .insert({

                            fixture_id:
                                Number(
                                    fixtureId
                                ),

                            home_score:
                                homeScore,

                            away_score:
                                awayScore,

                            match_report:
                                matchReportValue ||
                                null

                        })
                        .select(
                            "id, fixture_id, home_score, away_score"
                        )
                        .single();


                if (resultError) {
                    throw resultError;
                }


                // --------------------------------
                // MARK FIXTURE COMPLETED
                // --------------------------------

                const {
                    error: fixtureUpdateError
                } =
                    await supabaseClient
                        .from("fixtures")
                        .update({

                            status:
                                "Completed"

                        })
                        .eq(
                            "id",
                            Number(fixtureId)
                        );


                if (fixtureUpdateError) {
                    throw fixtureUpdateError;
                }


                showResultMessage(
                    "✅ Match result saved successfully!",
                    "success"
                );


                resultForm.reset();


                // Reload available result fixtures
                await loadResultFixtures();


                // Reload normal fixture list
                await loadFixtures();


                // --------------------------------
                // REFRESH APPROVED TEAM DATA
                // --------------------------------

                await loadApprovedTeams();


            } catch (error) {

                console.error(
                    "Save result error:",
                    error
                );


                showResultMessage(
                    "❌ Unable to save result: " +
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
// LOAD PENDING TEAM REGISTRATIONS
// ========================================

async function loadPendingTeams() {

    if (!pendingTeamsContainer) {
        return;
    }


    pendingTeamsContainer.innerHTML =
        `
        <div class="admin-card">
            <h3>⏳ Loading Pending Registrations...</h3>
            <p>Please wait while we load pending teams.</p>
        </div>
        `;


    try {

        const {
            data: teams,
            error
        } =
            await supabaseClient
                .from("teams")
                .select(
                    "id, name, short_name, logo_url, location, coach_name, captain_name, vice_captain_name, discipline_master_name, phone, email, registration_status, created_at"
                )
                .eq(
                    "registration_status",
                    "Pending"
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


        if (error) {
            throw error;
        }


        if (
            !teams ||
            teams.length === 0
        ) {

            pendingTeamsContainer.innerHTML =
                `
                <div class="admin-card">
                    <h3>✅ No Pending Registrations</h3>
                    <p>
                        There are currently no teams waiting
                        for approval.
                    </p>
                </div>
                `;

            return;
        }


        pendingTeamsContainer.innerHTML =
            "";


        // ====================================
        // LOAD PLAYERS FOR EACH TEAM
        // ====================================

        for (
            const team of teams
        ) {

            const {
                data: players,
                error: playersError
            } =
                await supabaseClient
                    .from("players")
                    .select(
                        "id, full_name, jersey_number, position, photo_url, registration_status"
                    )
                    .eq(
                        "team_id",
                        team.id
                    )
                    .order(
                        "jersey_number",
                        {
                            ascending: true
                        }
                    );


            if (playersError) {
                console.error(
                    "Player loading error:",
                    playersError
                );
            }


            const playerList =
                players || [];


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "admin-card pending-team-card";


            // ====================================
            // TEAM LOGO
            // ====================================

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
                                width:90px;
                                height:90px;
                                object-fit:cover;
                                border-radius:50%;
                                border:3px solid #f5c542;
                                background:#ffffff;
                            "
                        >
                    `

                    : `
                        <div
                            style="
                                width:90px;
                                height:90px;
                                border-radius:50%;
                                border:3px solid #f5c542;
                                background:#04351f;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:38px;
                            "
                        >
                            ⚽
                        </div>
                    `;


            // ====================================
            // PLAYER TABLE
            // ====================================

            let playersHtml =
                "";


            if (
                playerList.length === 0
            ) {

                playersHtml =
                    `
                    <p>
                        No players found for this registration.
                    </p>
                    `;

            } else {

                playersHtml =
                    `
                    <div
                        style="
                            overflow-x:auto;
                            margin-top:15px;
                        "
                    >

                        <table
                            style="
                                width:100%;
                                border-collapse:collapse;
                            "
                        >

                            <thead>

                                <tr>

                                    <th
                                        style="
                                            padding:8px;
                                            text-align:left;
                                        "
                                    >
                                        Photo
                                    </th>

                                    <th
                                        style="
                                            padding:8px;
                                            text-align:left;
                                        "
                                    >
                                        #
                                    </th>

                                    <th
                                        style="
                                            padding:8px;
                                            text-align:left;
                                        "
                                    >
                                        Player
                                    </th>

                                    <th
                                        style="
                                            padding:8px;
                                            text-align:left;
                                        "
                                    >
                                        Position
                                    </th>

                                    <th
                                        style="
                                            padding:8px;
                                            text-align:left;
                                        "
                                    >
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>
                    `;


                playerList.forEach(
                    function (player) {

                        const playerPhoto =
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
                                            width:45px;
                                            height:45px;
                                            object-fit:cover;
                                            border-radius:50%;
                                            border:2px solid #f5c542;
                                        "
                                    >
                                `

                                : `
                                    <div
                                        style="
                                            width:45px;
                                            height:45px;
                                            border-radius:50%;
                                            background:#075b35;
                                            display:flex;
                                            align-items:center;
                                            justify-content:center;
                                            font-size:20px;
                                        "
                                    >
                                        👤
                                    </div>
                                `;


                        playersHtml +=
                            `

                            <tr>

                                <td
                                    style="
                                        padding:8px;
                                    "
                                >
                                    ${playerPhoto}
                                </td>

                                <td
                                    style="
                                        padding:8px;
                                    "
                                >
                                    ${escapeHtml(
                                        player.jersey_number ??
                                        "-"
                                    )}
                                </td>

                                <td
                                    style="
                                        padding:8px;
                                    "
                                >
                                    ${escapeHtml(
                                        player.full_name ||
                                        "-"
                                    )}
                                </td>

                                <td
                                    style="
                                        padding:8px;
                                    "
                                >
                                    ${escapeHtml(
                                        player.position ||
                                        "-"
                                    )}
                                </td>

                                <td
                                    style="
                                        padding:8px;
                                    "
                                >
                                    ${escapeHtml(
                                        player.registration_status ||
                                        "-"
                                    )}
                                </td>

                            </tr>

                        `;

                    }
                );


                playersHtml +=
                    `
                            </tbody>

                        </table>

                    </div>
                    `;
            }


            // ====================================
            // TEAM CARD
            // ====================================

            card.innerHTML =
                `

                <div
                    style="
                        display:flex;
                        gap:20px;
                        align-items:center;
                        flex-wrap:wrap;
                    "
                >

                    <div>
                        ${logoHtml}
                    </div>

                    <div
                        style="
                            flex:1;
                            min-width:220px;
                        "
                    >

                        <div
                            style="
                                display:inline-block;
                                background:#f5c542;
                                color:#04351f;
                                padding:5px 10px;
                                border-radius:20px;
                                font-size:12px;
                                font-weight:bold;
                                margin-bottom:8px;
                            "
                        >
                            PENDING APPROVAL
                        </div>

                        <h3>
                            ${escapeHtml(
                                team.name
                            )}
                        </h3>

                        <p>
                            <strong>Short Name:</strong>
                            ${escapeHtml(
                                team.short_name ||
                                "-"
                            )}
                        </p>

                        <p>
                            <strong>Location:</strong>
                            ${escapeHtml(
                                team.location ||
                                "-"
                            )}
                        </p>

                    </div>

                </div>


                <hr
                    style="
                        margin:20px 0;
                        border:0;
                        border-top:1px solid #ddd;
                    "
                >


                <h4>👤 Team Officials</h4>

                <div
                    style="
                        display:grid;
                        grid-template-columns:
                            repeat(
                                auto-fit,
                                minmax(200px, 1fr)
                            );
                        gap:10px;
                        margin-top:10px;
                    "
                >

                    <p>
                        <strong>Coach:</strong>
                        ${escapeHtml(
                            team.coach_name ||
                            "-"
                        )}
                    </p>

                    <p>
                        <strong>Captain:</strong>
                        ${escapeHtml(
                            team.captain_name ||
                            "-"
                        )}
                    </p>

                    <p>
                        <strong>Vice Captain:</strong>
                        ${escapeHtml(
                            team.vice_captain_name ||
                            "-"
                        )}
                    </p>

                    <p>
                        <strong>Discipline Master:</strong>
                        ${escapeHtml(
                            team.discipline_master_name ||
                            "-"
                        )}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${escapeHtml(
                            team.phone ||
                            "-"
                        )}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${escapeHtml(
                            team.email ||
                            "-"
                        )}
                    </p>

                </div>


                <hr
                    style="
                        margin:20px 0;
                        border:0;
                        border-top:1px solid #ddd;
                    "
                >


                <h4>
                    👥 Registered Players
                    (${playerList.length})
                </h4>

                ${playersHtml}


                <div
                    style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                        margin-top:20px;
                    "
                >

                    <button
                        type="button"
                        class="admin-btn approve-btn"
                        data-id="${team.id}"
                    >
                        ✅ Approve Team
                    </button>

                    <button
                        type="button"
                        class="admin-btn reject-btn"
                        data-id="${team.id}"
                    >
                        ❌ Reject Team
                    </button>

                    <button
                        type="button"
                        class="admin-btn open-team-btn"
                        data-id="${team.id}"
                    >
                        👀 Open Team Page
                    </button>

                </div>

                `;


            pendingTeamsContainer.appendChild(
                card
            );


            // ====================================
            // APPROVE BUTTON
            // ====================================

            const approveButton =
                card.querySelector(
                    ".approve-btn"
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


            // ====================================
            // REJECT BUTTON
            // ====================================

            const rejectButton =
                card.querySelector(
                    ".reject-btn"
                );


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


            // ====================================
            // OPEN TEAM BUTTON
            // ====================================

            const openTeamButton =
                card.querySelector(
                    ".open-team-btn"
                );


            if (openTeamButton) {

                openTeamButton.addEventListener(
                    "click",
                    function () {

                        window.open(
                            "team.html?id=" +
                            encodeURIComponent(
                                team.id
                            ),
                            "_blank"
                        );

                    }
                );
            }

        }


    } catch (error) {

        console.error(
            "Pending team loading error:",
            error
        );


        pendingTeamsContainer.innerHTML =
            `

            <div class="admin-card">

                <h3>
                    ❌ Unable to Load Pending Teams
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
// APPROVE TEAM
// ========================================

async function approveTeam(teamId) {

    if (
        !confirm(
            "Are you sure you want to approve this team and all its registered players?"
        )
    ) {
        return;
    }


    try {

        // --------------------------------
        // APPROVE TEAM
        // --------------------------------

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


        // --------------------------------
        // APPROVE PLAYERS
        // --------------------------------

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
            "✅ Team and players approved successfully."
        );


        await loadPendingTeams();

        await loadApprovedTeams();

        await loadFixtures();

        await loadResultFixtures();


    } catch (error) {

        console.error(
            "Approve team error:",
            error
        );


        alert(
            "❌ Unable to approve team: " +
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

async function rejectTeam(teamId) {

    if (
        !confirm(
            "Are you sure you want to reject this team and all its registered players?"
        )
    ) {
        return;
    }


    try {

        // --------------------------------
        // REJECT TEAM
        // --------------------------------

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


        // --------------------------------
        // REJECT PLAYERS
        // --------------------------------

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
            "Team and players rejected."
        );


        await loadPendingTeams();

        await loadApprovedTeams();


    } catch (error) {

        console.error(
            "Reject team error:",
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

    function formatDate(value) {

        if (!value) {
            return "-";
        }


        const date =
            new Date(
                value + "T00:00:00"
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

    function formatTime(value) {

        if (!value) {
            return "-";
        }


        const parts =
            value.split(":");


        const hour =
            Number(
                parts[0]
            );


        const minute =
            parts[1] ||
            "00";


        const period =
            hour >= 12
                ? "PM"
                : "AM";


        const displayHour =
            hour % 12 ||
            12;


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

    function escapeHtml(value) {

        return String(
            value
        )
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

    console.log(
        "Kabaru Ward Football Admin JS started."
    );


    const isAdmin =
        await checkAdmin();


    if (!isAdmin) {
        return;
    }


    console.log(
        "Loading admin dashboard data..."
    );


    await loadCompetitions();

    await loadApprovedTeams();

    await loadVenues();

    await loadFixtures();

    await loadResultFixtures();

    await loadPendingTeams();


    console.log(
        "Kabaru Ward Football Admin Dashboard loaded."
    );

});
