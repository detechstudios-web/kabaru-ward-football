// ========================================
// KABARU WARD FOOTBALL
// ADMIN DASHBOARD
// ========================================

document.addEventListener("DOMContentLoaded", async function () {

    const pendingTeams = document.getElementById("pendingTeams");
    const statusMessage = document.getElementById("statusMessage");
    const logoutBtn = document.getElementById("logoutBtn");

    const fixtureForm = document.getElementById("fixtureForm");
    const competitionSelect = document.getElementById("competitionSelect");
    const homeTeamSelect = document.getElementById("homeTeamSelect");
    const awayTeamSelect = document.getElementById("awayTeamSelect");
    const venueSelect = document.getElementById("venueSelect");
    const fixturesList = document.getElementById("fixturesList");
    const fixtureFormMessage = document.getElementById("fixtureFormMessage");

    const matchday = document.getElementById("matchday");
    const matchDate = document.getElementById("matchDate");
    const kickOff = document.getElementById("kickOff");
    const fixtureStatus = document.getElementById("fixtureStatus");


    // ========================================
    // MESSAGE
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

        logoutBtn.addEventListener("click", async function () {

            try {

                logoutBtn.disabled = true;
                logoutBtn.textContent = "Logging out...";


                const { error } =
                    await supabaseClient.auth.signOut();


                if (error) {
                    throw error;
                }


                window.location.href =
                    "admin-login.html";


            } catch (error) {

                console.error("Logout error:", error);

                logoutBtn.disabled = false;
                logoutBtn.textContent = "Logout";

                showMessage(
                    "Logout failed: " +
                    (error.message || "Unknown error"),
                    "error"
                );
            }

        });
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
            } = await supabaseClient.auth.getUser();


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
            } = await supabaseClient
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
                (error.message || "Unknown error"),
                "error"
            );


            return false;
        }
    }


    // ========================================
    // LOAD COMPETITIONS
    // ========================================

    async function loadCompetitions() {

        if (!competitionSelect) return;


        competitionSelect.innerHTML =
            "<option value=''>Loading competitions...</option>";


        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("competitions")
                .select(
                    "id, name, competition_type, season, status"
                )
                .order("name", {
                    ascending: true
                });


            if (error) {
                throw error;
            }


            competitionSelect.innerHTML =
                "<option value=''>Select competition</option>";


            if (!data || data.length === 0) {

                competitionSelect.innerHTML =
                    "<option value=''>No competitions found</option>";

                return;
            }


            data.forEach(function (competition) {

                const option =
                    document.createElement("option");


                option.value =
                    competition.id;


                option.textContent =
                    competition.name +
                    (
                        competition.season
                            ? " - " + competition.season
                            : ""
                    );


                competitionSelect.appendChild(
                    option
                );

            });


        } catch (error) {

            console.error(
                "Competition loading error:",
                error
            );


            competitionSelect.innerHTML =
                "<option value=''>Unable to load competitions</option>";
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


        homeTeamSelect.innerHTML =
            "<option value=''>Loading teams...</option>";

        awayTeamSelect.innerHTML =
            "<option value=''>Loading teams...</option>";


        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("teams")
                .select(
                    "id, name, short_name"
                )
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


            homeTeamSelect.innerHTML =
                "<option value=''>Select home team</option>";

            awayTeamSelect.innerHTML =
                "<option value=''>Select away team</option>";


            if (!data || data.length === 0) {

                homeTeamSelect.innerHTML =
                    "<option value=''>No approved teams</option>";

                awayTeamSelect.innerHTML =
                    "<option value=''>No approved teams</option>";

                return;
            }


            data.forEach(function (team) {

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
                    document.createElement("option");

                homeOption.value =
                    team.id;

                homeOption.textContent =
                    name;

                homeTeamSelect.appendChild(
                    homeOption
                );


                const awayOption =
                    document.createElement("option");

                awayOption.value =
                    team.id;

                awayOption.textContent =
                    name;

                awayTeamSelect.appendChild(
                    awayOption
                );

            });


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

        if (!venueSelect) return;


        venueSelect.innerHTML =
            "<option value=''>Loading venues...</option>";


        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("venues")
                .select(
                    "id, name, location"
                )
                .order("name", {
                    ascending: true
                });


            if (error) {
                throw error;
            }


            venueSelect.innerHTML =
                "<option value=''>Select venue</option>";


            if (!data || data.length === 0) {

                venueSelect.innerHTML =
                    "<option value=''>No venues found</option>";

                return;
            }


            data.forEach(function (venue) {

                const option =
                    document.createElement("option");


                option.value =
                    venue.name;


                option.textContent =
                    venue.name +
                    (
                        venue.location
                            ? " - " + venue.location
                            : ""
                    );


                venueSelect.appendChild(
                    option
                );

            });


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
                    } = await supabaseClient
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

        if (!fixturesList) return;


        fixturesList.innerHTML =
            "<div class='empty-message'>Loading fixtures...</div>";


        try {

            const {
                data: fixtures,
                error
            } = await supabaseClient
                .from("fixtures")
                .select(
                    "id, competition_id, home_team_id, away_team_id, match_date, kick_off, venue, matchday, status"
                )
                .order("match_date", {
                    ascending: true
                })
                .order("kick_off", {
                    ascending: true
                });


            if (error) {
                throw error;
            }


            if (!fixtures || fixtures.length === 0) {

                fixturesList.innerHTML =
                    "<div class='empty-message'>No fixtures have been created yet.</div>";

                return;
            }


            const teamIds = [
                ...new Set(
                    fixtures.flatMap(function (fixture) {

                        return [
                            fixture.home_team_id,
                            fixture.away_team_id
                        ];

                    })
                )
            ];


            const competitionIds = [
                ...new Set(
                    fixtures.map(function (fixture) {

                        return fixture.competition_id;

                    })
                )
            ];


            const {
                data: teams,
                error: teamsError
            } = await supabaseClient
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
            } = await supabaseClient
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


            fixturesList.innerHTML = "";


            fixtures.forEach(function (fixture) {

                const home =
                    (teams || []).find(function (team) {

                        return Number(team.id) ===
                            Number(
                                fixture.home_team_id
                            );

                    });


                const away =
                    (teams || []).find(function (team) {

                        return Number(team.id) ===
                            Number(
                                fixture.away_team_id
                            );

                    });


                const competition =
                    (competitions || []).find(
                        function (item) {

                            return Number(item.id) ===
                                Number(
                                    fixture.competition_id
                                );

                        }
                    );


                const card =
                    document.createElement("div");


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
                        class="admin-btn delete-fixture-btn"
                        data-id="${fixture.id}">
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


                deleteButton.addEventListener(
                    "click",
                    function () {

                        deleteFixture(
                            fixture.id
                        );

                    }
                );

            });


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
            } = await supabaseClient
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
    // LOAD PENDING TEAMS
    // ========================================

    async function loadPendingTeams() {

        if (!pendingTeams) return;


        pendingTeams.innerHTML =
            "<div class='empty-message'>Loading registrations...</div>";


        try {

            const {
                data: teams,
                error
            } = await supabaseClient
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


            if (!teams || teams.length === 0) {

                pendingTeams.innerHTML =
                    "<div class='empty-message'>🎉 No pending team registrations.</div>";

                return;
            }


            pendingTeams.innerHTML = "";


            for (
                const team of teams
            ) {

                const {
                    data: players,
                    error: playersError
                } = await supabaseClient
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
                    document.createElement("div");


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
                            team.short_name || "-"
                        )}
                    </p>

                    <div class="team-details">

                        <div class="detail">
                            <strong>Location</strong><br>
                            ${escapeHtml(
                                team.location || "-"
                            )}
                        </div>

                        <div class="detail">
                            <strong>Coach</strong><br>
                            ${escapeHtml(
                                team.coach_name || "-"
                            )}
                        </div>

                        <div class="detail">
                            <strong>Captain</strong><br>
                            ${escapeHtml(
                                team.captain_name || "-"
                            )}
                        </div>

                        <div class="detail">
                            <strong>Vice Captain</strong><br>
                            ${escapeHtml(
                                team.vice_captain_name || "-"
                            )}
                        </div>

                        <div class="detail">
                            <strong>Discipline Master</strong><br>
                            ${escapeHtml(
                                team.discipline_master_name || "-"
                            )}
                        </div>

                        <div class="detail">
                            <strong>Phone</strong><br>
                            ${escapeHtml(
                                team.phone || "-"
                            )}
                        </div>

                        <div class="detail">
                            <strong>Email</strong><br>
                            ${escapeHtml(
                                team.email || "-"
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
                            class="admin-btn approve-btn"
                            data-id="${team.id}">
                            ✅ Approve Team
                        </button>

                        <button
                            class="admin-btn reject-btn"
                            data-id="${team.id}">
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
            } = await supabaseClient
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
            } = await supabaseClient
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
            } = await supabaseClient
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
            } = await supabaseClient
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

    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
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


    await loadCompetitions();

    await loadApprovedTeams();

    await loadVenues();

    await loadFixtures();

    await loadPendingTeams();


    console.log(
        "Kabaru Ward Football Admin Dashboard loaded."
    );

});
