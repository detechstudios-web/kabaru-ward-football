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
                "Ã¢ÂÅ’ Supabase library did not load.",
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
                "Ã¢ÂÅ’ Supabase connection did not load.",
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
                    "Ã¢ÂÅ’ You are not logged in.",
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
                    "Ã¢ÂÅ’ This account is not an administrator.",
                    "error"
                );

                return false;
            }


            showMessage(
                "Ã¢Å“â€¦ Administrator access granted.",
                "success"
            );


            return true;


        } catch (error) {

            console.error(
                "Admin verification error:",
                error
            );


            showMessage(
                "Ã¢ÂÅ’ Admin verification failed: " +
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
                            " Ã¢â‚¬â€ " +
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
                                Ã°Å¸Ââ€ 
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
                'Ã¢ÂÅ’ Unable to load competitions: ' +
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
                    Ã¢Å¡â„¢Ã¯Â¸Â Squad Registration Controls
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

            settingsList.innerHTML = "";

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
                                    Ã°Å¸Ââ€ 
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
                                    Ã¢â‚¬Â¢
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
                                        ? "Ã°Å¸Å¸Â¢ UPDATES OPEN"
                                        : "Ã°Å¸â€Â´ UPDATES CLOSED"
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
                                    class="competition-updates-allowed"
                                    style="
                                        width:20px;
                                        height:20px;
                                    "
                                    ${
                                        updatesAllowed
                                            ? "checked"
                                            : ""
                                    }
                                >

                                Ã°Å¸Å¸Â¢ Allow squad/team change requests

                            </label>

                            <p style="
                                margin:8px 0 0 30px;
                                color:#777;
                                font-size:13px;
                            ">
                                Turn this OFF to completely prevent
                                teams from submitting squad changes
                                for this competition.
                            </p>

                        </div>

                        <!-- CHANGE TYPES -->

                        <div style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(
                                        210px,
                                        1fr
                                    )
                                );
                            gap:10px;
                            margin-bottom:18px;
                        ">

                            <label style="
                                padding:12px;
                                border:1px solid #ddd;
                                border-radius:8px;
                                display:flex;
                                gap:8px;
                                align-items:center;
                                cursor:pointer;
                            ">

                                <input
                                    type="checkbox"
                                    class="allow-add-players"
                                    ${
                                        allowAddPlayers
                                            ? "checked"
                                            : ""
                                    }
                                >

                                Ã¢Å¾â€¢ Add players

                            </label>

                            <label style="
                                padding:12px;
                                border:1px solid #ddd;
                                border-radius:8px;
                                display:flex;
                                gap:8px;
                                align-items:center;
                                cursor:pointer;
                            ">

                                <input
                                    type="checkbox"
                                    class="allow-remove-players"
                                    ${
                                        allowRemovePlayers
                                            ? "checked"
                                            : ""
                                    }
                                >

                                Ã¢Å¾â€“ Remove players

                            </label>

                            <label style="
                                padding:12px;
                                border:1px solid #ddd;
                                border-radius:8px;
                                display:flex;
                                gap:8px;
                                align-items:center;
                                cursor:pointer;
                            ">

                                <input
                                    type="checkbox"
                                    class="allow-edit-players"
                                    ${
                                        allowEditPlayers
                                            ? "checked"
                                            : ""
                                    }
                                >

                                Ã¢Å“ÂÃ¯Â¸Â Edit players

                            </label>

                            <label style="
                                padding:12px;
                                border:1px solid #ddd;
                                border-radius:8px;
                                display:flex;
                                gap:8px;
                                align-items:center;
                                cursor:pointer;
                            ">

                                <input
                                    type="checkbox"
                                    class="allow-edit-team"
                                    ${
                                        allowEditTeam
                                            ? "checked"
                                            : ""
                                    }
                                >

                                Ã°Å¸ÂÂ·Ã¯Â¸Â Edit team

                            </label>

                        </div>

                        <!-- TIME WINDOW -->

                        <div style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(
                                        220px,
                                        1fr
                                    )
                                );
                            gap:15px;
                            margin-bottom:18px;
                        ">

                            <div>

                                <label style="
                                    display:block;
                                    font-weight:800;
                                    margin-bottom:7px;
                                ">
                                    Ã°Å¸â€œâ€¦ Opening Date & Time
                                </label>

                                <input
                                    type="datetime-local"
                                    class="registration-start"
                                    value="${
                                        datetimeLocalValue(
                                            existing.start_datetime
                                        )
                                    }"
                                    style="
                                        width:100%;
                                        padding:11px;
                                        border:1px solid #ccc;
                                        border-radius:7px;
                                    "
                                >

                            </div>

                            <div>

                                <label style="
                                    display:block;
                                    font-weight:800;
                                    margin-bottom:7px;
                                ">
                                    Ã°Å¸â€œâ€¦ Closing Date & Time
                                </label>

                                <input
                                    type="datetime-local"
                                    class="registration-end"
                                    value="${
                                        datetimeLocalValue(
                                            existing.end_datetime
                                        )
                                    }"
                                    style="
                                        width:100%;
                                        padding:11px;
                                        border:1px solid #ccc;
                                        border-radius:7px;
                                    "
                                >

                            </div>

                        </div>

                        <!-- SQUAD SIZE + LOCK -->

                        <div style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(
                                        220px,
                                        1fr
                                    )
                                );
                            gap:15px;
                            margin-bottom:18px;
                        ">

                            <div>

                                <label style="
                                    display:block;
                                    font-weight:800;
                                    margin-bottom:7px;
                                ">
                                    Ã°Å¸â€˜Â¥ Maximum Squad Size
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    class="max-squad-size"
                                    value="${maxSquadSize}"
                                    style="
                                        width:100%;
                                        padding:11px;
                                        border:1px solid #ccc;
                                        border-radius:7px;
                                    "
                                >

                            </div>

                            <div style="
                                display:flex;
                                align-items:end;
                            ">

                                <label style="
                                    width:100%;
                                    padding:12px;
                                    border:1px solid #ddd;
                                    border-radius:8px;
                                    display:flex;
                                    gap:8px;
                                    align-items:center;
                                    cursor:pointer;
                                ">

                                    <input
                                        type="checkbox"
                                        class="registration-locked"
                                        ${
                                            registrationLocked
                                                ? "checked"
                                                : ""
                                        }
                                    >

                                    Ã°Å¸â€â€™ Lock registration completely

                                </label>

                            </div>

                        </div>

                        <!-- SAVE -->

                        <div style="
                            display:flex;
                            align-items:center;
                            gap:12px;
                            flex-wrap:wrap;
                        ">

                            <button
                                type="button"
                                class="save-registration-settings"
                                style="
                                    background:#075b35;
                                    color:white;
                                    border:none;
                                    padding:12px 20px;
                                    border-radius:7px;
                                    font-weight:900;
                                    cursor:pointer;
                                "
                            >
                                Ã°Å¸â€™Â¾ Save Competition Controls
                            </button>

                            <span
                                class="registration-settings-message"
                                style="
                                    font-size:13px;
                                    font-weight:700;
                                "
                            ></span>

                        </div>

                    `;

                    // ----------------------------------------
                    // SAVE BUTTON
                    // ----------------------------------------

                    const saveButton =
                        card.querySelector(
                            ".save-registration-settings"
                        );

                    saveButton.addEventListener(
                        "click",
                        async function () {

                            const message =
                                card.querySelector(
                                    ".registration-settings-message"
                                );

                            const updatesAllowedInput =
                                card.querySelector(
                                    ".competition-updates-allowed"
                                );

                            const addPlayersInput =
                                card.querySelector(
                                    ".allow-add-players"
                                );

                            const removePlayersInput =
                                card.querySelector(
                                    ".allow-remove-players"
                                );

                            const editPlayersInput =
                                card.querySelector(
                                    ".allow-edit-players"
                                );

                            const editTeamInput =
                                card.querySelector(
                                    ".allow-edit-team"
                                );

                            const startInput =
                                card.querySelector(
                                    ".registration-start"
                                );

                            const endInput =
                                card.querySelector(
                                    ".registration-end"
                                );

                            const maxSquadInput =
                                card.querySelector(
                                    ".max-squad-size"
                                );

                            const lockedInput =
                                card.querySelector(
                                    ".registration-locked"
                                );

                            let maxSquad =
                                Number(
                                    maxSquadInput.value
                                );

                            if (
                                !Number.isFinite(
                                    maxSquad
                                ) ||
                                maxSquad < 1
                            ) {

                                message.textContent =
                                    "Ã¢ÂÅ’ Maximum squad size must be at least 1.";

                                message.style.color =
                                    "#b00020";

                                return;
                            }

                            if (
                                maxSquad > 100
                            ) {

                                message.textContent =
                                    "Ã¢ÂÅ’ Maximum squad size cannot exceed 100.";

                                message.style.color =
                                    "#b00020";

                                return;
                            }

                            if (
                                startInput.value &&
                                endInput.value
                            ) {

                                const startDate =
                                    new Date(
                                        startInput.value
                                    );

                                const endDate =
                                    new Date(
                                        endInput.value
                                    );

                                if (
                                    endDate <=
                                    startDate
                                ) {

                                    message.textContent =
                                        "Ã¢ÂÅ’ Closing date/time must be after opening date/time.";

                                    message.style.color =
                                        "#b00020";

                                    return;
                                }
                            }

                            saveButton.disabled =
                                true;

                            saveButton.style.opacity =
                                "0.6";

                            message.textContent =
                                "Saving...";

                            message.style.color =
                                "#666";

                            try {

                                const payload = {

                                    competition_id:
                                        competition.id,

                                    updates_allowed:
                                        updatesAllowedInput
                                            .checked,

                                    allow_add_players:
                                        addPlayersInput
                                            .checked,

                                    allow_remove_players:
                                        removePlayersInput
                                            .checked,

                                    allow_edit_players:
                                        editPlayersInput
                                            .checked,

                                    allow_edit_team:
                                        editTeamInput
                                            .checked,

                                    start_datetime:
                                        startInput.value
                                            ? new Date(
                                                startInput.value
                                            ).toISOString()
                                            : null,

                                    end_datetime:
                                        endInput.value
                                            ? new Date(
                                                endInput.value
                                            ).toISOString()
                                            : null,

                                    max_squad_size:
                                        maxSquad,

                                    registration_locked:
                                        lockedInput
                                            .checked
                                };

                                const {
                                    error
                                } =
                                    await supabaseClient
                                        .from(
                                            "competition_registration_settings"
                                        )
                                        .upsert(
                                            payload,
                                            {
                                                onConflict:
                                                    "competition_id"
                                            }
                                        );

                                if (error) {
                                    throw error;
                                }

                                message.textContent =
                                    "Ã¢Å“â€¦ Competition controls saved successfully.";

                                message.style.color =
                                    "#087f3e";

                            } catch (error) {

                                console.error(
                                    "SAVE REGISTRATION SETTINGS ERROR:",
                                    error
                                );

                                message.textContent =
                                    "Ã¢ÂÅ’ Unable to save: " +
                                    (
                                        error.message ||
                                        "Unknown error"
                                    );

                                message.style.color =
                                    "#b00020";

                            } finally {

                                saveButton.disabled =
                                    false;

                                saveButton.style.opacity =
                                    "1";
                            }

                        }
                    );

                    settingsList.appendChild(
                        card
                    );

                }
            );

        } catch (error) {

            console.error(
                "LOAD REGISTRATION SETTINGS ERROR:",
                error
            );

            settingsList.innerHTML = `
                <div class="empty-message">
                    Ã¢ÂÅ’ Unable to load squad controls:
                    ${escapeHtml(
                        error.message ||
                        "Unknown error"
                    )}
                </div>
            `;
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


                if (!name) {

                    competitionFormMessage.textContent =
                        "Ã¢ÂÅ’ Please enter the competition name.";

                    competitionFormMessage.style.display =
                        "block";

                    return;
                }


                if (!competitionType) {

                    competitionFormMessage.textContent =
                        "Ã¢ÂÅ’ Please select the competition type.";

                    competitionFormMessage.style.display =
                        "block";

                    return;
                }


                if (!season) {

                    competitionFormMessage.textContent =
                        "Ã¢ÂÅ’ Please enter the season.";

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
                        "Ã¢ÂÅ’ End date cannot be before start date.";

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
                        "Ã¢Å“â€¦ Competition created successfully!";


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
                        "Ã¢ÂÅ’ Unable to create competition: " +
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
                        "Ã¢Å“â€¦ Fixture created successfully!",
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
                        "Ã¢ÂÅ’ Unable to create fixture: " +
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
                            Ã¢Å¡Â½
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
                            Ã°Å¸Ââ€ 
                            ${escapeHtml(
                                competition
                                    ? competition.name
                                    : "Unknown Competition"
                            )}
                        </p>

                        <p>
                            Ã°Å¸â€œâ€¦
                            ${formatDate(
                                fixture.match_date
                            )}
                        </p>

                        <p>
                            Ã¢ÂÂ°
                            ${formatTime(
                                fixture.kick_off
                            )}
                        </p>

                        <p>
                            Ã°Å¸â€œÂ
                            ${escapeHtml(
                                fixture.venue || "-"
                            )}
                        </p>

                        <p>
                            Ã°Å¸â€Â¢
                            ${escapeHtml(
                                fixture.matchday ||
                                "-"
                            )}
                        </p>

                        <p>
                            Ã°Å¸â€œÂ¢
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
                            Ã°Å¸â€”â€˜Ã¯Â¸Â Delete Fixture
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
                        Ã¢ÂÅ’ Unable to Load Fixtures
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
                        " Ã¢â‚¬â€ " +
                        formatDate(
                            fixture.match_date
                        );


                    resultFixtureSelect
                        .appendChild(
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
                "<option value=''>" +
                "Unable to load fixtures" +
                "</option>";
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

    function createPlayerOptions(
        players,
        placeholder
    ) {

        let html =
            "<option value=''>" +
            escapeHtml(
                placeholder ||
                "Select player"
            ) +
            "</option>";


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
    // CREATE ASSIST OPTIONS
    // ========================================

    function createAssistOptions(
        players
    ) {

        return createPlayerOptions(
            players,
            "No assist"
        );
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


        row.style.display =
            "grid";

        row.style.gridTemplateColumns =
            "minmax(150px, 1fr) minmax(80px, 100px) minmax(150px, 1fr) auto auto";

        row.style.gap =
            "8px";

        row.style.alignItems =
            "center";

        row.style.marginBottom =
            "10px";


        row.innerHTML = `

            <select
                class="scorer-player"
                data-side="${side}"
            >

                ${createPlayerOptions(
                    players,
                    "Select scorer"
                )}

            </select>


            <input
                type="number"
                class="scorer-minute"
                placeholder="Minute"
                min="1"
                max="130"
                inputmode="numeric"
                autocomplete="off"
            >


            <select
                class="assist-player"
                data-side="${side}"
            >

                ${createAssistOptions(
                    players
                )}

            </select>


            <label style="
                display:flex;
                align-items:center;
                gap:5px;
                white-space:nowrap;
            ">

                <input
                    type="checkbox"
                    class="goal-penalty"
                >

                Penalty

            </label>


            <button
                type="button"
                class="remove-goal-btn"
                title="Remove goal"
            >
                Ã¢Å“â€¢
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
                ".scorer-minute"
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
    // GET MINUTE FROM ROW
    // ========================================

    function getMinuteFromRow(row) {

        const input =
            row.querySelector(
                ".scorer-minute"
            );


        if (!input) {
            return null;
        }


        const value =
            input.value.trim();


        if (!value) {
            return null;
        }


        const minute =
            Number(value);


        if (
            !Number.isInteger(
                minute
            ) ||
            minute < 1 ||
            minute > 130
        ) {

            return null;
        }


        return minute;
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


                const assistSelect =
                    row.querySelector(
                        ".assist-player"
                    );


                const penaltyCheckbox =
                    row.querySelector(
                        ".goal-penalty"
                    );


                if (!playerSelect) {
                    return;
                }


                const playerId =
                    playerSelect.value;


                const minute =
                    getMinuteFromRow(
                        row
                    );


                const assistPlayerId =
                    assistSelect
                        ? assistSelect.value
                        : "";


                const isPenalty =
                    penaltyCheckbox
                        ? penaltyCheckbox.checked
                        : false;


                if (!playerId) {
                    return;
                }


                if (minute === null) {
                    return;
                }


                scorerData.push({

                    player_id:
                        Number(
                            playerId
                        ),

                    minute:
                        minute,

                    assist_player_id:
                        assistPlayerId
                            ? Number(
                                assistPlayerId
                              )
                            : null,

                    is_penalty:
                        isPenalty

                });

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

                const playerSelect =
                    row.querySelector(
                        ".scorer-player"
                    );


                const minute =
                    getMinuteFromRow(
                        row
                    );


                if (
                    playerSelect &&
                    playerSelect.value &&
                    minute !== null
                ) {

                    count++;
                }

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
                    "Ã¢Å¡ Ã¯Â¸Â Score is " +
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
                    "Ã¢Å¡ Ã¯Â¸Â Score is " +
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
    // CREATE APPEARANCE SECTION
    // ========================================

    function createAppearanceSection() {

        if (
            !resultScoreSection ||
            !currentFixture
        ) {
            return;
        }


        const existing =
            document.getElementById(
                "appearanceSection"
            );


        if (existing) {
            existing.remove();
        }


        const section =
            document.createElement(
                "div"
            );


        section.id =
            "appearanceSection";


        section.className =
            "admin-card";


        section.style.marginTop =
            "25px";


        section.innerHTML = `

            <h3>
                Ã°Å¸â€˜Â¥ Player Appearances
            </h3>

            <p>
                Select every player who appeared
                in this match.
            </p>

            <div style="margin-top:15px;">

                <h4>
                    ${escapeHtml(
                        resultHomeTeamName
                            ? resultHomeTeamName.textContent
                            : "Home Team"
                    )}
                </h4>

                <div id="homeAppearances"></div>

            </div>

            <div style="margin-top:20px;">

                <h4>
                    ${escapeHtml(
                        resultAwayTeamName
                            ? resultAwayTeamName.textContent
                            : "Away Team"
                    )}
                </h4>

                <div id="awayAppearances"></div>

            </div>

        `;


        resultScoreSection.appendChild(
            section
        );


        const homeContainer =
            document.getElementById(
                "homeAppearances"
            );


        const awayContainer =
            document.getElementById(
                "awayAppearances"
            );


        if (homeContainer) {

            homePlayers.forEach(
                function (player) {

                    homeContainer.innerHTML += `

                        <label style="
                            display:block;
                            margin:8px 0;
                            padding:8px;
                        ">

                            <input
                                type="checkbox"
                                class="appearance-player"
                                value="${player.id}"
                                data-team="home"
                            >

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

                        </label>

                    `;

                }
            );
        }


        if (awayContainer) {

            awayPlayers.forEach(
                function (player) {

                    awayContainer.innerHTML += `

                        <label style="
                            display:block;
                            margin:8px 0;
                            padding:8px;
                        ">

                            <input
                                type="checkbox"
                                class="appearance-player"
                                value="${player.id}"
                                data-team="away"
                            >

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

                        </label>

                    `;

                }
            );
        }
    }


    // ========================================
    // GET APPEARANCES
    // ========================================

    function getAppearancePlayers() {

        const checkboxes =
            document.querySelectorAll(
                ".appearance-player:checked"
            );


        const playerIds = [];


        checkboxes.forEach(
            function (checkbox) {

                playerIds.push(
                    Number(
                        checkbox.value
                    )
                );

            }
        );


        return playerIds;
    }


    // ========================================
    // VALIDATE APPEARANCES
    // ========================================

    function validateAppearances() {

        const appearances =
            getAppearancePlayers();


        if (
            appearances.length === 0
        ) {

            return {

                valid: false,

                message:
                    "Please select at least one player who appeared in the match."

            };
        }


        return {

            valid: true,

            message: ""

        };
    }


    // ========================================
    // VALIDATE SCORERS ARE APPEARANCES
    // ========================================

    function validateScorersAreAppearances(
        scorerData,
        appearancePlayers
    ) {

        const appearanceSet =
            new Set(
                appearancePlayers
            );


        for (
            let i = 0;
            i < scorerData.length;
            i++
        ) {

            const playerId =
                scorerData[i].player_id;


            if (
                !appearanceSet.has(
                    playerId
                )
            ) {

                return {

                    valid: false,

                    message:
                        "Every goal scorer must also be marked as having appeared in the match."

                };
            }
        }


        return {

            valid: true,

            message: ""

        };
    }


    // ========================================
    // VALIDATE ASSIST PROVIDERS
    // ========================================

    function validateAssistProviders(
        scorerData,
        appearancePlayers
    ) {

        const appearanceSet =
            new Set(
                appearancePlayers
            );


        for (
            let i = 0;
            i < scorerData.length;
            i++
        ) {

            const assistPlayerId =
                scorerData[i].assist_player_id;


            if (!assistPlayerId) {
                continue;
            }


            // Assist provider must have appeared
            if (
                !appearanceSet.has(
                    assistPlayerId
                )
            ) {

                return {

                    valid: false,

                    message:
                        "Every assist provider must also be marked as having appeared in the match."

                };
            }


            // An assist provider cannot be the scorer
            if (
                Number(
                    assistPlayerId
                ) ===
                Number(
                    scorerData[i].player_id
                )
            ) {

                return {

                    valid: false,

                    message:
                        "A player cannot be recorded as assisting their own goal."

                };
            }
        }


        return {

            valid: true,

            message: ""

        };
    }


    // ========================================
    // VALIDATE GOAL MINUTES
    // ========================================

    function validateGoalMinutes(
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


            const minuteInput =
                row.querySelector(
                    ".scorer-minute"
                );


            const playerId =
                playerSelect
                    ? playerSelect.value
                    : "";


            const minute =
                getMinuteFromRow(
                    row
                );


            if (
                playerId &&
                minute === null
            ) {

                return {

                    valid: false,

                    message:
                        "Please enter a valid goal minute between 1 and 130 for " +
                        teamName +
                        " scorer #" +
                        (i + 1) +
                        "."

                };
            }


            if (
                minuteInput &&
                minuteInput.value.trim() &&
                minute === null
            ) {

                return {

                    valid: false,

                    message:
                        "Goal minutes must be whole numbers between 1 and 130."

                };
            }
        }


        return {

            valid: true,

            message: ""

        };
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


                    const appearanceSection =
                        document.getElementById(
                            "appearanceSection"
                        );


                    if (appearanceSection) {
                        appearanceSection.remove();
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
                        "Ã¢ÂÅ’ Unable to find selected fixture.",
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
                                Ã¢Å¡Â½
                                ${escapeHtml(
                                    homeName
                                )}
                                vs
                                ${escapeHtml(
                                    awayName
                                )}
                            </strong>

                            <br>

                            Ã°Å¸Ââ€  Matchday:
                            ${escapeHtml(
                                currentFixture.matchday ||
                                "-"
                            )}

                            <br>

                            Ã°Å¸â€œâ€¦
                            ${formatDate(
                                currentFixture.match_date
                            )}

                            &nbsp;&nbsp;

                            Ã¢ÂÂ°
                            ${formatTime(
                                currentFixture.kick_off
                            )}

                            <br>

                            Ã°Å¸â€œÂ
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


                    createAppearanceSection();


                    updateGoalWarnings();


                } catch (error) {

                    console.error(
                        "Loading result players error:",
                        error
                    );


                    showResultMessage(
                        "Ã¢ÂÅ’ Unable to load players: " +
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
    // ADD HOME GOAL
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
    // ADD AWAY GOAL
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
                        "Ã¢ÂÅ’ " +
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
                        "Ã¢ÂÅ’ " +
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
                        "Ã¢ÂÅ’ Home score is " +
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
                        "Ã¢ÂÅ’ Away score is " +
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
                        "Ã¢ÂÅ’ " +
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
                        "Ã¢ÂÅ’ " +
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
                        "Ã¢ÂÅ’ " +
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
                        "Ã¢Å“â€¦ Match result saved successfully!",
                        "success"
                    );


                    alert(
                        "Ã¢Å“â€¦ Match result saved successfully!"
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
                        "Ã¢ÂÅ’ Unable to save result: " +
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
                        "Ã°Å¸â€™Â¾ SAVE RESULT";
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
                    "Ã°Å¸Å½â€° No pending team registrations." +
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
                        Ã¢Å¡Â½
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
                        Ã°Å¸â€˜Â¥ Players
                        (${players ? players.length : 0}/20)
                    </h3>


                    ${playersHtml}


                    <div style="margin-top:20px;">

                        <button
                            type="button"
                            class="admin-btn approve-btn"
                            data-id="${team.id}"
                        >
                            Ã¢Å“â€¦ Approve Team
                        </button>


                        <button
                            type="button"
                            class="admin-btn reject-btn"
                            data-id="${team.id}"
                        >
                            Ã¢ÂÅ’ Reject Team
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
                        Ã¢ÂÅ’ Unable to Load
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
                "Ã¢Å“â€¦ Team approved successfully!"
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
                <h2>ðŸ‘¥ Squad & Team Change Requests</h2>
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

        <div id="squadRequestsList">

            <div class="loading">
                Loading squad requests...
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

                renderSquadChangeRequests();

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

                renderSquadChangeRequests();

            }
        );

    }

}


// ----------------------------------------
// REQUEST TYPE LABEL
// ----------------------------------------

function getSquadRequestTypeLabel(type) {

    const value =
        String(type || "")
            .trim()
            .toLowerCase();

    if (
        value === "add" ||
        value === "add player"
    ) {
        return "âž• Add Player";
    }

    if (
        value === "remove" ||
        value === "remove player"
    ) {
        return "âž– Remove Player";
    }

    if (value === "edit player") {
        return "âœï¸ Edit Player";
    }

    if (value === "edit team") {
        return "ðŸ·ï¸ Edit Team";
    }

    return type || "Unknown";

}


// ----------------------------------------
// LOAD REQUESTS
// ----------------------------------------

async function loadSquadChangeRequests() {

    try {

        ensureSquadRequestsDashboard();

        const {
            data,
            error
        } = await supabaseClient
            .from("squad_change_requests")
            .select(`
                *,
                teams (
                    id,
                    name,
                    short_name
                ),
                competitions (
                    id,
                    name,
                    season
                ),
                players (
                    id,
                    full_name,
                    jersey_number,
                    position,
                    photo_url
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

        renderSquadChangeRequestCounters();

        renderSquadChangeRequests();

    } catch (error) {

        console.error(
            "Load squad requests error:",
            error
        );

        const list =
            document.getElementById(
                "squadRequestsList"
            );

        if (list) {

            list.innerHTML = `
                <div class="error-message">
                    Failed to load squad requests:
                    ${escapeHtml(
                        error.message ||
                        "Unknown error"
                    )}
                </div>
            `;

        }

    }

}


// ----------------------------------------
// REQUEST COUNTERS
// ----------------------------------------

function renderSquadChangeRequestCounters() {

    const container =
        document.getElementById(
            "squadRequestCounters"
        );

    if (!container) {
        return;
    }

    const pending =
        squadChangeRequests.filter(
            request =>
                request.status === "Pending"
        ).length;

    const approved =
        squadChangeRequests.filter(
            request =>
                request.status === "Approved"
        ).length;

    const rejected =
        squadChangeRequests.filter(
            request =>
                request.status === "Rejected"
        ).length;

    const total =
        squadChangeRequests.length;

    container.innerHTML = `

        <div class="stat-card">

            <div class="stat-icon">
                â³
            </div>

            <div class="stat-number">
                ${pending}
            </div>

            <div class="stat-label">
                Pending Requests
            </div>

        </div>

        <div class="stat-card">

            <div class="stat-icon">
                âœ…
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
                âŒ
            </div>

            <div class="stat-number">
                ${rejected}
            </div>

            <div class="stat-label">
                Rejected
            </div>

        </div>

        <div class="stat-card">

            <div class="stat-icon">
                ðŸ“‹
            </div>

            <div class="stat-number">
                ${total}
            </div>

            <div class="stat-label">
                Total Requests
            </div>

        </div>

    `;

}


// ----------------------------------------
// RENDER REQUESTS
// ----------------------------------------

function renderSquadChangeRequests() {

    const container =
        document.getElementById(
            "squadRequestsList"
        );

    if (!container) {
        return;
    }

    let requests =
        [...squadChangeRequests];

    if (
        squadRequestFilter !== "All"
    ) {

        requests =
            requests.filter(
                request =>
                    request.status ===
                    squadRequestFilter
            );

    }

    if (squadRequestSearch) {

        requests =
            requests.filter(
                request => {

                    const teamName =
                        request.teams?.name ||
                        "";

                    const shortName =
                        request.teams?.short_name ||
                        "";

                    const competition =
                        request.competitions?.name ||
                        "";

                    const player =
                        request.players?.full_name ||
                        request.requested_full_name ||
                        "";

                    const requestType =
                        request.request_type ||
                        "";

                    const searchable =
                        (
                            teamName +
                            " " +
                            shortName +
                            " " +
                            competition +
                            " " +
                            player +
                            " " +
                            requestType
                        )
                        .toLowerCase();

                    return searchable.includes(
                        squadRequestSearch
                    );

                }
            );

    }

    if (!requests.length) {

        container.innerHTML = `
            <div class="empty-state">

                <div
                    style="
                        font-size:42px;
                        margin-bottom:10px;
                    "
                >
                    ðŸ“‹
                </div>

                <h3>
                    No ${squadRequestFilter.toLowerCase()}
                    requests
                </h3>

                <p>
                    There are currently no squad or
                    team change requests matching
                    your selection.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        requests
            .map(
                request =>
                    createSquadRequestCard(
                        request
                    )
            )
            .join("");

}


// ----------------------------------------
// REQUEST CARD
// ----------------------------------------

function createSquadRequestCard(
    request
) {

    const teamName =
        request.teams?.name ||
        "Unknown Team";

    const competitionName =
        request.competitions?.name ||
        "Unknown Competition";

    const playerName =
        request.players?.full_name ||
        request.requested_full_name ||
        "Team Information";

    const type =
        getSquadRequestTypeLabel(
            request.request_type
        );

    const status =
        request.status ||
        "Pending";

    const createdAt =
        request.created_at
            ? new Date(
                request.created_at
            ).toLocaleString()
            : "Unknown date";

    let statusClass =
        "pending";

    if (
        status === "Approved"
    ) {
        statusClass = "approved";
    }

    if (
        status === "Rejected"
    ) {
        statusClass = "rejected";
    }

    return `

        <div
            class="form-card"
            style="
                margin-bottom:15px;
                border-left:5px solid
                ${
                    status === "Approved"
                        ? "#198754"
                        : status === "Rejected"
                            ? "#dc3545"
                            : "#f5c542"
                };
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:15px;
                    flex-wrap:wrap;
                "
            >

                <div>

                    <h3>
                        ${escapeHtml(type)}
                    </h3>

                    <p>
                        <strong>
                            Team:
                        </strong>
                        ${escapeHtml(teamName)}
                    </p>

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
                            Player:
                        </strong>
                        ${escapeHtml(playerName)}
                    </p>

                    <p>
                        <strong>
                            Submitted:
                        </strong>
                        ${escapeHtml(createdAt)}
                    </p>

                </div>

                <div>

                    <span
                        style="
                            display:inline-block;
                            padding:7px 12px;
                            border-radius:20px;
                            font-weight:700;
                            background:
                                ${
                                    status === "Approved"
                                        ? "#d1e7dd"
                                        : status === "Rejected"
                                            ? "#f8d7da"
                                            : "#fff3cd"
                                };
                            color:
                                ${
                                    status === "Approved"
                                        ? "#0f5132"
                                        : status === "Rejected"
                                            ? "#842029"
                                            : "#664d03"
                                };
                        "
                    >
                        ${escapeHtml(status)}
                    </span>

                </div>

            </div>

            <div
                style="
                    margin-top:15px;
                    display:flex;
                    gap:10px;
                    flex-wrap:wrap;
                "
            >

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="openSquadRequestDetails(${Number(
                        request.id
                    )})"
                >
                    ðŸ‘ï¸ View Details
                </button>

            </div>

        </div>

    `;

}


// ----------------------------------------
// REQUEST DETAILS
// ----------------------------------------

// ========================================
// OPEN SQUAD REQUEST DETAILS
// ========================================

function openSquadRequestDetails(requestId) {

    const request = squadChangeRequests.find(function (item) {
        return Number(item.id) === Number(requestId);
    });

    if (!request) {
        alert("Request not found.");
        return;
    }

    selectedSquadRequest = request;

    const type = getSquadRequestTypeLabel(
        request.request_type
    );


    let modal =
    document.getElementById(
        "squadRequestModal"
    );


// ========================================
// CREATE MODAL IF IT DOES NOT EXIST
// ========================================

if (!modal) {

    modal =
        document.createElement("div");

    modal.id =
        "squadRequestModal";

    modal.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.70);
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
                background:#ffffff;
                border-radius:16px;
                box-shadow:0 20px 60px rgba(0,0,0,0.30);
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
                    color:#333;
                "
            >
                Ã—
            </button>

            <div
                id="squadRequestModalContent"
            ></div>

        </div>

    `;

    document.body.appendChild(modal);

    const closeButton =
        document.getElementById(
            "closeSquadRequestModal"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                closeSquadRequestDetails();

            }
        );

    }

}


// ========================================
// GET MODAL CONTENT
// ========================================

const details =
    document.getElementById(
        "squadRequestModalContent"
    );

if (!details) {

    console.error(
        "Squad request modal content was not found."
    );

    return;

}

    let reasonText =
        request.reason ||
        "No reason provided.";

    let parsedReason = null;

    /*
     * Edit Team requests store additional
     * requested information inside reason
     * as JSON.
     */
    if (
        request.request_type === "Edit Team" &&
        request.reason
    ) {
        try {
            parsedReason = JSON.parse(request.reason);
        } catch (error) {
            parsedReason = null;
        }
    }

    let html = "";

    html += `
        <div class="request-detail-row">
            <strong>Request Type:</strong>
            <span>${escapeHtml(type)}</span>
        </div>

        <div class="request-detail-row">
            <strong>Team:</strong>
            <span>
                ${escapeHtml(
                    request.teams?.name ||
                    "Unknown Team"
                )}
            </span>
        </div>

        <div class="request-detail-row">
            <strong>Competition:</strong>
            <span>
                ${escapeHtml(
                    request.competitions?.name ||
                    "Unknown Competition"
                )}
            </span>
        </div>
    `;


    // ========================================
    // ADD PLAYER
    // ========================================

    if (
        request.request_type === "Add" ||
        request.request_type === "Add Player"
    ) {

        html += `
            <hr>

            <h3>âž• Requested Player</h3>

            <div class="request-detail-row">
                <strong>Full Name:</strong>
                <span>
                    ${escapeHtml(
                        request.requested_full_name ||
                        "Not provided"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>Jersey Number:</strong>
                <span>
                    ${escapeHtml(
                        request.requested_jersey_number ??
                        "Not provided"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>Position:</strong>
                <span>
                    ${escapeHtml(
                        request.requested_position ||
                        "Not provided"
                    )}
                </span>
            </div>
        `;

        if (request.requested_photo_url) {

            html += `
                <div class="request-photo-preview">
                    <strong>Player Photo:</strong>

                    <br>

                    <img
                        src="${escapeHtml(
                            request.requested_photo_url
                        )}"
                        alt="Requested player photo"
                        style="
                            width:100px;
                            height:100px;
                            object-fit:cover;
                            border-radius:50%;
                            margin-top:10px;
                        "
                    >
                </div>
            `;

        } else {

            html += `
                <div class="request-detail-row">
                    <strong>Player Photo:</strong>
                    <span>No photo provided</span>
                </div>
            `;
        }

        html += `
            <div class="request-detail-row">
                <strong>Reason:</strong>
                <span>
                    ${escapeHtml(reasonText)}
                </span>
            </div>
        `;
    }


    // ========================================
    // REMOVE PLAYER
    // ========================================

    else if (
        request.request_type === "Remove" ||
        request.request_type === "Remove Player"
    ) {

        html += `
            <hr>

            <h3>âž– Player Removal</h3>

            <div class="request-detail-row">
                <strong>Player:</strong>
                <span>
                    ${escapeHtml(
                        request.players?.full_name ||
                        "Unknown Player"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>Jersey Number:</strong>
                <span>
                    ${escapeHtml(
                        request.players?.jersey_number ??
                        "Not available"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>Position:</strong>
                <span>
                    ${escapeHtml(
                        request.players?.position ||
                        "Not available"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>Reason:</strong>
                <span>
                    ${escapeHtml(reasonText)}
                </span>
            </div>
        `;
    }


    // ========================================
    // EDIT PLAYER
    // ========================================

    else if (
        request.request_type === "Edit Player"
    ) {

        html += `
            <hr>

            <h3>âœï¸ Player Information Change</h3>

            <div class="request-detail-row">
                <strong>Current Player:</strong>
                <span>
                    ${escapeHtml(
                        request.players?.full_name ||
                        "Unknown Player"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>Current Jersey:</strong>
                <span>
                    ${escapeHtml(
                        request.players?.jersey_number ??
                        "Not available"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>Current Position:</strong>
                <span>
                    ${escapeHtml(
                        request.players?.position ||
                        "Not available"
                    )}
                </span>
            </div>

            <hr>

            <h3>Requested Changes</h3>

            <div class="request-detail-row">
                <strong>New Name:</strong>
                <span>
                    ${escapeHtml(
                        request.requested_full_name ||
                        "No change"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>New Jersey:</strong>
                <span>
                    ${escapeHtml(
                        request.requested_jersey_number ??
                        "No change"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>New Position:</strong>
                <span>
                    ${escapeHtml(
                        request.requested_position ||
                        "No change"
                    )}
                </span>
            </div>
        `;

        if (request.requested_photo_url) {

            html += `
                <div class="request-photo-preview">
                    <strong>New Player Photo:</strong>

                    <br>

                    <img
                        src="${escapeHtml(
                            request.requested_photo_url
                        )}"
                        alt="Requested player photo"
                        style="
                            width:100px;
                            height:100px;
                            object-fit:cover;
                            border-radius:50%;
                            margin-top:10px;
                        "
                    >
                </div>
            `;

        } else {

            html += `
                <div class="request-detail-row">
                    <strong>New Player Photo:</strong>
                    <span>No change</span>
                </div>
            `;
        }

        html += `
            <div class="request-detail-row">
                <strong>Reason:</strong>
                <span>
                    ${escapeHtml(reasonText)}
                </span>
            </div>
        `;
    }


    // ========================================
    // EDIT TEAM
    // ========================================

    else if (
        request.request_type === "Edit Team"
    ) {

        html += `
            <hr>

            <h3>ðŸ·ï¸ Requested Team Changes</h3>

            <div class="request-detail-row">
                <strong>Team Name:</strong>
                <span>
                    ${escapeHtml(
                        request.teams?.name ||
                        request.requested_full_name ||
                        "No change"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>Short Name:</strong>
                <span>
                    ${escapeHtml(
                        parsedReason?.short_name ||
                        request.requested_position ||
                        "No change"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>Location:</strong>
                <span>
                    ${escapeHtml(
                        parsedReason?.location ||
                        "No change"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>Coach:</strong>
                <span>
                    ${escapeHtml(
                        parsedReason?.coach_name ||
                        "No change"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>Captain:</strong>
                <span>
                    ${escapeHtml(
                        parsedReason?.captain_name ||
                        "No change"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>Vice Captain:</strong>
                <span>
                    ${escapeHtml(
                        parsedReason?.vice_captain_name ||
                        "No change"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>Discipline Master:</strong>
                <span>
                    ${escapeHtml(
                        parsedReason?.discipline_master_name ||
                        "No change"
                    )}
                </span>
            </div>

            <div class="request-detail-row">
                <strong>Logo:</strong>
                <span>
                    ${
                        parsedReason?.logo_url
                            ? "New logo provided"
                            : "No new logo"
                    }
                </span>
            </div>
        `;

        if (parsedReason?.logo_url) {

            html += `
                <div class="request-photo-preview">
                    <strong>New Team Logo:</strong>

                    <br>

                    <img
                        src="${escapeHtml(
                            parsedReason.logo_url
                        )}"
                        alt="Requested team logo"
                        style="
                            width:100px;
                            height:100px;
                            object-fit:cover;
                            border-radius:50%;
                            margin-top:10px;
                        "
                    >
                </div>
            `;
        }

        html += `
            <div class="request-detail-row">
                <strong>Reason:</strong>
                <span>
                    ${escapeHtml(
                        parsedReason?.reason ||
                        "No reason provided."
                    )}
                </span>
            </div>
        `;
    }


    // ========================================
    // COMMON INFORMATION
    // ========================================

    html += `
        <hr>

        <div class="request-detail-row">
            <strong>Status:</strong>
            <span>
                ${escapeHtml(
                    request.status ||
                    "Pending"
                )}
            </span>
        </div>

        <div class="request-detail-row">
            <strong>Submitted:</strong>
            <span>
                ${
                    request.created_at
                        ? new Date(
                            request.created_at
                        ).toLocaleString()
                        : "Unknown"
                }
            </span>
        </div>
    `;


    // ========================================
    // ADMIN ACTIONS
    // ========================================

    if (request.status === "Pending") {

        html += `
            <div
                style="
                    display:flex;
                    gap:10px;
                    flex-wrap:wrap;
                    margin-top:20px;
                "
            >

                <button
                    class="btn btn-success"
                    onclick="
                        approveSquadChangeRequest(
                            ${Number(request.id)}
                        )
                    "
                >
                    âœ… Approve Request
                </button>

                <button
                    class="btn btn-danger"
                    onclick="
                        rejectSquadChangeRequest(
                            ${Number(request.id)}
                        )
                    "
                >
                    âŒ Reject Request
                </button>

            </div>
        `;
    }

    details.innerHTML = html;

    modal.style.display = "flex";
}


// ========================================
// HTML ESCAPE HELPER
// ========================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ----------------------------------------
// CLOSE DETAILS
// ----------------------------------------

function closeSquadRequestDetails() {

    const modal =
        document.getElementById(
            "squadRequestModal"
        );

    if (modal) {

        modal.remove();

    }

}


// ----------------------------------------
// APPROVE REQUEST
// ----------------------------------------

async function approveSquadChangeRequest(
    requestId
) {

    if (!confirm(
        "Approve this request?"
    )) {
        return;
    }

    try {

        const {
            data,
            error
        } = await supabaseClient.rpc(
            "approve_squad_change_request",
            {
                p_request_id:
                    Number(requestId),

                p_admin_notes:
                    "Approved by administrator."
            }
        );

        if (error) {
            throw error;
        }

        if (
            data &&
            data.success === false
        ) {
            throw new Error(
                data.message ||
                "Approval failed."
            );
        }

        showMessage(
            "Request approved successfully.",
            "success"
        );

        closeSquadRequestDetails();

        await loadSquadChangeRequests();

    } catch (error) {

        console.error(
            "Approve request error:",
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
// REJECT REQUEST
// ----------------------------------------

async function rejectSquadChangeRequest(
    requestId
) {

    const notes =
        prompt(
            "Enter a reason for rejecting this request:"
        );

    if (
        notes === null
    ) {
        return;
    }

    try {

        const {
            data,
            error
        } = await supabaseClient.rpc(
            "reject_squad_change_request",
            {
                p_request_id:
                    Number(requestId),

                p_admin_notes:
                    notes.trim() ||
                    "Rejected by administrator."
            }
        );

        if (error) {
            throw error;
        }

        if (
            data &&
            data.success === false
        ) {
            throw new Error(
                data.message ||
                "Rejection failed."
            );
        }

        showMessage(
            "Request rejected successfully.",
            "success"
        );

        closeSquadRequestDetails();

        await loadSquadChangeRequests();

    } catch (error) {

        console.error(
            "Reject request error:",
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
            <div><h2>🔄 Player Movement</h2>
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

function movementStatusClass(status) {
    const value = String(status || "Pending").toLowerCase();

    if (value === "approved") return "approved";
    if (value === "rejected") return "rejected";

    return "pending";
}

function movementStatusBadge(status) {
    const safeStatus = escapeHtml(status || "Pending");
    const cls = movementStatusClass(status);

    const background =
        cls === "approved" ? "#d1e7dd" :
        cls === "rejected" ? "#f8d7da" :
        "#fff3cd";

    const color =
        cls === "approved" ? "#0f5132" :
        cls === "rejected" ? "#842029" :
        "#664d03";

    return `
        <span style="
            display:inline-block;
            padding:7px 12px;
            border-radius:20px;
            font-weight:700;
            background:${background};
            color:${color};
        ">${safeStatus}</span>
    `;
}

function movementRequestTypeLabel(type) {
    if (type === "Release") return "ðŸ“¤ Release Player";
    if (type === "Transfer") return "ðŸ” Player Transfer";
    if (type === "Free Agent Signing") return "ðŸ†“ Free-Agent Signing";

    return escapeHtml(type || "Player Movement");
}

function movementPlayerName(request) {
    return request.players?.full_name || "Unknown Player";
}

function movementTeamName(team) {
    return team?.name || "Unknown Team";
}

async function loadPlayerMovementDashboard() {

    try {
        ensurePlayerMovementDashboard();

        const {
            data,
            error
        } = await supabaseClient
            .from("player_movement_requests")
            .select(`
                id,
                player_id,
                request_type,
                requesting_team_id,
                from_team_id,
                to_team_id,
                competition_id,
                from_team_status,
                from_team_reviewed_at,
                from_team_notes,
                admin_status,
                reviewed_at,
                admin_notes,
                reason,
                status,
                created_at,
                updated_at,
                players (
                    id,
                    full_name,
                    jersey_number,
                    position,
                    photo_url,
                    team_id
                ),
                from_team:teams!player_movement_requests_from_team_id_fkey (
                    id,
                    name,
                    short_name,
                    logo_url
                ),
                to_team:teams!player_movement_requests_to_team_id_fkey (
                    id,
                    name,
                    short_name,
                    logo_url
                ),
                competitions (
                    id,
                    name,
                    season,
                    competition_type
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        playerMovementRequests = data || [];

        const {
            data: completedTransfers,
            error: completedError
        } = await supabaseClient
            .from("player_movement_requests")
            .select(`
                id,
                player_id,
                request_type,
                from_team_id,
                to_team_id,
                competition_id,
                admin_status,
                reviewed_at,
                admin_notes,
                reason,
                status,
                created_at,
                updated_at,
                players (
                    id,
                    full_name,
                    jersey_number,
                    position,
                    photo_url
                ),
                from_team:teams!player_movement_requests_from_team_id_fkey (
                    id,
                    name,
                    short_name,
                    logo_url
                ),
                to_team:teams!player_movement_requests_to_team_id_fkey (
                    id,
                    name,
                    short_name,
                    logo_url
                ),
                competitions (
                    id,
                    name,
                    season,
                    competition_type
                )
            `)
            .eq("request_type", "Transfer")
            .eq("status", "Approved")
            .order("reviewed_at", { ascending: false });

        if (completedError) {
            throw completedError;
        }

        playerMovementCompletedTransfers = completedTransfers || [];

        const {
            data: freeAgents,
            error: freeAgentError
        } = await supabaseClient
            .from("players")
            .select(`
                id,
                full_name,
                jersey_number,
                position,
                photo_url,
                registration_status,
                team_id
            `)
            .is("team_id", null)
            .eq("registration_status", "Approved")
            .order("full_name", { ascending: true });

        if (freeAgentError) {
            throw freeAgentError;
        }

        playerMovementFreeAgents = freeAgents || [];

        const playerIds =
            playerMovementFreeAgents.map(function (player) {
                return Number(player.id);
            });

        if (playerIds.length) {
            const {
                data: histories,
                error: historyError
            } = await supabaseClient
                .from("player_club_history")
                .select(`
                    id,
                    player_id,
                    team_id,
                    joined_at,
                    left_at,
                    movement_type,
                    status,
                    notes,
                    team:teams (
                        id,
                        name,
                        short_name,
                        logo_url
                    )
                `)
                .in("player_id", playerIds)
                .order("joined_at", { ascending: false });

            if (historyError) {
                throw historyError;
            }

            playerMovementFreeAgents =
                playerMovementFreeAgents.map(function (player) {
                    const history =
                        (histories || []).find(function (item) {
                            return Number(item.player_id) === Number(player.id);
                        });

                    return {
                        ...player,
                        formerHistory: history || null
                    };
                });
        }

        renderPlayerMovementCounters();
        renderPlayerMovementDashboard();

    } catch (error) {

        console.error(
            "Load player movement error:",
            error
        );

        const list =
            document.getElementById("playerMovementList");

        if (list) {
            list.innerHTML = `
                <div class="error-message">
                    Failed to load player movement:
                    ${escapeHtml(error.message || "Unknown error")}
                </div>
            `;
        }
    }
}

function renderPlayerMovementCounters() {

    const container =
        document.getElementById("playerMovementCounters");

    if (!container) return;

    const pendingReleases =
        playerMovementRequests.filter(function (request) {
            return request.request_type === "Release" &&
                   request.status === "Pending";
        }).length;

    const pendingTransfers =
        playerMovementRequests.filter(function (request) {
            return request.request_type === "Transfer" &&
                   request.status === "Pending";
        }).length;

    const pendingSignings =
        playerMovementRequests.filter(function (request) {
            return request.request_type === "Free Agent Signing" &&
                   request.status === "Pending";
        }).length;

    const completedTransfers =
        playerMovementCompletedTransfers.length;

    const freeAgents =
        playerMovementFreeAgents.length;

    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">ðŸ“¤</div>
            <div class="stat-number">${pendingReleases}</div>
            <div class="stat-label">Pending Releases</div>
        </div>

        <div class="stat-card">
            <div class="stat-icon">ðŸ”</div>
            <div class="stat-number">${pendingTransfers}</div>
            <div class="stat-label">Pending Transfers</div>
        </div>

        <div class="stat-card">
            <div class="stat-icon">ðŸ†“</div>
            <div class="stat-number">${pendingSignings}</div>
            <div class="stat-label">Pending Free-Agent Signings</div>
        </div>

        <div class="stat-card">
            <div class="stat-icon">ðŸ†</div>
            <div class="stat-number">${completedTransfers}</div>
            <div class="stat-label">Completed Transfers</div>
        </div>

        <div class="stat-card">
            <div class="stat-icon">ðŸ‘¤</div>
            <div class="stat-number">${freeAgents}</div>
            <div class="stat-label">Free Agents</div>
        </div>
    `;
}

function renderPlayerMovementDashboard() {

    const container =
        document.getElementById("playerMovementList");

    if (!container) return;

    let items = [];

    if (playerMovementFilter === "Free Agents") {
        items = playerMovementFreeAgents.map(function (player) {
            return {
                kind: "free-agent",
                player: player
            };
        });
    }
    else if (playerMovementFilter === "Completed Transfer") {
        items = playerMovementCompletedTransfers.map(function (request) {
            return {
                kind: "completed-transfer",
                request: request
            };
        });
    }
    else {
        items = playerMovementRequests
            .filter(function (request) {

                if (playerMovementFilter === "Pending") {
                    return request.status === "Pending";
                }

                if (playerMovementFilter === "All") {
                    return true;
                }

                return request.request_type === playerMovementFilter;
            })
            .map(function (request) {
                return {
                    kind: "request",
                    request: request
                };
            });
    }

    if (playerMovementSearch) {
        items = items.filter(function (item) {

            const request = item.request || {};
            const player = item.player || request.players || {};
            const fromTeam = request.from_team || {};
            const toTeam = request.to_team || {};
            const formerTeam = item.player?.formerHistory?.team || {};

            const searchable = [
                player.full_name,
                player.position,
                fromTeam.name,
                toTeam.name,
                formerTeam.name,
                request.request_type,
                request.status
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchable.includes(playerMovementSearch);
        });
    }

    if (!items.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size:42px;margin-bottom:10px;">ðŸ”„</div>
                <h3>No Player Movement Records</h3>
                <p>
                    There are currently no records matching this selection.
                </p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(function (item) {
        if (item.kind === "free-agent") {
            return createFreeAgentAdminCard(item.player);
        }

        if (item.kind === "completed-transfer") {
            return createCompletedTransferAdminCard(item.request);
        }

        return createPlayerMovementRequestCard(item.request);
    }).join("");
}

function createPlayerMovementRequestCard(request) {

    const player = request.players || {};
    const fromTeam = request.from_team || {};
    const toTeam = request.to_team || {};
    const competition = request.competitions || {};

    const isTransfer =
        request.request_type === "Transfer";

    const waitingForTeam =
        isTransfer &&
        request.from_team_status !== "Approved";

    const status = request.status || "Pending";
    const submitted = request.created_at
        ? new Date(request.created_at).toLocaleString()
        : "Unknown date";

    const photo = player.photo_url
        ? `<img src="${escapeHtml(player.photo_url)}"
                alt="Player photo"
                style="width:64px;height:64px;object-fit:cover;border-radius:50%;border:2px solid #ddd;">`
        : `<div style="width:64px;height:64px;border-radius:50%;background:#eee;display:flex;align-items:center;justify-content:center;font-size:28px;">ðŸ‘¤</div>`;

    const adminActionButtons = status === "Pending"
        ? `
            <button
                type="button"
                class="btn btn-primary"
                onclick="reviewPlayerMovement(${Number(request.id)}, 'approve')"
                ${waitingForTeam ? "disabled style=\"opacity:.55;cursor:not-allowed;\"" : ""}
            >
                âœ… Approve
            </button>

            <button
                type="button"
                class="btn btn-danger"
                onclick="reviewPlayerMovement(${Number(request.id)}, 'reject')"
            >
                âŒ Reject
            </button>
        `
        : "";

    return `
        <div class="form-card" style="margin-bottom:15px;border-left:5px solid ${
            status === "Approved" ? "#198754" :
            status === "Rejected" ? "#dc3545" :
            "#f5c542"
        }">

            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:15px;flex-wrap:wrap;">

                <div style="display:flex;gap:14px;align-items:center;min-width:250px;">
                    ${photo}
                    <div>
                        <h3 style="margin-bottom:5px;">
                            ${movementRequestTypeLabel(request.request_type)}
                        </h3>
                        <p><strong>Player:</strong> ${escapeHtml(player.full_name || "Unknown Player")}</p>
                        <p><strong>Position:</strong> ${escapeHtml(player.position || "Not available")}</p>
                        <p><strong>Jersey:</strong> ${escapeHtml(player.jersey_number ?? "Not available")}</p>
                    </div>
                </div>

                <div>
                    ${movementStatusBadge(status)}
                </div>
            </div>

            <div style="margin-top:15px;display:grid;gap:7px;">
                <p><strong>From Team:</strong> ${escapeHtml(movementTeamName(fromTeam))}</p>
                <p><strong>To Team:</strong> ${
    request.request_type === "Release"
        ? "Free Agent"
        : escapeHtml(movementTeamName(toTeam))
}</p>
                <p><strong>Competition:</strong> ${escapeHtml(competition.name || "Club Squad")}</p>
                <p><strong>Submitted:</strong> ${escapeHtml(submitted)}</p>
                <p><strong>Current Team Approval:</strong> ${escapeHtml(request.from_team_status || "Not Required")}</p>
                <p><strong>Administrator Approval:</strong> ${escapeHtml(request.admin_status || status)}</p>
                ${waitingForTeam ? `
                    <p style="color:#856404;background:#fff3cd;padding:10px;border-radius:8px;">
                        â³ Waiting for the current team to approve this transfer before administrator approval.
                    </p>
                ` : ""}
                ${request.reason ? `
                    <p><strong>Reason:</strong> ${escapeHtml(request.reason)}</p>
                ` : ""}
                ${request.admin_notes ? `
                    <p><strong>Admin Notes:</strong> ${escapeHtml(request.admin_notes)}</p>
                ` : ""}
                ${request.from_team_notes ? `
                    <p><strong>Current Team Notes:</strong> ${escapeHtml(request.from_team_notes)}</p>
                ` : ""}
            </div>

            <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">
                ${adminActionButtons}
                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick="openPlayerMovementDetails(${Number(request.id)})"
                >
                    ðŸ‘ï¸ View Details
                </button>
            </div>
        </div>
    `;
}

function createCompletedTransferAdminCard(request) {

    const player = request.players || {};
    const fromTeam = request.from_team || {};
    const toTeam = request.to_team || {};
    const competition = request.competitions || {};

    const completedAt = request.reviewed_at
        ? new Date(request.reviewed_at).toLocaleString()
        : "Unknown date";

    const photo = player.photo_url
        ? `<img src="${escapeHtml(player.photo_url)}"
                alt="Player photo"
                style="width:64px;height:64px;object-fit:cover;border-radius:50%;border:2px solid #ddd;">`
        : `<div style="width:64px;height:64px;border-radius:50%;background:#eee;display:flex;align-items:center;justify-content:center;font-size:28px;">ðŸ‘¤</div>`;

    return `
        <div class="form-card" style="margin-bottom:15px;border-left:5px solid #198754;">
            <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
                ${photo}
                <div style="flex:1;min-width:220px;">
                    <h3>ðŸ† Completed Transfer</h3>
                    <p><strong>Player:</strong> ${escapeHtml(player.full_name || "Unknown Player")}</p>
                    <p><strong>From:</strong> ${escapeHtml(movementTeamName(fromTeam))}</p>
                    <p><strong>To:</strong> ${escapeHtml(movementTeamName(toTeam))}</p>
                    <p><strong>Competition:</strong> ${escapeHtml(competition.name || "Club Squad")}</p>
                    <p><strong>Completed:</strong> ${escapeHtml(completedAt)}</p>
                </div>
                <div>${movementStatusBadge("Approved")}</div>
            </div>

            <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">
                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick="openPlayerMovementDetails(${Number(request.id)})"
                >
                    ðŸ‘ï¸ View Details
                </button>
            </div>
        </div>
    `;
}

function createFreeAgentAdminCard(player) {

    const history = player.formerHistory || {};
    const formerTeam = history.team || {};

    const photo = player.photo_url
        ? `<img src="${escapeHtml(player.photo_url)}"
                alt="Player photo"
                style="width:72px;height:72px;object-fit:cover;border-radius:50%;border:2px solid #ddd;">`
        : `<div style="width:72px;height:72px;border-radius:50%;background:#eee;display:flex;align-items:center;justify-content:center;font-size:30px;">ðŸ‘¤</div>`;

    const releasedAt = history.left_at
        ? new Date(history.left_at).toLocaleDateString()
        : "Not recorded";

    const formerLogo = formerTeam.logo_url
        ? `<img src="${escapeHtml(formerTeam.logo_url)}"
                alt="Former team logo"
                style="width:42px;height:42px;object-fit:contain;border-radius:8px;">`
        : "";

    return `
        <div class="form-card" style="margin-bottom:15px;border-left:5px solid #f5c542;">
            <div style="display:flex;gap:15px;align-items:center;flex-wrap:wrap;">
                ${photo}
                <div style="flex:1;min-width:220px;">
                    <h3>ðŸ†“ ${escapeHtml(player.full_name || "Unknown Player")}</h3>
                    <p><strong>Position:</strong> ${escapeHtml(player.position || "Not available")}</p>
                    <p><strong>Jersey:</strong> ${escapeHtml(player.jersey_number ?? "Not available")}</p>
                    <p><strong>Status:</strong> Free Agent</p>
                </div>
                <div style="text-align:center;min-width:130px;">
                    ${formerLogo}
                    <div style="margin-top:5px;font-weight:700;">
                        ${escapeHtml(formerTeam.name || "No Former Club")}
                    </div>
                </div>
            </div>

            <div style="margin-top:12px;display:grid;gap:6px;">
                <p><strong>Former Club:</strong> ${escapeHtml(formerTeam.name || "Not recorded")}</p>
                <p><strong>Released:</strong> ${escapeHtml(releasedAt)}</p>
                ${history.movement_type ? `<p><strong>Movement:</strong> ${escapeHtml(history.movement_type)}</p>` : ""}
            </div>

            <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">
                <a
                    href="player-profile.html?id=${Number(player.id)}"
                    class="btn btn-primary"
                    target="_blank"
                    rel="noopener"
                >
                    ðŸ‘¤ View Player Profile
                </a>
            </div>
        </div>
    `;
}

function openPlayerMovementDetails(requestId) {

    const request =
        playerMovementRequests.find(function (item) {
            return Number(item.id) === Number(requestId);
        }) ||
        playerMovementCompletedTransfers.find(function (item) {
            return Number(item.id) === Number(requestId);
        });

    if (!request) {
        alert("Movement request not found.");
        return;
    }

    let modal =
        document.getElementById("playerMovementModal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "playerMovementModal";
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
                >Ã—</button>
                <div id="playerMovementModalContent"></div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById("closePlayerMovementModal")
            ?.addEventListener("click", function () {
                modal.style.display = "none";
            });
    }

    const player = request.players || {};
    const fromTeam = request.from_team || {};
    const toTeam = request.to_team || {};
    const competition = request.competitions || {};

    const content = document.getElementById("playerMovementModalContent");

    if (!content) return;

    content.innerHTML = `
        <h2>ðŸ”„ Player Movement Details</h2>

        <div style="margin-top:18px;display:grid;gap:9px;">
            <p><strong>Request ID:</strong> ${escapeHtml(request.id)}</p>
            <p><strong>Movement:</strong> ${movementRequestTypeLabel(request.request_type)}</p>
            <p><strong>Player:</strong> ${escapeHtml(player.full_name || "Unknown Player")}</p>
            <p><strong>Position:</strong> ${escapeHtml(player.position || "Not available")}</p>
            <p><strong>Jersey:</strong> ${escapeHtml(player.jersey_number ?? "Not available")}</p>
            <p><strong>From Team:</strong> ${escapeHtml(fromTeam.name || "Not applicable")}</p>
            <p><strong>To Team:</strong> ${escapeHtml(toTeam.name || "Not applicable")}</p>
            <p><strong>Competition:</strong> ${escapeHtml(competition.name || "Club Squad")}</p>
            <p><strong>Current Team Status:</strong> ${escapeHtml(request.from_team_status || "Not Required")}</p>
            <p><strong>Administrator Status:</strong> ${escapeHtml(request.admin_status || request.status || "Pending")}</p>
            <p><strong>Overall Status:</strong> ${movementStatusBadge(request.status || "Pending")}</p>
            <p><strong>Reason:</strong> ${escapeHtml(request.reason || "No reason provided.")}</p>
            <p><strong>Submitted:</strong> ${escapeHtml(request.created_at ? new Date(request.created_at).toLocaleString() : "Unknown")}</p>
            ${request.from_team_notes ? `<p><strong>Current Team Notes:</strong> ${escapeHtml(request.from_team_notes)}</p>` : ""}
            ${request.admin_notes ? `<p><strong>Admin Notes:</strong> ${escapeHtml(request.admin_notes)}</p>` : ""}
            ${request.reviewed_at ? `<p><strong>Reviewed:</strong> ${escapeHtml(new Date(request.reviewed_at).toLocaleString())}</p>` : ""}
        </div>
    `;

    modal.style.display = "flex";
}

async function reviewPlayerMovement(requestId, action) {

    const request =
        playerMovementRequests.find(function (item) {
            return Number(item.id) === Number(requestId);
        });

    if (!request) {
        alert("Movement request not found.");
        return;
    }

    if (request.status !== "Pending") {
        alert("This movement request has already been processed.");
        return;
    }

    if (
        request.request_type === "Transfer" &&
        action === "approve" &&
        request.from_team_status !== "Approved"
    ) {
        alert("This transfer is waiting for approval from the current team.");
        return;
    }

    const promptText = action === "approve"
        ? "Enter administrator notes for approving this movement (optional):"
        : "Enter the reason for rejecting this movement request:";

    const notes = prompt(promptText);

    if (notes === null) {
        return;
    }

    const cleanedNotes =
        notes.trim() ||
        (action === "approve"
            ? "Approved by administrator."
            : "Rejected by administrator.");

    let rpcName = "";

    if (request.request_type === "Release") {
        rpcName = action === "approve"
            ? "approve_player_release"
            : "reject_player_release";
    }
    else if (request.request_type === "Free Agent Signing") {
        rpcName = action === "approve"
            ? "approve_free_agent_signing"
            : "reject_free_agent_signing";
    }
    else if (request.request_type === "Transfer") {
        rpcName = action === "approve"
            ? "approve_player_transfer"
            : "reject_player_transfer";
    }
    else {
        alert("Unsupported player movement type.");
        return;
    }

    try {

        const { data, error } =
            await supabaseClient.rpc(rpcName, {
                p_request_id: Number(requestId),
                p_admin_notes: cleanedNotes
            });

        if (error) {
            throw error;
        }

        if (data && data.success === false) {
            throw new Error(
                data.message || "Movement operation failed."
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
            (action === "approve"
                ? "Approval failed: "
                : "Rejection failed: ") +
            (error.message || "Unknown error"),
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
