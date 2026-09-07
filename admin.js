// ========================================
// KABARU WARD FOOTBALL
// ADMIN DASHBOARD
// ========================================

document.addEventListener("DOMContentLoaded", async () => {

```
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


// ========================================
// SHOW ADMIN MESSAGE
// ========================================

function showMessage(text, type = "") {

    statusMessage.textContent = text;

    statusMessage.style.display = "block";

    statusMessage.className =
        "status-message " + type;
}


// ========================================
// SHOW FIXTURE FORM MESSAGE
// ========================================

function showFixtureMessage(text, type = "") {

    fixtureFormMessage.textContent = text;

    fixtureFormMessage.style.display = "block";

    fixtureFormMessage.className =
        "fixture-form-message " + type;
}


// ========================================
// CHECK ADMIN
// ========================================

async function checkAdmin() {

    try {

        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();


        if (userError) {
            throw userError;
        }


        if (!user) {

            showMessage(
                "You must be logged in as an administrator.",
                "error"
            );

            pendingTeams.innerHTML = `
                <div class="empty-message">
                    Please log in to access the admin dashboard.
                </div>
            `;

            return false;
        }


        const {
            data: admin,
            error: adminError
        } = await supabaseClient
            .from("admin_users")
            .select("user_id, role")
            .eq("user_id", user.id)
            .in("role", ["admin", "super_admin"])
            .maybeSingle();


        if (adminError) {
            throw adminError;
        }


        if (!admin) {

            showMessage(
                "Access denied. This account is not an administrator.",
                "error"
            );

            pendingTeams.innerHTML = `
                <div class="empty-message">
                    You do not have permission to access this dashboard.
                </div>
            `;

            return false;
        }


        showMessage(
            `Administrator access granted: ${user.email}`,
            "success"
        );

        return true;

    } catch (error) {

        console.error(
            "ADMIN CHECK ERROR:",
            error
        );

        showMessage(
            error.message ||
            "Unable to verify administrator access.",
            "error"
        );

        return false;
    }
}


// ========================================
// LOAD COMPETITIONS
// ========================================

async function loadCompetitions() {

    try {

        const {
            data: competitions,
            error
        } = await supabaseClient
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


        (competitions || []).forEach(competition => {

            const option =
                document.createElement("option");

            option.value = competition.id;

            option.textContent =
                `${competition.name}` +
                `${competition.season ? " - " + competition.season : ""}`;

            competitionSelect.appendChild(option);

        });


        if (!competitions || competitions.length === 0) {

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

    try {

        const {
            data: teams,
            error
        } = await supabaseClient
            .from("teams")
            .select(`
                id,
                name,
                short_name
            `)
            .eq("registration_status", "Approved")
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


        (teams || []).forEach(team => {

            const displayName =
                team.short_name
                    ? `${team.name} (${team.short_name})`
                    : team.name;


            const homeOption =
                document.createElement("option");

            homeOption.value = team.id;

            homeOption.textContent =
                displayName;

            homeTeamSelect.appendChild(
                homeOption
            );


            const awayOption =
                document.createElement("option");

            awayOption.value = team.id;

            awayOption.textContent =
                displayName;

            awayTeamSelect.appendChild(
                awayOption
            );

        });


        if (!teams || teams.length < 2) {

            homeTeamSelect.innerHTML = `
                <option value="">
                    Need at least 2 approved teams
                </option>
            `;

            awayTeamSelect.innerHTML = `
                <option value="">
                    Need at least 2 approved teams
                </option>
            `;

        }

    } catch (error) {

        console.error(
            "LOAD APPROVED TEAMS ERROR:",
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

    try {

        const {
            data: venues,
            error
        } = await supabaseClient
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


        (venues || []).forEach(venue => {

            const option =
                document.createElement("option");

            option.value = venue.name;

            option.textContent =
                venue.location
                    ? `${venue.name} - ${venue.location}`
                    : venue.name;

            venueSelect.appendChild(option);

        });


        if (!venues || venues.length === 0) {

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

fixtureForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const competitionId =
            competitionSelect.value;

        const homeTeamId =
            homeTeamSelect.value;

        const awayTeamId =
            awayTeamSelect.value;

        const matchDate =
            document.getElementById(
                "matchDate"
            ).value;

        const kickOff =
            document.getElementById(
                "kickOff"
            ).value;

        const venue =
            venueSelect.value;

        const matchday =
            document.getElementById(
                "matchday"
            ).value.trim();

        const fixtureStatus =
            document.getElementById(
                "fixtureStatus"
            ).value;


        // ========================================
        // VALIDATION
        // ========================================

        if (
            !competitionId ||
            !homeTeamId ||
            !awayTeamId ||
            !matchDate ||
            !kickOff ||
            !venue
        ) {

            showFixtureMessage(
                "Please complete all required fixture fields.",
                "error"
            );

            return;
        }


        if (homeTeamId === awayTeamId) {

            showFixtureMessage(
                "Home team and away team cannot be the same.",
                "error"
            );

            return;
        }


        try {

            showFixtureMessage(
                "Creating fixture...",
                "success"
            );


            const {
                data,
                error
            } = await supabaseClient
                .from("fixtures")
                .insert({
                    competition_id:
                        Number(competitionId),

                    home_team_id:
                        Number(homeTeamId),

                    away_team_id:
                        Number(awayTeamId),

                    match_date:
                        matchDate,

                    kick_off:
                        kickOff,

                    venue:
                        venue,

                    matchday:
                        matchday || null,

                    status:
                        fixtureStatus
                })
                .select()
                .single();


            if (error) {
                throw error;
            }


            console.log(
                "FIXTURE CREATED:",
                data
            );


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
                (error.message ||
                "Something went wrong."),
                "error"
            );

        }

    }
);


// ========================================
// LOAD FIXTURES
// ========================================

async function loadFixtures() {

    fixturesList.innerHTML = `
        <div class="empty-message">
            Loading fixtures...
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
                venue,
                matchday,
                status,
                competitions (
                    name,
                    season
                ),
                home_team:teams!fixtures_home_team_id_fkey (
                    name,
                    short_name
                ),
                away_team:teams!fixtures_away_team_id_fkey (
                    name,
                    short_name
                )
            `)
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

            fixturesList.innerHTML = `
                <div class="empty-message">
                    <h3>📅 No Fixtures Yet</h3>
                    <p>
                        Create your first fixture above.
                    </p>
                </div>
            `;

            return;
        }


        let tableHTML = `

            <table class="fixtures-table">

                <thead>

                    <tr>
                        <th>Date</th>
                        <th>Match</th>
                        <th>Competition</th>
                        <th>Venue</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>

                </thead>

                <tbody>
        `;


        fixtures.forEach(fixture => {

            const homeTeam =
                fixture.home_team?.name ||
                "Home Team";

            const awayTeam =
                fixture.away_team?.name ||
                "Away Team";

            const competition =
                fixture.competitions?.name ||
                "Competition";

            const season =
                fixture.competitions?.season
                ? ` ${fixture.competitions.season}`
                : "";

            const formattedDate =
                formatDate(
                    fixture.match_date
                );

            const formattedTime =
                formatTime(
                    fixture.kick_off
                );


            tableHTML += `

                <tr>

                    <td>
                        ${escapeHtml(
                            formattedDate
                        )}

                        <br>

                        <small>
                            ${escapeHtml(
                                formattedTime
                            )}
                        </small>
                    </td>


                    <td>

                        <strong>
                            ⚽ ${escapeHtml(homeTeam)}
                        </strong>

                        <br>

                        <strong>
                            🆚 ${escapeHtml(awayTeam)}
                        </strong>

                        ${
                            fixture.matchday
                            ? `
                                <br>
                                <small>
                                    ${escapeHtml(
                                        fixture.matchday
                                    )}
                                </small>
                            `
                            : ""
                        }

                    </td>


                    <td>
                        ${escapeHtml(
                            competition
                        )}

                        ${escapeHtml(
                            season
                        )}
                    </td>


                    <td>
                        📍 ${escapeHtml(
                            fixture.venue ||
                            "-"
                        )}
                    </td>


                    <td>
                        ${escapeHtml(
                            fixture.status
                        )}
                    </td>


                    <td>

                        <button
                            class="admin-btn delete-fixture-btn"
                            data-fixture-id="${fixture.id}">

                            🗑️ Delete

                        </button>

                    </td>

                </tr>

            `;

        });


        tableHTML += `
                </tbody>
            </table>
        `;


        fixturesList.innerHTML =
            tableHTML;


        fixturesList
            .querySelectorAll(
                ".delete-fixture-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => deleteFixture(
                        button.dataset.fixtureId
                    )
                );

            });


    } catch (error) {

        console.error(
            "LOAD FIXTURES ERROR:",
            error
        );

        fixturesList.innerHTML = `

            <div class="empty-message">

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

async function deleteFixture(fixtureId) {

    const confirmed =
        confirm(
            "Delete this fixture?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("fixtures")
            .delete()
            .eq("id", fixtureId);


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
            error.message
        );

    }
}


// ========================================
// LOAD PENDING TEAMS
// ========================================

async function loadPendingTeams() {

    pendingTeams.innerHTML = `
        <div class="empty-message">
            Loading pending registrations...
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
                location,
                coach_name,
                captain_name,
                vice_captain_name,
                discipline_master_name,
                phone,
                email,
                registration_status,
                created_at,
                players (
                    id,
                    full_name,
                    jersey_number,
                    position,
                    registration_status
                )
            `)
            .eq("registration_status", "Pending")
            .order("created_at", {
                ascending: false
            });


        if (error) {
            throw error;
        }


        if (!teams || teams.length === 0) {

            pendingTeams.innerHTML = `
                <div class="admin-card empty-message">
                    <h3>🎉 No Pending Registrations</h3>
                    <p>
                        There are currently no teams waiting
                        for approval.
                    </p>
                </div>
            `;

            return;
        }


        pendingTeams.innerHTML = "";


        teams.forEach(team => {

            const card =
                document.createElement("div");

            card.className =
                "admin-card registration-card";


            const players =
                team.players || [];


            let playersHTML = "";


            if (players.length > 0) {

                playersHTML = `

                    <table class="players-table">

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Player</th>
                                <th>Jersey</th>
                                <th>Position</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>

                            ${players.map((player, index) => `

                                <tr>

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

                            `).join("")}

                        </tbody>

                    </table>

                `;

            } else {

                playersHTML = `
                    <p>No players found.</p>
                `;
            }


            card.innerHTML = `

                <h2>
                    ⚽ ${escapeHtml(team.name)}
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
                            team.short_name || "-"
                        )}
                    </div>

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
                    👥 Players (${players.length}/20)
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


            pendingTeams.appendChild(card);


            card
                .querySelector(".approve-btn")
                .addEventListener(
                    "click",
                    () => approveTeam(team.id)
                );


            card
                .querySelector(".reject-btn")
                .addEventListener(
                    "click",
                    () => rejectTeam(team.id)
                );

        });


    } catch (error) {

        console.error(
            "LOAD TEAMS ERROR:",
            error
        );

        pendingTeams.innerHTML = `

            <div class="admin-card">

                <h3>❌ Unable to Load Registrations</h3>

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

async function approveTeam(teamId) {

    const confirmed =
        confirm(
            "Approve this team and all its players?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error: teamError
        } = await supabaseClient
            .from("teams")
            .update({
                registration_status: "Approved"
            })
            .eq("id", teamId);


        if (teamError) {
            throw teamError;
        }


        const {
            error: playersError
        } = await supabaseClient
            .from("players")
            .update({
                registration_status: "Approved"
            })
            .eq("team_id", teamId);


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

async function rejectTeam(teamId) {

    const confirmed =
        confirm(
            "Reject this team registration?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error: teamError
        } = await supabaseClient
            .from("teams")
            .update({
                registration_status: "Rejected"
            })
            .eq("id", teamId);


        if (teamError) {
            throw teamError;
        }


        const {
            error: playersError
        } = await supabaseClient
            .from("players")
            .update({
                registration_status: "Rejected"
            })
            .eq("team_id", teamId);


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
// LOGOUT
// ========================================

logoutBtn.addEventListener(
    "click",
    async () => {

        await supabaseClient.auth.signOut();

        window.location.href =
            "index.html";

    }
);


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date =
        new Date(
            dateString + "T00:00:00"
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

function formatTime(timeString) {

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

    return `${displayHour}:${minute} ${period}`;
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

const isAdmin =
    await checkAdmin();


if (isAdmin) {

    await loadCompetitions();

    await loadApprovedTeams();

    await loadVenues();

    await loadFixtures();

    await loadPendingTeams();

}
```

});
