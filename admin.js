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

    const statusMessage =
        document.getElementById("statusMessage");

    const logoutBtn =
        document.getElementById("logoutBtn");

    // ========================================
    // FIXTURE ELEMENTS
    // ========================================

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
    // RESULT MANAGER ELEMENTS
    // ========================================

    const resultFixtureSelect =
        document.getElementById("resultFixtureSelect");

    const selectedFixtureInfo =
        document.getElementById("selectedFixtureInfo");

    const resultScoreSection =
        document.getElementById("resultScoreSection");

    const resultHomeTeamName =
        document.getElementById("resultHomeTeamName");

    const resultAwayTeamName =
        document.getElementById("resultAwayTeamName");

    const homeGoalTeamLabel =
        document.getElementById("homeGoalTeamLabel");

    const awayGoalTeamLabel =
        document.getElementById("awayGoalTeamLabel");

    const homeScore =
        document.getElementById("homeScore");

    const awayScore =
        document.getElementById("awayScore");

    const homeGoalsContainer =
        document.getElementById("homeGoalsContainer");

    const awayGoalsContainer =
        document.getElementById("awayGoalsContainer");

    const addHomeGoalBtn =
        document.getElementById("addHomeGoalBtn");

    const addAwayGoalBtn =
        document.getElementById("addAwayGoalBtn");

    const homeGoalWarning =
        document.getElementById("homeGoalWarning");

    const awayGoalWarning =
        document.getElementById("awayGoalWarning");

    const matchReport =
        document.getElementById("matchReport");

    const resultFormMessage =
        document.getElementById("resultFormMessage");

    const saveResultBtn =
        document.getElementById("saveResultBtn");


    // ========================================
    // COMPETITION MANAGER ELEMENTS
    // ========================================

    const competitionForm =
        document.getElementById("competitionForm");

    const createCompetitionButton =
        document.getElementById("createCompetitionButton");

    const competitionFormMessage =
        document.getElementById("competitionFormMessage");


    // ========================================
    // RESULT DATA
    // ========================================

    let resultFixtures = [];

    let currentFixture = null;

    let homePlayers = [];

    let awayPlayers = [];


    // ========================================
    // MESSAGE HELPERS
    // ========================================

    function showMessage(message, type) {

        if (!statusMessage) return;

        statusMessage.textContent = message;

        statusMessage.style.display = "block";

        statusMessage.className =
            "status-message " + (type || "");
    }


    function showFixtureMessage(message, type) {

        if (!fixtureFormMessage) return;

        fixtureFormMessage.textContent = message;

        fixtureFormMessage.style.display = "block";

        fixtureFormMessage.className =
            "fixture-form-message " + (type || "");
    }


    function showResultMessage(message, type) {

        if (!resultFormMessage) return;

        resultFormMessage.textContent = message;

        resultFormMessage.style.display = "block";

        resultFormMessage.className =
            "result-form-message " + (type || "");
    }


    // ========================================
    // CHECK SUPABASE
    // ========================================

    function supabaseReady() {

        if (typeof window.supabase === "undefined") {

            showMessage(
                "❌ Supabase library did not load.",
                "error"
            );

            return false;
        }


        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {

            showMessage(
                "❌ Supabase connection did not load.",
                "error"
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
                        "Logout error:",
                        error
                    );


                    logoutBtn.disabled = false;

                    logoutBtn.textContent =
                        "Logout";


                    showMessage(
                        "Logout failed: " +
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

        if (!supabaseReady()) {
            return false;
        }


        try {

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
                    "❌ You are not logged in.",
                    "error"
                );

                return false;
            }


            const {
                data: admin,
                error: adminError
            } =
                await supabaseClient
                    .from("admin_users")
                    .select(
                        "user_id, role"
                    )
                    .eq(
                        "user_id",
                        user.id
                    )
                    .in(
                        "role",
                        [
                            "admin",
                            "super_admin"
                        ]
                    )
                    .maybeSingle();


            if (adminError) {
                throw adminError;
            }


            if (!admin) {

                showMessage(
                    "❌ This account is not an administrator.",
                    "error"
                );

                return false;
            }


            showMessage(
                "✅ Administrator access granted.",
                "success"
            );


            return true;


        } catch (error) {

            console.error(
                "Admin verification error:",
                error
            );


            showMessage(
                "❌ Admin verification failed: " +
                (
                    error.message ||
                    "Unknown error"
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

        const competitionsList =
            document.getElementById(
                "competitionsList"
            );


        if (!competitionsList) {
            return;
        }


        competitionsList.innerHTML =
            '<div class="empty-message">Loading competitions...</div>';


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


            // ========================================
            // LOAD COMPETITIONS INTO FIXTURE DROPDOWN
            // ========================================

            if (competitionSelect) {

                competitionSelect.innerHTML =
                    '<option value="">Select competition</option>';


                (data || []).forEach(
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
                            (
                                competition.season ||
                                ""
                            );


                        competitionSelect.appendChild(
                            option
                        );

                    }
                );
            }


            // ========================================
            // NO COMPETITIONS
            // ========================================

            if (
                !data ||
                data.length === 0
            ) {

                competitionsList.innerHTML =
                    '<div class="empty-message">' +
                    'No competitions have been created yet.' +
                    '</div>';

                return;
            }


            // ========================================
            // DISPLAY COMPETITIONS
            // ========================================

            let html = "";


            data.forEach(
                function (competition) {

                    const startDate =
                        competition.start_date
                            ? formatDate(
                                competition.start_date
                            )
                            : "Not set";


                    const endDate =
                        competition.end_date
                            ? formatDate(
                                competition.end_date
                            )
                            : "Not set";


                    const status =
                        competition.status ||
                        "Upcoming";


                    html += `

                        <div
                            class="admin-card"
                            style="margin-top:15px; border-left:5px solid #16803c;"
                        >

                            <h3>
                                🏆
                                ${escapeHtml(
                                    competition.name
                                )}
                            </h3>


                            <div class="team-details">

                                <div class="detail">
                                    <strong>Type</strong><br>
                                    ${escapeHtml(
                                        competition.competition_type ||
                                        "-"
                                    )}
                                </div>


                                <div class="detail">
                                    <strong>Season</strong><br>
                                    ${escapeHtml(
                                        competition.season ||
                                        "Not set"
                                    )}
                                </div>


                                <div class="detail">
                                    <strong>Start Date</strong><br>
                                    ${startDate}
                                </div>


                                <div class="detail">
                                    <strong>End Date</strong><br>
                                    ${endDate}
                                </div>


                                <div class="detail">
                                    <strong>Status</strong><br>
                                    ${escapeHtml(
                                        status
                                    )}
                                </div>

                            </div>


                            ${
                                competition.description
                                    ? `
                                        <p>
                                            ${escapeHtml(
                                                competition.description
                                            )}
                                        </p>
                                      `
                                    : ""
                            }

                        </div>

                    `;
                }
            );


            competitionsList.innerHTML =
                html;


        } catch (error) {

            console.error(
                "LOAD COMPETITIONS ERROR:",
                error
            );


            competitionsList.innerHTML =
                '<div class="empty-message">' +
                '❌ Unable to load competitions: ' +
                escapeHtml(
                    error.message ||
                    "Unknown error"
                ) +
                '</div>';
        }
    }


    // ========================================
    // CREATE COMPETITION
    // ========================================

    if (createCompetitionButton) {

        createCompetitionButton.addEventListener(
            "click",
            async function () {

                console.log(
                    "CREATE COMPETITION BUTTON CLICKED"
                );


                const nameInput =
                    document.getElementById(
                        "competitionName"
                    );

                const typeInput =
                    document.getElementById(
                        "competitionType"
                    );

                const seasonInput =
                    document.getElementById(
                        "competitionSeason"
                    );

                const startDateInput =
                    document.getElementById(
                        "competitionStartDate"
                    );

                const endDateInput =
                    document.getElementById(
                        "competitionEndDate"
                    );

                const statusInput =
                    document.getElementById(
                        "competitionStatus"
                    );

                const descriptionInput =
                    document.getElementById(
                        "competitionDescription"
                    );


                if (!competitionFormMessage) {
                    return;
                }


                const name =
                    nameInput
                        ? nameInput.value.trim()
                        : "";


                const competitionType =
                    typeInput
                        ? typeInput.value
                        : "";


                const season =
                    seasonInput
                        ? seasonInput.value.trim()
                        : "";


                const startDate =
                    startDateInput &&
                    startDateInput.value
                        ? startDateInput.value
                        : null;


                const endDate =
                    endDateInput &&
                    endDateInput.value
                        ? endDateInput.value
                        : null;


                const status =
                    statusInput
                        ? statusInput.value
                        : "Upcoming";


                const description =
                    descriptionInput
                        ? descriptionInput.value.trim()
                        : "";


                // ========================================
                // VALIDATION
                // ========================================

                if (!name) {

                    competitionFormMessage.textContent =
                        "❌ Please enter the competition name.";

                    competitionFormMessage.style.display =
                        "block";

                    return;
                }


                if (!competitionType) {

                    competitionFormMessage.textContent =
                        "❌ Please select the competition type.";

                    competitionFormMessage.style.display =
                        "block";

                    return;
                }


                if (!season) {

                    competitionFormMessage.textContent =
                        "❌ Please enter the season.";

                    competitionFormMessage.style.display =
                        "block";

                    return;
                }


                if (
                    startDate &&
                    endDate &&
                    endDate < startDate
                ) {

                    competitionFormMessage.textContent =
                        "❌ End date cannot be before start date.";

                    competitionFormMessage.style.display =
                        "block";

                    return;
                }


                competitionFormMessage.textContent =
                    "Saving competition...";

                competitionFormMessage.style.display =
                    "block";


                createCompetitionButton.disabled =
                    true;


                try {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .from("competitions")
                            .insert({
                                name: name,
                                competition_type:
                                    competitionType,
                                season: season,
                                start_date:
                                    startDate,
                                end_date:
                                    endDate,
                                status: status,
                                description:
                                    description ||
                                    null
                            })
                            .select()
                            .single();


                    if (error) {
                        throw error;
                    }


                    console.log(
                        "Competition created successfully:",
                        data
                    );


                    competitionFormMessage.textContent =
                        "✅ Competition created successfully!";


                    competitionFormMessage.style.display =
                        "block";


                    if (competitionForm) {
                        competitionForm.reset();
                    }


                    await loadCompetitions();


                } catch (error) {

                    console.error(
                        "CREATE COMPETITION ERROR:",
                        error
                    );


                    competitionFormMessage.textContent =
                        "❌ Unable to create competition: " +
                        (
                            error.message ||
                            "Unknown error"
                        );


                    competitionFormMessage.style.display =
                        "block";


                } finally {

                    createCompetitionButton.disabled =
                        false;
                }

            }
        );

    } else {

        console.warn(
            "CREATE COMPETITION BUTTON NOT FOUND. " +
            "Make sure the button has id='createCompetitionButton'."
        );
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


        homeTeamSelect.innerHTML =
            "<option value=''>Loading teams...</option>";

        awayTeamSelect.innerHTML =
            "<option value=''>Loading teams...</option>";


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("teams")
                    .select(
                        "id, name, short_name"
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


            homeTeamSelect.innerHTML =
                "<option value=''>Select home team</option>";

            awayTeamSelect.innerHTML =
                "<option value=''>Select away team</option>";


            if (
                !data ||
                data.length === 0
            ) {

                homeTeamSelect.innerHTML =
                    "<option value=''>No approved teams</option>";

                awayTeamSelect.innerHTML =
                    "<option value=''>No approved teams</option>";

                return;
            }


            data.forEach(
                function (team) {

                    const name =
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
            "<div class='empty-message'>Loading fixtures...</div>";


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
                    "<div class='empty-message'>No fixtures have been created yet.</div>";

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
                    "<option value=''>No available fixtures</option>";

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
                    "<option value=''>All fixtures already have results</option>";

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
                "<option value=''>Select fixture</option>";


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
                        " — " +
                        formatDate(
                            fixture.match_date
                        );


                    resultFixtureSelect.appendChild(
                        option
                    );

                }
            );


        } catch (error) {

            console.error(
                "Result fixtures loading error:",
                error
            );


            resultFixtureSelect.innerHTML =
                "<option value=''>Unable to load fixtures</option>";
        }
    }


    // ========================================
    // LOAD TEAM PLAYERS FOR RESULT
    // ========================================

    async function loadResultPlayers() {

        if (!currentFixture) {
            return;
        }


        homePlayers = [];

        awayPlayers = [];


        try {

            const {
                data: players,
                error
            } =
                await supabaseClient
                    .from("players")
                    .select(`
                        id,
                        team_id,
                        full_name,
                        jersey_number,
                        position,
                        registration_status
                    `)
                    .in(
                        "team_id",
                        [
                            currentFixture.home_team_id,
                            currentFixture.away_team_id
                        ]
                    )
                    .eq(
                        "registration_status",
                        "Approved"
                    )
                    .order(
                        "jersey_number",
                        {
                            ascending: true
                        }
                    );


            if (error) {
                throw error;
            }


            (players || []).forEach(
                function (player) {

                    if (
                        Number(
                            player.team_id
                        ) ===
                        Number(
                            currentFixture.home_team_id
                        )
                    ) {

                        homePlayers.push(
                            player
                        );
                    }


                    if (
                        Number(
                            player.team_id
                        ) ===
                        Number(
                            currentFixture.away_team_id
                        )
                    ) {

                        awayPlayers.push(
                            player
                        );
                    }

                }
            );


        } catch (error) {

            console.error(
                "Result player loading error:",
                error
            );


            throw error;
        }
    }


    // ========================================
    // CREATE PLAYER OPTIONS
    // ========================================

    function createPlayerOptions(players) {

        let html =
            "<option value=''>Select scorer</option>";


        players.forEach(
            function (player) {

                html += `

                    <option value="${player.id}">

                        ${escapeHtml(
                            player.full_name
                        )}

                        ${
                            player.jersey_number
                                ? " (#" +
                                  escapeHtml(
                                      player.jersey_number
                                  ) +
                                  ")"
                                : ""
                        }

                    </option>

                `;
            }
        );


        return html;
    }


    // ========================================
    // ADD SCORER ROW
    // ========================================

    function addScorerRow(
        container,
        players,
        side
    ) {

        if (!container) {
            return;
        }


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "goal-entry";


        row.innerHTML = `

            <select
                class="scorer-player"
                data-side="${side}"
            >

                ${createPlayerOptions(
                    players
                )}

            </select>


            <input
                type="text"
                class="scorer-minutes"
                placeholder="12, 44, 67"
                inputmode="numeric"
                autocomplete="off"
            >


            <button
                type="button"
                class="remove-goal-btn"
                title="Remove scorer"
            >
                ✕
            </button>

        `;


        container.appendChild(
            row
        );


        const removeButton =
            row.querySelector(
                ".remove-goal-btn"
            );


        if (removeButton) {

            removeButton.addEventListener(
                "click",
                function () {

                    row.remove();

                    updateGoalWarnings();

                }
            );
        }


        const minuteInput =
            row.querySelector(
                ".scorer-minutes"
            );


        if (minuteInput) {

            minuteInput.addEventListener(
                "input",
                function () {

                    updateGoalWarnings();

                }
            );
        }


        const playerSelect =
            row.querySelector(
                ".scorer-player"
            );


        if (playerSelect) {

            playerSelect.addEventListener(
                "change",
                function () {

                    updateGoalWarnings();

                }
            );
        }


        updateGoalWarnings();
    }


    // ========================================
    // PARSE GOAL MINUTES
    // ========================================

    function getMinutesFromRow(row) {

        const input =
            row.querySelector(
                ".scorer-minutes"
            );


        if (!input) {
            return [];
        }


        const value =
            input.value.trim();


        if (!value) {
            return [];
        }


        return value
            .split(",")
            .map(
                function (item) {

                    return item.trim();

                }
            )
            .filter(
                function (item) {

                    return item !== "";

                }
            )
            .map(
                function (item) {

                    return Number(item);

                }
            );
    }


    // ========================================
    // GET SCORER DATA
    // ========================================

    function getScorerData(container) {

        if (!container) {
            return [];
        }


        const rows =
            container.querySelectorAll(
                ".goal-entry"
            );


        const scorerData = [];


        rows.forEach(
            function (row) {

                const playerSelect =
                    row.querySelector(
                        ".scorer-player"
                    );


                if (!playerSelect) {
                    return;
                }


                const playerId =
                    playerSelect.value;


                const minutes =
                    getMinutesFromRow(
                        row
                    );


                if (!playerId) {
                    return;
                }


                minutes.forEach(
                    function (minute) {

                        scorerData.push({

                            player_id:
                                Number(
                                    playerId
                                ),

                            minute:
                                minute

                        });

                    }
                );

            }
        );


        return scorerData;
    }


    // ========================================
    // COUNT GOALS
    // ========================================

    function countGoals(container) {

        if (!container) {
            return 0;
        }


        const rows =
            container.querySelectorAll(
                ".goal-entry"
            );


        let count = 0;


        rows.forEach(
            function (row) {

                const minutes =
                    getMinutesFromRow(
                        row
                    );


                count +=
                    minutes.length;

            }
        );


        return count;
    }


    // ========================================
    // UPDATE GOAL WARNINGS
    // ========================================

    function updateGoalWarnings() {

        if (
            !homeScore ||
            !awayScore
        ) {
            return;
        }


        const homeTotal =
            Number(
                homeScore.value
            ) || 0;


        const awayTotal =
            Number(
                awayScore.value
            ) || 0;


        const enteredHomeGoals =
            countGoals(
                homeGoalsContainer
            );


        const enteredAwayGoals =
            countGoals(
                awayGoalsContainer
            );


        if (homeGoalWarning) {

            if (
                enteredHomeGoals !==
                homeTotal
            ) {

                homeGoalWarning.style.display =
                    "block";


                homeGoalWarning.textContent =
                    "⚠️ Score is " +
                    homeTotal +
                    " but " +
                    enteredHomeGoals +
                    " home goal(s) have been entered.";

            } else {

                homeGoalWarning.style.display =
                    "none";
            }
        }


        if (awayGoalWarning) {

            if (
                enteredAwayGoals !==
                awayTotal
            ) {

                awayGoalWarning.style.display =
                    "block";


                awayGoalWarning.textContent =
                    "⚠️ Score is " +
                    awayTotal +
                    " but " +
                    enteredAwayGoals +
                    " away goal(s) have been entered.";

            } else {

                awayGoalWarning.style.display =
                    "none";
            }
        }
    }


    // ========================================
    // FIXTURE SELECTION
    // ========================================

    if (resultFixtureSelect) {

        resultFixtureSelect.addEventListener(
            "change",
            async function () {

                const fixtureId =
                    resultFixtureSelect.value;


                if (!fixtureId) {

                    currentFixture =
                        null;


                    if (selectedFixtureInfo) {

                        selectedFixtureInfo.style.display =
                            "none";
                    }


                    if (resultScoreSection) {

                        resultScoreSection.style.display =
                            "none";
                    }


                    return;
                }


                currentFixture =
                    resultFixtures.find(
                        function (fixture) {

                            return Number(
                                fixture.id
                            ) ===
                            Number(
                                fixtureId
                            );

                        }
                    );


                if (!currentFixture) {

                    showResultMessage(
                        "❌ Unable to find selected fixture.",
                        "error"
                    );

                    return;
                }


                try {

                    showResultMessage(
                        "Loading players...",
                        ""
                    );


                    await loadResultPlayers();


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
                                [
                                    currentFixture.home_team_id,
                                    currentFixture.away_team_id
                                ]
                            );


                    if (teamsError) {
                        throw teamsError;
                    }


                    const home =
                        (teams || []).find(
                            function (team) {

                                return Number(
                                    team.id
                                ) ===
                                Number(
                                    currentFixture.home_team_id
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
                                    currentFixture.away_team_id
                                );

                            }
                        );


                    const homeName =
                        home
                            ? home.name
                            : "Home Team";


                    const awayName =
                        away
                            ? away.name
                            : "Away Team";


                    if (resultHomeTeamName) {

                        resultHomeTeamName.textContent =
                            homeName;
                    }


                    if (resultAwayTeamName) {

                        resultAwayTeamName.textContent =
                            awayName;
                    }


                    if (homeGoalTeamLabel) {

                        homeGoalTeamLabel.textContent =
                            homeName +
                            " goal scorers";
                    }


                    if (awayGoalTeamLabel) {

                        awayGoalTeamLabel.textContent =
                            awayName +
                            " goal scorers";
                    }


                    if (selectedFixtureInfo) {

                        selectedFixtureInfo.innerHTML = `

                            <strong>
                                ⚽
                                ${escapeHtml(
                                    homeName
                                )}
                                vs
                                ${escapeHtml(
                                    awayName
                                )}
                            </strong>

                            <br>

                            🏆 Matchday:
                            ${escapeHtml(
                                currentFixture.matchday ||
                                "-"
                            )}

                            <br>

                            📅
                            ${formatDate(
                                currentFixture.match_date
                            )}

                            &nbsp;&nbsp;

                            ⏰
                            ${formatTime(
                                currentFixture.kick_off
                            )}

                            <br>

                            📍
                            ${escapeHtml(
                                currentFixture.venue ||
                                "-"
                            )}

                        `;


                        selectedFixtureInfo.style.display =
                            "block";
                    }


                    if (homeGoalsContainer) {

                        homeGoalsContainer.innerHTML =
                            "";
                    }


                    if (awayGoalsContainer) {

                        awayGoalsContainer.innerHTML =
                            "";
                    }


                    if (homeScore) {

                        homeScore.value =
                            0;
                    }


                    if (awayScore) {

                        awayScore.value =
                            0;
                    }


                    if (matchReport) {

                        matchReport.value =
                            "";
                    }


                    if (resultScoreSection) {

                        resultScoreSection.style.display =
                            "block";
                    }


                    if (resultFormMessage) {

                        resultFormMessage.style.display =
                            "none";
                    }


                    updateGoalWarnings();


                } catch (error) {

                    console.error(
                        "Loading result players error:",
                        error
                    );


                    showResultMessage(
                        "❌ Unable to load players: " +
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
    // ADD HOME SCORER
    // ========================================

    if (addHomeGoalBtn) {

        addHomeGoalBtn.addEventListener(
            "click",
            function () {

                addScorerRow(
                    homeGoalsContainer,
                    homePlayers,
                    "home"
                );

            }
        );
    }


    // ========================================
    // ADD AWAY SCORER
    // ========================================

    if (addAwayGoalBtn) {

        addAwayGoalBtn.addEventListener(
            "click",
            function () {

                addScorerRow(
                    awayGoalsContainer,
                    awayPlayers,
                    "away"
                );

            }
        );
    }


    // ========================================
    // SCORE INPUT CHANGES
    // ========================================

    if (homeScore) {

        homeScore.addEventListener(
            "input",
            updateGoalWarnings
        );
    }


    if (awayScore) {

        awayScore.addEventListener(
            "input",
            updateGoalWarnings
        );
    }


    // ========================================
    // VALIDATE MINUTES
    // ========================================

    function validateMinutes(
        container,
        teamName
    ) {

        if (!container) {

            return {
                valid: true,
                message: ""
            };
        }


        const rows =
            container.querySelectorAll(
                ".goal-entry"
            );


        for (
            let i = 0;
            i < rows.length;
            i++
        ) {

            const row =
                rows[i];


            const playerSelect =
                row.querySelector(
                    ".scorer-player"
                );


            const minutes =
                getMinutesFromRow(
                    row
                );


            if (
                playerSelect &&
                playerSelect.value &&
                minutes.length === 0
            ) {

                return {

                    valid: false,

                    message:
                        "Please enter the goal minute(s) for " +
                        teamName +
                        " scorer #" +
                        (i + 1) +
                        "."

                };
            }


            for (
                let j = 0;
                j < minutes.length;
                j++
            ) {

                const minute =
                    minutes[j];


                if (
                    !Number.isInteger(
                        minute
                    ) ||
                    minute < 1 ||
                    minute > 130
                ) {

                    return {

                        valid: false,

                        message:
                            "Goal minutes must be whole numbers between 1 and 130."

                    };
                }
            }
        }


        return {

            valid: true,

            message: ""

        };
    }


    // ========================================
    // SAVE RESULT
    // ========================================

    if (saveResultBtn) {

        saveResultBtn.addEventListener(
            "click",
            async function () {

                if (!currentFixture) {

                    showResultMessage(
                        "Please select a fixture first.",
                        "error"
                    );

                    return;
                }


                const homeFinalScore =
                    Number(
                        homeScore
                            ? homeScore.value
                            : 0
                    );


                const awayFinalScore =
                    Number(
                        awayScore
                            ? awayScore.value
                            : 0
                    );


                if (
                    !Number.isInteger(
                        homeFinalScore
                    ) ||
                    homeFinalScore < 0 ||
                    homeFinalScore > 99
                ) {

                    showResultMessage(
                        "Home score must be a whole number between 0 and 99.",
                        "error"
                    );

                    return;
                }


                if (
                    !Number.isInteger(
                        awayFinalScore
                    ) ||
                    awayFinalScore < 0 ||
                    awayFinalScore > 99
                ) {

                    showResultMessage(
                        "Away score must be a whole number between 0 and 99.",
                        "error"
                    );

                    return;
                }


                const homeValidation =
                    validateMinutes(
                        homeGoalsContainer,
                        "home"
                    );


                if (!homeValidation.valid) {

                    showResultMessage(
                        "❌ " +
                        homeValidation.message,
                        "error"
                    );

                    return;
                }


                const awayValidation =
                    validateMinutes(
                        awayGoalsContainer,
                        "away"
                    );


                if (!awayValidation.valid) {

                    showResultMessage(
                        "❌ " +
                        awayValidation.message,
                        "error"
                    );

                    return;
                }


                const homeScorers =
                    getScorerData(
                        homeGoalsContainer
                    );


                const awayScorers =
                    getScorerData(
                        awayGoalsContainer
                    );


                if (
                    homeScorers.length !==
                    homeFinalScore
                ) {

                    showResultMessage(
                        "❌ Home score is " +
                        homeFinalScore +
                        " but you entered " +
                        homeScorers.length +
                        " home goal(s).",
                        "error"
                    );

                    return;
                }


                if (
                    awayScorers.length !==
                    awayFinalScore
                ) {

                    showResultMessage(
                        "❌ Away score is " +
                        awayFinalScore +
                        " but you entered " +
                        awayScorers.length +
                        " away goal(s).",
                        "error"
                    );

                    return;
                }


                try {

                    saveResultBtn.disabled =
                        true;


                    saveResultBtn.textContent =
                        "Saving Result...";


                    showResultMessage(
                        "Saving match result...",
                        ""
                    );


                    // ========================================
                    // CHECK EXISTING RESULT
                    // ========================================

                    const {
                        data: existingResult,
                        error: existingError
                    } =
                        await supabaseClient
                            .from("results")
                            .select(
                                "id"
                            )
                            .eq(
                                "fixture_id",
                                currentFixture.id
                            )
                            .maybeSingle();


                    if (existingError) {
                        throw existingError;
                    }


                    if (existingResult) {

                        throw new Error(
                            "This fixture already has a result."
                        );
                    }


                    // ========================================
                    // INSERT RESULT
                    // ========================================

                    const {
                        data: result,
                        error: resultError
                    } =
                        await supabaseClient
                            .from("results")
                            .insert({

                                fixture_id:
                                    currentFixture.id,

                                home_score:
                                    homeFinalScore,

                                away_score:
                                    awayFinalScore,

                                match_report:
                                    matchReport
                                        ? matchReport.value.trim() ||
                                          null
                                        : null

                            })
                            .select(
                                "id"
                            )
                            .single();


                    if (resultError) {
                        throw resultError;
                    }


                    // ========================================
                    // INSERT GOAL SCORERS
                    // ========================================

                    const allGoals =
                        [
                            ...homeScorers,
                            ...awayScorers
                        ].map(
                            function (goal) {

                                return {

                                    result_id:
                                        result.id,

                                    player_id:
                                        goal.player_id,

                                    minute:
                                        goal.minute

                                };

                            }
                        );


                    if (
                        allGoals.length > 0
                    ) {

                        const {
                            error: goalError
                        } =
                            await supabaseClient
                                .from("goal_scorers")
                                .insert(
                                    allGoals
                                );


                        if (goalError) {

                            await supabaseClient
                                .from("results")
                                .delete()
                                .eq(
                                    "id",
                                    result.id
                                );


                            throw goalError;
                        }
                    }


                    // ========================================
                    // MARK FIXTURE COMPLETED
                    // ========================================

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
                                currentFixture.id
                            );


                    if (
                        fixtureUpdateError
                    ) {

                        console.error(
                            "Fixture status update error:",
                            fixtureUpdateError
                        );


                        throw new Error(
                            "Result was saved, but the fixture could not be marked Completed. " +
                            fixtureUpdateError.message
                        );
                    }


                    // ========================================
                    // SUCCESS
                    // ========================================

                    showResultMessage(
                        "✅ Match result saved successfully!",
                        "success"
                    );


                    alert(
                        "✅ Match result saved successfully!"
                    );


                    if (homeGoalsContainer) {

                        homeGoalsContainer.innerHTML =
                            "";
                    }


                    if (awayGoalsContainer) {

                        awayGoalsContainer.innerHTML =
                            "";
                    }


                    if (homeScore) {

                        homeScore.value =
                            0;
                    }


                    if (awayScore) {

                        awayScore.value =
                            0;
                    }


                    if (matchReport) {

                        matchReport.value =
                            "";
                    }


                    if (resultScoreSection) {

                        resultScoreSection.style.display =
                            "none";
                    }


                    if (selectedFixtureInfo) {

                        selectedFixtureInfo.style.display =
                            "none";
                    }


                    currentFixture =
                        null;


                    await loadFixtures();

                    await loadResultFixtures();


                    if (resultFixtureSelect) {

                        resultFixtureSelect.value =
                            "";
                    }


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


                } finally {

                    saveResultBtn.disabled =
                        false;


                    saveResultBtn.textContent =
                        "💾 SAVE RESULT";
                }

            }
        );
    }


    // ========================================
    // LOAD PENDING TEAMS
    // ========================================

    async function loadPendingTeams() {

        if (!pendingTeams) {
            return;
        }


        pendingTeams.innerHTML =
            "<div class='empty-message'>Loading registrations...</div>";


        try {

            const {
                data: teams,
                error
            } =
                await supabaseClient
                    .from("teams")
                    .select(
                        "id, name, short_name, location, coach_name, captain_name, vice_captain_name, discipline_master_name, phone, email, registration_status, created_at"
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
                    );


            if (error) {
                throw error;
            }


            if (
                !teams ||
                teams.length === 0
            ) {

                pendingTeams.innerHTML =
                    "<div class='empty-message'>🎉 No pending team registrations.</div>";

                return;
            }


            pendingTeams.innerHTML =
                "";


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
                            "id, full_name, jersey_number, position, registration_status"
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
                    throw playersError;
                }


                let playersHtml =
                    "<p>No players registered.</p>";


                if (
                    players &&
                    players.length > 0
                ) {

                    playersHtml = `

                        <div style="overflow-x:auto;">

                            <table class="players-table">

                                <thead>

                                    <tr>

                                        <th>#</th>
                                        <th>Player</th>
                                        <th>Position</th>
                                        <th>Status</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    ${
                                        players.map(
                                            function (player) {

                                                return `

                                                    <tr>

                                                        <td>
                                                            ${escapeHtml(
                                                                player.jersey_number
                                                            )}
                                                        </td>

                                                        <td>
                                                            ${escapeHtml(
                                                                player.full_name
                                                            )}
                                                        </td>

                                                        <td>
                                                            ${escapeHtml(
                                                                player.position ||
                                                                "-"
                                                            )}
                                                        </td>

                                                        <td>
                                                            ${escapeHtml(
                                                                player.registration_status ||
                                                                "-"
                                                            )}
                                                        </td>

                                                    </tr>

                                                `;
                                            }
                                        ).join("")
                                    }

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
                    "admin-card registration-card";


                card.innerHTML = `

                    <h2>
                        ⚽
                        ${escapeHtml(
                            team.name
                        )}
                    </h2>


                    <p>
                        <strong>Short Name:</strong>
                        ${escapeHtml(
                            team.short_name ||
                            "-"
                        )}
                    </p>


                    <div class="team-details">

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
                        (${players ? players.length : 0}/20)
                    </h3>


                    ${playersHtml}


                    <div style="margin-top:20px;">

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

                    </div>

                `;


                pendingTeams.appendChild(
                    card
                );


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
            }


        } catch (error) {

            console.error(
                "Pending teams error:",
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

    async function approveTeam(id) {

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
                        id
                    );


            if (teamError) {
                throw teamError;
            }


            const {
                error: playerError
            } =
                await supabaseClient
                    .from("players")
                    .update({
                        registration_status:
                            "Approved"
                    })
                    .eq(
                        "team_id",
                        id
                    );


            if (playerError) {
                throw playerError;
            }


            alert(
                "✅ Team approved successfully!"
            );


            await loadPendingTeams();

            await loadApprovedTeams();

            await loadResultFixtures();


        } catch (error) {

            console.error(
                "Approve team error:",
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

    async function rejectTeam(id) {

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
                        id
                    );


            if (teamError) {
                throw teamError;
            }


            const {
                error: playerError
            } =
                await supabaseClient
                    .from("players")
                    .update({
                        registration_status:
                            "Rejected"
                    })
                    .eq(
                        "team_id",
                        id
                    );


            if (playerError) {
                throw playerError;
            }


            alert(
                "Team registration rejected."
            );


            await loadPendingTeams();


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


    // Load everything independently.
    // This prevents one failed section from
    // stopping all the other sections.

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
