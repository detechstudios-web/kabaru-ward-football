// ========================================
// KABARU WARD FOOTBALL
// ADMIN DASHBOARD
// ========================================

document.addEventListener("DOMContentLoaded", async () => {

    const pendingTeams =
        document.getElementById("pendingTeams");

    const statusMessage =
        document.getElementById("statusMessage");

    const logoutBtn =
        document.getElementById("logoutBtn");


    // ========================================
    // SHOW MESSAGE
    // ========================================

    function showMessage(text, type = "") {

        statusMessage.textContent = text;

        statusMessage.style.display = "block";

        statusMessage.className =
            "status-message " + type;
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


            // No logged-in user

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


            // Check admin_users table

            const {
                data: admin,
                error: adminError
            } = await supabaseClient
                .from("admin_users")
                .select("user_id, role")
                .eq("user_id", user.id)
                .eq("role", "admin")
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


                // Approve button

                card
                    .querySelector(".approve-btn")
                    .addEventListener(
                        "click",
                        () => approveTeam(team.id)
                    );


                // Reject button

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


            loadPendingTeams();


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


            loadPendingTeams();


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

        await loadPendingTeams();

    }

});
