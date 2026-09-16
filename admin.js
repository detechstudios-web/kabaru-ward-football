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
        document.getElementById(
            "createCompetitionButton"
        );

    const competitionFormMessage =
        document.getElementById(
            "competitionFormMessage"
        );


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

        statusMessage.textContent =
            message;

        statusMessage.style.display =
            "block";

        statusMessage.className =
            "status-message " +
            (type || "");
    }


    function showFixtureMessage(message, type) {

        if (!fixtureFormMessage) return;

        fixtureFormMessage.textContent =
            message;

        fixtureFormMessage.style.display =
            "block";

        fixtureFormMessage.className =
            "fixture-form-message " +
            (type || "");
    }


    function showResultMessage(message, type) {

        if (!resultFormMessage) return;

        resultFormMessage.textContent =
            message;

        resultFormMessage.style.display =
            "block";

        resultFormMessage.className =
            "result-form-message " +
            (type || "");
    }


    // ========================================
    // CHECK SUPABASE
    // ========================================

    function supabaseReady() {

        if (
            typeof window.supabase ===
            "undefined"
        ) {

            showMessage(
                "❌ Supabase library did not load.",
                "error"
            );

            return false;
        }


        if (
            typeof supabaseClient ===
                "undefined" ||
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

                    logoutBtn.disabled =
                        true;

                    logoutBtn.textContent =
                        "Logging out...";


                    const {
                        error
                    } =
                        await supabaseClient
                            .auth
                            .signOut();


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


                    logoutBtn.disabled =
                        false;

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
                await supabaseClient
                    .auth
                    .getUser();


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
            '<div class="empty-message">' +
            'Loading competitions...' +
            '</div>';


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
                    '<option value="">' +
                    'Select competition' +
                    '</option>';


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


                        competitionSelect
                            .appendChild(
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
    // COMPETITION SQUAD MANAGEMENT SETTINGS
    // ========================================

    async function loadCompetitionRegistrationSettings() {

        const competitionsList =
            document.getElementById(
                "competitionsList"
            );


        if (!competitionsList) {
            return;
        }


        // ----------------------------------------
        // CREATE SETTINGS CONTAINER
        // ----------------------------------------

        let settingsContainer =
            document.getElementById(
                "competitionRegistrationSettings"
            );


        if (!settingsContainer) {

            settingsContainer =
                document.createElement("div");

            settingsContainer.id =
                "competitionRegistrationSettings";

            settingsContainer.style.cssText = `
                margin-top:25px;
            `;

            competitionsList.parentNode.insertBefore(
                settingsContainer,
                competitionsList.nextSibling
            );
        }


        settingsContainer.innerHTML = `
            <div class="admin-card">

                <h2 style="
                    margin-bottom:8px;
                    color:#04351f;
                ">
                    ⚙️ Squad Registration Controls
                </h2>

                <p style="
                    color:#666;
                    margin-bottom:20px;
                    line-height:1.6;
                ">
                    Control when teams are allowed to request
                    squad and team changes for each competition.
                    Changes remain pending until an administrator
                    approves them.
                </p>

                <div id="competitionSettingsList">

                    <div class="empty-message">
                        Loading squad controls...
                    </div>

                </div>

            </div>
        `;


        const settingsList =
            document.getElementById(
                "competitionSettingsList"
            );


        if (!settingsList) {
            return;
        }


        try {

            // ----------------------------------------
            // LOAD COMPETITIONS
            // ----------------------------------------

            const {
                data: competitions,
                error: competitionError
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
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            if (competitionError) {
                throw competitionError;
            }


            if (
                !competitions ||
                competitions.length === 0
            ) {

                settingsList.innerHTML = `
                    <div class="empty-message">
                        No competitions available.
                    </div>
                `;

                return;
            }


            // ----------------------------------------
            // LOAD EXISTING SETTINGS
            // ----------------------------------------

            const {
                data: settings,
                error: settingsError
            } =
                await supabaseClient
                    .from(
                        "competition_registration_settings"
                    )
                    .select("*");


            if (settingsError) {
                throw settingsError;
            }


            const settingsMap = {};


            (settings || []).forEach(
                function (setting) {

                    settingsMap[
                        String(
                            setting.competition_id
                        )
                    ] = setting;

                }
            );


            // ----------------------------------------
            // RENDER
            // ----------------------------------------

            settingsList.innerHTML =
                "";


            competitions.forEach(
                function (competition) {

                    const existing =
                        settingsMap[
                            String(
                                competition.id
                            )
                        ] || {};


                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "admin-card";


                    card.style.cssText = `
                        margin-top:15px;
                        border-left:5px solid #f5c542;
                        background:#fff;
                    `;


                    // ----------------------------------------
                    // SAFE VALUES
                    // ----------------------------------------

                    const updatesAllowed =
                        existing.updates_allowed === true;

                    const allowAddPlayers =
                        existing.allow_add_players !== false;

                    const allowRemovePlayers =
                        existing.allow_remove_players !== false;

                    const allowEditPlayers =
                        existing.allow_edit_players !== false;

                    const allowEditTeam =
                        existing.allow_edit_team !== false;

                    const registrationLocked =
                        existing.registration_locked === true;

                    const maxSquadSize =
                        Number(
                            existing.max_squad_size || 20
                        );


                    // ----------------------------------------
                    // DATETIME FORMATTER
                    // ----------------------------------------

                    function datetimeLocalValue(
                        value
                    ) {

                        if (!value) {
                            return "";
                        }


                        const date =
                            new Date(value);


                        if (
                            Number.isNaN(
                                date.getTime()
                            )
                        ) {
                            return "";
                        }


                        const pad =
                            function (number) {

                                return String(
                                    number
                                ).padStart(
                                    2,
                                    "0"
                                );
                            };


                        return (
                            date.getFullYear() +
                            "-" +
                            pad(
                                date.getMonth() + 1
                            ) +
                            "-" +
                            pad(
                                date.getDate()
                            ) +
                            "T" +
                            pad(
                                date.getHours()
                            ) +
                            ":" +
                            pad(
                                date.getMinutes()
                            )
                        );
                    }


                    card.innerHTML = `

                        <div style="
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            gap:15px;
                            flex-wrap:wrap;
                            margin-bottom:15px;
                        ">

                            <div>

                                <h3 style="
                                    margin:0 0 5px 0;
                                    color:#04351f;
                                ">
                                    🏆
                                    ${escapeHtml(
                                        competition.name
                                    )}
                                </h3>

                                <div style="
                                    color:#666;
                                    font-size:14px;
                                ">
                                    ${escapeHtml(
                                        competition.competition_type ||
                                        "Competition"
                                    )}
                                    •
                                    Season
                                    ${escapeHtml(
                                        competition.season ||
                                        "-"
                                    )}
                                </div>

                            </div>


                            <div style="
                                font-size:13px;
                                font-weight:800;
                                padding:7px 12px;
                                border-radius:20px;
                                background:${
                                    updatesAllowed
                                        ? "#e8f7ee"
                                        : "#f3f3f3"
                                };
                                color:${
                                    updatesAllowed
                                        ? "#087f3e"
                                        : "#777"
                                };
                            ">

                                ${
                                    updatesAllowed
                                        ? "🟢 UPDATES OPEN"
                                        : "🔴 UPDATES CLOSED"
                                }

                            </div>

                        </div>


                        <!-- MASTER SWITCH -->

                        <div style="
                            padding:15px;
                            background:#f7f9f8;
                            border-radius:10px;
                            margin-bottom:15px;
                        ">

                            <label style="
                                display:flex;
                                align-items:center;
                                gap:10px;
                                font-weight:900;
                                cursor:pointer;
                            ">

                                <input
                                    type="checkbox"
                                    id="updatesAllowed-${competition.id}"
                                    ${
                                        updatesAllowed
                                            ? "checked"
                                            : ""
                                    }
                                >

                                🟢 Allow squad/team change requests

                            </label>

                        </div>


                        <!-- PERMISSIONS -->

                        <div style="
                            display:grid;
                            grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
                            gap:12px;
                            margin-bottom:15px;
                        ">

                            <label style="
                                display:flex;
                                align-items:center;
                                gap:8px;
                                padding:12px;
                                border:1px solid #ddd;
                                border-radius:8px;
                                cursor:pointer;
                            ">

                                <input
                                    type="checkbox"
                                    id="allowAdd-${competition.id}"
                                    ${
                                        allowAddPlayers
                                            ? "checked"
                                            : ""
                                    }
                                >

                                ➕ Add players

                            </label>


                            <label style="
                                display:flex;
                                align-items:center;
                                gap:8px;
                                padding:12px;
                                border:1px solid #ddd;
                                border-radius:8px;
                                cursor:pointer;
                            ">

                                <input
                                    type="checkbox"
                                    id="allowRemove-${competition.id}"
                                    ${
                                        allowRemovePlayers
                                            ? "checked"
                                            : ""
                                    }
                                >

                                ➖ Remove players

                            </label>


                            <label style="
                                display:flex;
                                align-items:center;
                                gap:8px;
                                padding:12px;
                                border:1px solid #ddd;
                                border-radius:8px;
                                cursor:pointer;
                            ">

                                <input
                                    type="checkbox"
                                    id="allowEdit-${competition.id}"
                                    ${
                                        allowEditPlayers
                                            ? "checked"
                                            : ""
                                    }
                                >

                                ✏️ Edit players

                            </label>


                            <label style="
                                display:flex;
                                align-items:center;
                                gap:8px;
                                padding:12px;
                                border:1px solid #ddd;
                                border-radius:8px;
                                cursor:pointer;
                            ">

                                <input
                                    type="checkbox"
                                    id="allowEditTeam-${competition.id}"
                                    ${
                                        allowEditTeam
                                            ? "checked"
                                            : ""
                                    }
                                >

                                🏷️ Edit team

                            </label>

                        </div>


                        <!-- DATE WINDOW -->

                        <div style="
                            display:grid;
                            grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
                            gap:15px;
                            margin-bottom:15px;
                        ">

                            <div>

                                <label
                                    for="startDatetime-${competition.id}"
                                    style="
                                        display:block;
                                        font-weight:800;
                                        margin-bottom:6px;
                                    "
                                >
                                    📅 Opening Date & Time
                                </label>

                                <input
                                    type="datetime-local"
                                    id="startDatetime-${competition.id}"
                                    class="form-control"
                                    value="${datetimeLocalValue(
                                        existing.start_datetime
                                    )}"
                                >

                            </div>


                            <div>

                                <label
                                    for="endDatetime-${competition.id}"
                                    style="
                                        display:block;
                                        font-weight:800;
                                        margin-bottom:6px;
                                    "
                                >
                                    📅 Closing Date & Time
                                </label>

                                <input
                                    type="datetime-local"
                                    id="endDatetime-${competition.id}"
                                    class="form-control"
                                    value="${datetimeLocalValue(
                                        existing.end_datetime
                                    )}"
                                >

                            </div>

                        </div>


                        <!-- MAX SQUAD SIZE -->

                        <div style="
                            margin-bottom:15px;
                        ">

                            <label
                                for="maxSquad-${competition.id}"
                                style="
                                    display:block;
                                    font-weight:800;
                                    margin-bottom:6px;
                                "
                            >
                                👥 Maximum Squad Size
                            </label>

                            <input
                                type="number"
                                id="maxSquad-${competition.id}"
                                class="form-control"
                                min="1"
                                max="100"
                                value="${maxSquadSize}"
                            >

                        </div>


                        <!-- LOCK -->

                        <div style="
                            padding:15px;
                            background:#fff8e1;
                            border:1px solid #f5c542;
                            border-radius:10px;
                            margin-bottom:15px;
                        ">

                            <label style="
                                display:flex;
                                align-items:center;
                                gap:10px;
                                font-weight:900;
                                cursor:pointer;
                            ">

                                <input
                                    type="checkbox"
                                    id="registrationLocked-${competition.id}"
                                    ${
                                        registrationLocked
                                            ? "checked"
                                            : ""
                                    }
                                >

                                🔒 Lock registration completely

                            </label>

                            <div style="
                                margin-top:8px;
                                color:#666;
                                font-size:13px;
                                line-height:1.5;
                            ">
                                When locked, teams cannot submit
                                new squad or team change requests
                                for this competition.
                            </div>

                        </div>


                        <button
                            type="button"
                            class="btn btn-primary"
                            onclick="saveCompetitionRegistrationSettings(${competition.id})"
                        >
                            💾 Save Competition Controls
                        </button>

                        <div
                            id="competitionSettingsMessage-${competition.id}"
                            style="
                                display:none;
                                margin-top:10px;
                                padding:10px;
                                border-radius:8px;
                                font-size:14px;
                            "
                        ></div>

                    `;


                    settingsList.appendChild(
                        card
                    );

                }
            );


        } catch (error) {

            console.error(
                "COMPETITION SETTINGS ERROR:",
                error
            );


            settingsList.innerHTML = `
                <div class="empty-message">
                    ❌ Unable to load squad controls:
                    ${escapeHtml(
                        error.message ||
                        "Unknown error"
                    )}
                </div>
            `;
        }
    }


    // ========================================
    // SAVE COMPETITION REGISTRATION SETTINGS
    // ========================================

    window.saveCompetitionRegistrationSettings =
        async function (competitionId) {

            const updatesAllowedEl =
                document.getElementById(
                    "updatesAllowed-" +
                    competitionId
                );

            const allowAddEl =
                document.getElementById(
                    "allowAdd-" +
                    competitionId
                );

            const allowRemoveEl =
                document.getElementById(
                    "allowRemove-" +
                    competitionId
                );

            const allowEditEl =
                document.getElementById(
                    "allowEdit-" +
                    competitionId
                );

            const allowEditTeamEl =
                document.getElementById(
                    "allowEditTeam-" +
                    competitionId
                );

            const startDatetimeEl =
                document.getElementById(
                    "startDatetime-" +
                    competitionId
                );

            const endDatetimeEl =
                document.getElementById(
                    "endDatetime-" +
                    competitionId
                );

            const maxSquadEl =
                document.getElementById(
                    "maxSquad-" +
                    competitionId
                );

            const registrationLockedEl =
                document.getElementById(
                    "registrationLocked-" +
                    competitionId
                );

            const messageEl =
                document.getElementById(
                    "competitionSettingsMessage-" +
                    competitionId
                );


            if (!messageEl) {
                return;
            }


            messageEl.style.display =
                "block";

            messageEl.style.background =
                "#f5f5f5";

            messageEl.style.color =
                "#333";

            messageEl.textContent =
                "Saving competition controls...";


            const updatesAllowed =
                updatesAllowedEl
                    ? updatesAllowedEl.checked
                    : false;

            const allowAddPlayers =
                allowAddEl
                    ? allowAddEl.checked
                    : false;

            const allowRemovePlayers =
                allowRemoveEl
                    ? allowRemoveEl.checked
                    : false;

            const allowEditPlayers =
                allowEditEl
                    ? allowEditEl.checked
                    : false;

            const allowEditTeam =
                allowEditTeamEl
                    ? allowEditTeamEl.checked
                    : false;

            const startDatetime =
                startDatetimeEl &&
                startDatetimeEl.value
                    ? new Date(
                        startDatetimeEl.value
                    ).toISOString()
                    : null;

            const endDatetime =
                endDatetimeEl &&
                endDatetimeEl.value
                    ? new Date(
                        endDatetimeEl.value
                    ).toISOString()
                    : null;

            const maxSquadSize =
                maxSquadEl
                    ? Number(
                        maxSquadEl.value
                    )
                    : 20;

            const registrationLocked =
                registrationLockedEl
                    ? registrationLockedEl.checked
                    : false;


            if (
                !Number.isFinite(
                    maxSquadSize
                ) ||
                maxSquadSize < 1
            ) {

                messageEl.style.background =
                    "#fdecec";

                messageEl.style.color =
                    "#b00020";

                messageEl.textContent =
                    "❌ Maximum squad size must be at least 1.";

                return;
            }


            if (
                startDatetime &&
                endDatetime &&
                new Date(startDatetime) >
                    new Date(endDatetime)
            ) {

                messageEl.style.background =
                    "#fdecec";

                messageEl.style.color =
                    "#b00020";

                messageEl.textContent =
                    "❌ Opening date/time cannot be after closing date/time.";

                return;
            }


            try {

                const {
                    error
                } =
                    await supabaseClient
                        .from(
                            "competition_registration_settings"
                        )
                        .upsert(
                            {
                                competition_id:
                                    competitionId,

                                updates_allowed:
                                    updatesAllowed,

                                allow_add_players:
                                    allowAddPlayers,

                                allow_remove_players:
                                    allowRemovePlayers,

                                allow_edit_players:
                                    allowEditPlayers,

                                allow_edit_team:
                                    allowEditTeam,

                                start_datetime:
                                    startDatetime,

                                end_datetime:
                                    endDatetime,

                                max_squad_size:
                                    maxSquadSize,

                                registration_locked:
                                    registrationLocked
                            },
                            {
                                onConflict:
                                    "competition_id"
                            }
                        );


            if (error) {
                throw error;
            }


            messageEl.style.background =
                "#e8f7ee";

            messageEl.style.color =
                "#087f3e";

            messageEl.textContent =
                "✅ Competition controls saved successfully.";


            } catch (error) {

                console.error(
                    "SAVE COMPETITION SETTINGS ERROR:",
                    error
                );


                messageEl.style.background =
                    "#fdecec";

                messageEl.style.color =
                    "#b00020";

                messageEl.textContent =
                    "❌ Unable to save competition controls: " +
                    (
                        error.message ||
                        "Unknown error"
                    );
            }
        };


    // ========================================
    // CREATE COMPETITION
    // ========================================

    if (competitionForm) {

        competitionForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


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
                        ? String(
                            seasonInput.value
                        ).trim()
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

                                name:
                                    name,

                                competition_type:
                                    competitionType,

                                season:
                                    season,

                                start_date:
                                    startDate,

                                end_date:
                                    endDate,

                                status:
                                    status,

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
                        "Home team and away team cannot be the same.",
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


                try {

                    const {
                        data,
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
                                    venue ||
                                    null,

                                matchday:
                                    matchdayValue ||
                                    null,

                                status:
                                    statusValue

                            })
                            .select()
                            .single();


                    if (error) {
                        throw error;
                    }


                    showFixtureMessage(
                        "Fixture created successfully.",
                        "success"
                    );


                    if (fixtureForm) {
                        fixtureForm.reset();
                    }


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


        fixturesList.innerHTML =
            '<div class="empty-message">' +
            'Loading fixtures...' +
            '</div>';


        try {

            const {
                data,
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
                        created_at,
                        competition:competitions (
                            id,
                            name,
                            season
                        ),
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
                    .order(
                        "match_date",
                        {
                            ascending: false
                        }
                    );


            if (error) {
                throw error;
            }


            if (
                !data ||
                data.length === 0
            ) {

                fixturesList.innerHTML =
                    '<div class="empty-message">' +
                    'No fixtures found.' +
                    '</div>';

                return;
            }


            let html = "";


            data.forEach(
                function (fixture) {

                    const competition =
                        fixture.competition ||
                        {};

                    const home =
                        fixture.home_team ||
                        {};

                    const away =
                        fixture.away_team ||
                        {};

                    const fixtureStatusValue =
                        fixture.status ||
                        "Scheduled";


                    html += `

                        <div
                            class="admin-card"
                            style="
                                margin-top:15px;
                                border-left:5px solid #16803c;
                            "
                        >

                            <div style="
                                display:flex;
                                justify-content:space-between;
                                align-items:flex-start;
                                gap:15px;
                                flex-wrap:wrap;
                            ">

                                <div style="flex:1;">

                                    <h3>
                                        ⚽
                                        ${escapeHtml(
                                            home.name ||
                                            "Home Team"
                                        )}
                                        vs
                                        ${escapeHtml(
                                            away.name ||
                                            "Away Team"
                                        )}
                                    </h3>

                                    <p>
                                        <strong>Competition:</strong>
                                        ${escapeHtml(
                                            competition.name ||
                                            "Competition"
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
                                        <strong>Date:</strong>
                                        ${formatDate(
                                            fixture.match_date
                                        )}
                                    </p>

                                    <p>
                                        <strong>Kick-off:</strong>
                                        ${escapeHtml(
                                            fixture.kick_off ||
                                            "-"
                                        )}
                                    </p>

                                    <p>
                                        <strong>Venue:</strong>
                                        ${escapeHtml(
                                            fixture.venue ||
                                            "-"
                                        )}
                                    </p>

                                    <p>
                                        <strong>Matchday:</strong>
                                        ${escapeHtml(
                                            fixture.matchday ||
                                            "-"
                                        )}
                                    </p>

                                    <p>
                                        <strong>Status:</strong>
                                        ${escapeHtml(
                                            fixtureStatusValue
                                        )}
                                    </p>

                                </div>


                                <div style="
                                    display:flex;
                                    gap:8px;
                                    flex-wrap:wrap;
                                ">

                                    <button
                                        type="button"
                                        class="btn btn-danger"
                                        onclick="deleteFixture(${Number(
                                            fixture.id
                                        )})"
                                    >
                                        🗑️ Delete Fixture
                                    </button>

                                </div>

                            </div>

                        </div>

                    `;
                }
            );


            fixturesList.innerHTML =
                html;


        } catch (error) {

            console.error(
                "LOAD FIXTURES ERROR:",
                error
            );


            fixturesList.innerHTML =
                '<div class="empty-message">' +
                '❌ Unable to load fixtures: ' +
                escapeHtml(
                    error.message ||
                    "Unknown error"
                ) +
                '</div>';
        }
    }


    // ========================================
    // DELETE FIXTURE
    // ========================================

    window.deleteFixture =
        async function (fixtureId) {

            if (
                !window.confirm(
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


                showFixtureMessage(
                    "Fixture deleted successfully.",
                    "success"
                );


                await loadFixtures();


            } catch (error) {

                console.error(
                    "DELETE FIXTURE ERROR:",
                    error
                );


                showFixtureMessage(
                    "Unable to delete fixture: " +
                    (
                        error.message ||
                        "Unknown error"
                    ),
                    "error"
                );
            }
        };


    // ========================================
    // LOAD RESULT FIXTURES
    // ========================================

    async function loadResultFixtures() {

        if (!resultFixtureSelect) {
            return;
        }


        resultFixtureSelect.innerHTML =
            "<option value=''>Loading fixtures...</option>";


        try {

            const {
                data,
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
                        competition:competitions (
                            id,
                            name,
                            season
                        ),
                        home_team:teams!fixtures_home_team_id_fkey (
                            id,
                            name,
                            short_name
                        ),
                        away_team:teams!fixtures_away_team_id_fkey (
                            id,
                            name,
                            short_name
                        )
                    `)
                    .order(
                        "match_date",
                        {
                            ascending: false
                        }
                    );


            if (error) {
                throw error;
            }


            resultFixtures =
                data || [];


            resultFixtureSelect.innerHTML =
                "<option value=''>Select fixture</option>";


            resultFixtures.forEach(
                function (fixture) {

                    const home =
                        fixture.home_team ||
                        {};

                    const away =
                        fixture.away_team ||
                        {};

                    const competition =
                        fixture.competition ||
                        {};


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        fixture.id;


                    option.textContent =
                        formatDate(
                            fixture.match_date
                        ) +
                        " | " +
                        (
                            home.name ||
                            "Home"
                        ) +
                        " vs " +
                        (
                            away.name ||
                            "Away"
                        ) +
                        " | " +
                        (
                            competition.name ||
                            "Competition"
                        );


                    resultFixtureSelect
                        .appendChild(
                            option
                        );

                }
            );


        } catch (error) {

            console.error(
                "LOAD RESULT FIXTURES ERROR:",
                error
            );


            resultFixtureSelect.innerHTML =
                "<option value=''>Unable to load fixtures</option>";
        }
    }


    // ========================================
    // LOAD PLAYERS FOR RESULT ENTRY
    // ========================================

    async function loadPlayersForResult(
        teamId,
        targetArrayName
    ) {

        try {

            const {
                data,
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
                        photo_url,
                        registration_status
                    `)
                    .eq(
                        "team_id",
                        Number(teamId)
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


            if (
                targetArrayName ===
                "home"
            ) {

                homePlayers =
                    data || [];

            } else {

                awayPlayers =
                    data || [];
            }


            return data || [];


        } catch (error) {

            console.error(
                "LOAD PLAYERS ERROR:",
                error
            );


            return [];
        }
    }


    // ========================================
    // RESULT FIXTURE CHANGE
    // ========================================

    if (resultFixtureSelect) {

        resultFixtureSelect.addEventListener(
            "change",
            async function () {

                const fixtureId =
                    this.value;


                if (!fixtureId) {

                    if (selectedFixtureInfo) {
                        selectedFixtureInfo.innerHTML =
                            "";
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
                            return String(
                                fixture.id
                            ) === String(
                                fixtureId
                            );
                        }
                    );


                if (!currentFixture) {
                    return;
                }


                const home =
                    currentFixture.home_team ||
                    {};

                const away =
                    currentFixture.away_team ||
                    {};

                const competition =
                    currentFixture.competition ||
                    {};


                if (selectedFixtureInfo) {

                    selectedFixtureInfo.innerHTML = `

                        <div
                            class="admin-card"
                            style="
                                margin-top:15px;
                                border-left:5px solid #f5c542;
                            "
                        >

                            <h3>
                                ⚽
                                ${escapeHtml(
                                    home.name ||
                                    "Home Team"
                                )}
                                vs
                                ${escapeHtml(
                                    away.name ||
                                    "Away Team"
                                )}
                            </h3>

                            <p>
                                <strong>Competition:</strong>
                                ${escapeHtml(
                                    competition.name ||
                                    "Competition"
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
                                <strong>Date:</strong>
                                ${formatDate(
                                    currentFixture.match_date
                                )}
                            </p>

                            <p>
                                <strong>Kick-off:</strong>
                                ${escapeHtml(
                                    currentFixture.kick_off ||
                                    "-"
                                )}
                            </p>

                            <p>
                                <strong>Venue:</strong>
                                ${escapeHtml(
                                    currentFixture.venue ||
                                    "-"
                                )}
                            </p>

                            <p>
                                <strong>Matchday:</strong>
                                ${escapeHtml(
                                    currentFixture.matchday ||
                                    "-"
                                )}
                            </p>

                        </div>

                    `;
                }


                if (resultHomeTeamName) {

                    resultHomeTeamName.textContent =
                        home.name ||
                        "Home Team";
                }


                if (resultAwayTeamName) {

                    resultAwayTeamName.textContent =
                        away.name ||
                        "Away Team";
                }


                if (homeGoalTeamLabel) {

                    homeGoalTeamLabel.textContent =
                        home.name ||
                        "Home Team";
                }


                if (awayGoalTeamLabel) {

                    awayGoalTeamLabel.textContent =
                        away.name ||
                        "Away Team";
                }


                await loadPlayersForResult(
                    home.id,
                    "home"
                );

                await loadPlayersForResult(
                    away.id,
                    "away"
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
                        "";
                }

                if (awayScore) {
                    awayScore.value =
                        "";
                }


                if (homeGoalWarning) {
                    homeGoalWarning.style.display =
                        "none";
                }

                if (awayGoalWarning) {
                    awayGoalWarning.style.display =
                        "none";
                }


                if (resultScoreSection) {
                    resultScoreSection.style.display =
                        "block";
                }

            }
        );
    }


    // ========================================
    // ADD GOAL ROW
    // ========================================

    function addGoalRow(
        container,
        players,
        teamLabel
    ) {

        if (!container) {
            return;
        }


        const row =
            document.createElement("div");


        row.className =
            "goal-row";


        row.style.cssText = `
            display:grid;
            grid-template-columns:1fr 100px 100px 70px;
            gap:10px;
            margin-bottom:10px;
            align-items:center;
        `;


        const playerSelect =
            document.createElement(
                "select"
            );


        playerSelect.className =
            "form-control";


        playerSelect.innerHTML =
            "<option value=''>Select scorer</option>";


        players.forEach(
            function (player) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    player.id;


                option.textContent =
                    (
                        player.jersey_number
                            ? "#" +
                              player.jersey_number +
                              " "
                            : ""
                    ) +
                    player.full_name;


                playerSelect.appendChild(
                    option
                );

            }
        );


        const minuteInput =
            document.createElement(
                "input"
            );


        minuteInput.type =
            "number";

        minuteInput.min =
            "1";

        minuteInput.max =
            "130";

        minuteInput.placeholder =
            "Minute";

        minuteInput.className =
            "form-control";


        const penaltyLabel =
            document.createElement(
                "label"
            );


        penaltyLabel.style.cssText = `
            display:flex;
            align-items:center;
            gap:5px;
            font-size:13px;
            white-space:nowrap;
        `;


        const penaltyCheckbox =
            document.createElement(
                "input"
            );


        penaltyCheckbox.type =
            "checkbox";


        penaltyLabel.appendChild(
            penaltyCheckbox
        );


        penaltyLabel.appendChild(
            document.createTextNode(
                "Penalty"
            )
        );


        const removeButton =
            document.createElement(
                "button"
            );


        removeButton.type =
            "button";


        removeButton.className =
            "btn btn-danger";


        removeButton.textContent =
            "✖️";


        removeButton.addEventListener(
            "click",
            function () {

                row.remove();

                updateGoalWarnings();

            }
        );


        row.appendChild(
            playerSelect
        );

        row.appendChild(
            minuteInput
        );

        row.appendChild(
            penaltyLabel
        );

        row.appendChild(
            removeButton
        );


        container.appendChild(
            row
        );


        updateGoalWarnings();
    }


    // ========================================
    // UPDATE GOAL WARNINGS
    // ========================================

    function updateGoalWarnings() {

        const homeScoreValue =
            homeScore
                ? Number(
                    homeScore.value ||
                    0
                )
                : 0;

        const awayScoreValue =
            awayScore
                ? Number(
                    awayScore.value ||
                    0
                )
                : 0;


        const homeGoalRows =
            homeGoalsContainer
                ? homeGoalsContainer
                    .querySelectorAll(
                        ".goal-row"
                    )
                    .length
                : 0;

        const awayGoalRows =
            awayGoalsContainer
                ? awayGoalsContainer
                    .querySelectorAll(
                        ".goal-row"
                    )
                    .length
                : 0;


        if (homeGoalWarning) {

            if (
                homeGoalRows !==
                homeScoreValue
            ) {

                homeGoalWarning.style.display =
                    "block";

                homeGoalWarning.textContent =
                    `⚠️ Score is ${homeScoreValue}, but ${homeGoalRows} home goal row(s) have been entered.`;

            } else {

                homeGoalWarning.style.display =
                    "none";
            }
        }


        if (awayGoalWarning) {

            if (
                awayGoalRows !==
                awayScoreValue
            ) {

                awayGoalWarning.style.display =
                    "block";

                awayGoalWarning.textContent =
                    `⚠️ Score is ${awayScoreValue}, but ${awayGoalRows} away goal row(s) have been entered.`;

            } else {

                awayGoalWarning.style.display =
                    "none";
            }
        }
    }


    // ========================================
    // ADD HOME GOAL
    // ========================================

    if (addHomeGoalBtn) {

        addHomeGoalBtn.addEventListener(
            "click",
            function () {

                addGoalRow(
                    homeGoalsContainer,
                    homePlayers,
                    "Home"
                );

            }
        );
    }


    // ========================================
    // ADD AWAY GOAL
    // ========================================

    if (addAwayGoalBtn) {

        addAwayGoalBtn.addEventListener(
            "click",
            function () {

                addGoalRow(
                    awayGoalsContainer,
                    awayPlayers,
                    "Away"
                );

            }
        );
    }


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


                const homeScoreValue =
                    Number(
                        homeScore
                            ? homeScore.value
                            : 0
                    );


                const awayScoreValue =
                    Number(
                        awayScore
                            ? awayScore.value
                            : 0
                    );


                if (
                    !Number.isInteger(
                        homeScoreValue
                    ) ||
                    !Number.isInteger(
                        awayScoreValue
                    ) ||
                    homeScoreValue < 0 ||
                    awayScoreValue < 0
                ) {

                    showResultMessage(
                        "Scores must be valid non-negative numbers.",
                        "error"
                    );

                    return;
                }


                const homeGoalRows =
                    homeGoalsContainer
                        ? Array.from(
                            homeGoalsContainer
                                .querySelectorAll(
                                    ".goal-row"
                                )
                        )
                        : [];


                const awayGoalRows =
                    awayGoalsContainer
                        ? Array.from(
                            awayGoalsContainer
                                .querySelectorAll(
                                    ".goal-row"
                                )
                        )
                        : [];


                if (
                    homeGoalRows.length !==
                    homeScoreValue
                ) {

                    showResultMessage(
                        "The number of home goal entries must match the home score.",
                        "error"
                    );

                    return;
                }


                if (
                    awayGoalRows.length !==
                    awayScoreValue
                ) {

                    showResultMessage(
                        "The number of away goal entries must match the away score.",
                        "error"
                    );

                    return;
                }


                const homeGoals =
                    [];

                const awayGoals =
                    [];


                homeGoalRows.forEach(
                    function (row) {

                        const selects =
                            row.querySelectorAll(
                                "select"
                            );

                        const inputs =
                            row.querySelectorAll(
                                "input"
                            );

                        const playerId =
                            selects[0]
                                ? selects[0].value
                                : "";

                        const minute =
                            inputs[0]
                                ? inputs[0].value
                                : "";

                        const penalty =
                            inputs[1]
                                ? inputs[1].checked
                                : false;


                        if (playerId) {

                            homeGoals.push({
                                player_id:
                                    Number(
                                        playerId
                                    ),
                                minute:
                                    minute
                                        ? Number(
                                            minute
                                        )
                                        : null,
                                is_penalty:
                                    penalty
                            });

                        }

                    }
                );


                awayGoalRows.forEach(
                    function (row) {

                        const selects =
                            row.querySelectorAll(
                                "select"
                            );

                        const inputs =
                            row.querySelectorAll(
                                "input"
                            );

                        const playerId =
                            selects[0]
                                ? selects[0].value
                                : "";

                        const minute =
                            inputs[0]
                                ? inputs[0].value
                                : "";

                        const penalty =
                            inputs[1]
                                ? inputs[1].checked
                                : false;


                        if (playerId) {

                            awayGoals.push({
                                player_id:
                                    Number(
                                        playerId
                                    ),
                                minute:
                                    minute
                                        ? Number(
                                            minute
                                        )
                                        : null,
                                is_penalty:
                                    penalty
                            });

                        }

                    }
                );


                if (
                    homeGoals.length !==
                    homeScoreValue
                ) {

                    showResultMessage(
                        "Every home goal must have a scorer selected.",
                        "error"
                    );

                    return;
                }


                if (
                    awayGoals.length !==
                    awayScoreValue
                ) {

                    showResultMessage(
                        "Every away goal must have a scorer selected.",
                        "error"
                    );

                    return;
                }


                const report =
                    matchReport
                        ? matchReport.value.trim()
                        : "";


                saveResultBtn.disabled =
                    true;

                saveResultBtn.textContent =
                    "Saving...";


                try {

                    // ----------------------------------------
                    // CHECK FOR EXISTING RESULT
                    // ----------------------------------------

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
                                currentFixture.id
                            )
                            .maybeSingle();


                    if (existingResultError) {
                        throw existingResultError;
                    }


                    let resultId;


                    // ----------------------------------------
                    // CREATE OR UPDATE RESULT
                    // ----------------------------------------

                    if (existingResult) {

                        resultId =
                            existingResult.id;


                        const {
                            error
                        } =
                            await supabaseClient
                                .from("results")
                                .update({
                                    home_score:
                                        homeScoreValue,

                                    away_score:
                                        awayScoreValue,

                                    match_report:
                                        report ||
                                        null
                                })
                                .eq(
                                    "id",
                                    resultId
                                );


                        if (error) {
                            throw error;
                        }


                        // Delete old goal scorers
                        const {
                            error:
                                deleteGoalsError
                        } =
                            await supabaseClient
                                .from("goal_scorers")
                                .delete()
                                .eq(
                                    "result_id",
                                    resultId
                                );


                        if (deleteGoalsError) {
                            throw deleteGoalsError;
                        }


                        // Delete old player match stats
                        const {
                            error:
                                deleteStatsError
                        } =
                            await supabaseClient
                                .from(
                                    "player_match_stats"
                                )
                                .delete()
                                .eq(
                                    "result_id",
                                    resultId
                                );


                        if (deleteStatsError) {
                            throw deleteStatsError;
                        }


                    } else {

                        const {
                            data,
                            error
                        } =
                            await supabaseClient
                                .from("results")
                                .insert({
                                    fixture_id:
                                        currentFixture.id,

                                    home_score:
                                        homeScoreValue,

                                    away_score:
                                        awayScoreValue,

                                    match_report:
                                        report ||
                                        null
                                })
                                .select(
                                    "id"
                                )
                                .single();


                        if (error) {
                            throw error;
                        }


                        resultId =
                            data.id;
                    }


                    // ----------------------------------------
                    // INSERT GOAL SCORERS
                    // ----------------------------------------

                    const goalRows =
                        homeGoals.map(
                            function (goal) {

                                return {
                                    result_id:
                                        resultId,

                                    player_id:
                                        goal.player_id,

                                    minute:
                                        goal.minute,

                                    is_penalty:
                                        goal.is_penalty
                                };

                            }
                        ).concat(
                            awayGoals.map(
                                function (goal) {

                                    return {
                                        result_id:
                                            resultId,

                                        player_id:
                                            goal.player_id,

                                        minute:
                                            goal.minute,

                                        is_penalty:
                                            goal.is_penalty
                                    };

                                }
                            )
                        );


                    if (
                        goalRows.length > 0
                    ) {

                        const {
                            error
                        } =
                            await supabaseClient
                                .from(
                                    "goal_scorers"
                                )
                                .insert(
                                    goalRows
                                );


                        if (error) {
                            throw error;
                        }
                    }


                    // ----------------------------------------
                    // CALCULATE PLAYER MATCH STATS
                    // ----------------------------------------

                    const statsMap =
                        {};


                    function addPlayerStat(
                        playerId,
                        goals
                    ) {

                        const key =
                            String(
                                playerId
                            );


                        if (!statsMap[key]) {

                            statsMap[key] = {
                                result_id:
                                    resultId,

                                player_id:
                                    Number(
                                        playerId
                                    ),

                                appearances:
                                    1,

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


                        statsMap[key].goals +=
                            Number(
                                goals || 0
                            );
                    }


                    homeGoals.forEach(
                        function (goal) {

                            addPlayerStat(
                                goal.player_id,
                                1
                            );

                        }
                    );


                    awayGoals.forEach(
                        function (goal) {

                            addPlayerStat(
                                goal.player_id,
                                1
                            );

                        }
                    );


                    const allHomePlayers =
                        homePlayers || [];

                    const allAwayPlayers =
                        awayPlayers || [];


                    allHomePlayers.forEach(
                        function (player) {

                            const key =
                                String(
                                    player.id
                                );

                            if (!statsMap[key]) {

                                statsMap[key] = {
                                    result_id:
                                        resultId,

                                    player_id:
                                        Number(
                                            player.id
                                        ),

                                    appearances:
                                        1,

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

                        }
                    );


                    allAwayPlayers.forEach(
                        function (player) {

                            const key =
                                String(
                                    player.id
                                );

                            if (!statsMap[key]) {

                                statsMap[key] = {
                                    result_id:
                                        resultId,

                                    player_id:
                                        Number(
                                            player.id
                                        ),

                                    appearances:
                                        1,

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

                        }
                    );


                    const statsRows =
                        Object.values(
                            statsMap
                        );


                    if (
                        statsRows.length > 0
                    ) {

                        const {
                            error
                        } =
                            await supabaseClient
                                .from(
                                    "player_match_stats"
                                )
                                .insert(
                                    statsRows
                                );


                        if (error) {
                            throw error;
                        }
                    }


                    // ----------------------------------------
                    // MARK FIXTURE COMPLETED
                    // ----------------------------------------

                    const {
                        error:
                            fixtureUpdateError
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


                    if (fixtureUpdateError) {
                        throw fixtureUpdateError;
                    }


                    showResultMessage(
                        "🎉 Result saved successfully.",
                        "success"
                    );


                    await loadResultFixtures();


                } catch (error) {

                    console.error(
                        "SAVE RESULT ERROR:",
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
    // LOAD PENDING TEAM REGISTRATIONS
    // ========================================

    async function loadPendingTeams() {

        if (!pendingTeams) {
            return;
        }


        pendingTeams.innerHTML =
            '<div class="empty-message">' +
            'Loading pending team registrations...' +
            '</div>';


        try {

            const {
                data,
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
                            ascending: true
                        }
                    );


            if (error) {
                throw error;
            }


            if (
                !data ||
                data.length === 0
            ) {

                pendingTeams.innerHTML =
                    `
                    <div class="empty-message">
                        🎉 No pending team registrations.
                    </div>
                    `;

                return;
            }


            let html = "";


            data.forEach(
                function (team) {

                    html += `
                        <div class="admin-card">

                            <h3>
                                👥
                                ${escapeHtml(
                                    team.name ||
                                    "Unnamed Team"
                                )}
                            </h3>

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

                                <div class="detail">
                                    <strong>Submitted</strong><br>
                                    ${formatDateTime(
                                        team.created_at
                                    )}
                                </div>

                            </div>

                            ${
                                team.logo_url
                                    ? `
                                        <div style="margin-top:15px;">
                                            <img
                                                src="${escapeHtml(
                                                    team.logo_url
                                                )}"
                                                alt="Team logo"
                                                style="
                                                    width:90px;
                                                    height:90px;
                                                    object-fit:contain;
                                                    border:1px solid #ddd;
                                                    border-radius:10px;
                                                "
                                            >
                                        </div>
                                      `
                                    : ""
                            }

                            <div
                                style="
                                    display:flex;
                                    gap:10px;
                                    margin-top:15px;
                                    flex-wrap:wrap;
                                "
                            >

                                <button
                                    type="button"
                                    class="btn btn-primary"
                                    onclick="approveTeam(${Number(
                                        team.id
                                    )})"
                                >
                                    ✅ Approve Team
                                </button>

                                <button
                                    type="button"
                                    class="btn btn-danger"
                                    onclick="rejectTeam(${Number(
                                        team.id
                                    )})"
                                >
                                    ❌ Reject Team
                                </button>

                            </div>

                        </div>
                    `;
                }
            );


            pendingTeams.innerHTML =
                html;


        } catch (error) {

            console.error(
                "LOAD PENDING TEAMS ERROR:",
                error
            );


            pendingTeams.innerHTML =
                `
                <div class="empty-message">
                    ❌ Unable to load pending team registrations:
                    ${escapeHtml(
                        error.message ||
                        "Unknown error"
                    )}
                </div>
                `;
        }
    }


    // ========================================
    // APPROVE TEAM
    // ========================================

    window.approveTeam =
        async function (teamId) {

            if (
                !window.confirm(
                    "Approve this team?"
                )
            ) {
                return;
            }


            try {

                const {
                    error
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


                if (error) {
                    throw error;
                }


                showMessage(
                    "Team approved successfully.",
                    "success"
                );


                await loadPendingTeams();


            } catch (error) {

                console.error(
                    "APPROVE TEAM ERROR:",
                    error
                );


                showMessage(
                    "❌ Unable to approve team: " +
                    (
                        error.message ||
                        "Unknown error"
                    ),
                    "error"
                );
            }
        };


    // ========================================
    // REJECT TEAM
    // ========================================

    window.rejectTeam =
        async function (teamId) {

            if (
                !window.confirm(
                    "Reject this team?"
                )
            ) {
                return;
            }


            try {

                const {
                    error
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


                if (error) {
                    throw error;
                }


                showMessage(
                    "Team rejected successfully.",
                    "success"
                );


                await loadPendingTeams();


            } catch (error) {

                console.error(
                    "REJECT TEAM ERROR:",
                    error
                );


                showMessage(
                    "❌ Unable to reject team: " +
                    (
                        error.message ||
                        "Unknown error"
                    ),
                    "error"
                );
            }
        };


    if (awayScore) {

        awayScore.addEventListener(
            "input",
            updateGoalWarnings
        );
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


                // ========================================
                // VALIDATE SCORES
                // ========================================

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


                // ========================================
                // VALIDATE GOAL MINUTES
                // ========================================

                const homeValidation =
                    validateGoalMinutes(
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
                    validateGoalMinutes(
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


                // ========================================
                // GET GOAL DATA
                // ========================================

                const homeScorers =
                    getScorerData(
                        homeGoalsContainer
                    );


                const awayScorers =
                    getScorerData(
                        awayGoalsContainer
                    );


                // ========================================
                // CHECK GOAL COUNTS
                // ========================================

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


                // ========================================
                // GET APPEARANCES
                // ========================================

                const appearanceValidation =
                    validateAppearances();


                if (
                    !appearanceValidation.valid
                ) {

                    showResultMessage(
                        "❌ " +
                        appearanceValidation.message,
                        "error"
                    );

                    return;
                }


                const appearancePlayers =
                    getAppearancePlayers();


                // ========================================
                // GET ALL GOALS
                // ========================================

                const allGoals =
                    [
                        ...homeScorers,
                        ...awayScorers
                    ];


                // ========================================
                // SCORERS MUST HAVE APPEARED
                // ========================================

                const scorerAppearanceValidation =
                    validateScorersAreAppearances(
                        allGoals,
                        appearancePlayers
                    );


                if (
                    !scorerAppearanceValidation.valid
                ) {

                    showResultMessage(
                        "❌ " +
                        scorerAppearanceValidation.message,
                        "error"
                    );

                    return;
                }


                // ========================================
                // ASSISTS MUST BE VALID
                // ========================================

                const assistValidation =
                    validateAssistProviders(
                        allGoals,
                        appearancePlayers
                    );


                if (
                    !assistValidation.valid
                ) {

                    showResultMessage(
                        "❌ " +
                        assistValidation.message,
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

                    if (
                        allGoals.length > 0
                    ) {

                        const goalRows =
                            allGoals.map(
                                function (goal) {

                                    return {

                                        result_id:
                                            result.id,

                                        player_id:
                                            goal.player_id,

                                        minute:
                                            goal.minute,

                                        assist_player_id:
                                            goal.assist_player_id,

                                        is_penalty:
                                            goal.is_penalty

                                    };
                                }
                            );


                        const {
                            error: goalError
                        } =
                            await supabaseClient
                                .from(
                                    "goal_scorers"
                                )
                                .insert(
                                    goalRows
                                );


                        if (goalError) {

                            await supabaseClient
                                .from(
                                    "results"
                                )
                                .delete()
                                .eq(
                                    "id",
                                    result.id
                                );

                            throw goalError;
                        }
                    }


                    // ========================================
                    // CALCULATE PLAYER GOALS
                    // ========================================

                    const goalCounts = {};


                    allGoals.forEach(
                        function (goal) {

                            goalCounts[
                                goal.player_id
                            ] =
                                (
                                    goalCounts[
                                        goal.player_id
                                    ] || 0
                                ) + 1;

                        }
                    );


                    // ========================================
                    // CALCULATE PLAYER ASSISTS
                    // ========================================

                    const assistCounts = {};


                    allGoals.forEach(
                        function (goal) {

                            if (
                                goal.assist_player_id
                            ) {

                                assistCounts[
                                    goal.assist_player_id
                                ] =
                                    (
                                        assistCounts[
                                            goal.assist_player_id
                                        ] || 0
                                    ) + 1;
                            }

                        }
                    );


                    // ========================================
                    // CREATE PLAYER MATCH STATS
                    // ========================================

                    const playerStats =
                        appearancePlayers.map(
                            function (playerId) {

                                return {

                                    result_id:
                                        result.id,

                                    player_id:
                                        playerId,

                                    appearances:
                                        1,

                                    goals:
                                        goalCounts[
                                            playerId
                                        ] || 0,

                                    assists:
                                        assistCounts[
                                            playerId
                                        ] || 0,

                                    yellow_cards:
                                        0,

                                    red_cards:
                                        0

                                };
                            }
                        );


                    // ========================================
                    // INSERT PLAYER MATCH STATS
                    // ========================================

                    if (
                        playerStats.length > 0
                    ) {

                        const {
                            error: statsError
                        } =
                            await supabaseClient
                                .from(
                                    "player_match_stats"
                                )
                                .insert(
                                    playerStats
                                );


                        if (statsError) {

                            await supabaseClient
                                .from(
                                    "goal_scorers"
                                )
                                .delete()
                                .eq(
                                    "result_id",
                                    result.id
                                );


                            await supabaseClient
                                .from(
                                    "results"
                                )
                                .delete()
                                .eq(
                                    "id",
                                    result.id
                                );

                            throw statsError;
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


                    const appearanceSection =
                        document.getElementById(
                            "appearanceSection"
                        );


                    if (appearanceSection) {
                        appearanceSection.remove();
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
            "<div class='empty-message'>" +
            "Loading registrations..." +
            "</div>";


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
                    "<div class='empty-message'>" +
                    "🎉 No pending team registrations." +
                    "</div>";

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
                        ❌ Unable to Load
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
// SQUAD & TEAM CHANGE REQUESTS
// ADMIN REVIEW SECTION
// ========================================

let squadChangeRequests = [];
let selectedSquadRequest = null;
let squadRequestFilter = "Pending";
let squadRequestSearch = "";

// ----------------------------------------
// CREATE REQUESTS SECTION
// ----------------------------------------

function ensureSquadRequestsDashboard() {

    if (document.getElementById("squadRequestsSection")) {
        return;
    }

    const dashboardSection =
        document.getElementById("dashboard");

    if (!dashboardSection) {
        return;
    }

    const section = document.createElement("section");

    section.id = "squadRequestsSection";

    section.className = "admin-section";

    section.innerHTML = `
        <div class="section-header">
            <div>
                <h2>👥 Squad & Team Change Requests</h2>
                <p>
                    Review requests submitted by approved teams.
                    Changes are only applied after administrator approval.
                </p>
            </div>
        </div>

        <div id="squadRequestCounters"
             class="dashboard-grid">
        </div>

        <div class="form-card"
             style="margin-bottom:20px;">

            <div class="form-group">

                <label for="squadRequestFilter">
                    Filter Requests
                </label>

                <select
                    id="squadRequestFilter"
                    class="form-control"
                >
                    <option value="Pending">
                        Pending
                    </option>

                    <option value="Approved">
                        Approved
                    </option>

                    <option value="Rejected">
                        Rejected
                    </option>

                    <option value="Cancelled">
                        Cancelled
                    </option>

                    <option value="All">
                        All Requests
                    </option>
                </select>

            </div>

            <div class="form-group">

                <label for="squadRequestSearch">
                    Search
                </label>

                <input
                    type="text"
                    id="squadRequestSearch"
                    class="form-control"
                    placeholder="Search team, player or request..."
                >

            </div>

        </div>

        <div id="squadRequestList">

            <div class="loading">
                Loading requests...
            </div>

        </div>
    `;

    dashboardSection.appendChild(section);


    const filter =
        document.getElementById(
            "squadRequestFilter"
        );


    if (filter) {

        filter.addEventListener(
            "change",
            function () {

                squadRequestFilter =
                    this.value;

                renderSquadRequestsDashboard();

            }
        );
    }


    const search =
        document.getElementById(
            "squadRequestSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            function () {

                squadRequestSearch =
                    this.value
                        .trim()
                        .toLowerCase();

                renderSquadRequestsDashboard();

            }
        );
    }
}


// ----------------------------------------
// LOAD SQUAD REQUESTS
// ----------------------------------------

async function loadSquadChangeRequests() {

    const list =
        document.getElementById(
            "squadRequestList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = `
        <div class="loading">
            Loading requests...
        </div>
    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "squad_change_requests"
                )
                .select(`
                    *,
                    teams:team_id (
                        id,
                        name,
                        short_name,
                        logo_url
                    ),
                    players:player_id (
                        id,
                        full_name,
                        jersey_number,
                        position,
                        photo_url
                    ),
                    competitions:competition_id (
                        id,
                        name,
                        season
                    )
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


        squadChangeRequests =
            data || [];


        renderSquadRequestsDashboard();


    } catch (error) {

        console.error(
            "Squad request load error:",
            error
        );


        list.innerHTML = `
            <div class="admin-card">

                <h3>
                    ❌ Unable to Load Requests
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


// ----------------------------------------
// RENDER REQUEST COUNTERS
// ----------------------------------------

function renderSquadRequestCounters() {

    const counters =
        document.getElementById(
            "squadRequestCounters"
        );


    if (!counters) {
        return;
    }


    const pending =
        squadChangeRequests.filter(
            function (request) {
                return request.status === "Pending";
            }
        ).length;


    const approved =
        squadChangeRequests.filter(
            function (request) {
                return request.status === "Approved";
            }
        ).length;


    const rejected =
        squadChangeRequests.filter(
            function (request) {
                return request.status === "Rejected";
            }
        ).length;


    counters.innerHTML = `

        <div class="stat-card">

            <div class="stat-icon">
                ⏳
            </div>

            <div class="stat-number">
                ${pending}
            </div>

            <div class="stat-label">
                Pending
            </div>

        </div>


        <div class="stat-card">

            <div class="stat-icon">
                ✅
            </div>

            <div class="stat-number">
                ${approved}
            </div>

            <div class="stat-label">
                Approved
            </div>

        </div>


        <div class="stat-card">

            <div class="stat-icon">
                ❌
            </div>

            <div class="stat-number">
                ${rejected}
            </div>

            <div class="stat-label">
                Rejected
            </div>

        </div>

    `;
}


// ----------------------------------------
// REQUEST TYPE LABEL
// ----------------------------------------

function squadRequestTypeLabel(type) {

    if (
        type ===
        "Add Player"
    ) {
        return "➕ Add Player";
    }


    if (
        type ===
        "Remove Player"
    ) {
        return "➖ Remove Player";
    }


    if (
        type ===
        "Edit Player"
    ) {
        return "✏️ Edit Player";
    }


    if (
        type ===
        "Edit Team"
    ) {
        return "🏷️ Edit Team";
    }


    return escapeHtml(
        type ||
        "Request"
    );
}


// ----------------------------------------
// RENDER REQUESTS
// ----------------------------------------

function renderSquadRequestsDashboard() {

    renderSquadRequestCounters();


    const list =
        document.getElementById(
            "squadRequestList"
        );


    if (!list) {
        return;
    }


    let requests =
        [...squadChangeRequests];


    if (
        squadRequestFilter !==
        "All"
    ) {

        requests =
            requests.filter(
                function (request) {

                    return (
                        request.status ===
                        squadRequestFilter
                    );

                }
            );
    }


    if (squadRequestSearch) {

        requests =
            requests.filter(
                function (request) {

                    const teamName =
                        request.teams?.name ||
                        "";


                    const playerName =
                        request.players?.full_name ||
                        request.requested_full_name ||
                        "";


                    const requestType =
                        request.request_type ||
                        "";


                    const combined =
                        (
                            teamName +
                            " " +
                            playerName +
                            " " +
                            requestType
                        ).toLowerCase();


                    return combined.includes(
                        squadRequestSearch
                    );

                }
            );
    }


    if (
        requests.length ===
        0
    ) {

        list.innerHTML = `

            <div class="empty">

                No squad or team
                change requests found.

            </div>

        `;

        return;
    }


    list.innerHTML = "";


    requests.forEach(
        function (request) {

            const team =
                request.teams ||
                {};


            const player =
                request.players ||
                {};


            const competition =
                request.competitions ||
                {};


            let statusClass =
                "request-pending";


            if (
                request.status ===
                "Approved"
            ) {

                statusClass =
                    "request-approved";

            }
            else if (
                request.status ===
                "Rejected"
            ) {

                statusClass =
                    "request-rejected";

            }


            const submitted =
                request.created_at
                    ? new Date(
                        request.created_at
                    ).toLocaleString(
                        "en-KE"
                    )
                    : "-";


            const reviewed =
                request.reviewed_at
                    ? new Date(
                        request.reviewed_at
                    ).toLocaleString(
                        "en-KE"
                    )
                    : null;


            let playerPhoto =
                player.photo_url ||
                request.requested_photo_url ||
                "";


            const photo =
                playerPhoto
                    ? `
                        <img
                            src="${escapeHtml(
                                playerPhoto
                            )}"
                            alt="Player photo"
                            style="
                                width:64px;
                                height:64px;
                                object-fit:cover;
                                border-radius:50%;
                                border:2px solid #ddd;
                            "
                        >
                    `
                    : `
                        <div
                            style="
                                width:64px;
                                height:64px;
                                border-radius:50%;
                                background:#eee;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:28px;
                            "
                        >
                            👤
                        </div>
                    `;


            const playerName =
                request.request_type ===
                    "Edit Team"
                    ? (
                        request.requested_full_name ||
                        team.name ||
                        "Team Information"
                    )
                    : (
                        player.full_name ||
                        request.requested_full_name ||
                        "Player"
                    );


            const jersey =
                request.requested_jersey_number ??
                player.jersey_number ??
                null;


            const position =
                request.requested_position ||
                player.position ||
                null;


            const competitionName =
                competition.name ||
                "Club Squad";


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
                        justify-content:space-between;
                        gap:15px;
                        align-items:flex-start;
                        flex-wrap:wrap;
                    "
                >

                    <div
                        style="
                            display:flex;
                            gap:14px;
                            align-items:center;
                        "
                    >

                        ${photo}

                        <div>

                            <h3>
                                ${squadRequestTypeLabel(
                                    request.request_type
                                )}
                            </h3>

                            <p>
                                <strong>
                                    ${escapeHtml(
                                        playerName
                                    )}
                                </strong>
                            </p>

                            <p>
                                Team:
                                ${escapeHtml(
                                    team.name ||
                                    "Unknown Team"
                                )}
                            </p>

                        </div>

                    </div>


                    <div
                        class="${statusClass}"
                        style="
                            padding:8px 12px;
                            border-radius:20px;
                            font-weight:700;
                        "
                    >
                        ${escapeHtml(
                            request.status ||
                            "Pending"
                        )}
                    </div>

                </div>


                <div
                    style="
                        margin-top:15px;
                        display:grid;
                        gap:7px;
                    "
                >

                    ${
                        jersey !== null
                            ? `
                                <p>
                                    <strong>
                                        Jersey:
                                    </strong>
                                    ${escapeHtml(
                                        jersey
                                    )}
                                </p>
                            `
                            : ""
                    }


                    ${
                        position
                            ? `
                                <p>
                                    <strong>
                                        Position:
                                    </strong>
                                    ${escapeHtml(
                                        position
                                    )}
                                </p>
                            `
                            : ""
                    }


                    <p>
                        <strong>
                            Competition:
                        </strong>
                        ${escapeHtml(
                            competitionName
                        )}
                    </p>


                    <p>
                        <strong>
                            Submitted:
                        </strong>
                        ${escapeHtml(
                            submitted
                        )}
                    </p>


                    ${
                        request.reason
                            ? `
                                <p>
                                    <strong>
                                        Reason:
                                    </strong>
                                    ${escapeHtml(
                                        request.reason
                                    )}
                                </p>
                            `
                            : ""
                    }


                    ${
                        request.admin_notes
                            ? `
                                <p>
                                    <strong>
                                        Admin Notes:
                                    </strong>
                                    ${escapeHtml(
                                        request.admin_notes
                                    )}
                                </p>
                            `
                            : ""
                    }


                    ${
                        reviewed
                            ? `
                                <p>
                                    <strong>
                                        Reviewed:
                                    </strong>
                                    ${escapeHtml(
                                        reviewed
                                    )}
                                </p>
                            `
                            : ""
                    }

                </div>


                <div
                    style="
                        margin-top:18px;
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                    "
                >

                    <button
                        type="button"
                        class="btn btn-primary"
                        onclick="openSquadRequestDetails(
                            ${Number(
                                request.id
                            )}
                        )"
                    >
                        👁️ View Details
                    </button>


                    ${
                        request.status ===
                        "Pending"
                            ? `
                                <button
                                    type="button"
                                    class="btn btn-primary"
                                    onclick="approveSquadChangeRequest(
                                        ${Number(
                                            request.id
                                        )}
                                    )"
                                >
                                    ✅ Approve
                                </button>

                                <button
                                    type="button"
                                    class="btn btn-danger"
                                    onclick="rejectSquadChangeRequest(
                                        ${Number(
                                            request.id
                                        )}
                                    )"
                                >
                                    ❌ Reject
                                </button>
                            `
                            : ""
                    }

                </div>

            `;


            list.appendChild(
                card
            );

        }
    );
}


// ----------------------------------------
// OPEN REQUEST DETAILS
// ----------------------------------------

function openSquadRequestDetails(
    requestId
) {

    selectedSquadRequest =
        squadChangeRequests.find(
            function (request) {

                return (
                    Number(
                        request.id
                    ) ===
                    Number(
                        requestId
                    )
                );

            }
        );


    if (!selectedSquadRequest) {

        alert(
            "Request not found."
        );

        return;
    }


    let modal =
        document.getElementById(
            "squadRequestModal"
        );


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );


        modal.id =
            "squadRequestModal";


        modal.style.cssText = `
            position:fixed;
            inset:0;
            background:rgba(0,0,0,.70);
            z-index:99999;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
            overflow:auto;
        `;


        modal.innerHTML = `

            <div
                style="
                    width:100%;
                    max-width:760px;
                    max-height:90vh;
                    overflow:auto;
                    background:#fff;
                    border-radius:16px;
                    box-shadow:0 20px 60px rgba(0,0,0,.30);
                    position:relative;
                    padding:25px;
                "
            >

                <button
                    type="button"
                    id="closeSquadRequestModal"
                    style="
                        position:absolute;
                        right:15px;
                        top:10px;
                        width:40px;
                        height:40px;
                        border:none;
                        background:#f1f1f1;
                        border-radius:50%;
                        font-size:25px;
                        font-weight:900;
                        cursor:pointer;
                    "
                >
                    ×
                </button>


                <div
                    id="squadRequestModalContent"
                ></div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        document
            .getElementById(
                "closeSquadRequestModal"
            )
            ?.addEventListener(
                "click",
                function () {

                    modal.style.display =
                        "none";

                }
            );
    }


    const request =
        selectedSquadRequest;


    const team =
        request.teams ||
        {};


    const player =
        request.players ||
        {};


    const competition =
        request.competitions ||
        {};


    const content =
        document.getElementById(
            "squadRequestModalContent"
        );


    if (!content) {
        return;
    }


    const playerPhoto =
        player.photo_url ||
        request.requested_photo_url ||
        "";


    const photo =
        playerPhoto
            ? `
                <img
                    src="${escapeHtml(
                        playerPhoto
                    )}"
                    alt="Player photo"
                    style="
                        width:110px;
                        height:110px;
                        object-fit:cover;
                        border-radius:50%;
                        border:3px solid #ddd;
                    "
                >
            `
            : `
                <div
                    style="
                        width:110px;
                        height:110px;
                        border-radius:50%;
                        background:#eee;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:45px;
                    "
                >
                    👤
                </div>
            `;


    content.innerHTML = `

        <h2>
            👥 Squad & Team Request Details
        </h2>


        <div
            style="
                margin-top:20px;
                display:flex;
                gap:18px;
                align-items:center;
                flex-wrap:wrap;
            "
        >

            ${photo}

            <div>

                <h3>
                    ${squadRequestTypeLabel(
                        request.request_type
                    )}
                </h3>

                <p>
                    <strong>
                        Team:
                    </strong>
                    ${escapeHtml(
                        team.name ||
                        "Unknown Team"
                    )}
                </p>

            </div>

        </div>


        <div
            style="
                margin-top:20px;
                display:grid;
                gap:9px;
            "
        >

            <p>
                <strong>
                    Request ID:
                </strong>
                ${escapeHtml(
                    request.id
                )}
            </p>


            <p>
                <strong>
                    Request Type:
                </strong>
                ${squadRequestTypeLabel(
                    request.request_type
                )}
            </p>


            ${
                request.player_id
                    ? `
                        <p>
                            <strong>
                                Player ID:
                            </strong>
                            ${escapeHtml(
                                request.player_id
                            )}
                        </p>
                    `
                    : ""
            }


            <p>
                <strong>
                    Player:
                </strong>
                ${escapeHtml(
                    player.full_name ||
                    request.requested_full_name ||
                    "Not applicable"
                )}
            </p>


            ${
                request.requested_jersey_number ??
                player.jersey_number
                    ? `
                        <p>
                            <strong>
                                Jersey:
                            </strong>
                            ${escapeHtml(
                                request.requested_jersey_number ??
                                player.jersey_number
                            )}
                        </p>
                    `
                    : ""
            }


            ${
                request.requested_position ||
                player.position
                    ? `
                        <p>
                            <strong>
                                Position:
                            </strong>
                            ${escapeHtml(
                                request.requested_position ||
                                player.position
                            )}
                        </p>
                    `
                    : ""
            }


            ${
                request.requested_full_name
                    ? `
                        <p>
                            <strong>
                                Requested Name:
                            </strong>
                            ${escapeHtml(
                                request.requested_full_name
                            )}
                        </p>
                    `
                    : ""
            }


            ${
                request.requested_photo_url
                    ? `
                        <p>
                            <strong>
                                Requested Photo:
                            </strong>
                            Uploaded
                        </p>
                    `
                    : ""
            }


            <p>
                <strong>
                    Competition:
                </strong>
                ${escapeHtml(
                    competition.name ||
                    "Club Squad"
                )}
            </p>


            ${
                competition.season
                    ? `
                        <p>
                            <strong>
                                Season:
                            </strong>
                            ${escapeHtml(
                                competition.season
                            )}
                        </p>
                    `
                    : ""
            }


            <p>
                <strong>
                    Status:
                </strong>
                ${escapeHtml(
                    request.status ||
                    "Pending"
                )}
            </p>


            <p>
                <strong>
                    Submitted:
                </strong>
                ${escapeHtml(
                    request.created_at
                        ? new Date(
                            request.created_at
                        ).toLocaleString(
                            "en-KE"
                        )
                        : "-"
                )}
            </p>


            ${
                request.reason
                    ? `
                        <p>
                            <strong>
                                Reason:
                            </strong>
                            ${escapeHtml(
                                request.reason
                            )}
                        </p>
                    `
                    : ""
            }


            ${
                request.admin_notes
                    ? `
                        <p>
                            <strong>
                                Administrator Notes:
                            </strong>
                            ${escapeHtml(
                                request.admin_notes
                            )}
                        </p>
                    `
                    : ""
            }


            ${
                request.reviewed_at
                    ? `
                        <p>
                            <strong>
                                Reviewed:
                            </strong>
                            ${escapeHtml(
                                new Date(
                                    request.reviewed_at
                                ).toLocaleString(
                                    "en-KE"
                                )
                            )}
                        </p>
                    `
                    : ""
            }

        </div>


        ${
            request.status ===
            "Pending"
                ? `
                    <div
                        style="
                            margin-top:25px;
                            display:flex;
                            gap:10px;
                            flex-wrap:wrap;
                        "
                    >

                        <button
                            type="button"
                            class="btn btn-primary"
                            onclick="approveSquadChangeRequest(
                                ${Number(
                                    request.id
                                )}
                            )"
                        >
                            ✅ Approve Request
                        </button>


                        <button
                            type="button"
                            class="btn btn-danger"
                            onclick="rejectSquadChangeRequest(
                                ${Number(
                                    request.id
                                )}
                            )"
                        >
                            ❌ Reject Request
                        </button>

                    </div>
                `
                : ""
        }

    `;


    modal.style.display =
        "flex";
}


// ----------------------------------------
// CLOSE REQUEST DETAILS
// ----------------------------------------

function closeSquadRequestDetails() {

    const modal =
        document.getElementById(
            "squadRequestModal"
        );


    if (modal) {

        modal.style.display =
            "none";
    }
}


// ----------------------------------------
// APPROVE SQUAD REQUEST
// ----------------------------------------

async function approveSquadChangeRequest(
    requestId
) {

    const request =
        squadChangeRequests.find(
            function (item) {

                return (
                    Number(
                        item.id
                    ) ===
                    Number(
                        requestId
                    )
                );

            }
        );


    if (!request) {

        alert(
            "Request not found."
        );

        return;
    }


    if (
        request.status !==
        "Pending"
    ) {

        alert(
            "This request has already been processed."
        );

        return;
    }


    const notes =
        prompt(
            "Enter administrator notes for approval (optional):"
        );


    if (
        notes ===
        null
    ) {

        return;
    }


    const cleanedNotes =
        notes.trim() ||
        "Approved by administrator.";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "approve_squad_change_request",
                {
                    p_request_id:
                        Number(
                            requestId
                        ),
                    p_admin_notes:
                        cleanedNotes
                }
            );


        if (error) {
            throw error;
        }


        if (
            data &&
            data.success ===
            false
        ) {

            throw new Error(
                data.message ||
                "Approval failed."
            );
        }


        showMessage(
            "Squad/team change request approved successfully.",
            "success"
        );


        closeSquadRequestDetails();


        await loadSquadChangeRequests();


        await loadApprovedTeams();


        await loadResultFixtures();


    } catch (error) {

        console.error(
            "Approve squad request error:",
            error
        );


        showMessage(
            "Approval failed: " +
            (
                error.message ||
                "Unknown error"
            ),
            "error"
        );
    }
}


// ----------------------------------------
// REJECT SQUAD REQUEST
// ----------------------------------------

async function rejectSquadChangeRequest(
    requestId
) {

    const request =
        squadChangeRequests.find(
            function (item) {

                return (
                    Number(
                        item.id
                    ) ===
                    Number(
                        requestId
                    )
                );

            }
        );


    if (!request) {

        alert(
            "Request not found."
        );

        return;
    }


    if (
        request.status !==
        "Pending"
    ) {

        alert(
            "This request has already been processed."
        );

        return;
    }


    const notes =
        prompt(
            "Enter the reason for rejecting this request:"
        );


    if (
        notes ===
        null
    ) {

        return;
    }


    const cleanedNotes =
        notes.trim() ||
        "Rejected by administrator.";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "reject_squad_change_request",
                {
                    p_request_id:
                        Number(
                            requestId
                        ),
                    p_admin_notes:
                        cleanedNotes
                }
            );


        if (error) {
            throw error;
        }


        if (
            data &&
            data.success ===
            false
        ) {

            throw new Error(
                data.message ||
                "Rejection failed."
            );
        }


        showMessage(
            "Squad/team change request rejected.",
            "success"
        );


        closeSquadRequestDetails();


        await loadSquadChangeRequests();


    } catch (error) {

        console.error(
            "Reject squad request error:",
            error
        );


        showMessage(
            "Rejection failed: " +
            (
                error.message ||
                "Unknown error"
            ),
            "error"
        );
    }
}


// ========================================
// PLAYER MOVEMENT DASHBOARD
// ADMIN REVIEW SECTION
// ========================================

let playerMovementRequests = [];
let playerMovementCompletedTransfers = [];
let playerMovementFreeAgents = [];
let playerMovementFilter = "Pending";
let playerMovementSearch = "";

function ensurePlayerMovementDashboard() {

    if (document.getElementById("playerMovementSection")) {
        return;
    }

    const dashboardSection =
        document.getElementById("dashboard");

    if (!dashboardSection) {
        return;
    }

    const section = document.createElement("section");

    section.id = "playerMovementSection";
    section.className = "admin-section";
    section.style.marginTop = "24px";

    section.innerHTML = `
        <div class="section-header">
            <div>
                <h2>🔄 Player Movement</h2>
                <p>
                    Manage player releases, transfers, free-agent signings,
                    completed transfers and currently available free agents.
                </p>
            </div>
        </div>

        <div id="playerMovementCounters" class="dashboard-grid"></div>

        <div class="form-card" style="margin-bottom:20px;">
            <div class="form-group">
                <label for="playerMovementFilter">Movement View</label>
                <select id="playerMovementFilter" class="form-control">
                    <option value="Pending">⏳ Pending Movement</option>
                    <option value="Release">📤 Pending Releases</option>
                    <option value="Transfer">🔁 Pending Transfers</option>
                    <option value="Free Agent Signing">🆓 Pending Free-Agent Signings</option>
                    <option value="Completed Transfer">✅ Completed Transfers</option>
                    <option value="Free Agents">🆓 Free Agents</option>
                    <option value="All">📋 All Movement Requests</option>
                </select>
            </div>

            <div class="form-group">
                <label for="playerMovementSearch">Search</label>
                <input
                    type="text"
                    id="playerMovementSearch"
                    class="form-control"
                    placeholder="Search player, team or movement..."
                >
            </div>
        </div>

        <div id="playerMovementList">
            <div class="loading">Loading player movement...</div>
        </div>
    `;

    dashboardSection.appendChild(section);

    const filter =
        document.getElementById("playerMovementFilter");

    if (filter) {
        filter.addEventListener("change", function () {
            playerMovementFilter = this.value;
            renderPlayerMovementDashboard();
        });
    }

    const search =
        document.getElementById("playerMovementSearch");

    if (search) {
        search.addEventListener("input", function () {
            playerMovementSearch = this.value.trim().toLowerCase();
            renderPlayerMovementDashboard();
        });
    }
}

async function loadPlayerMovementDashboard() {

    const list =
        document.getElementById("playerMovementList");

    if (!list) {
        return;
    }

    list.innerHTML = `
        <div class="loading">
            Loading player movement...
        </div>
    `;

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("player_movement_requests")
                .select(`
                    *,
                    players:player_id (
                        id,
                        full_name,
                        jersey_number,
                        position,
                        photo_url,
                        team_id
                    ),
                    from_team:from_team_id (
                        id,
                        name,
                        short_name,
                        logo_url
                    ),
                    to_team:to_team_id (
                        id,
                        name,
                        short_name,
                        logo_url
                    ),
                    competitions:competition_id (
                        id,
                        name,
                        season
                    )
                `)
                .order(
                    "created_at",
                    {
                        ascending:false
                    }
                );

        if (error) {
            throw error;
        }

        playerMovementRequests =
            data || [];

        const {
            data: historyData,
            error: historyError
        } =
            await supabaseClient
                .from("player_club_history")
                .select(`
                    *,
                    players:player_id (
                        id,
                        full_name,
                        jersey_number,
                        position,
                        photo_url
                    ),
                    teams:team_id (
                        id,
                        name,
                        short_name,
                        logo_url
                    )
                `)
                .eq(
                    "movement_type",
                    "Transfer"
                )
                .eq(
                    "status",
                    "Previous"
                )
                .order(
                    "joined_at",
                    {
                        ascending:false
                    }
                );

        if (historyError) {
            throw historyError;
        }

        playerMovementCompletedTransfers =
            historyData || [];

        const {
            data: freeAgentPlayers,
            error: freeAgentError
        } =
            await supabaseClient
                .from("players")
                .select(`
                    id,
                    full_name,
                    jersey_number,
                    position,
                    photo_url,
                    team_id,
                    registration_status
                `)
                .is(
                    "team_id",
                    null
                )
                .eq(
                    "registration_status",
                    "Approved"
                )
                .order(
                    "full_name",
                    {
                        ascending:true
                    }
                );

        if (freeAgentError) {
            throw freeAgentError;
        }

        playerMovementFreeAgents =
            freeAgentPlayers || [];

        renderPlayerMovementDashboard();

    } catch (error) {

        console.error(
            "Player movement load error:",
            error
        );

        list.innerHTML = `
            <div class="admin-card">

                <h3>
                    ❌ Unable to Load Player Movement
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

function movementRequestTypeLabel(type) {

    if (type === "Release") return "📤 Release Player";
    if (type === "Transfer") return "🔁 Player Transfer";
    if (type === "Free Agent Signing") return "🆓 Free-Agent Signing";

    return escapeHtml(type || "Player Movement");
}

function movementStatusBadge(status) {

    const safeStatus =
        status || "Pending";

    let background =
        "#fff3cd";

    let color =
        "#856404";

    if (safeStatus === "Approved") {
        background =
            "#d4edda";

        color =
            "#155724";
    }

    if (safeStatus === "Rejected") {
        background =
            "#f8d7da";

        color =
            "#721c24";
    }

    return `
        <span
            style="
                display:inline-block;
                padding:6px 10px;
                border-radius:20px;
                background:${background};
                color:${color};
                font-weight:700;
            "
        >
            ${escapeHtml(safeStatus)}
        </span>
    `;
}

function movementTeamName(team) {

    if (!team) {
        return "Unknown Team";
    }

    return (
        team.short_name ||
        team.name ||
        "Unknown Team"
    );
}

function renderPlayerMovementCounters() {

    const counters =
        document.getElementById(
            "playerMovementCounters"
        );

    if (!counters) {
        return;
    }

    const pendingReleases =
        playerMovementRequests.filter(
            function (request) {
                return (
                    request.request_type === "Release" &&
                    request.status === "Pending"
                );
            }
        ).length;

    const pendingTransfers =
        playerMovementRequests.filter(
            function (request) {
                return (
                    request.request_type === "Transfer" &&
                    request.status === "Pending"
                );
            }
        ).length;

    const pendingSignings =
        playerMovementRequests.filter(
            function (request) {
                return (
                    request.request_type === "Free Agent Signing" &&
                    request.status === "Pending"
                );
            }
        ).length;

    const completedTransfers =
        playerMovementCompletedTransfers.length;

    const freeAgents =
        playerMovementFreeAgents.length;

    counters.innerHTML = `

        <div class="stat-card">
            <div class="stat-icon">📤</div>
            <div class="stat-number">${pendingReleases}</div>
            <div class="stat-label">Pending Releases</div>
        </div>

        <div class="stat-card">
            <div class="stat-icon">🔁</div>
            <div class="stat-number">${pendingTransfers}</div>
            <div class="stat-label">Pending Transfers</div>
        </div>

        <div class="stat-card">
            <div class="stat-icon">🆓</div>
            <div class="stat-number">${pendingSignings}</div>
            <div class="stat-label">Pending Free-Agent Signings</div>
        </div>

        <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-number">${completedTransfers}</div>
            <div class="stat-label">Completed Transfers</div>
        </div>

        <div class="stat-card">
            <div class="stat-icon">👤</div>
            <div class="stat-number">${freeAgents}</div>
            <div class="stat-label">Free Agents</div>
        </div>

    `;
}

function renderPlayerMovementDashboard() {

    renderPlayerMovementCounters();

    const list =
        document.getElementById(
            "playerMovementList"
        );

    if (!list) {
        return;
    }

    if (
        playerMovementFilter ===
        "Free Agents"
    ) {

        renderPlayerMovementFreeAgents(
            list
        );

        return;
    }

    if (
        playerMovementFilter ===
        "Completed Transfer"
    ) {

        renderPlayerMovementCompletedTransfers(
            list
        );

        return;
    }

    let requests =
        [...playerMovementRequests];

    if (
        playerMovementFilter ===
        "Pending"
    ) {

        requests =
            requests.filter(
                function (request) {
                    return (
                        request.status ===
                        "Pending"
                    );
                }
            );

    }
    else if (
        playerMovementFilter !==
        "All"
    ) {

        requests =
            requests.filter(
                function (request) {
                    return (
                        request.request_type ===
                        playerMovementFilter
                    );
                }
            );
    }

    if (playerMovementSearch) {

        requests =
            requests.filter(
                function (request) {

                    const player =
                        request.players ||
                        {};

                    const fromTeam =
                        request.from_team ||
                        {};

                    const toTeam =
                        request.to_team ||
                        {};

                    const searchText =
                        (
                            player.full_name ||
                            ""
                        ) +
                        " " +
                        (
                            fromTeam.name ||
                            ""
                        ) +
                        " " +
                        (
                            toTeam.name ||
                            ""
                        ) +
                        " " +
                        (
                            request.request_type ||
                            ""
                        );

                    return searchText
                        .toLowerCase()
                        .includes(
                            playerMovementSearch
                        );
                }
            );
    }

    if (
        requests.length ===
        0
    ) {

        list.innerHTML = `

            <div class="empty">

                <div
                    style="
                        font-size:42px;
                        margin-bottom:10px;
                    "
                >
                    🔄
                </div>

                <p>
                    No player movement requests found.
                </p>

            </div>

        `;

        return;
    }

    list.innerHTML = "";

    requests.forEach(
        function (request) {

            const player =
                request.players ||
                {};

            const fromTeam =
                request.from_team ||
                {};

            const toTeam =
                request.to_team ||
                {};

            const competition =
                request.competitions ||
                {};

            const status =
                request.status ||
                "Pending";

            const submitted =
                request.created_at
                    ? new Date(
                        request.created_at
                    ).toLocaleString(
                        "en-KE"
                    )
                    : "-";

            const photo =
                player.photo_url
                    ? `
                        <img
                            src="${escapeHtml(
                                player.photo_url
                            )}"
                            alt="Player photo"
                            style="
                                width:64px;
                                height:64px;
                                object-fit:cover;
                                border-radius:50%;
                                border:2px solid #ddd;
                            "
                        >
                    `
                    : `
                        <div
                            style="
                                width:64px;
                                height:64px;
                                border-radius:50%;
                                background:#eee;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:28px;
                            "
                        >
                            👤
                        </div>
                    `;

            const waitingForTeam =
                request.request_type ===
                    "Transfer" &&
                request.from_team_status !==
                    "Approved";

            const adminActionButtons =
                status === "Pending"
                    ? `
                        <button
                            type="button"
                            class="btn btn-primary"
                            onclick="reviewPlayerMovement(
                                ${Number(request.id)},
                                'approve'
                            )"
                            ${
                                waitingForTeam
                                    ? "disabled style=\"opacity:.55;cursor:not-allowed;\""
                                    : ""
                            }
                        >
                            ✅ Approve
                        </button>

                        <button
                            type="button"
                            class="btn btn-danger"
                            onclick="reviewPlayerMovement(
                                ${Number(request.id)},
                                'reject'
                            )"
                        >
                            ❌ Reject
                        </button>
                    `
                    : "";

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
                        justify-content:space-between;
                        gap:15px;
                        align-items:flex-start;
                        flex-wrap:wrap;
                    "
                >

                    <div
                        style="
                            display:flex;
                            gap:14px;
                            align-items:center;
                        "
                    >

                        ${photo}

                        <div>

                            <h3>
                                ${movementRequestTypeLabel(
                                    request.request_type
                                )}
                            </h3>

                            <p>
                                <strong>
                                    ${escapeHtml(
                                        player.full_name ||
                                        "Unknown Player"
                                    )}
                                </strong>
                            </p>

                            <p>
                                ${escapeHtml(
                                    player.position ||
                                    "Position not available"
                                )}
                                ${
                                    player.jersey_number !== null &&
                                    player.jersey_number !== undefined
                                        ? `
                                            • Jersey
                                            ${escapeHtml(
                                                player.jersey_number
                                            )}
                                        `
                                        : ""
                                }
                            </p>

                        </div>

                    </div>

                    <div>
                        ${movementStatusBadge(
                            status
                        )}
                    </div>

                </div>


                <div
                    style="
                        margin-top:18px;
                        display:grid;
                        gap:7px;
                    "
                >

                    <p>
                        <strong>
                            From Team:
                        </strong>
                        ${escapeHtml(
                            movementTeamName(
                                fromTeam
                            )
                        )}
                    </p>


                    <p>
                        <strong>
                            To Team:
                        </strong>
                        ${
                            request.request_type ===
                            "Release"
                                ? "Free Agent"
                                : escapeHtml(
                                    movementTeamName(
                                        toTeam
                                    )
                                )
                        }
                    </p>


                    <p>
                        <strong>
                            Competition:
                        </strong>
                        ${escapeHtml(
                            competition.name ||
                            "Club Squad"
                        )}
                    </p>


                    <p>
                        <strong>
                            Submitted:
                        </strong>
                        ${escapeHtml(
                            submitted
                        )}
                    </p>


                    <p>
                        <strong>
                            Current Team Approval:
                        </strong>
                        ${escapeHtml(
                            request.from_team_status ||
                            "Not Required"
                        )}
                    </p>


                    <p>
                        <strong>
                            Administrator Approval:
                        </strong>
                        ${escapeHtml(
                            request.admin_status ||
                            status
                        )}
                    </p>


                    ${
                        waitingForTeam
                            ? `
                                <p
                                    style="
                                        color:#856404;
                                        background:#fff3cd;
                                        padding:10px;
                                        border-radius:8px;
                                    "
                                >
                                    ⏳ Waiting for the current team
                                    to approve this transfer before
                                    administrator approval.
                                </p>
                            `
                            : ""
                    }


                    ${
                        request.reason
                            ? `
                                <p>
                                    <strong>
                                        Reason:
                                    </strong>
                                    ${escapeHtml(
                                        request.reason
                                    )}
                                </p>
                            `
                            : ""
                    }

                </div>


                <div
                    style="
                        margin-top:18px;
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                    "
                >

                    ${adminActionButtons}


                    <button
                        type="button"
                        class="btn btn-secondary"
                        onclick="openPlayerMovementDetails(
                            ${Number(request.id)}
                        )"
                    >
                        👁️ View Details
                    </button>

                </div>

            `;

            list.appendChild(
                card
            );
        }
    );
}

function renderPlayerMovementCompletedTransfers(
    list
) {

    if (
        playerMovementCompletedTransfers.length ===
        0
    ) {

        list.innerHTML = `

            <div class="empty">

                <div
                    style="
                        font-size:42px;
                        margin-bottom:10px;
                    "
                >
                    🏆
                </div>

                <p>
                    No completed transfers found.
                </p>

            </div>

        `;

        return;
    }

    let transfers =
        [...playerMovementCompletedTransfers];

    if (playerMovementSearch) {

        transfers =
            transfers.filter(
                function (history) {

                    const player =
                        history.players ||
                        {};

                    const team =
                        history.teams ||
                        {};

                    const text =
                        (
                            player.full_name ||
                            ""
                        ) +
                        " " +
                        (
                            team.name ||
                            ""
                        ) +
                        " Transfer";

                    return text
                        .toLowerCase()
                        .includes(
                            playerMovementSearch
                        );
                }
            );
    }

    if (
        transfers.length ===
        0
    ) {

        list.innerHTML = `
            <div class="empty">
                No completed transfers match your search.
            </div>
        `;

        return;
    }

    list.innerHTML = "";

    transfers.forEach(
        function (history) {

            const player =
                history.players ||
                {};

            const team =
                history.teams ||
                {};

            const joined =
                history.joined_at
                    ? new Date(
                        history.joined_at
                    ).toLocaleDateString(
                        "en-KE"
                    )
                    : "-";

            const left =
                history.left_at
                    ? new Date(
                        history.left_at
                    ).toLocaleDateString(
                        "en-KE"
                    )
                    : "Current";

            const photo =
                player.photo_url
                    ? `
                        <img
                            src="${escapeHtml(
                                player.photo_url
                            )}"
                            alt="Player photo"
                            style="
                                width:64px;
                                height:64px;
                                object-fit:cover;
                                border-radius:50%;
                                border:2px solid #ddd;
                            "
                        >
                    `
                    : `
                        <div
                            style="
                                width:64px;
                                height:64px;
                                border-radius:50%;
                                background:#eee;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:28px;
                            "
                        >
                            👤
                        </div>
                    `;

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
                        justify-content:space-between;
                        gap:15px;
                        align-items:flex-start;
                        flex-wrap:wrap;
                    "
                >

                    <div
                        style="
                            display:flex;
                            gap:14px;
                            align-items:center;
                        "
                    >

                        ${photo}

                        <div>

                            <h3>
                                🏆 Completed Transfer
                            </h3>

                            <p>
                                <strong>
                                    ${escapeHtml(
                                        player.full_name ||
                                        "Unknown Player"
                                    )}
                                </strong>
                            </p>

                            <p>
                                ${escapeHtml(
                                    player.position ||
                                    "Position not available"
                                )}
                                ${
                                    player.jersey_number !== null &&
                                    player.jersey_number !== undefined
                                        ? `
                                            • Jersey
                                            ${escapeHtml(
                                                player.jersey_number
                                            )}
                                        `
                                        : ""
                                }
                            </p>

                        </div>

                    </div>

                    <div>
                        ${movementStatusBadge(
                            "Approved"
                        )}
                    </div>

                </div>


                <div
                    style="
                        margin-top:18px;
                        display:grid;
                        gap:7px;
                    "
                >

                    <p>
                        <strong>
                            Club:
                        </strong>
                        ${escapeHtml(
                            team.name ||
                            "Unknown Team"
                        )}
                    </p>

                    <p>
                        <strong>
                            Joined:
                        </strong>
                        ${escapeHtml(
                            joined
                        )}
                    </p>

                    <p>
                        <strong>
                            Left:
                        </strong>
                        ${escapeHtml(
                            left
                        )}
                    </p>

                    <p>
                        <strong>
                            Movement:
                        </strong>
                        Transfer
                    </p>

                </div>


                <div
                    style="
                        margin-top:18px;
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                    "
                >

                    <a
                        href="player-profile.html?id=${Number(
                            player.id
                        )}"
                        class="btn btn-primary"
                        target="_blank"
                        rel="noopener"
                    >
                        👤 View Player Profile
                    </a>

                </div>

            `;

            list.appendChild(
                card
            );
        }
    );
}

async function renderPlayerMovementFreeAgents(
    list
) {

    let freeAgents =
        [...playerMovementFreeAgents];

    if (playerMovementSearch) {

        freeAgents =
            freeAgents.filter(
                function (player) {

                    return (
                        player.full_name ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            playerMovementSearch
                        );
                }
            );
    }

    if (
        freeAgents.length ===
        0
    ) {

        list.innerHTML = `

            <div class="empty">

                <div
                    style="
                        font-size:42px;
                        margin-bottom:10px;
                    "
                >
                    🆓
                </div>

                <p>
                    No free agents found.
                </p>

            </div>

        `;

        return;
    }

    list.innerHTML = "";

    for (
        const player of freeAgents
    ) {

        let history = null;

        try {

            const {
                data
            } =
                await supabaseClient
                    .from(
                        "player_club_history"
                    )
                    .select(`
                        *,
                        teams:team_id (
                            id,
                            name,
                            short_name,
                            logo_url
                        )
                    `)
                    .eq(
                        "player_id",
                        player.id
                    )
                    .eq(
                        "movement_type",
                        "Release"
                    )
                    .order(
                        "joined_at",
                        {
                            ascending:false
                        }
                    )
                    .limit(1)
                    .maybeSingle();

            history =
                data ||
                null;

        } catch (error) {

            console.warn(
                "Free agent history error:",
                error
            );
        }

        const formerTeam =
            history?.teams ||
            {};

        const releasedAt =
            history?.left_at
                ? new Date(
                    history.left_at
                ).toLocaleDateString(
                    "en-KE"
                )
                : "Not recorded";

        const formerLogo =
            formerTeam.logo_url
                ? `
                    <img
                        src="${escapeHtml(
                            formerTeam.logo_url
                        )}"
                        alt="Former team logo"
                        style="
                            width:65px;
                            height:65px;
                            object-fit:contain;
                            border-radius:10px;
                            border:1px solid #ddd;
                            background:#fff;
                        "
                    >
                `
                : `
                    <div
                        style="
                            width:65px;
                            height:65px;
                            border-radius:10px;
                            background:#f2f2f2;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:28px;
                        "
                    >
                        ⚽
                    </div>
                `;

        const photo =
            player.photo_url
                ? `
                    <img
                        src="${escapeHtml(
                            player.photo_url
                        )}"
                        alt="Player photo"
                        style="
                            width:72px;
                            height:72px;
                            object-fit:cover;
                            border-radius:50%;
                            border:2px solid #ddd;
                        "
                    >
                `
                : `
                    <div
                        style="
                            width:72px;
                            height:72px;
                            border-radius:50%;
                            background:#eee;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:30px;
                        "
                    >
                        👤
                    </div>
                `;

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
                    justify-content:space-between;
                    gap:18px;
                    flex-wrap:wrap;
                "
            >

                <div
                    style="
                        display:flex;
                        gap:14px;
                        align-items:center;
                    "
                >

                    ${photo}

                    <div>

                        <h3>
                            🆓 ${escapeHtml(
                                player.full_name ||
                                "Unknown Player"
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                player.position ||
                                "Position not available"
                            )}
                        </p>

                        <p>
                            <strong>
                                Jersey:
                            </strong>
                            ${escapeHtml(
                                player.jersey_number ??
                                "Not available"
                            )}
                        </p>

                        <p>
                            <strong>
                                Status:
                            </strong>
                            Free Agent
                        </p>

                    </div>

                </div>


                <div
                    style="
                        text-align:center;
                        min-width:130px;
                    "
                >

                    ${formerLogo}

                    <div
                        style="
                            margin-top:5px;
                            font-weight:700;
                        "
                    >
                        ${escapeHtml(
                            formerTeam.name ||
                            "No Former Club"
                        )}
                    </div>

                </div>

            </div>


            <div
                style="
                    margin-top:12px;
                    display:grid;
                    gap:6px;
                "
            >

                <p>
                    <strong>
                        Former Club:
                    </strong>
                    ${escapeHtml(
                        formerTeam.name ||
                        "Not recorded"
                    )}
                </p>

                <p>
                    <strong>
                        Released:
                    </strong>
                    ${escapeHtml(
                        releasedAt
                    )}
                </p>

                ${
                    history?.movement_type
                        ? `
                            <p>
                                <strong>
                                    Movement:
                                </strong>
                                ${escapeHtml(
                                    history.movement_type
                                )}
                            </p>
                        `
                        : ""
                }

            </div>


            <div
                style="
                    margin-top:15px;
                    display:flex;
                    gap:10px;
                    flex-wrap:wrap;
                "
            >

                <a
                    href="player-profile.html?id=${Number(
                        player.id
                    )}"
                    class="btn btn-primary"
                    target="_blank"
                    rel="noopener"
                >
                    👤 View Player Profile
                </a>

            </div>

        `;

        list.appendChild(
            card
        );
    }
}

function openPlayerMovementDetails(
    requestId
) {

    const request =
        playerMovementRequests.find(
            function (item) {
                return (
                    Number(item.id) ===
                    Number(requestId)
                );
            }
        ) ||
        playerMovementCompletedTransfers.find(
            function (item) {
                return (
                    Number(item.id) ===
                    Number(requestId)
                );
            }
        );

    if (!request) {
        alert(
            "Movement request not found."
        );
        return;
    }

    let modal =
        document.getElementById(
            "playerMovementModal"
        );

    if (!modal) {

        modal =
            document.createElement(
                "div"
            );

        modal.id =
            "playerMovementModal";

        modal.style.cssText = `
            position:fixed;
            inset:0;
            background:rgba(0,0,0,.70);
            z-index:99999;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
            overflow:auto;
        `;

        modal.innerHTML = `
            <div style="
                width:100%;
                max-width:760px;
                max-height:90vh;
                overflow:auto;
                background:#fff;
                border-radius:16px;
                box-shadow:0 20px 60px rgba(0,0,0,.30);
                position:relative;
                padding:25px;
            ">
                <button
                    type="button"
                    id="closePlayerMovementModal"
                    style="
                        position:absolute;
                        right:15px;
                        top:10px;
                        width:40px;
                        height:40px;
                        border:none;
                        background:#f1f1f1;
                        border-radius:50%;
                        font-size:25px;
                        font-weight:900;
                        cursor:pointer;
                    "
                >×</button>

                <div
                    id="playerMovementModalContent"
                ></div>
            </div>
        `;

        document.body.appendChild(
            modal
        );

        document
            .getElementById(
                "closePlayerMovementModal"
            )
            ?.addEventListener(
                "click",
                function () {
                    modal.style.display =
                        "none";
                }
            );
    }

    const player =
        request.players ||
        {};

    const fromTeam =
        request.from_team ||
        {};

    const toTeam =
        request.to_team ||
        {};

    const competition =
        request.competitions ||
        {};

    const content =
        document.getElementById(
            "playerMovementModalContent"
        );

    if (!content) return;

    content.innerHTML = `

        <h2>
            🔄 Player Movement Details
        </h2>

        <div
            style="
                margin-top:18px;
                display:grid;
                gap:9px;
            "
        >

            <p>
                <strong>
                    Request ID:
                </strong>
                ${escapeHtml(
                    request.id
                )}
            </p>

            <p>
                <strong>
                    Movement:
                </strong>
                ${movementRequestTypeLabel(
                    request.request_type
                )}
            </p>

            <p>
                <strong>
                    Player:
                </strong>
                ${escapeHtml(
                    player.full_name ||
                    "Unknown Player"
                )}
            </p>

            <p>
                <strong>
                    Position:
                </strong>
                ${escapeHtml(
                    player.position ||
                    "Not available"
                )}
            </p>

            <p>
                <strong>
                    Jersey:
                </strong>
                ${escapeHtml(
                    player.jersey_number ??
                    "Not available"
                )}
            </p>

            <p>
                <strong>
                    From Team:
                </strong>
                ${escapeHtml(
                    request.request_type === "Free Agent Signing"
                        ? "Free Agent"
                        : (
                            fromTeam.name ||
                            "Not applicable"
                        )
                )}
            </p>

            <p>
                <strong>
                    To Team:
                </strong>
                ${
                    request.request_type ===
                    "Release"
                        ? "Free Agent"
                        : escapeHtml(
                            toTeam.name ||
                            "Not applicable"
                        )
                }
            </p>

            <p>
                <strong>
                    Competition:
                </strong>
                ${escapeHtml(
                    competition.name ||
                    "Club Squad"
                )}
            </p>

            <p>
                <strong>
                    Current Team Status:
                </strong>
                ${escapeHtml(
                    request.from_team_status ||
                    "Not Required"
                )}
            </p>

            <p>
                <strong>
                    Administrator Status:
                </strong>
                ${escapeHtml(
                    request.admin_status ||
                    request.status ||
                    "Pending"
                )}
            </p>

            <p>
                <strong>
                    Overall Status:
                </strong>
                ${movementStatusBadge(
                    request.status ||
                    "Pending"
                )}
            </p>

            <p>
                <strong>
                    Reason:
                </strong>
                ${escapeHtml(
                    request.reason ||
                    "No reason provided."
                )}
            </p>

            <p>
                <strong>
                    Submitted:
                </strong>
                ${escapeHtml(
                    request.created_at
                        ? new Date(
                            request.created_at
                        ).toLocaleString()
                        : "Unknown"
                )}
            </p>

            ${
                request.from_team_notes
                    ? `
                        <p>
                            <strong>
                                Current Team Notes:
                            </strong>
                            ${escapeHtml(
                                request.from_team_notes
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                request.admin_notes
                    ? `
                        <p>
                            <strong>
                                Admin Notes:
                            </strong>
                            ${escapeHtml(
                                request.admin_notes
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                request.reviewed_at
                    ? `
                        <p>
                            <strong>
                                Reviewed:
                            </strong>
                            ${escapeHtml(
                                new Date(
                                    request.reviewed_at
                                ).toLocaleString()
                            )}
                        </p>
                    `
                    : ""
            }

        </div>

    `;

    modal.style.display =
        "flex";
}

async function reviewPlayerMovement(
    requestId,
    action
) {

    const request =
        playerMovementRequests.find(
            function (item) {
                return (
                    Number(item.id) ===
                    Number(requestId)
                );
            }
        );

    if (!request) {
        alert(
            "Movement request not found."
        );
        return;
    }

    if (
        request.status !==
        "Pending"
    ) {
        alert(
            "This movement request has already been processed."
        );
        return;
    }

    if (
        request.request_type ===
            "Transfer" &&
        action ===
            "approve" &&
        request.from_team_status !==
            "Approved"
    ) {

        alert(
            "This transfer is waiting for approval from the current team."
        );

        return;
    }

    const promptText =
        action === "approve"
            ? "Enter administrator notes for approving this movement (optional):"
            : "Enter the reason for rejecting this movement request:";

    const notes =
        prompt(
            promptText
        );

    if (
        notes ===
        null
    ) {
        return;
    }

    const cleanedNotes =
        notes.trim() ||
        (
            action ===
            "approve"
                ? "Approved by administrator."
                : "Rejected by administrator."
        );

    let rpcName = "";

    if (
        request.request_type ===
        "Release"
    ) {

        rpcName =
            action === "approve"
                ? "approve_player_release"
                : "reject_player_release";

    }
    else if (
        request.request_type ===
        "Free Agent Signing"
    ) {

        rpcName =
            action === "approve"
                ? "approve_free_agent_signing"
                : "reject_free_agent_signing";

    }
    else if (
        request.request_type ===
        "Transfer"
    ) {

        rpcName =
            action === "approve"
                ? "approve_player_transfer"
                : "reject_player_transfer";

    }
    else {

        alert(
            "Unsupported player movement type."
        );

        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                rpcName,
                {
                    p_request_id:
                        Number(
                            requestId
                        ),
                    p_admin_notes:
                        cleanedNotes
                }
            );

        if (error) {
            throw error;
        }

        if (
            data &&
            data.success ===
            false
        ) {

            throw new Error(
                data.message ||
                "Movement operation failed."
            );
        }

        showMessage(
            action === "approve"
                ? "Player movement approved successfully."
                : "Player movement rejected successfully.",
            "success"
        );

        await loadPlayerMovementDashboard();

    } catch (error) {

        console.error(
            "Player movement review error:",
            error
        );

        showMessage(
            (
                action === "approve"
                    ? "Approval failed: "
                    : "Rejection failed: "
            ) +
            (
                error.message ||
                "Unknown error"
            ),
            "error"
        );
    }
}

window.openPlayerMovementDetails =
    openPlayerMovementDetails;

window.reviewPlayerMovement =
    reviewPlayerMovement;

// ========================================
// PREPARE SQUAD REQUEST DASHBOARD
// ========================================

ensureSquadRequestsDashboard();


// ========================================
// MAKE SQUAD REQUEST FUNCTIONS AVAILABLE
// TO DYNAMIC BUTTONS
// ========================================

window.openSquadRequestDetails =
    openSquadRequestDetails;

window.closeSquadRequestDetails =
    closeSquadRequestDetails;

window.approveSquadChangeRequest =
    approveSquadChangeRequest;

window.rejectSquadChangeRequest =
    rejectSquadChangeRequest;


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

await loadCompetitionRegistrationSettings();

await loadApprovedTeams();

await loadVenues();

await loadFixtures();

await loadResultFixtures();

await loadPendingTeams();

await loadSquadChangeRequests();

ensurePlayerMovementDashboard();

await loadPlayerMovementDashboard();


console.log(
    "Kabaru Ward Football Admin Dashboard loaded."
);

});
