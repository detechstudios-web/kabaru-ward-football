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
    // MATCH EVENT ELEMENTS
    // ========================================

    const appearancePlayersContainer =
        document.getElementById(
            "appearancePlayersContainer"
        );

    const yellowCardsContainer =
        document.getElementById(
            "yellowCardsContainer"
        );

    const redCardsContainer =
        document.getElementById(
            "redCardsContainer"
        );

    const addYellowCardBtn =
        document.getElementById(
            "addYellowCardBtn"
        );

    const addRedCardBtn =
        document.getElementById(
            "addRedCardBtn"
        );

    // ========================================
    // COMPETITION MANAGER ELEMENTS
    // ========================================

    const competitionForm =
        document.getElementById("competitionForm");
// ========================================
// COMPETITION FORMAT CONFIGURATION UI
// ========================================

const competitionTypeEl =
    document.getElementById("competitionType");

const competitionFormatConfiguration =
    document.getElementById(
        "competitionFormatConfiguration"
    );

const knockoutConfiguration =
    document.getElementById(
        "knockoutConfiguration"
    );

const groupConfiguration =
    document.getElementById(
        "groupConfiguration"
    );

function updateCompetitionFormatConfiguration() {

    if (
        !competitionTypeEl ||
        !competitionFormatConfiguration ||
        !knockoutConfiguration ||
        !groupConfiguration
    ) {
        return;
    }

    const competitionType =
        competitionTypeEl.value;

    // Hide everything first
    competitionFormatConfiguration.style.display =
        "none";

    knockoutConfiguration.style.display =
        "none";

    groupConfiguration.style.display =
        "none";

    // ----------------------------------------
    // KNOCKOUT
    // ----------------------------------------

    if (
        competitionType === "Knockout"
    ) {

        competitionFormatConfiguration.style.display =
            "block";

        knockoutConfiguration.style.display =
            "block";

        return;
    }

    // ----------------------------------------
    // GROUP + KNOCKOUT
    // ----------------------------------------

    if (
        competitionType === "Group + Knockout"
    ) {

        competitionFormatConfiguration.style.display =
            "block";

        knockoutConfiguration.style.display =
            "block";

        groupConfiguration.style.display =
            "block";

        return;
    }

    // ----------------------------------------
    // LEAGUE / FRIENDLY
    // ----------------------------------------

    competitionFormatConfiguration.style.display =
        "none";
}


// Update when administrator changes type
if (competitionTypeEl) {

    competitionTypeEl.addEventListener(
        "change",
        updateCompetitionFormatConfiguration
    );

}


// Set correct state when page loads
updateCompetitionFormatConfiguration();
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
// MATCH EVENT STATE
// ========================================

let yellowCardEntries = [];
let redCardEntries = [];

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
// COMPETITION ENGINE HELPERS
// ========================================

function getCompetitionFormat(
    competitionType
) {

    if (
        competitionType ===
        "League"
    ) {
        return "league";
    }

    if (
        competitionType ===
        "Knockout"
    ) {
        return "knockout";
    }

    if (
        competitionType ===
        "Group + Knockout"
    ) {
        return "group_knockout";
    }

    if (
        competitionType ===
        "Friendly"
    ) {
        return "friendly";
    }

    return null;
}


// ========================================
// KNOCKOUT ROUND INFORMATION
// ========================================

function getKnockoutRoundInfo(
    startingRound
) {

    const roundOrder = [
        "Round of 64",
        "Round of 32",
        "Round of 16",
        "Quarter-Finals",
        "Semi-Finals",
        "Final"
    ];

    const matchCounts = {
        "Round of 64": 32,
        "Round of 32": 16,
        "Round of 16": 8,
        "Quarter-Finals": 4,
        "Semi-Finals": 2,
        "Final": 1
    };

    const startingIndex =
        roundOrder.indexOf(
            startingRound
        );

    if (
        startingIndex === -1
    ) {
        throw new Error(
            "Invalid knockout starting round."
        );
    }

    return roundOrder
        .slice(startingIndex)
        .map(
            function (roundName, index) {

                return {
                    name:
                        roundName,

                    round_order:
                        index + 1,

                    number_of_matches:
                        matchCounts[
                            roundName
                        ]
                };

            }
        );
}


// ========================================
// CREATE KNOCKOUT STAGE
// ========================================

async function createKnockoutStage(
    competitionId,
    competitionName,
    startingRound,
    legs,
    extraTimeEnabled,
    penaltiesEnabled,
    stageOrder
) {

    const {
        data: stage,
        error: stageError
    } =
        await supabaseClient
            .from(
                "competition_stages"
            )
            .insert({

                competition_id:
                    competitionId,

                name:
                    competitionName +
                    " - Knockout",

                stage_type:
                    "knockout",

                stage_order:
                    stageOrder,

                status:
                    "Upcoming",

                description:
                    "Knockout stage generated automatically."

            })
            .select()
            .single();

    if (stageError) {
        throw stageError;
    }


    const rounds =
        getKnockoutRoundInfo(
            startingRound
        );


    for (
        const round of rounds
    ) {

        const {
            error: roundError
        } =
            await supabaseClient
                .from(
                    "competition_knockout_rounds"
                )
                .insert({

                    stage_id:
                        stage.id,

                    name:
                        round.name,

                    round_order:
                        round.round_order,

                    status:
                        "Upcoming",

                    number_of_matches:
                        round.number_of_matches,

                    legs:
                        legs,

                    advancement_rule:
                        legs === 2
                            ? "aggregate_score"
                            : "winner",

                    aggregate_enabled:
                        legs === 2,

                    extra_time_enabled:
                        extraTimeEnabled,

                    penalties_enabled:
                        penaltiesEnabled

                });

        if (roundError) {
            throw roundError;
        }
    }


    return stage;
}


// ========================================
// CREATE LEAGUE STAGE
// ========================================

async function createLeagueStage(
    competitionId,
    competitionName
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "competition_stages"
            )
            .insert({

                competition_id:
                    competitionId,

                name:
                    competitionName +
                    " - League",

                stage_type:
                    "league",

                stage_order:
                    1,

                status:
                    "Upcoming",

                description:
                    "League stage generated automatically."

            })
            .select()
            .single();

    if (error) {
        throw error;
    }

    return data;
}


// ========================================
// CREATE GROUP + KNOCKOUT STRUCTURE
// ========================================

async function createGroupKnockoutStructure(
    competitionId,
    competitionName,
    numberOfGroups,
    teamsPerGroup,
    qualifiersPerGroup,
    qualificationMethod,
    startingRound,
    legs,
    extraTimeEnabled,
    penaltiesEnabled
) {

    const totalQualifiers =
        numberOfGroups *
        qualifiersPerGroup;


    const roundRequirements = {
        "Round of 64": 64,
        "Round of 32": 32,
        "Round of 16": 16,
        "Quarter-Finals": 8,
        "Semi-Finals": 4
    };


    const requiredTeams =
        roundRequirements[
            startingRound
        ];


    if (!requiredTeams) {

        throw new Error(
            "Invalid knockout starting round."
        );
    }


    if (
        numberOfGroups < 1
    ) {

        throw new Error(
            "Number of groups must be at least 1."
        );
    }


    if (
        teamsPerGroup < 1
    ) {

        throw new Error(
            "Teams per group must be at least 1."
        );
    }


    if (
        qualifiersPerGroup < 1 ||
        qualifiersPerGroup >
        teamsPerGroup
    ) {

        throw new Error(
            "Qualifiers per group cannot exceed teams per group."
        );
    }


    if (
        totalQualifiers !==
        requiredTeams
    ) {

        throw new Error(
            "The group stage produces " +
            totalQualifiers +
            " knockout qualifiers, but " +
            startingRound +
            " requires exactly " +
            requiredTeams +
            " teams."
        );
    }


    const {
        data: groupStage,
        error: groupStageError
    } =
        await supabaseClient
            .from(
                "competition_stages"
            )
            .insert({

                competition_id:
                    competitionId,

                name:
                    competitionName +
                    " - Group Stage",

                stage_type:
                    "group",

                stage_order:
                    1,

                status:
                    "Upcoming",

                description:
                    "Group stage generated automatically.",

                number_of_groups:
                    numberOfGroups,

                teams_per_group:
                    teamsPerGroup,

                qualifiers_per_group:
                    qualifiersPerGroup,

                qualification_method:
                    qualificationMethod

            })
            .select()
            .single();

    if (groupStageError) {
        throw groupStageError;
    }


    const groups = [];


    for (
        let i = 1;
        i <= numberOfGroups;
        i++
    ) {

        const groupLetter =
            String.fromCharCode(
                64 + i
            );


        const {
            data: group,
            error: groupError
        } =
            await supabaseClient
                .from(
                    "competition_groups"
                )
                .insert({

                    stage_id:
                        groupStage.id,

                    name:
                        "Group " +
                        groupLetter,

                    group_order:
                        i

                })
                .select()
                .single();

        if (groupError) {
            throw groupError;
        }


        groups.push(group);


        for (
            let position = 1;
            position <=
            qualifiersPerGroup;
            position++
        ) {

            const {
                error:
                    qualificationError
            } =
                await supabaseClient
                    .from(
                        "competition_qualification_slots"
                    )
                    .insert({

                        stage_id:
                            groupStage.id,

                        group_id:
                            group.id,

                        position:
                            position,

                        label:
                            "Group " +
                            groupLetter +
                            " - Position " +
                            position

                    });

            if (
                qualificationError
            ) {
                throw qualificationError;
            }
        }
    }


    const knockoutStage =
        await createKnockoutStage(
            competitionId,
            competitionName,
            startingRound,
            legs,
            extraTimeEnabled,
            penaltiesEnabled,
            2
        );


    const {
        error:
            progressionError
    } =
        await supabaseClient
            .from(
                "competition_stages"
            )
            .update({

                next_stage_id:
                    knockoutStage.id,

                progression_method:
                    "qualification"

            })
            .eq(
                "id",
                groupStage.id
            );


    if (
        progressionError
    ) {
        throw progressionError;
    }


    return {
        groupStage:
            groupStage,

        knockoutStage:
            knockoutStage,

        groups:
            groups
    };
}


// ========================================
// CREATE COMPETITION STRUCTURE
// ========================================

async function createCompetitionStructure(
    competition
) {

    const format =
        competition.competition_format;


    if (
        format ===
        "friendly"
    ) {

        console.log(
            "Friendly competition created without competition stages."
        );

        return;
    }


    if (
        format ===
        "league"
    ) {

        await createLeagueStage(
            competition.id,
            competition.name
        );

        return;
    }


    if (
        format ===
        "knockout"
    ) {

        await createKnockoutStage(
            competition.id,
            competition.name,
            competition.knockout_start_round,
            competition.knockout_legs,
            competition.knockout_extra_time,
            competition.knockout_penalties,
            1
        );

        return;
    }


    if (
        format ===
        "group_knockout"
    ) {

        await createGroupKnockoutStructure(
            competition.id,
            competition.name,
            competition.number_of_groups,
            competition.teams_per_group,
            competition.qualifiers_per_group,
            competition.qualification_method,
            competition.knockout_start_round,
            competition.knockout_legs,
            competition.knockout_extra_time,
            competition.knockout_penalties
        );

        return;
    }


    throw new Error(
        "Unsupported competition format: " +
        format
    );
}


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


            const competitionFormat =
                getCompetitionFormat(
                    competitionType
                );


            const knockoutStartRoundInput =
                document.getElementById(
                    "knockoutStartRound"
                );

            const knockoutLegsInput =
                document.getElementById(
                    "knockoutLegs"
                );

            const knockoutExtraTimeInput =
                document.getElementById(
                    "knockoutExtraTime"
                );

            const knockoutPenaltiesInput =
                document.getElementById(
                    "knockoutPenalties"
                );

            const numberOfGroupsInput =
                document.getElementById(
                    "numberOfGroups"
                );

            const teamsPerGroupInput =
                document.getElementById(
                    "teamsPerGroup"
                );

            const qualifiersPerGroupInput =
                document.getElementById(
                    "qualifiersPerGroup"
                );

            const qualificationMethodInput =
                document.getElementById(
                    "qualificationMethod"
                );


            const knockoutStartRound =
                knockoutStartRoundInput &&
                knockoutStartRoundInput.value
                    ? knockoutStartRoundInput.value
                    : null;


            const knockoutLegs =
                knockoutLegsInput &&
                knockoutLegsInput.value
                    ? Number(
                        knockoutLegsInput.value
                    )
                    : 1;


            const knockoutExtraTime =
                knockoutExtraTimeInput
                    ? knockoutExtraTimeInput.checked
                    : false;


            const knockoutPenalties =
                knockoutPenaltiesInput
                    ? knockoutPenaltiesInput.checked
                    : false;


            const numberOfGroups =
                numberOfGroupsInput &&
                numberOfGroupsInput.value
                    ? Number(
                        numberOfGroupsInput.value
                    )
                    : null;


            const teamsPerGroup =
                teamsPerGroupInput &&
                teamsPerGroupInput.value
                    ? Number(
                        teamsPerGroupInput.value
                    )
                    : null;


            const qualifiersPerGroup =
                qualifiersPerGroupInput &&
                qualifiersPerGroupInput.value
                    ? Number(
                        qualifiersPerGroupInput.value
                    )
                    : null;


            const qualificationMethod =
                qualificationMethodInput &&
                qualificationMethodInput.value
                    ? qualificationMethodInput.value
                    : null;


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


            if (!competitionFormat) {

                competitionFormMessage.textContent =
                    "❌ Invalid competition format.";

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


            if (
                competitionFormat ===
                    "knockout" ||
                competitionFormat ===
                    "group_knockout"
            ) {

                if (
                    !knockoutStartRound
                ) {

                    competitionFormMessage.textContent =
                        "❌ Please select the knockout starting round.";

                    competitionFormMessage.style.display =
                        "block";

                    return;
                }


                if (
                    knockoutLegs !== 1 &&
                    knockoutLegs !== 2
                ) {

                    competitionFormMessage.textContent =
                        "❌ Knockout legs must be one or two.";

                    competitionFormMessage.style.display =
                        "block";

                    return;
                }
            }


            if (
                competitionFormat ===
                "group_knockout"
            ) {

                if (
                    !numberOfGroups ||
                    !teamsPerGroup ||
                    !qualifiersPerGroup
                ) {

                    competitionFormMessage.textContent =
                        "❌ Please complete all group stage settings.";

                    competitionFormMessage.style.display =
                        "block";

                    return;
                }


                if (
                    !qualificationMethod
                ) {

                    competitionFormMessage.textContent =
                        "❌ Please select a qualification method.";

                    competitionFormMessage.style.display =
                        "block";

                    return;
                }


                if (
                    qualifiersPerGroup >
                    teamsPerGroup
                ) {

                    competitionFormMessage.textContent =
                        "❌ Qualifiers per group cannot exceed teams per group.";

                    competitionFormMessage.style.display =
                        "block";

                    return;
                }


                const roundRequirements = {
                    "Round of 64": 64,
                    "Round of 32": 32,
                    "Round of 16": 16,
                    "Quarter-Finals": 8,
                    "Semi-Finals": 4
                };


                const requiredTeams =
                    roundRequirements[
                        knockoutStartRound
                    ];


                const totalQualifiers =
                    numberOfGroups *
                    qualifiersPerGroup;


                if (
                    totalQualifiers !==
                    requiredTeams
                ) {

                    competitionFormMessage.textContent =
                        "❌ Your group settings produce " +
                        totalQualifiers +
                        " qualifiers, but " +
                        knockoutStartRound +
                        " requires exactly " +
                        requiredTeams +
                        " teams.";

                    competitionFormMessage.style.display =
                        "block";

                    return;
                }
            }


            competitionFormMessage.textContent =
                "Saving competition and generating structure...";

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
                        .from(
                            "competitions"
                        )
                        .insert({

                            name:
                                name,

                            competition_type:
                                competitionType,

                            competition_format:
                                competitionFormat,

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
                                null,

                            knockout_start_round:
                                (
                                    competitionFormat ===
                                        "knockout" ||
                                    competitionFormat ===
                                        "group_knockout"
                                )
                                    ? knockoutStartRound
                                    : null,

                            number_of_groups:
                                competitionFormat ===
                                "group_knockout"
                                    ? numberOfGroups
                                    : null,

                            teams_per_group:
                                competitionFormat ===
                                "group_knockout"
                                    ? teamsPerGroup
                                    : null,

                            qualifiers_per_group:
                                competitionFormat ===
                                "group_knockout"
                                    ? qualifiersPerGroup
                                    : null,

                            qualification_method:
                                competitionFormat ===
                                "group_knockout"
                                    ? qualificationMethod
                                    : null

                        })
                        .select()
                        .single();


                if (error) {
                    throw error;
                }


                /*
                 * The database competition row does not
                 * contain knockout legs or decision toggles,
                 * so those settings are passed directly to
                 * the structure generator below.
                 */

                await createCompetitionStructure({

                    id:
                        data.id,

                    name:
                        data.name,

                    competition_format:
                        competitionFormat,

                    knockout_start_round:
                        knockoutStartRound,

                    knockout_legs:
                        knockoutLegs,

                    knockout_extra_time:
                        knockoutExtraTime,

                    knockout_penalties:
                        knockoutPenalties,

                    number_of_groups:
                        numberOfGroups,

                    teams_per_group:
                        teamsPerGroup,

                    qualifiers_per_group:
                        qualifiersPerGroup,

                    qualification_method:
                        qualificationMethod

                });


                console.log(
                    "Competition and structure created successfully:",
                    data
                );


                competitionFormMessage.textContent =
                    "✅ Competition and competition structure created successfully.";

                competitionFormMessage.style.display =
                    "block";


                if (competitionForm) {
                    competitionForm.reset();
                }


                updateCompetitionFormatConfiguration();


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
        "CREATE COMPETITION FORM NOT FOUND. " +
        "Make sure the form has id='competitionForm'."
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
// CREATED FIXTURES FILTER
// ========================================

let adminFixtures = [];
let createdFixtureStatusFilter = "All";

function ensureCreatedFixturesFilter() {

    if (!fixturesList) {
        return;
    }

    let filterBox =
        document.getElementById(
            "createdFixturesFilterBox"
        );

    if (!filterBox) {

        filterBox =
            document.createElement("div");

        filterBox.id =
            "createdFixturesFilterBox";

        filterBox.className =
            "form-card";

        filterBox.style.marginTop =
            "15px";

        filterBox.innerHTML = `
            <div
                class="form-group"
                style="margin-bottom:0;"
            >

                <label
                    for="createdFixtureStatusFilter"
                >
                    <strong>
                        Filter Created Fixtures
                    </strong>
                </label>

                <select
                    id="createdFixtureStatusFilter"
                    class="form-control"
                >

                    <option value="All">
                        📋 All Fixtures
                    </option>

                    <option value="Scheduled">
                        📅 Scheduled
                    </option>

                    <option value="Published">
                        📢 Published
                    </option>

                    <option value="Completed">
                        ✅ Completed
                    </option>

                </select>

            </div>

            <div
                id="createdFixturesCount"
                style="
                    margin-top:10px;
                    font-weight:600;
                "
            >
            </div>
        `;

        if (fixturesList.parentNode) {

            fixturesList.parentNode.insertBefore(
                filterBox,
                fixturesList
            );
        }

        const filterSelect =
            document.getElementById(
                "createdFixtureStatusFilter"
            );

        if (filterSelect) {

            filterSelect.value =
                createdFixtureStatusFilter;

            filterSelect.addEventListener(
                "change",
                function () {

                    createdFixtureStatusFilter =
                        this.value;

                    renderCreatedFixtures();
                }
            );
        }
    }
}


// ========================================
// RENDER CREATED FIXTURES
// ========================================

function renderCreatedFixtures() {

    if (!fixturesList) {
        return;
    }
    // ========================================
    // UPDATE FIXTURE FILTER COUNTS
    // ========================================

    const allCount =
        adminFixtures.length;

    const scheduledCount =
        adminFixtures.filter(
            function (fixture) {
                return String(
                    fixture.status ||
                    "Scheduled"
                ).toLowerCase() ===
                "scheduled";
            }
        ).length;

    const publishedCount =
        adminFixtures.filter(
            function (fixture) {
                return String(
                    fixture.status ||
                    "Scheduled"
                ).toLowerCase() ===
                "published";
            }
        ).length;

    const completedCount =
        adminFixtures.filter(
            function (fixture) {
                return String(
                    fixture.status ||
                    "Scheduled"
                ).toLowerCase() ===
                "completed";
            }
        ).length;

    const filterSelect =
        document.getElementById(
            "createdFixtureStatusFilter"
        );

    if (filterSelect) {

        filterSelect.options[0].textContent =
            "📋 All Fixtures (" +
            allCount +
            ")";

        filterSelect.options[1].textContent =
            "📅 Scheduled (" +
            scheduledCount +
            ")";

        filterSelect.options[2].textContent =
            "📢 Published (" +
            publishedCount +
            ")";

        filterSelect.options[3].textContent =
            "✅ Completed (" +
            completedCount +
            ")";
    }
    const filteredFixtures =
        adminFixtures.filter(
            function (fixture) {

                const status =
                    fixture.status ||
                    "Scheduled";

                if (
                    createdFixtureStatusFilter ===
                    "All"
                ) {
                    return true;
                }

                return (
                    String(status).toLowerCase() ===
                    String(
                        createdFixtureStatusFilter
                    ).toLowerCase()
                );
            }
        );

    const countEl =
        document.getElementById(
            "createdFixturesCount"
        );

    if (countEl) {

        countEl.textContent =
            "Showing " +
            filteredFixtures.length +
            " of " +
            adminFixtures.length +
            " fixtures";
    }

    if (
        !filteredFixtures ||
        filteredFixtures.length === 0
    ) {

        let message =
            "No fixtures found.";

        if (
            createdFixtureStatusFilter !==
            "All"
        ) {

            message =
                "No " +
                createdFixtureStatusFilter.toLowerCase() +
                " fixtures found.";
        }

        fixturesList.innerHTML =
            '<div class="empty-message">' +
            escapeHtml(message) +
            '</div>';

        return;
    }

    let html = "";

    filteredFixtures.forEach(
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

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:flex-start;
                            gap:15px;
                            flex-wrap:wrap;
                        "
                    >

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
                                <strong>
                                    Competition:
                                </strong>
                                ${escapeHtml(
                                    competition.name ||
                                    "Competition"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Season:
                                </strong>
                                ${escapeHtml(
                                    competition.season ||
                                    "-"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Date:
                                </strong>
                                ${formatDate(
                                    fixture.match_date
                                )}
                            </p>

                            <p>
                                <strong>
                                    Kick-off:
                                </strong>
                                ${escapeHtml(
                                    fixture.kick_off ||
                                    "-"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Venue:
                                </strong>
                                ${escapeHtml(
                                    fixture.venue ||
                                    "-"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Matchday:
                                </strong>
                                ${escapeHtml(
                                    fixture.matchday ||
                                    "-"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Status:
                                </strong>
                                ${escapeHtml(
                                    fixtureStatusValue
                                )}
                            </p>

                        </div>

                        <div
                            style="
                                display:flex;
                                gap:8px;
                                flex-wrap:wrap;
                            "
                        >

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
}


// ========================================
// LOAD CREATED FIXTURES
// ========================================

async function loadFixtures() {

    if (!fixturesList) {
        return;
    }

    ensureCreatedFixturesFilter();

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

        adminFixtures =
            data || [];

        if (
            adminFixtures.length === 0
        ) {

            const countEl =
                document.getElementById(
                    "createdFixturesCount"
                );

            if (countEl) {
                countEl.textContent =
                    "Showing 0 fixtures";
            }

            fixturesList.innerHTML =
                '<div class="empty-message">' +
                'No fixtures found.' +
                '</div>';

            return;
        }

        renderCreatedFixtures();

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
// ========================================
// LOAD MATCH EVENT PLAYER CONTROLS
// ========================================




                if (homeGoalsContainer) {
                    homeGoalsContainer.innerHTML =
                        "";
                }

                if (awayGoalsContainer) {
                    awayGoalsContainer.innerHTML =
                        "";
                }
if (appearancePlayersContainer) {
    appearancePlayersContainer.innerHTML =
        "";
}

if (yellowCardsContainer) {
    yellowCardsContainer.innerHTML =
        "";
}

if (redCardsContainer) {
    redCardsContainer.innerHTML =
        "";
    loadAppearancePlayers();
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

// ========================================
// INITIALIZE MATCH EVENT CONTROLS
// ========================================


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
        grid-template-columns:1fr 90px 1fr 80px 45px;
        gap:8px;
        margin-bottom:10px;
        align-items:center;
    `;


    // ========================================
    // SCORER
    // ========================================

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


    // ========================================
    // GOAL MINUTE
    // ========================================

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


    // ========================================
    // ASSIST PROVIDER
    // ========================================

    const assistSelect =
        document.createElement(
            "select"
        );


    assistSelect.className =
        "form-control";


    assistSelect.innerHTML =
        "<option value=''>No assist</option>";


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


            assistSelect.appendChild(
                option
            );

        }
    );


    // ========================================
    // PENALTY
    // ========================================

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


    // ========================================
    // REMOVE BUTTON
    // ========================================

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


    // ========================================
    // STORE DATA ON ROW
    // ========================================

    row._goalPlayerSelect =
        playerSelect;

    row._goalMinuteInput =
        minuteInput;

    row._goalAssistSelect =
        assistSelect;

    row._goalPenaltyCheckbox =
        penaltyCheckbox;


    // ========================================
    // ADD ELEMENTS TO ROW
    // ========================================

    row.appendChild(
        playerSelect
    );

    row.appendChild(
        minuteInput
    );

    row.appendChild(
        assistSelect
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
// CREATE PLAYER OPTION HTML
// ========================================

function buildPlayerOptions(
    players,
    placeholder
) {

    let html =
        `<option value="">${placeholder}</option>`;

    (players || []).forEach(
        function (player) {

            html +=
                `<option value="${player.id}">` +
                (
                    player.jersey_number
                        ? "#" +
                          player.jersey_number +
                          " "
                        : ""
                ) +
                player.full_name +
                `</option>`;
        }
    );

    return html;
}


// ========================================
// GET ALL RESULT PLAYERS
// ========================================

function getAllResultPlayers() {

    const players = [];

    (homePlayers || []).forEach(
        function (player) {

            players.push(player);

        }
    );

    (awayPlayers || []).forEach(
        function (player) {

            players.push(player);

        }
    );

    return players;
}


// ========================================
// CREATE APPEARANCE PLAYER CHECKBOX
// ========================================

function createAppearancePlayer(
    player
) {

    if (
        !appearancePlayersContainer ||
        !player
    ) {
        return;
    }


    const label =
        document.createElement("label");


    label.className =
        "appearance-player";


    label.style.cssText = `
        display:flex;
        align-items:center;
        gap:8px;
        padding:8px 10px;
        margin-bottom:6px;
        border:1px solid #ddd;
        border-radius:6px;
        cursor:pointer;
    `;


    const checkbox =
        document.createElement("input");


    checkbox.type =
        "checkbox";


    checkbox.value =
        player.id;


    checkbox.dataset.playerId =
        player.id;


    const playerName =
        document.createElement("span");


    playerName.textContent =
        (
            player.jersey_number
                ? "#" +
                  player.jersey_number +
                  " "
                : ""
        ) +
        player.full_name;


    label.appendChild(
        checkbox
    );

    label.appendChild(
        playerName
    );


    appearancePlayersContainer.appendChild(
        label
    );
}


// ========================================
// LOAD APPEARANCE PLAYERS
// ========================================

function loadAppearancePlayers() {

    if (
        !appearancePlayersContainer
    ) {
        return;
    }


    appearancePlayersContainer.innerHTML =
        "";


    const allPlayers =
        getAllResultPlayers();


    if (
        allPlayers.length === 0
    ) {

        appearancePlayersContainer.innerHTML =
            "<p>No approved players available.</p>";

        return;
    }


    allPlayers.forEach(
        function (player) {

            createAppearancePlayer(
                player
            );

        }
    );
}


// ========================================
// CREATE CARD ENTRY
// ========================================

function addCardRow(
    container,
    players,
    cardType
) {

    if (
        !container
    ) {
        return;
    }


    const row =
        document.createElement("div");


    row.className =
        "card-event-row";


    row.style.cssText = `
        display:grid;
        grid-template-columns:1fr 90px 45px;
        gap:8px;
        margin-bottom:10px;
        align-items:center;
    `;


    // PLAYER

    const playerSelect =
        document.createElement("select");


    playerSelect.className =
        "form-control";


    playerSelect.innerHTML =
        buildPlayerOptions(
            players,
            "Select player"
        );


    // MINUTE

    const minuteInput =
        document.createElement("input");


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


    // REMOVE

    const removeButton =
        document.createElement("button");


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

        }
    );


    row.appendChild(
        playerSelect
    );

    row.appendChild(
        minuteInput
    );

    row.appendChild(
        removeButton
    );


    // Store references for SAVE RESULT

    row._cardPlayerSelect =
        playerSelect;

    row._cardMinuteInput =
        minuteInput;

    row._cardType =
        cardType;


    container.appendChild(
        row
    );
}


// ========================================
// GET CARD DATA
// ========================================

function getCardData(
    container,
    cardType
) {

    const cards = [];


    if (!container) {
        return cards;
    }


    const rows =
        container.querySelectorAll(
            ".card-event-row"
        );


    rows.forEach(
        function (row) {

            const playerId =
                row._cardPlayerSelect
                    ? row._cardPlayerSelect.value
                    : "";

            const minute =
                row._cardMinuteInput
                    ? Number(
                        row._cardMinuteInput.value
                    )
                    : 0;


            if (
                playerId
            ) {

                cards.push({

                    player_id:
                        Number(
                            playerId
                        ),

                    minute:
                        minute > 0
                            ? minute
                            : null,

                    card_type:
                        cardType

                });

            }

        }
    );


    return cards;
}


// ========================================
// INITIALIZE MATCH EVENT CONTROLS
// ========================================

function initializeResultEventControls() {

    if (!appearancePlayersContainer) {
        return;
    }

    if (addYellowCardBtn) {
        addYellowCardBtn.onclick = function () {

            addCardRow(
                yellowCardsContainer,
                getAllResultPlayers(),
                "yellow"
            );

        };
    }

    if (addRedCardBtn) {
        addRedCardBtn.onclick = function () {

            addCardRow(
                redCardsContainer,
                getAllResultPlayers(),
                "red"
            );

        };
    }
}
// Initialize match event buttons once
initializeResultEventControls();
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
// ============================================================
// AUTOMATIC KNOCKOUT PROGRESSION
// ============================================================

async function advanceKnockoutAfterResult(
    completedFixture,
    homeFinalScore,
    awayFinalScore
) {
    try {
        // ----------------------------------------------------
        // 1. Get competition information
        // ----------------------------------------------------
        const { data: competition, error: competitionError } =
            await supabase
                .from("competitions")
                .select(`
                    id,
                    name,
                    competition_type,
                    competition_format,
                    knockout_legs
                `)
                .eq("id", completedFixture.competition_id)
                .single();

        if (competitionError) throw competitionError;

        // Only process pure knockout competitions.
        if (competition.competition_format !== "knockout") {
            return {
                type: "not_applicable"
            };
        }

        // Current result structure supports one-leg knockout.
        if (
            competition.knockout_legs &&
            Number(competition.knockout_legs) !== 1
        ) {
            return {
                type: "warning",
                message:
                    "The result was saved, but automatic progression is currently disabled for two-leg knockout competitions."
            };
        }

        // ----------------------------------------------------
        // 2. Determine winner of the completed match
        // ----------------------------------------------------
        if (Number(homeFinalScore) === Number(awayFinalScore)) {
            return {
                type: "warning",
                message:
                    "The result was saved, but automatic knockout progression could not continue because the match is tied. A winner must be determined through extra time or penalties."
            };
        }

        const winnerTeamId =
            Number(homeFinalScore) > Number(awayFinalScore)
                ? completedFixture.home_team_id
                : completedFixture.away_team_id;

        // ----------------------------------------------------
        // 3. Get knockout stage
        // ----------------------------------------------------
        const { data: stage, error: stageError } =
            await supabase
                .from("competition_stages")
                .select("*")
                .eq("competition_id", competition.id)
                .eq("stage_type", "knockout")
                .order("created_at", { ascending: true })
                .limit(1)
                .maybeSingle();

        if (stageError) throw stageError;

        if (!stage) {
            return {
                type: "warning",
                message:
                    "The result was saved, but no knockout stage was found for this competition."
            };
        }

        // ----------------------------------------------------
        // 4. Get knockout rounds
        // ----------------------------------------------------
        const { data: rounds, error: roundsError } =
            await supabase
                .from("competition_knockout_rounds")
                .select("*")
                .eq("stage_id", stage.id)
                .order("round_order", { ascending: true });

        if (roundsError) throw roundsError;

        if (!rounds || rounds.length === 0) {
            return {
                type: "warning",
                message:
                    "The result was saved, but no knockout rounds were configured."
            };
        }

        // ----------------------------------------------------
        // 5. Get all fixtures in this competition
        // ----------------------------------------------------
        const { data: fixtures, error: fixturesError } =
            await supabase
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
                .eq("competition_id", competition.id);

        if (fixturesError) throw fixturesError;

        // ----------------------------------------------------
        // 6. Get all results
        // ----------------------------------------------------
        const fixtureIds = (fixtures || []).map(f => f.id);

        if (fixtureIds.length === 0) {
            return {
                type: "warning",
                message:
                    "The result was saved, but no fixtures were found."
            };
        }

        const { data: results, error: resultsError } =
            await supabase
                .from("results")
                .select(`
                    id,
                    fixture_id,
                    home_score,
                    away_score
                `)
                .in("fixture_id", fixtureIds);

        if (resultsError) throw resultsError;

        const resultMap = new Map(
            (results || []).map(r => [r.fixture_id, r])
        );

        const completedFixtures = (fixtures || []).filter(
            fixture =>
                fixture.status === "Completed" &&
                resultMap.has(fixture.id)
        );

        // ----------------------------------------------------
        // 7. Identify the round that has just been completed
        // ----------------------------------------------------
        let completedRound = null;
        let cumulativeMatches = 0;

        for (const round of rounds) {
            cumulativeMatches += Number(
                round.number_of_matches || 0
            );

            if (completedFixtures.length === cumulativeMatches) {
                completedRound = round;
                break;
            }
        }

        if (!completedRound) {
            return {
                type: "not_applicable"
            };
        }

        // ----------------------------------------------------
        // 8. Check if this is the FINAL
        // ----------------------------------------------------
        const lastRound = rounds[rounds.length - 1];

        if (completedRound.id === lastRound.id) {
            return {
                type: "champion",
                winnerTeamId
            };
        }

        // ----------------------------------------------------
        // 9. Find the fixtures belonging to the completed round
        // ----------------------------------------------------
        const previousRoundsMatchCount = rounds
            .filter(
                round =>
                    Number(round.round_order) <=
                    Number(completedRound.round_order)
            )
            .reduce(
                (total, round) =>
                    total + Number(round.number_of_matches || 0),
                0
            );

        const roundFixtures = completedFixtures
            .sort(
                (a, b) =>
                    new Date(b.match_date) -
                    new Date(a.match_date)
            )
            .slice(
                0,
                Number(completedRound.number_of_matches)
            );

        if (
            roundFixtures.length !==
            Number(completedRound.number_of_matches)
        ) {
            return {
                type: "warning",
                message:
                    "The result was saved, but the system could not identify all completed fixtures in the current knockout round."
            };
        }

        // ----------------------------------------------------
        // 10. Determine winners of all matches in this round
        // ----------------------------------------------------
        const winners = [];

        for (const fixture of roundFixtures) {
            const result = resultMap.get(fixture.id);

            if (!result) continue;

            if (
                Number(result.home_score) ===
                Number(result.away_score)
            ) {
                return {
                    type: "warning",
                    message:
                        "The result was saved, but progression is waiting for a winner to be determined in a tied knockout match."
                };
            }

            const winner =
                Number(result.home_score) >
                Number(result.away_score)
                    ? fixture.home_team_id
                    : fixture.away_team_id;

            winners.push(winner);
        }

        // ----------------------------------------------------
        // 11. Determine how many matches the next round needs
        // ----------------------------------------------------
        const nextRoundIndex =
            rounds.findIndex(
                round => round.id === completedRound.id
            ) + 1;

        const nextRound = rounds[nextRoundIndex];

        if (!nextRound) {
            return {
                type: "champion"
            };
        }

        const expectedWinners =
            Number(completedRound.number_of_matches) * 2;

        if (winners.length !== expectedWinners) {
            return {
                type: "warning",
                message:
                    "The result was saved, but the number of advancing teams does not match the next knockout round."
            };
        }

        // ----------------------------------------------------
        // 12. Check whether next-round fixtures already exist
        // ----------------------------------------------------
        const nextRoundMatches =
            Number(nextRound.number_of_matches);

        const existingTeamIds = new Set();

        for (const fixture of fixtures || []) {
            if (
                fixture.home_team_id &&
                fixture.away_team_id
            ) {
                existingTeamIds.add(
                    `${fixture.home_team_id}-${fixture.away_team_id}`
                );

                existingTeamIds.add(
                    `${fixture.away_team_id}-${fixture.home_team_id}`
                );
            }
        }

        // ----------------------------------------------------
        // 13. Create next-round fixtures
        // ----------------------------------------------------
        const newFixtures = [];

        // Default date = day after latest completed match
        const latestFixture = roundFixtures
            .slice()
            .sort(
                (a, b) =>
                    new Date(b.match_date) -
                    new Date(a.match_date)
            )[0];

        const defaultDate = new Date(
            latestFixture.match_date + "T00:00:00"
        );

        defaultDate.setDate(
            defaultDate.getDate() + 1
        );

        const defaultDateString =
            defaultDate.toISOString().split("T")[0];

        const defaultKickoff =
            latestFixture.kick_off || "15:00";

        const defaultVenue =
            latestFixture.venue || "Kabaru Grounds";

        const nextMatchday =
            Math.max(
                ...roundFixtures.map(
                    fixture =>
                        Number(fixture.matchday || 0)
                )
            ) + 1;

        for (
            let i = 0;
            i < winners.length;
            i += 2
        ) {
            const homeTeam = winners[i];
            const awayTeam = winners[i + 1];

            if (!homeTeam || !awayTeam) continue;

            const pairKey =
                `${homeTeam}-${awayTeam}`;

            const reversePairKey =
                `${awayTeam}-${homeTeam}`;

            if (
                existingTeamIds.has(pairKey) ||
                existingTeamIds.has(reversePairKey)
            ) {
                continue;
            }

            newFixtures.push({
                competition_id: competition.id,
                home_team_id: homeTeam,
                away_team_id: awayTeam,

                // IMPORTANT:
                // This is only the DEFAULT date.
                // The fixture can still be edited later.
                match_date: defaultDateString,

                kick_off: defaultKickoff,
                venue: defaultVenue,
                matchday: nextMatchday,
                status: "Scheduled"
            });
        }

        if (newFixtures.length !== nextRoundMatches) {
            return {
                type: "warning",
                message:
                    "The result was saved, but the system could not create the expected number of next-round fixtures."
            };
        }

        const { error: insertError } =
            await supabase
                .from("fixtures")
                .insert(newFixtures);

        if (insertError) throw insertError;

        // ----------------------------------------------------
        // 14. Update knockout round statuses
        // ----------------------------------------------------
        await supabase
            .from("competition_knockout_rounds")
            .update({
                status: "Completed"
            })
            .eq("id", completedRound.id);

        await supabase
            .from("competition_knockout_rounds")
            .update({
                status: "Active"
            })
            .eq("id", nextRound.id);

        return {
            type: "progressed",
            roundName: nextRound.name,
            fixturesCreated: newFixtures.length,
            defaultDate: defaultDateString
        };

    } catch (error) {
        console.error(
            "Automatic knockout progression error:",
            error
        );

        return {
            type: "warning",
            message:
                "The result was saved, but automatic knockout progression encountered an error. Please check Fixture Manager."
        };
    }
}
    saveResultBtn.addEventListener(
        "click",
        async function () {

            // ========================================
            // CHECK FIXTURE
            // ========================================

            if (!currentFixture) {

                showResultMessage(
                    "Please select a fixture first.",
                    "error"
                );

                return;
            }


            // ========================================
            // GET SCORES
            // ========================================

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
            // GET GOAL ROWS
            // ========================================

            const homeGoalRows =
                homeGoalsContainer
                    ? Array.from(
                        homeGoalsContainer.querySelectorAll(
                            ".goal-row"
                        )
                    )
                    : [];


            const awayGoalRows =
                awayGoalsContainer
                    ? Array.from(
                        awayGoalsContainer.querySelectorAll(
                            ".goal-row"
                        )
                    )
                    : [];


            // ========================================
            // CHECK GOAL COUNTS
            // ========================================

            if (
                homeGoalRows.length !==
                homeFinalScore
            ) {

                showResultMessage(
                    "❌ Home score is " +
                    homeFinalScore +
                    " but you entered " +
                    homeGoalRows.length +
                    " home goal(s).",
                    "error"
                );

                return;
            }


            if (
                awayGoalRows.length !==
                awayFinalScore
            ) {

                showResultMessage(
                    "❌ Away score is " +
                    awayFinalScore +
                    " but you entered " +
                    awayGoalRows.length +
                    " away goal(s).",
                    "error"
                );

                return;
            }


            // ========================================
            // READ GOAL DATA
            // ========================================

            function readGoalRows(
                rows
            ) {

                const goals = [];


                for (
                    let i = 0;
                    i < rows.length;
                    i++
                ) {

                    const row =
                        rows[i];


                    const scorerSelect =
                        row._goalPlayerSelect ||
                        row.querySelector(
                            "select"
                        );


                    const minuteInput =
                        row._goalMinuteInput ||
                        row.querySelector(
                            "input[type='number']"
                        );


                    const assistSelect =
                        row._goalAssistSelect ||
                        (
                            row.querySelectorAll(
                                "select"
                            )[1] ||
                            null
                        );


                    const penaltyCheckbox =
                        row._goalPenaltyCheckbox ||
                        row.querySelector(
                            "input[type='checkbox']"
                        );


                    const playerId =
                        scorerSelect
                            ? scorerSelect.value
                            : "";


                    const minuteValue =
                        minuteInput
                            ? minuteInput.value
                            : "";


                    const assistPlayerId =
                        assistSelect
                            ? assistSelect.value
                            : "";


                    const isPenalty =
                        penaltyCheckbox
                            ? penaltyCheckbox.checked
                            : false;


                    if (!playerId) {

                        return {
                            valid: false,
                            message:
                                "Every goal must have a scorer selected."
                        };
                    }


                    const minute =
                        Number(
                            minuteValue
                        );


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
                                "Every goal must have a valid minute between 1 and 130."
                        };
                    }


                    // A player should not assist his own goal.

                    if (
                        assistPlayerId &&
                        String(
                            assistPlayerId
                        ) === String(
                            playerId
                        )
                    ) {

                        return {
                            valid: false,
                            message:
                                "A goal scorer cannot be recorded as the assister for the same goal."
                        };
                    }


                    goals.push({

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


                return {
                    valid: true,
                    goals: goals
                };
            }


            const homeGoalData =
                readGoalRows(
                    homeGoalRows
                );


            if (!homeGoalData.valid) {

                showResultMessage(
                    "❌ " +
                    homeGoalData.message,
                    "error"
                );

                return;
            }


            const awayGoalData =
                readGoalRows(
                    awayGoalRows
                );


            if (!awayGoalData.valid) {

                showResultMessage(
                    "❌ " +
                    awayGoalData.message,
                    "error"
                );

                return;
            }


            const homeScorers =
                homeGoalData.goals;


            const awayScorers =
                awayGoalData.goals;


            const allGoals =
                [
                    ...homeScorers,
                    ...awayScorers
                ];


            // ========================================
            // GET APPEARANCES
            // ========================================

            const appearanceCheckboxes =
                appearancePlayersContainer
                    ? Array.from(
                        appearancePlayersContainer.querySelectorAll(
                            "input[type='checkbox']:checked"
                        )
                    )
                    : [];


            const appearancePlayers =
                appearanceCheckboxes
                    .map(
                        function (checkbox) {

                            return Number(
                                checkbox.value
                            );

                        }
                    )
                    .filter(
                        function (playerId) {

                            return Number.isInteger(
                                playerId
                            ) &&
                            playerId > 0;

                        }
                    );


            // ========================================
            // APPEARANCES REQUIRED
            // ========================================

            if (
                appearancePlayers.length === 0
            ) {

                showResultMessage(
                    "❌ Please select the players who appeared in the match.",
                    "error"
                );

                return;
            }


            const appearanceSet =
                new Set(
                    appearancePlayers.map(
                        function (playerId) {
                            return String(
                                playerId
                            );
                        }
                    )
                );


            // ========================================
            // SCORERS MUST HAVE APPEARED
            // ========================================

            for (
                let i = 0;
                i < allGoals.length;
                i++
            ) {

                if (
                    !appearanceSet.has(
                        String(
                            allGoals[i].player_id
                        )
                    )
                ) {

                    showResultMessage(
                        "❌ Every goal scorer must also be selected under Player Appearances.",
                        "error"
                    );

                    return;
                }
            }


            // ========================================
            // ASSIST PROVIDERS MUST HAVE APPEARED
            // ========================================

            for (
                let i = 0;
                i < allGoals.length;
                i++
            ) {

                const assistId =
                    allGoals[i]
                        .assist_player_id;


                if (
                    assistId &&
                    !appearanceSet.has(
                        String(
                            assistId
                        )
                    )
                ) {

                    showResultMessage(
                        "❌ Every assist provider must also be selected under Player Appearances.",
                        "error"
                    );

                    return;
                }
            }


            // ========================================
            // GET YELLOW CARDS
            // ========================================

            const yellowCards =
                getCardData(
                    yellowCardsContainer,
                    "yellow"
                );


            // ========================================
            // GET RED CARDS
            // ========================================

            const redCards =
                getCardData(
                    redCardsContainer,
                    "red"
                );


            const allCards =
                [
                    ...yellowCards,
                    ...redCards
                ];


            // ========================================
            // VALIDATE CARD PLAYERS
            // ========================================

            for (
                let i = 0;
                i < allCards.length;
                i++
            ) {

                const card =
                    allCards[i];


                if (
                    !appearanceSet.has(
                        String(
                            card.player_id
                        )
                    )
                ) {

                    showResultMessage(
                        "❌ Every player receiving a card must also be selected under Player Appearances.",
                        "error"
                    );

                    return;
                }


                if (
                    !card.minute ||
                    card.minute < 1 ||
                    card.minute > 130
                ) {

                    showResultMessage(
                        "❌ Every yellow/red card must have a valid minute between 1 and 130.",
                        "error"
                    );

                    return;
                }
            }


            // ========================================
            // CALCULATE GOALS
            // ========================================

            const goalCounts =
                {};


            allGoals.forEach(
                function (goal) {

                    const key =
                        String(
                            goal.player_id
                        );


                    goalCounts[key] =
                        (
                            goalCounts[key] ||
                            0
                        ) + 1;

                }
            );


            // ========================================
            // CALCULATE ASSISTS
            // ========================================

            const assistCounts =
                {};


            allGoals.forEach(
                function (goal) {

                    if (
                        goal.assist_player_id
                    ) {

                        const key =
                            String(
                                goal.assist_player_id
                            );


                        assistCounts[key] =
                            (
                                assistCounts[key] ||
                                0
                            ) + 1;
                    }

                }
            );


            // ========================================
            // CALCULATE YELLOW CARDS
            // ========================================

            const yellowCardCounts =
                {};


            yellowCards.forEach(
                function (card) {

                    const key =
                        String(
                            card.player_id
                        );


                    yellowCardCounts[key] =
                        (
                            yellowCardCounts[key] ||
                            0
                        ) + 1;

                }
            );


            // ========================================
            // CALCULATE RED CARDS
            // ========================================

            const redCardCounts =
                {};


            redCards.forEach(
                function (card) {

                    const key =
                        String(
                            card.player_id
                        );


                    redCardCounts[key] =
                        (
                            redCardCounts[key] ||
                            0
                        ) + 1;

                }
            );


            // ========================================
            // MATCH REPORT
            // ========================================

            const report =
                matchReport
                    ? matchReport.value.trim()
                    : "";


            // ========================================
            // DISABLE BUTTON
            // ========================================

            saveResultBtn.disabled =
                true;


            saveResultBtn.textContent =
                "Saving Result...";


            try {

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
                        .select("id")
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
                                report ||
                                null

                        })
                        .select("id")
                        .single();


                if (resultError) {
                    throw resultError;
                }

// ========================================
// INSERT MATCH CARD EVENTS
// ========================================

if (
    allCards.length > 0
) {

    const cardRows =
        allCards.map(
            function (card) {

                return {

                    result_id:
                        result.id,

                    player_id:
                        card.player_id,

                    card_type:
                        card.card_type,

                    minute:
                        card.minute

                };

            }
        );


    const {
        error: cardError
    } =
        await supabaseClient
            .from("match_cards")
            .insert(
                cardRows
            );


    if (cardError) {

        await supabaseClient
            .from("results")
            .delete()
            .eq(
                "id",
                result.id
            );

        throw new Error(
            "Failed to save match card events: " +
            cardError.message
        );
    }
}


// ========================================
// INSERT GOAL SCORERS
// ========================================
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
                // CREATE PLAYER MATCH STATS
                // ========================================

                const playerStats =
                    appearancePlayers.map(
                        function (playerId) {

                            const key =
                                String(
                                    playerId
                                );


                            return {

                                result_id:
                                    result.id,

                                player_id:
                                    playerId,

                                appearances:
                                    1,

                                goals:
                                    goalCounts[key] ||
                                    0,

                                assists:
                                    assistCounts[key] ||
                                    0,

                                yellow_cards:
                                    yellowCardCounts[key] ||
                                    0,

                                red_cards:
                                    redCardCounts[key] ||
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
                            .from("results")
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


                // ========================================
                // CLEAR FORM
                // ========================================

                if (homeGoalsContainer) {

                    homeGoalsContainer.innerHTML =
                        "";
                }


                if (awayGoalsContainer) {

                    awayGoalsContainer.innerHTML =
                        "";
                }


                if (appearancePlayersContainer) {

                    appearancePlayersContainer.innerHTML =
                        "";
                }


                if (yellowCardsContainer) {

                    yellowCardsContainer.innerHTML =
                        "";
                }


                if (redCardsContainer) {

                    redCardsContainer.innerHTML =
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


                // ========================================
                // REFRESH DASHBOARD
                // ========================================

                await loadFixtures();

                await loadResultFixtures();


                if (resultFixtureSelect) {

                    resultFixtureSelect.value =
                        "";
                }


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
    "id, full_name, jersey_number, position, registration_status, rejection_reason"
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
                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

                    ${
                        players.map(
                            function (player) {

                                const status =
                                    String(
                                        player.registration_status ||
                                        "Pending"
                                    );

                                const isPending =
                                    status === "Pending";

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
                                                status
                                            )}

                                            ${
                                                player.rejection_reason
                                                    ? `
                                                        <br>
                                                        <small
                                                            style="
                                                                color:#b02a37;
                                                                display:block;
                                                                margin-top:4px;
                                                            "
                                                        >
                                                            Reason:
                                                            ${escapeHtml(
                                                                player.rejection_reason
                                                            )}
                                                        </small>
                                                    `
                                                    : ""
                                            }

                                        </td>

                                        <td>

                                            ${
                                                isPending
                                                    ? `
                                                        <button
                                                            type="button"
                                                            class="admin-btn approve-player-btn"
                                                            data-player-id="${player.id}"
                                                            style="
                                                                margin:2px;
                                                                padding:6px 10px;
                                                            "
                                                        >
                                                            ✅ Approve
                                                        </button>

                                                        <button
                                                            type="button"
                                                            class="admin-btn reject-player-btn"
                                                            data-player-id="${player.id}"
                                                            style="
                                                                margin:2px;
                                                                padding:6px 10px;
                                                            "
                                                        >
                                                            ❌ Reject
                                                        </button>
                                                    `
                                                    : `
                                                        <span
                                                            style="
                                                                color:#777;
                                                                font-size:13px;
                                                            "
                                                        >
                                                            No action
                                                        </span>
                                                    `
                                            }

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
                const approvePlayerButtons =
    card.querySelectorAll(
        ".approve-player-btn"
    );

approvePlayerButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                approvePlayer(
                    this.dataset.playerId
                );

            }
        );

    }
);


const rejectPlayerButtons =
    card.querySelectorAll(
        ".reject-player-btn"
    );

rejectPlayerButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                rejectPlayer(
                    this.dataset.playerId
                );

            }
        );

    }
);
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
// APPROVE INDIVIDUAL PLAYER
// ========================================

async function approvePlayer(playerId) {

    if (
        !confirm(
            "Approve this player?"
        )
    ) {
        return;
    }

    try {

        const {
            error
        } =
            await supabaseClient
                .from("players")
                .update({
                    registration_status:
                        "Approved",
                    rejection_reason:
                        null
                })
                .eq(
                    "id",
                    playerId
                );

        if (error) {
            throw error;
        }

        alert(
            "✅ Player approved successfully!"
        );

        await loadPendingTeams();

        await loadApprovedTeams();

        await loadResultFixtures();

    } catch (error) {

        console.error(
            "Approve player error:",
            error
        );

        alert(
            "Unable to approve player: " +
            (
                error.message ||
                "Unknown error"
            )
        );
    }
}


// ========================================
// REJECT INDIVIDUAL PLAYER
// ========================================

async function rejectPlayer(playerId) {

    const reason =
        prompt(
            "Enter the reason for rejecting this player:"
        );

    if (reason === null) {
        return;
    }

    const cleanReason =
        reason.trim();

    if (!cleanReason) {

        alert(
            "A rejection reason is required."
        );

        return;
    }

    if (
        !confirm(
            "Reject this player?"
        )
    ) {
        return;
    }

    try {

        const {
            error
        } =
            await supabaseClient
                .from("players")
                .update({
                    registration_status:
                        "Rejected",
                    rejection_reason:
                        cleanReason
                })
                .eq(
                    "id",
                    playerId
                );

        if (error) {
            throw error;
        }

        alert(
            "Player rejected successfully."
        );

        await loadPendingTeams();

    } catch (error) {

        console.error(
            "Reject player error:",
            error
        );

        alert(
            "Unable to reject player: " +
            (
                error.message ||
                "Unknown error"
            )
        );
    }
}
    // ========================================
    // APPROVE TEAM
    // ========================================

    async function approveTeam(id) {

        if (
            !confirm(
                "Approve this team? Players will be reviewed separately."
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
                            request.request_type === "Free Agent Signing"
                                ? "Free Agent"
                                : movementTeamName(
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
// COMPETITION SUPPORT MANAGER
// ========================================

let currentSupporterId = null;
let currentSupporterPhotoUrl = null;
let currentSupporterLogoUrl = null;


// ========================================
// SUPPORTER FORM ELEMENTS
// ========================================

const supporterForm =
    document.getElementById(
        "supporterForm"
    );

const supporterName =
    document.getElementById(
        "supporterName"
    );

const supporterType =
    document.getElementById(
        "supporterType"
    );

const supporterPhone =
    document.getElementById(
        "supporterPhone"
    );

const supporterEmail =
    document.getElementById(
        "supporterEmail"
    );

const supporterWebsite =
    document.getElementById(
        "supporterWebsite"
    );

const supporterFacebook =
    document.getElementById(
        "supporterFacebook"
    );

const supporterInstagram =
    document.getElementById(
        "supporterInstagram"
    );

const supporterX =
    document.getElementById(
        "supporterX"
    );

const supporterYoutube =
    document.getElementById(
        "supporterYoutube"
    );

const supporterPhoto =
    document.getElementById(
        "supporterPhoto"
    );

const supporterLogo =
    document.getElementById(
        "supporterLogo"
    );

const supporterPhotoPreview =
    document.getElementById(
        "supporterPhotoPreview"
    );

const supporterLogoPreview =
    document.getElementById(
        "supporterLogoPreview"
    );

const supporterActive =
    document.getElementById(
        "supporterActive"
    );

const supporterDescription =
    document.getElementById(
        "supporterDescription"
    );

const supporterFormMessage =
    document.getElementById(
        "supporterFormMessage"
    );

const saveSupporterButton =
    document.getElementById(
        "saveSupporterButton"
    );

const cancelSupporterEditButton =
    document.getElementById(
        "cancelSupporterEditButton"
    );


// ========================================
// COMPETITION SUPPORT FORM ELEMENTS
// ========================================

const competitionSupportForm =
    document.getElementById(
        "competitionSupportForm"
    );

const competitionSupporterSelect =
    document.getElementById(
        "competitionSupporterSelect"
    );

const competitionSupportCompetitionSelect =
    document.getElementById(
        "competitionSupportCompetitionSelect"
    );

const competitionSupportType =
    document.getElementById(
        "competitionSupportType"
    );

const competitionSupportTitle =
    document.getElementById(
        "competitionSupportTitle"
    );

const competitionSupportAmount =
    document.getElementById(
        "competitionSupportAmount"
    );

const competitionSupportAmountPublic =
    document.getElementById(
        "competitionSupportAmountPublic"
    );

const competitionSupportFeatured =
    document.getElementById(
        "competitionSupportFeatured"
    );

const competitionSupportDisplayOrder =
    document.getElementById(
        "competitionSupportDisplayOrder"
    );

const competitionSupportStatus =
    document.getElementById(
        "competitionSupportStatus"
    );

const competitionSupportDescription =
    document.getElementById(
        "competitionSupportDescription"
    );

const competitionSupportFormMessage =
    document.getElementById(
        "competitionSupportFormMessage"
    );

const saveCompetitionSupportButton =
    document.getElementById(
        "saveCompetitionSupportButton"
    );

const supportersList =
    document.getElementById(
        "supportersList"
    );

const competitionSupportList =
    document.getElementById(
        "competitionSupportList"
    );


// ========================================
// SUPPORTER MESSAGE HELPER
// ========================================

function showSupporterMessage(
    message,
    type = "info"
) {

    if (!supporterFormMessage) {
        return;
    }

    supporterFormMessage.style.display =
        "block";

    supporterFormMessage.textContent =
        message;

    if (type === "success") {

        supporterFormMessage.style.background =
            "#d4edda";

        supporterFormMessage.style.color =
            "#155724";

    } else if (type === "error") {

        supporterFormMessage.style.background =
            "#fdecec";

        supporterFormMessage.style.color =
            "#b00020";

    } else {

        supporterFormMessage.style.background =
            "#f5f5f5";

        supporterFormMessage.style.color =
            "#333";
    }
}


function showCompetitionSupportMessage(
    message,
    type = "info"
) {

    if (!competitionSupportFormMessage) {
        return;
    }

    competitionSupportFormMessage.style.display =
        "block";

    competitionSupportFormMessage.textContent =
        message;

    if (type === "success") {

        competitionSupportFormMessage.style.background =
            "#d4edda";

        competitionSupportFormMessage.style.color =
            "#155724";

    } else if (type === "error") {

        competitionSupportFormMessage.style.background =
            "#fdecec";

        competitionSupportFormMessage.style.color =
            "#b00020";

    } else {

        competitionSupportFormMessage.style.background =
            "#f5f5f5";

        competitionSupportFormMessage.style.color =
            "#333";
    }
}


// ========================================
// FILE NAME HELPER
// ========================================

function supporterSafeFileName(
    file
) {

    const originalName =
        file && file.name
            ? file.name
            : "image";

    const extension =
        originalName.includes(".")
            ? originalName
                .split(".")
                .pop()
                .toLowerCase()
            : "jpg";

    return (
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 10) +
        "." +
        extension
    );
}


// ========================================
// UPLOAD SUPPORTER IMAGE
// ========================================

async function uploadSupporterImage(
    file,
    bucketName,
    folderName
) {

    if (!file) {
        return null;
    }

    if (
        !file.type ||
        !file.type.startsWith("image/")
    ) {

        throw new Error(
            "Please select a valid image file."
        );
    }

    if (
        file.size >
        5 * 1024 * 1024
    ) {

        throw new Error(
            "Image size must not exceed 5 MB."
        );
    }

    const fileName =
        supporterSafeFileName(file);

    const filePath =
        folderName +
        "/" +
        fileName;

    const {
        error
    } =
        await supabaseClient
            .storage
            .from(bucketName)
            .upload(
                filePath,
                file,
                {
                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        file.type
                }
            );

    if (error) {
        throw error;
    }

    const {
        data
    } =
        supabaseClient
            .storage
            .from(bucketName)
            .getPublicUrl(
                filePath
            );

    return (
        data &&
        data.publicUrl
            ? data.publicUrl
            : null
    );
}


// ========================================
// IMAGE PREVIEW HELPER
// ========================================

function showSupporterImagePreview(
    file,
    previewElement
) {

    if (
        !file ||
        !previewElement
    ) {
        return;
    }

    if (
        !file.type ||
        !file.type.startsWith("image/")
    ) {
        return;
    }

    const reader =
        new FileReader();

    reader.onload =
        function (event) {

            previewElement.innerHTML = `
                <img
                    src="${event.target.result}"
                    alt="Image Preview"
                    style="
                        width:120px;
                        height:120px;
                        object-fit:cover;
                        border-radius:10px;
                        border:1px solid #ddd;
                        display:block;
                    "
                >
            `;

            previewElement.style.display =
                "block";
        };

    reader.readAsDataURL(file);
}


// ========================================
// PHOTO PREVIEW
// ========================================

if (supporterPhoto) {

    supporterPhoto.addEventListener(
        "change",
        function () {

            const file =
                this.files &&
                this.files[0];

            showSupporterImagePreview(
                file,
                supporterPhotoPreview
            );
        }
    );
}


// ========================================
// LOGO PREVIEW
// ========================================

if (supporterLogo) {

    supporterLogo.addEventListener(
        "change",
        function () {

            const file =
                this.files &&
                this.files[0];

            showSupporterImagePreview(
                file,
                supporterLogoPreview
            );
        }
    );
}


// ========================================
// LOAD SUPPORTER COMPETITIONS
// ========================================

async function loadSupporterCompetitions() {

    if (
        !competitionSupportCompetitionSelect
    ) {
        return;
    }

    competitionSupportCompetitionSelect.innerHTML =
        `
            <option value="">
                Loading competitions...
            </option>
        `;

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("competitions")
                .select(
                    `
                        id,
                        name,
                        competition_type,
                        season,
                        status
                    `
                )
                .order(
                    "created_at",
                    {
                        ascending:false
                    }
                );

        if (error) {
            throw error;
        }

        competitionSupportCompetitionSelect.innerHTML =
            `
                <option value="">
                    Select competition
                </option>
            `;

        if (
            !data ||
            data.length === 0
        ) {

            competitionSupportCompetitionSelect.innerHTML =
                `
                    <option value="">
                        No competitions available
                    </option>
                `;

            return;
        }

        data.forEach(
            function (competition) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    competition.id;

                option.textContent =
                    (
                        competition.name ||
                        "Competition"
                    ) +
                    (
                        competition.season
                            ? " — " +
                              competition.season
                            : ""
                    );

                competitionSupportCompetitionSelect
                    .appendChild(option);
            }
        );

    } catch (error) {

        console.error(
            "LOAD SUPPORTER COMPETITIONS ERROR:",
            error
        );

        competitionSupportCompetitionSelect.innerHTML =
            `
                <option value="">
                    Unable to load competitions
                </option>
            `;
    }
}


// ========================================
// LOAD SUPPORTERS INTO SELECT
// ========================================

async function loadSupporterSelect() {

    if (
        !competitionSupporterSelect
    ) {
        return;
    }

    competitionSupporterSelect.innerHTML =
        `
            <option value="">
                Loading supporters...
            </option>
        `;

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("supporters")
                .select(
                    `
                        id,
                        name,
                        supporter_type,
                        is_active
                    `
                )
                .order(
                    "name",
                    {
                        ascending:true
                    }
                );

        if (error) {
            throw error;
        }

        competitionSupporterSelect.innerHTML =
            `
                <option value="">
                    Select supporter
                </option>
            `;

        if (
            !data ||
            data.length === 0
        ) {

            competitionSupporterSelect.innerHTML =
                `
                    <option value="">
                        No supporters available
                    </option>
                `;

            return;
        }

        data.forEach(
            function (supporter) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    supporter.id;

                option.textContent =
                    supporter.name +
                    " — " +
                    supporter.supporter_type +
                    (
                        supporter.is_active
                            ? ""
                            : " (Inactive)"
                    );

                competitionSupporterSelect
                    .appendChild(option);
            }
        );

    } catch (error) {

        console.error(
            "LOAD SUPPORTER SELECT ERROR:",
            error
        );

        competitionSupporterSelect.innerHTML =
            `
                <option value="">
                    Unable to load supporters
                </option>
            `;
    }
}


// ========================================
// RENDER EXISTING SUPPORTERS
// ========================================

async function loadSupporters() {

    if (!supportersList) {
        return;
    }

    supportersList.innerHTML =
        `
            <div class="empty-message">
                Loading supporters...
            </div>
        `;

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("supporters")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:false
                    }
                );

        if (error) {
            throw error;
        }

        if (
            !data ||
            data.length === 0
        ) {

            supportersList.innerHTML =
                `
                    <div class="empty-message">
                        No supporters have been added yet.
                    </div>
                `;

            return;
        }

        let html = "";

        data.forEach(
            function (supporter) {

                const imageUrl =
                    supporter.photo_url ||
                    supporter.logo_url;

                const image =
                    imageUrl
                        ? `
                            <img
                                src="${escapeHtml(
                                    imageUrl
                                )}"
                                alt="${escapeHtml(
                                    supporter.name
                                )}"
                                style="
                                    width:90px;
                                    height:90px;
                                    object-fit:cover;
                                    border-radius:10px;
                                    border:1px solid #ddd;
                                "
                            >
                          `
                        : `
                            <div
                                style="
                                    width:90px;
                                    height:90px;
                                    border-radius:10px;
                                    background:#eee;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    font-size:32px;
                                "
                            >
                                ${
                                    supporter.supporter_type ===
                                    "Individual"
                                        ? "👤"
                                        : "🏢"
                                }
                            </div>
                          `;

                html += `
                    <div
                        class="admin-card"
                        style="
                            margin-top:15px;
                            border-left:5px solid #16803c;
                        "
                    >

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
                                    flex:1;
                                    min-width:260px;
                                "
                            >

                                ${image}

                                <div>

                                    <h3>
                                        🤝
                                        ${escapeHtml(
                                            supporter.name ||
                                            "Unnamed Supporter"
                                        )}
                                    </h3>

                                    <p>
                                        <strong>
                                            Type:
                                        </strong>
                                        ${escapeHtml(
                                            supporter.supporter_type ||
                                            "Other"
                                        )}
                                    </p>

                                    <p>
                                        <strong>
                                            Status:
                                        </strong>
                                        ${
                                            supporter.is_active
                                                ? "🟢 Active"
                                                : "⚪ Inactive"
                                        }
                                    </p>

                                    ${
                                        supporter.phone
                                            ? `
                                                <p>
                                                    <strong>
                                                        Phone:
                                                    </strong>
                                                    ${escapeHtml(
                                                        supporter.phone
                                                    )}
                                                </p>
                                              `
                                            : ""
                                    }

                                    ${
                                        supporter.email
                                            ? `
                                                <p>
                                                    <strong>
                                                        Email:
                                                    </strong>
                                                    ${escapeHtml(
                                                        supporter.email
                                                    )}
                                                </p>
                                              `
                                            : ""
                                    }

                                </div>

                            </div>


                            <div
                                style="
                                    display:flex;
                                    gap:8px;
                                    flex-wrap:wrap;
                                    align-items:flex-start;
                                "
                            >

                                <button
                                    type="button"
                                    class="admin-btn"
                                    onclick="editSupporter(${Number(
                                        supporter.id
                                    )})"
                                >
                                    ✏️ Edit
                                </button>

                                <button
                                    type="button"
                                    class="admin-btn"
                                    style="
                                        background:${
                                            supporter.is_active
                                                ? "#777"
                                                : "#16803c"
                                        };
                                        color:#fff;
                                    "
                                    onclick="toggleSupporterStatus(
                                        ${Number(
                                            supporter.id
                                        )},
                                        ${
                                            supporter.is_active
                                                ? "false"
                                                : "true"
                                        }
                                    )"
                                >
                                    ${
                                        supporter.is_active
                                            ? "⚪ Deactivate"
                                            : "🟢 Activate"
                                    }
                                </button>

                                <button
                                    type="button"
                                    class="admin-btn"
                                    style="
                                        background:#b00020;
                                        color:#fff;
                                    "
                                    onclick="deleteSupporter(${Number(
                                        supporter.id
                                    )})"
                                >
                                    🗑️ Delete
                                </button>

                            </div>

                        </div>

                        ${
                            supporter.description
                                ? `
                                    <p
                                        style="
                                            margin-top:14px;
                                        "
                                    >
                                        ${escapeHtml(
                                            supporter.description
                                        )}
                                    </p>
                                  `
                                : ""
                        }

                        ${
                            supporter.website_url ||
                            supporter.facebook_url ||
                            supporter.instagram_url ||
                            supporter.x_url ||
                            supporter.youtube_url
                                ? `
                                    <div
                                        style="
                                            margin-top:12px;
                                            display:flex;
                                            gap:8px;
                                            flex-wrap:wrap;
                                        "
                                    >

                                        ${
                                            supporter.website_url
                                                ? `
                                                    <a
                                                        href="${escapeHtml(
                                                            supporter.website_url
                                                        )}"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        class="admin-btn"
                                                        style="
                                                            text-decoration:none;
                                                        "
                                                    >
                                                        🌐 Website
                                                    </a>
                                                  `
                                                : ""
                                        }

                                        ${
                                            supporter.facebook_url
                                                ? `
                                                    <a
                                                        href="${escapeHtml(
                                                            supporter.facebook_url
                                                        )}"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        class="admin-btn"
                                                        style="
                                                            text-decoration:none;
                                                        "
                                                    >
                                                        📘 Facebook
                                                    </a>
                                                  `
                                                : ""
                                        }

                                        ${
                                            supporter.instagram_url
                                                ? `
                                                    <a
                                                        href="${escapeHtml(
                                                            supporter.instagram_url
                                                        )}"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        class="admin-btn"
                                                        style="
                                                            text-decoration:none;
                                                        "
                                                    >
                                                        📸 Instagram
                                                    </a>
                                                  `
                                                : ""
                                        }

                                        ${
                                            supporter.x_url
                                                ? `
                                                    <a
                                                        href="${escapeHtml(
                                                            supporter.x_url
                                                        )}"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        class="admin-btn"
                                                        style="
                                                            text-decoration:none;
                                                        "
                                                    >
                                                        𝕏 X
                                                    </a>
                                                  `
                                                : ""
                                        }

                                        ${
                                            supporter.youtube_url
                                                ? `
                                                    <a
                                                        href="${escapeHtml(
                                                            supporter.youtube_url
                                                        )}"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        class="admin-btn"
                                                        style="
                                                            text-decoration:none;
                                                        "
                                                    >
                                                        ▶️ YouTube
                                                    </a>
                                                  `
                                                : ""
                                        }

                                    </div>
                                  `
                                : ""
                        }

                    </div>
                `;
            }
        );

        supportersList.innerHTML =
            html;

    } catch (error) {

        console.error(
            "LOAD SUPPORTERS ERROR:",
            error
        );

        supportersList.innerHTML =
            `
                <div class="empty-message">
                    ❌ Unable to load supporters:
                    ${escapeHtml(
                        error.message ||
                        "Unknown error"
                    )}
                </div>
            `;
    }
}


// ========================================
// ADD / UPDATE SUPPORTER
// ========================================

if (supporterForm) {

    supporterForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                supporterName
                    ? supporterName.value.trim()
                    : "";

            const type =
                supporterType
                    ? supporterType.value
                    : "";

            if (!name) {

                showSupporterMessage(
                    "❌ Please enter the supporter name.",
                    "error"
                );

                return;
            }

            if (!type) {

                showSupporterMessage(
                    "❌ Please select the supporter type.",
                    "error"
                );

                return;
            }

            if (saveSupporterButton) {
                saveSupporterButton.disabled =
                    true;
            }

            showSupporterMessage(
                currentSupporterId
                    ? "Saving supporter changes..."
                    : "Adding supporter..."
            );

            try {

                let photoUrl =
                    currentSupporterPhotoUrl;

                let logoUrl =
                    currentSupporterLogoUrl;


                // ----------------------------------------
                // PHOTO UPLOAD
                // ----------------------------------------

                if (
                    supporterPhoto &&
                    supporterPhoto.files &&
                    supporterPhoto.files[0]
                ) {

                    photoUrl =
                        await uploadSupporterImage(
                            supporterPhoto.files[0],
                            "supporter-photos",
                            "supporters"
                        );
                }


                // ----------------------------------------
                // LOGO UPLOAD
                // ----------------------------------------

                if (
                    supporterLogo &&
                    supporterLogo.files &&
                    supporterLogo.files[0]
                ) {

                    logoUrl =
                        await uploadSupporterImage(
                            supporterLogo.files[0],
                            "supporter-logos",
                            "supporters"
                        );
                }


                const supporterData = {

                    name:
                        name,

                    supporter_type:
                        type,

                    phone:
                        supporterPhone
                            ? supporterPhone.value.trim() ||
                              null
                            : null,

                    email:
                        supporterEmail
                            ? supporterEmail.value.trim() ||
                              null
                            : null,

                    website_url:
                        supporterWebsite
                            ? supporterWebsite.value.trim() ||
                              null
                            : null,

                    facebook_url:
                        supporterFacebook
                            ? supporterFacebook.value.trim() ||
                              null
                            : null,

                    instagram_url:
                        supporterInstagram
                            ? supporterInstagram.value.trim() ||
                              null
                            : null,

                    x_url:
                        supporterX
                            ? supporterX.value.trim() ||
                              null
                            : null,

                    youtube_url:
                        supporterYoutube
                            ? supporterYoutube.value.trim() ||
                              null
                            : null,

                    photo_url:
                        photoUrl ||
                        null,

                    logo_url:
                        logoUrl ||
                        null,

                    is_active:
                        supporterActive
                            ? supporterActive.value ===
                              "true"
                            : true,

                    description:
                        supporterDescription
                            ? supporterDescription.value.trim() ||
                              null
                            : null,

                    updated_at:
                        new Date().toISOString()
                };


                let result;


                if (currentSupporterId) {

                    result =
                        await supabaseClient
                            .from("supporters")
                            .update(
                                supporterData
                            )
                            .eq(
                                "id",
                                currentSupporterId
                            );

                } else {

                    result =
                        await supabaseClient
                            .from("supporters")
                            .insert(
                                supporterData
                            );
                }


                if (result.error) {
                    throw result.error;
                }


                showSupporterMessage(
                    currentSupporterId
                        ? "✅ Supporter updated successfully!"
                        : "✅ Supporter added successfully!",
                    "success"
                );


                resetSupporterForm();


                await loadSupporters();

                await loadSupporterSelect();


            } catch (error) {

                console.error(
                    "SAVE SUPPORTER ERROR:",
                    error
                );

                showSupporterMessage(
                    "❌ Unable to save supporter: " +
                    (
                        error.message ||
                        "Unknown error"
                    ),
                    "error"
                );

            } finally {

                if (saveSupporterButton) {

                    saveSupporterButton.disabled =
                        false;
                }
            }
        }
    );
}


// ========================================
// RESET SUPPORTER FORM
// ========================================

function resetSupporterForm() {

    currentSupporterId =
        null;

    currentSupporterPhotoUrl =
        null;

    currentSupporterLogoUrl =
        null;


    if (supporterForm) {
        supporterForm.reset();
    }


    if (supporterActive) {

        supporterActive.value =
            "true";
    }


    if (supporterPhotoPreview) {

        supporterPhotoPreview.innerHTML =
            "";

        supporterPhotoPreview.style.display =
            "none";
    }


    if (supporterLogoPreview) {

        supporterLogoPreview.innerHTML =
            "";

        supporterLogoPreview.style.display =
            "none";
    }


    if (saveSupporterButton) {

        saveSupporterButton.textContent =
            "🤝 ADD SUPPORTER";
    }


    if (cancelSupporterEditButton) {

        cancelSupporterEditButton.style.display =
            "none";
    }
}


// ========================================
// EDIT SUPPORTER
// ========================================

window.editSupporter =
    async function (supporterId) {

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("supporters")
                    .select("*")
                    .eq(
                        "id",
                        supporterId
                    )
                    .single();

            if (error) {
                throw error;
            }

            if (!data) {
                throw new Error(
                    "Supporter could not be found."
                );
            }


            currentSupporterId =
                data.id;

            currentSupporterPhotoUrl =
                data.photo_url ||
                null;

            currentSupporterLogoUrl =
                data.logo_url ||
                null;


            if (supporterName)
                supporterName.value =
                    data.name || "";

            if (supporterType)
                supporterType.value =
                    data.supporter_type || "";

            if (supporterPhone)
                supporterPhone.value =
                    data.phone || "";

            if (supporterEmail)
                supporterEmail.value =
                    data.email || "";

            if (supporterWebsite)
                supporterWebsite.value =
                    data.website_url || "";

            if (supporterFacebook)
                supporterFacebook.value =
                    data.facebook_url || "";

            if (supporterInstagram)
                supporterInstagram.value =
                    data.instagram_url || "";

            if (supporterX)
                supporterX.value =
                    data.x_url || "";

            if (supporterYoutube)
                supporterYoutube.value =
                    data.youtube_url || "";

            if (supporterActive)
                supporterActive.value =
                    data.is_active
                        ? "true"
                        : "false";

            if (supporterDescription)
                supporterDescription.value =
                    data.description || "";


            if (
                supporterPhotoPreview
            ) {

                if (data.photo_url) {

                    supporterPhotoPreview.innerHTML =
                        `
                            <img
                                src="${escapeHtml(
                                    data.photo_url
                                )}"
                                alt="Current supporter photo"
                                style="
                                    width:120px;
                                    height:120px;
                                    object-fit:cover;
                                    border-radius:10px;
                                    border:1px solid #ddd;
                                "
                            >
                            <div
                                style="
                                    margin-top:6px;
                                    font-size:13px;
                                    color:#666;
                                "
                            >
                                Current photo
                            </div>
                        `;

                    supporterPhotoPreview.style.display =
                        "block";

                } else {

                    supporterPhotoPreview.innerHTML =
                        "";

                    supporterPhotoPreview.style.display =
                        "none";
                }
            }


            if (
                supporterLogoPreview
            ) {

                if (data.logo_url) {

                    supporterLogoPreview.innerHTML =
                        `
                            <img
                                src="${escapeHtml(
                                    data.logo_url
                                )}"
                                alt="Current supporter logo"
                                style="
                                    width:120px;
                                    height:120px;
                                    object-fit:contain;
                                    border-radius:10px;
                                    border:1px solid #ddd;
                                    background:#fff;
                                "
                            >
                            <div
                                style="
                                    margin-top:6px;
                                    font-size:13px;
                                    color:#666;
                                "
                            >
                                Current logo
                            </div>
                        `;

                    supporterLogoPreview.style.display =
                        "block";

                } else {

                    supporterLogoPreview.innerHTML =
                        "";

                    supporterLogoPreview.style.display =
                        "none";
                }
            }


            if (saveSupporterButton) {

                saveSupporterButton.textContent =
                    "💾 UPDATE SUPPORTER";
            }


            if (cancelSupporterEditButton) {

                cancelSupporterEditButton.style.display =
                    "inline-block";
            }


            showSupporterMessage(
                "✏️ Editing " +
                data.name +
                ". Make your changes and save."
            );


            const supportersSection =
                document.getElementById(
                    "supporters"
                );

            if (supportersSection) {

                supportersSection.scrollIntoView({
                    behavior:"smooth",
                    block:"start"
                });
            }


        } catch (error) {

            console.error(
                "EDIT SUPPORTER ERROR:",
                error
            );

            alert(
                "Unable to load supporter: " +
                (
                    error.message ||
                    "Unknown error"
                )
            );
        }
    };


// ========================================
// CANCEL SUPPORTER EDIT
// ========================================

if (
    cancelSupporterEditButton
) {

    cancelSupporterEditButton.addEventListener(
        "click",
        function () {

            resetSupporterForm();

            if (supporterFormMessage) {

                supporterFormMessage.style.display =
                    "none";

                supporterFormMessage.textContent =
                    "";
            }
        }
    );
}


// ========================================
// TOGGLE SUPPORTER STATUS
// ========================================

window.toggleSupporterStatus =
    async function (
        supporterId,
        newStatus
    ) {

        try {

            const {
                error
            } =
                await supabaseClient
                    .from("supporters")
                    .update({
                        is_active:
                            newStatus ===
                            true ||
                            newStatus ===
                            "true",

                        updated_at:
                            new Date().toISOString()
                    })
                    .eq(
                        "id",
                        supporterId
                    );

            if (error) {
                throw error;
            }

            await loadSupporters();

            await loadSupporterSelect();

        } catch (error) {

            console.error(
                "TOGGLE SUPPORTER STATUS ERROR:",
                error
            );

            alert(
                "Unable to change supporter status: " +
                (
                    error.message ||
                    "Unknown error"
                )
            );
        }
    };


// ========================================
// DELETE SUPPORTER
// ========================================

window.deleteSupporter =
    async function (supporterId) {

        const confirmed =
            confirm(
                "Are you sure you want to delete this supporter?\n\n" +
                "Any competition support records linked to this supporter will also be removed."
            );

        if (!confirmed) {
            return;
        }

        try {

            const {
                error
            } =
                await supabaseClient
                    .from("supporters")
                    .delete()
                    .eq(
                        "id",
                        supporterId
                    );

            if (error) {
                throw error;
            }

            await loadSupporters();

            await loadSupporterSelect();

            await loadCompetitionSupportRecords();

        } catch (error) {

            console.error(
                "DELETE SUPPORTER ERROR:",
                error
            );

            alert(
                "Unable to delete supporter: " +
                (
                    error.message ||
                    "Unknown error"
                )
            );
        }
    };


// ========================================
// ADD COMPETITION SUPPORT RECORD
// ========================================

if (
    competitionSupportForm
) {

    competitionSupportForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const supporterId =
                competitionSupporterSelect
                    ? competitionSupporterSelect.value
                    : "";

            const competitionId =
                competitionSupportCompetitionSelect
                    ? competitionSupportCompetitionSelect.value
                    : "";

            if (!supporterId) {

                showCompetitionSupportMessage(
                    "❌ Please select a supporter.",
                    "error"
                );

                return;
            }

            if (!competitionId) {

                showCompetitionSupportMessage(
                    "❌ Please select a competition.",
                    "error"
                );

                return;
            }


            if (
                saveCompetitionSupportButton
            ) {

                saveCompetitionSupportButton.disabled =
                    true;
            }


            showCompetitionSupportMessage(
                "Saving competition support record..."
            );


            try {

                const amountValue =
                    competitionSupportAmount &&
                    competitionSupportAmount.value.trim()
                        ? Number(
                            competitionSupportAmount.value
                        )
                        : null;


                if (
                    amountValue !== null &&
                    (
                        !Number.isFinite(
                            amountValue
                        ) ||
                        amountValue < 0
                    )
                ) {

                    throw new Error(
                        "Please enter a valid support amount."
                    );
                }


                const {
                    error
                } =
                    await supabaseClient
                        .from(
                            "competition_support"
                        )
                        .insert({

                            competition_id:
                                Number(
                                    competitionId
                                ),

                            supporter_id:
                                Number(
                                    supporterId
                                ),

                            support_type:
                                competitionSupportType
                                    ? competitionSupportType.value
                                    : "External Sponsor",

                            title:
                                competitionSupportTitle
                                    ? competitionSupportTitle.value.trim() ||
                                      null
                                    : null,

                            description:
                                competitionSupportDescription
                                    ? competitionSupportDescription.value.trim() ||
                                      null
                                    : null,

                            amount:
                                amountValue,

                            is_amount_public:
                                competitionSupportAmountPublic
                                    ? competitionSupportAmountPublic.value ===
                                      "true"
                                    : false,

                            featured:
                                competitionSupportFeatured
                                    ? competitionSupportFeatured.value ===
                                      "true"
                                    : false,

                            display_order:
                                competitionSupportDisplayOrder
                                    ? Number(
                                        competitionSupportDisplayOrder.value
                                    ) || 0
                                    : 0,

                            status:
                                competitionSupportStatus
                                    ? competitionSupportStatus.value
                                    : "Active",

                            updated_at:
                                new Date().toISOString()
                        });


                if (error) {
                    throw error;
                }


                showCompetitionSupportMessage(
                    "✅ Supporter successfully linked to the competition.",
                    "success"
                );


                competitionSupportForm.reset();


                if (
                    competitionSupportDisplayOrder
                ) {

                    competitionSupportDisplayOrder.value =
                        "0";
                }


                if (
                    competitionSupportStatus
                ) {

                    competitionSupportStatus.value =
                        "Active";
                }


                if (
                    competitionSupportAmountPublic
                ) {

                    competitionSupportAmountPublic.value =
                        "false";
                }


                if (
                    competitionSupportFeatured
                ) {

                    competitionSupportFeatured.value =
                        "false";
                }


                await loadCompetitionSupportRecords();


            } catch (error) {

                console.error(
                    "SAVE COMPETITION SUPPORT ERROR:",
                    error
                );

                showCompetitionSupportMessage(
                    "❌ Unable to save competition support: " +
                    (
                        error.message ||
                        "Unknown error"
                    ),
                    "error"
                );

            } finally {

                if (
                    saveCompetitionSupportButton
                ) {

                    saveCompetitionSupportButton.disabled =
                        false;
                }
            }
        }
    );
}


// ========================================
// LOAD COMPETITION SUPPORT RECORDS
// ========================================

async function loadCompetitionSupportRecords() {

    if (
        !competitionSupportList
    ) {
        return;
    }

    competitionSupportList.innerHTML =
        `
            <div class="empty-message">
                Loading competition support records...
            </div>
        `;

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "competition_support"
                )
                .select(
                    `
                        id,
                        competition_id,
                        supporter_id,
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
                            photo_url,
                            logo_url
                        ),

                        competition:competitions (
                            id,
                            name,
                            competition_type,
                            season
                        )
                    `
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

        if (error) {
            throw error;
        }

        if (
            !data ||
            data.length === 0
        ) {

            competitionSupportList.innerHTML =
                `
                    <div class="empty-message">
                        No competition support records have been created yet.
                    </div>
                `;

            return;
        }

        let html = "";

        data.forEach(
            function (record) {

                const supporter =
                    record.supporter ||
                    {};

                const competition =
                    record.competition ||
                    {};

                const imageUrl =
                    supporter.photo_url ||
                    supporter.logo_url;

                const image =
                    imageUrl
                        ? `
                            <img
                                src="${escapeHtml(
                                    imageUrl
                                )}"
                                alt="${escapeHtml(
                                    supporter.name ||
                                    "Supporter"
                                )}"
                                style="
                                    width:70px;
                                    height:70px;
                                    object-fit:cover;
                                    border-radius:10px;
                                    border:1px solid #ddd;
                                "
                            >
                          `
                        : `
                            <div
                                style="
                                    width:70px;
                                    height:70px;
                                    border-radius:10px;
                                    background:#eee;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    font-size:26px;
                                "
                            >
                                🤝
                            </div>
                          `;


                html += `
                    <div
                        class="admin-card"
                        style="
                            margin-top:15px;
                            border-left:5px solid ${
                                record.status ===
                                "Active"
                                    ? "#16803c"
                                    : "#777"
                            };
                        "
                    >

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
                                    flex:1;
                                    min-width:260px;
                                "
                            >

                                ${image}

                                <div>

                                    <h3>
                                        🤝
                                        ${escapeHtml(
                                            supporter.name ||
                                            "Unknown Supporter"
                                        )}
                                    </h3>

                                    <p>
                                        <strong>
                                            Competition:
                                        </strong>
                                        ${escapeHtml(
                                            competition.name ||
                                            "Unknown Competition"
                                        )}
                                        ${
                                            competition.season
                                                ? " — " +
                                                  escapeHtml(
                                                      competition.season
                                                  )
                                                : ""
                                        }
                                    </p>

                                    <p>
                                        <strong>
                                            Support Type:
                                        </strong>
                                        ${escapeHtml(
                                            record.support_type ||
                                            "Other"
                                        )}
                                    </p>

                                    <p>
                                        <strong>
                                            Status:
                                        </strong>
                                        ${escapeHtml(
                                            record.status ||
                                            "Active"
                                        )}
                                    </p>

                                </div>

                            </div>


                            <div
                                style="
                                    display:flex;
                                    gap:8px;
                                    flex-wrap:wrap;
                                    align-items:flex-start;
                                "
                            >

                                <button
                                    type="button"
                                    class="admin-btn"
                                    onclick="editCompetitionSupport(${Number(
                                        record.id
                                    )})"
                                >
                                    ✏️ Edit
                                </button>

                                <button
                                    type="button"
                                    class="admin-btn"
                                    style="
                                        background:#b00020;
                                        color:#fff;
                                    "
                                    onclick="deleteCompetitionSupport(${Number(
                                        record.id
                                    )})"
                                >
                                    🗑️ Delete
                                </button>

                            </div>

                        </div>


                        ${
                            record.title
                                ? `
                                    <p
                                        style="
                                            margin-top:12px;
                                        "
                                    >
                                        <strong>
                                            Title:
                                        </strong>
                                        ${escapeHtml(
                                            record.title
                                        )}
                                    </p>
                                  `
                                : ""
                        }


                        ${
                            record.description
                                ? `
                                    <p>
                                        ${escapeHtml(
                                            record.description
                                        )}
                                    </p>
                                  `
                                : ""
                        }


                        <div
                            style="
                                margin-top:10px;
                                display:flex;
                                gap:8px;
                                flex-wrap:wrap;
                            "
                        >

                            <span
                                style="
                                    padding:6px 10px;
                                    border-radius:20px;
                                    background:#f1f1f1;
                                "
                            >
                                🔢 Order:
                                ${Number(
                                    record.display_order || 0
                                )}
                            </span>

                            <span
                                style="
                                    padding:6px 10px;
                                    border-radius:20px;
                                    background:${
                                        record.featured
                                            ? "#fff3cd"
                                            : "#f1f1f1"
                                    };
                                "
                            >
                                ${
                                    record.featured
                                        ? "⭐ Featured"
                                        : "Not Featured"
                                }
                            </span>

                            ${
                                record.amount !==
                                    null &&
                                record.amount !==
                                    undefined
                                    ? `
                                        <span
                                            style="
                                                padding:6px 10px;
                                                border-radius:20px;
                                                background:#f1f1f1;
                                            "
                                        >
                                            💰 Amount:
                                            ${
                                                record.is_amount_public
                                                    ? "KSh " +
                                                      Number(
                                                          record.amount
                                                      ).toLocaleString()
                                                    : "Private"
                                            }
                                        </span>
                                      `
                                    : ""
                            }

                        </div>

                    </div>
                `;
            }
        );

        competitionSupportList.innerHTML =
            html;

    } catch (error) {

        console.error(
            "LOAD COMPETITION SUPPORT ERROR:",
            error
        );

        competitionSupportList.innerHTML =
            `
                <div class="empty-message">
                    ❌ Unable to load competition support records:
                    ${escapeHtml(
                        error.message ||
                        "Unknown error"
                    )}
                </div>
            `;
    }
}


// ========================================
// EDIT COMPETITION SUPPORT
// ========================================

window.editCompetitionSupport =
    async function (recordId) {

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from(
                        "competition_support"
                    )
                    .select("*")
                    .eq(
                        "id",
                        recordId
                    )
                    .single();

            if (error) {
                throw error;
            }

            if (!data) {
                throw new Error(
                    "Support record could not be found."
                );
            }


            if (
                competitionSupporterSelect
            ) {

                competitionSupporterSelect.value =
                    String(
                        data.supporter_id
                    );
            }


            if (
                competitionSupportCompetitionSelect
            ) {

                competitionSupportCompetitionSelect.value =
                    String(
                        data.competition_id
                    );
            }


            if (
                competitionSupportType
            ) {

                competitionSupportType.value =
                    data.support_type ||
                    "External Sponsor";
            }


            if (
                competitionSupportTitle
            ) {

                competitionSupportTitle.value =
                    data.title ||
                    "";
            }


            if (
                competitionSupportAmount
            ) {

                competitionSupportAmount.value =
                    data.amount ??
                    "";
            }


            if (
                competitionSupportAmountPublic
            ) {

                competitionSupportAmountPublic.value =
                    data.is_amount_public
                        ? "true"
                        : "false";
            }


            if (
                competitionSupportFeatured
            ) {

                competitionSupportFeatured.value =
                    data.featured
                        ? "true"
                        : "false";
            }


            if (
                competitionSupportDisplayOrder
            ) {

                competitionSupportDisplayOrder.value =
                    data.display_order ??
                    0;
            }


            if (
                competitionSupportStatus
            ) {

                competitionSupportStatus.value =
                    data.status ||
                    "Active";
            }


            if (
                competitionSupportDescription
            ) {

                competitionSupportDescription.value =
                    data.description ||
                    "";
            }


            // ----------------------------------------
            // Change submit button to UPDATE
            // ----------------------------------------

            if (
                saveCompetitionSupportButton
            ) {

                saveCompetitionSupportButton.textContent =
                    "💾 UPDATE SUPPORT RECORD";

                saveCompetitionSupportButton.dataset.editId =
                    String(recordId);
            }


            showCompetitionSupportMessage(
                "✏️ Support record loaded. Make your changes and save."
            );


            const supportersSection =
                document.getElementById(
                    "supporters"
                );

            if (supportersSection) {

                supportersSection.scrollIntoView({
                    behavior:"smooth",
                    block:"start"
                });
            }

        } catch (error) {

            console.error(
                "EDIT COMPETITION SUPPORT ERROR:",
                error
            );

            alert(
                "Unable to load support record: " +
                (
                    error.message ||
                    "Unknown error"
                )
            );
        }
    };


// ========================================
// REPLACE SUBMIT HANDLER FOR EDIT SUPPORT
// ========================================

if (
    competitionSupportForm
) {

    competitionSupportForm.addEventListener(
        "submit",
        async function () {

            const editId =
                saveCompetitionSupportButton &&
                saveCompetitionSupportButton.dataset
                    ? saveCompetitionSupportButton
                        .dataset
                        .editId
                    : null;

            if (!editId) {
                return;
            }

            event.preventDefault();

        }
    );
}


// ========================================
// DELETE COMPETITION SUPPORT
// ========================================

window.deleteCompetitionSupport =
    async function (recordId) {

        const confirmed =
            confirm(
                "Are you sure you want to delete this competition support record?"
            );

        if (!confirmed) {
            return;
        }

        try {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "competition_support"
                    )
                    .delete()
                    .eq(
                        "id",
                        recordId
                    );

            if (error) {
                throw error;
            }

            await loadCompetitionSupportRecords();

        } catch (error) {

            console.error(
                "DELETE COMPETITION SUPPORT ERROR:",
                error
            );

            alert(
                "Unable to delete support record: " +
                (
                    error.message ||
                    "Unknown error"
                )
            );
        }
    };


// ========================================
// INITIAL SUPPORTER DATA LOAD
// ========================================

await loadSupporterCompetitions();

await loadSupporterSelect();

await loadSupporters();

await loadCompetitionSupportRecords();
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
